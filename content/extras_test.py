"""Test-practice questline: whole programs in the HackerRank format, plus object-oriented quests.

PROGRAMS: the learner writes a full program that reads stdin with input() and prints the answer.
Each entry: t, tier (1 easy, 2 medium, 3 harder; a timed test takes one from each), task, sol,
broken (a realistic wrong program that must fail), cases (stdin strings; the first SAMPLES are
shown to the learner and the rest stay hidden), hints, concept.
Expected output comes from running `sol`. See add_programs in extras.py for the build rules.

OOP: ordinary function quests in the extras_python.py format, plus teach=[sections] shown on the
lesson page. Every teach code block must run on its own.
"""
import random

SAMPLES = 2
STARTER = "# Read the input with input(), work out the answer, and print it.\n"


def numbers(seed, n, low, high):
    rng = random.Random(seed)
    return [rng.randint(low, high) for _ in range(n)]


def sentence(seed, n):
    rng = random.Random(seed)
    words = ["ember", "forge", "anvil", "steel", "spark", "quest", "gear", "rune"]
    return " ".join(rng.choice(words) for _ in range(n))


def line(values):
    return " ".join(str(v) for v in values)


def sized(seed, n, low, high):
    values = numbers(seed, n, low, high)
    return f"{n}\n{line(values)}\n"


def leaderboard(seed, n):
    rng = random.Random(seed)
    rows = [f"p{rng.randint(1, 400)} {rng.randint(0, 60)}" for _ in range(n)]
    return "\n".join([str(n)] + rows) + "\n"


def sorted_values(seed, n):
    rng = random.Random(seed)
    return sorted(rng.sample(range(1, n * 5), n))


def range_queries(seed, n, q):
    rng = random.Random(seed)
    values = [rng.randint(-50, 50) for _ in range(n)]
    rows = []
    for _ in range(q):
        left = rng.randint(1, max(1, n // 4))
        right = rng.randint(max(left, n - n // 4), n)
        rows.append(f"{left} {right}")
    return f"{n} {q}\n{line(values)}\n" + "\n".join(rows) + "\n"


PROGRAMS = [
    dict(t="Count the vowels", tier=1,
         task="Print how many vowels are in a line of text. The vowels are a, e, i, o and u, in either case.\n\nInput: one line of text.\nOutput: one integer.",
         sol='text = input()\nprint(sum(1 for ch in text.lower() if ch in "aeiou"))\n',
         broken='text = input()\nprint(sum(1 for ch in text if ch in "aeiou"))\n',
         cases=["Forge\n", "sky\n", "AEIOU aeiou\n", "\n", "Hello, World!\n", "rhythm\n", "Queueing\n"],
         hints=["input() gives you the whole line as a string.", "Handle upper case once, up front, instead of listing both cases."],
         concept="A test program has no function to fill in and nobody calling it. It starts at the top, reads its input with input(), and prints the answer. input() always returns text."),
    dict(t="Reverse the words", tier=1,
         task="Print the words of a line in reverse order, separated by single spaces.\n\nInput: one line of words. There may be extra spaces.\nOutput: one line.",
         sol='print(" ".join(reversed(input().split())))\n',
         broken='print(input()[::-1])\n',
         cases=["one two three\n", "solo\n", "  spaced   out  words \n", "a b\n", "x y z w\n", "\n"],
         hints=["split() with no argument handles repeated spaces.", "Reverse the list of words, not the characters."],
         concept="Text problems are usually split, transform, join. The printed output must match exactly, so check the spacing."),
    dict(t="Sum and maximum", tier=1,
         task="Print the sum and the largest value of a list of integers.\n\nInput: the first line holds n. The second line holds n integers.\nOutput: the sum, a space, then the largest value.",
         sol='n = int(input())\nvalues = list(map(int, input().split()))\nprint(sum(values), max(values))\n',
         broken='n = int(input())\nvalues = list(map(int, input().split()))\nbest = 0\nfor v in values:\n    if v > best:\n        best = v\nprint(sum(values), best)\n',
         cases=["3\n1 2 3\n", "1\n7\n", "4\n-5 -2 -9 -1\n", "5\n0 0 0 0 0\n", "2\n100 -100\n", sized(11, 200, -500, 500)],
         hints=["list(map(int, input().split())) turns a line into a list of integers.", "What should your code do when every number is negative?"],
         concept="Most test inputs give a count, then the data. map(int, ...) applies int to every item, which turns a line of text into numbers in one step."),
    dict(t="Runner-up score", tier=1,
         task="Print the second-highest different score. If every score is the same, print -1.\n\nInput: the first line holds n. The second line holds n integers.\nOutput: one integer.",
         sol='n = int(input())\nscores = sorted(set(map(int, input().split())))\nprint(scores[-2] if len(scores) > 1 else -1)\n',
         broken='n = int(input())\nscores = sorted(map(int, input().split()))\nprint(scores[-2] if len(scores) > 1 else -1)\n',
         cases=["5\n2 3 6 6 5\n", "3\n4 4 4\n", "1\n9\n", "2\n1 2\n", "4\n-1 -2 -2 -3\n", "6\n10 10 9 9 8 8\n", sized(12, 150, 0, 40)],
         hints=["Try a list where the top score appears twice.", "A set removes repeats."],
         concept="Hidden tests love repeated values and lists with one item. Before you run, ask what happens when things tie."),
    dict(t="Most common word", tier=2,
         task="Print the most common word and how many times it appears. If several tie, print the one that comes first alphabetically.\n\nInput: one line of lowercase words.\nOutput: the word, a space, then the count.",
         sol='counts = {}\nfor word in input().split():\n    counts[word] = counts.get(word, 0) + 1\nbest = min(counts, key=lambda w: (-counts[w], w))\nprint(best, counts[best])\n',
         broken='counts = {}\nfor word in input().split():\n    counts[word] = counts.get(word, 0) + 1\nbest = max(counts, key=lambda w: counts[w])\nprint(best, counts[best])\n',
         cases=["red blue red\n", "solo\n", "b a\n", "z y x y z\n", "c c b b a\n", sentence(21, 300) + "\n", sentence(22, 900) + "\n"],
         hints=["Count first with a dictionary.", "A sort or min key can be a tuple, so ties can have their own rule."],
         concept="Counting with a dictionary is the most common pattern on these tests. Tie rules are where hidden tests catch people, so read them twice."),
    dict(t="Count the pairs", tier=2,
         task="Each number is a ticket colour. Two tickets of the same colour make a pair, and each ticket can be in only one pair. Print how many pairs you can make.\n\nInput: the first line holds n. The second line holds n integers.\nOutput: one integer.",
         sol='n = int(input())\ncounts = {}\nfor colour in input().split():\n    counts[colour] = counts.get(colour, 0) + 1\nprint(sum(c // 2 for c in counts.values()))\n',
         broken='n = int(input())\ncounts = {}\nfor colour in input().split():\n    counts[colour] = counts.get(colour, 0) + 1\nprint(sum(1 for c in counts.values() if c >= 2))\n',
         cases=["7\n1 2 1 2 1 3 2\n", "3\n1 2 3\n", "1\n5\n", "4\n9 9 9 9\n", "6\n1 1 1 1 1 1\n", sized(31, 400, 1, 12), sized(32, 1000, 1, 30)],
         hints=["What's the count of each colour?", "Four tickets of one colour make how many pairs?"],
         concept="Once you have counts, many problems become simple arithmetic on them. // is whole-number division."),
    dict(t="Sort the leaderboard", tier=2,
         task="Sort players by score, highest first. Players with equal scores go in alphabetical order.\n\nInput: the first line holds n. Each of the next n lines holds a name and a score.\nOutput: one name per line.",
         sol='n = int(input())\nrows = []\nfor _ in range(n):\n    name, score = input().split()\n    rows.append((name, int(score)))\nrows.sort(key=lambda row: (-row[1], row[0]))\nfor name, score in rows:\n    print(name)\n',
         broken='n = int(input())\nrows = []\nfor _ in range(n):\n    name, score = input().split()\n    rows.append((name, score))\nrows.sort(key=lambda row: row[0])\nrows.sort(key=lambda row: row[1], reverse=True)\nfor name, score in rows:\n    print(name)\n',
         cases=["3\nada 5\nbo 9\ncy 7\n", "2\nzed 3\namy 3\n", "1\nsolo 0\n", "3\nx 100\ny 20\nz 3\n", "4\nd 10\nc 9\nb 10\na 9\n", leaderboard(41, 120), leaderboard(42, 400)],
         hints=['Is "100" bigger than "20" as text?', "A negative number in a key sorts that part highest first."],
         concept="When input spans many lines, call input() once per line in a loop. Sorting by several rules uses a tuple key."),
    dict(t="Pairs that hit the target", tier=3,
         task="The list is sorted and has no repeats. Count the pairs of different positions whose values add up to the target.\n\nInput: the first line holds n and the target. The second line holds n integers.\nOutput: one integer.\n\nThe largest hidden test is big enough that checking every pair is too slow.",
         sol='n, target = map(int, input().split())\nvalues = list(map(int, input().split()))\nleft, right = 0, n - 1\ncount = 0\nwhile left < right:\n    total = values[left] + values[right]\n    if total == target:\n        count += 1\n        left += 1\n        right -= 1\n    elif total < target:\n        left += 1\n    else:\n        right -= 1\nprint(count)\n',
         broken='n, target = map(int, input().split())\nvalues = list(map(int, input().split()))\nleft, right = 0, n - 1\nwhile left < right:\n    total = values[left] + values[right]\n    if total == target:\n        print(1)\n        break\n    elif total < target:\n        left += 1\n    else:\n        right -= 1\nelse:\n    print(0)\n',
         cases=["5 6\n1 2 3 4 5\n", "3 100\n1 2 3\n", "2 3\n1 2\n", "1 2\n1\n", "6 7\n1 2 3 4 5 6\n", f"20000 50000\n{line(sorted_values(51, 20000))}\n"],
         hints=["Because the list is sorted, what does a total that's too small tell you?", "Start at both ends. Each step should rule out at least one value."],
         concept="Two pointers turn O(n²) into O(n) on sorted data. Real tests include large hidden inputs on purpose, so check how your approach grows."),
    dict(t="Range totals", tier=3,
         task="Answer q questions, each asking for the total of the values from position l to position r, inclusive. Positions start at 1.\n\nInput: the first line holds n and q. The second line holds n integers. Each of the next q lines holds l and r.\nOutput: one total per line.\n\nThe largest hidden test is big enough that re-adding each range is too slow.",
         sol='n, q = map(int, input().split())\nvalues = list(map(int, input().split()))\nprefix = [0]\nfor v in values:\n    prefix.append(prefix[-1] + v)\nanswers = []\nfor _ in range(q):\n    left, right = map(int, input().split())\n    answers.append(prefix[right] - prefix[left - 1])\nprint("\\n".join(map(str, answers)))\n',
         broken='n, q = map(int, input().split())\nvalues = list(map(int, input().split()))\nprefix = [0]\nfor v in values:\n    prefix.append(prefix[-1] + v)\nfor _ in range(q):\n    left, right = map(int, input().split())\n    print(prefix[right] - prefix[left])\n',
         cases=["3 2\n1 2 3\n1 2\n2 3\n", "1 1\n5\n1 1\n", "4 3\n-1 2 -3 4\n1 4\n2 2\n3 4\n", "5 1\n0 0 0 0 0\n1 5\n", range_queries(61, 50, 30), range_queries(62, 20000, 20000)],
         hints=["Could you work something out once, before any questions, that makes each answer instant?", "If you knew the running total up to every position, how would you get one range?"],
         concept="A prefix sum list stores the running total up to each position. It takes one pass to build, and then any range total takes a single subtraction."),
    dict(t="Longest run on a budget", tier=3,
         task="All values are zero or more. Find the longest stretch of neighbouring values whose total is at most k.\n\nInput: the first line holds n and k. The second line holds n integers.\nOutput: the length of that stretch, or 0 if there isn't one.\n\nThe largest hidden test is big enough that trying every stretch is too slow.",
         sol='n, k = map(int, input().split())\nvalues = list(map(int, input().split()))\nleft = 0\ntotal = 0\nbest = 0\nfor right, v in enumerate(values):\n    total += v\n    while total > k:\n        total -= values[left]\n        left += 1\n    best = max(best, right - left + 1)\nprint(best)\n',
         broken='n, k = map(int, input().split())\nvalues = list(map(int, input().split()))\ntotal = 0\nrun = 0\nbest = 0\nfor v in values:\n    if total + v > k:\n        total = 0\n        run = 0\n    if v <= k:\n        total += v\n        run += 1\n    best = max(best, run)\nprint(best)\n',
         cases=["5 5\n1 2 3 1 1\n", "3 1\n5 5 5\n", "4 0\n0 0 1 0\n", "6 7\n4 1 1 1 2 3\n", "5 100\n1 2 3 4 5\n", f"20000 500\n{line(numbers(71, 20000, 0, 30))}\n"],
         hints=["When the total goes over k, which end of the stretch should move?", "Each end only ever moves forward. How many steps is that in total?"],
         concept="A sliding window grows on the right and shrinks on the left. Each value enters and leaves once, so it's O(n) even with a loop inside a loop."),
]

OOP = [
    dict(t="Shapes that share a method", w=10, ch="test-oop", name="total_area", args="shapes",
         task='Write class Shape with an area() method that returns 0. Write Rectangle(Shape) with width and height, and Square(Rectangle), which takes one side. Write total_area(shapes). Each item is ["rect", w, h] or ["square", s]. Build the objects, and return the sum of their areas.',
         sol='class Shape:\n    def area(self):\n        return 0\n\nclass Rectangle(Shape):\n    def __init__(self, width, height):\n        self.width = width\n        self.height = height\n\n    def area(self):\n        return self.width * self.height\n\nclass Square(Rectangle):\n    def __init__(self, side):\n        super().__init__(side, side)\n\ndef total_area(shapes):\n    objects = []\n    for item in shapes:\n        if item[0] == "rect":\n            objects.append(Rectangle(item[1], item[2]))\n        else:\n            objects.append(Square(item[1]))\n    return sum(shape.area() for shape in objects)\n',
         cases=[[[["rect", 2, 3]]], [[["square", 4]]], [[["rect", 1, 1], ["square", 2]]], [[]]],
         requirements=["class"],
         hints=["Square needs no area method of its own.", "super().__init__(...) runs the parent's setup."],
         concept="A child class can pass its setup to the parent, so one rule lives in one place.",
         teach=[dict(title="What inheritance gives you",
                     text="Inheritance lets one class build on another. class Car(Vehicle) says a Car is a kind of Vehicle, so every Car automatically has Vehicle's methods.\n\nA child can do three things: use the parent's method as it is, replace it by writing its own, or extend it by calling super() and adding to the result.\n\nsuper().__init__(...) is the one to remember. When a child has its own __init__, the parent's setup doesn't run unless you call it.",
                     code='class Vehicle:\n    def __init__(self, wheels):\n        self.wheels = wheels\n\n    def describe(self):\n        return f"{self.wheels} wheels"\n\nclass Bike(Vehicle):\n    def __init__(self):\n        super().__init__(2)      # run the parent\'s setup\n\nprint(Bike().describe())         # 2 wheels: inherited')]),
    dict(t="Overriding with super()", w=10, ch="test-oop", name="payroll", args="rows",
         task='Write class Employee with name and salary, and pay(), which returns the salary. Write Manager(Employee), which also takes a bonus and whose pay() is the normal pay plus the bonus. Write payroll(rows). Each row is ["employee", name, salary] or ["manager", name, salary, bonus]. Return a dictionary of name to pay.',
         sol='class Employee:\n    def __init__(self, name, salary):\n        self.name = name\n        self.salary = salary\n\n    def pay(self):\n        return self.salary\n\nclass Manager(Employee):\n    def __init__(self, name, salary, bonus):\n        super().__init__(name, salary)\n        self.bonus = bonus\n\n    def pay(self):\n        return super().pay() + self.bonus\n\ndef payroll(rows):\n    staff = []\n    for row in rows:\n        if row[0] == "manager":\n            staff.append(Manager(row[1], row[2], row[3]))\n        else:\n            staff.append(Employee(row[1], row[2]))\n    return {person.name: person.pay() for person in staff}\n',
         cases=[[[["employee", "Ada", 10]]], [[["manager", "Bo", 10, 5]]], [[]], [[["employee", "A", 1], ["manager", "B", 2, 3]]]],
         requirements=["class"],
         hints=["Manager's __init__ takes one more value than Employee's.", "Calling super().pay() keeps the salary rule in one place."],
         concept="Calling the same method on different objects runs each object's own version. That's called polymorphism.",
         teach=[dict(title="Same call, different behavior",
                     text="When a list holds different kinds of objects, you can call the same method on all of them and each does its own thing. The calling code doesn't need an if for each type. That's polymorphism, and it's the main reason inheritance is useful.\n\nWhen a child's version only adds to the parent's, call super() instead of copying the code. If the parent's rule changes later, the child picks it up automatically.",
                     code='class Sound:\n    def play(self):\n        return "beep"\n\nclass LoudSound(Sound):\n    def play(self):\n        return super().play().upper() + "!"\n\nfor sound in [Sound(), LoudSound()]:\n    print(sound.play())')]),
    dict(t="An error with a name", w=14, ch="test-oop", name="check_usernames", args="names",
         task='Define class InvalidUsername(Exception). Write validate(name), which raises InvalidUsername with the message "too short" when name has fewer than 3 characters, "no spaces" when it contains a space, and otherwise returns the name. Check length first. Write check_usernames(names), which returns a list holding each valid name or the error message.',
         sol='class InvalidUsername(Exception):\n    pass\n\ndef validate(name):\n    if len(name) < 3:\n        raise InvalidUsername("too short")\n    if " " in name:\n        raise InvalidUsername("no spaces")\n    return name\n\ndef check_usernames(names):\n    out = []\n    for name in names:\n        try:\n            out.append(validate(name))\n        except InvalidUsername as err:\n            out.append(str(err))\n    return out\n',
         cases=[[["ada", "bo"]], [["a b c"]], [[]], [["", "abc", "x y"]], [["a b"]]],
         requirements=["class", "raise", "try"],
         hints=["The class body can be just pass.", "except InvalidUsername as err: gives you the message through str(err)."],
         concept="A custom exception carries a message like any other, and callers catch it by name.",
         teach=[dict(title="Making your own exception",
                     text="Built-in exceptions like ValueError describe general problems. A custom exception describes a problem in your program's own words, such as OutOfStock or PaymentDeclined.\n\nIt takes two lines: a class that inherits from Exception. You raise it like any other, and pass the message in the brackets. Whoever catches it can get that message with str(err).\n\nThe point is precision: except OutOfStock catches only that problem, while real bugs still crash loudly where you can see them.",
                     code='class TooHeavy(Exception):\n    pass\n\ndef pack(weight):\n    if weight > 20:\n        raise TooHeavy(f"{weight} kg is over the limit")\n    return "packed"\n\ntry:\n    print(pack(5))\n    print(pack(30))\nexcept TooHeavy as err:\n    print("Problem:", err)')]),
    dict(t="A family of errors", w=14, ch="test-oop", name="run_bank", args="balance, locked, amounts",
         task='Define BankError(Exception), then InsufficientFunds(BankError) and AccountLocked(BankError). Write withdraw(balance, locked, amount), which raises AccountLocked if locked is True, raises InsufficientFunds if amount is more than balance, and otherwise returns the new balance. Write run_bank(balance, locked, amounts). Apply each amount in order. Catch BankError around each one and count the failures. Return [final balance, failures].',
         sol='class BankError(Exception):\n    pass\n\nclass InsufficientFunds(BankError):\n    pass\n\nclass AccountLocked(BankError):\n    pass\n\ndef withdraw(balance, locked, amount):\n    if locked:\n        raise AccountLocked()\n    if amount > balance:\n        raise InsufficientFunds()\n    return balance - amount\n\ndef run_bank(balance, locked, amounts):\n    failures = 0\n    for amount in amounts:\n        try:\n            balance = withdraw(balance, locked, amount)\n        except BankError:\n            failures += 1\n    return [balance, failures]\n',
         cases=[[10, False, [3, 8, 2]], [10, True, [1, 1]], [0, False, []], [5, False, [5, 1]]],
         requirements=["class", "raise", "try"],
         hints=["class InsufficientFunds(BankError): makes it a kind of BankError.", "Catching the parent also catches every child."],
         concept="Exceptions are classes, so they can inherit. Catching a parent catches all of its children.",
         teach=[dict(title="Exception families",
                     text="Because exceptions are classes, they can inherit from each other. Give your program one base error, then a specific child for each problem.\n\nCallers then choose how precise to be. except NotFound handles one case. except StoreError handles anything from your program, while unrelated bugs still get through.\n\nWhen you have several except blocks, the first match wins, so put the most specific one first.",
                     code='class StoreError(Exception):\n    pass\n\nclass NotFound(StoreError):\n    pass\n\ntry:\n    raise NotFound("no such item")\nexcept StoreError as err:\n    print(type(err).__name__, err)   # NotFound no such item')]),
    dict(t="Records without the boilerplate", w=18, ch="test-oop", name="sort_books", args="rows",
         task='Use @dataclass to define Book with title, year, and rating (rating defaults to 0). Write sort_books(rows). Each row is [title, year] or [title, year, rating]. Build Book objects, sort them by rating highest first, then year oldest first, and return the titles.',
         sol='from dataclasses import dataclass\n\n@dataclass\nclass Book:\n    title: str\n    year: int\n    rating: int = 0\n\ndef sort_books(rows):\n    books = [Book(*row) for row in rows]\n    books.sort(key=lambda b: (-b.rating, b.year))\n    return [b.title for b in books]\n',
         cases=[[[["A", 2000, 5], ["B", 1990, 5]]], [[["A", 2000], ["B", 1990, 1]]], [[]], [[["A", 2001], ["B", 2000]]]],
         requirements=["dataclasses", "class"],
         hints=["Fields go inside the class as name: type.", "Book(*row) spreads a list into separate arguments."],
         concept="A dataclass gives you a real class from a list of fields. Fields with defaults must come last.",
         teach=[dict(title="What a dataclass does for you",
                     text="Many classes exist only to hold a few values, and writing __init__ for them is repetitive. @dataclass writes it for you. You list each field with a type, and Python creates __init__, a readable printout, and == that compares the values.\n\nThe type hints are required here, because they're how dataclass finds the fields. Defaults work as they do in functions, and fields with defaults come last.",
                     code='from dataclasses import dataclass\n\n@dataclass\nclass Song:\n    title: str\n    seconds: int = 180\n\na = Song("Intro")\nprint(a)                       # Song(title=\'Intro\', seconds=180)\nprint(a == Song("Intro", 180))  # True')]),
    dict(t="A dataclass that holds a list", w=18, ch="test-oop", name="order_summary", args="customer, lines",
         task='Use dataclasses to define Line with name, price and qty, and a total() method. Define Order with customer and lines, a list that defaults to empty using field(default_factory=list). Give Order an add(line) method and a total() method. Write order_summary(customer, lines). Each line is [name, price, qty]. Build the order and return [customer, number of lines, order total]. Two orders must never share a list.',
         sol='from dataclasses import dataclass, field\n\n@dataclass\nclass Line:\n    name: str\n    price: int\n    qty: int\n\n    def total(self):\n        return self.price * self.qty\n\n@dataclass\nclass Order:\n    customer: str\n    lines: list = field(default_factory=list)\n\n    def add(self, line):\n        self.lines.append(line)\n\n    def total(self):\n        return sum(line.total() for line in self.lines)\n\ndef order_summary(customer, lines):\n    order = Order(customer)\n    for name, price, qty in lines:\n        order.add(Line(name, price, qty))\n    return [order.customer, len(order.lines), order.total()]\n',
         cases=[["Ada", [["pen", 2, 3]]], ["Bo", []], ["Cy", [["a", 1, 1], ["b", 2, 2]]]],
         requirements=["dataclasses", "class"],
         hints=["from dataclasses import dataclass, field.", "field(default_factory=list) makes a new list for each object."],
         concept="A dataclass can hold other dataclasses. That's composition: an Order has Lines.",
         teach=[dict(title="Lists in a dataclass, and composition",
                     text="You saw in week 18 that a default list gets shared between calls. Dataclasses refuse to let you make that mistake: lines: list = [] is an error. Use field(default_factory=list) instead, which builds a new list for each object.\n\nDataclasses can also have methods and hold other objects. An Order has Lines; it isn't a kind of Line. When the words 'has a' fit better than 'is a', store the object in a field rather than inheriting.",
                     code='from dataclasses import dataclass, field\n\n@dataclass\nclass Team:\n    name: str\n    members: list = field(default_factory=list)\n\n    def size(self):\n        return len(self.members)\n\na, b = Team("red"), Team("blue")\na.members.append("Ada")\nprint(a.size(), b.size())   # 1 0: separate lists')]),
]
