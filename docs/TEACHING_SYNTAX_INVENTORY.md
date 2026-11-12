# Teaching syntax inventory

Generated from the shipped chapter examples by `py checks/audit-teaching.py --write-inventory`.
Lists calls and syntax at their first executable teaching appearance; user-defined helper calls are included.
This is a review aid, not proof of comprehension or a complete dependency checker. Local terminal/framework blocks are reviewed separately in the chapter audit.

## Chapter 1: Start small

- Topic 1, **Read a Python instruction before writing one**: `print()`
- Topic 3, **Types and arithmetic have specific rules**: `int()`, `str()`, `type()`
- Topic 4, **Define a function, then call it**: `ribbon_length()`
- Topic 5, **Returning a value is different from printing it**: `give_length()`, `show_length()`
- Topic 7, **Branches and indentation decide what runs**: `weather_note()`
- Topic 8, **Build readable text with f-strings**: `f-string`
- Topic 9, **Connect files using imports**: `.floor()`, `ceil()`
- Topic 11, **Find the part of the test scaffold you should edit**: `.assertEqual()`, `class`

## Chapter 2: Make it repeatable

- Topic 1, **Lists, indexes, and empty input**: `len()`, `slice`
- Topic 2, **A method belongs to a particular value**: `.append()`, `.pop()`
- Topic 4, **Accumulators start before the loop**: `character_total()`
- Topic 5, **Filter into a separate list**: `sum()`
- Topic 7, **Two names are not two copies**: `.copy()`
- Topic 8, **String methods return new text**: `.join()`, `.lower()`, `.replace()`, `.split()`, `.strip()`
- Topic 9, **range and nested loops**: `list()`, `range()`
- Topic 10, **Unpack pairs before using enumerate or zip**: `enumerate()`, `zip()`
- Topic 11, **Read compact collection syntax after understanding loops**: `all()`, `any()`, `generator expression`, `list comprehension`

## Chapter 3: Think in collections

- Topic 2, **Membership, missing keys, and get**: `.get()`
- Topic 3, **Loop over keys or key/value pairs deliberately**: `.items()`
- Topic 5, **Create a set, then add or check one value**: `.add()`, `set()`
- Topic 6, **Set operations combine membership rules**: `sorted()`
- Topic 7, **Copy a dictionary without confusing names and objects**: `dict()`
- Topic 9, **Sort basic values before introducing sort keys**: `.sort()`
- Topic 11, **A lambda is a small alternative to def**: `lambda`

## Chapter 4: Build a game engine

- Topic 2, **min and max enforce a chosen bound**: `max()`, `min()`
- Topic 7, **Functions can hand results to other functions**: `describe_minutes()`, `minutes_from_hours()`
- Topic 8, **Protect executable code with the main guard**: `main()`

## Chapter 5: Handle messy inputs

- Topic 3, **Convert text deliberately and catch expected failures**: `parse_temperature()`, `try/except`
- Topic 4, **Validate a value after converting its representation**: `seat_rows()`
- Topic 5, **False is not the same as missing**: `bool()`
- Topic 6, **Short-circuit validation protects later operations**: `has_visible_text()`, `isinstance()`
- Topic 7, **raise communicates a failure to the caller**: `ValueError()`, `require_nonempty()`

## Chapter 6: Work with real data

- Topic 2, **JSON text becomes lists and dictionaries**: `.dumps()`, `.loads()`
- Topic 3, **Escape sequences and multiline data**: `repr()`
- Topic 4, **A text stream lets a parser read a string like a file**: `.StringIO()`, `.read()`, `.readline()`
- Topic 5, **Read CSV fields with DictReader**: `.DictReader()`, `float()`
- Topic 6, **Write CSV using a writer, not manual commas**: `.DictWriter()`, `.getvalue()`, `.writeheader()`, `.writerow()`
- Topic 7, **Paths describe names separately from file contents**: `PurePosixPath()`

## Chapter 7: Automate with care


## Chapter 8: Your first interview toolkit


## Chapter 9: Spot useful patterns


## Chapter 10: Make code maintainable

- Topic 1, **An object is state plus operations**: `Lamp()`
- Topic 2, **self means the particular object receiving the call**: `.adjust()`
- Topic 4, **Guard an invariant before changing state**: `.pour()`, `WaterJug()`
- Topic 8, **Inheritance is a later option, not a requirement**: `.turn_up()`, `QuietSpeaker()`, `super()`
- Topic 9, **Special methods connect objects to Python syntax**: `Marker()`

## Chapter 11: Ship a useful tool

- Topic 5, **CSV writing: let the library handle commas and quotes**: `.writer()`
- Topic 6, **Dictionary comprehensions and stable exports**: `dictionary comprehension`
- Topic 7, **A safe entry point: import without starting the program**: `.upper()`, `headline()`
- Topic 8, **Tests describe behavior, not the current implementation**: `.TestResult()`, `.run()`, `.wasSuccessful()`, `LetterTests()`, `first_letter()`

## Chapter 12: Prove your foundations


## Chapter 13: Work like a developer

- Topic 3, **argparse creates a parser object and declares options**: `.ArgumentParser()`, `.add_argument()`, `.parse_args()`

## Chapter 14: Test and debug deliberately

- Topic 1, **A test has arrange, act, and assert stages**: `twice_length()`
- Topic 2, **The test runner discovers methods, not individual assertions**: `.assertRaises()`, `LengthTests()`, `TypeError()`, `letters()`, `with`
- Topic 5, **An error object has a type and a message**: `MissingSeat()`, `seat_label()`
- Topic 6, **A fake dependency is an ordinary callable you control**: `clock()`, `show_time()`
- Topic 8, **Type hints and docstrings document an interface**: `frame()`

## Chapter 15: Handle real-world data

- Topic 3, **A regular expression describes a small text grammar**: `.fullmatch()`
- Topic 4, **Raw strings, captures, and replacement have separate meanings**: `.findall()`, `.sub()`
- Topic 5, **Calendar dates need a calendar parser**: `.fromisoformat()`, `.isoformat()`, `timedelta()`
- Topic 6, **Date presentation and timezone policies are explicit choices**: `.strftime()`, `date()`, `datetime()`
- Topic 7, **Money needs a representation and a precision policy**: `Decimal()`

## Chapter 16: Store and query data

- Topic 1, **Tables, rows, columns, and a schema**: `.close()`, `.connect()`, `.execute()`
- Topic 2, **A connection sends statements; a cursor holds results**: `.fetchall()`
- Topic 3, **Bind values with placeholders, including the one-item tuple**: `.fetchone()`
- Topic 4, **Insert several rows with executemany**: `.executemany()`
- Topic 7, **JOIN connects records through keys**: `.executescript()`
- Topic 9, **Foreign-key constraints protect relationships**: `.rollback()`
- Topic 10, **Transactions keep related changes together**: `.commit()`

## Chapter 17: Talk to services

- Topic 4, **Build query parameters with urlencode**: `urlencode()`
- Topic 5, **A fixture is controlled example data**: `fetcher()`, `show_status()`

## Chapter 18: Design maintainable Python

- Topic 2, **Safe defaults: omitted input is not shared state**: `envelope()`
- Topic 3, **Docstrings and type annotations are different tools**: `character_count()`
- Topic 4, **Fresh instances and composition**: `.announce()`, `.save()`, `MemoryRecorder()`, `Notifier()`
- Topic 5, **Modules and the import guard**: `entry_message()`
- Topic 6, **An iterator gives you one value at a time**: `iter()`, `next()`
- Topic 7, **yield creates a generator, not a returned list**: `positions()`, `yield`
- Topic 9, **Configuration: distinguish presence from truthiness**: `.update()`
- Topic 10, **Function arguments can be collected and unpacked**: `describe()`, `rectangle()`
- Topic 11, **Decorators: wrap a function in small steps**: `original()`, `welcome()`, `with_brackets()`
- Topic 12, **Dataclasses, properties, and validation**: `Parcel()`, `type annotation`
- Topic 13, **Context managers and cleanup**: `Notice()`

## Chapter 19: Broaden your problem-solving toolkit

- Topic 1, **Recursion: smaller calls and returning answers**: `letter_depth()`
- Topic 2, **Nested data and type-based decisions**: `reversed()`
- Topic 4, **deque: a queue that removes from the front**: `.popleft()`, `deque()`
- Topic 8, **A Node class and the reversal drawing**: `Link()`
- Topic 9, **Heaps: the smallest item is ready, not the whole list sorted**: `.heappop()`, `.heappush()`
- Topic 11, **Memoization is an optional extension with a contract**: `.cache_info()`, `badge_width()`, `lru_cache()`

## Chapter 20: Build a small backend


## Chapter 21: Make automation dependable

- Topic 3, **logging methods and formatting placeholders**: `.Formatter()`, `.LogRecord()`, `.format()`

## Chapter 22: Maintain and collaborate

- Topic 3, **Type hints help readers; adapters preserve callers**: `measurement_label()`

## Chapter 23: Ship and verify your work


## Chapter 24: Practice the entry-level transition

- Topic 7, **A useful test matrix is small but deliberate**: `deepcopy()`
