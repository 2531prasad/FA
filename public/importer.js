import { inspectMarkdown, MAX_FILE_BYTES, MAX_REPORT_CHARACTERS } from '/markdown-import.js';
import { validateDates } from '/chronology.js';
import { groupKey, groupName } from '/groups.js';

export function createMarkdownImporter({api,escape,markdown,getReports,getActive,open,onComplete}) {
  const state={files:[],paste:null,pasteText:'',destination:null,newQuery:'',agent:'',busy:false,reading:false,status:'',readErrors:[],touched:new Set()};
  const dateLabels=[['reportDate','Report date'],['informationCutoff','Information cutoff'],['marketDate','Market prices as of']];
  function destination(){const groups=new Map(getReports().map(r=>[groupKey(r),r]));if(state.destination===null)state.destination=getActive()?groupKey(getActive()):(groups.keys().next().value || '');return {groups,selected:groups.get(state.destination)};}
  function drafts(){return [...state.files,...(state.paste?[state.paste]:[])];}
  function makeDraft(content,filename='',originalFile=null){const meta=inspectMarkdown(content,filename);return {id:crypto.randomUUID(),content,title:meta.title,dates:meta.dates,agent:meta.agent,filename,originalFile,error:'',touched:new Set()};}
  function fields(draft){return `<section class="import-draft" data-draft="${draft.id}"><div class="import-draft-heading"><strong>${escape(draft.filename || 'Pasted Markdown')}</strong>${draft.originalFile?`<button class="text-button" type="button" data-import-action="remove" data-draft-id="${draft.id}">Remove</button>`:''}</div><label class="field">Report title<input data-draft-field="title" data-draft-id="${draft.id}" required maxlength="200" value="${escape(draft.title)}"></label><div class="date-fields">${dateLabels.map(([key,label])=>`<label class="field">${label}<input type="date" data-draft-field="${key}" data-draft-id="${draft.id}" value="${escape(draft.dates[key] || '')}"></label>`).join('')}</div><p class="form-note">${draft.content.length.toLocaleString()} characters${draft.agent?` / source: ${escape(draft.agent)}`:''}. Blank dates remain unrecorded.</p><p class="form-error" data-draft-error="${draft.id}" role="alert">${escape(draft.error)}</p><details class="import-preview"><summary>Preview report</summary><div class="report-body">${markdown(draft.content,`preview-${draft.id}`)}</div></details></section>`;}
  function render(){
    const {groups}=destination();
    return `<section class="view-content import-view"><div class="view-heading"><h1>Import Markdown</h1><button class="text-button" type="button" data-action="view" data-view="report">Back to report</button></div><form id="markdown-import-form"><div class="import-destination"><label class="field">Add reports to<select id="import-destination">${[...groups].map(([key,report])=>`<option value="${escape(key)}" ${state.destination===key?'selected':''}>${escape(groupName(report))}</option>`).join('')}<option value="" ${state.destination===''?'selected':''}>New research query</option></select></label><label id="new-query-field" class="field" ${state.destination!==''?'hidden':''}>Research query<input id="import-query" maxlength="200" value="${escape(state.newQuery)}" ${state.destination===''?'required':''} placeholder="The question these reports answer"></label><label class="field">Source / agent (optional)<input id="import-agent" maxlength="100" value="${escape(state.agent)}" placeholder="Claude, Gemini, Codex, or another source"></label></div><div class="dropzone" id="markdown-dropzone"><strong>Drop Markdown files here</strong><span>.md, .markdown, or .txt / multiple files supported</span><button class="button" type="button" data-import-action="choose">Choose files</button><input type="file" id="markdown-files" accept=".md,.markdown,.txt,text/markdown,text/plain" multiple hidden></div><label class="field paste-field">Or paste AI Markdown<textarea id="paste-markdown" rows="9" maxlength="${MAX_REPORT_CHARACTERS}" placeholder="Paste the complete Markdown output from any AI.">${escape(state.pasteText)}</textarea></label><div id="import-drafts">${drafts().map(fields).join('')}</div><div id="import-read-errors" class="form-error" role="alert">${state.readErrors.map(escape).join('<br>')}</div><div class="import-submit"><p id="import-status" class="form-error" role="status">${escape(state.status)}</p><button class="button primary" type="submit" id="save-imports" ${!drafts().length || state.busy || state.reading?'disabled':''}>Import ${drafts().length || ''} report${drafts().length===1?'':'s'}</button></div></form></section>`;
  }
  function refreshDrafts(){const target=document.querySelector('#import-drafts');if(target)target.innerHTML=drafts().map(fields).join('');const button=document.querySelector('#save-imports');if(button){button.disabled=!drafts().length||state.busy||state.reading;button.textContent=`Import ${drafts().length || ''} report${drafts().length===1?'':'s'}`;}const errors=document.querySelector('#import-read-errors');if(errors)errors.innerHTML=state.readErrors.map(escape).join('<br>');}
  function suggestQuery(meta){if(state.destination==='' && !state.touched.has('query') && meta.query){state.newQuery=meta.query;const field=document.querySelector('#import-query');if(field)field.value=meta.query;}}
  async function addFiles(files){
    if(state.busy||state.reading)return;
    open();state.reading=true;state.readErrors=[];refreshDrafts();
    try {
      for(const file of Array.from(files)) {
        try {
          if(state.files.length>=20)throw new Error('Import at most 20 files at a time.');
          if(!/\.(md|markdown|txt)$/i.test(file.name))throw new Error('Choose a .md, .markdown, or .txt file.');
          if(file.size>MAX_FILE_BYTES)throw new Error('The file exceeds the 850 KB limit.');
          const bytes=await file.arrayBuffer();const content=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(bytes);
          const draft=makeDraft(content,file.name,{name:file.name});
          const meta=inspectMarkdown(content,file.name);suggestQuery(meta);
          if(state.files.some(d=>d.filename===file.name&&d.content===content))continue;
          state.files.push(draft);
        }catch(error){state.readErrors.push(`${file.name}: ${error.message}`);}
      }
    }finally{state.reading=false;refreshDrafts();}
  }
  let pasteTimer;
  function updatePaste(){
    const content=state.pasteText;
    if(!content.trim()){state.paste=null;state.readErrors=state.readErrors.filter(e=>!e.startsWith('Paste:'));refreshDrafts();return;}
    try{
      const meta=inspectMarkdown(content);suggestQuery(meta);
      if(!state.paste)state.paste=makeDraft(content);
      else {const draft=state.paste;draft.content=content;if(!draft.touched.has('title'))draft.title=meta.title;for(const [key] of dateLabels)if(!draft.touched.has(key))draft.dates[key]=meta.dates[key] || '';draft.agent=meta.agent;draft.error='';}
      state.readErrors=state.readErrors.filter(e=>!e.startsWith('Paste:'));
    }catch(error){state.paste=null;state.readErrors=state.readErrors.filter(e=>!e.startsWith('Paste:'));state.readErrors.push(`Paste: ${error.message}`);}
    refreshDrafts();
  }
  document.addEventListener('input',event=>{
    if(event.target.id==='paste-markdown'){state.pasteText=event.target.value;clearTimeout(pasteTimer);pasteTimer=setTimeout(updatePaste,250);}
    if(event.target.id==='import-query'){state.newQuery=event.target.value;state.touched.add('query');}
    if(event.target.id==='import-agent')state.agent=event.target.value;
    if(event.target.dataset.draftField){const draft=drafts().find(d=>d.id===event.target.dataset.draftId);if(!draft)return;const field=event.target.dataset.draftField;draft.touched.add(field);if(field==='title')draft.title=event.target.value;else draft.dates[field]=event.target.value;}
  });
  document.addEventListener('change',event=>{
    if(event.target.id==='markdown-files')addFiles(event.target.files);
    if(event.target.id==='import-destination'){state.destination=event.target.value;document.querySelector('#new-query-field').hidden=state.destination!=='';document.querySelector('#import-query').required=state.destination==='';}
  });
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-import-action]');if(!button||state.busy)return;
    if(button.dataset.importAction==='choose')document.querySelector('#markdown-files').click();
    if(button.dataset.importAction==='remove'){state.files=state.files.filter(d=>d.id!==button.dataset.draftId);refreshDrafts();}
  });
  document.addEventListener('submit',async event=>{
    if(event.target.id!=='markdown-import-form')return;event.preventDefault();if(state.busy||state.reading)return;
    clearTimeout(pasteTimer);updatePaste();
    const queue=drafts(),{selected}=destination();if(!queue.length)return;
    const group=selected?(selected.query?{query:selected.query}:{company:selected.company,ticker:selected.ticker}):{query:state.newQuery.trim()};
    state.status='';
    if(!selected&&!group.query){state.status='Enter the research query for these reports.';document.querySelector('#import-status').textContent=state.status;return;}
    for(const draft of queue){try{validateDates(draft.dates);if(!draft.title.trim())throw new Error('Add a report title.');draft.error='';}catch(error){draft.error=error.message;}}
    if(queue.some(d=>d.error)){refreshDrafts();return;}
    state.busy=true;const controls=[...event.target.querySelectorAll('input,textarea,select,button')];for(const control of controls)control.disabled=true;
    const successful=[],failures=[];
    try{
      for(const [index,draft] of queue.entries()) {
        const button=document.querySelector('#save-imports');if(button)button.textContent=`Importing ${index+1} of ${queue.length}`;
        try{
          const result=await api('/api/import',{...group,title:draft.title,content:draft.content,dates:draft.dates,agent:state.agent || draft.agent,originalFile:draft.originalFile || undefined});
          successful.push(result);state.files=state.files.filter(d=>d.id!==draft.id);if(state.paste?.id===draft.id){state.paste=null;state.pasteText='';}
        }catch(error){draft.error=error.message;failures.push(draft);}
      }
    }finally{
      state.busy=false;for(const control of controls)control.disabled=false;
      const textarea=document.querySelector('#paste-markdown');if(textarea)textarea.value=state.pasteText;
      state.status=failures.length?`${successful.length} of ${queue.length} reports saved. Failed items remain below for retry.`:'';const status=document.querySelector('#import-status');if(status)status.textContent=state.status;refreshDrafts();
    }
    await onComplete(successful,failures);
  });
  let dragDepth=0;
  const isFileDrag=event=>Array.from(event.dataTransfer?.types || []).includes('Files');
  document.addEventListener('dragenter',event=>{if(!isFileDrag(event))return;event.preventDefault();dragDepth++;document.body.classList.add('file-drag');});
  document.addEventListener('dragover',event=>{if(!isFileDrag(event))return;event.preventDefault();event.dataTransfer.dropEffect='copy';});
  document.addEventListener('dragleave',event=>{if(!isFileDrag(event))return;dragDepth=Math.max(0,dragDepth-1);if(!dragDepth)document.body.classList.remove('file-drag');});
  document.addEventListener('drop',event=>{if(!isFileDrag(event))return;event.preventDefault();dragDepth=0;document.body.classList.remove('file-drag');if(event.dataTransfer.files.length)addFiles(event.dataTransfer.files);});
  window.addEventListener('blur',()=>{dragDepth=0;document.body.classList.remove('file-drag');});
  return {render,addFiles};
}
