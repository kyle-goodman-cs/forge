# Forge curriculum sources

The published content is `dist/curriculum.json` and `dist/handbook.json`.
All lesson prose, game examples, acceptance specifications, and exercises are original Forge content. External references are linked in each unit and the source library.

`foundations.json` retains the original first 48 stable lesson IDs so existing saved progress remains attached to the same core challenges.

To regenerate the content and lab archives:

```text
py content/build_course.py
```

The website uses the original `forge-progress-v1` storage key. Optional lab and readiness fields have additive defaults; old backups remain importable. Browser checks assess test cases and a few explicit structural requirements, while local lab criteria and readiness notes are self-reported.

The browser runtime is Python 3.12 (Pyodide 0.27.7), with SQLite bundled separately. Local labs use a regular Python 3 environment. Course references may show newer Python documentation; the taught examples use compatible behavior.

`workspace_setup.py` authors the required first-time GitHub workflow and each kit's commit/push routine. `lab_setup.py` authors the chapter Python setup. Edit these sources and rebuild; keep confirmations distinct from independent verification.

## Teaching sequence

`teaching_01_08.py`, `teaching_09_16.py`, and `teaching_17_24.py` are the authoritative main-chapter teaching. `beginner.py` merges them into the handbook, retains the optional-track briefings and video references, and checks every executable example and its expected output. Earlier `PLAIN` / `teaching_more.py` content is retained as historical source, not appended to the new reading.

Each topic explains an idea before its `code` example. Use `output` for exact printed output, `walk` for an ordered explanation, and `check` for a short understanding question. Examples must run independently, use a different contract from that chapter's practice, and avoid assuming syntax introduced only later. `shell=True` is for explicitly local terminal, file, or installed-framework illustrations; do not use it to bypass a broken Python example.

After regenerating, run `py checks/audit-teaching.py --write-inventory` and `node checks/verify-course.cjs`. The first-use inventory supports manual prerequisite review; passing either script does not prove teaching completeness. See `docs/TEACHING_AUDIT.md`.
