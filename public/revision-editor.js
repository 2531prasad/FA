import { inspectMarkdown, MAX_FILE_BYTES } from './shared/markdown-import.mjs';
import { validateDates, reportDates, formatInstant, formatDay } from './shared/chronology.mjs';
import { draftStore } from './shared/drafts.mjs';
import { diffHTML } from './shared/diff.mjs';

export function createRevisionEditor({api,escape,markdown,getReports,open,onSaved}) {
  let storage;try{storage=localStorage;}catch{}const drafts=draftStore(storage);
  let state=null,timer,saving=false;
  const labels=[['reportDate','Report date'],['informationCutoff','Information cutoff'],['marketDate','Market prices as of']];
  const latest=()=>getReports().find(r=>r.id===state?.reportId)?.revisions.at(-1);
  const stale=()=>latest()?.number!==state.baseRevision || latest()?.content!==state.baseContent;
  function persist(){if(!state||!state.dirty)return;const status=document.querySelector('#draft-status');if(state.recoverable?.some(d=>d.baseRevision===state.baseRevision)){if(status)status.textContent='Recover or discard the earlier saved draft before replacing it. Keep a copy of this incoming Markdown meanwhile.';return;}const okay=drafts.save(state);if(status)status.textContent=okay?'Draft saved in this browser.':'Browser draft storage is unavailable. Keep a copy of the Markdown before leaving.';}
  function begin(report,content,dates,filename='') {
    persist();const revision=report.revisions.at(-1);clearTimeout(timer);
    state={reportId:report.id,baseRevision:revision.number,baseContent:revision.content,baseDates:{...reportDates(report,revision)},content:content??revision.content,dates:{...reportDates(report,revision),...(dates ?? (content!==undefined?inspectMarkdown(content,filename).dates:{}))},summary:'',filename,preview:false,error:'',dirty:content!==undefined,recoverable:drafts.list(report.id)};
    open({resetScroll:true});if(state.dirty)persist();
  }
  function dateChanges(){return labels.filter(([key])=>state.baseDates[key]!==state.dates[key]).map(([key,label])=>`<p>${label}: ${formatDay(state.baseDates[key])} → ${formatDay(state.dates[key])}</p>`).join('') || '<p>Research dates are unchanged.</p>';}
  function render(){
    if(!state)return '';
    const report=getReports().find(r=>r.id===state.reportId),isStale=stale();
    return `<section class="view-content revision-editor" id="revision-editor"><div class="view-heading"><div><h1>Revise report</h1><p>${escape(report?.title)} / based on revision ${state.baseRevision}</p></div><button class="text-button" data-action="view" data-view="report">Back to report</button></div>${state.recoverable?.length?`<div class="warning-note"><p>Recoverable draft from ${formatInstant(state.recoverable[0].savedAt)}, based on revision ${state.recoverable[0].baseRevision}.</p><button type="button" class="text-button" data-editor-action="recover">Recover draft</button> <button type="button" class="text-button" data-editor-action="discard">Discard saved drafts</button></div>`:''}${isStale?'<div class="warning-note">The saved report has changed since this draft began. <button class="text-button" type="button" data-editor-action="rebase">Review draft against the latest revision</button></div>':''}<form id="revision-editor-form"><p id="draft-status" class="form-note" role="status">Drafts are stored in this browser until you save a revision.</p><p class="form-note">Dates start from the existing report. File metadata can suggest replacements; review them before saving. Blank dates mean not recorded.</p><div class="date-fields">${labels.map(([key,label])=>`<label class="field">${label}<input type="date" data-editor-field="${key}" value="${escape(state.dates[key] || '')}" ${state.preview?'disabled':''}></label>`).join('')}</div>${state.preview?`<div class="date-change-callout"><h2>Date changes</h2>${dateChanges()}</div><h2>Content changes</h2><p class="diff-legend"><ins>Added</ins> / <del>Removed</del></p>${diffHTML(state.baseContent,state.content,escape)}<details class="import-preview"><summary>Read the revised report</summary><div class="report-body">${markdown(state.content,'revision-preview')}</div></details>`:`<div class="dropzone" id="revision-dropzone"><strong>Drop one revised Markdown file here</strong><button class="button" type="button" data-editor-action="choose">Choose revised file</button><input type="file" id="revision-file" accept=".md,.markdown,.txt" hidden></div>${state.filename?`<p class="form-note">Source: ${escape(state.filename)}. Original revision remains intact.</p>`:''}<label class="field">Complete revised Markdown<textarea id="revision-content" data-editor-field="content" class="editor" rows="20" maxlength="200000" required>${escape(state.content)}</textarea></label><button class="text-button" type="button" data-editor-action="metadata">Read dates from this Markdown</button>`}<label class="field">What changed?<input data-editor-field="summary" maxlength="500" value="${escape(state.summary)}" required placeholder="Describe the substantive change."></label><p id="revision-error" class="form-error" role="alert">${escape(state.error)}</p><div class="action-row">${state.preview?'<button class="button" type="button" data-editor-action="edit">Continue editing</button>':''}<button class="button primary" type="submit" ${isStale?'disabled':''}>${state.preview?'Save new revision':'Review changes'}</button></div></form></section>`;
  }
  function redraw(){open({resetScroll:true});}
  function setError(error){state.error=error.message;const target=document.querySelector('#revision-error');if(target)target.textContent=state.error;}
  function applyMarkdown(content,filename=''){const meta=inspectMarkdown(content,filename);state.content=content;state.dates={...state.dates,...meta.dates};state.filename=filename;state.dirty=true;state.preview=false;state.error='';persist();redraw();}
  async function readFile(file){try{if(!file)return;if(!/\.(md|markdown|txt)$/i.test(file.name))throw new Error('Choose a Markdown or text file.');if(file.size>MAX_FILE_BYTES)throw new Error('The file exceeds 850 KB.');applyMarkdown(new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(await file.arrayBuffer()),file.name);}catch(error){setError(error);}}
  document.addEventListener('input',event=>{const field=event.target.dataset.editorField;if(!field||!state)return;if(['content','summary'].includes(field))state[field]=event.target.value;else state.dates[field]=event.target.value;state.dirty=true;state.error='';clearTimeout(timer);timer=setTimeout(persist,300);});
  document.addEventListener('change',event=>{if(event.target.id==='revision-file')readFile(event.target.files[0]);});
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-editor-action]');if(!button||!state)return;
    try{
      const action=button.dataset.editorAction;
      if(action==='choose')document.querySelector('#revision-file').click();
      if(action==='metadata')applyMarkdown(state.content,state.filename);
      if(action==='edit'){state.preview=false;redraw();}
      if(action==='discard'){for(const draft of state.recoverable)drafts.remove(draft);state.recoverable=[];redraw();persist();}
      if(action==='recover'){const recovered=state.recoverable[0];state={...recovered,preview:false,error:'',dirty:true,recoverable:[]};redraw();}
      if(action==='rebase'){persist();const revision=latest(),report=getReports().find(r=>r.id===state.reportId);if(!revision)throw new Error('This report is no longer available. Keep a copy of the draft.');state.baseRevision=revision.number;state.baseContent=revision.content;state.baseDates={...reportDates(report,revision)};state.recoverable=drafts.list(state.reportId).filter(d=>d.baseRevision===revision.number&&d.content!==state.content);state.preview=true;state.dirty=true;redraw();persist();}
    }catch(error){setError(error);}
  });
  document.addEventListener('submit',async event=>{
    if(event.target.id!=='revision-editor-form')return;event.preventDefault();if(saving)return;clearTimeout(timer);persist();
    const form=event.target,button=form.querySelector('[type=submit]');
    try{
      if(state.recoverable?.some(d=>d.baseRevision===state.baseRevision))throw new Error('Recover or discard the earlier saved draft before saving this replacement.');
      if(stale())throw new Error('The saved report advanced. Review against the latest revision before saving.');
      state.dates=validateDates(state.dates);if(!state.content.trim())throw new Error('Add the complete report content.');if(!state.summary.trim())throw new Error('Describe what changed.');
      if(!state.preview){state.preview=true;redraw();return;}
      saving=true;button.disabled=true;button.textContent='Saving revision…';
      const saved=await api(`/api/reports/${state.reportId}/revisions`,{baseRevision:state.baseRevision,baseContent:state.baseContent,content:state.content,dates:state.dates,summary:state.summary});
      for(const draft of drafts.list(state.reportId))if(draft.baseRevision===state.baseRevision||draft.content===state.content)drafts.remove(draft);
      state.dirty=false;await onSaved(saved);
    }catch(error){if(error.status===409)await onConflict();setError(error);if(stale())redraw();else{button.disabled=false;button.textContent=state.preview?'Save new revision':'Review changes';}}finally{saving=false;}
  });
  document.addEventListener('drop',event=>{if(!event.target.closest?.('#revision-editor')||!Array.from(event.dataTransfer?.types || []).includes('Files'))return;event.preventDefault();document.body.classList.remove('file-drag');if(event.dataTransfer.files.length!==1){setError(new Error('Choose one revised file for this report.'));return;}readFile(event.dataTransfer.files[0]);});
  window.addEventListener('beforeunload',persist);
  async function onConflict(){try{const saved=await api(`/api/reports/${state.reportId}`);const reports=getReports(),index=reports.findIndex(r=>r.id===saved.id);if(index>=0)reports[index]=saved;}catch{}}
  return {begin,render,persist,beginFile(report,file){begin(report);return readFile(file);}};
}
