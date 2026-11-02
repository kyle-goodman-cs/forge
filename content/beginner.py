"""Add beginner-level teaching to dist/handbook.json.

- units[w]["plain"]: plain-English sections with worked code, shown BEFORE the compact
  reference summary, for weeks 1–12.
- units[w]["watch"]: the matching free CS50P lecture (Harvard's Introduction to Programming
  with Python) to watch first.
- handbook["questlines"]: briefing guides for the questlines (practice, bug hunts, SQL,
  interview, hardware).
Run after handbook.py (build_course.py does this).
"""
import json
from pathlib import Path

from build_io import write_text_atomic

CS50P = "https://cs50.harvard.edu/python/weeks/"
CS50X = "https://cs50.harvard.edu/x/"

WATCH = {
    1: ("CS50P Lecture 0 (Functions, Variables) and Lecture 1 (Conditionals)", CS50P),
    2: ("CS50P Lecture 2 (Loops)", CS50P),
    3: ("CS50P Lecture 2 (Loops): the parts on lists and dictionaries", CS50P),
    4: ("CS50P Lecture 4 (Libraries) for modules; rewatch any part of Lecture 2 that felt shaky", CS50P),
    5: ("CS50P Lecture 3 (Exceptions)", CS50P),
    6: ("CS50P Lecture 6 (File I/O)", CS50P),
    7: ("CS50P Lecture 4 (Libraries) and the CSV part of Lecture 6", CS50P),
    8: ("CS50x Week 3 (Algorithms): searching, sorting, and Big O", CS50X),
    9: ("CS50x Week 5 (Data Structures): stacks and queues", CS50X),
    10: ("CS50P Lecture 8 (Object-Oriented Programming)", CS50P),
    11: ("CS50P Lecture 5 (Unit Tests)", CS50P),
    12: ("CS50P Lecture 9 (Et Cetera)", CS50P),
}

PLAIN = {
    1: [
        dict(title="What you are actually doing",
             text="A program is a list of instructions that the computer follows from top to bottom, exactly as written. It never guesses what you meant. That sounds harsh, but it's also what makes programming learnable: when something goes wrong, there is always a concrete reason, and you can find it by reading carefully.\n\nIn Forge, almost every challenge asks you to write a function: a named, reusable recipe. You give it inputs, it does some work, and it hands back one result.",
             code="def add_xp(current, earned):   # a recipe named add_xp with two inputs\n    total = current + earned    # do the work\n    return total                # hand the result back\n\nadd_xp(20, 15)   # calling the recipe gives back 35"),
        dict(title="Variables are labels, not boxes",
             text="total = current + earned does two things. First Python works out the right-hand side (20 + 15 = 35). Then it sticks the label total onto that value. If you later write total = total + 1, Python computes 36 and moves the label to the new value.\n\nRead = as 'now refers to', never as 'equals'. That one habit prevents a lot of confusion. To compare two values, use == instead.",
             code="hp = 30\nhp = hp - 12     # right side first: 30 - 12 = 18, then hp refers to 18\nprint(hp == 18)  # True: == compares, = assigns"),
        dict(title="return vs print",
             text="This trips up nearly every beginner. print shows text on the screen for a human to read. return sends a value back to whoever called the function, so other code can use it. Forge's checks call your function and look at what it returns. If you print the answer instead, the function returns None and the check fails, even though you can see the right number on screen.",
             code="def wrong(a, b):\n    print(a + b)    # shows 35, but gives back None\n\ndef right(a, b):\n    return a + b    # gives back 35\n\nprint(right(20, 15) + 1)   # 36: the returned value can be used\n# wrong(20, 15) + 1  -> TypeError: None + 1"),
        dict(title="Making decisions",
             text="if lets a program choose. The condition after if is checked; if it's True, the indented block runs. elif means 'otherwise, if', and else catches everything left over. Python uses indentation (four spaces) to know which lines belong to which block, so indentation is not decoration: it changes the meaning.\n\nWhen a function returns inside an if, it stops right there. That's why you can check the most extreme case first and let later checks handle what remains.",
             code='def health_label(hp):\n    if hp <= 0:\n        return "down"     # function stops here for 0 or less\n    if hp <= 25:\n        return "low"      # only reached when hp is above 0\n    return "ready"        # everything else'),
        dict(title="How to attack any challenge",
             text="1. Read the task twice and write down the inputs and the output.\n2. Work two examples by hand, including an edge case such as 0, an empty list, or the exact boundary value.\n3. Write the function. Keep it boring and obvious.\n4. Run the checks. If one fails, read its input, expected value, and received value, then trace your code line by line with that exact input.\n\nThe tracing in step 4 is the skill you're building. It's what lets you check AI-written code later instead of trusting it blindly."),
    ],
    2: [
        dict(title="Lists hold things in order",
             text="A list is an ordered collection: [3, 8, 1]. Positions (indexes) start at 0, so the first item is scores[0] and the last is scores[-1]. len(scores) tells you how many items there are. Lists can grow with .append(value).",
             code="scores = [3, 8, 1]\nprint(scores[0])    # 3\nprint(scores[-1])   # 1\nscores.append(10)\nprint(len(scores))  # 4"),
        dict(title="A loop does the same thing for each item",
             text="for item in collection: runs the indented block once per item, with item referring to a different element each time. The most important loop pattern is the accumulator: make a variable before the loop, update it inside, and use it after.",
             code="def total_damage(hits):\n    total = 0              # 1. start before the loop\n    for hit in hits:\n        total += hit       # 2. update for each item\n    return total           # 3. use it after the loop\n\n# Trace with [4, 6]:\n#   total = 0\n#   hit = 4 -> total = 4\n#   hit = 6 -> total = 10\n#   return 10"),
        dict(title="Tracing: your most important skill",
             text="When a loop gives the wrong answer, don't change things at random. Take the smallest input that fails, and write down every variable after every line, like the trace above. The moment your written trace disagrees with what you expected, you've found the bug. It feels slow at first. It becomes fast, and it's the core of debugging.\n\nA common bug: putting return inside the loop. That returns after the first item, because return always ends the function immediately."),
        dict(title="Building a new list",
             text="To filter or transform, start with an empty list and append what you want to keep. Python also has a shorthand called a list comprehension. Learn the long form first; the short form is the same thing written compactly.",
             code="def affordable(prices, budget):\n    result = []\n    for price in prices:\n        if price <= budget:\n            result.append(price)\n    return result\n\n# Same thing as a comprehension:\n# return [p for p in prices if p <= budget]"),
        dict(title="Strings are sequences too",
             text="A string is a sequence of characters, so you can loop over it, index it, and slice it. Strings never change in place: methods like .strip(), .lower(), and .replace() return a new string, so you must keep the result.",
             code='name = "  Dark Souls "\nname.strip()               # returns "Dark Souls" but name is unchanged!\nname = name.strip()        # keep the result\nprint(name.lower().replace(" ", "_"))   # dark_souls'),
    ],
    3: [
        dict(title="Dictionaries: look things up by name",
             text="A list finds things by position. A dictionary finds things by key. Think of a dictionary as a two-column table: keys on the left, values on the right. Keys are unique; assigning to an existing key replaces its value.",
             code='inventory = {"potion": 2, "key": 1}\nprint(inventory["potion"])      # 2\ninventory["potion"] = 3         # replace\ninventory["sword"] = 1          # add a new key\nprint("bow" in inventory)       # False: checks keys'),
        dict(title="The counting pattern",
             text="Counting how often things appear is one of the most common tasks in real code. Use .get(key, 0): it returns the current count, or 0 if the key isn't there yet.",
             code='def loot_counts(items):\n    counts = {}\n    for item in items:\n        counts[item] = counts.get(item, 0) + 1\n    return counts\n\n# ["gem", "coin", "gem"] -> {"gem": 2, "coin": 1}'),
        dict(title="Sets: unique values, fast membership",
             text="A set holds each value once and answers 'have I seen this?' very quickly. Use it to remove duplicates or to track what you've already handled. Sets have no order, so sort the result if order matters.",
             code='seen = set()\nfor name in ["ana", "bo", "ana"]:\n    if name in seen:\n        print("duplicate:", name)\n    seen.add(name)'),
        dict(title="Copies vs. the same object",
             text="b = a does not copy a list or dictionary. Both names now point at the same object, so changing one changes 'both'. When a task says 'do not mutate', make a copy first. This bug is subtle and very common in real codebases.",
             code="a = {\"hp\": 10}\nb = a           # same dictionary, two names\nb[\"hp\"] = 0\nprint(a)        # {'hp': 0}  surprise!\n\nc = dict(a)     # a real (shallow) copy\nc[\"hp\"] = 99\nprint(a)        # {'hp': 0}  unchanged"),
        dict(title="Sorting with a key",
             text="sorted(items, key=...) sorts by whatever the key function returns. A tuple key sorts by the first part, then the second to break ties. Negating a number flips it to descending without reversing the tie-breaker.",
             code='players = [{"name": "bo", "score": 5}, {"name": "ana", "score": 5}, {"name": "cy", "score": 9}]\nordered = sorted(players, key=lambda p: (-p["score"], p["name"]))\nprint([p["name"] for p in ordered])   # [\'cy\', \'ana\', \'bo\']'),
    ],
    4: [
        dict(title="State is just variables over time",
             text="A game is a loop that repeatedly reads input, updates state (position, health, score), and shows the result. You already have every tool for this: variables for state, if for rules, and loops for repetition. This week is about combining them without getting lost.\n\nWrite the state down explicitly. Ask, for every rule: what is the state before, what input arrives, and what is the state after?",
             code='def dungeon(commands):\n    x, y = 0, 0                      # state\n    for cmd in commands:             # inputs, one at a time\n        if cmd == "N":\n            y += 1\n        elif cmd == "S":\n            y -= 1\n        elif cmd == "E":\n            x += 1\n        elif cmd == "W":\n            x -= 1\n        # unknown commands: state unchanged\n    return [x, y]'),
        dict(title="Clamping and invariants",
             text="An invariant is a rule that must always stay true, such as 'health is never negative'. Enforce it every time state changes. max(0, value) keeps a value from going below 0; min(limit, value) keeps it from going above a limit.",
             code="hp = max(0, hp - damage)        # never below 0\nhp = min(max_hp, hp + heal)     # never above max_hp"),
        dict(title="while loops need an exit",
             text="for loops over a collection always end. while loops keep going as long as a condition is True, so something inside must eventually make it False. If a run hits Forge's time limit, an infinite loop is the usual cause: check that every path changes the loop variable.",
             code="turns = 0\nwhile hp > 0:\n    hp -= damage    # this line is what eventually ends the loop\n    turns += 1"),
        dict(title="Splitting code into functions",
             text="When one function gets long, pull a piece out into its own named function: move(x, y, cmd) inside dungeon(commands). Small functions are easier to test, name, and explain in an interview. A good rule: if you can't describe what a function does in one sentence, it's doing too much."),
    ],
    5: [
        dict(title="Three kinds of errors",
             text="A SyntaxError means Python can't even read your code (a missing colon or bracket). A runtime error (ValueError, KeyError, TypeError, ZeroDivisionError…) happens while the code runs. A logic error is the sneakiest: no crash, just a wrong answer. The checks catch logic errors; tracing finds them."),
        dict(title="Reading a traceback",
             text="When Python crashes it prints a traceback. Read it from the bottom up. The last line names the error and gives a message. The line above it shows where it happened in your file. That's usually enough to find the problem.",
             code='Traceback (most recent call last):\n  File "solution.py", line 3, in average_score\n    return sum(scores) / len(scores)\nZeroDivisionError: division by zero\n\n# Bottom line: dividing by zero.\n# Line 3: len(scores) was 0, so the list was empty.\n# Fix: handle the empty list before dividing.'),
        dict(title="try / except: expecting failure",
             text="Some failures are normal, such as a user typing 'abc' where a number belongs. try runs code that might fail; except catches a specific error and lets you respond. Always name the error you expect (except ValueError:). A bare except: hides real bugs too.",
             code="def parse_level(text):\n    try:\n        level = int(text)\n    except ValueError:\n        return None          # not a number at all\n    if 1 <= level <= 100:\n        return level\n    return None              # a number, but out of range"),
        dict(title="Validate early",
             text="Check bad input at the top of the function and return early. Then the rest of the function can assume clean data. This guard-clause style is easier to read than deeply nested if/else blocks.\n\nWatch out for truthiness: 0, \"\", [], and None all count as False in an if. 'if not value' can reject a legitimate 0. When 0 is valid, check explicitly: 'if value is None'."),
    ],
    6: [
        dict(title="Files, briefly",
             text="Programs read and write files with open(). Use it inside a with block, which closes the file for you even if something goes wrong. In Forge's browser exercises you'll usually get the file's text as a string, so you can focus on processing. The local labs use real files.",
             code='with open("scores.json") as f:\n    text = f.read()\n# the file is closed here automatically'),
        dict(title="JSON: data as text",
             text="JSON is the most common format for sending data between programs and APIs. It looks like Python dictionaries and lists, but it is text. json.loads(text) turns it into Python objects; json.dumps(obj) turns objects back into text.",
             code='import json\ndata = json.loads(\'{"hp": 5, "tags": ["rpg"]}\')\nprint(data["hp"] + 1)              # 6\nprint(json.dumps({"ok": True}))     # {"ok": true}'),
        dict(title="CSV: spreadsheets as text",
             text="CSV is how spreadsheets travel. It looks easy to parse with split(','), but values can contain commas inside quotes. The csv module handles that correctly. DictReader gives each row as a dictionary keyed by the header.",
             code='import csv, io\ntext = "item,price\\n\\"Potion, large\\",3\\n"\nfor row in csv.DictReader(io.StringIO(text)):\n    print(row["item"], float(row["price"]))   # Potion, large 3.0'),
        dict(title="Paths are structured",
             text="pathlib.Path understands file paths, so you don't have to slice strings yourself. It knows the file name (.name), the extension (.suffix), and the name without it (.stem).",
             code='from pathlib import Path\np = Path("saves/slot1.json")\nprint(p.name, p.suffix, p.stem)   # slot1.json .json slot1'),
    ],
    7: [
        dict(title="Automation that doesn't hurt you",
             text="Automation scripts touch real files and data, so mistakes are expensive. Professionals split every automated change into two steps: plan (work out exactly what would change, and show it) and apply (do it). A plan can be reviewed, tested, and run safely as many times as you like.",
             code='def rename_plan(names):\n    plan = []\n    for old in names:\n        new = old.lower().replace(" ", "_")\n        if new != old:                 # skip no-op changes\n            plan.append([old, new])\n    return plan                       # nothing has been renamed yet'),
        dict(title="Collisions and reruns",
             text="Two different inputs can produce the same output ('My Save' and 'my_save' both become 'my_save'). A good plan detects that before it overwrites something. And a good script is idempotent: running it twice gives the same result as running it once, so a crash halfway through is easy to recover from."),
        dict(title="Dry runs",
             text="Most professional command-line tools have a --dry-run flag that prints the plan without applying it. You'll build one in week 13. Get in the habit now: never write code that changes things without a way to preview what it will do."),
    ],
    8: [
        dict(title="What interviewers are actually checking",
             text="Entry-level technical interviews mostly test whether you can: understand a problem and ask about edge cases, get to a correct solution, explain your thinking while you work, and reason about efficiency. Fancy tricks matter much less than clear thinking out loud.\n\nA reliable script: restate the problem, try a small example by hand, describe a simple approach, code it, test it on your example and an edge case, then discuss how fast it is and whether it can be improved."),
        dict(title="Big O in plain English",
             text="Big O describes how the work grows as the input grows. Looking at every item once is O(n): double the input, double the work. Comparing every item with every other item is O(n²): double the input, four times the work. Looking something up in a dictionary or set is about O(1): it stays fast no matter how big it gets.",
             code="# O(n²): checks every pair\nfor i in range(len(nums)):\n    for j in range(i + 1, len(nums)):\n        ...\n\n# O(n): one pass with a set\nseen = set()\nfor n in nums:\n    if n in seen:      # O(1) lookup\n        ..."),
        dict(title="The hash-map trick",
             text="Many interview problems ask 'is there an earlier item that pairs with this one?' Instead of searching backward every time (slow), remember what you've seen in a dictionary (fast). That turns an O(n²) solution into O(n), and it's the single most useful interview idea.",
             code="def two_sum(nums, target):\n    seen = {}                        # value -> index\n    for i, n in enumerate(nums):\n        need = target - n\n        if need in seen:\n            return [seen[need], i]\n        seen[n] = i\n    return []"),
    ],
    9: [
        dict(title="Patterns, not memorized answers",
             text="Most easy and medium interview problems are variations on a handful of patterns. Learn to recognize the pattern from the problem's shape, then adapt it. This week covers four of the most common."),
        dict(title="Two pointers",
             text="Put one index at each end (or both at the start) and move them toward each other based on a rule. This checks palindromes, merges sorted lists, and finds pairs in sorted data in one pass.",
             code="def is_palindrome(text):\n    left, right = 0, len(text) - 1\n    while left < right:\n        if text[left] != text[right]:\n            return False\n        left += 1\n        right -= 1\n    return True"),
        dict(title="Stacks",
             text="A stack is last-in, first-out, like a pile of plates. In Python, use a list with .append() and .pop(). Stacks are perfect for anything nested: brackets, undo history, or walking back through a path."),
        dict(title="Sliding window and binary search",
             text="A sliding window keeps a running result for a range of consecutive items and slides it one step at a time instead of recomputing from scratch. Binary search repeatedly halves a sorted range, finding an item in O(log n). For binary search, draw the low and high indexes on paper for every step: almost every bug is an off-by-one in those two lines.",
             code="def binary_search(nums, target):\n    low, high = 0, len(nums) - 1\n    while low <= high:              # <= so a 1-item range is still checked\n        mid = (low + high) // 2\n        if nums[mid] == target:\n            return mid\n        if nums[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1"),
    ],
    10: [
        dict(title="Classes bundle data with behavior",
             text="A class is a blueprint for objects that hold their own data (attributes) and know how to act on it (methods). __init__ runs when you create an object and sets its starting state on self. Every method receives the object itself as self, and that's how it reads and changes the object's data.",
             code="class Wallet:\n    def __init__(self, balance):\n        self.balance = balance          # state lives on self\n\n    def spend(self, amount):\n        if amount > self.balance:       # protect the invariant\n            return False\n        self.balance -= amount\n        return True\n\nw = Wallet(10)\nw.spend(4)\nprint(w.balance)    # 6"),
        dict(title="When to use a class",
             text="Use a plain function when you just transform input into output. Use a class when something has state that changes over time and rules that protect it, like a wallet that can never go negative. Don't make classes just because it feels more professional; simpler is better."),
    ],
    11: [
        dict(title="From exercises to a tool",
             text="Real tools are small functions connected together: read input, clean it, process it, and write output. Keep the pieces separate. The functions that do the work should take plain values and return plain values (easy to test), and a thin outer layer handles files and printing.\n\nWrite down what 'done' means before you start: a couple of example inputs with their exact expected outputs. Those examples become your tests."),
        dict(title="Tests you write yourself",
             text="A test calls your function with a known input and checks the result. Python's built-in unittest module runs a folder of these automatically. In the local labs you'll write them. Every bug you fix should leave behind a test that would have caught it.",
             code="import unittest\nfrom core import merge_library\n\nclass TestMerge(unittest.TestCase):\n    def test_same_title_different_case(self):\n        records = [{\"title\": \"Hades\", \"minutes\": 30}, {\"title\": \"hades\", \"minutes\": 15}]\n        self.assertEqual(merge_library(records), {\"hades\": 45})"),
    ],
    12: [
        dict(title="Proving it to yourself",
             text="This week's challenges come with less guidance on purpose. That's the point: confidence comes from finishing something you weren't walked through. If you get stuck, go back to the method from week 1: write the inputs and outputs, work an example by hand, write the simplest correct code, and trace the failing case.\n\nUse the help ladder honestly. A redo bounty later is a better outcome than a fake clear now."),
    ],
}

QUESTLINES = {
    "grind": dict(title="Practice grind",
        text="Fundamentals stick through many repetitions, not one good attempt. Each drill here is small, aimed at a single idea from that week's chapter. Aim to solve each one with no hints in under 15 minutes.\n\nIf a drill takes much longer, that's useful information: go back to the chapter's plain-English section, then try again tomorrow. Speed comes later; accuracy comes first."),
    "bugs": dict(title="Bug hunts",
        text="Each quest gives you code that looks reasonable but is wrong. Your job is to find the bug and fix it with the smallest possible change. This is the skill that matters most now that AI writes so much code: someone has to check it.\n\nThe method:\n1. Run the checks first, without changing anything. Find the failing case.\n2. Trace the code by hand with that exact input, writing down each variable.\n3. Stop at the first line where reality differs from what the code should do. Name the bug in one sentence in your notes.\n4. Fix only that, then rerun everything.\n\nResist rewriting the whole function. In a real job, the smallest correct fix is the one that gets approved.",
        code="Common bug families you'll meet:\n  off-by-one        > vs >=, range(n) vs range(n + 1)\n  wrong default     .get(key, 0) when 0 is a real value\n  aliasing          b = a does not copy a list or dict\n  early return      return inside a loop's else branch\n  order             checking after adding instead of before\n  min/max swap      'at least 0' means max(0, x)"),
    "sql": dict(title="SQL",
        text="SQL is how you ask a database questions. It's what data and BI roles test first, and you'll use it in almost any engineering job. These quests use a small game-library database with three tables: players, games, and sessions (who played what, for how long, and when).\n\nYou write a single SELECT statement. Forge runs it against two different datasets and compares your rows (including their order) with the expected answer, so a query has to be truly correct, not just right for one set of data.\n\nA query reads in this order, even though you write SELECT first: FROM (which tables) → JOIN (connect them) → WHERE (filter rows) → GROUP BY (make groups) → HAVING (filter groups) → SELECT (pick columns) → ORDER BY (sort). When a query confuses you, read it in that order.",
        code="SELECT g.title, SUM(s.minutes) AS total      -- 6. pick columns\nFROM sessions AS s                            -- 1. start here\nJOIN games AS g ON g.id = s.game_id           -- 2. connect tables\nWHERE s.played_on >= '2026-10-01'             -- 3. filter rows\nGROUP BY g.id                                 -- 4. one row per game\nHAVING SUM(s.minutes) > 60                    -- 5. filter groups\nORDER BY total DESC, g.title;                 -- 7. sort"),
    "interview": dict(title="Interview gauntlet",
        text="These are classic entry-level interview problems. Treat each one like a real interview:\n1. Restate the problem and ask yourself about edge cases (empty input, duplicates, negatives).\n2. Describe a brute-force solution, even if it's slow.\n3. Improve it, and say why it's faster.\n4. Code it, then test it on a small example out loud.\n5. State the time and space complexity.\n\nAfter you clear one, come back in a few days and solve it from a blank file while talking out loud. Recall under light pressure is what interviews actually measure."),
    "hardware": dict(title="Hardware lab",
        text="These quests are the software side of embedded work: turning raw sensor readings into decisions. They use the same ideas as real sensor projects (barometric pressure and GPS) and run right here in the browser.\n\nTo try the real thing, get a Raspberry Pi Pico (or Pico W) starter kit with a breadboard, jumper wires, a push button, an LED, and a BMP280 barometric sensor (roughly $30–50 total). Install the MicroPython firmware, use the Thonny editor, and build in this order:\n1. Blink the LED. Then read the button and light the LED while it's pressed.\n2. Count button presses using your debounce logic from these quests.\n3. Read the BMP280 over I2C and print pressure every second.\n4. Convert pressure to altitude with your formula, smooth it with your moving average, and drive the LED as an alarm with hysteresis.\n\nWrite every line yourself. If you lose track of time doing this, embedded or test engineering may be your direction.",
        code="# MicroPython on a Pico: blink the onboard LED\nfrom machine import Pin\nimport time\n\nled = Pin(\"LED\", Pin.OUT)\nwhile True:\n    led.toggle()\n    time.sleep(0.5)"),
}


def main():
    path = Path(__file__).resolve().parent.parent / "dist" / "handbook.json"
    book = json.loads(path.read_text(encoding="utf-8"))
    for unit in book["units"]:
        w = unit["week"]
        if w in PLAIN:
            unit["plain"] = PLAIN[w]
        if w in WATCH:
            label, url = WATCH[w]
            unit["watch"] = {"label": label, "url": url}
    book["questlines"] = QUESTLINES
    write_text_atomic(path, json.dumps(book, indent=2, ensure_ascii=False))
    words = sum(len((s["text"] + " " + s.get("code", "")).split()) for v in PLAIN.values() for s in v)
    print(f"Beginner teaching added to {len(PLAIN)} weeks (~{words} words) and {len(QUESTLINES)} questline guides.")


if __name__ == "__main__":
    main()
