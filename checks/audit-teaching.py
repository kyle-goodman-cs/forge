"""Inspect the shipped teaching, not reference solutions or learner files.

This checks example structure and builds a first-use inventory for human review.
It cannot judge whether prose teaches a concept well; the chapter audit does that.
Run: py checks/audit-teaching.py [--write-inventory]
"""
import ast
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent.parent
BOOK = json.loads((ROOT / "dist/handbook.json").read_text(encoding="utf-8"))
CURRICULUM = json.loads((ROOT / "dist/curriculum.json").read_text(encoding="utf-8"))


def features(tree):
    found = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.Call):
            if isinstance(node.func, ast.Name):
                found.add(node.func.id + "()")
            elif isinstance(node.func, ast.Attribute):
                found.add("." + node.func.attr + "()")
        for kind, label in ((ast.Lambda, "lambda"), (ast.ListComp, "list comprehension"),
                            (ast.DictComp, "dictionary comprehension"),
                            (ast.GeneratorExp, "generator expression"),
                            (ast.Yield, "yield"), (ast.With, "with"),
                            (ast.ClassDef, "class"), (ast.Try, "try/except"),
                            (ast.JoinedStr, "f-string"), (ast.Slice, "slice"),
                            (ast.AnnAssign, "type annotation")):
            if isinstance(node, kind):
                found.add(label)
    return found


seen, lines = set(), ["# Teaching syntax inventory", "",
    "Generated from the shipped chapter examples by `py checks/audit-teaching.py --write-inventory`.",
    "Lists calls and syntax at their first executable teaching appearance; user-defined helper calls are included.",
    "This is a review aid, not proof of comprehension or a complete dependency checker. Local terminal/framework blocks are reviewed separately in the chapter audit.", ""]
total = executable = local = 0
for unit in BOOK["units"]:
    week, sections = unit["week"], unit["plain"]
    assert sections, f"Chapter {week} has no teaching"
    names = {lesson["name"] for lesson in CURRICULUM["lessons"] if not lesson.get("track") and lesson["week"] == week}
    lines.extend([f"## Chapter {week}: {unit['title']}", ""])
    for number, section in enumerate(sections, 1):
        total += 1
        assert section.get("title") and section.get("text"), (week, number, "Missing explanation")
        assert isinstance(section.get("walk", []), list), (week, number, "Invalid walkthrough")
        if not section.get("code"):
            continue
        if section.get("shell"):
            local += 1
            continue
        executable += 1
        assert isinstance(section.get("output"), str), (week, number, "Missing expected output")
        tree = ast.parse(section["code"], filename=f"chapter-{week}-topic-{number}")
        defined = {node.name for node in ast.walk(tree) if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))}
        assert not defined.intersection(names), (week, number, "Teaching defines a practice answer")
        new = features(tree) - seen
        if new:
            lines.append(f"- Topic {number}, **{section['title']}**: " + ", ".join(f"`{item}`" for item in sorted(new)))
        seen.update(features(tree))
    lines.append("")

assert {unit["week"] for unit in BOOK["units"]} == set(range(1, 25))
if "--write-inventory" in sys.argv:
    (ROOT / "docs/TEACHING_SYNTAX_INVENTORY.md").write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8", newline="\n")
print(f"Teaching audit: 24 chapters, {total} explained topics, {executable} executable examples, {local} local illustrations; expected-output fields and separate practice contracts checked.")
