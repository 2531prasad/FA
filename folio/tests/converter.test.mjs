import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createLedger} from '../server.mjs';
import {createPdfConverter, MAX_PDF, MAX_MARKDOWN} from '../shared/pdf-converter.mjs';
import {pdfFixture} from './helpers/pdf-fixture.mjs';

test('missing converter gives setup guidance and rejects non-PDF input', async () => {
  const converter = createPdfConverter({python:'/nonexistent/folio-python'});
  assert.equal((await converter.status()).ready,false);
  await assert.rejects(converter.convert(Buffer.from('<html>Not a PDF</html>')),error=>error.status===400);
  await assert.rejects(converter.convert(pdfFixture()),error=>error.status===503);
  const large = Buffer.alloc(MAX_PDF+1); large.write('%PDF-');
  await assert.rejects(converter.convert(large),error=>error.status===413);
});

test('real MarkItDown preserves text and rejects blank or damaged PDFs', async t => {
  const converter=createPdfConverter();
  if (!(await converter.status()).ready) return t.skip('Install tools/requirements-markitdown.txt for real PDF conversion tests.');
  const pending=converter.convert(pdfFixture());
  await assert.rejects(converter.convert(pdfFixture()),error=>error.status===409);
  assert.match((await pending).markdown,/revenue USD 100/);
  await assert.rejects(converter.convert(pdfFixture('')),error=>error.status===422 && /OCR/.test(error.message));
  await assert.rejects(converter.convert(Buffer.from('%PDF-1.4\nbroken')),error=>error.status===422);
  const quick=createPdfConverter({timeout:1});
  await assert.rejects(quick.convert(pdfFixture()),error=>error.status===504);
});

test('converter API protects local writes and keeps output outside report discovery', async t => {
  const root=await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(),'folio-converter-')));
  const {server}=await createLedger({root,pollMs:60_000});
  t.after(async()=>{await new Promise(resolve=>server.close(resolve));await fs.rm(root,{recursive:true,force:true});});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}`;
  const index=await (await fetch(base+'/api/reports')).json();
  const headers={'Content-Type':'application/json','X-Ledger-Token':index.token};
  const save=input=>fetch(base+'/api/converter/save',{method:'POST',headers,body:JSON.stringify(input)});
  assert.equal((await fetch(base+'/converter.js')).status,200);
  assert.equal((await fetch(base+'/api/converter/save',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'})).status,403);
  assert.equal((await fetch(base+'/api/converter/save',{method:'POST',headers:{...headers,Origin:'https://evil.example'},body:'{}'})).status,403);
  assert.equal((await fetch(base+'/api/converter/save',{method:'POST',headers,body:'broken'})).status,400);
  for(const filename of ['../escape.md','/outside.md','.hidden.md','AGENTS.md','README.md','file.pdf','sub/file.md']) assert.equal((await save({filename,content:'# Sample'})).status,400,filename);
  assert.equal((await save({filename:'empty.md',content:' '})).status,400);
  assert.equal((await save({filename:'large.md',content:'x'.repeat(MAX_MARKDOWN+1)})).status,413);
  await fs.mkdir(path.join(root,'elsewhere'));
  await fs.symlink(path.join(root,'elsewhere'),path.join(root,'Converted'));
  assert.equal((await save({filename:'escape.md',content:'No'})).status,403);
  await fs.unlink(path.join(root,'Converted'));
  const content='# Converted source\n\nNot an investment thesis.\n';
  const response=await save({filename:'sample.md',content});
  assert.equal(response.status,201); assert.equal((await response.json()).path,'Converted/sample.md');
  assert.equal(await fs.readFile(path.join(root,'Converted/sample.md'),'utf8'),content);
  assert.equal((await save({filename:'sample.md',content:'Overwrite'})).status,409);
  assert.equal(await fs.readFile(path.join(root,'Converted/sample.md'),'utf8'),content);
  assert.equal((await (await fetch(base+'/api/reports')).json()).reports.length,0);
  assert.equal((await fetch(base+'/api/report?path=Converted/sample.md')).status,404);
  const pdfHeaders={'Content-Type':'application/pdf','X-Ledger-Token':index.token};
  assert.equal((await fetch(base+'/api/convert-pdf',{method:'POST',body:pdfFixture()})).status,403);
  assert.equal((await fetch(base+'/api/convert-pdf',{method:'POST',headers,body:'{}'})).status,415);
  assert.equal((await fetch(base+'/api/convert-pdf',{method:'POST',headers:pdfHeaders,body:'Not PDF'})).status,400);
  const status=await (await fetch(base+'/api/converter')).json();
  if(status.ready){
    const converted=await fetch(base+'/api/convert-pdf',{method:'POST',headers:pdfHeaders,body:pdfFixture()});
    assert.equal(converted.status,200); assert.match((await converted.json()).markdown,/revenue USD 100/);
  }
});
