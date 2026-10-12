import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const [flag,query,...files]=process.argv.slice(2);
const server=process.env.FA_URL || 'http://127.0.0.1:4310';
async function request(route,input){const response=await fetch(server+route,input?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)}:{});const result=await response.json();if(!response.ok)throw new Error(result.error);return result;}
try {
  if(flag!=='--query' || !query || !files.length)throw new Error('Usage: node scripts/import-reports.mjs --query "Research question" report1.md report2.md');
  for(const source of files) {
    const bytes=await readFile(source),content=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(bytes);
    const name=path.basename(source),sha256=createHash('sha256').update(bytes).digest('hex');
    const backup=path.join(root,'data','imports',sha256);await mkdir(backup,{recursive:true});await writeFile(path.join(backup,name),bytes);
    const {report}=await request('/api/import',{query,content,originalFile:{name,sha256}});
    const saved=await request(`/api/reports/${report.id}`);
    assert.equal(saved.query,query);assert.equal(saved.revisions[0].number,1);assert.equal(saved.revisions[0].content,content);
    assert.equal(createHash('sha256').update(Buffer.from(saved.revisions[0].content,'utf8')).digest('hex'),sha256);
    console.log(JSON.stringify({id:saved.id,title:saved.title,query,revision:1,filename:name,sha256,url:`${server}/?report=${saved.id}`}));
  }
} catch(error){console.error(error.message);process.exitCode=1;}
