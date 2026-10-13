/* Page overview: canvas is decorative; the scrollbar remains keyboard operable. */
(() => {
  const clamp=(value,min,max)=>Math.min(max,Math.max(min,Number.isFinite(value)?value:min));
  function metrics({scrollHeight=0,clientHeight=0,scrollTop=0,trackHeight=0,minThumb=20}={}){
    const total=Math.max(0,scrollHeight),visible=Math.max(0,clientHeight),track=Math.max(0,trackHeight);
    const max=Math.max(0,total-visible),thumb=Math.min(track,Math.max(Math.min(minThumb,track),total?track*visible/total:track));
    const travel=Math.max(0,track-thumb),value=clamp(scrollTop,0,max);
    return {max,thumb,travel,top:max?value/max*travel:0,value,ratio:max?value/max:0};
  }
  function scrollAt(position,grabOffset,geometry){
    return geometry.travel?clamp((position-grabOffset)/geometry.travel,0,1)*geometry.max:0;
  }
  function create({scroller,content,rail,canvas,thumb,enabled=()=>true}){
    if(!scroller||!content||!rail||!canvas||!thumb)return null;
    let ctx;try{ctx=canvas.getContext?.('2d');}catch{}
    let frame=0,drag=null,destroyed=false;
    const requestFrame=globalThis.requestAnimationFrame||((fn)=>setTimeout(fn,0));
    const cancelFrame=globalThis.cancelAnimationFrame||clearTimeout;
    const rootSize=()=>typeof getComputedStyle==='function'?parseFloat(getComputedStyle(document.documentElement).fontSize)||16:16;
    const geometry=()=>metrics({scrollHeight:scroller.scrollHeight,clientHeight:scroller.clientHeight,scrollTop:scroller.scrollTop,trackHeight:rail.clientHeight,minThumb:rootSize()*1.25});
    function sync(){
      if(destroyed)return;
      const overflow=enabled()&&scroller.scrollHeight>scroller.clientHeight+1;
      if(!overflow&&rail.contains(document.activeElement))scroller.focus();
      rail.hidden=!overflow;scroller.classList.toggle('has-document-map',overflow);
      const g=geometry(),height=rail.clientHeight||1;
      thumb.style.height=`${g.thumb/height*100}%`;thumb.style.top=`${g.top/height*100}%`;
      rail.setAttribute('aria-valuemax',String(Math.round(g.max)));rail.setAttribute('aria-valuenow',String(Math.round(g.value)));
      rail.setAttribute('aria-valuetext',`${Math.round(g.ratio*100)}% through the current page`);
    }
    function draw(){
      frame=0;sync();
      if(destroyed||rail.hidden||!ctx||typeof document.createRange!=='function')return;
      const width=rail.clientWidth,height=rail.clientHeight;if(width<24||!height)return;
      const dpr=Math.min(2,globalThis.devicePixelRatio||1);
      canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
      const colors=getComputedStyle(document.documentElement),ink=colors.getPropertyValue('--muted').trim(),accent=colors.getPropertyValue('--red').trim();
      const origin=scroller.getBoundingClientRect(),sx=(width-6)/Math.max(1,scroller.clientWidth),sy=height/Math.max(1,scroller.scrollHeight);
      const walker=document.createTreeWalker(content,NodeFilter.SHOW_TEXT),range=document.createRange();
      let node,count=0;
      while((node=walker.nextNode())&&count<16000){
        if(!node.textContent.trim()||node.parentElement?.closest('button,textarea,select,[hidden],script,style'))continue;
        range.selectNodeContents(node);if(typeof range.getClientRects!=='function')continue;
        const heading=node.parentElement?.closest('h1,h2,h3,h4');
        ctx.fillStyle=heading?accent:ink;ctx.globalAlpha=heading?.85:.48;
        for(const rect of range.getClientRects()){
          if(rect.width<=0||rect.height<=0)continue;
          const x=3+(rect.left-origin.left+scroller.scrollLeft)*sx,y=(rect.top-origin.top+scroller.scrollTop)*sy;
          const lineWidth=Math.max(0,Math.min(width-3-Math.max(3,x),rect.width*sx));
          if(lineWidth)ctx.fillRect(Math.max(3,x),y,lineWidth,Math.max(.7,rect.height*sy*.55));count++;
        }
      }
      ctx.globalAlpha=1;range.detach?.();
    }
    function refresh(){if(!destroyed&&!frame)frame=requestFrame(draw);}
    function move(event){if(drag===null)return;scroller.scrollTop=scrollAt(event.clientY-rail.getBoundingClientRect().top,drag,geometry());sync();}
    function down(event){
      if(event.button!==0)return;event.preventDefault();rail.focus();
      const g=geometry(),position=event.clientY-rail.getBoundingClientRect().top;
      drag=event.target===thumb?position-g.top:g.thumb/2;
      rail.setPointerCapture?.(event.pointerId);move(event);
    }
    function up(event){drag=null;if(rail.hasPointerCapture?.(event.pointerId))rail.releasePointerCapture(event.pointerId);}
    function key(event){
      const g=geometry(),step=rootSize()*3,page=scroller.clientHeight*.9;
      const targets={Home:0,End:g.max,ArrowUp:g.value-step,ArrowDown:g.value+step,PageUp:g.value-page,PageDown:g.value+page};
      if(!(event.key in targets))return;event.preventDefault();scroller.scrollTop=clamp(targets[event.key],0,g.max);sync();
    }
    function wheel(event){if(event.ctrlKey)return;event.preventDefault();scroller.scrollTop+=event.deltaY*(event.deltaMode===1?rootSize():event.deltaMode===2?scroller.clientHeight:1);sync();}
    rail.addEventListener('pointerdown',down);rail.addEventListener('pointermove',move);rail.addEventListener('pointerup',up);rail.addEventListener('pointercancel',up);rail.addEventListener('keydown',key);
    rail.addEventListener('wheel',wheel,{passive:false});
    scroller.addEventListener('scroll',sync,{passive:true});window.addEventListener('resize',refresh);
    const resize=typeof ResizeObserver==='function'?new ResizeObserver(refresh):null;resize?.observe(scroller);resize?.observe(content);resize?.observe(rail);
    const mutation=typeof MutationObserver==='function'?new MutationObserver(refresh):null;
    mutation?.observe(content,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['hidden','open']});
    const appearance=typeof MutationObserver==='function'?new MutationObserver(refresh):null;
    appearance?.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme','data-contrast','data-reading-size','data-minimap']});
    document.fonts?.ready.then(refresh);refresh();
    return {refresh,sync,destroy(){destroyed=true;cancelFrame(frame);resize?.disconnect();mutation?.disconnect();appearance?.disconnect();scroller.removeEventListener('scroll',sync);window.removeEventListener('resize',refresh);rail.removeEventListener('wheel',wheel);for(const [name,fn] of [['pointerdown',down],['pointermove',move],['pointerup',up],['pointercancel',up],['keydown',key]])rail.removeEventListener(name,fn);}};
  }
  globalThis.FAMinimap=Object.freeze({metrics,scrollAt,create});
})();
