import { cp, mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
export async function buildPages({output=path.join(root,'dist'),includeReports=false,reportDirectory=path.join(root,'data','reports')}={}) {
  output=path.resolve(output);
  if(output===root || ['data','public','shared','.git'].some(name=>output===path.join(root,name)||output.startsWith(path.join(root,name)+path.sep)))throw new Error('Choose a dedicated static output directory outside the report library and app sources.');
  await mkdir(output,{recursive:true});
  await cp(path.join(root,'public'),output,{recursive:true});
  await cp(path.join(root,'shared'),path.join(output,'shared'),{recursive:true});
  await cp(path.join(root,'templates','report.md'),path.join(output,'report-template.md'));
  const reports=[];
  if(includeReports)for(const name of (await readdir(reportDirectory)).filter(name=>name.endsWith('.json')).sort())reports.push(JSON.parse(await readFile(path.join(reportDirectory,name),'utf8')));
  let sourceCommit=null;try{sourceCommit=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','ignore'],windowsHide:true}).trim();}catch{}
  const runtime={mode:'static',readOnly:true,libraryIncluded:includeReports,exportedAt:new Date().toISOString(),sourceCommit};
  await writeFile(path.join(output,'runtime.json'),JSON.stringify(runtime,null,2)+'\n');
  await writeFile(path.join(output,'library.json'),JSON.stringify({schemaVersion:1,reports},null,2)+'\n');
  await writeFile(path.join(output,'.nojekyll'),'');
  return {output,reports:reports.length,includeReports};
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const unknown=process.argv.slice(2).filter(arg=>arg!=='--include-reports');if(unknown.length)throw new Error(`Unknown build option: ${unknown.join(', ')}`);
  console.log(JSON.stringify(await buildPages({includeReports:process.argv.includes('--include-reports')})));
}
