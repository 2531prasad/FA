import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateDates, inferDocumentDates, buildTimeline, formatDay, formatInstant, localDay, reportDates } from '../lib/chronology.mjs';

test('research dates are extracted only from labeled evidence, never the import clock',()=>{
  const dates=inferDocumentDates('**Prepared:** 12 October 2026, India time.\n**Information cutoff:** 11 October 2026. **Prices:** 9 October US regular-session closes.');
  assert.deepEqual(dates,{reportDate:'2026-10-12',informationCutoff:'2026-10-11',marketDate:'2026-10-09'});
  assert.deepEqual(inferDocumentDates('An undated thesis about 2026.'),{});
  assert.equal(formatDay(undefined),'Not recorded');
});
test('invalid calendar dates and information from after the report date are rejected',()=>{
  for(const value of ['2026-02-30','2026-13-01','12/10/2026'])assert.throws(()=>validateDates({reportDate:value}),/valid YYYY-MM-DD/);
  assert.throws(()=>validateDates({reportDate:'2026-10-12',informationCutoff:'2026-10-13'}),/cannot follow/);
  assert.throws(()=>validateDates({reportDate:'2026-10-12',marketDate:'2026-10-13'}),/cannot follow/);
});
test('ledger actions precede local imports while date-only milestones remain separate',()=>{
  const r={id:'report',title:'Report',initialDates:{reportDate:'2026-10-12',informationCutoff:'2026-10-11',marketDate:'2026-10-09'},originalFile:{name:'source.md'},revisions:[{number:1,createdAt:'2026-10-13T00:00:00Z',summary:'Imported.'}],ledger:{events:[{created_at:'2026-10-11T21:40:06Z',kind:'import',version:1,note:'Original ledger import.'}]}};
  const timeline=buildTimeline([r]);assert.deepEqual(timeline.milestones.map(m=>m.day),['2026-10-09','2026-10-11','2026-10-12']);assert.equal(timeline.events[0].source,'Thesis Ledger snapshot');assert.equal(timeline.events[1].label,'Local import');assert.match(formatInstant(timeline.events[0].at),/12 Oct 2026/);assert.match(formatInstant(timeline.events[0].at),/03:10:06 IST/);
  assert.equal(localDay(new Date('2026-10-11T21:40:06Z')),'2026-10-12');
});
test('historical revision dates remain distinct from the latest report dates',()=>{
  const old={number:1,dates:{reportDate:'2026-10-12',informationCutoff:'2026-10-11'}};
  const current={number:2,dates:{reportDate:'2026-10-14',informationCutoff:'2026-10-13'}};
  const report={revisions:[old,current],dates:current.dates};assert.equal(reportDates(report,old).reportDate,'2026-10-12');assert.equal(reportDates(report).reportDate,'2026-10-14');
});
