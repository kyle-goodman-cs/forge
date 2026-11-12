# Beginner teaching audit

Reviewed November 12, 2026. App cache version: 21.

## Why this audit was needed

The earlier learning-readiness audit established that examples and checks ran, but did not adequately establish that the course taught their prerequisites. The learner encountered unexplained `.add()`, `dict()`, and `lambda` in chapter 3. Reviewing the authored reading, compact references, worked examples, main practice contracts, and independent lab briefs exposed similar jumps across the course. Passing software tests did not establish teaching completeness.

## Scope and changes

All 24 main chapters receive replacement teaching in a deliberate order: explanation, a small separate example, expected output, a walkthrough where useful, and an understanding prompt. The reading now introduces library methods, argument conventions, vocabulary, and data shapes before combining them. Named functions precede lambda; simple sorts precede multi-part keys; ordinary loops precede comprehensions and generators. First-lab imports, tests, boundary cases, copies, and evidence are taught when first needed. Later tool and framework examples identify their local environment and setup.

Each chapter has numbered topics and a keyboard-accessible topic jump list. Practice pages place chapter teaching before the compact challenge introduction. Expected outputs and walkthroughs are visible alongside examples. Compact reference material remains after the teaching. Existing videos and source attribution remain available.

The 317 existing lesson IDs, exercise contracts, reference solutions, challenge cases, worker execution, progress schema, XP, and earlier lab work are preserved. Teaching examples use different function names and scenarios from that chapter's practice. This change does not edit the learner's lab folders.

## Chapter findings

- [Chapters 1-8](audit_01_08.md): foundations, collections, games, messy input, data files, automation, and early problem solving.
- [Chapters 9-16](audit_09_16.md): algorithm patterns, classes, tools, independent builds, developer workflow, testing, validation, and SQLite.
- [Chapters 17-24](audit_17_24.md): HTTP, advanced language features, graphs, APIs, batch imports, maintenance, CI, and independent rehearsal.
- [Syntax first-use inventory](TEACHING_SYNTAX_INVENTORY.md): generated from the shipped Python examples as a review aid.

## Validation results

- 245 teaching topics across all 24 chapters; 174 standalone Python examples with checked expected output and 13 labeled local illustrations.
- The full verifier passed 1,345 challenge cases, 24 worked examples, 180 executable teaching examples (174 chapter examples plus six existing optional OOP examples), 48 trace keys, and 434 simulated routes.
- Real Edge passed 144 chapter/theme/viewport checks: all 24 chapters at 390, 768, and 1440 pixels in light and dark themes. Topic jumps preserve the route, move keyboard focus, and leave practice tabs usable. No page errors or horizontal page overflow were found.
- Exact file hashes confirmed the curriculum, worker, traces, and all 24 lab ZIPs are unchanged. Existing backup and progress-safety checks passed.

## Verification and limits

The build executes the examples it actually ships and compares their printed output with the authored expected output. The course verifier repeats executable teaching in the bundled Python 3.12 runtime, in addition to its exercise, route, and progress-safety checks. The syntax audit checks all chapters, output fields, and separation from practice function names. Browser checks cover the new output/walkthrough/prompt layout and topic navigation.

These checks catch broken examples, misleading expected output, and rendering regressions. They cannot certify that every sentence will be sufficient for every learner. The chapter findings are a human review of the prerequisite sequence, not a claim of automatic comprehension verification. Terminal, Git, network, and installed-framework illustrations are distinguished from the examples executed in the browser; the supplied independent lab programs remain the learner's responsibility.

## References checked

The new prose and examples are original. Language and tool behavior were checked against [Python 3.12 data structures](https://docs.python.org/3.12/tutorial/datastructures.html), [control flow](https://docs.python.org/3.12/tutorial/controlflow.html), [sorting](https://docs.python.org/3.12/howto/sorting.html), [unittest](https://docs.python.org/3.12/library/unittest.html), [SQLite](https://docs.python.org/3.12/library/sqlite3.html), [pytest](https://docs.pytest.org/en/stable/getting-started.html), [FastAPI](https://fastapi.tiangolo.com/tutorial/first-steps/), and [GitHub Actions](https://docs.github.com/en/actions/get-started/quickstart) and its [Python workflow guide](https://docs.github.com/en/actions/tutorials/build-and-test-code/python). Existing chapter source links remain intact.
