import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';

const context=vm.createContext({window:{}});
vm.runInContext(await fs.readFile(new URL('../app/prompt-menu.js',import.meta.url),'utf8'),context);
const {readUsage,sorted,remember,validateCatalog}=context.window.FAPrompts;
const prompts=JSON.parse(await fs.readFile(new URL('../app/prompts/catalog.json',import.meta.url),'utf8')).prompts;

test('saved prompts sort by actual usage, persist across sessions and keep unused catalog order',()=>{
  const values=new Map(),storage={getItem:key=>values.get(key),setItem:(key,value)=>values.set(key,value)};
  const usage=readUsage(storage),ids=value=>Array.from(value,p=>p.id);
  assert.deepEqual(ids(sorted(prompts,usage)),['initial-fa','synthesize-fa']);
  remember(usage,'synthesize-fa',storage,100);assert.deepEqual(ids(sorted(prompts,usage)),['synthesize-fa','initial-fa']);
  remember(usage,'initial-fa',storage,100);assert.equal(usage['initial-fa'],101);
  assert.deepEqual(ids(sorted(prompts,readUsage(storage))),['initial-fa','synthesize-fa']);
  const extra=[...prompts,{id:'future-prompt'}];assert.deepEqual(ids(sorted(extra,usage)),['initial-fa','synthesize-fa','future-prompt']);
  assert.deepEqual(prompts.map(p=>p.id),['initial-fa','synthesize-fa']);
});

test('unavailable or malformed browser storage does not prevent prompt use',()=>{
  for(const value of ['broken','null','[]','{"initial-fa":"recent","synthesize-fa":-1}'])assert.equal(Object.keys(readUsage({getItem:()=>value})).length,0);
  const storage={getItem:()=>{throw new Error('Blocked');},setItem:()=>{throw new Error('Quota');}};
  const usage=readUsage(storage);assert.doesNotThrow(()=>remember(usage,'initial-fa',storage,123));assert.equal(usage['initial-fa'],123);
});

test('prompt catalog uses unique stable identities and safe Markdown paths',async()=>{
  assert.equal(validateCatalog({prompts}).length,2);
  for(const file of ['../report.md','/private.md','https://example.com/prompt.md','nested/prompt.md','prompt.json'])assert.throws(()=>validateCatalog({prompts:[{...prompts[0],file}]}),/invalid entry/);
  assert.throws(()=>validateCatalog({prompts:[prompts[0],prompts[0]]}),/invalid entry/);
  for(const prompt of prompts){const content=await fs.readFile(new URL('../app/prompts/'+prompt.file,import.meta.url),'utf8');assert.match(content,/^# /);}
});
