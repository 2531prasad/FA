import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { inspectMarkdown, prepareMarkdownImport, displayMarkdown } from '../lib/markdown-import.mjs';
import { createStore } from '../lib/store.mjs';

const source='\uFEFF---\r\ntitle: "Independent perspective"\r\nquery: Shared question\r\nreport_date: 2026-10-12\r\ninformation_cutoff: 2026-10-11\r\nmarket_date: 2026-10-09\r\nagent: Gemini\r\n---\r\n# Analysis\r\n\r\nEvidence and assumptions.  \r\n';
const dates={reportDate:'2026-10-12',informationCutoff:'2026-10-11',marketDate:'2026-10-09'};
async function fixture(t){const dir=await mkdtemp(path.join(os.tmpdir(),'fa-import-test-'));assert.ok(path.resolve(dir).startsWith(path.resolve(os.tmpdir())+path.sep));t.after(()=>rm(dir,{recursive:true,force:true}));const store=createStore(dir);await store.init();return {store,dir};}

test('flat metadata and AI code wrappers are detected without altering the original',()=>{
  const meta=inspectMarkdown(source,'analysis.md');
  assert.equal(meta.title,'Independent perspective');assert.equal(meta.query,'Shared question');assert.equal(meta.agent,'Gemini');assert.deepEqual(meta.dates,dates);
  assert.equal(prepareMarkdownImport({content:source}).content,source);
  assert.equal(displayMarkdown(source),'# Analysis\r\n\r\nEvidence and assumptions.  \r\n');
  const wrapped='```markdown\n'+source.slice(1).replace(/\r/g,'')+'```';
  assert.equal(inspectMarkdown(wrapped).title,meta.title);assert.match(displayMarkdown(wrapped),/^# Analysis/);
});

test('plain output keeps unknown dates unknown and explicit destination/date choices win',()=>{
  assert.deepEqual(inspectMarkdown('# Plain report\nUndated.').dates,{});
  assert.equal(inspectMarkdown('No heading.','a-report.markdown').title,'a-report');
  const prepared=prepareMarkdownImport({content:source,company:'Company',ticker:'COMP',dates:{reportDate:'',informationCutoff:'2026-10-10'}});
  assert.equal(prepared.query,undefined);assert.deepEqual(prepared.dates,{informationCutoff:'2026-10-10',marketDate:'2026-10-09'});
  assert.throws(()=>prepareMarkdownImport({content:source,dates:{reportDate:'2026-10-08'}}),/cannot follow/);
  assert.throws(()=>inspectMarkdown(' '),/Add Markdown/);assert.throws(()=>inspectMarkdown('a'.repeat(200001)),/200,000/);
});

test('file import preserves exact bytes, checksum, date context and provider label across reopening',async t=>{
  const {store,dir}=await fixture(t);const sha256=createHash('sha256').update(source,'utf8').digest('hex');
  const result=await store.importMarkdown({content:source,originalFile:{name:'analysis.md',sha256}});
  assert.equal(result.reused,false);const saved=await createStore(dir).get(result.report.id);
  assert.equal(saved.revisions[0].content,source);assert.deepEqual(saved.dates,dates);assert.equal(saved.query,'Shared question');assert.equal(saved.agent,'Gemini');assert.equal(saved.importMethod,'file');assert.equal(saved.originalFile.sha256,sha256);assert.ok(Date.parse(saved.revisions[0].createdAt));
  await assert.rejects(store.importMarkdown({content:source,originalFile:{name:'bad.md',sha256:'0'.repeat(64)}}),{status:400});
  assert.equal((await store.list()).length,1);
});

test('concurrent retries reuse originals within a group and retain later revisions',async t=>{
  const {store}=await fixture(t);const input={query:'Shared question',content:source,originalFile:{name:'analysis.md'}};
  const results=await Promise.all([store.importMarkdown(input),store.importMarkdown(input)]);
  assert.equal(results.filter(r=>!r.reused).length,1);assert.equal(results[0].report.id,results[1].report.id);
  await store.revise(results[0].report.id,{baseRevision:1,content:'# Refined analysis',summary:'Refined.'});
  const pasted=await store.importMarkdown({query:'Shared question',content:source});
  assert.equal(pasted.reused,true);assert.equal(pasted.report.revisions.length,2);assert.equal(pasted.report.revisions[0].content,source);
  const independent=await store.importMarkdown({...input,query:'Other question'});assert.equal(independent.reused,false);
  const company=await store.importMarkdown({content:source,company:'Company',ticker:'COMP'});assert.equal(company.report.query,undefined);assert.equal(company.report.company,'Company');
  assert.equal((await store.list()).length,3);
});
