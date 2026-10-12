export function draftStore(storage,namespace='fa-revision-draft:') {
  const key=draft=>`${namespace}${draft.reportId}:${draft.baseRevision}`;
  return {
    save(draft){try{const saved=Object.fromEntries(['reportId','baseRevision','baseContent','baseDates','content','dates','summary','filename'].map(name=>[name,draft[name]]));storage.setItem(key(draft),JSON.stringify({...saved,savedAt:new Date().toISOString()}));return true;}catch{return false;}},
    list(reportId){try{const drafts=[];for(let i=0;i<storage.length;i++){const name=storage.key(i);if(!name?.startsWith(`${namespace}${reportId}:`))continue;try{const draft=JSON.parse(storage.getItem(name));if(draft.reportId===reportId&&Number.isInteger(draft.baseRevision)&&draft.baseRevision>0&&typeof draft.content==='string'&&typeof draft.baseContent==='string'&&draft.dates&&typeof draft.dates==='object'&&draft.baseDates&&typeof draft.baseDates==='object')drafts.push({...draft,summary:typeof draft.summary==='string'?draft.summary:'',filename:typeof draft.filename==='string'?draft.filename:''});}catch{}}return drafts.sort((a,b)=>String(b.savedAt).localeCompare(String(a.savedAt)));}catch{return [];}},
    remove(draft){try{storage.removeItem(key(draft));}catch{}}
  };
}
