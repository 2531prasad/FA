import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, writeFile, mkdir, realpath } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import path from 'node:path';

const execute=promisify(execFile);
const fail=(message,status=409)=>{throw Object.assign(new Error(message),{status});};
export function createGitSync(root,{allowWrites=true}={}) {
  root=path.resolve(root);let checked=false,remoteError='',busy=false;const plans=new Map();
  const metaFile=path.join(root,'.local','sync.json');
  async function git(args){try{return (await execute('git',args,{cwd:root,encoding:'utf8',maxBuffer:3000000,timeout:30000,windowsHide:true,env:{...process.env,GIT_TERMINAL_PROMPT:'0',GCM_INTERACTIVE:'Never'}})).stdout;}catch(error){const message=String(error.stderr || error.message || '').replace(/https?:\/\/[^\s/@]+:[^\s/@]+@/g,'https://[credentials]@');throw Object.assign(new Error(message.slice(0,1200)||'Git could not complete the operation.'),{status:409});}}
  async function metadata(){try{return JSON.parse(await readFile(metaFile,'utf8'));}catch{return {};}}
  async function record(values){await mkdir(path.dirname(metaFile),{recursive:true});await writeFile(metaFile,JSON.stringify({...await metadata(),...values},null,2)+'\n');}
  async function changes(){const entries=(await git(['status','--porcelain=v1','--untracked-files=all','-z'])).split('\0'),files=[];for(let i=0;i<entries.length;i++){if(!entries[i])continue;const status=entries[i].slice(0,2),name=entries[i].slice(3);files.push({path:name,status,reportData:name.startsWith('data/')});if(/[RC]/.test(status))i++;}return files;}
  async function status(){
    try{
      const actual=(await git(['rev-parse','--show-toplevel'])).trim();if(await realpath(actual)!==await realpath(root))return {available:false,label:'Git unavailable',reason:'The app must run from its repository root.'};
      const branch=(await git(['symbolic-ref','--short','HEAD'])).trim(),head=(await git(['rev-parse','HEAD'])).trim(),files=await changes();
      let upstream=null,ahead=0,behind=0;try{upstream=(await git(['rev-parse','--abbrev-ref','@{upstream}'])).trim();[ahead,behind]=(await git(['rev-list','--left-right','--count','HEAD...@{upstream}'])).trim().split(/\s+/).map(Number);}catch{}
      const conflict=files.some(f=>/^(?:DD|AU|UD|UA|DU|AA|UU)$/.test(f.status)) || (ahead>0&&behind>0);
      const label=conflict?'Conflict':files.length?'Local changes':!upstream?'No upstream':!checked?'Remote unknown':behind?'Behind':ahead?'Ahead':'Pushed';
      return {available:true,writeEnabled:allowWrites,busy,branch,head,upstream,ahead,behind,files,conflict,label,remoteChecked:checked,remoteError,...await metadata()};
    }catch(error){return {available:false,label:'Git unavailable',reason:error.message};}
  }
  async function fetchRemote(){try{await git(['fetch','--prune','origin']);checked=true;remoteError='';await record({lastChecked:new Date().toISOString()});}catch(error){checked=false;remoteError=error.message;throw error;}}
  async function fingerprint(){const hash=createHash('sha256');hash.update((await git(['rev-parse','HEAD'])).trim());hash.update(await git(['status','--porcelain=v1','-z']));hash.update(await git(['diff','--binary','HEAD','--','data/']));const untracked=(await git(['ls-files','--others','--exclude-standard','-z','--','data/'])).split('\0').filter(Boolean);for(const name of untracked){const target=path.resolve(root,name);if(!target.startsWith(path.join(root,'data')+path.sep))fail('Unexpected report path.');hash.update(name);hash.update(await readFile(target));}return hash.digest('hex');}
  const requireWritable=()=>{if(!allowWrites)fail('Git writes are disabled for a custom report directory.',400);};
  async function preview(){
    requireWritable();await fetchRemote();const current=await status();if(!current.available)fail(current.reason);if(current.conflict)fail('Git histories conflict. Preserve both versions and reconcile in a terminal.');if(current.behind)fail('Remote updates exist. Pull with a clean checkout before publishing new changes.');
    if(current.files.some(f=>!f.reportData&&f.status[0]!==' '&&f.status!=='??'))fail('App files are staged. Commit or unstage them in your terminal before committing reports here.');
    const id=randomUUID(),files=current.files.filter(f=>f.reportData);plans.set(id,{fingerprint:await fingerprint(),createdAt:Date.now(),files});
    for(const [key,plan] of plans)if(Date.now()-plan.createdAt>600000)plans.delete(key);
    const commits=current.ahead?(await git(['log','--format=%h %s','@{upstream}..HEAD'])).trim().split('\n'):[];
    return {id,files,unpushedCommits:commits,status:current};
  }
  async function publish({planId,message='Update research reports'}={}){
    requireWritable();const plan=plans.get(planId);if(!plan||Date.now()-plan.createdAt>600000)fail('Review the changed files again before publishing.');
    if(typeof message!=='string'||!message.trim()||message.length>500)fail('Use a commit message of 1–500 characters.',400);
    if(await fingerprint()!==plan.fingerprint)fail('Files changed after the preview. Review the changed files again.');
    await fetchRemote();const current=await status();if(current.behind||current.conflict)fail('The remote advanced. Reconcile it before publishing.');
    // Validate report JSON before staging the explicitly reviewed data paths.
    for(const file of plan.files.filter(f=>f.path.startsWith('data/reports/')&&f.path.endsWith('.json')&&!f.status.includes('D'))){let report;try{report=JSON.parse(await readFile(path.join(root,file.path),'utf8'));}catch{fail(`Invalid report JSON: ${file.path}`,400);}if(!report.id||!Array.isArray(report.revisions)||!report.revisions.length||report.revisions.some((r,i)=>r.number!==i+1||typeof r.content!=='string'))fail(`Invalid report history: ${file.path}`,400);}
    if(plan.files.length){await git(['add','--','data/']);const staged=(await git(['diff','--cached','--name-only','-z'])).split('\0').filter(Boolean);if(staged.some(name=>!name.startsWith('data/')))fail('Non-report files were staged concurrently. Publish from your terminal.');await git(['commit','-m',message.trim()]);}
    plans.delete(planId);
    try{await git(['push','origin','HEAD']);await record({lastPushed:new Date().toISOString()});checked=true;return {status:await status()};}catch(error){checked=false;fail(`Changes remain saved locally. Push failed: ${error.message}`);}
  }
  async function pull(){
    requireWritable();const before=await status();if(!before.available)fail(before.reason);if(before.files.length)fail('Commit or preserve local changes before pulling. Nothing has been replaced.');
    await fetchRemote();const current=await status();if(current.conflict||current.ahead)fail('Local commits need reconciliation before pulling. Nothing has been merged.');
    await git(['pull','--ff-only','origin',current.branch]);const files=(await git(['diff','--name-only',before.head,'HEAD'])).trim().split('\n').filter(Boolean);await record({lastPulled:new Date().toISOString()});
    return {status:await status(),changedFiles:files,restartRecommended:files.some(name=>!name.startsWith('data/'))};
  }
  async function exclusive(job){if(busy)fail('A Git operation is already running.',423);busy=true;try{return await job();}finally{busy=false;}}
  return {status,preview,publish,pull,check:async()=>{await fetchRemote();return status();},exclusive,get busy(){return busy;}};
}
