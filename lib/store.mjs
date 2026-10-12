import { readFile, writeFile, mkdir, rename, readdir } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import { groupKey } from './groups.mjs';
import { validateDates, inferDocumentDates, reportDates } from './chronology.mjs';
import { prepareMarkdownImport } from './markdown-import.mjs';
import { buildSynthesisPacket, SYNTHESIS_PROMPT_VERSION } from '../shared/synthesis.mjs';

export class StoreError extends Error { constructor(message,status=400) { super(message); this.status=status; } }
export function createStore(directory) {
  let queue = Promise.resolve();
  const serialize = job => { const next = queue.then(job); queue = next.catch(()=>{}); return next; };
  const file = id => { if(!/^[a-zA-Z0-9_-]{1,100}$/.test(id)) throw new StoreError('Invalid report ID.'); return path.join(directory,`${id}.json`); };
  const text = (value,name,max=200) => { if(typeof value !== 'string' || !value.trim() || value.length>max) throw new StoreError(`${name} is required and must be at most ${max} characters.`); return value.trim(); };
  const contentText = value => { text(value,'Content',200000); return value; };
  const save = async report => { const dest=file(report.id); const temp=`${dest}.${randomUUID()}.tmp`; await writeFile(temp,JSON.stringify(report,null,2)+'\n'); await rename(temp,dest); return report; };
  const get = async id => { try { return JSON.parse(await readFile(file(id),'utf8')); } catch(e) { if(e.code==='ENOENT') throw new StoreError('Report not found.',404); throw e; } };
  const list = async () => { await mkdir(directory,{recursive:true}); const files=(await readdir(directory)).filter(f=>f.endsWith('.json')); return Promise.all(files.map(f=>get(f.slice(0,-5)))); };
  const createUnlocked = async input => {
    const group=input.query ? {query:text(input.query,'Query')} : {company:text(input.company,'Company'),ticker:text(input.ticker,'Ticker',20).toUpperCase()};
    const content=contentText(input.content),dates=validateDates({...inferDocumentDates(content),...(input.dates || {})});
    const report={id:randomUUID(),...group,title:text(input.title,'Title'),type:text(input.type || 'Research report','Type'),sample:false,initialDates:dates,dates,revisions:[{number:1,content,dates,summary:input.originalFile||input.importMethod?'Imported original report.':'Initial report.',createdAt:new Date().toISOString()}]};
    if(input.originalFile) report.originalFile={name:text(input.originalFile.name,'Source filename',255),sha256:text(input.originalFile.sha256,'Source checksum',64)};
    if(input.agent)report.agent=text(input.agent,'Source / agent',100);
    if(input.importMethod)report.importMethod=text(input.importMethod,'Import method',20);
    return save(report);
  };
  const create = input => serialize(()=>createUnlocked(input));
  const importMarkdown = input => serialize(async()=>{
    let prepared;try{prepared=prepareMarkdownImport(input);}catch(error){throw new StoreError(error.message);}
    if(prepared.originalFile){const hash=createHash('sha256').update(prepared.content,'utf8').digest('hex');if(prepared.originalFile.sha256 && prepared.originalFile.sha256!==hash)throw new StoreError('The file checksum does not match its Markdown content. Choose the file again.');prepared.originalFile={name:prepared.originalFile.name,sha256:hash};}
    if(!prepared.query && prepared.company)delete prepared.query;
    const duplicates=(await list()).filter(report=>groupKey(report)===groupKey(prepared));
    const previous=duplicates.find(report=>report.revisions[0].content===prepared.content);
    if(previous)return {report:previous,reused:true};
    return {report:await createUnlocked(prepared),reused:false};
  });
  const revise = (id,input) => serialize(async()=> { const report=await get(id); const previous=report.revisions.at(-1); if(input.baseRevision!==previous.number || (input.baseContent!==undefined && input.baseContent!==previous.content)) throw new StoreError('A newer revision exists. Open the latest report before saving.',409); const content=contentText(input.content),dates=validateDates(input.dates || reportDates(report,previous)); if(content===previous.content && JSON.stringify(dates)===JSON.stringify(validateDates(reportDates(report,previous)))) throw new StoreError('No content changed. Edit the report or its dates before saving.'); report.revisions.push({number:previous.number+1,content,dates,summary:text(input.summary,'Change summary',500),createdAt:new Date().toISOString()});report.dates=dates;return save(report); });
  const synthesize = input => serialize(async()=> {
    if(!Array.isArray(input.sources)||input.sources.length<2||input.sources.length>20)throw new StoreError('Select between 2 and 20 reports.');
    if(new Set(input.sources.map(s=>s.id)).size!==input.sources.length)throw new StoreError('Choose distinct source reports.');
    const sources=await Promise.all(input.sources.map(async source=>{
      const report=await get(source.id),revision=report.revisions.find(r=>r.number===source.revision);
      if(!revision)throw new StoreError('A source revision does not exist. Refresh the selection.');
      return {report,revision};
    }));
    if(sources.some(s=>groupKey(s.report)!==groupKey(sources[0].report)))throw new StoreError('Choose reports from the same company or research query.');
    const objective=(input.objective || '').trim();if(objective.length>2000)throw new StoreError('Objective is too long.');
    const pins=sources.map(({report,revision})=>({id:report.id,title:report.title,revision:revision.number,dates:{...reportDates(report,revision)}}));
    const dates=validateDates(input.dates || {});
    for(const field of ['informationCutoff','marketDate']){
      const values=pins.map(source=>source.dates[field]);
      if(!Object.hasOwn(input.dates || {},field)&&values.every(Boolean)&&new Set(values).size===1)dates[field]=values[0];
    }
    validateDates(dates);
    if(dates.reportDate && pins.some(source=>Object.values(source.dates).some(day=>day>dates.reportDate)))throw new StoreError('The effective report date cannot precede the included source dates.');
    const content='## Synthesis brief\n'+(objective || 'Review these perspectives together and develop a reconciled thesis.')+'\n\nThis is a source compilation, not an AI-generated synthesis. It preserves each selected report at its specified revision. Source dates remain distinct; a new compilation does not make the evidence current. Ask your terminal agent to reconcile agreements, conflicts, and open questions, then publish a refined revision.\n\n'+sources.map(({report,revision})=>'## Source: '+report.title+' / revision '+revision.number+'\n'+revision.content).join('\n\n---\n\n');
    const report={id:randomUUID(),initialDates:dates,dates,...(sources[0].report.query?{query:sources[0].report.query}:{company:sources[0].report.company,ticker:sources[0].report.ticker}),title:text(input.title || 'Combined research report','Title'),type:'Super report',sample:sources.some(s=>s.report.sample),sources:pins,synthesis:{objective,promptVersion:SYNTHESIS_PROMPT_VERSION,status:'source-compilation'},revisions:[{number:1,content,dates,summary:'Compiled source reports; ready for agent synthesis.',createdAt:new Date().toISOString()}]};
    return save(report);
  });
  const synthesisPacket=async id=>{const report=await get(id),reports=await list();try{return buildSynthesisPacket(report,reports);}catch(error){throw new StoreError(error.message);}};
  const init = async () => { await mkdir(directory,{recursive:true}); };
  return {init,list,get,create,revise,synthesize,importMarkdown,synthesisPacket,exclusive:serialize};
}
