/* Required GitHub learning workflow. Records learner confirmations, never credentials. */
function workspaceReady() {
  const w=qGame().workspace;
  return !!workspaceRepoUrl(w.repoUrl)&&WORKSPACE_CHECKS.every(key=>w.checks[key]===true);
}
function workspaceLabReady(week) {
  const g=qGame(),record=g.labCommits[week];
  return g.legacyLabs[week]===true||(workspaceReady()&&!!record&&validLabCommit(record.sha)&&record.pushed===true);
}
function workspaceRepoField() {
  const raw=qGame().workspace.repoUrl;
  return `<label for="workspace-repo">Your private learning repository URL</label><input type="url" class="form-input" id="workspace-repo" autocomplete="url" spellcheck="false" placeholder="https://github.com/YOUR-USERNAME/forge-work" value="${esc(raw)}" aria-describedby="workspace-repo-help"><p id="workspace-repo-help" class="workspace-validation">${workspaceRepoUrl(raw)?'Repository address recorded. Confirm its visibility is Private on GitHub.':raw?'Enter an HTTPS github.com/owner/repository address for your learning work. Use a separate repository from Forge itself.':'Paste the address of the private learning repository you created on GitHub. Forge does not need a password or token.'}</p>`;
}
function workspaceStepFooter(week,step) {
  const guide=handbook.workspace,last=step===guide.sections.length,key=guide.sections[step-1].key;
  const checked=qGame().workspace.checks[key]===true,urlNeeded=step>=5,ready=checked&&(!urlNeeded||!!workspaceRepoUrl(qGame().workspace.repoUrl));
  return `<nav class="setup-step-navigation" aria-label="Workspace setup steps">${step>1?`<a class="btn light" href="#workspace/${week}/${step-1}">← Previous step</a>`:''}${last?(workspaceReady()?`<a class="btn" href="#setup/${week}/1">GitHub workspace recorded: set up chapter ${week} lab →</a>`:'<button class="btn" disabled>Complete the workspace checklist to continue</button>'):(ready?`<a class="btn" href="#workspace/${week}/${step+1}">Next: ${esc(guide.sections[step].title)} →</a>`:'<button class="btn" disabled>Confirm this step above to continue</button>')}</nav><p class="setup-step-note">${last&&!workspaceReady()?'All eight steps and a valid repository address are required. Open the checklist below to find what remains.':'Work through the instructions on your computer, confirm the result, then select Next. Your checklist saves automatically.'}</p>`;
}
function renderWorkspace(number=1,requestedStep=1) {
  const week=validWeek(number),guide=handbook.workspace,step=Number.isInteger(requestedStep)&&requestedStep>=1&&requestedStep<=guide.sections.length?requestedStep:1;
  const item=guide.sections[step-1],g=qGame(),repo=workspaceRepoUrl(g.workspace.repoUrl),command=item.remoteCommand?(repo?`git remote add origin ${repo}.git\ngit remote -v`:null):item.command||item[setupPlatform];
  return `${chapterOrientation(week,6,'Required learning workspace')}${header(guide.title,guide.intro)}<div class="reading-page setup-wizard workspace-wizard"><p class="workspace-part">PART 1 OF 2 · GitHub workspace once. Part 2 sets up the chapter's Python files.</p><div class="setup-wizard-progress"><strong>Workspace step ${step} of ${guide.sections.length}</strong><span id="workspace-count">${WORKSPACE_CHECKS.filter(key=>g.workspace.checks[key]).length} confirmations recorded</span></div><div class="setup-progress-track"><span style="width:${step/guide.sections.length*100}%"></span></div>${platformPicker()}<section class="card learn-card setup-step" id="workspace-step-${step}"><span class="learn-kicker">REQUIRED WORKSPACE STEP ${step}</span><h2>${esc(item.title)}</h2>${paras(item.text)}${(item.links||[]).map(link=>`<p><a href="${esc(link.url)}" target="_blank" rel="noopener noreferrer">${esc(link.label)} ↗</a> (opens a new tab)</p>`).join('')}${item.fileCode?`<p class="command-label">${esc(item.fileLabel)}</p><pre>${esc(item.fileCode)}</pre>`:''}${item.repoField?workspaceRepoField():''}${item.remoteCommand&&!repo?'<p class="course-notice">Record your repository URL in step 5 before connecting it. <a href="#workspace/'+week+'/5">Open repository step →</a></p>':''}${command?`<p class="command-label">In the VS Code terminal, inside Forge Work:</p><pre>${esc(command)}</pre>`:''}${item.after?paras(item.after):''}<label class="workspace-confirm"><input type="checkbox" data-workspace-check="${item.key}" ${g.workspace.checks[item.key]?'checked':''}>${esc(item.confirm)}</label></section><div id="workspace-step-footer" data-week="${week}" data-step="${step}">${workspaceStepFooter(week,step)}</div><details class="setup-all-steps"><summary>Required workspace checklist / jump to a step</summary><ol>${guide.sections.map((s,i)=>`<li><a href="#workspace/${week}/${i+1}" data-workspace-jump="${i}" ${step===i+1?'aria-current="step"':''}>${g.workspace.checks[s.key]?'✓ ':''}${esc(s.title)}</a></li>`).join('')}</ol></details><details class="card setup-help"><summary>Git or GitHub problem? Open troubleshooting</summary>${guide.problems.map(p=>`<details class="setup-problem"><summary>${esc(p.title)}</summary>${paras(p.text)}${p.updateRemote&&repo?`<pre>${esc('git remote set-url origin '+repo+'.git\ngit remote -v')}</pre>`:''}</details>`).join('')}<p>Official references: ${guide.sources.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)}</a>`).join(' · ')}</p></details><p class="workspace-self-report">This is a required learning checklist, recorded from your confirmations. Forge cannot inspect your private GitHub repository or verify a push from this browser. Browser lessons remain available while you set up.</p><p><a href="#lab/${week}">Return to chapter ${week} lab brief →</a></p></div>`;
}
function updateWorkspaceFooter() {
  const footer=$('#workspace-step-footer');if(footer)footer.innerHTML=workspaceStepFooter(Number(footer.dataset.week),Number(footer.dataset.step));
  const count=$('#workspace-count');if(count)count.textContent=WORKSPACE_CHECKS.filter(key=>qGame().workspace.checks[key]).length+' confirmations recorded';
  document.querySelectorAll('[data-workspace-jump]').forEach(link=>{const index=Number(link.dataset.workspaceJump),item=handbook.workspace.sections[index];link.textContent=(qGame().workspace.checks[item.key]?'✓ ':'')+item.title;});
}
function labGitRoutine(week) {
  const folder='week-'+String(week).padStart(2,'0'),g=qGame(),record=g.labCommits[week]||{sha:'',pushed:false};
  const command=`cd ..\ngit status\ngit diff -- ${folder}\ngit add ${folder}\ngit diff --staged\ngit commit -m "Finish chapter ${week} lab"\ngit push\ngit status -sb\ngit rev-parse HEAD\ncd ${folder}`;
  return `<section class="lab-github-routine"><h2>5. Commit, push, and record this lab</h2>${g.legacyLabs[week]?'<p class="workspace-legacy">Your earlier completed lab record is preserved. Use this GitHub routine when revisiting it. New labs require the workspace and push record.</p>':''}${!workspaceReady()?`<div class="course-notice"><strong>Required: GitHub learning workspace</strong><p>Finish the one-time guide before a new lab can be completed.</p><a class="btn" href="#workspace/${week}/1">Set up my required GitHub workspace →</a></div>`:`<p>Learning repository: <a href="${esc(workspaceRepoUrl(g.workspace.repoUrl))}" target="_blank" rel="noopener noreferrer">${esc(workspaceRepoUrl(g.workspace.repoUrl))}</a>. <a href="#workspace/${week}/5">Review or change setup</a>.</p>`}<p>Save your files and run the lab tests and main.py from inside <b>${folder}</b>. Once the program meets the acceptance criteria, run the commands below one line at a time. The first command moves from the chapter folder to <b>Forge Work</b>; the final command returns to the chapter folder.</p><pre>${esc(command)}</pre><p>Before committing, inspect the staged diff. New files may not appear in the first diff; <b>git diff --staged</b> shows what git add selected. The chapter's .gitignore keeps .venv and caches out. Commit only your intended source, tests, README, and sample data. Use a message describing your actual change.</p><p>If Git says nothing to commit, your saved files may already be committed. Run <b>git push</b> to upload any pending commits. If your branch is ahead, its commits are still local. Success means no ahead/behind counts after the push and the latest chapter files visible on GitHub. For a rejected push, <a href="#workspace/${week}/7">open sign-in and push help</a>; keep your local history.</p><label for="lab-commit">Full commit ID from git rev-parse HEAD</label><input class="form-input" id="lab-commit" data-lab-commit="${week}" value="${esc(record.sha)}" placeholder="Paste the full 40-character commit ID" spellcheck="false" autocomplete="off"><p class="workspace-validation" id="lab-commit-help">${validLabCommit(record.sha)?'Commit ID recorded. Confirm below after checking GitHub.':record.sha?'Paste the full hexadecimal commit ID printed by git rev-parse HEAD.':'Copy the full commit ID after the push succeeds.'}</p><label class="workspace-confirm"><input type="checkbox" data-lab-pushed="${week}" ${record.pushed?'checked':''}>I pushed this commit and checked that GitHub shows this chapter's latest files.</label><p class="workspace-self-report">Forge records this address, commit ID, and confirmation as evidence. It does not independently verify the private repository.</p></section>`;
}

const githubSetupBase=renderSetup;
renderSetup=function(week=1,step=1){return `<div class="workspace-part">PART 2 OF 2 · Chapter Python/lab setup. ${workspaceReady()?'GitHub workspace recorded.':`<a href="#workspace/${validWeek(week)}/1">Complete the required GitHub workspace first →</a>`}</div>`+githubSetupBase(week,step);};
const githubLabBase=renderLab;
renderLab=function(number){
  const week=validWeek(number);let html=githubLabBase(week);
  if(!workspaceReady())html=html.replace(`href="#setup/${week}"`, `href="#workspace/${week}/1"`).replace('First lab? Start guided setup','Required: set up GitHub workspace');
  html=html.replace('<div id="lab-continuation">',labGitRoutine(week)+'<div id="lab-continuation">');
  return html;
};
const githubContinuationBase=labContinuation;
labContinuation=function(week){
  const g=qGame(),ready=workspaceLabReady(week),record=g.labCommits[week];
  if(ready)return githubContinuationBase(week);
  const u=handbook.units[week-1],remaining=u.lab.acceptance.filter((_,j)=>!state.labChecks[`${week}-${j}`]).length,count=(state.labNotes[week]||'').trim().length;
  return `<div role="status"><strong>Required before completing this lab</strong><ul>${!workspaceReady()?`<li><a href="#workspace/${week}/1">Finish your GitHub workspace setup.</a></li>`:''}${!validLabCommit(record?.sha)?'<li>Commit and push the lab, then paste its full commit ID in section 5.</li>':''}${!record?.pushed?'<li>Confirm in section 5 that GitHub shows the pushed chapter files.</li>':''}${remaining?`<li>Verify and check ${remaining} remaining acceptance ${remaining===1?'criterion':'criteria'}.</li>`:''}${count<Q.labNoteMin?`<li>Add ${Q.labNoteMin-count} more characters to your evidence note (${count}/${Q.labNoteMin}).</li>`:''}</ul></div><p><a href="#quests/${week}">Return to chapter ${week} quest book →</a></p>`;
};

document.addEventListener('input',event=>{
  const t=event.target,g=qGame();
  if(t.id==='workspace-repo'){
    if(workspaceRepoUrl(g.workspace.repoUrl)!==workspaceRepoUrl(t.value)){
      for(const key of ['created','linked','pushed','verified'])g.workspace.checks[key]=false;
      for(const record of Object.values(g.labCommits))record.pushed=false;
    }
    g.workspace.repoUrl=workspaceRepoUrl(t.value);save();
    if($('#workspace-repo-help'))$('#workspace-repo-help').textContent=workspaceRepoUrl(t.value)?'Repository address recorded. Confirm its visibility is Private on GitHub.':'Enter an HTTPS github.com/owner/repository address for your own learning work, without credentials or tokens.';
    if($('#workspace-step-5 [data-workspace-check]'))$('#workspace-step-5 [data-workspace-check]').checked=!!g.workspace.checks.created;
    updateWorkspaceFooter();
  }
  if(t.dataset.labCommit){
    const week=Number(t.dataset.labCommit),old=g.labCommits[week]||{sha:'',pushed:false};
    g.labCommits[week]={sha:validLabCommit(t.value)?t.value.trim().toLowerCase():'',pushed:old.sha.trim().toLowerCase()===t.value.trim().toLowerCase()&&old.pushed};
    if($('#lab-commit-help'))$('#lab-commit-help').textContent=validLabCommit(t.value)?'Commit ID recorded. Confirm below after checking GitHub.':'Paste the full hexadecimal ID from git rev-parse HEAD.';
    const check=document.querySelector('[data-lab-pushed]');if(check)check.checked=g.labCommits[week].pushed;
    save();updateLabContinuation(week);
  }
});
document.addEventListener('change',event=>{
  const t=event.target,g=qGame();
  if(WORKSPACE_CHECKS.includes(t.dataset.workspaceCheck)){g.workspace.checks[t.dataset.workspaceCheck]=t.checked;save();updateWorkspaceFooter();}
  if(t.dataset.labPushed){const week=Number(t.dataset.labPushed),record=g.labCommits[week]||{sha:'',pushed:false};record.pushed=t.checked;g.labCommits[week]=record;save();updateLabContinuation(week);questCheckLab(week);}
});
