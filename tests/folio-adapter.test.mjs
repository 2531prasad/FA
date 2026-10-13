import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createStore } from '../lib/store.mjs';
import { createFolioAdapter } from '../shared/folio-adapter.mjs';
import { parseResearchMetadata } from '../shared/research-metadata.mjs';
import { parseResearchMetadata as originalParser } from '../folio/shared/research-metadata.mjs';

test('reader adapter preserves recorded versions, source pins, dates, and rejects stale writes',async t=>{
  const dir=await mkdtemp(path.join(os.tmpdir(),'fa-adapter-'));t.after(()=>rm(dir,{recursive:true,force:true}));
  const store=createStore(dir);await store.init();
  const a=await store.create({query:'Shared question',title:'A',content:'# A\n\n**Report role:** Independent FA\n**Model / agent:** Model A\n\n## Evidence\nOriginal claim.',dates:{reportDate:'2026-10-12',informationCutoff:'2026-10-11'}});
  const b=await store.create({query:'Shared question',title:'B',content:'# B\n\nAn alternate mechanism.'});
  const compilation=await store.synthesize({sources:[a,b].map(r=>({id:r.id,revision:1}))});
  const client={runtime:{readOnly:false},api:async(route,input)=>{
    if(route==='/api/reports')return store.list();
    if(route==='/api/import')return store.importMarkdown(input);
    const match=route.match(/^\/api\/reports\/([^/]+)(\/revisions)?$/);
    return match[2]?store.revise(match[1],input):store.get(match[1]);
  }};
  const adapter=await createFolioAdapter(client),{reports}=await adapter.api('/api/reports');
  const view=reports.find(r=>r.recordId===a.id),combined=reports.find(r=>r.recordId===compilation.id);
  assert.equal(view.content,a.revisions[0].content);assert.equal(view.model,'Model A');
  assert.equal(view.modifiedAt,a.revisions[0].createdAt);assert.equal(view.baseRevision,1);
  assert.deepEqual(view.reportDates,[['Prepared','2026-10-12'],['Information cutoff','2026-10-11']]);
  assert.equal(combined.canonical,false);assert.equal(combined.role,null);assert.equal(combined.kind,'Source compilation');
  assert.equal(combined.sourceReports[0].hash,view.hash);assert.equal(combined.sourceReports.length,2);
  await store.revise(a.id,{baseRevision:1,content:a.revisions[0].content+'\nNew evidence.',summary:'New evidence.'});
  await assert.rejects(adapter.api('/api/report',{method:'PUT',body:JSON.stringify({path:view.path,hash:view.hash,content:'Stale overwrite',note:'Stale'})}),/newer revision/);
  const latest=await adapter.api('/api/report?path='+encodeURIComponent(view.path));
  assert.equal(latest.baseRevision,2);assert.notEqual(latest.hash,view.hash);
  await adapter.api('/api/reports');
  const {history}=await adapter.api('/api/history?path='+encodeURIComponent(view.path));assert.equal(history.length,2);
  assert.equal(history[1].hash,combined.sourceReports[0].hash);
  const original=await adapter.api('/api/history?path='+encodeURIComponent(view.path)+'&revision=1');assert.equal(original.content,a.revisions[0].content);
  await assert.rejects(adapter.api('/api/report',{method:'PUT',body:JSON.stringify({path:view.path,hash:latest.hash,content:'Changed',note:''})}),/revision note/);
  await adapter.api('/api/report',{method:'PUT',body:JSON.stringify({path:view.path,hash:latest.hash,content:latest.content+'\nIntegrated conclusion.',note:'Integrated finding.'})});
  const saved=await store.get(a.id);assert.equal(saved.revisions.length,3);assert.equal(saved.revisions[0].content,a.revisions[0].content);
  const imported=await adapter.api('/api/import',{method:'POST',body:JSON.stringify({query:'Shared question',filename:'new.md',content:'# New\n\n**Report role:** Independent FA\n\nA new perspective.'})});
  assert.equal(imported.query,'Shared question');assert.equal(imported.path,'new.md');
  client.runtime.readOnly=true;
  await assert.rejects(adapter.api('/api/import',{method:'POST',body:'{}'}),/read-only/);
  await assert.rejects(adapter.api('/api/report',{method:'PUT',body:'{}'}),/read-only/);
});

test('browser metadata parsing matches the file reader for safe and rejected source paths',async()=>{
  const examples=[
    '# Report\n\n**Report role:** Synthesis\n**Status:** Canonical\n\n## Sources\n**Source report:** [A](../source.md) | SHA-256: '+ 'a'.repeat(64),
    '# Report\n\n```md\n**Report role:** Synthesis\n**Status:** Canonical\n```\n\n**Source report:** [A](../../escape.md)\n**Source report:** [B](https://example.com/a.md)\n**Source report:** [C](./nested/../source.md)',
    await readFile('folio/Asymmetric_AI_Positions_Post_October_2026.md','utf8')
  ];
  for(const text of examples)assert.deepEqual(parseResearchMetadata(text,'Reports/review.md'),originalParser(text,'Reports/review.md'));
});
