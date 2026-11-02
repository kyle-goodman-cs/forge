'use strict';
/* Forge quest layer (edition 3): quest book, power level, earned help, predict-then-run.
   Loaded after app.js and traces.js. All state lives in state.game inside the existing
   forge-progress-v1 record, so older backups and saved progress keep working. */

const Q = {
  lessonXP: 100, checkpointXP: 150, hintRate: [1, 0.6, 0.35],
  reviewXP: 30, briefXP: 10, labXP: 250, traceXP: [15, 8, 3],
  predXP: 3, predPerfect: 5, predCap: 30,
  trackXP: { drill: 40, bug: 80, sql: 80, interview: 100, hardware: 80 },
  hint1Fails: 2, solutionMinutes: 20, bountyHours: 48, diagMin: 20, labNoteMin: 80
};
const RANKS = [[25, 'Forgemaster'], [20, 'Architect'], [15, 'Engineer'], [10, 'Artificer'], [5, 'Tinkerer'], [1, 'Apprentice']];
const QICON = {
  brief: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2ZM4 19V5M8 7h7M8 11h5',
  lesson: 'm8 7-5 5 5 5M16 7l5 5-5 5M13.5 5l-3 14',
  checkpoint: 'M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6ZM9 12l2 2 4-4',
  lab: 'M3 8h12a5 5 0 0 0 5-3v6h-4l-2 4h3v3H7v-3h3l-2-4H3ZM10 15h4',
  trace: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
  lock: 'M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5Z',
  check: 'm5 12 4 4 10-10',
  redo: 'M4 12a8 8 0 1 0 2.3-5.7M4 4v5h5',
  drill: 'M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12',
  bug: 'M8 9h8v6a4 4 0 0 1-8 0ZM12 9v10M9.5 5.5 11 9M14.5 5.5 13 9M4 11h4M16 11h4M4.5 17l3.5-1.5M19.5 17 16 15.5',
  sql: 'M4 6c0-2.7 16-2.7 16 0v12c0 2.7-16 2.7-16 0ZM4 6c0 2.7 16 2.7 16 0M4 12c0 2.7 16 2.7 16 0',
  interview: 'M4 5h16v11H9l-5 4ZM8 9h8M8 12h5',
  hardware: 'M7 7h10v10H7ZM10 10h4v4h-4ZM9 3v4M15 3v4M9 17v4M15 17v4M3 9h4M3 15h4M17 9h4M17 15h4'
};
const QL = {
  'grind-1': { line: 'grind', kind: 'drill', title: 'Practice grind I', sub: 'Drills for weeks 1–2: values, decisions, loops, lists, strings' },
  'grind-2': { line: 'grind', kind: 'drill', title: 'Practice grind II', sub: 'Drills for weeks 3–4: dictionaries, sets, sorting, game state' },
  'grind-3': { line: 'grind', kind: 'drill', title: 'Practice grind III', sub: 'Drills for weeks 5–6: messy input, JSON, CSV, paths' },
  'grind-4': { line: 'grind', kind: 'drill', title: 'Practice grind IV', sub: 'Drills for weeks 7–8: automation and first interview patterns' },
  'bugs-1': { line: 'bugs', kind: 'bug', title: 'Bug hunt I', sub: 'Broken code using weeks 1–4: find it, name it, fix it' },
  'bugs-2': { line: 'bugs', kind: 'bug', title: 'Bug hunt II', sub: 'Broken code using weeks 5–8' },
  'bugs-3': { line: 'bugs', kind: 'bug', title: 'Bug hunt III', sub: 'Broken code using weeks 9–12' },
  'sql-1': { line: 'sql', kind: 'sql', title: 'SQL I', sub: 'SELECT, WHERE, aggregates, GROUP BY, HAVING, CASE', chain: true },
  'sql-2': { line: 'sql', kind: 'sql', title: 'SQL II', sub: 'JOINs, LEFT JOIN, subqueries, CTEs, window functions', chain: true },
  'int-1': { line: 'interview', kind: 'interview', title: 'Interview gauntlet I', sub: 'Classic screening problems', chain: true },
  'int-2': { line: 'interview', kind: 'interview', title: 'Interview gauntlet II', sub: 'Patterns, graphs, heaps, and dynamic programming', chain: true },
  'hw-1': { line: 'hardware', kind: 'hardware', title: 'Hardware lab', sub: 'Sensors, signals, and GPS: the software side of embedded' }
};
const PHASE_ICON = {
  Foundations: 'M12 3 3 8v8l9 5 9-5V8ZM3 8l9 5 9-5M12 13v8',
  Games: 'M6 8h12a4 4 0 0 1 4 4v2a4 4 0 0 1-7 2.5H9A4 4 0 0 1 2 14v-2a4 4 0 0 1 4-4ZM7 11v4M5 13h4M16 12h.01M18 14h.01',
  Automation: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1',
  Interviews: 'M4 5h16v11H9l-5 4Z',
  Projects: 'M14 4l6 6-3 3-6-6ZM11 7l-8 8 3 3 8-8',
  'Developer tool': 'M3 5h18v14H3ZM7 9l3 3-3 3M12 15h5',
  Engineering: 'M14.5 4.5a5 5 0 0 0-6 6L3 16l5 5 5.5-5.5a5 5 0 0 0 6-6l-3 3-3-2-1-3Z',
  Data: 'M3 5h18v14H3ZM3 10h18M9 5v14',
  Databases: 'M4 6c0-2.7 16-2.7 16 0v12c0 2.7-16 2.7-16 0ZM4 6c0 2.7 16 2.7 16 0M4 12c0 2.7 16 2.7 16 0',
  APIs: 'M9 2v6M15 2v6M6 8h12v4a6 6 0 0 1-12 0ZM12 18v4',
  Backend: 'M4 4h16v6H4ZM4 14h16v6H4ZM8 7h.01M8 17h.01',
  'Team practice': 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 20a6 6 0 0 1 12 0M16 5.2a3 3 0 0 1 0 5.6M21 20a6 6 0 0 0-3.5-5.4',
  Portfolio: 'M12 3l2.8 5.8 6.2.9-4.5 4.4 1 6.3L12 17.5l-5.5 2.9 1-6.3L3 9.7l6.2-.9Z',
  Readiness: 'M5 21V4M5 4h12l-2 4 2 4H5'
};
const LAYOUT = { b: [92, 300, 40], s1: [252, 300, 35], s2: [412, 168, 35], s3: [572, 300, 35], s4: [738, 168, 42], lab: [898, 312, 58], t1: [402, 478, 27], t2: [722, 478, 27] };

let questScroll = { side: 0, sideLeft: 0, chapters: 0, win: 0, onQuests: false };
let questGoPending = false, questPred = [], questTimerId = null, questFromMap = false, questJustDone = null, questMigrationNote = null, questDiagOpen = 0, questSolutionWasOpen = false, questModalDirty = false;

/* ---------- state ---------- */
function qNow() { return Date.now(); }
function qHash(s) { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return h; }
function defaultGame() { return { awards: {}, bounties: {}, attempts: {}, revealed: {}, briefs: {}, qbriefs: {}, traces: {}, migrated: false }; }
function qGame() {
  if (!state.game || typeof state.game !== 'object' || Array.isArray(state.game)) state.game = defaultGame();
  const g = state.game;
  for (const k of ['awards', 'bounties', 'attempts', 'revealed', 'briefs', 'qbriefs', 'traces']) if (!g[k] || typeof g[k] !== 'object' || Array.isArray(g[k])) g[k] = {};
  if (typeof g.migrated !== 'boolean') g.migrated = false;
  return g;
}
function sanitizeGame(raw) {
  const g = defaultGame();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return g;
  const fin = v => Number.isFinite(v);
  const lessonId = k => /^\d+$/.test(k) && Number(k) >= 1 && Number(k) <= lessons.length;
  for (const [k, v] of Object.entries(raw.awards || {})) if (/^[a-z]+-[\w-]{1,40}$/.test(k) && v && fin(v.xp) && v.xp >= 0 && v.xp <= 2000) g.awards[k] = { xp: Math.round(v.xp), at: fin(v.at) ? v.at : 0 };
  for (const [k, v] of Object.entries(raw.bounties || {})) if (lessonId(k) && v && fin(v.due) && fin(v.created)) g.bounties[k] = { due: v.due, created: v.created };
  for (const [k, v] of Object.entries(raw.attempts || {})) if (/^r?\d+$/.test(k) && v && typeof v === 'object') g.attempts[k] = {
    fails: Number.isInteger(v.fails) && v.fails >= 0 ? Math.min(v.fails, 9999) : 0,
    started: fin(v.started) ? v.started : 0, lastFail: fin(v.lastFail) ? v.lastFail : 0, lastPred: fin(v.lastPred) ? v.lastPred : 0,
    hint1Fails: Number.isInteger(v.hint1Fails) ? v.hint1Fails : undefined,
    diag: Array.isArray(v.diag) ? v.diag.filter(d => typeof d === 'string').slice(0, 2).map(d => d.slice(0, 600)) : []
  };
  for (const [k, v] of Object.entries(raw.revealed || {})) if (lessonId(k) && v === true) g.revealed[k] = true;
  for (const [k, v] of Object.entries(raw.briefs || {})) if (/^([1-9]|1\d|2[0-4])$/.test(k) && v === true) g.briefs[k] = true;
  for (const [k, v] of Object.entries(raw.qbriefs || {})) if (['grind', 'bugs', 'sql', 'interview', 'hardware'].includes(k) && v === true) g.qbriefs[k] = true;
  const traceIds = new Set((typeof QUEST_TRACES !== 'undefined' ? QUEST_TRACES : []).map(t => t.id));
  for (const [k, v] of Object.entries(raw.traces || {})) if (traceIds.has(k) && v && typeof v === 'object') g.traces[k] = { tries: Number.isInteger(v.tries) ? Math.min(v.tries, 999) : 0, done: v.done === true, xp: fin(v.xp) ? v.xp : 0, revealed: v.revealed === true };
  g.migrated = raw.migrated === true;
  return g;
}

/* ---------- XP and levels ---------- */
function lessonXP(l) { return l.track ? Q.trackXP[l.track] : l.checkpoint ? Q.checkpointXP : Q.lessonXP; }
function totalXP() { return Object.values(qGame().awards).reduce((s, a) => s + (a.xp || 0), 0); }
function levelInfo(xp = totalXP()) {
  let level = 1, need = 100, rem = xp;
  while (rem >= need) { rem -= need; level++; need = 100 + 30 * (level - 1); }
  return { level, into: rem, need, xp, rank: RANKS.find(([min]) => level >= min)[1] };
}
function afterGain(before, xp, label) {
  refreshHUD();
  questToast('+' + xp + ' XP', label);
  const info = levelInfo();
  if (info.level > before) setTimeout(() => questToast('LEVEL ' + info.level, info.rank + ' · keep forging', 'level'), 900);
}
function grantXP(key, xp, label) {
  const g = qGame();
  if (g.awards[key] || !(xp > 0)) return 0;
  const before = levelInfo().level;
  g.awards[key] = { xp: Math.round(xp), at: qNow() };
  save(); afterGain(before, Math.round(xp), label);
  return Math.round(xp);
}
function addCappedXP(key, gain, cap, label) {
  const g = qGame(), prev = g.awards[key]?.xp || 0, add = Math.min(gain, cap - prev);
  if (add <= 0) return 0;
  const before = levelInfo().level;
  g.awards[key] = { xp: prev + add, at: qNow() };
  save(); afterGain(before, add, label);
  return add;
}
function questToast(big, small, kind = 'xp') {
  if (typeof document.createElement !== 'function' || !document.body) return;
  let box = document.querySelector('#quest-toasts');
  if (!box || !box.appendChild) { box = document.createElement('div'); box.id = 'quest-toasts'; box.setAttribute('aria-live', 'polite'); document.body.appendChild(box); }
  const el = document.createElement('div');
  el.className = 'qt qt-' + kind;
  el.innerHTML = `<strong>${esc(big)}</strong><span>${esc(small)}</span>`;
  box.appendChild(el);
  setTimeout(() => el.classList.add('out'), kind === 'level' ? 3400 : 2400);
  setTimeout(() => el.remove(), kind === 'level' ? 4000 : 3000);
}

/* ---------- bounties and migration ---------- */
function bountyList() {
  return Object.entries(qGame().bounties).map(([id, b]) => ({ lesson: lessons[Number(id) - 1], ...b, ready: b.due <= qNow() })).filter(b => b.lesson).sort((a, b) => a.due - b.due);
}
function fmtWait(ms) { const h = Math.max(1, Math.ceil(ms / 3600000)); return h >= 24 ? Math.ceil(h / 24) + 'd' : h + 'h'; }
function createBounty(id) { const g = qGame(); if (g.awards['lesson-' + id]) return; g.bounties[id] = { due: qNow() + Q.bountyHours * 3600000, created: qNow() }; save(); }
function questMigrate() {
  const g = qGame();
  if (g.migrated || !lessons.length || !handbook) return;
  let xp = 0, bounties = 0;
  for (const l of lessons) {
    const c = state.completed[l.id];
    if (!c) continue;
    g.briefs[l.week] = true;
    if (!c.assisted && !g.awards['lesson-' + l.id]) { g.awards['lesson-' + l.id] = { xp: lessonXP(l), at: c.at || qNow() }; xp += lessonXP(l); }
    else if (c.assisted && !g.awards['lesson-' + l.id] && !g.bounties[l.id]) { g.bounties[l.id] = { due: qNow(), created: qNow() }; bounties++; }
  }
  for (let w = 1; w <= 24; w++) if (labDone(w) && !g.awards['lab-' + w]) { g.awards['lab-' + w] = { xp: Q.labXP, at: qNow() }; xp += Q.labXP; }
  g.migrated = true; save();
  if (xp || bounties) questMigrationNote = { xp, bounties };
}

/* ---------- chapters and nodes ---------- */
function chapterLessons(w) { return lessons.filter(l => !l.track && l.week === w).sort((a, b) => a.session - b.session); }
function chapterTraces(w) { return (typeof QUEST_TRACES !== 'undefined' ? QUEST_TRACES : []).filter(t => t.week === w); }
function labDone(w) {
  const u = handbook?.units?.[w - 1];
  if (!u) return false;
  return u.lab.acceptance.every((_, j) => state.labChecks[`${w}-${j}`]) && (state.labNotes[w] || '').trim().length >= Q.labNoteMin;
}
function chapterUnlocked(w) {
  if (w <= 1) return true;
  const prev = chapterLessons(w - 1).at(-1);
  return !!(prev && state.completed[prev.id]) || chapterLessons(w).some(l => state.completed[l.id]) || !!qGame().briefs[w];
}
function chapterNodes(w) {
  const ls = chapterLessons(w), ts = chapterTraces(w), u = handbook.units[w - 1];
  const nodes = [
    { id: 'b', kind: 'brief', title: 'Briefing: ' + u.title, short: 'Briefing', deps: [] },
    ...ls.map((l, i) => ({ id: 's' + (i + 1), kind: l.checkpoint ? 'checkpoint' : 'lesson', lesson: l, title: l.title, short: (i + 1) + ' · ' + l.title, deps: [i ? 's' + i : 'b'] })),
    { id: 'lab', kind: 'lab', title: 'Lab: ' + u.lab.title, short: 'Chapter lab', deps: ['s' + ls.length] },
    ...ts.map((t, i) => ({ id: 't' + (i + 1), kind: 'trace', trace: t, title: 'Trace: ' + t.title, short: 'Trace', deps: [i ? 's3' : 's1'] }))
  ];
  for (const n of nodes) { n.done = nodeDone(w, n); n.pos = LAYOUT[n.id]; n.above = LABEL_ABOVE.has(n.id); }
  const unlocked = chapterUnlocked(w);
  for (const n of nodes) n.state = n.done ? 'done' : !unlocked ? 'locked' : n.deps.every(d => nodes.find(x => x.id === d).done) ? 'open' : 'locked';
  return nodes;
}
function nodeDone(w, n) {
  const g = qGame();
  if (n.kind === 'brief') return !!g.briefs[w];
  if (n.lesson) return !!state.completed[n.lesson.id];
  if (n.kind === 'lab') return labDone(w);
  if (n.kind === 'trace') return !!g.traces[n.trace.id]?.done;
  return false;
}
/* ---------- questline chapters ---------- */
function questlineLessons(key) { return lessons.filter(l => l.chapter === key).sort((a, b) => a.id - b.id); }
function questlineUnlocked(key) {
  const ch = QL[key];
  if (!ch.chain) return true;
  const keys = Object.keys(QL).filter(k => QL[k].line === ch.line), i = keys.indexOf(key);
  if (i <= 0) return true;
  const prev = questlineLessons(keys[i - 1]).at(-1);
  return !!(prev && state.completed[prev.id]) || questlineLessons(key).some(l => state.completed[l.id]);
}
function questlineNodes(key) {
  const ch = QL[key], ls = questlineLessons(key), g = qGame(), unlocked = questlineUnlocked(key), guide = handbook.questlines?.[ch.line] || { title: ch.title, text: '' };
  const n = ls.length, nodes = [{ id: 'b', kind: 'brief', line: ch.line, title: 'Briefing: ' + guide.title, briefTitle: guide.title, deps: [], pos: [82, 280, 38], above: false }];
  ls.forEach((l, i) => nodes.push({ id: 'q' + (i + 1), kind: l.track, lesson: l, title: l.title, deps: [i ? 'q' + i : 'b'],
    pos: [205 + i * (720 / Math.max(1, n - 1)), i % 2 ? 175 : 365, 31], above: i % 2 === 1 }));
  const keys = Object.keys(QL).filter(k => QL[k].line === ch.line), prevKey = keys[keys.indexOf(key) - 1];
  for (const node of nodes) {
    node.done = node.kind === 'brief' ? !!g.qbriefs[ch.line] : !!state.completed[node.lesson.id];
    const core = node.lesson?.unlock ? lessons[node.lesson.unlock - 1] : null;
    const depsDone = node.deps.every(d => nodes.find(x => x.id === d).done);
    if (node.done) node.state = 'done';
    else if (!unlocked) { node.state = 'locked'; node.lockReason = 'finishing ' + QL[prevKey].title; }
    else if (core && !state.completed[core.id]) { node.state = 'locked'; node.lockReason = `core week ${core.week}, session ${core.session}: ${core.title}`; }
    else if (!depsDone) { node.state = 'locked'; node.lockReason = nodes.find(x => x.id === node.deps[0]).title; }
    else node.state = 'open';
  }
  return nodes;
}
function nodesFor(ch) { return QL[ch] ? questlineNodes(ch) : chapterNodes(ch); }
function chapterKey(w) { return /^\d+$/.test(String(w)) ? Number(w) : String(w); }
function defaultChapter() {
  for (let w = 1; w <= 24; w++) if (chapterUnlocked(w) && chapterNodes(w).some(n => n.lesson && !n.done)) return w;
  for (let w = 24; w >= 1; w--) if (chapterUnlocked(w)) return w;
  return 1;
}
function gearPath(cx, cy, r, teeth = 8) {
  const pts = [], inner = r * 0.8;
  for (let i = 0; i < teeth * 4; i++) {
    const a = (i / (teeth * 4)) * Math.PI * 2, rr = (i % 4 === 1 || i % 4 === 2) ? r : inner;
    pts.push((cx + rr * Math.cos(a)).toFixed(1) + ',' + (cy + rr * Math.sin(a)).toFixed(1));
  }
  return 'M' + pts.join('L') + 'Z';
}
function htmlIcon(d, size, cls) { return `<svg class="${cls}" viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true"><path d="${d}"/></svg>`; }
function svgIcon(d, x, y, size, cls = 'qn-icon') { return `<g class="${cls}" transform="translate(${x - size / 2} ${y - size / 2}) scale(${size / 24})"><path d="${d}"/></g>`; }

/* ---------- quest book page ---------- */
function renderQuestline(key) {
  const ch = QL[key], nodes = questlineNodes(key), done = nodes.filter(n => n.done).length, unlocked = questlineUnlocked(key);
  const kinds = [...new Set(nodes.map(n => n.kind))];
  return `<div class="qb">${questSidebar(key)}<section class="qb-main">
    <header class="qb-head"><div class="qb-head-icon" style="color:${KIND_COLOR[ch.kind]}">${htmlIcon(QICON[ch.kind], 24, 'qh-icon')}</div><div><span class="qb-kicker">SIDE QUESTLINE · ${esc(KIND_KICKER[ch.kind])}</span><h1>${esc(ch.title)}</h1><p>${esc(ch.sub)}</p></div><div class="qb-head-progress"><strong>${done}<span>/${nodes.length}</span></strong><small>quests complete</small><div class="qbar"><i style="width:${Math.round(done / nodes.length * 100)}%"></i></div></div></header>
    ${unlocked ? '' : `<div class="qb-locked-note">${htmlIcon(QICON.lock, 18, 'ql-icon')} Locked. Finish the previous ${esc(KIND_KICKER[ch.kind].toLowerCase())} chapter first.</div>`}
    <div class="qb-canvas"><svg viewBox="0 0 1000 600" role="group" aria-label="Quest map for ${esc(ch.title)}">${qbDefs()}${qbLines(nodes)}${nodes.map(n => qbNode(key, n)).join('')}</svg></div>
    <footer class="qb-legend">${kinds.map(k => `<span><i class="lg" style="--k:${KIND_COLOR[k]}"></i>${k === 'brief' ? 'Briefing' : esc(QL[key].title.replace(/ [IV]+$/, ''))}</span>`).join('')}<span><i class="lg lg-bounty"></i>Redo bounty</span><span class="qb-legend-tip">Each quest also needs its matching core session. Locked quests say which.</span></footer>
  </section></div>`;
}
function sideQuestLinks(w) {
  const groups = {};
  for (const l of lessons) if (l.track && l.week === w && (l.track === 'drill' || l.track === 'bug')) (groups[l.chapter] ??= []).push(l);
  const links = Object.entries(groups).map(([key, ls]) => `<a href="#quests/${key}" style="--k:${KIND_COLOR[QL[key].kind]}">${htmlIcon(QICON[QL[key].kind], 15, 'qs-icon')}${ls.length} ${QL[key].kind === 'drill' ? 'practice drill' : 'bug hunt'}${ls.length > 1 ? 's' : ''} · ${esc(QL[key].title)}</a>`);
  return links.length ? `<div class="qb-sidequests"><span>This week's extra practice</span>${links.join('')}</div>` : '';
}
function renderQuests(w) {
  questMigrate();
  if (QL[w]) return renderQuestline(w);
  w = Number(w);
  const chapter = w >= 1 && w <= 24 ? w : defaultChapter();
  const nodes = chapterNodes(chapter), u = handbook.units[chapter - 1], wk = weeks[chapter - 1];
  const done = nodes.filter(n => n.done).length, unlocked = chapterUnlocked(chapter);
  return `<div class="qb">${questSidebar(chapter)}<section class="qb-main">
    <header class="qb-head"><div class="qb-head-icon">${htmlIcon(PHASE_ICON[wk.phase] || QICON.lesson, 24, 'qh-icon')}</div><div><span class="qb-kicker">CHAPTER ${String(chapter).padStart(2, '0')} · ${esc(wk.phase.toUpperCase())}</span><h1>${esc(wk.title)}</h1><p>${esc(wk.subtitle)}</p></div><div class="qb-head-progress"><strong>${done}<span>/${nodes.length}</span></strong><small>quests complete</small><div class="qbar"><i style="width:${Math.round(done / nodes.length * 100)}%"></i></div></div></header>
    ${sideQuestLinks(chapter)}${unlocked ? '' : `<div class="qb-locked-note">${htmlIcon(QICON.lock, 18, 'ql-icon')} Locked. Clear chapter ${chapter - 1}’s final session to open this chapter. <a href="#path/week-${chapter}">Prefer to skip ahead? The list view opens any session.</a></div>`}
    <div class="qb-canvas"><svg viewBox="0 0 1000 600" role="group" aria-label="Quest map for chapter ${chapter}">${qbDefs()}${qbLines(nodes)}${nodes.map(n => qbNode(chapter, n)).join('')}</svg></div>
    <footer class="qb-legend">${['brief', 'lesson', 'checkpoint', 'trace', 'lab'].map(k => `<span><i class="lg" style="--k:${KIND_COLOR[k]}"></i>${{ brief: 'Briefing', lesson: 'Session', checkpoint: 'Checkpoint', trace: 'Side quest', lab: 'Chapter lab' }[k]}</span>`).join('')}<span><i class="lg lg-bounty"></i>Redo bounty</span><span class="qb-legend-tip">Glowing quests are ready. Select one to see its rewards.</span></footer>
  </section></div>`;
}
const KIND_COLOR = { brief: '#ffc94d', lesson: '#3fd5f5', checkpoint: '#b48cff', lab: '#ff7a36', trace: '#ff6eb4', drill: '#a3e635', bug: '#ff5470', sql: '#5b8cff', interview: '#ffb020', hardware: '#2ee6a6' };
const KIND_KICKER = { brief: 'BRIEFING', lesson: 'SESSION', checkpoint: 'CHECKPOINT', lab: 'CHAPTER LAB', trace: 'SIDE QUEST', drill: 'DRILL', bug: 'BUG HUNT', sql: 'SQL', interview: 'INTERVIEW', hardware: 'HARDWARE' };
const LABEL_ABOVE = new Set(['s2', 's4']);
function qbDefs() {
  return `<defs><radialGradient id="qshine" cx="35%" cy="28%" r="70%"><stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset=".45" stop-color="#fff" stop-opacity=".06"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient><radialGradient id="qember" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffb347" stop-opacity=".55"/><stop offset=".6" stop-color="#ff5a1f" stop-opacity=".12"/><stop offset="1" stop-color="#ff5a1f" stop-opacity="0"/></radialGradient></defs>`;
}
function wrapWords(text, max) {
  const lines = [];
  for (const word of text.split(/\s+/)) {
    const last = lines[lines.length - 1];
    if (last && (last + ' ' + word).length <= max) lines[lines.length - 1] = last + ' ' + word;
    else lines.push(word);
  }
  return lines;
}
/* Cubic curve from a to b, split at its midpoint so we can draw a direction chevron there. */
function qbCurve(a, b, kind) {
  a = a.slice(0, 2); b = b.slice(0, 2);
  const [x1, y1] = a, [x2, y2] = b;
  const c1 = kind === 'branch' ? [x1 + 110, y1] : [x1 + (x2 - x1) * 0.5, y1];
  const c2 = kind === 'branch' ? [x2, y2 - 110] : [x1 + (x2 - x1) * 0.5, y2];
  const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  const p01 = mid(a, c1), p12 = mid(c1, c2), p23 = mid(c2, b), p012 = mid(p01, p12), p123 = mid(p12, p23), m = mid(p012, p123);
  const f = v => v.map(n => n.toFixed(1)).join(' ');
  return { d: `M${f(a)} C${f(p01)} ${f(p012)} ${f(m)} C${f(p123)} ${f(p23)} ${f(b)}`, mid: m, angle: Math.atan2(p123[1] - p012[1], p123[0] - p012[0]) * 180 / Math.PI };
}
function qbLines(nodes) {
  return nodes.flatMap(n => n.deps.map(d => {
    const from = nodes.find(x => x.id === d);
    const st = from.done && n.done ? 'done' : from.done && n.state === 'open' ? 'open' : 'locked';
    const c = qbCurve(from.pos, n.pos, n.kind === 'trace' ? 'branch' : 'flow');
    return `<g class="ql ql-${st}" style="--k:${KIND_COLOR[n.kind]}"><path class="ql-glow" d="${c.d}"/><path class="ql-path" d="${c.d}"/><path class="ql-chev" d="M-6 -7 4 0-6 7" transform="translate(${c.mid[0].toFixed(1)} ${c.mid[1].toFixed(1)}) rotate(${c.angle.toFixed(1)})"/></g>`;
  })).join('');
}
function qbLabel(n, x, y, r) {
  const max = n.kind === 'lab' ? 20 : n.kind === 'trace' ? 16 : 18;
  const title = n.briefTitle ? n.briefTitle : n.kind === 'brief' ? handbook.units[n.week - 1].title : n.kind === 'lab' ? handbook.units[n.week - 1].lab.title : n.kind === 'trace' ? n.trace.title : n.lesson.title.replace(/^(Checkpoint|Build|Ship|Independent build|Foundations checkpoint|Final assessment):\s*/i, '').replace(/^./, ch => ch.toUpperCase());
  const kicker = KIND_KICKER[n.kind] + (n.lesson ? ' ' + n.lesson.session : '');
  const lines = wrapWords(title, max), lh = 15.5, h = 22 + lines.length * lh + 8;
  const wEst = Math.max(kicker.length * 6.6, ...lines.map(l => l.length * 7.3)) + 22;
  const top = n.above ? y - r - 14 - h : y + r + 12;
  return `<g class="qn-tag"><rect class="qn-tag-bg" x="${(x - wEst / 2).toFixed(1)}" y="${top.toFixed(1)}" width="${wEst.toFixed(1)}" height="${h.toFixed(1)}" rx="9"/><g class="qn-tag-text"><text class="qn-kick" x="${x}" y="${(top + 17).toFixed(1)}" text-anchor="middle">${esc(kicker)}</text><text class="qn-title" x="${x}" y="${(top + 17).toFixed(1)}" text-anchor="middle">${lines.map(l => `<tspan x="${x}" dy="${lh}">${esc(l)}</tspan>`).join('')}</text></g></g>`;
}
function qbNode(w, n) {
  n.week = w;
  const [x, y, r] = n.pos, g = qGame(), k = KIND_COLOR[n.kind];
  const b = n.lesson && g.bounties[n.lesson.id], bReady = b && b.due <= qNow();
  const pop = questJustDone && String(questJustDone.w) === String(w) && questJustDone.id === n.id;
  const cls = `qn qn-${n.kind} qn-${n.state}${b ? (bReady ? ' qn-bounty-ready' : ' qn-bounty') : ''}${pop ? ' qn-pop' : ''}`;
  const ring = n.kind === 'brief' ? `<path class="qn-ring" d="${gearPath(x, y, r, 9)}"/>` : `<circle class="qn-ring" cx="${x}" cy="${y}" r="${r}"/>`;
  const coreR = n.kind === 'brief' ? r * 0.64 : r - 6;
  const extra = n.kind === 'lab'
    ? `<circle class="qn-aura" cx="${x}" cy="${y}" r="${r + 34}" fill="url(#qember)"/><circle class="qn-orbit" cx="${x}" cy="${y}" r="${r + 11}"/>${[0, 1, 2, 3, 4, 5, 6].map(i => `<circle class="qn-spark" cx="${x - 36 + i * 12}" cy="${y - r + 6}" r="${i % 3 ? 2 : 2.8}" style="animation-delay:${(i * 0.45).toFixed(2)}s"/>`).join('')}`
    : n.kind === 'checkpoint' ? `<circle class="qn-orbit" cx="${x}" cy="${y}" r="${r + 9}"/>` : '';
  let badges = '';
  if (n.lesson && n.kind !== 'checkpoint') badges += `<g class="qb-num"><circle cx="${x - r * 0.74}" cy="${y - r * 0.74}" r="10.5"/><text x="${x - r * 0.74}" y="${y - r * 0.74 + 4}" text-anchor="middle">${n.lesson.session}</text></g>`;
  if (n.done) badges += `<g class="qb-badge qb-badge-done"><circle cx="${x + r * 0.74}" cy="${y + r * 0.74}" r="11"/>${svgIcon(QICON.check, x + r * 0.74, y + r * 0.74, 14, 'qb-badge-icon')}</g>`;
  else if (n.state === 'locked') badges += `<g class="qb-badge qb-badge-lock"><circle cx="${x + r * 0.74}" cy="${y + r * 0.74}" r="10.5"/>${svgIcon(QICON.lock, x + r * 0.74, y + r * 0.74, 12, 'qb-badge-icon')}</g>`;
  if (b) badges += `<g class="qb-badge qb-badge-bounty"><circle cx="${x + r * 0.74}" cy="${y - r * 0.74}" r="12"/>${svgIcon(QICON.redo, x + r * 0.74, y - r * 0.74, 15, 'qb-badge-icon')}</g>`;
  const label = `${n.title}. ${n.state === 'locked' ? 'Locked' : n.done ? 'Complete' : 'Available'}${b ? (bReady ? '. Redo bounty ready' : '. Redo bounty pending') : ''}`;
  return `<g class="${cls}" style="--k:${k}" data-node="${n.id}" data-week="${w}" tabindex="0" role="button" aria-label="${esc(label)}"><title>${esc(n.title)}</title>${extra}<g class="qn-body">${ring}<circle class="qn-base" cx="${x}" cy="${y}" r="${coreR}"/><circle class="qn-core" cx="${x}" cy="${y}" r="${coreR}"/><circle class="qn-shine" cx="${x}" cy="${y}" r="${coreR}" fill="url(#qshine)"/>${svgIcon(QICON[n.kind], x, y, r * (n.kind === 'brief' ? 0.78 : n.kind === 'lab' ? 0.9 : 0.95))}</g>${badges}${qbLabel(n, x, y, r)}</g>`;
}
/* After render, size each label plate to its real text width. */
function qbFitLabels() {
  document.querySelectorAll('.qn-tag').forEach(tag => {
    if (typeof tag.querySelector !== 'function') return;
    const text = tag.querySelector('.qn-tag-text'), bg = tag.querySelector('.qn-tag-bg');
    if (!text?.getBBox || !bg) return;
    const box = text.getBBox(), cx = box.x + box.width / 2, w = box.width + 24;
    bg.setAttribute('x', (cx - w / 2).toFixed(1)); bg.setAttribute('width', w.toFixed(1));
  });
}
function questSidebar(active) {
  const info = levelInfo(), ready = bountyList().filter(b => b.ready), pending = bountyList().filter(b => !b.ready);
  const indep = Object.values(state.completed).filter(c => !c.assisted).length;
  const chapterRow = w => {
    const wk = weeks[w - 1], nodes = chapterNodes(w), d = nodes.filter(n => n.done).length, open = chapterUnlocked(w);
    return `<a href="#quests/${w}" class="qc ${w === active ? 'active' : ''} ${open ? '' : 'locked'} ${d === nodes.length ? 'complete' : ''}" ${w === active ? 'aria-current="page"' : ''}><span class="qc-icon">${htmlIcon(open ? (PHASE_ICON[wk.phase] || QICON.lesson) : QICON.lock, 16, 'qc-svg')}</span><span class="qc-text"><small>CH ${String(w).padStart(2, '0')}</small>${esc(wk.title)}</span><span class="qc-count">${d}/${nodes.length}</span></a>`;
  };
  return `<aside class="qb-side">
    <div class="qp"><div class="qp-level"><span>LV</span><strong>${info.level}</strong></div><div class="qp-text"><strong>${esc(info.rank)}</strong><small>${info.xp.toLocaleString()} XP total</small><div class="qbar"><i style="width:${Math.round(info.into / info.need * 100)}%"></i></div><small>${info.into} / ${info.need} to level ${info.level + 1}</small></div></div>
    <div class="qp-stats"><span><strong>${indep}</strong>solo clears</span><span><strong>${ready.length}</strong>bounties ready</span></div>
    ${ready.length || pending.length ? `<div class="qbounties"><span class="qb-kicker">REDO BOUNTIES</span>${ready.map(b => `<a href="#lesson/${b.lesson.id}/review" data-qm="go" class="qbounty ready">${htmlIcon(QICON.redo, 16, 'qbounty-icon')}<span>${esc(b.lesson.title)}<small>Ready · +${lessonXP(b.lesson)} XP from a blank file</small></span></a>`).join('')}${pending.slice(0, 4).map(b => `<div class="qbounty">${htmlIcon(QICON.redo, 16, 'qbounty-icon')}<span>${esc(b.lesson.title)}<small>Unlocks in ${fmtWait(b.due - qNow())}</small></span></div>`).join('')}</div>` : ''}
    <div class="qb-chapters" role="navigation" aria-label="Chapters"><span class="qb-kicker">STAGE 01 · FOUNDATIONS</span>${[...Array(12)].map((_, i) => chapterRow(i + 1)).join('')}<span class="qb-kicker">STAGE 02 · ENGINEERING</span>${[...Array(12)].map((_, i) => chapterRow(i + 13)).join('')}<span class="qb-kicker qb-kicker-side">SIDE QUESTLINES</span>${Object.keys(QL).map(key => { const ch = QL[key], nodes = questlineNodes(key), d = nodes.filter(n => n.done).length, open = nodes.some(n => n.state !== 'locked'); return `<a href="#quests/${key}" class="qc qc-side ${key === active ? 'active' : ''} ${open ? '' : 'locked'} ${d === nodes.length ? 'complete' : ''}" style="--k:${KIND_COLOR[ch.kind]}" ${key === active ? 'aria-current="page"' : ''}><span class="qc-icon">${htmlIcon(open ? QICON[ch.kind] : QICON.lock, 16, 'qc-svg')}</span><span class="qc-text"><small>${esc(KIND_KICKER[ch.kind])}</small>${esc(ch.title)}</span><span class="qc-count">${d}/${nodes.length}</span></a>`; }).join('')}</div>
  </aside>`;
}

/* ---------- quest modal ---------- */
function openQuestModal(w, id) {
  if (!document.body || !handbook) return;
  w = chapterKey(w);
  const nodes = nodesFor(w), n = nodes.find(x => x.id === id);
  if (!n) return;
  closeQuestModal(true);
  const root = document.createElement('div');
  root.className = 'qm-backdrop'; root.id = 'qm-root';
  root.innerHTML = `<div class="qm" role="dialog" aria-modal="true" aria-labelledby="qm-title">${questModalBody(w, n, nodes)}</div>`;
  document.body.appendChild(root);
  const focusable = root.querySelector('textarea,a.qbtn,button.qbtn');
  (focusable || root.querySelector('[data-qm="close"]'))?.focus();
}
function closeQuestModal(silent) {
  const root = document.querySelector('#qm-root');
  if (root && root.remove) root.remove();
  if (!silent && questModalDirty && location.hash.startsWith('#quests')) { questModalDirty = false; route(); }
}
function rewardRows(rows) { return `<div class="qm-rewards"><span class="qb-kicker">REWARDS</span>${rows.map(([xp, text]) => `<div><strong>${xp}</strong><span>${text}</span></div>`).join('')}</div>`; }
function questModalBody(w, n, nodes) {
  const g = qGame(), stateChip = `<span class="qm-chip qm-chip-${n.state}">${n.state === 'done' ? 'COMPLETE' : n.state === 'open' ? 'AVAILABLE' : 'LOCKED'}</span>`;
  const head = (kicker, title) => `<div class="qm-head"><div><span class="qb-kicker">${kicker}</span><h2 id="qm-title">${esc(title)}</h2></div><button class="qm-close" data-qm="close" aria-label="Close quest">×</button></div>${stateChip}`;
  const needs = n.state === 'locked' ? `<p class="qm-needs">${htmlIcon(QICON.lock, 16, 'ql-icon')} Requires: ${n.lockReason ? esc(n.lockReason) : chapterUnlocked(w) ? n.deps.map(d => esc(nodes.find(x => x.id === d).title)).join(', ') : 'clearing chapter ' + (w - 1) + '’s final session'}</p>` : '';
  if (n.kind === 'brief' && n.line) {
    const guide = handbook.questlines?.[n.line] || { title: n.briefTitle, text: '' }, read = !!g.qbriefs[n.line];
    return `${head('SIDE QUESTLINE · BRIEFING', guide.title)}<div class="qm-guide">${paras(guide.text)}${guide.code ? `<pre class="qm-code">${esc(guide.code)}</pre>` : ''}</div>${read ? '<p class="qm-small">Read · +10 XP earned.</p>' : rewardRows([['+' + Q.briefXP, 'XP for reading the briefing'], ['🔓', 'Unlocks the first quest']])}<div class="qm-actions">${read ? '' : `<button class="qbtn" data-qm="qbrief" data-line="${n.line}">I've read it · claim +${Q.briefXP} XP</button>`}</div>`;
  }
  if (n.kind === 'brief') {
    const u = handbook.units[w - 1];
    return `${head('CHAPTER ' + w + ' · BRIEFING', n.title)}<p>Read this week’s handbook before the sessions. It explains the ideas, shows a worked example to predict, and lists common mistakes.</p><ul class="qm-list">${u.goals.map(x => `<li>${esc(x)}</li>`).join('')}</ul>${rewardRows([['+' + Q.briefXP, 'XP for opening the briefing'], ['🔓', 'Unlocks session 1']])}${needs}<div class="qm-actions">${n.state !== 'locked' ? `<a class="qbtn" href="#unit/${w}" data-qm="go">Open briefing →</a>` : ''}</div>`;
  }
  if (n.kind === 'lab') {
    const u = handbook.units[w - 1], checked = u.lab.acceptance.filter((_, j) => state.labChecks[`${w}-${j}`]).length, note = (state.labNotes[w] || '').trim().length;
    return `${head('CHAPTER ' + w + ' · PINNACLE', n.title)}<p>Build the full lab in VS Code. This is where the week’s pieces become a real program, so it pays the most.</p><div class="qm-tasks"><span class="qb-kicker">TASKS</span><div class="${checked === u.lab.acceptance.length ? 'ok' : ''}">${checked === u.lab.acceptance.length ? '✓' : '○'} Check all ${u.lab.acceptance.length} acceptance criteria (${checked}/${u.lab.acceptance.length})</div><div class="${note >= Q.labNoteMin ? 'ok' : ''}">${note >= Q.labNoteMin ? '✓' : '○'} Write an evidence note of at least ${Q.labNoteMin} characters: what you ran, what broke, what you fixed (${Math.min(note, Q.labNoteMin)}/${Q.labNoteMin})</div></div>${rewardRows([['+' + Q.labXP, 'XP · the biggest reward in the chapter'], ['🔓', 'Unlocks the next chapter’s finale path']])}${needs}<div class="qm-actions">${n.state !== 'locked' ? `<a class="qbtn" href="#unit/${w}" data-qm="go">Open lab brief →</a><a class="qbtn ghost" href="labs/week-${String(w).padStart(2, '0')}.zip" download>Download kit ↓</a>` : ''}</div>`;
  }
  if (n.kind === 'trace') {
    const t = n.trace, rec = g.traces[t.id];
    const body = rec?.done
      ? `<pre class="qm-code">${esc(t.code)}</pre><div class="qm-answer"><span class="qb-kicker">OUTPUT</span><pre>${esc(t.output)}</pre></div><p class="qm-why">${esc(t.why)}</p><p class="qm-small">${rec.revealed ? 'Answer revealed · 0 XP.' : 'Solved on try ' + rec.tries + ' · +' + rec.xp + ' XP.'}</p>`
      : n.state === 'locked' ? `<p>Read a short program and predict exactly what it prints. Unlocks after the session it branches from.</p>`
      : `<p>Read the code. Don’t run it. Type exactly what it prints.</p><pre class="qm-code">${esc(t.code)}</pre><label class="qm-label" for="trace-answer">Your predicted output</label><textarea id="trace-answer" class="qm-input" rows="3" spellcheck="false" placeholder="One printed line per line"></textarea><div id="trace-feedback" class="qm-feedback" aria-live="polite">${rec?.tries ? `${rec.tries} ${rec.tries === 1 ? 'try' : 'tries'} so far.` : ''}</div><div class="qm-actions"><button class="qbtn" data-qm="trace-submit" data-trace="${t.id}">Lock in answer</button>${rec?.tries >= 2 ? `<button class="qbtn ghost" data-qm="trace-reveal" data-trace="${t.id}">Reveal answer · 0 XP</button>` : ''}</div>`;
    return `${head('CHAPTER ' + w + ' · SIDE QUEST', n.title)}${body}${rec?.done ? '' : rewardRows([['+' + Q.traceXP[0], 'XP if right on the first try'], ['+' + Q.traceXP[1], 'on the second try'], ['+' + Q.traceXP[2], 'after that']])}${needs}`;
  }
  const l = n.lesson, c = state.completed[l.id], b = g.bounties[l.id], base = lessonXP(l), got = g.awards['lesson-' + l.id]?.xp;
  const status = c ? `<p class="qm-small">${got != null ? `Cleared for +${got} XP.` : 'Cleared with help · 0 XP.'} ${c.assisted ? 'Guided practice.' : 'Independent.'}</p>` : state.drafts[l.id] ? '<p class="qm-small">In progress. Your draft is saved.</p>' : '';
  const bounty = b ? `<div class="qm-bounty">${htmlIcon(QICON.redo, 18, 'qbounty-icon')}<div><strong>Redo bounty ${b.due <= qNow() ? 'ready' : 'in ' + fmtWait(b.due - qNow())}</strong><span>Rebuild this from a blank file with no help to claim the full +${base} XP.</span></div></div>` : '';
  const actions = n.state === 'locked' ? '' : `${b && b.due <= qNow() ? `<a class="qbtn bounty" href="#lesson/${l.id}/review" data-qm="go">Claim redo bounty →</a>` : ''}<a class="qbtn ${b && b.due <= qNow() ? 'ghost' : ''}" href="#lesson/${l.id}" data-qm="go">${c ? 'Replay quest' : state.drafts[l.id] ? 'Resume quest →' : 'Start quest →'}</a>`;
  return `${head(l.track ? esc(QL[l.chapter].title.toUpperCase()) + ' · QUEST ' + l.session : 'CHAPTER ' + w + ' · SESSION ' + l.session + (l.checkpoint ? ' · CHECKPOINT' : ''), l.title)}<p>${esc(l.task)}</p><ul class="qm-list">${l.objectives.slice(0, 3).map(x => `<li>${esc(x)}</li>`).join('')}</ul>${rewardRows([['+' + base, 'XP · cleared with no help'], ['+' + Math.round(base * Q.hintRate[1]), 'with 1 hint'], ['+' + Math.round(base * Q.hintRate[2]), 'with 2 hints'], ['0', 'with the solution or outside help, plus a redo bounty']])}${bounty}${status}${needs}<div class="qm-actions">${actions}</div>`;
}
function submitTrace(id, reveal) {
  const t = QUEST_TRACES.find(x => x.id === id), g = qGame();
  if (!t) return;
  const rec = g.traces[id] ??= { tries: 0, done: false, xp: 0 };
  if (rec.done) return;
  if (reveal) { rec.done = true; rec.revealed = true; save(); questModalDirty = true; refreshModal(t.week, id); return; }
  const answer = document.querySelector('#trace-answer')?.value || '';
  if (!answer.trim()) return toast('Type the output you expect first.');
  rec.tries++;
  const loose = s => s.replace(/\r/g, '').replace(/\s+/g, '').replace(/"/g, "'");
  if (loose(answer) === loose(t.output)) {
    rec.done = true; rec.xp = Q.traceXP[Math.min(rec.tries - 1, 2)]; save();
    questModalDirty = true;
    grantXP('trace-' + id, rec.xp, rec.tries === 1 ? 'Read it perfectly' : 'Trace solved');
    refreshModal(t.week, id);
  } else {
    save();
    const fb = document.querySelector('#trace-feedback');
    if (fb) { fb.className = 'qm-feedback miss'; fb.textContent = `Not quite (${rec.tries} ${rec.tries === 1 ? 'try' : 'tries'}). Trace it line by line: what is each variable after every step?`; }
    if (rec.tries === 2) refreshModal(t.week, id, answer, true);
  }
}
function refreshModal(w, id, keepAnswer, missed) {
  const panel = document.querySelector('#qm-root .qm');
  if (!panel) return;
  const nodes = nodesFor(chapterKey(w));
  const n = nodes.find(x => x.id === id || x.trace?.id === id);
  if (!n) return;
  panel.innerHTML = questModalBody(w, n, nodes);
  if (keepAnswer != null && document.querySelector('#trace-answer')) document.querySelector('#trace-answer').value = keepAnswer;
  if (missed && document.querySelector('#trace-feedback')) { const fb = document.querySelector('#trace-feedback'); fb.className = 'qm-feedback miss'; fb.textContent = 'Two misses. Keep tracing, or reveal the answer for 0 XP.'; }
}

/* ---------- lesson: predict, then run ---------- */
function sqlWrap(l, sql) {
  const q = String(sql).trim().replace(/;\s*$/, '');
  return `import sqlite3\n_FIX = ${JSON.stringify(l.sql.fixtures)}\n_SQL = ${JSON.stringify(q)}\n\ndef run_query(variant):\n    db = sqlite3.connect(':memory:')\n    db.executescript(_FIX[variant])\n    return [list(row) for row in db.execute(_SQL).fetchall()]\n`;
}
function predictionPanel(l) {
  if (l.sql) { questPred = []; return ''; }
  questPred = l.cases.map(() => null);
  return `<div class="predict" id="predict"><div class="predict-head"><strong>CALL IT BEFORE YOU RUN</strong><span>+${Q.predXP} XP per correct call · +${Q.predPerfect} for a perfect read</span></div>${l.cases.map((c, i) => {
    const call = `${l.name}(${c.args.map(pyrepr).join(', ')}) → ${pyrepr(c.expected)}`;
    return `<div class="predict-row"><span class="pc-n">${i + 1}</span><code title="${esc(call)}">${esc(call)}</code><span class="pc-btns"><button type="button" data-pred="${i}" data-v="1" aria-pressed="false">pass</button><button type="button" data-pred="${i}" data-v="0" aria-pressed="false">fail</button></span><span class="pc-res" id="pc-res-${i}"></span></div>`;
  }).join('')}<small id="predict-foot">Trace your code on each input, then call pass or fail for every check. Skip it and you simply get no bonus.</small></div>`;
}
function setPrediction(i, v) {
  if (!questPred.length) return;
  questPred[i] = questPred[i] === v ? null : v;
  document.querySelectorAll(`[data-pred="${i}"]`).forEach(b => { const on = questPred[i] === (b.dataset.v === '1'); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
  const n = questPred.filter(x => x !== null).length, foot = document.querySelector('#predict-foot');
  if (foot) foot.textContent = n === questPred.length ? 'All checks called. Run when ready.' : `${n} of ${questPred.length} checks called.`;
}
function questSnapshot() { return questPred.length && questPred.every(v => v !== null) ? questPred.slice() : null; }
function qKey() { return (current.isReview ? 'r' : '') + current.id; }
function qAttempt() { const g = qGame(); return g.attempts[qKey()] ??= { fails: 0, started: 0, lastFail: 0, lastPred: 0, diag: [] }; }
function questAfterRun(result, ok, code, prediction) {
  if (!current) return;
  const a = qAttempt(), changed = code.trim() !== (current.starter || '').trim(), h = qHash(code);
  if (!a.started && changed) a.started = qNow();
  if (!ok && changed && h !== a.lastFail) { a.fails++; a.lastFail = h; }
  if (prediction) {
    let right = 0;
    current.cases.forEach((_, i) => {
      const actual = !!result?.results?.[i]?.ok, hit = prediction[i] === actual, el = document.querySelector('#pc-res-' + i);
      if (hit) right++;
      if (el) { el.textContent = hit ? '✓ called it' : '✗ missed'; el.className = 'pc-res ' + (hit ? 'hit' : 'miss'); }
    });
    const perfect = right === current.cases.length;
    let gain = 0, note = '';
    if (!changed) note = 'Write some code first to earn prediction XP.';
    else if (h === a.lastPred) note = 'No XP: the code is unchanged since your last call.';
    else {
      gain = addCappedXP('pred-' + qKey(), right * Q.predXP + (perfect ? Q.predPerfect : 0), Q.predCap, perfect ? 'Perfect read' : 'Good calls');
      if (!gain && right) note = 'Prediction XP for this quest is maxed out.';
    }
    if (changed) a.lastPred = h;
    const foot = document.querySelector('#predict-foot');
    if (foot) foot.textContent = `You called ${right}/${current.cases.length}${perfect ? '. Perfect read!' : '.'}${gain ? ' +' + gain + ' XP.' : ''} ${note}`.trim();
  }
  questPred = current.cases.map(() => null);
  document.querySelectorAll('[data-pred]').forEach(b => { b.classList.remove('on'); b.setAttribute('aria-pressed', 'false'); });
  save();
  questRenderHelp();
}

/* ---------- lesson: earned help ---------- */
function hintOpen(n, a) { return n === 1 ? a.fails >= Q.hint1Fails : current.hints >= 1 && a.fails >= (a.hint1Fails ?? 0) + 1; }
function solutionRevealed() { return current.isReview ? !!current.revealed : !!qGame().revealed[current.id]; }
function solutionWait(a) { if (!a.started) return Q.solutionMinutes * 60000; return Math.max(0, a.started + Q.solutionMinutes * 60000 - qNow()); }
function solutionOpen(a) { return solutionRevealed() || (current.hints >= 2 && solutionWait(a) === 0); }
function mmss(ms) { const s = Math.ceil(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
function rewardPreview() {
  const l = lessons[current.id - 1], base = lessonXP(l), g = qGame(), outside = !!document.querySelector('#outside-help')?.checked;
  if (!current.isReview) {
    if (state.completed[l.id]) return ['0', 'Already cleared. Replay for practice, or earn XP through reviews.'];
    if (solutionRevealed() || outside) return ['0', 'Help used. A redo bounty will pay the full reward later.'];
    return ['+' + Math.round(base * Q.hintRate[Math.min(current.hints, 2)]), current.hints ? `${current.hints} hint${current.hints > 1 ? 's' : ''} used` : 'No help used. Full reward.'];
  }
  const b = g.bounties[l.id];
  if (b && b.due <= qNow()) return current.assisted || outside ? ['0', 'Help used. The bounty will be pushed back 48 hours.'] : ['+' + base, 'Redo bounty: rebuild it with no help'];
  if (b) return ['0', `Bounty not ready yet (${fmtWait(b.due - qNow())}). This run is practice.`];
  const due = state.reviews[l.id]?.due ?? state.completed[l.id]?.due;
  if (due && due <= qNow()) return current.assisted || outside ? ['0', 'Help used on this review.'] : ['+' + Q.reviewXP, 'Recall review with no help'];
  return ['0', 'Early review. Practice only.'];
}
function questRenderHelp() {
  if (!current || !lessons.length) return;
  const l = lessons[current.id - 1], a = qAttempt();
  if (!a.started && current.hints > 0) a.started = qNow();
  if (current.hints >= 1 && a.hint1Fails == null) a.hint1Fails = a.fails;
  const box = document.querySelector('#hint-box');
  if (box) box.innerHTML = l.hints.slice(0, Math.min(current.hints, 2)).map((h, i) => `<div class="qh">${a.diag[i] ? `<p class="qh-diag"><strong>Your diagnosis:</strong> ${esc(a.diag[i])}</p>` : ''}<p><strong>Hint ${i + 1}.</strong> ${esc(h)}</p></div>`).join('');
  const ladder = document.querySelector('#help-ladder');
  if (ladder) {
    const keep = document.querySelector('#q-diag')?.value;
    ladder.innerHTML = ladderMarkup(l, a);
    if (keep != null && document.querySelector('#q-diag')) document.querySelector('#q-diag').value = keep;
  }
  questSolutionWasOpen = solutionOpen(a);
  const refresher = document.querySelector('[data-q="refresher"]');
  if (refresher && !refresher.hidden) refresher.textContent = a.fails >= 1 ? 'Reveal refresher · counts as help' : 'Refresher locked: make 1 real attempt first';
}
function ladderMarkup(l, a) {
  const [xp, why] = rewardPreview();
  const rung = (n, label, isDone, isOpen, lockedText) => `<div class="rung ${isDone ? 'done' : isOpen ? 'open' : 'locked'}"><span class="rung-n">${isDone ? '✓' : n}</span><div><strong>${label}</strong><small>${isDone ? 'Used' : isOpen ? 'Unlocked' : lockedText}</small></div>${!isDone && isOpen ? `<button type="button" data-q="${n === 3 ? 'solution' : 'hint'}" class="${n === 3 ? 'danger' : ''}">${n === 3 ? 'Reveal · 0 XP' : 'Unlock hint ' + n}</button>` : ''}</div>`;
  const h1 = current.hints >= 1, h2 = current.hints >= 2, wait = solutionWait(a);
  const diag = questDiagOpen && questDiagOpen === current.hints + 1 ? `<div class="diag"><label for="q-diag">Before hint ${questDiagOpen}: what do you think is wrong? Name the failing check and your best guess at why.</label><textarea id="q-diag" rows="3" placeholder="Check 3 fails because when the list is empty my loop never runs, so…"></textarea><div><button type="button" data-q="diag-submit" class="primary">Reveal hint ${questDiagOpen}</button><button type="button" data-q="diag-cancel">Keep trying</button></div></div>` : '';
  return `<div class="reward-line"><span>If you clear it now</span><strong>${xp} XP</strong><small>${esc(why)}</small></div>
  <div class="ladder" aria-label="Help ladder">
  ${rung(1, 'Hint 1', h1, hintOpen(1, a), `Make ${Q.hint1Fails} real attempts first (${Math.min(a.fails, Q.hint1Fails)}/${Q.hint1Fails})`)}
  ${rung(2, 'Hint 2', h2, h1 && hintOpen(2, a), h1 ? 'Make 1 more real attempt after hint 1' : 'Needs hint 1 first')}
  ${rung(3, 'Reference solution', false, solutionOpen(a) && !solutionRevealed(), solutionRevealed() ? 'Revealed' : !h2 ? `Needs both hints and ${Q.solutionMinutes} min of trying` : `<span id="q-sol-wait">${mmss(wait)}</span> of trying left`)}
  </div>${diag}<p class="ladder-note">A real attempt is a run that fails with new code. Help is earned by trying, so the struggle comes first.</p>`;
}
function questTick() {
  if (!current || !document.querySelector('#help-ladder')) { clearInterval(questTimerId); questTimerId = null; return; }
  const a = qAttempt(), el = document.querySelector('#q-sol-wait');
  if (el) el.textContent = mmss(solutionWait(a));
  if (solutionOpen(a) !== questSolutionWasOpen) questRenderHelp();
}
/* Record in-app help (hints, refresher, solution) without ticking the outside-help box,
   which is reserved for help from outside Forge such as AI. */
function qMarkHelp() {
  current.assisted = true;
  if (!current.isReview) { state.assisted[current.id] = true; state.hints[current.id] = current.hints; save(); }
  const s = document.querySelector('#assistance-status');
  if (s) s.textContent = 'This attempt uses in-app help. Rebuild it from scratch later to lock it in.';
}
function questHelpAction(action, el) {
  if (!current) return;
  const a = qAttempt();
  if (action === 'hint') {
    const n = current.hints + 1;
    if (n > 2 || !hintOpen(n, a)) return toast('That hint is still locked. Make a real attempt first.');
    questDiagOpen = n; questRenderHelp(); document.querySelector('#q-diag')?.focus();
  }
  if (action === 'diag-cancel') { questDiagOpen = 0; questRenderHelp(); }
  if (action === 'diag-submit') {
    const text = (document.querySelector('#q-diag')?.value || '').trim();
    if (text.length < Q.diagMin) return toast(`Write at least ${Q.diagMin} characters about what you think is wrong.`);
    const n = current.hints + 1;
    a.diag[n - 1] = text.slice(0, 600);
    if (n === 1) a.hint1Fails = a.fails;
    current.hints = n; questDiagOpen = 0;
    qMarkHelp(); save(); questRenderHelp();
  }
  if (action === 'solution') {
    if (!solutionOpen(a)) return toast('The solution is still locked.');
    if (!confirm('Reveal the reference solution? This quest will pay 0 XP and a redo bounty will appear in 48 hours. Your draft will be replaced; download it first if you want to keep it.')) return;
    qMarkHelp();
    if (current.isReview) { current.revealed = true; const b = qGame().bounties[current.id]; if (b) b.due = qNow() + Q.bountyHours * 3600000; }
    else { qGame().revealed[current.id] = true; createBounty(current.id); }
    save();
    const ed = document.querySelector('#editor');
    ed.value = lessons[current.id - 1].solution; ed.dispatchEvent(new Event('input', { bubbles: true }));
    toast('Trace each line until you could explain it. Then rebuild it from a blank file when the bounty unlocks.');
    questRenderHelp();
  }
  if (action === 'refresher') {
    if (a.fails < 1) return toast('Make one real attempt from memory first.');
    document.querySelector('#refresher').hidden = false; qMarkHelp(); el.hidden = true; questRenderHelp();
  }
}

/* ---------- completion ---------- */
function questOnComplete(helped) {
  if (!current) return '';
  const l = lessons[current.id - 1], g = qGame(), base = lessonXP(l), outside = !!document.querySelector('#outside-help')?.checked;
  const before = state.completed[l.id];
  questJustDone = questFromMap ? (l.track ? { w: l.chapter, id: 'q' + l.session } : { w: l.week, id: 's' + l.session }) : null;
  if (!current.isReview) {
    if (before || g.awards['lesson-' + l.id]) return '';
    if (solutionRevealed() || outside) { createBounty(l.id); return `Saved · 0 XP with help. A redo bounty for +${base} XP unlocks in ${Q.bountyHours} hours.`; }
    const xp = Math.round(base * Q.hintRate[Math.min(current.hints, 2)]);
    grantXP('lesson-' + l.id, xp, current.hints ? `Cleared with ${current.hints} hint${current.hints > 1 ? 's' : ''}` : 'Independent clear');
    return xp === base ? `Independent clear · +${xp} XP. Nice work.` : `Cleared · +${xp} XP. Try the next one with fewer hints.`;
  }
  const clean = !current.assisted && !outside, b = g.bounties[l.id];
  if (b && b.due <= qNow()) {
    if (!clean) { b.due = qNow() + Q.bountyHours * 3600000; save(); return 'Help used, so the bounty moves back 48 hours. You’ve got this next time.'; }
    delete g.bounties[l.id]; save();
    grantXP('bounty-' + l.id + '-' + b.created, base, 'Redo bounty claimed');
    return `Bounty claimed · +${base} XP. You rebuilt it on your own.`;
  }
  if (b) return `Practice saved. The bounty unlocks in ${fmtWait(b.due - qNow())}.`;
  const due = state.reviews[l.id]?.due ?? before?.due;
  if (due && due <= qNow() && clean) { grantXP('review-' + l.id + '-' + due, Q.reviewXP, 'Recall review'); return `Recall review · +${Q.reviewXP} XP.`; }
  return '';
}
function questReturnHash() { return questFromMap && current ? '#quests/' + (current.track ? current.chapter : current.week) : ''; }
function questCheckLab(w) { if (w >= 1 && w <= 24 && labDone(w)) grantXP('lab-' + w, Q.labXP, 'Chapter lab complete'); }

/* ---------- HUD, home, review ---------- */
function refreshHUD() {
  const el = document.querySelector('#quest-hud');
  if (!el || !lessons.length) return;
  const info = levelInfo(), ready = bountyList().filter(b => b.ready).length;
  el.innerHTML = `<span class="hud-lv">${info.level}</span><span class="hud-body"><span class="hud-rank">${esc(info.rank)}</span><span class="hud-bar"><i style="width:${Math.round(info.into / info.need * 100)}%"></i></span></span><span class="hud-xp">${info.into}/${info.need}</span>${ready ? `<span class="hud-bounty" title="Redo bounties ready">↻ ${ready}</span>` : ''}`;
  el.setAttribute?.('aria-label', `Level ${info.level} ${info.rank}, ${info.into} of ${info.need} XP to next level${ready ? ', ' + ready + ' bounties ready' : ''}. Open quest book.`);
}
function questHomeCard() {
  const info = levelInfo(), w = defaultChapter(), next = chapterNodes(w).find(n => n.state === 'open' && !n.done), ready = bountyList().filter(b => b.ready);
  return `<a class="quest-home" href="#quests/${w}"><div class="qp-level"><span>LV</span><strong>${info.level}</strong></div><div class="qh-mid"><span class="qb-kicker">${esc(info.rank.toUpperCase())} · ${info.xp.toLocaleString()} XP</span><div class="qbar"><i style="width:${Math.round(info.into / info.need * 100)}%"></i></div><p>${next ? `Next quest: <strong>${esc(next.title)}</strong> · Chapter ${w}` : 'Chapter ' + w + ' is waiting in the quest book.'}${ready.length ? ` · <span class="qh-bounty">↻ ${ready.length} redo ${ready.length === 1 ? 'bounty' : 'bounties'} ready</span>` : ''}</p></div><span class="qh-go">Open quest book →</span></a>`;
}
const questBaseHome = renderHome;
renderHome = function () { questMigrate(); const html = questBaseHome(); return lessons.length && handbook ? html.replace('<div class="course-welcome">', questHomeCard() + '<div class="course-welcome">') : html; };
const questBaseReview = renderReview;
renderReview = function () {
  const html = questBaseReview(), list = lessons.length ? bountyList() : [];
  if (!list.length) return html;
  const card = `<div class="card review-bounties"><span class="badge orange">REDO BOUNTIES</span><p>These sessions were cleared with the solution or outside help. Rebuild each from a blank file, with no help, once it unlocks to claim the full XP.</p>${list.map(b => `<div class="review-row-lite"><strong>${esc(b.lesson.title)}</strong><span>${b.ready ? 'Ready · +' + lessonXP(b.lesson) + ' XP' : 'Unlocks in ' + fmtWait(b.due - qNow())}</span>${b.ready ? `<a class="btn small" href="#lesson/${b.lesson.id}/review">Claim from scratch →</a>` : ''}</div>`).join('')}</div>`;
  return html.replace('<div class="path-intro">', card + '<div class="path-intro">');
};
renderHints = questRenderHelp;

/* ---------- route hook and events ---------- */
/* Keep the quest book's scroll positions when moving between chapters. */
function rememberQuestScroll() {
  const side = document.querySelector('.qb-side'), list = document.querySelector('.qb-chapters');
  if (!side || typeof side.scrollTop !== 'number') return;
  questScroll.side = side.scrollTop; questScroll.sideLeft = side.scrollLeft;
  questScroll.chapters = list ? list.scrollLeft : 0;
  questScroll.win = window.scrollY || 0;
}
function restoreQuestScroll(fromQuests) {
  const side = document.querySelector('.qb-side'), list = document.querySelector('.qb-chapters');
  if (!side || typeof side.scrollTop !== 'number') return;
  if (fromQuests) {
    side.scrollTop = questScroll.side;
    if (list) list.scrollLeft = questScroll.chapters;
    window.scrollTo(0, questScroll.win);
  } else {
    document.querySelector('.qc.active')?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
    window.scrollTo(0, 0);
  }
}
function questMounted(page, id, mode) {
  const wasOnQuests = questScroll.onQuests;
  questScroll.onQuests = page === 'quests';
  clearInterval(questTimerId); questTimerId = null; questDiagOpen = 0;
  closeQuestModal(true);
  if (!lessons.length || !handbook) return;
  qGame(); questMigrate(); refreshHUD();
  if (page !== 'quests') { questFromMap = questGoPending && (page === 'lesson' || page === 'unit'); questGoPending = false; }
  if (page === 'unit') {
    const w = Number(id) || 1, g = qGame();
    if (w >= 1 && w <= 24 && !g.briefs[w]) { g.briefs[w] = true; save(); grantXP('brief-' + w, Q.briefXP, 'Briefing read'); }
  }
  if (page === 'lesson' && current) {
    if (current.isReview) { qGame().attempts[qKey()] = { fails: 0, started: 0, lastFail: 0, lastPred: 0, diag: [] }; save(); questRenderHelp(); }
    if (typeof setInterval === 'function') questTimerId = setInterval(questTick, 1000);
  }
  if (page === 'quests') {
    qbFitLabels();
    restoreQuestScroll(wasOnQuests);
    if (questMigrationNote) { const m = questMigrationNote; questMigrationNote = null; setTimeout(() => questToast(`+${m.xp} XP imported`, m.bounties ? `${m.bounties} guided sessions became redo bounties` : 'from your earlier independent clears', 'level'), 300); }
    if (questJustDone) setTimeout(() => { questJustDone = null; }, 1500);
  }
}
document.addEventListener('click', e => {
  const t = e.target;
  if (t && typeof t.closest === 'function' && t.closest('.qb a[href^="#quests/"]')) rememberQuestScroll();
  if (!t || typeof t.closest !== 'function') return;
  const node = t.closest('[data-node]');
  if (node) { openQuestModal(node.dataset.week, node.dataset.node); return; }
  const pred = t.closest('[data-pred]');
  if (pred) { setPrediction(Number(pred.dataset.pred), pred.dataset.v === '1'); return; }
  const q = t.closest('[data-q]');
  if (q) { questHelpAction(q.dataset.q, q); return; }
  const qm = t.closest('[data-qm]');
  if (qm) {
    const a = qm.dataset.qm;
    if (a === 'close') closeQuestModal();
    if (a === 'go') { questGoPending = true; closeQuestModal(true); }
    if (a === 'trace-submit') submitTrace(qm.dataset.trace, false);
    if (a === 'trace-reveal') submitTrace(qm.dataset.trace, true);
    if (a === 'qbrief') { const line = qm.dataset.line, g = qGame(); if (!g.qbriefs[line]) { g.qbriefs[line] = true; save(); grantXP('qbrief-' + line, Q.briefXP, 'Briefing read'); } questModalDirty = true; closeQuestModal(); }
    return;
  }
  if (t.classList?.contains('qm-backdrop')) closeQuestModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && document.querySelector('#qm-root')?.remove) closeQuestModal();
  if ((e.key === 'Enter' || e.key === ' ') && e.target?.dataset?.node) { e.preventDefault(); openQuestModal(e.target.dataset.week, e.target.dataset.node); }
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && e.target?.id === 'trace-answer') { e.preventDefault(); document.querySelector('[data-qm="trace-submit"]')?.click(); }
});
document.addEventListener('change', e => {
  const lab = e.target?.dataset?.lab;
  if (lab) questCheckLab(Number(lab.split('-')[0]));
  if (e.target?.id === 'outside-help' && current) questRenderHelp();
});
document.addEventListener('input', e => {
  const t = e.target;
  if (!t) return;
  if (t.dataset?.labNotes) questCheckLab(Number(t.dataset.labNotes));
  if (t.id === 'editor' && current && lessons.length) { const a = qAttempt(); if (!a.started && t.value.trim() !== (current.starter || '').trim()) { a.started = qNow(); save(); } }
});
