"""Generate dist/traces.js: short "predict the output" side quests for the quest book.

Every expected output is produced by actually running the snippet, so the answer key
can never drift from real Python behavior. Run from the project root:

    py content/traces.py
"""
import contextlib
import io
import json
import pathlib

from build_io import write_text_atomic

# (week, title, code, why) — two side quests per week, aligned with that week's topics.
TRACES = [
    (1, "Rebinding a name", 'hp = 30\nhp = hp - 12\nhp += 5\nprint(hp)',
     "Each assignment replaces the value bound to hp: 30, then 18, then 23."),
    (1, "First matching branch", 'def label(score):\n    if score >= 90:\n        return "S"\n    if score >= 70:\n        return "A"\n    return "B"\n\nprint(label(70), label(95), label(12))',
     "return exits immediately, so only the first true condition matters. 70 is not >= 90 but is >= 70."),
    (2, "A running total", 'total = 0\nfor n in [3, 4, 5]:\n    total += n\n    print(total)',
     "print is inside the loop, so it runs once per item with the total so far."),
    (2, "Chained string methods", 'name = "  Dark Souls "\nprint(name.strip().lower().replace(" ", "_"))',
     "Methods apply left to right: strip outer spaces, lowercase, then replace the inner space."),
    (3, "Counting with get", 'inv = {"potion": 2}\ninv["potion"] += 1\ninv["key"] = inv.get("key", 0) + 1\nprint(inv)',
     "get returns the default 0 for a missing key, so key becomes 1. Dicts keep insertion order."),
    (3, "Sorting by a field", 'scores = [("ana", 5), ("bo", 9), ("cy", 7)]\nranked = sorted(scores, key=lambda p: p[1], reverse=True)\nprint(ranked[0][0], len(ranked))',
     "The key picks the score; reverse=True puts the highest first. sorted keeps every item."),
    (4, "Clamped damage", 'hp = 10\nfor dmg in [4, 7, 3]:\n    hp = max(0, hp - dmg)\nprint(hp)',
     "10-4=6, then 6-7 would be -1 but max clamps it to 0, then 0-3 clamps to 0 again."),
    (4, "Walking a grid", 'x, y = 0, 0\nfor c in "NNEWS":\n    if c == "N":\n        y += 1\n    elif c == "S":\n        y -= 1\n    elif c == "E":\n        x += 1\n    elif c == "W":\n        x -= 1\nprint(x, y)',
     "N,N puts y at 2; E then W cancel out on x; S brings y back to 1."),
    (5, "Where range stops", 'total = 0\nfor i in range(1, 5):\n    total += i\nprint(total)',
     "range(1, 5) stops before 5: 1+2+3+4 = 10. This is the classic off-by-one."),
    (5, "What int accepts", 'def parse(text):\n    try:\n        return int(text)\n    except ValueError:\n        return None\n\nprint(parse("42"), parse("4.2"), parse(" 7 "))',
     "int rejects a decimal string with ValueError, but it ignores surrounding whitespace."),
    (6, "Parsing JSON", 'import json\ndata = json.loads(\'{"hp": 5, "tags": ["a", "b"]}\')\nprint(data["hp"] * 2, len(data["tags"]))',
     "JSON numbers become ints and arrays become lists, so normal Python operations work."),
    (6, "Suffix vs stem", 'from pathlib import Path\np = Path("saves/slot1.backup.json")\nprint(p.suffix, p.stem)',
     "suffix is only the last extension; stem is the file name minus that last suffix."),
    (7, "Spot the collision", 'names = ["My Save", "my_save", "Boss"]\nplan = [n.lower().replace(" ", "_") for n in names]\nprint(plan)\nprint(len(set(plan)))',
     "Two different sources normalize to the same target, so the set has only 2 unique names."),
    (7, "Clean, dedupe, sort", 'tags = [" RPG", "rpg", "", "Indie "]\nclean = sorted({t.strip().lower() for t in tags if t.strip()})\nprint(clean)',
     "The empty tag is filtered out; the set merges the two rpg spellings; sorted returns a list."),
    (8, "Stop at the first repeat", 'seen = set()\nfor n in [4, 1, 4, 2]:\n    if n in seen:\n        print("dup", n)\n        break\n    seen.add(n)\nprint(len(seen))',
     "break exits before 2 is ever added, so seen holds only 4 and 1."),
    (8, "Sorted characters", 'print(sorted("listen") == sorted("silent"), sorted("cab"))',
     "sorted on a string returns a list of characters. Anagrams produce identical sorted lists."),
    (9, "A stack of brackets", 'stack = []\nfor ch in "(()":\n    if ch == "(":\n        stack.append(ch)\n    else:\n        stack.pop()\nprint(len(stack))',
     "Two pushes, one pop: one opening bracket is still waiting to be closed."),
    (9, "Best window", 'nums = [2, 1, 5, 1]\nk = 2\nbest = max(sum(nums[i:i + k]) for i in range(len(nums) - k + 1))\nprint(best)',
     "The windows are [2,1]=3, [1,5]=6, [5,1]=6, so the maximum is 6."),
    (10, "Methods that return self", 'class Counter:\n    def __init__(self):\n        self.value = 0\n\n    def add(self, n):\n        self.value += n\n        return self\n\nc = Counter()\nc.add(2).add(3)\nprint(c.value)',
     "add returns the same object, so the second add runs on c too: 0+2+3."),
    (10, "Alias or copy?", 'a = [1, 2]\nb = a\nb.append(3)\nc = a.copy()\nc.append(4)\nprint(a, len(c))',
     "b is another name for the same list, so a changes. c is a separate copy, so a does not get 4."),
    (11, "Merging normalized keys", 'lib = {}\nfor title, mins in [("Hades", 30), ("hades ", 15), ("Celeste", 10)]:\n    key = title.strip().lower()\n    lib[key] = lib.get(key, 0) + mins\nprint(lib)',
     "Both Hades spellings normalize to the same key, so their minutes are summed."),
    (11, "Building CSV lines", 'rows = [("b", 2), ("a", 1)]\nlines = ["title,minutes"] + [f"{t},{m}" for t, m in sorted(rows)]\nprint("\\n".join(lines))',
     "Tuples sort by their first item, and join puts a newline between each line."),
    (12, "Split only once", 'line = "warn | disk | almost full"\nlevel, msg = line.split("|", 1)\nprint(level.strip().upper(), msg.strip())',
     "maxsplit=1 splits at the first | only, so the message keeps its own | character."),
    (12, "First unique character", 'from collections import Counter\ntext = "aabcb"\ncounts = Counter(text)\nprint([ch for ch in text if counts[ch] == 1][0])',
     "a appears twice and b twice; c is the only character with a count of 1."),
    (13, "Parsing flags", 'import argparse\np = argparse.ArgumentParser()\np.add_argument("--limit", type=int, default=10)\np.add_argument("--dry-run", action="store_true")\na = p.parse_args(["--dry-run"])\nprint(a.limit, a.dry_run)',
     "Unsupplied --limit uses its default. argparse turns --dry-run into the attribute dry_run."),
    (13, "Environment values are text", 'env = {"APP_PORT": "abc"}\nraw = env.get("APP_PORT", "8000")\nprint(raw.isdigit(), env.get("DEBUG", "off"))',
     "The default is only used when the key is missing. APP_PORT exists, but it is not digits."),
    (14, "Where the exception lands", 'def safe_div(a, b):\n    if b == 0:\n        raise ValueError("zero divisor")\n    return a / b\n\ntry:\n    print(safe_div(6, 3))\n    print(safe_div(1, 0))\nexcept ValueError as e:\n    print("error:", e)',
     "/ always returns a float. The second call raises, so control jumps to except."),
    (14, "A fake dependency", 'def lookup(key, cache, fetch):\n    if key not in cache:\n        cache[key] = fetch(key)\n    return cache[key]\n\ncalls = []\n\ndef fake(k):\n    calls.append(k)\n    return k.upper()\n\ncache = {}\nprint(lookup("a", cache, fake), lookup("a", cache, fake), len(calls))',
     "The second lookup hits the cache, so fetch runs only once."),
    (15, "Full-match patterns", 'import re\nfor t in ["GAME-1234", "GAME-12345", "game-1234"]:\n    print(bool(re.fullmatch(r"GAME-\\d{4}", t)))',
     "fullmatch must consume the whole string: five digits fail, and matching is case-sensitive."),
    (15, "Float surprises", 'print(0.1 + 0.2 == 0.3, round(0.1 + 0.2, 2) == 0.3)',
     "0.1 + 0.2 is 0.30000000000000004 in binary floating point. Rounding hides the error."),
    (16, "Filter and order in SQL", 'import sqlite3\ndb = sqlite3.connect(":memory:")\ndb.execute("CREATE TABLE g(title TEXT, price INT)")\ndb.executemany("INSERT INTO g VALUES (?, ?)", [("A", 5), ("B", 20), ("C", 10)])\nrows = db.execute("SELECT title FROM g WHERE price <= 10 ORDER BY price DESC").fetchall()\nprint(rows)',
     "B is filtered out. DESC puts the 10 before the 5. Each row is a one-item tuple."),
    (16, "GROUP BY totals", 'import sqlite3\ndb = sqlite3.connect(":memory:")\ndb.execute("CREATE TABLE s(game TEXT, m INT)")\ndb.executemany("INSERT INTO s VALUES (?, ?)", [("A", 5), ("B", 3), ("A", 7)])\nprint(db.execute("SELECT game, SUM(m) FROM s GROUP BY game ORDER BY game").fetchall())',
     "GROUP BY collapses rows per game and SUM adds their minutes: A is 5+7."),
    (17, "Encoding a query", 'from urllib.parse import urlencode\nprint("https://x.com/g?" + urlencode({"q": "dark souls", "page": 2}))',
     "urlencode joins pairs with & and encodes the space as +."),
    (17, "Backoff delays", 'delays = []\nfor attempt, status in enumerate([503, 503, 200]):\n    if 200 <= status < 300:\n        break\n    delays.append(2 ** attempt)\nprint(delays)',
     "Attempts 0 and 1 fail and add 2**0 and 2**1. The 200 stops the loop before adding anything."),
    (18, "The mutable default trap", 'def add(item, bag=[]):\n    bag.append(item)\n    return bag\n\nadd(1)\nprint(add(2))',
     "The default list is created once and shared between calls, so it still holds 1."),
    (18, "A chunking generator", 'def chunks(values, size):\n    for i in range(0, len(values), size):\n        yield values[i:i + size]\n\nprint(list(chunks([1, 2, 3, 4, 5], 2)))',
     "range steps by 2: slices start at 0, 2, 4. The last slice is shorter."),
    (19, "Recursive sum", 'def depth_sum(v):\n    if isinstance(v, int):\n        return v\n    return sum(depth_sum(x) for x in v)\n\nprint(depth_sum([1, [2, [3]], 4]))',
     "The base case returns ints; lists are summed by recursing into each item: 1+2+3+4."),
    (19, "Heap order", 'import heapq\nh = []\nfor name, pr in [("b", 2), ("a", 1), ("c", 3)]:\n    heapq.heappush(h, (pr, name))\nprint(heapq.heappop(h)[1], len(h))',
     "heappop removes the smallest tuple, which compares priority first."),
    (20, "Paginating a sorted list", 'games = ["Zelda", "Hades", "Celeste", "Doom"]\nordered = sorted(games)\nprint(ordered[1:3])',
     "Sorted: Celeste, Doom, Hades, Zelda. The slice [1:3] takes indices 1 and 2."),
    (20, "Patch only allowed fields", 'original = {"title": "Old", "completed": False, "id": 7}\nchanges = {"title": "New", "id": 99}\nallowed = {"title", "completed"}\npatched = {**original, **{k: v for k, v in changes.items() if k in allowed}}\nprint(patched)',
     "id is not in allowed, so its change is dropped. Later ** entries override earlier ones."),
    (21, "Upsert by id", 'existing = [{"id": 1, "v": "a"}, {"id": 2, "v": "b"}]\nincoming = [{"id": 2, "v": "B"}, {"id": 3, "v": "c"}]\nmerged = {r["id"]: r for r in existing + incoming}\nprint([merged[k]["v"] for k in sorted(merged)])',
     "Later records overwrite earlier ones with the same id, so id 2 keeps the incoming B."),
    (21, "Validating file names", 'import re\nfor n in ["save_1.json", "../x.json", "a b.json"]:\n    print(bool(re.fullmatch(r"[A-Za-z0-9_-]{1,40}\\.json", n)))',
     "The character class allows no dots or slashes before .json, and no spaces."),
    (22, "Which fields changed?", 'before = {"a": 1, "b": 2}\nafter = {"a": 1, "b": 3, "c": 4}\nprint(sorted(k for k in before.keys() | after.keys() if before.get(k) != after.get(k)))',
     "b changed value and c is new (None vs 4). a is identical in both."),
    (22, "New and fixed failures", 'prev = {"t1", "t2"}\ncur = {"t2", "t3"}\nprint(sorted(cur - prev), sorted(prev - cur))',
     "cur - prev is newly failing; prev - cur is what got fixed. t2 is still failing."),
    (23, "Summarizing CI jobs", 'jobs = [{"name": "lint", "code": 0}, {"name": "test", "code": 1}]\nfailed = [j["name"] for j in jobs if j["code"] != 0]\nprint(not failed, failed)',
     "A non-empty list is truthy, so not failed is False."),
    (23, "is True means the bool", 'evidence = {"tests": True, "readme": "yes"}\nprint(all(evidence.get(k) is True for k in ["tests", "readme"]))',
     '"yes" is truthy but it is not the object True, so the check fails.'),
    (24, "Sort with a tiebreak", 'scores = {"ana": 5, "bo": 9, "cy": 9}\nprint(sorted(scores, key=lambda n: (-scores[n], n))[:2])',
     "Negating sorts scores descending; ties fall back to the name ascending."),
    (24, "Sliding window state", 'text = "abcabcbb"\nbest = start = 0\nseen = {}\nfor i, ch in enumerate(text):\n    if ch in seen and seen[ch] >= start:\n        start = seen[ch] + 1\n    seen[ch] = i\n    best = max(best, i - start + 1)\nprint(best)',
     "The window never holds more than 3 distinct characters in a row, like abc."),
]


def run(code):
    out = io.StringIO()
    with contextlib.redirect_stdout(out):
        exec(compile(code, "trace.py", "exec"), {"__name__": "__main__"})
    return out.getvalue().rstrip("\n")


def main():
    root = pathlib.Path(__file__).resolve().parent.parent
    counters = {}
    items = []
    for week, title, code, why in TRACES:
        counters[week] = counters.get(week, 0) + 1
        items.append({"id": f"t{week}-{counters[week]}", "week": week, "title": title,
                      "code": code, "output": run(code), "why": why})
    assert all(counters.get(w) == 2 for w in range(1, 25)), counters
    target = root / "dist" / "traces.js"
    write_text_atomic(target, "/* Generated by content/traces.py. Edit that file and regenerate. */\n"
                      "const QUEST_TRACES=" + json.dumps(items, ensure_ascii=False) + ";\n")
    print(f"Wrote {len(items)} trace side quests to {target}")


if __name__ == "__main__":
    main()
