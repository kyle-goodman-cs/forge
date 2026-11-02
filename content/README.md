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
