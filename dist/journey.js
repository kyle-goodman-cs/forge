/* The quest book is the course. Every main page points to a named next action. */
function chapterReadingDone(week) {
  // Saved practice remains valid for learners who started before explicit briefings.
  return !!qGame().briefs[week] || chapterLessons(week).some(l => state.completed[l.id]);
}
function chapterQuestStep(week) {
  const u = handbook.units[week - 1], core = chapterLessons(week);
  if (!chapterReadingDone(week)) return { week, kind: 'brief', node: 'b', number: 1, title: 'Read the chapter lesson', description: 'Learn the ideas and trace a worked example. This happens here in your browser; nothing to install.', href: '#unit/' + week, label: 'Read chapter ' + week + ' lesson' };
  const lesson = core.find(l => !state.completed[l.id]);
  if (lesson) return { week, kind: 'lesson', node: 's' + lesson.session, number: lesson.session + 1, title: lesson.title, description: 'Practice quest ' + lesson.session + ' of 4. Read the idea, write and test your code, then explain and save it.', href: '#lesson/' + lesson.id, label: (state.drafts[lesson.id] ? 'Resume' : 'Open') + ' practice quest ' + lesson.session };
  if (!labDone(week)) return { week, kind: 'lab', node: 'lab', number: 6, title: u.lab.title, description: 'The four practice quests are saved. Build the independent program on your computer. The lab brief includes step-by-step setup.', href: '#lab/' + week, label: 'Open chapter ' + week + ' independent lab' };
  return { week, kind: 'complete', number: 6, title: 'Chapter ' + week + ' complete', description: 'Your practice quests and local lab evidence are recorded. Optional quests can wait; continue when you are ready.', href: week < 24 ? '#quests/' + (week + 1) : '#readiness', label: week < 24 ? 'Open chapter ' + (week + 1) : 'Review your evidence' };
}
function mainQuestNext() {
  for (let week = 1; week <= 24; week++) {
    if (chapterLessons(week).some(l => !state.completed[l.id]) || !labDone(week)) return chapterQuestStep(week);
  }
  return chapterQuestStep(24);
}
learningNext = mainQuestNext;
defaultChapter = () => mainQuestNext().week;

function mainTrail(week) {
  return [
    { node: 'b', title: 'Read the chapter lesson', detail: 'Learn the ideas and trace the example in your browser.', href: '#unit/' + week, done: chapterReadingDone(week) },
    ...chapterLessons(week).map(l => ({ node: 's' + l.session, title: 'Practice ' + l.session + ': ' + l.title, detail: 'Learn the idea → write & test → explain & save.', href: '#lesson/' + l.id, done: !!state.completed[l.id] })),
    { node: 'lab', title: 'Independent lab: ' + handbook.units[week - 1].lab.title, detail: 'Set up the kit, build independently, then record your test evidence.', href: '#lab/' + week, done: labDone(week) }
  ];
}
function chapterOrientation(week, number, description) {
  return `<div class="chapter-orientation"><a href="#quests/${week}">← Chapter ${week} quest book</a><span>Main quest ${number} of 6 · ${esc(description)}</span></div>`;
}
function chapterPicker(week) {
  return `<div class="chapter-picker"><label for="chapter-picker">Choose a chapter</label><select id="chapter-picker" class="form-input" data-journey-chapter>${weeks.map((w, i) => `<option value="${i + 1}" ${week === i + 1 ? 'selected' : ''}>${i + 1}. ${esc(w.title)}${!chapterUnlocked(i + 1) ? ' · later chapter' : ''}</option>`).join('')}</select></div>`;
}
function questNextPanel(step) {
  return `<section class="quest-next-panel"><div><span class="eyebrow">${step.kind === 'complete' ? 'MAIN TRAIL FINISHED' : 'DO THIS NEXT · MAIN QUEST ' + step.number + ' OF 6'}</span><h2>${esc(step.title)}</h2><p>${esc(step.description)}</p></div><a class="btn" data-main-quest href="${step.href}">${esc(step.label)} →</a></section>`;
}
renderHome = function () {
  questMigrate();
  const step = mainQuestNext(), info = levelInfo(), trail = mainTrail(step.week), done = trail.filter(n => n.done).length;
  return `${header('Your next chapter starts here.','Open your quest book and follow the highlighted main quest.')}<div class="flow-home"><section class="card next-step journey-home"><span class="eyebrow">CHAPTER ${step.week} OF 24 · ${esc(weeks[step.week - 1].title)}</span><h2>${esc(step.title)}</h2><p>${esc(step.description)}</p><a class="btn primary" href="#quests/${step.week}">Continue chapter ${step.week} in the quest book →</a><div class="journey-home-progress"><span>${done} / 6 main quests complete</span><span>Level ${info.level} · ${info.xp.toLocaleString()} XP</span></div></section><section class="card home-support"><h2>One chapter. One clear trail.</h2><ol class="home-trail"><li><strong>Read</strong><span>Understand the ideas and trace the worked example.</span></li><li><strong>Practice</strong><span>Finish four small quests in the browser. Each tells you how to run checks and save.</span></li><li><strong>Build</strong><span>Follow the local setup guide, then make the independent program.</span></li></ol><p>The quest book shows which steps are done, which comes next, and which quests are optional. You do not need to install anything to begin reading or practicing.</p><a href="#guide">First time? See exactly how Forge works →</a></section>${dueLessons().length ? `<p class="review-reminder"><a href="#review">${dueLessons().length} skills ready to review</a> · Optional warm-up before your next main quest.</p>` : ''}<p class="muted">Aim for four 45–60 minute sessions a week. A chapter or local lab can take longer. Your progress stays saved.</p></div>`;
};

const journeyQuestlineBase = renderQuestline;
renderQuestline = function (key) {
  const next = questlineNodes(key).find(n => n.state === 'open' && !n.done);
  const action = next ? next.lesson
    ? `<a class="btn" href="#lesson/${next.lesson.id}">Open next optional quest: ${esc(next.lesson.title)} →</a>`
    : `<button class="btn" data-node="b" data-week="${key}">Read this optional track's briefing →</button>` : '';
  return `<div class="optional-track-heading"><a href="#practice">← Optional practice library</a><p>Optional track. These quests do not block your main chapters.</p>${action}</div>${journeyQuestlineBase(key)}`;
};
renderQuests = function (value) {
  questMigrate();
  if (QL[value]) return renderQuestline(value);
  const week = Number.isInteger(Number(value)) && Number(value) >= 1 && Number(value) <= 24 ? Number(value) : defaultChapter();
  const u = handbook.units[week - 1], step = chapterQuestStep(week), nodes = chapterNodes(week), trail = mainTrail(week);
  const unlocked = chapterUnlocked(week), done = trail.filter(n => n.done).length;
  const previous = week > 1 ? chapterQuestStep(week - 1) : null;
  const prerequisite = !unlocked ? `<section class="course-notice"><h2>This chapter comes later</h2><p>Finish chapter ${week - 1}'s practice quests first. Your recommended next quest is in chapter ${mainQuestNext().week}.</p><a class="btn" href="#quests/${mainQuestNext().week}">Go to my current chapter →</a><p><a href="#path/week-${week}">Browse this chapter's material without following the trail</a></p></section>` : previous?.kind === 'lab' ? `<p class="course-notice">Your chapter ${week - 1} lab is still unfinished. <a href="#lab/${week - 1}">Finish that independent lab first →</a> This chapter remains available for saved progress and browsing.</p>` : '';
  return `<div class="quest-book-heading">${header('Quest book', 'Follow the numbered main trail. The highlighted quest is your next action.')}${chapterPicker(week)}</div>${prerequisite}<div class="main-quest-book"><header class="chapter-book-title"><div><span class="eyebrow">CHAPTER ${week} OF 24</span><h2>${esc(u.title)}</h2><p>${esc(weeks[week - 1].subtitle)}</p></div><div class="main-trail-count"><strong>${done}<span> / 6</span></strong><small>main quests complete</small></div></header>${unlocked ? questNextPanel(step) : ''}<section class="chapter-map"><div class="chapter-map-label"><strong>Your chapter map</strong><span>Select a node for its details. The numbered trail below opens each main quest directly.</span></div><div class="qb"><section class="qb-main"><div class="qb-canvas"><svg viewBox="0 0 1000 600" role="group" aria-label="Quest map for chapter ${week}">${qbDefs()}${qbLines(nodes)}${nodes.map(n => qbNode(week, n)).join('')}</svg></div><footer class="qb-legend"><span>Main trail: reading → four practice quests → independent lab</span><span>Pink trace quests are optional.</span></footer></section></div></section><section class="chapter-trail"><h2>The main trail</h2><p>Follow these six quests in order. Opening a practice quest does not complete it: pass checks, explain your approach, and save.</p><ol class="main-quest-list">${trail.map((n, i) => {
    const currentStep = unlocked && step.node === n.node, available = n.done || currentStep;
    const status = n.done ? 'DONE' : currentStep ? 'NEXT' : !unlocked ? 'LATER CHAPTER' : 'AFTER QUEST ' + i;
    return `<li class="main-quest-row ${n.done ? 'is-done' : currentStep ? 'is-next' : 'is-later'}" ${currentStep ? 'aria-current="step"' : ''}><span class="main-quest-number" aria-label="Quest ${i + 1}">${n.done ? '✓' : i + 1}</span><div><span class="quest-row-status">${status}</span><h3>${esc(n.title)}</h3><p>${esc(n.detail)}</p></div>${available ? `<a class="btn ${currentStep ? '' : 'light'}" href="${n.href}">${n.done ? 'Revisit' : n.node === 'b' ? 'Read lesson' : n.node === 'lab' ? 'Open lab brief' : 'Open practice ' + i} →<span class="sr-only"> ${esc(n.title)}</span></a>` : ''}</li>`;
  }).join('')}</ol></section><details class="chapter-optional"><summary>Optional quests for this chapter</summary><p>Use these when you want more repetition. Traces, drills, and bug hunts are not required to finish the main trail.</p>${sideQuestLinks(week)}<a href="#practice">Browse all optional tracks, including interview practice →</a></details></div>`;
};

function renderPracticeLibrary() {
  const groups = [['grind','Fundamentals drills'],['bugs','Debugging practice'],['sql','SQL'],['interview','Interview problems'],['test','Whole-program practice'],['oop','Object-oriented practice'],['hardware','Hardware maths']];
  return `${header('Optional practice library','Choose extra practice when you need it. Your main progress lives in the quest book.')}<p><a class="btn" href="#quests/${mainQuestNext().week}">Return to my main chapter →</a></p><div class="practice-library">${groups.map(([line,title]) => {
    // Some older track names differ; the chapter's kind also identifies its group.
    const entries = Object.entries(QL).filter(([,ch]) => line === 'oop' ? ch.kind === 'oop' : ch.line === line && ch.kind !== 'oop');
    if (!entries.length) return '';
    return `<details class="card optional-group"><summary>${title}<span>${entries.length} track${entries.length === 1 ? '' : 's'}</span></summary>${entries.map(([key,ch]) => `<a class="optional-track-link" href="#quests/${key}"><strong>${esc(ch.title)}</strong><span>${esc(ch.sub)}</span><small>${questlineLessons(key).filter(l => state.completed[l.id]).length} / ${questlineLessons(key).length} quests saved · ${questlineUnlocked(key) ? 'Open track →' : 'Open to see prerequisites →'}</small></a>`).join('')}</details>`;
  }).join('')}</div>`;
}

const journeyUnitBase = renderUnit;
renderUnit = function (week) {
  if (!handbook.units.some(u => u.week === week)) return journeyUnitBase(week);
  const lesson = chapterLessons(week).find(l => !state.completed[l.id]) || chapterLessons(week)[0];
  let html = journeyUnitBase(week);
  html = html.replace('<h1>Week ' + week + ':', '<h1>Chapter ' + week + ':');
  html = html.replace(/<a class="back" href="#path\/week-\d+">[^<]*<\/a>/, '');
  html = html.replace(/<a class="btn" href="#lesson\/\d+">Try the practice[^<]*<\/a>/, `<div class="reading-finish"><h3>Finished reading?</h3><p>Explain the questions above in your own words. This button records the reading quest and opens practice quest ${lesson.session}; you do not need to search for it elsewhere.</p><button class="btn" data-journey-action="finish-reading" data-week="${week}">Finish reading & open practice quest ${lesson.session} →</button></div>`);
  return chapterOrientation(week, 1, 'Read the chapter lesson') + html;
};

const journeyLessonBase = renderLesson;
renderLesson = function (lesson, review) {
  let html = journeyLessonBase(lesson, review);
  html = html.replace('class="card completion"', 'class="card completion" id="quest-completion"');
  html = html.replace('Make the win yours.', '3. Explain & save your quest');
  html = html.replace('My approach, and one edge case', 'My approach and one edge case (at least 30 characters)');
  const saveLabel = review ? 'Save review & return to skill review' : lesson.track ? 'Save quest & return to optional track' : 'Save quest & return to quest book';
  html = html.replace('id="complete-btn">Save session & continue', 'id="complete-btn">' + saveLabel);
  html = html.replace('<div class="rating-group">', '<div class="rating-group" role="group" aria-label="How independently could you do this again?">');
  html = html.replace('<button class="btn" data-action="complete"', '<div id="quest-completion-status"></div><button class="btn" data-action="complete"');
  html = html.replace('</pre></section><section class="card completion"', '</pre><button class="btn light small" id="explain-next" data-journey-action="show-completion" hidden>Checks passed: explain & save below →</button></section><section class="card completion"');
  if (review) return html;
  if (lesson.track) return `<div class="chapter-orientation"><a href="#quests/${lesson.chapter}">← ${esc(QL[lesson.chapter].title)}</a><span>Optional practice quest</span></div>` + html;
  html = html.replace('WEEK ' + String(lesson.week).padStart(2,'0') + ' · SESSION ' + lesson.session, 'CHAPTER ' + lesson.week + ' · PRACTICE ' + lesson.session + ' OF 4');
  html = html.replace('<strong>Week ' + lesson.week + ':', '<strong>Chapter ' + lesson.week + ':');
  html = html.replace('This week’s lesson', 'This chapter’s lesson');
  html = html.replace(/<a class="back" href="#path\/week-\d+">[^<]*<\/a>/, `<a class="back" href="#quests/${lesson.week}">← Chapter ${lesson.week} quest book</a>`);
  return chapterOrientation(lesson.week, lesson.session + 1, 'Practice quest ' + lesson.session + ' of 4') + `<div class="practice-directions"><strong>How to finish this quest</strong><ol><li>Read <b>1. Learn the idea</b>, then select <b>2. Write & test</b>.</li><li>Edit the starter code and select <b>Run checks</b>. Read any failed check and try again.</li><li>When checks pass, scroll to <b>3. Explain & save your quest</b>. Explain your approach, select an independence rating, then save.</li></ol><p>Your code saves automatically. The quest is complete only after you select <b>Save quest & return to quest book</b>.</p></div>` + html;
};

renderSetup = function (number = 1, requestedStep = 1) {
  const week = validWeek(number), setup = handbook.setup;
  const step = Number.isInteger(requestedStep) && requestedStep >= 1 && requestedStep <= setup.sections.length ? requestedStep : 1;
  const x = setup.sections[step - 1], last = step === setup.sections.length;
  return `${chapterOrientation(week, 6, 'Independent lab · computer setup')}${header('Set up chapter ' + week + ' lab', 'Follow one step at a time. Keep this page open beside VS Code.')}<div class="reading-page setup-wizard"><div class="setup-wizard-progress"><strong>Setup step ${step} of ${setup.sections.length}</strong><span>${Math.round(step / setup.sections.length * 100)}%</span></div><div class="setup-progress-track"><span style="width:${step / setup.sections.length * 100}%"></span></div>${platformPicker()}<section class="card learn-card setup-step" id="setup-step-${step}"><span class="learn-kicker">${step <= 1 ? 'START HERE' : 'SETUP STEP ' + step}</span><h2>${esc(x.title)}</h2>${paras(x.text)}${(x.links || []).map(l => `<p><a href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.label)} ↗</a> (opens a new tab)</p>`).join('')}${x.download ? `<a class="btn" href="labs/week-${String(week).padStart(2,'0')}.zip" download>Download chapter ${week} starter kit ↓</a><p class="download-explanation">After the download, look in your Downloads folder for <b>week-${String(week).padStart(2,'0')}.zip</b>. Extract it before continuing.</p>` : ''}${x.code ? `<p class="command-label">${esc(x.codeLabel || 'In the file hello.py:')}</p><pre>${esc(x.code)}</pre>` : ''}${x[setupPlatform] ? `<p class="command-label">Type in the VS Code terminal · ${platformName()}:</p><pre>${esc(x[setupPlatform])}</pre>` : ''}${x.after ? paras(x.after) : ''}</section><nav class="setup-step-navigation" aria-label="Setup steps">${step > 1 ? `<a class="btn light" href="#setup/${week}/${step - 1}">← Previous step</a>` : ''}<a class="btn" href="${last ? '#lab/' + week : '#setup/' + week + '/' + (step + 1)}">${last ? 'Setup finished: open chapter ' + week + ' lab' : 'Next: ' + esc(setup.sections[step].title)} →</a></nav><p class="setup-step-note">${last ? 'Return to the lab brief to build the program, test it, and record your evidence.' : 'Complete the instructions above on your computer, then select Next. You can come back to any step.'}</p><details class="setup-all-steps"><summary>Jump to a setup step</summary><ol>${setup.sections.map((s,i) => `<li><a href="#setup/${week}/${i + 1}" ${step === i + 1 ? 'aria-current="step"' : ''}>${esc(s.title)}</a></li>`).join('')}</ol></details><details class="card setup-help"><summary>Something went wrong? Open setup help</summary>${setup.problems.map(p => `<details class="setup-problem"><summary>${esc(p.title)}</summary>${paras(p.text)}</details>`).join('')}<p>Official references: <a href="https://code.visualstudio.com/docs/python/python-tutorial" target="_blank" rel="noopener noreferrer">VS Code Python setup</a> · <a href="https://docs.python.org/3/library/venv.html" target="_blank" rel="noopener noreferrer">Python environments</a>.</p></details><p><a href="#lab/${week}">Return to chapter ${week} lab brief →</a></p></div>`;
};

const journeyLabBase = renderLab;
renderLab = function (week) {
  week = validWeek(week);
  let html = journeyLabBase(week);
  html = html.replace('<h1>Week ' + week + ':', '<h1>Chapter ' + week + ':');
  html = html.replace('<a class="back" href="#projects">← Labs & projects</a>', '');
  html = html.replace(/href="#path\/week-\d+">Open this week's learning path[^<]*<\/a>/, `href="#quests/${week}">Return to chapter ${week} main trail →</a>`);
  html = html.replace('Step-by-step setup →', 'First lab? Start guided setup →');
  html = html.replace('<a class="btn light" href="labs/', '<a class="btn light" aria-label="Already set up? Download this chapter kit" href="labs/');
  return chapterOrientation(week, 6, 'Build the independent lab') + `<div class="lab-location-note"><strong>This quest happens on your computer.</strong><p>Keep this brief open in Forge. Write and run the program in VS Code. Come back here to check the acceptance criteria and record your evidence.</p></div>` + html;
};

const journeyPathBase = renderPath;
renderPath = function () {
  return `<p class="course-index-return"><a href="#quests/${mainQuestNext().week}">Looking for your next quest? Return to the main quest book →</a></p>` + journeyPathBase().replace('<h1>Your learning path</h1>', '<h1>Course index</h1>');
};
labContinuation = function (week) {
  const u = handbook.units[week - 1], remaining = u.lab.acceptance.filter((_,j) => !state.labChecks[`${week}-${j}`]).length;
  const count = (state.labNotes[week] || '').trim().length, done = labDone(week), coreDone = progressForWeek(week) === 4;
  return `<div role="status">${done ? '<strong>Lab evidence recorded.</strong><p>Keep your local program files and test results separately.</p>' : `<strong>To finish this lab quest</strong><p>${remaining ? 'Test and check ' + remaining + ' remaining acceptance ' + (remaining === 1 ? 'criterion' : 'criteria') + '.' : 'All acceptance criteria are checked.'} ${count < Q.labNoteMin ? 'Write ' + (Q.labNoteMin - count) + ' more characters in your evidence note (' + count + '/' + Q.labNoteMin + ').' : 'Your evidence note is long enough.'}</p><p>Record what you actually ran, the result, a bug or boundary you checked, and help used. Forge does not inspect local files.</p>`}</div>${done && coreDone ? `<a class="btn" href="${week < 24 ? '#quests/' + (week + 1) : '#readiness'}">${week < 24 ? 'Chapter ' + week + ' complete: open chapter ' + (week + 1) : 'All chapters recorded: review your evidence'} →</a>` : ''}<p><a href="#quests/${week}">${done && !coreDone ? 'Finish the remaining practice quests in chapter ' + week : 'Return to chapter ' + week + ' quest book'} →</a></p>`;
};

renderGuide = function () {
  return `${header('Start here: follow your quest book.','No installation needed for reading and browser practice.')}<div class="reading-page"><article class="card handbook-article"><h2>Your first chapter, click by click</h2><ol class="guide-steps"><li><strong>Open Quest book.</strong><p>Use Quest book in the navigation, or Continue chapter on Home. Look for the panel labeled <b>Do this next</b>. It always names the next main quest and has a button that opens it.</p></li><li><strong>Select Read chapter 1 lesson.</strong><p>Read the explanations. Predict the worked example's output, then use Run this example to check. At the end, select <b>Finish reading & open practice quest 1</b>. That records the reading quest and opens your practice page.</p></li><li><strong>Finish each of the four practice quests.</strong><p>Start with <b>1. Learn the idea</b>. Select <b>2. Write & test</b> to open the editor. Write your own code and select <b>Run checks</b>. A failed check shows what to investigate; edit and run again. When checks pass, select <b>Checks passed: explain & save below</b>. Write at least 30 characters explaining your approach and an edge case, select an independence rating, and save. The quest book then shows your next quest.</p></li><li><strong>Open the independent lab.</strong><p>After four saved practice quests, Do this next points to the lab. Keep its brief open in Forge, but write the program in VS Code on your computer. First lab? Select <b>Required: set up GitHub workspace</b>. Create and push your private learning repository with the one-time guide, then continue to the chapter's Python/lab setup. Work through one step at a time with Next. The guide includes the correct starter kit, commands, expected results, and troubleshooting.</p></li><li><strong>Verify the lab and continue.</strong><p>Build from the brief, run the program and tests, and try each acceptance criterion. Check only the criteria you verified, then write your evidence note. The page tells you what is still missing. Commit and push your chapter folder, paste the full commit ID, and confirm that GitHub shows the latest files. When the chapter's practice, lab evidence, and required GitHub records are complete, <b>Chapter complete: open the next chapter</b> appears.</p></li></ol><a class="btn" href="#quests/1">Open chapter 1 in the quest book →</a><h2>What is optional?</h2><p>Pink trace quests and the Optional practice library offer extra repetition, debugging, SQL, and interview problems. They do not block the main chapter. Videos and source links are extra explanations; you can follow the written lessons on their own.</p><h2>When you get stuck</h2><p>Write the input, expected result, and actual result. Trace the smallest failing example. Open Need a hint? after trying. Look up syntax when needed. Record generated answers or other help honestly, then try again later without copying.</p><h2>Your pace and backups</h2><p>Aim for four 45–60 minute sessions each week. Chapters, setup, and labs can take extra sessions. Forge saves browser work automatically. Export progress backups in Settings, and back up your local lab folders separately.</p></article><details class="card handbook-article"><summary>What each navigation section is for</summary><ul><li><b>Home:</b> resume your current chapter.</li><li><b>Quest book:</b> follow the main course, map, and numbered quests.</li><li><b>Labs & projects:</b> browse local project briefs; the quest book opens the right one when it is time.</li><li><b>Review:</b> revisit completed skills from a fresh editor.</li><li><b>Notebook:</b> keep scratch notes and previous explanations.</li><li><b>Course index:</b> browse all teaching and practice directly, outside the guided trail.</li></ul></details></div>`;
};

function updateQuestCompletion() {
  if (!current || current.testRun || !$('#quest-completion-status')) return;
  const code = $('#editor')?.value, passed = passedCode === code;
  const characters = ($('#explanation')?.value || '').trim().length, rated = !!rating;
  $('#quest-completion-status').innerHTML = `<ol class="completion-requirements"><li class="${passed ? 'met' : ''}">${passed ? '✓' : '1.'} Pass checks on the code currently in the editor.</li><li class="${characters >= 30 ? 'met' : ''}">${characters >= 30 ? '✓' : '2.'} Explain your approach and an edge case: ${characters}/30 characters minimum.</li><li class="${rated ? 'met' : ''}">${rated ? '✓' : '3.'} Select how independently you could do it again.</li></ol>`;
  const ready = passed && characters >= 30 && rated;
  $('#complete-btn').disabled = !ready;
  $('#completion-message').textContent = ready ? 'Ready. Select the Save button above to record completion and continue.' : 'Finish the items above to enable Save. Your draft is already saved automatically.';
  if ($('#explain-next')) $('#explain-next').hidden = !passed;
}
function journeyMounted(page, id) {
  if (page === 'lesson') updateQuestCompletion();
  if (['lesson','unit','setup','lab','workspace'].includes(page) && !(current?.track)) updateNav('quests');
}
function finishChapterReading(week) {
  if (!Number.isInteger(week) || week < 1 || week > 24) return '';
  const g = qGame();
  if (!g.briefs[week]) { g.briefs[week] = true; save(); grantXP('brief-' + week, Q.briefXP, 'Chapter reading complete'); }
  const next = chapterLessons(week).find(l => !state.completed[l.id]) || chapterLessons(week)[0];
  return '#lesson/' + next.id;
}
document.addEventListener('click', e => {
  const button = e.target.closest('[data-journey-action]');
  if (button?.dataset.journeyAction === 'finish-reading') {
    const href = finishChapterReading(Number(button.dataset.week));
    if (href) location.hash = href;
  }
  if (button?.dataset.journeyAction === 'show-completion') {
    $('#quest-completion').scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
    $('#explanation').focus({preventScroll:true});
  }
  if (e.target.closest('[data-rating]')) updateQuestCompletion();
});
document.addEventListener('change', e => {
  if (e.target.matches?.('[data-journey-chapter]')) location.hash = '#quests/' + validWeek(Number(e.target.value));
});
document.addEventListener('input', e => {
  if (['editor','explanation'].includes(e.target.id)) updateQuestCompletion();
});
