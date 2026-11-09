const fs=require('fs');
const vm=require('vm');
const assert=require('assert');
const {loadPyodide}=require('../dist/python/pyodide.js');
(async()=>{
 const curriculum=JSON.parse(fs.readFileSync('dist/curriculum.json'));const book=JSON.parse(fs.readFileSync('dist/handbook.json'));
 assert.equal(curriculum.lessons.length,317);assert(curriculum.lessons.every((l,i)=>l.id===i+1),'Lesson ids must stay contiguous');assert.equal(curriculum.lessons.filter(l=>!l.track).length,96);assert.equal(book.units.length,24);
 const py=await loadPyodide({indexURL:process.cwd()+'/dist/python/'});await py.loadPackage('sqlite3');
 const body=fs.readFileSync('dist/runner.js','utf8').match(/runtime.runPython\(`([\s\S]*?)`\)/)[1];
 function evaluate(code,name,cases=[],requirements=[],checkMutation=false){py.globals.set('_forge_source',code);py.globals.set('_forge_cases',JSON.stringify(cases));py.globals.set('_forge_name',name);py.globals.set('_forge_requirements',JSON.stringify(requirements));py.globals.set('_forge_check_mutation',checkMutation);return JSON.parse(py.runPython(body));}
 const programBody=fs.readFileSync('dist/runner.js','utf8').match(/const PROGRAM_PY = String\.raw`([\s\S]*?)`;/)[1];
 function runProgram(code,cases){py.globals.set('_forge_source',code);py.globals.set('_forge_cases',JSON.stringify(cases));return JSON.parse(py.runPython(programBody));}
 const allPass=r=>!r.error&&r.results.length>0&&r.results.every(x=>x.ok);
 let checks=0;
 for(const u of book.units){const r=evaluate(u.worked.code,'');assert(!r.error,`Worked example ${u.week}: ${r.error}`);assert.equal(r.stdout.trim(),u.worked.output.trim(),`Worked output ${u.week}`);assert(fs.existsSync(`dist/labs/week-${String(u.week).padStart(2,'0')}.zip`));}
 assert(evaluate('def total_damage(hits):\n    return sum(hits)','total_damage',[{args:[[1,2]],expected:3}],['loop']).error?.includes('Practice requirement'));
 assert(!evaluate('def f(items):\n    items.append(1)\n    return 1','f',[{args:[[]],expected:1}],[],true).results[0].ok);
 assert(evaluate('def f(:\n    pass','f').error?.includes('SyntaxError'));
 // Import requirements: any correct way of importing passes; a missing import still fails.
 const requirementMet=(code,req)=>!evaluate(code,'',[],[req]).error?.includes('Practice requirement');
 const importForms=[['heapq','import heapq'],['heapq','from heapq import heappush'],['heapq','import heapq as h'],['json','from json import loads'],['json','import json'],['os','import os.path'],['os','from os.path import join'],['re','from re import findall'],['sqlite3','from sqlite3 import connect'],['argparse','from argparse import ArgumentParser'],['deque','from collections import deque'],['deque','from collections import deque as queue'],['deque','import collections\nqueue = collections.deque()'],['deque','import collections as c\nqueue = c.deque()']];
 for(const [req,code] of importForms)assert(requirementMet(code,req),`Correct import rejected: ${code}`);
 const missingForms=[['heapq','x = 1'],['heapq','heapq = []'],['heapq','# import heapq'],['heapq','import json'],['json','from os import path'],['deque','import collections'],['deque','from collections import Counter'],['deque','class Box:\n    pass\nbox = Box()\nbox.deque = 1']];
 for(const [req,code] of missingForms)assert(!requirementMet(code,req),`Missing import accepted: ${code}`);
 const structural=['loop','while','class','yield','raise','try','function'],importLessons=curriculum.lessons.filter(l=>l.requirements.some(r=>!structural.includes(r)));
 assert.deepEqual(importLessons.map(l=>l.id),[49,57,61,62,63,64,74,76,83,176,210,235,236,238,239,240,241,243,247,251,254,277,284,285,316,317],'Lessons with import requirements changed');
 for(const l of importLessons){const r=evaluate(l.solution,l.name,l.cases,l.requirements,l.noMutation);assert(!r.error&&r.results.every(x=>x.ok),`Lesson ${l.id} reference fails its import requirement`);assert(evaluate(`def ${l.name}(*args):\n    return None`,l.name,l.cases,l.requirements,l.noMutation).error?.includes('Practice requirement'),`Lesson ${l.id} accepts a missing import`);}
 console.log(`Import requirements: ${importForms.length} correct forms pass, ${missingForms.length} wrong forms fail, and ${importLessons.length} affected lessons rerun.`);
 // Rendering and additive migration checks without substituting a browser engine.
 const nodes=new Map(),listeners={},navigation=['home','path','projects','review','journal','settings'].map(nav=>({dataset:{nav},attributes:{},classList:{toggle(){}},setAttribute(k,v){this.attributes[k]=v},removeAttribute(k){delete this.attributes[k]}}));
 const node=selector=>{if(!nodes.has(selector))nodes.set(selector,{innerHTML:'',textContent:'',value:'',checked:false,disabled:false,dataset:{},classList:{toggle(){},add(){},remove(){}},hidden:false});return nodes.get(selector);};
 // Cache versions: one constant in index.html, used by every URL it and app.js load.
 const indexHtml=fs.readFileSync('dist/index.html','utf8'),appSource=fs.readFileSync('dist/app.js','utf8'),FORGE_VERSION=indexHtml.match(/const FORGE_VERSION='(\d+)'/)?.[1];
 assert(FORGE_VERSION,'FORGE_VERSION missing from index.html');
 for(const file of ['style.css','quest.css','appearance.css','appearance.js','journey.js','app.js','traces.js','quest.js'])assert(indexHtml.includes(`'${file}'`),`index.html does not load ${file}`);
 assert(!/\?v=\d/.test(indexHtml)&&!/\?v=\d/.test(appSource),'Hard-coded ?v= version found');
 for(const url of ["'runner.js?v='+FORGE_VERSION","'curriculum.json?v='+FORGE_VERSION","'handbook.json?v='+FORGE_VERSION"])assert(appSource.includes(url),`app.js is missing ${url}`);
 let stored;const legacy={version:1,completed:{1:{at:1,assisted:false,due:2}},drafts:{1:'def add_xp(current, earned):\n    return current+earned'},notes:{},assisted:{},hints:{},explanations:{},ratings:{},scratch:'kept notebook',projectChecks:{},reviews:{},events:[],timerMinutes:45};
 const KEY='forge-progress-v1',fakeStorage=seed=>{const data=new Map(seed);return {data,failOn:()=>false,getItem:k=>data.has(k)?data.get(k):null,setItem(k,v){if(this.failOn(k,String(v)))throw Error('QuotaExceededError');data.set(k,String(v));if(k===KEY&&this===mainStorage)stored=JSON.parse(v);},removeItem:k=>data.delete(k),key:i=>[...data.keys()][i]??null,get length(){return data.size}};};
 const mainStorage=fakeStorage([[KEY,JSON.stringify(legacy)]]);
 const context={console,document:{querySelector:node,querySelectorAll:()=>navigation,addEventListener:(type,fn)=>{(listeners[type]??=[]).push(fn)}},window:{addEventListener(){},scrollTo(){}},location:{hash:'#home'},localStorage:mainStorage,fetch:async url=>({ok:true,json:async()=>url.startsWith('handbook')?book:curriculum}),setTimeout,clearTimeout,setInterval,clearInterval,Date,Blob,URL,confirm:()=>true,FORGE_VERSION};
 vm.createContext(context);vm.runInContext(fs.readFileSync('dist/app.js','utf8'),context);vm.runInContext(fs.readFileSync('dist/traces.js','utf8'),context);vm.runInContext(fs.readFileSync('dist/quest.js','utf8'),context);vm.runInContext(fs.readFileSync('dist/journey.js','utf8'),context);await new Promise(r=>setTimeout(r,20));
 // Every teaching example has to run in the same interpreter learners use.
 assert(book.units.every(u=>u.plain?.length),'Every week needs plain-English teaching');
 const runExample=code=>{py.globals.set('_forge_example',code);py.runPython(['import contextlib,io','with contextlib.redirect_stdout(io.StringIO()),contextlib.redirect_stderr(io.StringIO()):',"    exec(_forge_example,{'__name__':'__main__'})"].join(String.fromCharCode(10)));};
 let examples=0;for(const u of book.units)for(const s of u.plain)if(s.code&&!s.shell){try{runExample(s.code);examples++;}catch(e){assert.fail(`Week ${u.week} example "${s.title}" fails: ${e.message}`);}}
 for(const l of curriculum.lessons)for(const s of l.teach||[]){try{runExample(s.code);examples++;}catch(e){assert.fail(`Lesson ${l.id} example "${s.title}" fails: ${e.message}`);}}
 assert.equal(curriculum.lessons.filter(l=>l.teach?.length).length,6,'Every object-oriented quest needs teaching');
 console.log(`Teaching: all ${book.units.length} weeks have plain-English sections; ${examples} examples ran in bundled Python.`);
 // Every lesson runs in real Python; SQL quests go through the app's own sqlWrap from quest.js.
 const sqlWrap=vm.runInContext('sqlWrap',context);assert.equal(typeof sqlWrap,'function','quest.js no longer defines sqlWrap');
 const programLessons=curriculum.lessons.filter(l=>l.program);assert.equal(programLessons.length,10);
 for(const l of programLessons){
  const started=Date.now(),r=runProgram(l.solution,l.cases),ms=Date.now()-started;
  assert(allPass(r),`Program ${l.id} reference fails: ${JSON.stringify(r.results.map(x=>x.status))}`);
  assert(ms<l.cases.length*1500,`Program ${l.id} reference is too close to the time limit (${ms} ms)`);
  checks+=r.results.length;
  assert(!allPass(runProgram(l.starter,l.cases)),`Program ${l.id} starter passes`);
  assert(!allPass(runProgram(l.broken,l.cases)),`Program ${l.id} broken program passes`);
  assert(!allPass(runProgram('print('+JSON.stringify(l.cases[0].expected)+')',l.cases)),`Program ${l.id} passes by printing the sample answer`);
  for(const row of r.results.filter(x=>!x.sample))assert(!('expected' in row)&&!('actual' in row),`Program ${l.id} leaks a hidden test`);
  assert(l.cases.filter(c=>c.sample).length===2&&l.cases.filter(c=>!c.sample).length>=3&&l.samplePreview&&!l.hints.includes(l.solution));
 }
 const one=[{stdin:'3\n',expected:'6',sample:true},{stdin:'4\n',expected:'8'}],doubler='print(int(input())*2)';
 assert(allPass(runProgram(doubler,one)),'Program runner rejects a correct program');
 assert(allPass(runProgram('print(str(int(input())*2)+"   ")\nprint()\nprint("  ")',one)),'Trailing whitespace should not count');
 assert.equal(runProgram('print(1)\nprint(2, end="")',[{stdin:'',expected:'1\n2'}]).results[0].ok,true);
 assert.equal(runProgram('print("1 ")\nprint(" 2")',[{stdin:'',expected:'1\n2'}]).results[0].ok,false,'Leading whitespace still counts');
 assert(allPass(runProgram('import sys\nprint(int(input())*2)\nsys.exit(0)',one)),'sys.exit should end a program normally');
 assert.equal(runProgram('print(int(input("Number? "))*2)',one).results[0].status,'wrong answer','A prompt counts as output');
 {const r=runProgram('secret = input()\nraise ValueError("saw " + secret)',[{stdin:'a',expected:'x',sample:true},{stdin:'hidden-value',expected:'x'}]);
  assert.equal(r.results[1].status,'runtime error');assert(!JSON.stringify(r).includes('hidden-value'),'A hidden input leaked through an error');}
 assert.equal(runProgram('input()\ninput()',one).results[1].status,'runtime error','Reading past the input is a runtime error');
 assert(runProgram('def f(:\n    pass',one).error.includes('SyntaxError'));
 {const r=runProgram('while True:\n    pass',[...one,{stdin:'5\n',expected:'10'}]);assert.deepEqual(r.results.map(x=>x.status),['too slow','too slow','skipped'],'Endless loops must be stopped test by test');}
 {const r=runProgram('n = int(input())\nif n == 4:\n    while True:\n        pass\nprint(n * 2)',one);assert.deepEqual(r.results.map(x=>x.status),['passed','too slow'],'One slow test should not hide the others');}
 console.log(`Whole programs: ${programLessons.length} references pass; starters, broken programs, and sample-only programs fail; hidden tests stay hidden.`);
 for(const l of curriculum.lessons){if(l.program)continue;const r=evaluate(l.sql?sqlWrap(l,l.solution):l.solution,l.name,l.cases,l.requirements,l.noMutation);if(l.track==='bug'){const b=evaluate(l.starter,l.name,l.cases,l.requirements,l.noMutation);assert(b.error||!b.results.every(x=>x.ok),`Bug hunt ${l.id} starter passes`);}assert(!r.error,`Lesson ${l.id}: ${r.error}`);assert(r.results.every(r=>r.ok),`Lesson ${l.id}: ${JSON.stringify(r)}`);checks+=r.results.length;assert(l.resources.every(key=>book.sources[key]));}
 console.log(`Bundled Python 3.12: ${checks} challenge checks and ${book.units.length} worked examples passed; SQL, structural requirements, mutation detection, and syntax failures verified.`);
 const routes=['home','path','projects','review','journal','settings','guide','resources','readiness','test','setup','practice',...curriculum.lessons.map(l=>'lesson/'+l.id),...Array.from({length:24},(_,i)=>'unit/'+(i+1)),...Array.from({length:24},(_,i)=>'lab/'+(i+1)), 'setup/16',...Array.from({length:9},(_,i)=>'setup/16/'+(i+1)),'lesson/96/review','quests',...Array.from({length:24},(_,i)=>'quests/'+(i+1)),...['grind-1','grind-2','grind-3','grind-4','bugs-1','bugs-2','bugs-3','sql-1','sql-2','int-1','int-2','hw-1'].map(k=>'quests/'+k),'lesson/185/review'];
 for(const route of routes){context.location.hash='#'+route;vm.runInContext('route()',context);assert(node('#main').innerHTML.length>100,route);assert(!node('#main').innerHTML.includes('Let’s reconnect.'),'Course failed to initialize at '+route);assert(!node('#main').innerHTML.includes('undefined'),`Undefined content in ${route}`);}
 context.location.hash='#home';vm.runInContext('route()',context);{const home=node('#main').innerHTML;assert(home.includes('href="#quests/1"')&&home.includes('Practice quest 2'),'Home should lead to the current quest book chapter and identify the next practice');assert(!home.includes('class="course-welcome"')&&!home.includes('class="quest-home"'),'Home should have one learning direction');}
 context.location.hash='#setup/16/2';vm.runInContext('route()',context);assert(node('#main').innerHTML.includes('labs/week-16.zip')&&node('#main').innerHTML.includes('href="#lab/16"'),'Setup must retain the selected week');context.location.hash='#setup/16/4';vm.runInContext('route()',context);assert(node('#main').innerHTML.includes('.venv'+String.fromCharCode(92)+'Scripts'+String.fromCharCode(92)+'python.exe'),'Windows command path lost');
 context.location.hash='#guide';vm.runInContext('route()',context);assert(node('#main').innerHTML.includes('No installation needed'),'The first lesson should not require local setup');
 vm.runInContext('save()',context);assert.equal(stored.scratch,'kept notebook');assert.equal(stored.drafts[1],legacy.drafts[1]);assert.equal(stored.completed[1].assisted,false);assert.deepEqual(stored.labChecks,{});
 await vm.runInContext('importBackup',context)({size:1000,text:async()=>JSON.stringify(legacy)});assert(stored.completed[1],'Old backup import lost completion');
 context.location.hash='#lab/16';vm.runInContext('route()',context);for(const handler of listeners.change)handler({target:{dataset:{lab:'16-0'},checked:true}});assert.equal(stored.labChecks['16-0'],true);
 for(const handler of listeners.input)handler({target:{id:'lab-evidence',dataset:{labNotes:'16'},value:'A tested SQL query and rollback.'}});assert.equal(stored.labNotes[16],'A tested SQL query and rollback.');
 const withNew={...stored,completed:{...stored.completed,96:{at:3,due:4,assisted:false}},drafts:{...stored.drafts,96:'new draft'}};await vm.runInContext('importBackup',context)({size:2000,text:async()=>JSON.stringify(withNew)});assert.equal(stored.drafts[96],'new draft');assert(stored.labChecks['16-0']);
 // Quest layer: level curve, migration of earlier work, trace answer keys, and backup round-trip.
 const q=code=>vm.runInContext(code,context);
 assert.equal(q('levelInfo(0).level'),1);assert.equal(q('levelInfo(100).level'),2);assert.equal(q('levelInfo(229).level'),2);assert.equal(q('levelInfo(230).level'),3);
 context.location.hash='#quests';q('route()');q('save()');assert.equal(stored.game.awards['lesson-1'].xp,100,'Earlier independent clear should migrate to XP');assert.equal(stored.game.migrated,true);
 assert.equal(q('QUEST_TRACES.length'),48);assert.equal(q('chapterNodes(1).length'),8);assert.equal(q("chapterNodes(1).find(n=>n.id==='s1').state"),'done');assert.equal(q("chapterNodes(2).find(n=>n.id==='s1').state"),'locked');
 for(const t of q('QUEST_TRACES')){const r=evaluate(t.code,'');assert(!r.error,`Trace ${t.id}: ${r.error}`);assert.equal(r.stdout.replace(/\n$/,''),t.output,`Trace ${t.id} answer key`);}
 const withGame={...stored,game:{...stored.game,awards:{...stored.game.awards,'trace-t1-1':{xp:15,at:5},'bad key!':{xp:9e9}},bounties:{2:{due:1,created:1},999:{due:1,created:1}},traces:{'t1-1':{tries:1,done:true,xp:15}}}};
 await vm.runInContext('importBackup',context)({size:5000,text:async()=>JSON.stringify(withGame)});
 assert.equal(stored.game.awards['trace-t1-1'].xp,15);assert(!stored.game.awards['bad key!'],'Invalid award kept');assert(stored.game.bounties[2]&&!stored.game.bounties[999],'Bounty sanitizing failed');assert.equal(stored.game.traces['t1-1'].done,true);
 await vm.runInContext('importBackup',context)({size:1000,text:async()=>JSON.stringify(legacy)});assert.equal(stored.game.awards['lesson-1'].xp,100,'Legacy backups should re-run migration on import');assert(!stored.game.awards['trace-t1-1'],'Old quest progress should be replaced by the imported backup');
 assert.equal(q("questlineNodes('sql-1').length"),9);assert.equal(q("questlineNodes('sql-1')[1].state"),'locked');assert.equal(q("questlineNodes('grind-1')[1].lockReason.startsWith('Briefing')"),true);assert(q('sqlWrap(lessons[184],lessons[184].solution)').includes('def run_query'));
 // Timed test: rules, draft isolation, saved results, and old backups.
 q("state.game.tests={history:[],active:null}");
 {const picks=JSON.parse(q("JSON.stringify(testPick([]))")),tiers=picks.map(id=>curriculum.lessons[id-1].tier);assert.deepEqual(tiers,[1,2,3],'A test takes one problem from each tier');
  const used=curriculum.lessons.filter(l=>l.program&&l.tier===1&&l.id!==curriculum.lessons.find(x=>x.program).id).map(l=>l.id);
  const history=JSON.stringify(used.map(id=>({problems:[{id}]})));for(let i=0;i<8;i++)assert.equal(q(`testPick(${history})[0]`),curriculum.lessons.find(x=>x.program).id,'Tests should prefer problems you have not had recently');}
 q("testStart()");
 const testId=q("qGame().tests.active.problems[0]"),draftBefore=q(`state.drafts[${testId}]`);
 assert.equal(q("testRunning()"),true);
 {const page=q("renderTest('1')");assert(page.includes('test-clock')&&page.includes('Hints are off')&&!page.includes('help-ladder')&&!page.includes('data-q=')&&!page.includes('data-qm='),'Test page must not offer help');assert.equal(q("current.testRun"),true);}
 for(const c of curriculum.lessons[testId-1].hints)assert(!q("renderTest('1')").includes(c),'Test page shows a hint');
 assert(!q("renderTest('1')").includes('Hidden'),'Test page shows hidden details before a run');
 q("current.hints=2;questRenderHelp()");assert(node('#help-ladder').innerHTML.includes('Hints are off'));assert.equal(node('#hint-box').innerHTML,'');
 q("renderTest('1')");for(const handler of listeners.input)handler({target:{id:'editor',value:'print(1)',dataset:{}}});
 assert.equal(q(`qGame().tests.active.code[${testId}]`),'print(1)');assert.equal(q(`state.drafts[${testId}]`),draftBefore,'A test must not overwrite practice drafts');
 q("testRecord({results:[{ok:true},{ok:true},{ok:false}]},'print(1)');testRecord({results:[{ok:false}]},'print(2)')");
 assert.equal(q(`qGame().tests.active.results[${testId}].passed`),2,'A problem keeps its best run');
 {const copy=JSON.parse(q("JSON.stringify(sanitizeGame(JSON.parse(JSON.stringify(qGame()))))"));assert.equal(copy.tests.active.problems.length,3);assert.equal(copy.tests.active.code[testId],'print(2)');}
 assert.equal(q("JSON.stringify(sanitizeGame({}).tests)"),'{"history":[],"active":null}','Old backups have no tests');
 assert.equal(q("JSON.stringify(sanitizeGame({tests:{history:[{at:1},null,{at:1,used:-5,problems:[]}],active:{startedAt:'x',problems:[1]}}}).tests)"),'{"history":[],"active":null}','Bad test data must be dropped');
 q("qGame().tests.active.startedAt=Date.now()-3700000;testCheck()");
 assert.equal(q("qGame().tests.active"),null,'An expired test must finish itself');
 {const h=JSON.parse(q("JSON.stringify(qGame().tests.history)"));assert.equal(h.length,1);assert.equal(h[0].used,3600000);assert.equal(h[0].problems[0].passed,2);assert.equal(JSON.stringify(q("JSON.stringify(sanitizeGame(JSON.parse(JSON.stringify(qGame()))).tests.history.length)")),'"1"');}
 {const page=q("renderTest()");assert(page.includes('LATEST RESULT')&&page.includes('Your test history')&&page.includes('problems solved'));}
 assert.equal(q("testRunning()"),false);q("current={...lessons[0],isReview:false,hints:0};questRenderHelp();current=null");assert(!node('#help-ladder').innerHTML.includes('Hints are off'),'Help must return after a test');
 q("state.game.tests={history:[],active:null}");
 assert.equal(q("questlineNodes('test-1').filter(n=>n.state==='locked').length"),0,'The test questline opens from the start');assert.equal(q("questlineNodes('test-oop').filter(n=>n.state==='locked').length"),0);
 // A week's last session leads to its lab until the lab is done.
 assert.equal(q("nextHashAfter(lessons[3])"),'#lab/1','The last session of a week should lead to its lab');
 assert.equal(q("nextHashAfter(lessons[2])"),'#lesson/4');
 {const u=book.units[0];q(`state.labNotes[1]='x'.repeat(80);${u.lab.acceptance.map((_,j)=>`state.labChecks['1-${j}']=true;`).join('')}`);assert.equal(q("nextHashAfter(lessons[3])"),'#lesson/5','A finished lab no longer blocks the next week');
  q(`delete state.labNotes[1];${u.lab.acceptance.map((_,j)=>`delete state.labChecks['1-${j}'];`).join('')}`);}
 assert.equal(q("nextHashAfter(lessons[95])"),'#lab/24');assert.equal(q("nextHashAfter(lessons[96])"),'#lesson/98','Questlines keep their own order');
 assert(book.setup?.sections?.length>=8&&q("renderSetup(1,5)").includes('hello.py'),'The beginner workspace setup guide is missing');
 // Home must send learners to an unfinished lab before sending them to a later week.
 {const before=q('JSON.stringify(state)');q("for(const l of lessons.filter(l=>!l.track&&l.week===1))state.completed[l.id]={at:1,due:2,assisted:false}");assert.equal(q('learningNext().href'),'#lab/1');
  q("state.labNotes[1]='x'.repeat(80)");assert.equal(q('learningNext().href'),'#lab/1','A note without acceptance checks does not finish a lab');
  q(`${book.units[0].lab.acceptance.map((_,j)=>`state.labChecks['1-${j}']=true;`).join('')}`);assert.equal(q('learningNext().href'),'#unit/2','A new chapter begins with reading');
  q("delete state.labChecks['1-0']");assert.equal(q('learningNext().href'),'#lab/1','Removing evidence should restore the lab as the next step');q('state=JSON.parse('+JSON.stringify(before)+')');}
 for(const u of book.units){const names=curriculum.lessons.filter(l=>!l.track&&l.week===u.week).map(l=>l.name);for(const section of u.plain)for(const name of names)assert(!section.code?.includes('def '+name+'('),`Week ${u.week} teaching gives away ${name}`);}
 q("setupPlatform='mac'");assert(!q('renderSetup(16)').includes('Scripts'+String.fromCharCode(92)+'python.exe'),'macOS should show its own commands');q("setupPlatform='windows'");
 // Main quest guidance: explicit reading, legacy progress, optional branches, and chapter continuation.
 {const before=q('JSON.stringify(state)');q('state=emptyState();state.game=defaultGame()');
  assert.equal(q('mainQuestNext().href'),'#unit/1');q('renderUnit(1)');assert.equal(q('!!qGame().briefs[1]'),false,'Opening teaching must not silently complete reading');
  assert.equal(q('finishChapterReading(1)'),'#lesson/1');assert.equal(q("qGame().awards['brief-1'].xp"),10);q('finishChapterReading(1)');assert.equal(q('totalXP()'),10,'Reading reward must be granted once');
  assert.equal(q('mainQuestNext().href'),'#lesson/1');
  q("for(const l of chapterLessons(1))state.completed[l.id]={at:1,due:2,assisted:false}");assert.equal(q('mainQuestNext().href'),'#lab/1');assert.equal(q('defaultChapter()'),1,'The quest book must not skip an unfinished lab');
  q(`state.labNotes[1]='x'.repeat(80);${book.units[0].lab.acceptance.map((_,j)=>`state.labChecks['1-${j}']=true;`).join('')}`);assert.equal(q('chapterQuestStep(1).kind'),'complete');assert.equal(q('mainQuestNext().href'),'#unit/2');assert.equal(q('mainTrail(1).filter(n=>n.done).length'),6,'Optional traces must not be counted in the main trail');
  assert(q('labContinuation(1)').includes('href="#quests/2"'),'A finished lab must lead to the next chapter reading');
  q("delete state.completed[4]");assert(!q('labContinuation(1)').includes('href="#quests/2"'),'An early lab record must not skip unfinished practice');
  q("state.game.briefs={};current={...lessons[0],isReview:false}");assert.equal(q('chapterReadingDone(1)'),true,'Legacy practice keeps the chapter usable');assert.equal(q('questReturnHash()'),'#quests/1');q('current.isReview=true');assert.equal(q('questReturnHash()'),'#review');q('current=null');
  assert.equal(q('finishChapterReading(99)'),'');q('state=JSON.parse('+JSON.stringify(before)+')');}
 console.log('Main quest trail: explicit reading, one-time XP, legacy progress, lab-first continuation, and optional branches verified.');
 console.log('Lab routing and workspace setup guide verified.');
 console.log('Timed test: one problem per tier, help off, drafts untouched, best run kept, expiry, backups, and test history verified.');
 console.log('Quest layer: level curve, XP migration, 48 trace answer keys in real Python, chapter locks, and quest-progress backup round-trip verified.');
 // Progress safety: each case boots a fresh copy of the real app against its own storage.
 const boot=async(storage,{storageHandlers={}}={})=>{const bootNodes=new Map(),selector=s=>{if(!bootNodes.has(s))bootNodes.set(s,{innerHTML:'',textContent:'',value:'',dataset:{},classList:{toggle(){},add(){},remove(){}}});return bootNodes.get(s);};const app={console,document:{querySelector:selector,querySelectorAll:()=>navigation,addEventListener(){}},window:{addEventListener:(t,f)=>storageHandlers[t]=f,scrollTo(){}},location:{hash:'#settings'},localStorage:storage,fetch:context.fetch,setTimeout,clearTimeout,setInterval,clearInterval,Date,Blob,URL,confirm:()=>true,FORGE_VERSION};vm.createContext(app);for(const file of ['app.js','traces.js','quest.js','journey.js'])vm.runInContext(fs.readFileSync('dist/'+file,'utf8'),app);await new Promise(r=>setTimeout(r,20));return {run:code=>vm.runInContext(code,app),notices:()=>selector('#notices').innerHTML,main:()=>selector('#main').innerHTML,fire:e=>storageHandlers.storage(e)};};
 const recoveryCopies=s=>[...s.data.keys()].filter(k=>k.startsWith(KEY+'-recovery-'));
 const progress={...legacy,events:[{id:1,at:Date.now()}]},fresh=()=>fakeStorage([[KEY,JSON.stringify(progress)]]);
 // A damaged record is copied aside exactly, with a warning, and survives the next save.
 for(const raw of ['{"version":1,"completed":','{"version":2}','[1,2]']){const s=fakeStorage([[KEY,raw]]),a=await boot(s);const copies=recoveryCopies(s);assert.equal(copies.length,1,`No recovery copy for ${raw}`);assert.equal(s.getItem(copies[0]),raw);assert(a.notices().includes('could not be read'),'No warning for an unreadable record');a.run("state.scratch='new';save()");assert.equal(s.getItem(copies[0]),raw,'Recovery copy lost after saving');assert(a.main().includes('Damaged data kept for recovery'),'Settings does not list the recovery copy');}
 {const raw='{broken',s=fakeStorage([[KEY,raw]]);await boot(s);s.setItem(KEY,raw);await boot(s);assert.equal(recoveryCopies(s).length,1,'Reloading duplicated the recovery copy');}
 // If the copy cannot be made, the damaged record must not be overwritten.
 {const raw='{broken',s=fakeStorage([[KEY,raw]]);s.failOn=k=>k.startsWith(KEY+'-recovery-');const a=await boot(s);assert(a.notices().includes('Saving is paused'),'No warning when the copy fails');a.run("state.scratch='new';save()");assert.equal(s.getItem(KEY),raw,'Save overwrote an uncopied damaged record');}
 // Healthy and first-run records raise no warning, and a brand-new browser stores no snapshot.
 {const s=fresh(),a=await boot(s);assert.equal(a.notices(),'','Healthy record raised a notice');assert.equal(recoveryCopies(s).length,0);const empty=fakeStorage([]),b=await boot(empty);b.run('save()');assert(!empty.data.has('forge-snapshots-v1'),'Empty progress was snapshotted');}
 // Snapshots: taken at boot, spaced out, skip identical state, roll over at the limit.
 {const s=fresh(),a=await boot(s),count=()=>JSON.parse(s.getItem('forge-snapshots-v1')).length;assert.equal(count(),1,'No snapshot at boot');a.run("state.scratch='a';save()");assert.equal(count(),1,'Snapshot ignored the spacing');a.run('takeSnapshot(true);takeSnapshot(true)');assert.equal(count(),2,'Identical snapshot stored');for(let i=0;i<8;i++)a.run(`state.scratch='edit ${i}';takeSnapshot(true)`);assert.equal(count(),5,'Snapshots not limited');a.run('lastSnapshotAt=Date.now()-7*3600000;state.scratch="later";save()');assert.equal(JSON.parse(s.getItem('forge-snapshots-v1')).at(-1).state.scratch,'later','Spaced snapshot not taken');
  // Restore: settings lists it, it passes backup validation, and the state before it can be undone.
  a.run('route()');assert(a.main().includes('data-safety="restore-snapshot"'),'Settings has no restore option');const oldest=JSON.parse(s.getItem('forge-snapshots-v1'))[0];a.run("state.scratch='before restore'");await a.run(`restoreSnapshot(${oldest.at})`);assert.equal(JSON.parse(s.getItem(KEY)).scratch,oldest.state.scratch,'Snapshot not restored');assert.equal(JSON.parse(s.getItem('forge-snapshots-v1')).at(-1).state.scratch,'before restore','Restore cannot be undone');}
 // A full disk costs snapshots, never the main record.
 {const s=fresh(),a=await boot(s);a.run("state.scratch='x';takeSnapshot(true);state.scratch='y';takeSnapshot(true)");s.failOn=k=>k===KEY&&s.data.has('forge-snapshots-v1');a.run("state.scratch='must survive';save()");assert.equal(JSON.parse(s.getItem(KEY)).scratch,'must survive','Main record lost to snapshots');}
 // When dropping snapshots cannot make room, the snapshots are kept.
 {const s=fresh(),a=await boot(s);a.run("state.scratch='x';takeSnapshot(true);state.scratch='y';takeSnapshot(true)");const kept=s.getItem('forge-snapshots-v1');s.failOn=k=>k===KEY;a.run("state.scratch='too big';save()");assert.equal(s.getItem('forge-snapshots-v1'),kept,'Snapshots lost to a save that failed anyway');}
 // Tabs: a new tab is noticed, a save elsewhere warns, and a closed tab clears the warning.
 {const s=fresh(),a=await boot(s);a.fire({key:'forge-tab-signal',newValue:'ping:other:1:1'});assert(a.notices().includes('open in another tab'),'Second tab not noticed');assert(s.getItem('forge-tab-signal').startsWith('here:'),'Tab did not answer the ping');a.fire({key:'forge-tab-signal',newValue:'bye:other:1:1'});assert.equal(a.notices(),'','Warning stayed after the other tab closed');assert(s.getItem('forge-tab-signal').startsWith('ping:'),'Remaining tabs not recounted');a.fire({key:KEY,newValue:'{}'});assert(a.notices().includes('Reload this tab'),'Save in another tab not noticed');a.fire({key:'other',newValue:'x'});}
 // A closing tab must not answer the recount its own goodbye starts, and a tab restored from the back/forward cache rejoins.
 {const s=fresh(),handlers={},a=await boot(s,{storageHandlers:handlers});handlers.pagehide();assert(s.getItem('forge-tab-signal').startsWith('bye:'),'Closing tab did not say goodbye');a.fire({key:'forge-tab-signal',newValue:'ping:other:1:1'});assert(s.getItem('forge-tab-signal').startsWith('bye:'),'Closing tab answered a ping');assert.equal(a.notices(),'','Closing tab raised a warning');handlers.pageshow({persisted:true});assert(s.getItem('forge-tab-signal').startsWith('ping:'),'Restored tab did not rejoin');}
 // Backup reminder: only after more than 7 days, cleared by exporting, quiet while snoozed.
 {const days=d=>Date.now()-d*86400000,old={...legacy,events:[{id:1,at:days(8)}]};const never=fakeStorage([[KEY,JSON.stringify(old)]]),a=await boot(never);assert(a.notices().includes('no backup yet'),'No reminder without a backup');a.run("dismissNotice('backup')");assert.equal(a.notices(),'');assert((await boot(never)).notices()==='','Dismissed reminder did not snooze');const stale=fakeStorage([[KEY,JSON.stringify(old)],['forge-last-export',String(days(8))]]);assert((await boot(stale)).notices().includes('8 days since your last backup'),'No reminder after 8 days');const recent=fakeStorage([[KEY,JSON.stringify(old)],['forge-last-export',String(days(6))]]);assert.equal((await boot(recent)).notices(),'','Reminder before 7 days');const newcomer=fakeStorage([]);assert.equal((await boot(newcomer)).notices(),'','Reminder with no progress');const noProgress=fakeStorage([['forge-last-export',String(days(30))]]);assert.equal((await boot(noProgress)).notices(),'','Reminder with no progress to protect');}
 console.log('Progress safety: damaged-record recovery, blocked saves, rolling snapshots and restore, full-storage priority, two-tab warnings, and backup reminders verified.');
 console.log(`${routes.length} routes rendered; original progress, old backup import, lesson 96 backup, lab checkboxes, evidence notes, and Windows commands verified in a DOM simulation.`);
})();
