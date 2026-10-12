import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, mkdir, writeFile, readFile, readdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import http from 'node:http';
import { wordDiff, diffHTML } from '../shared/diff.mjs';
import { draftStore } from '../shared/drafts.mjs';
import { searchReport, highlightText } from '../shared/search.mjs';
import { createStore } from '../lib/store.mjs';
import { buildPages } from '../scripts/build-pages.mjs';

const escape=s=>s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
async function temporary(t){const dir=await mkdtemp(path.join(os.tmpdir(),'fa-workspace-'));assert.ok(path.resolve(dir).startsWith(path.resolve(os.tmpdir())+path.sep));t.after(()=>rm(dir,{recursive:true,force:true}));return dir;}
test('word differences reconstruct both documents, including Unicode and bounded fallback',()=>{
  const examples=[['','new'],['old',''],['same','same'],['A  B\nC','A big B\nD'],['₹42 📊 valuation','₹47 📊 valuation revised'],['<script>','<img src=x>']];
  let seed=42;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed;};
  for(let i=0;i<200;i++)examples.push(Array.from({length:2},()=>Array.from({length:random()%20},()=>['word',' ','x','\n','₹'][random()%5]).join('')));
  for(const [before,after] of examples)for(const maxWork of [0,200000]){const diff=wordDiff(before,after,{maxWork});assert.equal(diff.parts.filter(p=>p.type!=='add').map(p=>p.text).join(''),before);assert.equal(diff.parts.filter(p=>p.type!=='remove').map(p=>p.text).join(''),after);}
  assert.doesNotMatch(diffHTML('<script>','<img>',escape),/<script>|<img>/);
  assert.equal(wordDiff('one two','three four',{maxWork:0}).coarse,true);
});
test('body search distinguishes historical matches and escapes highlights',()=>{
  const report={title:'A report',query:'Question',revisions:[{number:1,content:'Old downside assumption'},{number:2,content:'New upside assumption'}]};
  assert.equal(searchReport(report,'downside').matches,false);
  assert.equal(searchReport(report,'downside',{bodies:true}).matches,false);
  assert.deepEqual(searchReport(report,'downside',{bodies:true,history:true}).hits.map(h=>[h.revision,h.historical]),[[1,true]]);
  assert.equal(searchReport(report,'upside',{bodies:true}).hits[0].historical,false);
  assert.equal(highlightText('<script>profit & loss</script>','profit',escape),'&lt;script&gt;<mark>profit</mark> &amp; loss&lt;/script&gt;');
});
test('browser drafts preserve separate revision bases and tolerate broken or unavailable storage',()=>{
  const values=new Map(),storage={get length(){return values.size;},key:i=>[...values.keys()][i],getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
  const drafts=draftStore(storage),draft={reportId:'a',baseRevision:1,baseContent:'base',baseDates:{},content:'draft',dates:{},summary:'change'};
  assert.equal(drafts.save(draft),true);drafts.save({...draft,baseRevision:2,content:'later'});values.set('fa-revision-draft:a:3','broken');values.set('fa-revision-draft:a:4',JSON.stringify({...draft,dates:null}));
  const recovered=drafts.list('a');assert.equal(recovered.length,2);assert.deepEqual(new Set(recovered.map(d=>d.baseRevision)),new Set([1,2]));assert.equal(drafts.list('other').length,0);drafts.remove(draft);assert.equal(drafts.list('a').length,1);
  assert.equal(draftStore(undefined).save(draft),false);assert.deepEqual(draftStore(undefined).list('a'),[]);
});
test('synthesis packets pin old revisions and expose mixed and missing dates without manufactured conclusions',async t=>{
  const dir=await temporary(t),store=createStore(dir);await store.init();
  const a=await store.create({query:'Question',title:'A',content:'Original A',dates:{reportDate:'2026-10-12',informationCutoff:'2026-10-11',marketDate:'2026-10-09'}});
  const b=await store.create({query:'Question',title:'B',content:'Original B',dates:{informationCutoff:'2026-10-10',marketDate:'2026-10-08'}});
  const sources=[a,b].map(r=>({id:r.id,revision:1}));
  await assert.rejects(store.synthesize({sources,dates:{reportDate:'2026-10-10'}}),/cannot precede/);
  const combined=await store.synthesize({sources,objective:'Reconcile valuations.'});assert.deepEqual(combined.dates,{});
  await store.revise(a.id,{baseRevision:1,content:'New A',summary:'Updated.'});
  const packet=await store.synthesisPacket(combined.id);assert.equal(packet.sources[0].content,'Original A');assert.equal(packet.objective,'Reconcile valuations.');assert.equal(packet.promptVersion,'synthesis-v1');assert.equal(packet.analysisStatus,'not_assessed');assert.deepEqual(packet.agreements,[]);assert.deepEqual(packet.contradictions,[]);
  assert.equal(packet.dateBoundaries.earliestCutoff,'2026-10-10');assert.equal(packet.dateBoundaries.latestCutoff,'2026-10-11');assert.deepEqual(packet.dateBoundaries.marketDates,['2026-10-08','2026-10-09']);assert.deepEqual(packet.dateBoundaries.missingDates,[{id:b.id,revision:1,fields:['reportDate']}]);
  await assert.rejects(store.revise(a.id,{baseRevision:2,baseContent:'A different device history',content:'Wrong branch',summary:'Change'}),{status:409});
});
test('static build works at /FA/, preserves reports, refuses writes and excludes archives',async t=>{
  const dir=await temporary(t),output=path.join(dir,'site'),reports=path.join(dir,'reports');await mkdir(reports);const store=createStore(reports);await store.init();
  const a=await store.create({query:'Question',title:'A',content:'# Original\n₹42 📊',dates:{reportDate:'2026-10-12'}}),b=await store.create({query:'Question',title:'B',content:'# Another'});const combined=await store.synthesize({sources:[a,b].map(r=>({id:r.id,revision:1}))});
  await buildPages({output,includeReports:true,reportDirectory:reports});
  const server=http.createServer(async(req,res)=>{try{if(!req.url.startsWith('/FA/'))throw new Error();const name=req.url.slice(4)||'index.html';if(name.includes('..'))throw new Error();res.end(await readFile(path.join(output,name)));}catch{res.writeHead(404);res.end();}});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));t.after(()=>new Promise(resolve=>server.close(resolve)));
  await writeFile(path.join(dir,'package.json'),JSON.stringify({type:'module'}));
  const base=new URL(`http://127.0.0.1:${server.address().port}/FA/`),{createDataClient}=await import(pathToFileURL(path.join(output,'data-client.js')));
  const client=await createDataClient(base);assert.equal(client.runtime.readOnly,true);const library=await client.api('/api/reports');assert.equal(library.length,3);assert.equal(library.find(r=>r.id===a.id).revisions[0].content,a.revisions[0].content);assert.equal((await client.api(`/api/reports/${combined.id}/synthesis-packet`)).sources[0].content,a.revisions[0].content);
  await assert.rejects(client.api('/api/reports',{}),/read-only/);assert.equal((await fetch(new URL('shared/chronology.mjs',base))).status,200);assert.equal((await fetch(new URL('fonts/ArchivoBlack-Regular.ttf',base))).status,200);
  for(const name of (await readdir(output)).filter(name=>/\.(js|mjs)$/.test(name))){const content=await readFile(path.join(output,name),'utf8');for(const match of content.matchAll(/from ['"](\.[^'"]+)['"]/g))assert.equal((await fetch(new URL(match[1],new URL(name,base)))).status,200,`${name}: ${match[1]}`);}
  assert.equal((await fetch(new URL('data/ledger-source-snapshot.json',base))).status,404);
  await buildPages({output,reportDirectory:reports});assert.deepEqual(JSON.parse(await readFile(path.join(output,'library.json'),'utf8')).reports,[]);
  await assert.rejects(buildPages({output:path.resolve('data')}),/dedicated/);
});
