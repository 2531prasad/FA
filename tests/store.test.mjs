import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createStore } from '../lib/store.mjs';
import { groupKey } from '../lib/groups.mjs';

async function fixture(t){const dir=await mkdtemp(path.join(os.tmpdir(),'fa-test-'));t.after(()=>rm(dir,{recursive:true,force:true}));const store=createStore(dir);await store.init(false);return {store,dir};}
const report=title=>({company:'Test company',ticker:'TEST',title,content:'## Thesis\nInitial analysis.'});
test('revisions survive reopening and stale updates cannot overwrite newer work',async t=>{const {store,dir}=await fixture(t);const initial=await store.create(report('Thesis'));await store.revise(initial.id,{baseRevision:1,content:'## Thesis\nRefined analysis.',summary:'Refined thesis.'});await assert.rejects(store.revise(initial.id,{baseRevision:1,content:'Overwritten',summary:'Stale.'}),{status:409});const reopened=await createStore(dir).get(initial.id);assert.equal(reopened.revisions.length,2);assert.equal(reopened.revisions[0].content,initial.revisions[0].content);assert.equal(reopened.revisions[1].content,'## Thesis\nRefined analysis.');});
test('concurrent edits based on one revision produce one success and one conflict',async t=>{const {store}=await fixture(t);const initial=await store.create(report('Thesis'));const results=await Promise.allSettled(['A','B'].map(content=>store.revise(initial.id,{baseRevision:1,content,summary:content})));assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(results.find(r=>r.status==='rejected').reason.status,409);});
test('compilation pins exact source revisions and leaves original reports intact',async t=>{const {store}=await fixture(t);const a=await store.create(report('A'));const b=await store.create(report('B'));const c=await store.create(report('C'));await store.revise(a.id,{baseRevision:1,content:'Changed A',summary:'Changed.'});const merged=await store.synthesize({sources:[a,b,c].map(r=>({id:r.id,revision:1})),title:'Combined',objective:'Find conflicts.'});assert.equal(merged.sources.length,3);assert.equal(merged.sources[0].revision,1);assert.match(merged.revisions[0].content,/Initial analysis/);assert.doesNotMatch(merged.revisions[0].content,/Changed A/);assert.match(merged.revisions[0].content,/not an AI-generated synthesis/);assert.equal((await store.list()).length,4);});
test('compilation rejects duplicate sources, mixed companies, and missing revisions',async t=>{const {store}=await fixture(t);const a=await store.create(report('A'));const b=await store.create({...report('B'),company:'Another company'});await assert.rejects(store.synthesize({sources:[{id:a.id,revision:1},{id:a.id,revision:1}]}),/distinct/);await assert.rejects(store.synthesize({sources:[{id:a.id,revision:1},{id:b.id,revision:1}]}),/same company/);await assert.rejects(store.synthesize({sources:[{id:a.id,revision:99},{id:b.id,revision:1}]}),/does not exist/);});
test('invalid report paths and empty content are rejected',async t=>{const {store}=await fixture(t);await assert.rejects(store.get('../private'),/Invalid report ID/);await assert.rejects(store.create({...report('A'),content:' '}),/Content is required/);});

test('query reports preserve original text and can compile across multiple companies',async t=>{
  const {store,dir}=await fixture(t);const content='\n# Independent analysis\r\n\r\nNVDA and AVGO.  \r\n';
  const query='Asymmetric AI positions after October 2026';
  const a=await store.create({query,title:'Report 1',content,originalFile:{name:'one.md',sha256:'a'.repeat(64)}});
  const b=await store.create({query,title:'Report 2',content:'# Second perspective\nMU and ANET.\n'});
  assert.equal(a.company,undefined);assert.equal(a.ticker,undefined);assert.equal(a.revisions[0].content,content);assert.equal(a.revisions.length,1);
  assert.equal((await createStore(dir).get(a.id)).originalFile.name,'one.md');
  const compilation=await store.synthesize({sources:[a,b].map(r=>({id:r.id,revision:1}))});assert.equal(compilation.query,query);assert.equal(compilation.sources.length,2);
  const other=await store.create({query:'Different question',title:'Report 3',content:'Unrelated.'});
  await assert.rejects(store.synthesize({sources:[a,other].map(r=>({id:r.id,revision:1}))}),/same company or research query/);
  assert.notEqual(groupKey(a),groupKey({company:query}));
});

test('date changes create an immutable revision and compilations pin original source dates',async t=>{
  const {store}=await fixture(t);const dates={reportDate:'2026-10-12',informationCutoff:'2026-10-11',marketDate:'2026-10-09'};
  const a=await store.create({...report('A'),dates});const b=await store.create({...report('B'),dates});
  const revised=await store.revise(a.id,{baseRevision:1,content:a.revisions[0].content,dates:{...dates,reportDate:'2026-10-13'},summary:'Corrected report date.'});
  assert.equal(revised.revisions[0].dates.reportDate,'2026-10-12');assert.equal(revised.revisions[1].dates.reportDate,'2026-10-13');
  const compiled=await store.synthesize({sources:[a,b].map(r=>({id:r.id,revision:1}))});assert.deepEqual(compiled.sources[0].dates,dates);assert.equal(compiled.dates.informationCutoff,'2026-10-11');assert.equal(compiled.dates.marketDate,'2026-10-09');
});
