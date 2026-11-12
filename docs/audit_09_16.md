# Teaching prerequisite audit: chapters 9-16

Reviewed November 12, 2026 against authored handbook summaries, beginner sections,
worked examples, all 32 core lesson concepts/examples/contracts/starters/hints and
extensions, and the eight independent lab briefs. This is a teaching-sequence
review, not evidence that a learner understands the material or that every
independent project has been implemented.

The replacement source is `content/teaching_09_16.py`. Each chapter now introduces
operations before combining them, uses separate original example domains, provides
deterministic expected stdout, and asks a small reasoning question. Existing
exercise IDs, contracts, solutions, and tests are not changed.

| Chapter | Observed gaps | Teaching changes |
|---|---|---|
| 9: patterns | Four algorithms were compressed into four short sections. `list(text)`, simultaneous assignment, `.join()`, `.pop()` return values and empty-stack errors, window boundaries, negative best-so-far initialization, and inclusive search intervals were assumed. | Eight sections separate vocabulary, one-step two-pointer swapping, stack operations and nesting order, slice/window arithmetic, actual-candidate initialization, binary-search probes, and invariant-based lab traces. No complete exercise algorithm is supplied. |
| 10: maintainability | The first class bundled syntax, initialization, instance state, method return values, mutation, and an invariant. `self` and local class definitions needed explanation. Inheritance, `super()`, dunder methods, and sorting ties appeared with little scaffolding. | Ten sections build from one instance/attribute to methods and two independent instances, then guarded state updates, pipelines, missing-versus-zero aggregation, named tuple sorting keys, inheritance call order, and special-method protocols. Optional mechanisms are explicitly distinguished from required exercise structure. |
| 11: tool building | Set/dict comprehensions, CSV writer buffers and quoting, dictionary iteration, main guard, and CLI expectations were introduced mainly in summaries. The test example imported a solution-like project function without a standalone runnable explanation. | Ten sections teach contracts, normalization, explicit uniqueness loops before comprehensions, aggregation policy, `csv.writer`/`io.StringIO`/`getvalue`/CRLF, deterministic export, import side effects and main guard, runnable unittest mechanics, and `sys.argv` command boundaries. A simple command-list model is sufficient before chapter-13 argparse. |
| 12: foundations checkpoint | “Less guidance” obscured prerequisites such as pair unpacking, splitting only once, allow-lists, two-pass processing, multi-field ranking, and result shapes. The compact worked example combined dictionary iteration, lambda, negation, tuple ties, and slicing. | Eight sections revisit the exact building blocks needed for independent planning, including the reasoning behind each operation, data shapes between stages, stable ranking before limits, and shorthand expanded into explicit steps. A changed-requirement exercise checks transfer without providing project answers. |
| 13: developer workflow | Terminal/process/environment boundaries, argparse objects, callback `type=int`, store_true semantics, hyphen-to-underscore conversion, two Git columns, missing versus invalid config, and SystemExit lacked a stepwise model. | Ten sections explain the command anatomy, OS-specific interpreter paths, module invocation, parser declaration versus parsing, flags, Git staging snapshots and status columns, branches/PRs, text configuration and conversion, exit codes/main guard, and ignored files/secrets. Browser parser examples use explicit argument lists. |
| 14: testing/debugging | Assertions, test discovery counts, pytest installation and features, exception objects, custom exceptions, injected callables, call-recording fakes, falsy existence checks, type hints, docstrings, and breakpoint workflow were assumed or compressed. | Ten sections teach arrange/act/assert; a standalone unittest exception test; exact per-OS pytest install/run commands; local decorator/parametrize/raises syntax; custom exception type/message; an executable fake with call evidence; existence versus truthiness; documented annotations; and local debugger/reproduction/regression workflow. |
| 15: real-world data | Regex raw strings/metacharacters and fullmatch results, Unicode versus ASCII classes, capture/substitution behavior, exact bool-versus-int type policy, date objects/durations, timezone distinction, Decimal construction and precision policy were underexplained. | Ten sections separate ordered record validation, exact types, one small regex grammar, raw strings/captures/replacement, calendar arithmetic, format/timezone policies, decimal money and cent conversion, Decimal sum starting values/generator syntax, positioned rejection reports, and lab scope. Examples use synthetic values unrelated to exercise identifiers. |
| 16: SQL | Connections/cursors/result tuples, single-item tuple commas, execute versus executemany, multi-statement setup, table/column vocabulary, aggregation and joins, NULL logic, foreign-key enforcement, transactions, persistence, and indexes were densely packed. | Eleven sections teach these layers separately. Runnable in-memory SQLite examples show parameter binding with a quote, row extraction, repeated inserts, filtering/order, grouping/HAVING, join multiplicity and missing children, COALESCE/NULL tests, foreign-key rejection, and rollback. File persistence, connection cleanup, constraints, indexing costs, and migration policy are explained explicitly. |

## Verification and limits

- Locally compiled the source and executed every non-local snippet in an isolated
  Python namespace, comparing captured stdout against its authored expected output.
- Checked example function names against every same-week core exercise contract;
  no exercise function is defined in the replacement teaching.
- All runnable examples are standalone. SQLite examples use only `:memory:` and
  close their connections. No teaching example contacts a network or changes the
  learner's repository, files, environment, or progress.
- The pytest file illustration is explicitly marked local because pytest is a
  third-party dependency installed in the learner's `.venv`; the text gives both
  Windows and macOS/Linux commands. Local debugger and Git procedures are taught
  as learner actions, not executed during a content build.
- Parent integration still needs full Pyodide verification, rendering checks, and
  real-browser visual checks. A passing snippet does not establish teaching
  completeness; future learner confusion should trigger focused content review.
- This audit preserves optional advanced concepts already present in summaries
  while labeling them clearly; it does not require inheritance, dunder methods,
  pytest, or complex architectures merely to complete simpler earlier exercises.
