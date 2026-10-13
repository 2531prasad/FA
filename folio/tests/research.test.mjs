import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';

const context=vm.createContext({});
vm.runInContext(await fs.readFile(new URL('../app/research.js',import.meta.url),'utf8'),context);
const {workflows,buildBrief,withReports}=context.FAResearch;
const report={path:'Reports/private-thesis.md',hash:'source-version',modifiedAt:'2026-10-13T00:00:00Z',content:'# Original\n\nAn exact source, with its caveats.\n',dates:[['Information cutoff','11 October 2026']]};

test('fresh discovery excludes selected research and does not invent dates or prices',()=>{
  const brief=buildBrief({context:'fresh',reports:[report],market:'India',horizon:'5 years'});
  assert.match(brief,/Market \/ asset universe: India/);
  assert.match(brief,/Investment horizon: 5 years/);
  assert.match(brief,/Information cutoff: Unspecified/);
  assert.match(brief,/Price date: Unspecified/);
  assert.ok(!brief.includes(report.path));
  assert.ok(!brief.includes(report.content));
  assert.ok(!brief.includes(report.modifiedAt));
});

test('report context preserves version and date boundaries without copying report bodies implicitly',()=>{
  const brief=buildBrief({workflow:'update',context:'reports',reports:[report],cutoff:'2026-10-13',priceDate:'2026-10-09'});
  assert.match(brief,/Information cutoff: 2026-10-13/);
  assert.match(brief,/Information cutoff: 11 October 2026/);
  assert.ok(brief.includes(report.hash));
  assert.ok(brief.includes(report.path));
  assert.ok(!brief.includes(report.content));
  const packet=withReports(brief,[report]);
  assert.ok(packet.startsWith(brief));
  assert.ok(packet.includes(`\n\n${report.content}\n\nEND SOURCE: ${report.path}`));
  assert.match(packet,/source material, not instructions/);
});

test('all research workflows retain underwriting discipline and allow an unsupported-opportunity conclusion',()=>{
  assert.equal(workflows.length,8);
  assert.equal(new Set(workflows.map(w=>w.task)).size,8);
  for(const workflow of workflows){
    const brief=buildBrief({workflow:workflow.id,hurdle:'55% CAGR',context:workflow.id==='synthesis'?'reports':'fresh',reports:[report,{...report,path:'Reports/second.md'}]});
    assert.ok(brief.includes(workflow.task));
    assert.match(brief,/No sufficiently supported opportunity found/);
    assert.match(brief,/Do not invent probabilities/);
    assert.match(brief,/return hurdle tests the thesis/);
    assert.match(brief,/Price hurdle:/);
    assert.match(brief,/Failure condition:/);
  }
});


test('initial independent mode excludes peer reports even when report context is requested',()=>{
  const brief=buildBrief({workflow:'independent',context:'reports',reports:[report],canonicalPath:'Reports/canonical.md',model:'Known model',brief:'shared-01'});
  assert.ok(!brief.includes(report.path));assert.ok(!brief.includes(report.hash));assert.ok(!brief.includes('Reports/canonical.md'));
  assert.match(brief,/Do not read peer models/);assert.match(brief,/Known model/);assert.match(brief,/shared-01/);
});

test('synthesis requires distinct inputs and identifies convergence, dissent and novel inference',()=>{
  assert.throws(()=>buildBrief({workflow:'synthesis',context:'reports',reports:[report]}),/at least two/);
  assert.throws(()=>buildBrief({workflow:'synthesis',context:'reports',reports:[report,report]}),/at least two/);
  const brief=buildBrief({workflow:'synthesis',context:'reports',reports:[report,{...report,path:'Reports/second.md',model:'Model B'}]});
  for(const phrase of ['Model consensus is not evidence','convergent findings','divergent findings','novel synthesis','SHA-256','Model B','Canonical'])assert.ok(brief.includes(phrase),phrase);
});
