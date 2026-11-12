# Teaching audit: chapters 1–8

Reviewed November 12, 2026. This is a teaching-sequence review, not a claim that automated tests measure learner understanding.

Compared each chapter's previous plain teaching, compact reference sections, worked example and trace, goals, common mistakes, review questions, four core exercise contracts/starter/concept/example/hints, and independent lab instructions. Authored replacements live in `content/teaching_01_08.py`; exercise contracts, IDs, grading data, and learner project files are unchanged.

## Chapter 1 — Start small

The old lesson defined a function before fully explaining calls, arguments, punctuation, types, and indentation. Conversions and f-strings arrived late; local tests assumed imports, `self.assertEqual`, and the testing scaffold. The first lab asked for independent tests before those operations were taught.

The replacement begins with instructions and values, then assignment, expressions, types, arithmetic, definitions/calls, return versus print, comparisons/boolean operators, and branches. Each runnable example has explicit expected output. It teaches f-strings and newlines before local display work, imports before connecting files, and assertions before using the unittest scaffold. The scaffold section explains class/method indentation, `self`, `test_` discovery, actual versus expected values, and the difference between methods and assertion counts. It explains the role of the provided JSON/Path/subTest/argument-unpacking loader and identifies it as supplied infrastructure; file and OOP details are taught later. The independent lab remains an unsolved design task, with vocabulary such as streak, nonnegative, boundary, and contract defined.

## Chapter 2 — Make it repeatable

The previous additions introduced zip/enumerate and nested loops without fully introducing unpacking, `range`, or keyword arguments. The lab required input preservation and a trace without a concrete before/after copy model or an iteration table description. Compact references also named generators, any/all, pop, slicing, split, and join too briefly.

The replacement teaches list construction, indexing/slicing and emptiness, method mutation/return values, looping, accumulator placement, filtering versus transforming, count versus sum, and a concrete trace including a skipped item. It demonstrates aliasing and `.copy()` before asking learners to test input preservation. String operations are split into named stages with their return types and whitespace policies explained. `range` precedes nested loops; pair unpacking precedes enumerate/zip. Comprehensions and generators are explicitly optional after equivalent loop reasoning; any/all and empty cases are explained. Test guidance distinguishes empty input from nonempty no-match input and asks for unsorted cases to test order.

## Chapter 3 — Think in collections

The screenshot's `.add`, `dict`, and `lambda` each appeared inside examples with insufficient explanation. The sorting example additionally combined nested records, a keyword argument, an anonymous function, a tuple key, descending order, a tie policy, and a list comprehension. It also used an alphabetical tie rule while the browser exercise requires original input order for ties. Set guidance conflated deterministic sorting with preserving first appearance.

The replacement sequences dictionary literals and lookups; membership and get/default; iteration and items/unpacking; choosing collection types; set construction/add and its None return; set operations; aliases/shallow copies including a nested-list example; and nested-data access. Sorting begins with simple values and mutation differences. A named key function is passed as a value before lambda is introduced. Keyword-argument syntax is distinguished from assignment/comparison. Stability and original tie order are explained before optional explicit tuple tie breakers; the text warns that a secondary alphabetical key is wrong for a stable-tie contract. Comprehension extraction is explained separately. Set comprehensions are optional and show loss of multiplicity/order. Lab policies for missing items, removal, deterministic display, and caller mutation remain decisions the learner must make and test.

## Chapter 4 — Build a tiny game

The previous examples used `min`, `max`, multiple assignment, movement vectors, while loops, and interactive input with a large gap between state terminology and a complete local program. The compact guide named the `__main__` idiom without a worked explanation.

The replacement teaches state and transitions with a heater example, bound enforcement and its policy limits, coordinate conventions and unpacking, while conditions/progress, and the different scopes of break/continue/return. It labels terminal input as local and explains text conversion and keeping interaction outside browser functions. Function composition and the main guard are explained before game integration. Verification guidance covers impossible progress, unknown commands, termination, and testing without keyboard input. No game exercise solution is supplied.

## Chapter 5 — Handle messy inputs

The earlier text named errors and handlers but assumed that learners could distinguish conversion from validation, missing from falsy values, and expected rejection from unexpected defects. The lab required a real debugger breakpoint without operational instructions.

The replacement separates syntax/runtime/logic evidence, explains traceback reading and small reproductions, and walks through successful and failed conversions. It teaches range validation after parsing, None identity versus equality, short-circuiting and type prerequisites, raise/handler flow, and a concrete VS Code breakpoint/step workflow. It explicitly warns that bool is an int subclass for strict-type contracts. Regression tests and bug notes use independently expected results and red-to-green verification. The settings reader remains independent work.

## Chapter 6 — Work with real data

The previous code introduced `io.StringIO`, DictReader, Path attributes, file modes/context managers, argument escapes, and generator aggregation too quickly. The lab required CSV writing even though teaching focused on reading. Its run-on-another-fixture requirement lacked a distinction between source edits and configurable inputs.

The replacement separates in-memory values from serialized formats, explains JSON/Python spellings, string versus handle APIs, escapes and repr, streams, CSV header dictionaries and numeric conversion, DictWriter/headers/quoting and round trips, path attributes and POSIX parsing, local modes/encoding/context managers/current directory, shape validation, and generators versus explicit loops. Genuine local file recipes are labelled local and not executed as browser examples. The report pipeline explains each layer's responsibility and documents ways to choose a fixture without assuming a full argument parser has already been taught.

## Chapter 7 — Automate with care

The previous chapter was mostly high-level advice. Collision language did not sufficiently distinguish duplicate targets, occupied unchanged destinations, conflict groups, case sensitivity, and unsupported swaps/chains. The lab needed read-only directory inspection, rerun tests, and a precise preview-only scope.

The replacement defines plans as data, normalization as an explicit policy, source versus target identity, collision groups versus participant counts, and the need to retain unchanged directory names. It demonstrates idempotence with two sequential applications and contrasts non-idempotence. A local Path.iterdir/is_file/name recipe explains inspection without writes and deterministic ordering. Dry-run behavior and the later parser are distinguished from magical flag effects. Verification covers before/after directory listings, input snapshots, case assumptions, clean reruns, and documenting unsupported execution cases. This lab still performs no real rename.

## Chapter 8 — First interview toolkit

The previous code used ellipsis placeholders inside complexity demonstrations and described average lookup as if it were a universal constant-time guarantee. Search/index contracts, output sentinels, distinct positions, remembered-state meaning, and counting versus membership needed more careful sequencing.

The replacement starts with contract restatement and hand-worked examples. It reviews indexes/sentinels (including the danger of using -1 as a list index), defines n before Big-O, distinguishes time and additional space, demonstrates concrete loop-work counts, and explains average hash lookup assumptions. A first-location registry illustrates dictionary state without implementing the current exercises. Text comparison distinguishes multiplicity from membership and literal-space normalization from broader whitespace cleanup. Learners must still derive and implement search/pair/counting solutions independently, explain an invariant, and adapt a requirement rather than memorize supplied solutions.

## Validation and limits

- All non-local code examples are standalone; no same-week exercise function names are defined in teaching examples.
- Expected output is authored explicitly and checked against actual execution, including empty-output scaffolds. File/network access is excluded from unattended teaching examples; local recipes are labelled as such.
- Each section includes a short check-for-understanding prompt; the prompt is not an automatic understanding score.
- No local learner files were edited. Browser progress and grading contracts are unaffected.
- The provided test harness still contains library machinery beyond chapter 1; it is now identified and explained at the role level, while the exact edits beginners need are demonstrated. Full OOP and file-format internals are deliberately deferred to their later chapters.
- This review closes identified teaching gaps; it does not prove no learner will need clarification or establish mastery from passing checks. External videos remain supplementary, not a prerequisite for reading the written lessons.
