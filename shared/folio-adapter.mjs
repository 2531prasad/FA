import { parseResearchMetadata } from './research-metadata.mjs';
import { lineDiff } from './line-diff.mjs';
import { reportDates } from './chronology.mjs';

const clean=value=>value.replace(/!?\[([^\]]+)\]\([^)]*\)/g,'$1').replace(/[*_`#]/g,'').trim();
const normalized=value=>{const parts=[];for(const part of value.split('/')){if(!part||part==='.')continue;if(part==='..')parts.pop();else parts.push(part);}return parts.join('/');};
function reportPaths(reports) {
  const names=reports.map(r=>r.originalFile?.name),counts=new Map();
  for(const name of names)if(name)counts.set(name,(counts.get(name)||0)+1);
  return new Map(reports.map(r=>{
    const name=r.originalFile?.name;
    const safe=name&&/\.md$/i.test(name)&&!name.startsWith('/')&&!name.includes('\\')&&!name.split('/').some(p=>!p||p.startsWith('.'));
    return [r.id,safe&&counts.get(name)===1&&!/^Reports\/[a-f0-9]{8}-[a-f0-9-]{27}\.md$/i.test(name)?name:`Reports/${r.id}.md`];
  }));
}

// Adapt existing versioned records; never create dates, canonical status or model identities.
export async function createFolioAdapter(client,{digest=async content=>{
  const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(content));
  return Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
}}={}) {
  let records=[],paths=new Map(),views=new Map();
  async function project(report) {
    const file=paths.get(report.id),latest=report.revisions.at(-1),content=latest.content;
    const research=parseResearchMetadata(content,file),lines=content.split('\n');
    const dates=new Map(research.reportDates);
    for(const [label,key] of [['Prepared','reportDate'],['Information cutoff','informationCutoff'],['Price date','marketDate']]){
      const value=reportDates(report,latest)[key];if(value&&!dates.has(label))dates.set(label,value);
    }
    const history=await Promise.all(report.revisions.map(async(revision,index)=>{
      const diff=index?lineDiff(report.revisions[index-1].content,revision.content):[];
      return {id:String(revision.number),hash:await digest(revision.content),content:revision.content,
        observedAt:revision.createdAt,modifiedAt:revision.createdAt,source:index?'Saved revision':'Initial snapshot',
        note:revision.summary,added:diff.filter(l=>l.type==='added').length,removed:diff.filter(l=>l.type==='removed').length};
    }));
    const links=[...content.matchAll(/\[[^\]]*\]\(([^)]+\.md)(?:#[^)]*)?\)/g)].map(m=>normalized((file.includes('/')?file.slice(0,file.lastIndexOf('/')+1):'')+m[1]));
    const pinned=await Promise.all((report.sources||[]).map(async source=>{
      const record=records.find(r=>r.id===source.id),version=record?.revisions.find(r=>r.number===source.revision);
      return {path:paths.get(source.id)||`Reports/${source.id}.md`,hash:version?await digest(version.content):null};
    }));
    const sourceReports=[...research.sourceReports];for(const pin of pinned)if(!sourceReports.some(s=>s.path===pin.path))sourceReports.push(pin);
    links.push(...sourceReports.map(s=>s.path));
    const summary=clean(lines.find(l=>/^\*\*Overall judgment:/.test(l))||lines.find(l=>l.length>100&&!/^[#|>]/.test(l)&&!/cutoff|Prepared:/.test(l))||'').slice(0,280);
    const words=content.trim().split(/\s+/).length;
    return {path:file,recordId:report.id,baseRevision:latest.number,title:report.title,content,
      label:report.type==='Review'?'Combined review':report.type==='Super report'?'Source compilation':'Report',
      kind:report.type==='Review'?'Review':report.type==='Super report'?'Source compilation':'Research',
      query:report.query||[report.company,report.ticker].filter(Boolean).join(' · '),summary,
      headings:lines.filter(l=>/^#{2,3} /.test(l)||/^\*\*[^*]+\*\*$/.test(l.trim())).map(clean),
      tables:lines.filter(l=>/^\|\s*:?-{3}/.test(l)).length,words,minutes:Math.max(1,Math.ceil(words/220)),
      links:[...new Set(links)],modifiedAt:latest.createdAt,observedAt:history[0].observedAt,
      hash:history.at(-1).hash,revisions:history.length,featured:report.type==='Review',color:'coral',
      ...research,model:research.model||report.agent||null,sourceReports,reportDates:[...dates],history};
  }
  async function refresh() {
    records=await client.api('/api/reports');paths=reportPaths(records);
    views=new Map(await Promise.all(records.map(async r=>[paths.get(r.id),await project(r)])));
  }
  const publicView=view=>{const {history,...rest}=view;return rest;};
  const error=message=>{throw new Error(message);};
  async function api(route,options) {
    const url=new URL(route,'http://workspace.invalid'),method=options?.method||'GET';
    if(method!=='GET'&&client.runtime.readOnly)return error('The published library is read-only. Save reports in the local workspace, then push to GitHub.');
    if(url.pathname==='/api/reports'&&method==='GET'){
      await refresh();return {reports:[...views.values()].map(publicView),token:'',readOnly:client.runtime.readOnly};
    }
    if(!views.size)await refresh();
    if(url.pathname==='/api/import'&&method==='POST'){
      const input=JSON.parse(options.body),metadata=parseResearchMetadata(input.content,input.filename);
      const query=input.query||metadata.declaredQuery;
      if(!query)return error('Record a Research query in the report or enter one in the import form.');
      const result=await client.api('/api/import',{query,content:input.content,originalFile:{name:input.filename,sha256:await digest(input.content)}});
      await refresh();return publicView(views.get(paths.get(result.report.id)));
    }
    const input=method==='PUT'?JSON.parse(options.body):null,file=input?.path||url.searchParams.get('path');
    let view=views.get(file);if(!view)return error('Report not found.');
    if(url.pathname==='/api/report'&&method==='GET'){
      const record=await client.api(`/api/reports/${view.recordId}`);view=await project(record);views.set(file,view);return publicView(view);
    }
    if(url.pathname==='/api/report'&&method==='PUT'){
      const record=await client.api(`/api/reports/${view.recordId}`),latest=record.revisions.at(-1);
      if(await digest(latest.content)!==input.hash)return error('A newer revision exists. Your draft is preserved. Copy it before loading the latest report.');
      if(!input.note?.trim())return error('Add a revision note describing what changed before saving.');
      await client.api(`/api/reports/${view.recordId}/revisions`,{baseRevision:latest.number,baseContent:latest.content,content:input.content,summary:input.note});
      await refresh();return publicView(views.get(file));
    }
    if(url.pathname==='/api/history'&&method==='GET'){
      const id=url.searchParams.get('revision');
      if(id){const index=view.history.findIndex(r=>r.id===id);if(index<0)return error('Revision not found.');return {...view.history[index],diff:lineDiff(view.history[index-1]?.content||'',view.history[index].content)};}
      return {history:[...view.history].reverse().map(({content,...revision})=>revision)};
    }
    return error('This operation is unavailable.');
  }
  return {api,runtime:client.runtime};
}
