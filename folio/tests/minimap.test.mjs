import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
const code=await fs.readFile(new URL('../app/minimap.js',import.meta.url),'utf8');
const pure=vm.createContext({});vm.runInContext(code,pure);
const {metrics,scrollAt}=pure.FAMinimap;

test('minimap geometry maps both scroll endpoints and respects minimum thumb size',()=>{
  const start=metrics({scrollHeight:10000,clientHeight:1000,trackHeight:500,minThumb:20});
  assert.equal(start.thumb,50);assert.equal(start.top,0);assert.equal(start.max,9000);
  const end=metrics({scrollHeight:10000,clientHeight:1000,trackHeight:500,minThumb:20,scrollTop:12000});
  assert.equal(end.top,450);assert.equal(scrollAt(475,25,end),9000);assert.equal(scrollAt(-50,25,end),0);
  const tiny=metrics({scrollHeight:100000,clientHeight:500,trackHeight:500,minThumb:20});assert.equal(tiny.thumb,20);assert.equal(scrollAt(490,10,tiny),99500);
  const fit=metrics({scrollHeight:200,clientHeight:500,trackHeight:500});assert.equal(fit.max,0);assert.equal(fit.thumb,500);assert.equal(scrollAt(200,0,fit),0);
});

test('scrollbar keyboard, pointer, wheel and accessible values control the actual scroll surface',()=>{
  class Element extends EventTarget{
    constructor(){super();this.style={};this.attrs={};this.classes=new Set();this.hidden=false;this.classList={toggle:(name,on)=>on?this.classes.add(name):this.classes.delete(name)};}
    setAttribute(name,value){this.attrs[name]=value;}focus(){document.activeElement=this;}contains(node){return node===this;}getBoundingClientRect(){return {top:0};}
  }
  const document={documentElement:{},activeElement:null};
  const context=vm.createContext({document,window:new EventTarget(),getComputedStyle:()=>({fontSize:'20px'}),setTimeout:()=>1,clearTimeout:()=>{}});vm.runInContext(code,context);
  const scroller=new Element(),rail=new Element(),thumb=new Element();Object.assign(scroller,{scrollHeight:10000,clientHeight:1000,scrollTop:0});Object.assign(rail,{clientHeight:500,clientWidth:68});
  const controller=context.FAMinimap.create({scroller,content:new Element(),rail,canvas:{getContext:()=>null},thumb});controller.sync();
  assert.equal(rail.attrs['aria-valuemax'],'9000');assert.equal(thumb.style.height,'10%');
  const event=(name,props)=>{const e=new Event(name,{cancelable:true});Object.assign(e,props);rail.dispatchEvent(e);return e;};
  event('keydown',{key:'End'});assert.equal(scroller.scrollTop,9000);assert.equal(rail.attrs['aria-valuenow'],'9000');assert.equal(thumb.style.top,'90%');
  event('keydown',{key:'Home'});event('keydown',{key:'ArrowDown'});assert.equal(scroller.scrollTop,60);
  event('keydown',{key:'PageDown'});assert.equal(scroller.scrollTop,960);
  event('pointerdown',{button:0,clientY:250,pointerId:1});assert.equal(scroller.scrollTop,4500);
  event('pointermove',{clientY:900,pointerId:1});assert.equal(scroller.scrollTop,9000);event('pointerup',{pointerId:1});
  event('wheel',{deltaY:-2,deltaMode:1,ctrlKey:false});assert.equal(scroller.scrollTop,8960);
  event('wheel',{deltaY:-100,deltaMode:0,ctrlKey:true});assert.equal(scroller.scrollTop,8960);
  scroller.scrollHeight=500;controller.sync();assert.equal(rail.hidden,true);assert.equal(document.activeElement,scroller);
  controller.destroy();const before=scroller.scrollTop;event('keydown',{key:'End'});assert.equal(scroller.scrollTop,before);
});
