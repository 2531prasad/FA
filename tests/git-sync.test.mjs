import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, mkdir, rm, writeFile, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createGitSync } from '../lib/git-sync.mjs';
const execute=promisify(execFile);
const git=async(cwd,...args)=>(await execute('git',args,{cwd,encoding:'utf8',windowsHide:true,env:{...process.env,GIT_TERMINAL_PROMPT:'0',GCM_INTERACTIVE:'Never'}})).stdout.trim();
const document=content=>JSON.stringify({id:'report',revisions:[{number:1,content}]});
async function fixture(t){
  const dir=await mkdtemp(path.join(os.tmpdir(),'fa-git-'));assert.ok(path.resolve(dir).startsWith(path.resolve(os.tmpdir())+path.sep));t.after(()=>rm(dir,{recursive:true,force:true,maxRetries:3}));
  const origin=path.join(dir,'origin.git'),first=path.join(dir,'first'),second=path.join(dir,'second');await mkdir(origin);await mkdir(first);
  await git(origin,'init','--bare','--initial-branch=main');await git(first,'init','--initial-branch=main');await git(first,'config','user.name','FA test');await git(first,'config','user.email','fa-test@example.invalid');
  await writeFile(path.join(first,'.gitignore'),'.local/\n');await mkdir(path.join(first,'data','reports'),{recursive:true});await writeFile(path.join(first,'data','reports','report.json'),document('Original'));
  await git(first,'add','.');await git(first,'commit','-m','Initial');await git(first,'remote','add','origin',origin);await git(first,'push','-u','origin','main');await git(dir,'clone',origin,second);await git(second,'config','user.name','FA test');await git(second,'config','user.email','fa-test@example.invalid');
  return {first,second,origin};
}
test('reviewed report publish detects edits after preview, pushes and fast-forward pulls across devices',async t=>{
  const {first,second}=await fixture(t),sync=createGitSync(first),other=createGitSync(second),file=path.join(first,'data','reports','report.json');
  assert.equal((await sync.status()).label,'Remote unknown');assert.equal((await sync.check()).label,'Pushed');
  await writeFile(file,document('Draft A'));const stale=await sync.preview();await writeFile(file,document('Draft B'));await assert.rejects(sync.publish({planId:stale.id,message:'Update'}),/changed after/);
  const plan=await sync.preview();assert.deepEqual(plan.files.map(f=>f.path),['data/reports/report.json']);const pushed=await sync.publish({planId:plan.id,message:'Update analysis'});assert.equal(pushed.status.label,'Pushed');assert.ok(pushed.status.lastPushed);
  assert.equal((await other.check()).label,'Behind');const pulled=await other.pull();assert.equal(pulled.restartRecommended,false);assert.equal(JSON.parse(await readFile(path.join(second,'data','reports','report.json'),'utf8')).revisions[0].content,'Draft B');assert.equal(pulled.status.label,'Pushed');
  await writeFile(path.join(first,'README.md'),'An app change');await git(first,'add','README.md');await assert.rejects(sync.preview(),/App files are staged/);await git(first,'commit','-m','App documentation');await git(first,'push');assert.equal((await other.pull()).restartRecommended,true);
});
test('Git sync refuses dirty pulls and divergent histories without replacing either branch',async t=>{
  const {first,second}=await fixture(t),sync=createGitSync(first),other=createGitSync(second),file=path.join(first,'data','reports','report.json');
  await writeFile(file,document('Uncommitted'));await assert.rejects(sync.pull(),/preserve local changes/);assert.equal(JSON.parse(await readFile(file,'utf8')).revisions[0].content,'Uncommitted');
  await git(first,'add','data/');await git(first,'commit','-m','Local perspective');await writeFile(path.join(second,'data','reports','report.json'),document('Other perspective'));const plan=await other.preview();await other.publish({planId:plan.id,message:'Other perspective'});
  assert.equal((await sync.check()).label,'Conflict');await assert.rejects(sync.pull(),/reconciliation/);await assert.rejects(sync.preview(),/histories conflict/);assert.equal(JSON.parse(await readFile(file,'utf8')).revisions[0].content,'Uncommitted');
});
test('Git sync disables custom-directory writes and serializes operations',async t=>{
  const {first}=await fixture(t),disabled=createGitSync(first,{allowWrites:false});assert.equal((await disabled.status()).writeEnabled,false);await assert.rejects(disabled.preview(),{status:400});await assert.rejects(disabled.pull(),{status:400});
  const sync=createGitSync(first);let release;const job=sync.exclusive(()=>new Promise(resolve=>{release=resolve;}));assert.equal(sync.busy,true);await assert.rejects(sync.exclusive(()=>{}),{status:423});release();await job;assert.equal(sync.busy,false);
});
