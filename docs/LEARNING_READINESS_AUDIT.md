# Forge learning-readiness audit

Reviewed November 9, 2026. App cache version: 19.

## Verdict

**Ready to begin learning with chapter 1.** No remaining blocker was found in the tested beginner path. Start practicing rather than waiting for another design pass. This is a judgment about being able to start and make progress, not a certification that completing Forge proves interview readiness.

## What was checked

- All 317 lesson IDs remain contiguous. The audit fixes did not change exercise contracts, reference solutions, or challenge cases.
- The verifier passed all 1,345 challenge cases, 24 worked examples, 72 executable teaching examples, 48 trace answer keys, and 426 simulated routes.
- Real Edge browser walkthroughs covered Home, chapter maps, explicit reading completion, editing, a genuine Python-worker failure, save requirements, local lab setup, downloads, evidence recording, and continuing to the next chapter.
- The same walkthrough passed on the public GitHub Pages version that was live when the audit began. The audit fixes received additional local browser checks before syncing.
- Responsive checks covered the main flow in both themes at phone, tablet, and desktop widths. Browser contexts were isolated from the learner's real saved progress.
- Each of the 24 lab ZIPs contained the expected files, had parseable Python, and ran its supplied tests. All unfinished starters produced assertion failures, with no import errors or zero-test discovery. The case data matched the chapter's checkpoint.
- A newly extracted first lab successfully created a virtual environment and ran the setup greeting. Its unfinished checkpoint then failed as the instructions describe.
- Early teaching and lab transitions were reviewed closely; course goals, teaching topics, and lab progression were inspected across the 24 chapters. Same-week teaching and worked examples did not define the core practice functions by name.
- Existing automated checks also exercised backup compatibility, snapshots, damaged-save recovery, full-storage handling, two-tab warnings, timed tests, and review/XP behavior.

Successful grading states used isolated test fixtures for UI checks. The real interpreter separately verified the authored reference solutions; this audit does not supply exercise solutions to the learner.

## Findings fixed

| Finding | Change | Evidence |
|---|---|---|
| A saved record could be valid JSON but contain unusable fields, such as `completed: null` or `events: [null]`. This produced a misleading connection error instead of recovery. | Added startup shape checks before loading the saved state. Invalid records use the existing raw-copy recovery path. Missing optional fields in older saves remain supported. | Real browser reproduction now reaches Home with a recovery notice. Regression checks cover malformed fields, preserved original data, older minimal saves, and blocked saves when a recovery copy cannot be written. |
| The first independent lab needs functions from `core.py` inside `main.py`, but that connection was not explained clearly enough during setup. | Setup step 7 now explains imports, replacing an example name with the learner's function name, keeping files together, and the difference between importing and calling. | Rebuilt handbook and full verifier passed; setup remains one step at a time. |
| Chapter 4 asks the learner to build a terminal game, but its main teaching did not explain `input()`. | Added a separate local greeting example, text-versus-number behavior, and guidance to keep terminal input outside the browser function quests. Clarified the finite-list loop explanation too. | The interactive example is explicitly marked as a local illustration; existing executable teaching checks still pass. |
| Downloaded lab READMEs assumed Forge was running at a local address. Hosted learners could follow that address to a site that was not running. | All 24 kits now tell learners how to return to the Forge tab and open their chapter's guided setup. | Rebuilt ZIPs checked for portable guidance. |

## What passing does and does not establish

- **Browser practice:** checks demonstrate behavior for supplied cases and selected structural rules. They do not prove every edge case, complexity claim, or explanation is correct.
- **Independent labs:** the program, tests, and acceptance criteria are meaningful practice, but completion is self-reported. Keep actual commands, outputs, files, and help used. Ask for a review of an attempt when unsure.
- **Understanding:** XP, checkmarks, and explanation length cannot assess whether an explanation is sound. Rebuild later, change a requirement, and explain the result aloud.
- **Later chapters:** development tools, APIs, services, and collaboration require additional time and documentation. This audit did not manually implement every project or establish that all third-party tutorials remain unchanged.
- **Interview preparation:** Forge includes algorithms, debugging, whole-program tests, and project communication. Unseen problems and spoken mock interviews still matter; course completion is not a job-readiness score.

## First session

1. Open Forge using the desktop shortcut and stay with the same browser/address for saved progress.
2. Select **Continue chapter 1 in the quest book**, then **Read chapter 1 lesson**.
3. Read and trace the examples. Finish the reading quest and attempt practice quest 1 yourself.
4. If you pass, explain your reasoning and save. If you are stuck, investigate one failing example or use the hint ladder honestly.
5. Export a progress backup after the session. Local setup can wait until the independent lab; it can take a separate session.

Do not rush through the four practice quests or expect to finish a chapter in one sitting. Evidence that you can reason, debug, and change a program is the goal.
