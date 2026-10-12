import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStore } from './lib/store.mjs';

const root=path.dirname(fileURLToPath(import.meta.url));
const port=Number(process.env.PORT || 4310);
const host='127.0.0.1';
const store=createStore(process.env.FA_DATA_DIR || path.join(root,'data','reports'));
await store.init();
const assets={'/':'index.html','/app.js':'app.js','/importer.js':'importer.js','/styles.css':'styles.css','/groups.js':'../lib/groups.mjs','/chronology.js':'../lib/chronology.mjs','/chronology.mjs':'../lib/chronology.mjs','/markdown-import.js':'../lib/markdown-import.mjs','/fonts/ArchivoBlack-Regular.ttf':'fonts/ArchivoBlack-Regular.ttf'};
assets['/report-template.md']='../templates/report.md';
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.ttf':'font/ttf','.md':'text/markdown; charset=utf-8'};
const server=http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
  res.setHeader('Cache-Control','no-store');
  const json=(status,value)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(value));};
  try {
    const allowedHosts=[`${host}:${port}`,`localhost:${port}`];
    if(!allowedHosts.includes(req.headers.host)) return json(403,{error:'Use the local workspace address.'});
    if(req.headers.origin && !allowedHosts.some(h=>req.headers.origin===`http://${h}`)) return json(403,{error:'This request must come from the local workspace.'});
    const url=new URL(req.url,`http://${host}:${port}`);
    if(url.pathname.startsWith('/api/')) {
      if(req.method==='GET' && url.pathname==='/api/reports') return json(200,await store.list());
      const match=url.pathname.match(/^\/api\/reports\/([a-zA-Z0-9_-]+)$/);
      if(req.method==='GET' && match) return json(200,await store.get(match[1]));
      if(req.method!=='POST') return json(405,{error:'Method not allowed.'});
      if(!(req.headers['content-type'] || '').startsWith('application/json')) return json(415,{error:'Send JSON content.'});
      let size=0;const chunks=[];for await(const chunk of req) { size+=chunk.length; if(size>1000000) { const e=new Error('Report exceeds the 1 MB request limit.');e.status=413;throw e; }chunks.push(chunk); }
      const body=Buffer.concat(chunks).toString('utf8');
      let input; try{input=JSON.parse(body);}catch{ return json(400,{error:'Invalid JSON.'}); }
      if(!input || typeof input!=='object' || Array.isArray(input)) return json(400,{error:'A JSON object is required.'});
      if(url.pathname==='/api/reports') return json(201,await store.create(input));
      if(url.pathname==='/api/import') { const result=await store.importMarkdown(input);return json(result.reused?200:201,result); }
      if(url.pathname==='/api/synthesize') return json(201,await store.synthesize(input));
      const revision=url.pathname.match(/^\/api\/reports\/([a-zA-Z0-9_-]+)\/revisions$/);
      if(revision) return json(200,await store.revise(revision[1],input));
      return json(404,{error:'Unknown endpoint.'});
    }
    if(!['GET','HEAD'].includes(req.method)) return json(405,{error:'Method not allowed.'});
    const asset=assets[url.pathname]; if(!asset) return json(404,{error:'Not found.'});
    const content=await readFile(path.join(root,'public',asset));res.writeHead(200,{'Content-Type':types[path.extname(asset)] || (path.extname(asset)==='.mjs'?'text/javascript; charset=utf-8':'application/octet-stream')});res.end(req.method==='HEAD'?undefined:content);
  } catch(e) { if(!e.status) console.error(e); json(e.status || 500,{error:e.status?e.message:'Could not complete the operation. Check the terminal and try again.'}); }
});
server.listen(port,host,()=>console.log(`FA workspace: http://${host}:${port}\nReports: ${process.env.FA_DATA_DIR || path.join(root,'data','reports')}`));
