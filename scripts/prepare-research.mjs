// Run while the local server is stopped. Archive generated samples and attach
// verified, read-only Thesis Ledger provenance without rewriting report bodies.
import { readFile, writeFile, mkdir, readdir, rename } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { inferDocumentDates, validateDates } from '../lib/chronology.mjs';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const data=path.join(root,'data');
const snapshot=JSON.parse(await readFile(path.join(data,'ledger-source-snapshot.json'),'utf8'));
const directory=path.join(data,'reports');
const backup=path.join(data,'archive','before-timeline');
const filler=path.join(data,'archive','filler');
await mkdir(backup,{recursive:true});await mkdir(filler,{recursive:true});
for(const name of (await readdir(directory)).filter(name=>name.endsWith('.json'))) {
  const file=path.resolve(directory,name);assert.ok(file.startsWith(path.resolve(directory)+path.sep));
  const original=await readFile(file,'utf8'),report=JSON.parse(original);
  if(report.sample===true) {
    const target=path.resolve(filler,name);assert.ok(target.startsWith(path.resolve(filler)+path.sep));
    await rename(file,target);console.log(`Archived sample: ${report.title}`);continue;
  }
  const ledger=snapshot.reports.find(source=>source.source_file===report.originalFile?.name);
  if(!ledger)continue;
  assert.equal(report.revisions[0].content,ledger.body,'Ledger source and local original must match exactly.');
  if(report.ledger?.id===ledger.id)continue;
  await writeFile(path.join(backup,name),original,{flag:'wx'}).catch(error=>{if(error.code!=='EEXIST')throw error;});
  const dates=validateDates({...inferDocumentDates(ledger.body),reportDate:ledger.report_date});
  report.initialDates=dates;report.dates=dates;
  report.dateSources={reportDate:`Thesis Ledger ${ledger.id} / report_date`,informationCutoff:'Original document / research cutoff',marketDate:'Original document / price snapshot; year from research cutoff'};
  report.ledger={id:ledger.id,title:ledger.title,reportDate:ledger.report_date,createdAt:ledger.created_at,updatedAt:ledger.updated_at,revision:ledger.current_revision,hash:ledger.current_hash,capturedAt:snapshot.capturedAt,events:ledger.revisions};
  report.dateEvents=[...(report.dateEvents || []),{at:new Date().toISOString(),note:'Recorded research dates from the original document and matching Thesis Ledger report. Report text and original revision remain unchanged.'}];
  const temporary=file+'.tmp';await writeFile(temporary,JSON.stringify(report,null,2)+'\n');await rename(temporary,file);
  console.log(`Dated: ${report.title} / ${JSON.stringify(dates)}`);
}
