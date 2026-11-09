"""Append the questline lessons (ids 97+) to dist/curriculum.json.

Run after the core build (build_course.py calls this). Safe to re-run: it removes any
previous questline lessons first. Expected outputs come from executing the reference
solutions, every bug-hunt starter is checked to fail at least one case, and every SQL
problem is run against both datasets.
"""
import contextlib
import copy
import io
import json
import sqlite3
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))
from build_io import write_text_atomic  # noqa: E402
from extras_python import DRILLS, BUGS, INTERVIEW, HARDWARE  # noqa: E402
from extras_more import ESSENTIALS, DRILLS2, BUGS2  # noqa: E402
from extras_test import PROGRAMS, OOP, SAMPLES, STARTER  # noqa: E402
from extras_sql import PROBLEMS, DATA, fixture_sql, SCHEMA_NOTE  # noqa: E402

TRACK = {
    "drill": dict(phase="Practice grind", badge="PRACTICE", objectives=["Solve it without hints in under 15 minutes.", "Run the boundary cases in your head before you run the code.", "Explain your solution in one sentence."],
                  extension="Solve it a second way (for example, with a comprehension or a built-in) and compare which is clearer."),
    "bug": dict(phase="Bug hunt", badge="BUG HUNT", objectives=["Reproduce it: run the checks and find the one that fails.", "Name the bug in your notes before changing code.", "Fix it with the smallest change, then rerun every check."],
                extension="Write one more input that would have caught this bug, and explain why the original author missed it."),
    "sql": dict(phase="SQL", badge="SQL", objectives=["Write the query yourself from the schema.", "Compare your columns, row count, and order with the preview.", "Explain what each clause contributes."],
                extension="Change one requirement (a different filter or sort) and predict the new result before running it."),
    "interview": dict(phase="Interview gauntlet", badge="INTERVIEW", objectives=["Restate the problem and its edge cases before coding.", "Get a correct brute force first, then improve it.", "Say the time and space complexity out loud."],
                      extension="Re-solve it tomorrow from a blank file in under 20 minutes while talking through your reasoning."),
    "program": dict(phase="Test practice", badge="TEST PRACTICE", objectives=["Read the input format twice before you write any code.", "Pass both samples, then think about what the hidden tests might try.", "Check the empty, smallest, and largest inputs."],
                    extension="Rewrite it from a blank file with a 15-minute limit, as you would in a real test."),
    "oop": dict(phase="Object-oriented practice", badge="OOP", objectives=["Say what each class is responsible for before you write it.", "Keep each rule in one place.", "Explain why this design fits better than plain functions."],
                extension="Add one new class or error to your design and see how little of the other code has to change."),
    "hardware": dict(phase="Hardware lab", badge="HARDWARE", objectives=["Translate the spec or formula exactly.", "Check edge readings: zero, maximum, and empty input.", "Imagine it running in a loop on a microcontroller: what could go wrong?"],
                     extension="If you have a Raspberry Pi Pico, run this logic in MicroPython against a real sensor (see the Hardware lab briefing)."),
}

# Cases added after mutation testing: each one catches a realistic bug the first set missed.
HARDEN = {
    "in_bounds": [[0, 5, 5, 5], [4, 0, 5, 5]],
    "parse_age": [["150"], ["151"]],
    "binary_search": [[[1, 2, 3, 4, 5, 6, 7, 8], 6], [[1, 2, 3, 4, 5, 6, 7, 8], 2], [[1, 2, 3, 4, 5, 6, 7, 8], 9]],
    "majority": [[[2, 1, 1]], [[1, 1, 2, 2, 2]]],
    "count_islands": [[["010", "111", "010"]], [["0110", "1100", "0011"]], [["1", "1", "1"]], [["10", "11"]], [["01", "11"]], [["11", "10"]], [["101", "101", "111"]], [["101", "111"]]],
    "moving_average": [[[1, 2, 2], 3]],
    "count_presses": [[[1, 0, 1, 1, 0, 1, 1, 1], 2], [[0, 0, 1, 1, 1, 0, 1, 1, 1], 3], [[1, 0, 0, 1], 1], [[1, 1, 0, 1, 1, 0], 3]],
    "nmea_checksum_ok": [["$A*41*"]],
    "alarm_events": [[[31, 25, 24], 30, 25]],
    "parse_score_line": [["a:1:2"]],
}


def chapter_for(track, index, item):
    if item.get("ch"):
        return item["ch"]
    if track == "drill":
        return "grind-" + str((item["w"] + 1) // 2)
    if track == "bug":
        return "bugs-" + str((item["w"] - 1) // 4 + 1)
    if track == "interview":
        return "int-" + str(index // 8 + 1)
    if track == "sql":
        return "sql-" + str(index // 8 + 1)
    return "hw-1"


def unlock_for(track, item):
    if track == "drill":
        return (item["w"] - 1) * 4 + 1
    if track == "bug":
        return (item["w"] - 1) * 4 + 2
    if track in ("interview", "hardware"):
        return item["w"] * 4
    return None


def clean_output(text):
    """Same rule as the browser runner: trailing whitespace never counts."""
    return "\n".join(line.rstrip() for line in text.replace("\r\n", "\n").rstrip().split("\n"))


def run_program(code, stdin):
    out = io.StringIO()
    saved = sys.stdin
    sys.stdin = io.StringIO(stdin)
    try:
        with contextlib.redirect_stdout(out):
            exec(compile(code, "solution.py", "exec"), {"__name__": "__main__"})
    finally:
        sys.stdin = saved
    return clean_output(out.getvalue())


def program_passes(code, cases):
    try:
        return all(run_program(code, c["stdin"]) == c["expected"] for c in cases)
    except Exception:
        return False


def run_case(sol, name, args):
    ns = {"__name__": "__main__"}
    exec(compile(sol, name, "exec"), ns)
    return ns[name](*copy.deepcopy(args))


def passes_all(code, name, cases, no_mutation):
    try:
        ns = {"__name__": "__main__"}
        exec(compile(code, name, "exec"), ns)
        for c in cases:
            args = copy.deepcopy(c["args"])
            got = ns[name](*args)
            if got != c["expected"] or (isinstance(c["expected"], bool) and type(got) is not bool):
                return False
            if no_mutation and args != c["args"]:
                return False
        return True
    except Exception:
        return False


def sql_rows(fixture, query):
    db = sqlite3.connect(":memory:")
    db.executescript(fixture)
    cur = db.execute(query)
    cols = [d[0] for d in cur.description]
    return cols, [list(r) for r in cur.fetchall()]


def main():
    path = ROOT.parent / "dist" / "curriculum.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    lessons = [l for l in data["lessons"] if l["id"] <= 96]
    core_resources = {l["week"]: l["resources"] for l in lessons if l["session"] == 1}
    next_id = 97
    sessions = {}
    added = []

    def base(track, item, index):
        nonlocal next_id
        chapter = chapter_for(track, index, item)
        sessions[chapter] = sessions.get(chapter, 0) + 1
        meta = TRACK[track]
        lesson = {
            "id": next_id, "title": item["t"], "concept": item.get("concept", ""), "example": item.get("example", ""),
            "task": item["task"], "hints": item["hints"], "extension": meta["extension"],
            "week": item.get("w", 16), "session": sessions[chapter], "phase": meta["phase"], "checkpoint": False,
            "objectives": meta["objectives"], "resources": core_resources.get(item.get("w", 16), ["python"]),
            "prerequisites": [], "referenceOnly": False, "practicePlan": [], "requirements": item.get("requirements", []),
            "packages": item.get("packages", []),
            "track": track, "chapter": chapter, "unlock": unlock_for(track, item), "badge": meta["badge"],
        }
        next_id += 1
        return lesson

    def add_python(track, items):
        for index, item in enumerate(items):
            l = base(track, item, index)
            name = item["name"]
            l.update(name=name, args=item["args"], solution=item["sol"])
            l["cases"] = [{"args": a, "expected": run_case(item["sol"], name, a)} for a in item["cases"] + HARDEN.get(name, [])]
            l["noMutation"] = any(p in item["task"].lower() for p in ["do not mutate", "do not modify"])
            l["starter"] = item.get("starter") or f"def {name}({item['args']}):\n    # Write your solution here\n    pass\n"
            if item.get("teach"):
                l["teach"] = item["teach"]
                for section in item["teach"]:
                    with contextlib.redirect_stdout(io.StringIO()):
                        exec(compile(section["code"], section["title"], "exec"), {"__name__": "__main__"})
            assert passes_all(item["sol"], name, l["cases"], l["noMutation"]), f"{name}: reference fails its own cases"
            if track == "bug":
                assert not passes_all(item["starter"], name, l["cases"], l["noMutation"]), f"{name}: buggy starter passes every case"
            assert json.loads(json.dumps(l["cases"])) == l["cases"], f"{name}: expected values change in JSON (e.g. number dict keys)"
            added.append(l)

    for track, items in (("drill", DRILLS), ("bug", BUGS), ("interview", INTERVIEW), ("hardware", HARDWARE)):
        add_python(track, items)

    fixtures = [fixture_sql(d) for d in DATA]
    for index, item in enumerate(PROBLEMS):
        l = base("sql", item, index)
        cases = []
        for v, fx in enumerate(fixtures):
            cols, rows = sql_rows(fx, item["sol"])
            cases.append({"args": [v], "expected": rows})
        assert json.loads(json.dumps(cases)) == cases, f"{item['t']}: rows change in JSON"
        assert cases[0]["expected"] != cases[1]["expected"], f"{item['t']}: both datasets give the same answer"
        cols, rows = sql_rows(fixtures[0], item["sol"])
        preview = " | ".join(cols) + "\n" + "\n".join(" | ".join(str(v) for v in r) for r in rows[:3]) + ("\n…" if len(rows) > 3 else "")
        l.update(name="run_query", args="variant", solution=item["sol"], cases=cases, noMutation=False,
                 starter="-- " + SCHEMA_NOTE + "\n-- Write one SELECT statement below.\n\nSELECT ",
                 packages=["sqlite3"], sql={"fixtures": fixtures}, file="query.sql",
                 sqlPreview=f"Expected with the practice data ({len(rows)} row{'s' if len(rows) != 1 else ''}):\n{preview}",
                 concept=item["concept"] + " " + SCHEMA_NOTE)
        added.append(l)

    # Appended after the SQL quests so that every older lesson keeps its id.
    for track, items in (("drill", ESSENTIALS), ("drill", DRILLS2), ("bug", BUGS2)):
        add_python(track, items)

    for index, item in enumerate(PROGRAMS):
        l = base("program", {**item, "ch": "test-1", "w": 12}, index)
        cases = [{"args": [], "stdin": s, "expected": run_program(item["sol"], s), "sample": i < SAMPLES} for i, s in enumerate(item["cases"])]
        hidden = cases[SAMPLES:]
        assert len(hidden) >= 3, f"{item['t']}: needs at least 3 hidden tests"
        assert len({c["expected"] for c in cases}) > 1, f"{item['t']}: every test gives the same answer"
        assert not program_passes(STARTER, cases), f"{item['t']}: the starter passes"
        assert not program_passes(item["broken"], cases), f"{item['t']}: the broken program passes"
        preview = "\n\n".join(f"Sample {n + 1} input:\n{c['stdin'].rstrip() or '(an empty line)'}\n\nSample {n + 1} output:\n{c['expected']}" for n, c in enumerate(cases[:SAMPLES]))
        l.update(name="solution", args="", solution=item["sol"], cases=cases, noMutation=False, starter=STARTER, program=True,
                 broken=item["broken"], tier=item["tier"], noWeek=True, file="solution.py", samplePreview=preview)
        added.append(l)
    add_python("oop", OOP)

    names = [l["name"] for l in added if l["track"] not in ("sql", "program")]
    repeats = sorted({n for n in names if names.count(n) > 1 and n != "binary_search"})
    assert not repeats, f"function names must be unique (HARDEN keys on them): {repeats}"
    chapters = {}
    for l in added:
        chapters[l["chapter"]] = chapters.get(l["chapter"], 0) + 1
    too_long = {k: v for k, v in chapters.items() if v > 10}
    assert not too_long, f"chapter maps fit 10 quests at most: {too_long}"

    data["lessons"] = lessons + added
    write_text_atomic(path, json.dumps(data, indent=2))
    counts = {}
    for l in added:
        counts[l["track"]] = counts.get(l["track"], 0) + 1
    print(f"Added {len(added)} questline lessons (ids 97–{next_id - 1}):", counts)


if __name__ == "__main__":
    main()
