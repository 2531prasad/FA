import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { parseResearchMetadata } from './shared/research-metadata.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const hash = text => crypto.createHash('sha256').update(text).digest('hex');
const MAX_SIZE = 2 * 1024 * 1024;
const ignored = new Set(['app', 'tests', 'node_modules', 'README.md', 'AGENTS.md']);

export function lineDiff(before, after) {
  const a = before.split('\n'), b = after.split('\n');
  let start = 0, end = 0;
  while (start < a.length && start < b.length && a[start] === b[start]) start++;
  while (end < a.length - start && end < b.length - start && a[a.length - 1 - end] === b[b.length - 1 - end]) end++;
  const x = a.slice(start, a.length - end), y = b.slice(start, b.length - end);
  const ops = a.slice(0, start).map(text => ({type: 'context', text}));
  if (x.length * y.length <= 2_000_000) {
    const rows = Array.from({length: x.length + 1}, () => new Uint32Array(y.length + 1));
    for (let i = x.length - 1; i >= 0; i--) for (let j = y.length - 1; j >= 0; j--)
      rows[i][j] = x[i] === y[j] ? rows[i+1][j+1] + 1 : Math.max(rows[i+1][j], rows[i][j+1]);
    let i = 0, j = 0;
    while (i < x.length || j < y.length) {
      if (i < x.length && j < y.length && x[i] === y[j]) { ops.push({type:'context', text:x[i++]}); j++; }
      else if (i < x.length && (j === y.length || rows[i+1][j] >= rows[i][j+1])) ops.push({type:'removed', text:x[i++]});
      else ops.push({type:'added', text:y[j++]});
    }
  } else {
    ops.push(...x.map(text => ({type:'removed', text})), ...y.map(text => ({type:'added', text})));
  }
  ops.push(...a.slice(a.length - end).map(text => ({type:'context', text})));
  let oldLine = 0, newLine = 0;
  return ops.map(op => ({...op, oldLine: op.type === 'added' ? null : ++oldLine, newLine: op.type === 'removed' ? null : ++newLine}));
}

function metadata(file, content, stat, config, revisions) {
  const research=parseResearchMetadata(content,file);
  const clean = s => s.replace(/!?\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[*_`#]/g, '').trim();
  const lines = content.split('\n');
  const title = clean(lines.find(l => /^# /.test(l)) || path.basename(file, '.md'));
  const summary = clean(lines.find(l => /^\*\*Overall judgment:/.test(l)) || lines.find(l => /^\*\*NVDA/.test(l)) || lines.find(l => l.length > 100 && !/^[#|>]/.test(l) && !/cutoff|Prepared:/.test(l)) || '').slice(0, 280);
  const headings = lines.filter(l => /^#{2,3} /.test(l) || /^\*\*[^*]+\*\*$/.test(l.trim())).map(l => clean(l));
  const tables = lines.filter(l => /^\|\s*:?-{3}/.test(l)).length;
  const words = content.trim().split(/\s+/).length;
  const links = [...content.matchAll(/\[[^\]]*\]\(([^)]+\.md)(?:#[^)]*)?\)/g)].map(m => path.posix.normalize(path.posix.join(path.posix.dirname(file), m[1])));
  const prepared = content.match(/(?:Prepared[:*\s]*)(\d{1,2} \w+ \d{4})/i)?.[1] || null;
  return { path:file, title, summary, headings, tables, words, minutes:Math.max(1, Math.ceil(words/220)), links:[...new Set(links)], prepared,
    modifiedAt:stat.mtime.toISOString(), observedAt:revisions[0]?.observedAt, hash:hash(content), revisions:revisions.length,
    label:config.label || 'Report', kind:config.kind || 'Research', query:(typeof config.query === 'string' ? config.query : '')||research.declaredQuery, color:config.color || ['mint','coral','lavender'][parseInt(hash(file).slice(0,2),16)%3], featured:!!config.featured, ...research };
}

export async function createLedger({root = HERE, pollMs = 1500} = {}) {
  root = await fs.realpath(root);
  const store = path.join(root, '.ledger');
  await fs.mkdir(store, {recursive:true, mode:0o700});
  const token = crypto.randomBytes(32).toString('hex');
  const reports = new Map(), histories = new Map();
  let serial = Promise.resolve(), generation = 0;
  const locked = task => { const result = serial.then(task); serial = result.catch(() => {}); return result; };
  async function walk(dir = root) {
    const out = [];
    for (const entry of await fs.readdir(dir, {withFileTypes:true})) {
      if (entry.name.startsWith('.') || ignored.has(entry.name)) continue;
      const location = path.join(dir, entry.name);
      if (entry.isDirectory()) out.push(...await walk(location));
      else if (entry.isFile() && /\.md$/i.test(entry.name)) out.push(path.relative(root, location).split(path.sep).join('/'));
    }
    return out;
  }
  async function safeFile(file) {
    if (!file || !/\.md$/i.test(file) || file.split('/').some(p => p.startsWith('.')) || ignored.has(file.split('/')[0])) throw new Error('Invalid report path');
    const resolved = await fs.realpath(path.resolve(root, file));
    if (!resolved.startsWith(root + path.sep)) throw new Error('Invalid report path');
    return resolved;
  }
  async function capture(file, content, stat, config, source = 'File change', note = '') {
    let history = histories.get(file);
    const historyFile = path.join(store, hash(file) + '.json');
    if (!history) {
      try { history = JSON.parse(await fs.readFile(historyFile, 'utf8')); } catch (err) { if (err.code !== 'ENOENT') throw err; history = []; }
      histories.set(file, history);
    }
    if (history.at(-1)?.hash !== hash(content)) {
      const observedAt = new Date().toISOString();
      history.push({id:crypto.randomUUID(), hash:hash(content), content, observedAt, modifiedAt:stat.mtime.toISOString(), source:history.length ? source : 'Initial snapshot', note});
      const temp = historyFile + '.tmp';
      await fs.writeFile(temp, JSON.stringify(history), {mode:0o600});
      await fs.rename(temp, historyFile);
      generation++;
    }
    reports.set(file, metadata(file, content, stat, config, history));
  }
  async function scan() {
    let config = {};
    try { config = JSON.parse(await fs.readFile(path.join(root, 'ledger.config.json'), 'utf8')).reports || {}; } catch (err) { if (err.code !== 'ENOENT') throw err; }
    const files = await walk();
    for (const file of files) {
      const location = await safeFile(file), stat = await fs.stat(location);
      if (stat.size > MAX_SIZE) continue;
      const content = await fs.readFile(location, 'utf8');
      await capture(file, content, stat, config[file] || {});
    }
    for (const file of reports.keys()) if (!files.includes(file)) { reports.delete(file); generation++; }
  }
  await scan();
  const timer = setInterval(() => locked(scan).catch(err => console.error('Ledger scan:', err.message)), pollMs);
  timer.unref();
  function send(res, status, data, type = 'application/json; charset=utf-8') {
    res.writeHead(status, {'Content-Type':type, 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff', 'Referrer-Policy':'no-referrer', 'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'"});
    res.end(type.startsWith('application/json') ? JSON.stringify(data) : data);
  }
  const server = http.createServer(async (req, res) => {
    try {
      const address = server.address();
      if (![`127.0.0.1:${address.port}`, `localhost:${address.port}`].includes(req.headers.host)) return send(res, 403, {error:'Local access only'});
      if (req.headers.origin && ![`http://127.0.0.1:${address.port}`, `http://localhost:${address.port}`].includes(req.headers.origin)) return send(res, 403, {error:'Origin rejected'});
      const url = new URL(req.url, `http://${req.headers.host}`);
      if (req.method === 'GET' && url.pathname === '/api/reports') {
        await locked(scan);
        return send(res, 200, {reports:[...reports.values()], generation, token});
      }
      if (req.method === 'GET' && url.pathname === '/api/report') {
        await locked(scan);
        const file = url.searchParams.get('path');
        if (!reports.has(file)) return send(res,404,{error:'Report not found'});
        return send(res,200,{...reports.get(file), content:await fs.readFile(await safeFile(file),'utf8')});
      }
      if (req.method === 'GET' && url.pathname === '/api/history') {
        await locked(scan);
        const file = url.searchParams.get('path');
        if (!reports.has(file)) return send(res,404,{error:'Report not found'});
        const history = histories.get(file);
        const revision = url.searchParams.get('revision');
        if (revision) {
          const i = history.findIndex(r => r.id === revision);
          if (i < 0) return send(res,404,{error:'Revision not found'});
          const diff = lineDiff(history[i-1]?.content || '', history[i].content);
          return send(res,200,{...history[i], diff});
        }
        return send(res,200,{history:history.map((r,i) => {
          const diff = i ? lineDiff(history[i-1].content,r.content) : [];
          return {...r, content:undefined, added:diff.filter(l=>l.type==='added').length, removed:diff.filter(l=>l.type==='removed').length};
        }).reverse()});
      }
      if (req.method === 'POST' && url.pathname === '/api/import') {
        if (req.headers['x-ledger-token'] !== token || !req.headers['content-type']?.startsWith('application/json')) return send(res,403,{error:'Import rejected'});
        let body = '';
        for await (const chunk of req) { body += chunk; if (Buffer.byteLength(body) > MAX_SIZE + 10000) return send(res,413,{error:'Report is too large'}); }
        const input = JSON.parse(body);
        if (typeof input.content !== 'string' || !input.content.trim() || Buffer.byteLength(input.content) > MAX_SIZE || typeof input.filename !== 'string' || input.filename.length > 160 || !/^[a-z0-9][a-z0-9 ._-]*\.md$/i.test(input.filename) || /^(readme|agents)\.md$/i.test(input.filename)) return send(res,400,{error:'Use a Markdown filename with letters, numbers, spaces, dots, hyphens or underscores, and nonempty report text.'});
        return await locked(async () => {
          const directory = path.join(root,'Imported');
          await fs.mkdir(directory,{recursive:true});
          if ((await fs.lstat(directory)).isSymbolicLink() || !(await fs.realpath(directory)).startsWith(root + path.sep)) return send(res,403,{error:'Import directory must be a real directory inside the workspace'});
          const file = 'Imported/' + input.filename, location = path.join(directory,input.filename);
          try { await fs.writeFile(location,input.content,{flag:'wx',mode:0o600}); }
          catch (error) { if(error.code === 'EEXIST')return send(res,409,{error:'That filename already exists. Choose a different filename, or edit the existing report.'});throw error; }
          await capture(file,input.content,await fs.stat(location),{},'Import','Imported original Markdown.');
          return send(res,201,reports.get(file));
        });
      }
      if (req.method === 'PUT' && url.pathname === '/api/report') {
        if (req.headers['x-ledger-token'] !== token || !req.headers['content-type']?.startsWith('application/json')) return send(res,403,{error:'Save rejected'});
        let body = '';
        for await (const chunk of req) { body += chunk; if (Buffer.byteLength(body) > MAX_SIZE + 10000) return send(res,413,{error:'Report is too large'}); }
        const input = JSON.parse(body);
        if (typeof input.content !== 'string' || Buffer.byteLength(input.content) > MAX_SIZE) return send(res,400,{error:'Invalid content'});
        return await locked(async () => {
          if (!reports.has(input.path)) return send(res,404,{error:'Report not found'});
          const location = await safeFile(input.path), current = await fs.readFile(location,'utf8');
          if (hash(current) !== input.hash) return send(res,409,{error:'This file changed on disk. Your draft is still here. Copy it before reloading the latest version.'});
          const stat = await fs.stat(location), temp = location + '.ledger-' + crypto.randomUUID() + '.tmp';
          try {
            await fs.writeFile(temp,input.content,{flag:'wx',mode:stat.mode});
            // Check once more immediately before replacing the file.
            if (hash(await fs.readFile(location,'utf8')) !== input.hash) return send(res,409,{error:'File changed while saving. Your draft is preserved.'});
            await fs.rename(temp,location);
          } finally { await fs.rm(temp,{force:true}); }
          const config = JSON.parse(await fs.readFile(path.join(root,'ledger.config.json'),'utf8').catch(()=>'{"reports":{}}'));
          await capture(input.path,input.content,await fs.stat(location),config.reports?.[input.path] || {},'Browser edit',String(input.note || '').slice(0,240));
          send(res,200,reports.get(input.path));
        });
      }
      if (req.method !== 'GET') return send(res,405,{error:'Method not allowed'});
      const assets = {'/':'index.html','/index.html':'index.html','/app.js':'app.js','/research.js':'research.js','/minimap.js':'minimap.js','/styles.css':'styles.css','/vendor/marked.umd.js':'vendor/marked.umd.js','/favicon.svg':'favicon.svg','/fonts/ArchivoBlack-Regular.ttf':'fonts/ArchivoBlack-Regular.ttf'};
      const asset = assets[url.pathname];
      if (!asset) return send(res,404,{error:'Not found'});
      const type = asset.endsWith('.css') ? 'text/css' : asset.endsWith('.js') ? 'text/javascript' : asset.endsWith('.svg') ? 'image/svg+xml' : asset.endsWith('.ttf') ? 'font/ttf' : 'text/html';
      send(res,200,await fs.readFile(path.join(HERE,'app',asset)),type+'; charset=utf-8');
    } catch (err) { console.error(err.message); if (!res.headersSent) send(res,500,{error:'Could not complete the request. Check the server terminal.'}); else res.end(); }
  });
  server.on('close', () => clearInterval(timer));
  return {server, scan:() => locked(scan)};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 5173);
  const {server} = await createLedger();
  server.listen(port,'127.0.0.1',() => console.log(`Folio is ready at http://127.0.0.1:${server.address().port}\nReading Markdown from ${HERE}\nKeep this terminal open. Press Ctrl+C to stop.`));
  server.on('error', err => { console.error(err.code === 'EADDRINUSE' ? `Port ${port} is in use. Try PORT=5174 npm start.` : err.message); process.exit(1); });
}
