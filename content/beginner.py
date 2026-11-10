"""Add beginner-level teaching to dist/handbook.json.

- units[w]["plain"]: plain-English sections with worked code, shown BEFORE the compact
  reference summary, for weeks 1–12.
- units[w]["watch"]: the matching free CS50P lecture (Harvard's Introduction to Programming
  with Python) to watch first.
- handbook["questlines"]: briefing guides for the questlines (practice, bug hunts, SQL,
  interview, hardware).
Run after handbook.py (build_course.py does this).
"""
import contextlib
import io
import json
from pathlib import Path

from build_io import write_text_atomic
from teaching_more import PLAIN_ADD, PLAIN_NEW
from lab_setup import SETUP

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
             text='A program is a list of instructions that the computer follows from top to bottom, exactly as written. A function is a named piece of that program. You supply inputs, it follows its instructions, and it can return one result.\n\nIn this example, count and price are parameters: names for the inputs. The indented lines belong to the function. Calling ticket_cost(3, 4) gives count the value 3 and price the value 4. Work out the multiplication before reading the printed result. Your practice task will use a different rule.',
             code='def ticket_cost(count, price):\n    total = count * price\n    return total\n\nprint(ticket_cost(3, 4))  # 12: three tickets at four each'),
        dict(title="Variables are labels, not boxes",
             text="Python works out the right-hand side of an assignment first, then binds the name on the left to that value. For hp = hp - 12, use the old value of hp for the subtraction, then give hp the result.\n\nRead = as 'now refers to', never as 'equals'. To compare two values, use == instead.",
             code="hp = 30\nhp = hp - 12     # right side first: 30 - 12 = 18, then hp refers to 18\nprint(hp == 18)  # True: == compares, = assigns"),
        dict(title="return vs print",
             text="This trips up nearly every beginner. print shows text on the screen for a human to read. return sends a value back to whoever called the function, so other code can use it. Forge's checks call your function and look at what it returns. If you print the answer instead, the function returns None and the check fails, even though you can see the right number on screen.",
             code="def wrong(a, b):\n    print(a + b)    # shows 35, but gives back None\n\ndef right(a, b):\n    return a + b    # gives back 35\n\nprint(right(20, 15) + 1)   # 36: the returned value can be used\n# wrong(20, 15) + 1  -> TypeError: None + 1"),
        dict(title="Making decisions",
             text='if chooses a block when its condition is True. elif checks another condition only when earlier ones were False. else handles what remains. Indent a block by four spaces; indentation changes which instructions run.\n\nTrace the example with 9, 10, and 20. At 10, the first condition is False and the second is True. return ends the function immediately. In your practice task you will choose different boundaries and results from its specification.',
             code='def temperature_note(degrees):\n    if degrees < 10:\n        return "wear a coat"\n    elif degrees < 20:\n        return "take a jacket"\n    else:\n        return "light clothes"\n\nprint(temperature_note(10))  # Which condition is True?'),
        dict(title="How to attack any challenge",
             text="1. Read the task twice and write down the inputs and the output.\n2. Work two examples by hand, including an edge case such as 0, an empty list, or the exact boundary value.\n3. Write the function. Keep it boring and obvious.\n4. Run the checks. If one fails, read its input, expected value, and received value, then trace your code line by line with that exact input.\n\nThe tracing in step 4 is the skill you're building. It's what lets you check AI-written code later instead of trusting it blindly."),
    ],
    2: [
        dict(title="Lists hold things in order",
             text="A list is an ordered collection: [3, 8, 1]. Positions (indexes) start at 0, so the first item is scores[0] and the last is scores[-1]. len(scores) tells you how many items there are. Lists can grow with .append(value).",
             code="scores = [3, 8, 1]\nprint(scores[0])    # 3\nprint(scores[-1])   # 1\nscores.append(10)\nprint(len(scores))  # 4"),
        dict(title="A loop does the same thing for each item",
             text='for item in collection: runs the indented block once per item. The name item refers to a different element each time. An accumulator starts before the loop, changes inside it, and is used after it.\n\nHere the input is a list of words and the result is their combined character count. Trace the empty list too: the loop runs zero times, so the initial value is returned. Your practice task asks you to accumulate a different quantity.',
             code='def total_letters(words):\n    count = 0\n    for word in words:\n        count += len(word)\n    return count\n\nprint(total_letters(["cat", "owl"]))  # 6\n# Before the loop: count = 0\n# First word: len("cat") = 3, count = 3\n# Second word: len("owl") = 3, count = 6'),
        dict(title="Tracing: your most important skill",
             text="When a loop gives the wrong answer, don't change things at random. Take the smallest input that fails, and write down every variable after every line, like the trace above. The moment your written trace disagrees with what you expected, you've found the bug. It feels slow at first. It becomes fast, and it's the core of debugging.\n\nA common bug: putting return inside the loop. That returns after the first item, because return always ends the function immediately."),
        dict(title="Building a new list",
             text='To filter or transform a collection, start with an empty list and append each result you want to keep. This example keeps long words but stores their lengths, rather than the words themselves.\n\nTrack both lists by hand: does the original words list change? What should happen when nothing matches? Learn this explicit loop before using the shorter list-comprehension syntax.',
             code='def lengths_of_long_words(words):\n    lengths = []\n    for word in words:\n        if len(word) > 3:\n            lengths.append(len(word))\n    return lengths\n\nprint(lengths_of_long_words(["cat", "horse", "owl"]))  # [5]'),
        dict(title="Strings are sequences too",
             text="A string is a sequence of characters, so you can loop over it, index it, and slice it. Strings never change in place: methods like .strip(), .lower(), and .replace() return a new string, so you must keep the result.",
             code='name = "  Dark Souls "\nname.strip()               # returns "Dark Souls" but name is unchanged!\nname = name.strip()        # keep the result\nprint(name.lower().replace(" ", "_"))   # dark_souls'),
    ],
    3: [
        dict(title="Dictionaries: look things up by name",
             text="A list finds things by position. A dictionary finds things by key. Think of a dictionary as a two-column table: keys on the left, values on the right. Keys are unique; assigning to an existing key replaces its value.",
             code='inventory = {"potion": 2, "key": 1}\nprint(inventory["potion"])      # 2\ninventory["potion"] = 3         # replace\ninventory["sword"] = 1          # add a new key\nprint("bow" in inventory)       # False: checks keys'),
        dict(title="The counting pattern",
             text='A dictionary can remember a running count for each distinct key. .get(key, 0) returns the stored count, or zero when the key has not appeared yet. Add one and store the updated value under the same key.\n\nTrace the example one visit at a time. Then close it and describe the steps without using Python words. The practice checkpoint will ask you to organize this idea into a function with its own contract.',
             code='visits = ["park", "museum", "park"]\ncounts = {}\nfor place in visits:\n    previous = counts.get(place, 0)\n    counts[place] = previous + 1\n    print(place, counts)\n# Watch the same dictionary change after each visit.'),
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
             text='State means the values that describe a system right now. An elevator has a current floor. Each command changes that floor, and the building limits which changes are allowed.\n\nWrite down the state before and after every command in this example. The result of one step is the starting state of the next. A game uses the same idea with more state, such as position, health, or score.',
             code='def lift_floor(commands):\n    floor = 0\n    for command in commands:\n        if command == "up":\n            floor = min(3, floor + 1)\n        elif command == "down":\n            floor = max(0, floor - 1)\n    return floor\n\nprint(lift_floor(["up", "up", "down"]))  # 1'),
        dict(title="Clamping and invariants",
             text="An invariant is a rule that must always stay true, such as 'health is never negative'. Enforce it every time state changes. max(0, value) keeps a value from going below 0; min(limit, value) keeps it from going above a limit.",
             code="hp, max_hp, damage, heal = 5, 30, 8, 50\nhp = max(0, hp - damage)        # never below 0\nhp = min(max_hp, hp + heal)     # never above max_hp"),
        dict(title="while loops need an exit",
             text="A for loop over a finite list ends after visiting its items, provided you do not keep adding items while looping. A while loop keeps going as long as its condition is True, so something inside must eventually make it False. If a run hits Forge's time limit, check whether the condition can become False.",
             code="hp, damage = 10, 3\nturns = 0\nwhile hp > 0:\n    hp -= damage    # this line is what eventually ends the loop\n    turns += 1"),
        dict(title="Terminal input for your local game",
             text="The local lab uses input() to read a line you type in the terminal. Python waits until you press Enter, then returns the text as a string. Even typing 5 produces the text \"5\", not the number 5; convert with int() when a numeric value is required. print() displays a value and does not ask for input.\n\nTry this separate greeting example in a local .py file, using the run command from your setup guide. The browser function quests receive arguments from their checks, so do not add interactive input() there.\n\nFor your game, decide which command should end the session. Use the while-loop exit rule you just learned so the player can quit. Keep input and printing in main.py, with the game rules in core.py.",
             code='name = input("What name should I use? ")\nprint(f"Hello, {name}!")', shell=True),
        dict(title="Splitting code into functions",
             text='When one function gets long, give a smaller piece its own name. For example, a lift program could have a next_floor(floor, command) function for one step and another function for processing a sequence. Small pieces are easier to test and explain.\n\nDecide what each piece receives and returns before connecting them. Your local lab is where you practice making those choices yourself.'),
    ],
    5: [
        dict(title="Three kinds of errors",
             text="A SyntaxError means Python can't even read your code (a missing colon or bracket). A runtime error (ValueError, KeyError, TypeError, ZeroDivisionError…) happens while the code runs. A logic error is the sneakiest: no crash, just a wrong answer. The checks catch logic errors; tracing finds them."),
        dict(title="Reading a traceback",
             text="When Python crashes it prints a traceback. Read it from the bottom up. The last line names the error and gives a message. The line above it shows where it happened in your file. That's usually enough to find the problem.",
             code='Traceback (most recent call last):\n  File "solution.py", line 3, in average_score\n    return sum(scores) / len(scores)\nZeroDivisionError: division by zero\n\n# Bottom line: dividing by zero.\n# Line 3: len(scores) was 0, so the list was empty.\n# Fix: handle the empty list before dividing.', shell=True),
        dict(title="try / except: expecting failure",
             text="Some failures are normal, such as a user typing 'abc' where a number belongs. try runs code that might fail; except catches a specific error and lets you respond. Always name the error you expect (except ValueError:). A bare except: hides real bugs too.",
             code="def parse_even_number(text):\n    try:\n        number = int(text)\n    except ValueError:\n        return None\n    if number % 2 != 0:\n        return None\n    return number\n\nprint(parse_even_number('8'))\nprint(parse_even_number('odd'))"),
        dict(title="Validate early",
             text='Check invalid input at the top of a function and return early. The remaining code can then assume that input has passed those checks. This guard-clause style is often easier to follow than nested conditions.\n\nWatch out for truthiness: 0, "", [], and None all count as False in an if. If zero is valid, distinguish it from a missing value with an explicit check such as value is None.'),
    ],
    6: [
        dict(title="Files, briefly",
             text="Programs read and write files with open(). Use it inside a with block, which closes the file for you even if something goes wrong. In Forge's browser exercises you'll usually get the file's text as a string, so you can focus on processing. The local labs use real files.",
             code='with open("scores.json") as f:\n    text = f.read()\n# the file is closed here automatically', shell=True),
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
             code='existing = ["draft.txt", "notes.txt"]\nproposed = ["final.txt", "notes.txt"]\nplan = []\nfor old, new in zip(existing, proposed):\n    if old != new:\n        plan.append([old, new])\nprint(plan)  # preview only: no file is changed'),
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
             code="nums = [3, 1, 3]\n\n# O(n²): checks every pair\nfor i in range(len(nums)):\n    for j in range(i + 1, len(nums)):\n        ...\n\n# O(n): one pass with a set\nseen = set()\nfor n in nums:\n    if n in seen:      # O(1) lookup\n        ..."),
        dict(title="The hash-map trick",
             text='When you repeatedly need information about earlier items, remember it in a dictionary. Choose keys for what you need to look up and values for what you need to remember.\n\nThis example maps a name to its first seat. For each arrival it can check whether the name was seen before. In your practice, work out what information the task needs you to look up before deciding what to store.',
             code='seat_by_name = {}\narrivals = ["Ada", "Bo", "Ada"]\nfor seat, name in enumerate(arrivals):\n    if name in seat_by_name:\n        print(name, "was already assigned seat", seat_by_name[name])\n    else:\n        seat_by_name[name] = seat\n# The map remembers earlier information without scanning arrivals again.'),
    ],
    9: [
        dict(title="Patterns, not memorized answers",
             text="Most easy and medium interview problems are variations on a handful of patterns. Learn to recognize the pattern from the problem's shape, then adapt it. This week covers four of the most common."),
        dict(title="Two pointers",
             text='Two pointers are two positions moving through the same sequence. Here they start at opposite ends. Each step swaps two letters, then moves inward. Once left meets or passes right, all pairs have been handled.\n\nTrace both indexes after each iteration. The letters outside them are already in their final positions: that is the invariant. Other tasks use two positions to compare values or search for a pair; choose the update rule from the task.',
             code='letters = list("code")\nleft, right = 0, len(letters) - 1\nwhile left < right:\n    letters[left], letters[right] = letters[right], letters[left]\n    left += 1\n    right -= 1\nprint("".join(letters))  # edoc'),
        dict(title="Stacks",
             text="A stack is last-in, first-out, like a pile of plates. In Python, use a list with .append() and .pop(). Stacks are perfect for anything nested: brackets, undo history, or walking back through a path."),
        dict(title="Sliding window and binary search",
             text='A sliding window keeps a result for consecutive items and updates it as the range moves. Binary search instead halves a sorted search range. Both techniques need a clear statement of what the current positions mean.\n\nFor binary search, low and high bound the candidate indexes. Compute a middle index. If its value is too small, discard the middle and everything to its left; if too large, discard it and everything to its right. The trace below shows two probes, not a finished search function.\n\nBefore writing a loop yourself, trace a missing target and a one-item list. When do the candidate indexes stop describing a nonempty range? What should your function return then?',
             code='values = [2, 5, 8, 12, 16, 20, 25]\ntarget = 20\nlow, high = 0, len(values) - 1\nmid = (low + high) // 2\nprint(mid, values[mid])  # index 3 holds 12\n# Sorted order tells us target cannot be at or left of index 3.\nlow = mid + 1\nmid = (low + high) // 2\nprint(mid, values[mid])  # index 5 holds 20'),
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
             code="import unittest\nfrom core import merge_library\n\nclass TestMerge(unittest.TestCase):\n    def test_same_title_different_case(self):\n        records = [{\"title\": \"Hades\", \"minutes\": 30}, {\"title\": \"hades\", \"minutes\": 15}]\n        self.assertEqual(merge_library(records), {\"hades\": 45})", shell=True),
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
        text="SQL is how you ask a database questions. It's on your resume, it's what data and BI roles test first, and you'll use it in almost any engineering job. These quests use a small game-library database with three tables: players, games, and sessions (who played what, for how long, and when).\n\nYou write a single SELECT statement. Forge runs it against two different datasets and compares your rows (including their order) with the expected answer, so a query has to be truly correct, not just right for one set of data.\n\nA query reads in this order, even though you write SELECT first: FROM (which tables) → JOIN (connect them) → WHERE (filter rows) → GROUP BY (make groups) → HAVING (filter groups) → SELECT (pick columns) → ORDER BY (sort). When a query confuses you, read it in that order.",
        code="SELECT g.title, SUM(s.minutes) AS total      -- 6. pick columns\nFROM sessions AS s                            -- 1. start here\nJOIN games AS g ON g.id = s.game_id           -- 2. connect tables\nWHERE s.played_on >= '2026-10-01'             -- 3. filter rows\nGROUP BY g.id                                 -- 4. one row per game\nHAVING SUM(s.minutes) > 60                    -- 5. filter groups\nORDER BY total DESC, g.title;                 -- 7. sort"),
    "interview": dict(title="Interview gauntlet",
        text="These are classic entry-level interview problems. Treat each one like a real interview:\n1. Restate the problem and ask yourself about edge cases (empty input, duplicates, negatives).\n2. Describe a brute-force solution, even if it's slow.\n3. Improve it, and say why it's faster.\n4. Code it, then test it on a small example out loud.\n5. State the time and space complexity.\n\nAfter you clear one, come back in a few days and solve it from a blank file while talking out loud. Recall under light pressure is what interviews actually measure."),
    "test": dict(title="HackerRank practice",
        text="Online coding tests look different from Forge's usual quests. Nobody calls your function. You write a whole program: it reads its input with input(), works out the answer, and prints it. The site runs your program on hidden test cases and compares what you printed, exactly.\n\nThree habits win points:\n1. Read the input format first, and parse it before you think about the algorithm.\n2. Never prompt. input(\"Enter a number\") prints that text, and it counts as wrong output.\n3. Print only the answer. Remove debugging prints before you finish.\n\nEasy problems are worth doing quickly and correctly. The hidden tests aim at empty input, a single item, ties, negative numbers, and big inputs, so think about those before you run.\n\nThese quests are all open from the start, in any order. The timed test puts you under the real conditions: three problems, 60 minutes, no hints. The object-oriented chapter is separate practice on classes.",
        code="# Reading common input shapes\nn = int(input())                        # one number\nvalues = list(map(int, input().split()))  # a line of numbers\na, b = map(int, input().split())        # two numbers on a line\nfor _ in range(n):                      # n more lines\n    row = input().split()"),
    "hardware": dict(title="Hardware lab",
        text="These quests are the software side of embedded work: turning raw sensor readings into decisions. They use the same ideas as your capstone (barometric pressure and GPS) and run right here in the browser.\n\nTo try the real thing, get a Raspberry Pi Pico (or Pico W) starter kit with a breadboard, jumper wires, a push button, an LED, and a BMP280 barometric sensor (roughly $30–50 total). Install the MicroPython firmware, use the Thonny editor, and build in this order:\n1. Blink the LED. Then read the button and light the LED while it's pressed.\n2. Count button presses using your debounce logic from these quests.\n3. Read the BMP280 over I2C and print pressure every second.\n4. Convert pressure to altitude with your formula, smooth it with your moving average, and drive the LED as an alarm with hysteresis.\n\nWrite every line yourself. If you lose track of time doing this, embedded or test engineering may be your direction.",
        code="# MicroPython on a Pico: blink the onboard LED\nfrom machine import Pin\nimport time\n\nled = Pin(\"LED\", Pin.OUT)\nwhile True:\n    led.toggle()\n    time.sleep(0.5)"),
}


def check_examples():
    """Every example in teaching_more.py must run, apart from terminal commands."""
    for group in (PLAIN_ADD, PLAIN_NEW):
        for week, sections in group.items():
            for section in sections:
                if section.get("code") and not section.get("shell"):
                    with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
                        try:
                            exec(compile(section["code"], section["title"], "exec"), {"__name__": "__main__"})
                        except Exception as err:
                            raise SystemExit(f"Week {week} example '{section['title']}' fails: {err!r}")


def main():
    check_examples()
    path = Path(__file__).resolve().parent.parent / "dist" / "handbook.json"
    book = json.loads(path.read_text(encoding="utf-8"))
    plain = {w: PLAIN.get(w, []) + PLAIN_NEW.get(w, []) + PLAIN_ADD.get(w, []) for w in sorted({*PLAIN, *PLAIN_NEW, *PLAIN_ADD})}
    for unit in book["units"]:
        w = unit["week"]
        if w in plain:
            unit["plain"] = plain[w]
        if w in WATCH:
            label, url = WATCH[w]
            unit["watch"] = {"label": label, "url": url}
    book["questlines"] = QUESTLINES
    book["setup"] = SETUP
    write_text_atomic(path, json.dumps(book, indent=2, ensure_ascii=False))
    words = sum(len((s["text"] + " " + s.get("code", "")).split()) for v in plain.values() for s in v)
    print(f"Beginner teaching added to {len(plain)} weeks (~{words} words) and {len(QUESTLINES)} questline guides.")


if __name__ == "__main__":
    main()
