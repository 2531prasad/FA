/* Saved Markdown prompts, with browser-local recent usage. No report context is added. */
window.FAPrompts=(()=>{
  const storageKey='fa-prompt-usage';
  function readUsage(storage){
    try{const value=JSON.parse(storage?.getItem(storageKey)||'{}');return value&&typeof value==='object'&&!Array.isArray(value)?Object.fromEntries(Object.entries(value).filter(([,time])=>Number.isSafeInteger(time)&&time>0)):{};}catch{return {};}
  }
  function sorted(prompts,usage){return prompts.map((prompt,index)=>({prompt,index})).sort((a,b)=>(usage[b.prompt.id]||0)-(usage[a.prompt.id]||0)||a.index-b.index).map(item=>item.prompt);}
  function remember(usage,id,storage,now=Date.now()){
    const latest=Math.max(0,...Object.values(usage).filter(Number.isSafeInteger));
    usage[id]=Math.max(now,latest+1);
    try{storage?.setItem(storageKey,JSON.stringify(usage));}catch{}
    return usage;
  }
  function validateCatalog(data){
    if(!Array.isArray(data?.prompts))throw new Error('The prompt catalog could not be read.');
    const ids=new Set();
    return data.prompts.map(prompt=>{
      if(!prompt||typeof prompt.id!=='string'||!/^[-a-z0-9]+$/.test(prompt.id)||ids.has(prompt.id)||typeof prompt.title!=='string'||!prompt.title.trim()||typeof prompt.description!=='string'||typeof prompt.file!=='string'||!/^[a-z0-9][a-z0-9-]*\.md$/.test(prompt.file))throw new Error('The prompt catalog contains an invalid entry.');
      ids.add(prompt.id);return prompt;
    });
  }
  function create({trigger,menu,list,openDialog,buildBrief}){
    let storage;try{storage=localStorage;}catch{}
    let usage=readUsage(storage),catalog=null,pending=null,focusRequest=0,dialogRequest=0;
    const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const ordered=()=>sorted(catalog||[],usage);
    async function load(){
      if(catalog)return catalog;
      if(!pending)pending=(async()=>{const response=await fetch('./prompts/catalog.json');if(!response.ok)throw new Error('The prompt catalog is unavailable. Try again.');catalog=validateCatalog(await response.json());return catalog;})().finally(()=>{pending=null;});
      return pending;
    }
    function position(){
      if(menu.hidden)return;
      const rect=trigger.getBoundingClientRect(),unit=parseFloat(getComputedStyle(document.documentElement).fontSize)||16;
      const width=Math.min(22*unit,window.innerWidth-1.5*unit);
      const left=Math.max(.75*unit,Math.min(rect.left,window.innerWidth-width-.75*unit));
      menu.style.setProperty('--prompt-left',left/unit+'rem');menu.style.setProperty('--prompt-top',(rect.bottom+.5*unit)/unit+'rem');
    }
    function close(restore=false){++focusRequest;menu.hidden=true;trigger.setAttribute('aria-expanded','false');if(restore)trigger.focus();}
    function render(){
      list.innerHTML=ordered().slice(0,5).map(prompt=>`<li role="none"><button role="menuitem" class="prompt-option" data-saved-prompt="${escape(prompt.id)}"><span class="prompt-option-title">${escape(prompt.title)}</span><span class="prompt-option-description">${escape(prompt.description)}</span></button></li>`).join('')||'<li role="none"><span class="prompt-menu-status">No saved prompts yet.</span></li>';
    }
    async function show(edge='first'){
      const request=++focusRequest;menu.hidden=false;trigger.setAttribute('aria-expanded','true');position();
      list.innerHTML='<li role="none"><span class="prompt-menu-status" role="status">Loading prompts…</span></li>';
      try{await load();if(request!==focusRequest||menu.hidden)return;render();}
      catch(error){if(request!==focusRequest||menu.hidden)return;list.innerHTML=`<li role="none"><span class="prompt-menu-status" role="alert">${escape(error.message)}</span></li>`;}
      const items=menu.querySelectorAll('[role="menuitem"]');(edge==='last'?items[items.length-1]:items[0])?.focus();
    }
    async function openPrompt(id){
      const request=++dialogRequest;close();
      try{await load();if(request!==dialogRequest)return;const prompt=catalog.find(item=>item.id===id);if(!prompt)throw new Error('This prompt is no longer in the catalog.');
        openDialog(prompt.title,'<p class="form-note">Opening a prompt does not use it. Copy it when you are ready; your edited copy stays in this dialog.</p><label class="field">Prompt<textarea id="saved-prompt-text" class="editor saved-prompt-text" spellcheck="false" aria-busy="true" readonly>Loading prompt…</textarea></label><p id="saved-prompt-status" class="form-note" role="status"></p><div class="action-row"><button id="copy-saved-prompt" class="button primary" disabled>Copy prompt</button><button id="back-to-prompts" class="button">All prompts</button></div>');
        const text=document.querySelector('#saved-prompt-text'),button=document.querySelector('#copy-saved-prompt'),status=document.querySelector('#saved-prompt-status');
        document.querySelector('#back-to-prompts').addEventListener('click',library);
        const response=await fetch('./prompts/'+prompt.file);if(!response.ok)throw new Error('This prompt could not be loaded. Reopen it to try again.');
        const content=await response.text();if(!text.isConnected)return;
        text.value=content;text.readOnly=false;text.setAttribute('aria-busy','false');button.disabled=false;text.focus();
        button.addEventListener('click',async()=>{
          if(!text.value.trim()){status.textContent='Add prompt text before copying.';return;}
          try{await navigator.clipboard.writeText(text.value);remember(usage,id,storage);status.textContent='Prompt copied. It now appears first in recent prompts.';}
          catch{text.focus();text.select();status.textContent='Select and copy the prompt below. Recent usage updates when you copy.';}
        });
        text.addEventListener('copy',()=>{remember(usage,id,storage);});
      }catch(error){if(request!==dialogRequest)return;const status=document.querySelector('#saved-prompt-status');if(status){status.textContent=error.message;document.querySelector('#saved-prompt-text')?.setAttribute('aria-busy','false');}else openDialog('Prompt unavailable',`<p role="alert">${escape(error.message)}</p>`);}
    }
    async function library(){
      ++dialogRequest;close();openDialog('Prompt library','<p class="form-note">Saved prompts, most recently used first. Copy a prompt to move it to the top.</p><div id="saved-prompt-library" class="saved-prompt-library" role="status">Loading prompts…</div><div class="action-row"><button id="build-research-brief" class="button">Build a custom research brief</button></div>');
      document.querySelector('#build-research-brief').addEventListener('click',buildBrief);
      const target=document.querySelector('#saved-prompt-library');
      try{await load();if(!target.isConnected)return;target.removeAttribute('role');target.innerHTML=ordered().map(prompt=>`<button class="saved-prompt-card" data-library-prompt="${escape(prompt.id)}"><strong>${escape(prompt.title)}</strong><span>${escape(prompt.description)}</span></button>`).join('')||'<p>No saved prompts yet.</p>';
        target.querySelectorAll('[data-library-prompt]').forEach(button=>button.addEventListener('click',()=>openPrompt(button.dataset.libraryPrompt)));
        target.querySelector('[data-library-prompt]')?.focus();
      }catch(error){if(target.isConnected)target.textContent=error.message;}
    }
    trigger.addEventListener('click',()=>menu.hidden?show():close());
    trigger.addEventListener('keydown',event=>{if(event.key==='Escape'&&!menu.hidden){event.preventDefault();event.stopPropagation();close(true);}if(['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();show(event.key==='ArrowUp'?'last':'first');}});
    menu.addEventListener('click',event=>{const button=event.target.closest('[data-saved-prompt]');if(button)openPrompt(button.dataset.savedPrompt);if(event.target.closest('#all-prompts'))library();});
    menu.addEventListener('keydown',event=>{
      if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close(true);return;}
      if(event.key==='Tab'){close(true);return;}
      if(!['ArrowDown','ArrowUp','Home','End'].includes(event.key))return;
      event.preventDefault();const items=[...menu.querySelectorAll('[role="menuitem"]')],index=items.indexOf(document.activeElement);
      const next=event.key==='Home'?0:event.key==='End'?items.length-1:(index+(event.key==='ArrowDown'?1:-1)+items.length)%items.length;items[next]?.focus();
    });
    document.addEventListener('click',event=>{if(!menu.hidden&&!menu.contains(event.target)&&!trigger.contains(event.target))close();});
    document.addEventListener('focusin',event=>{if(!menu.hidden&&!menu.contains(event.target)&&!trigger.contains(event.target))close();});
    window.addEventListener('resize',position);
    window.addEventListener('storage',event=>{if(event.key===storageKey){usage=readUsage(storage);if(!menu.hidden)render();}});
    return {open:show,close,library,openPrompt};
  }
  return {create,readUsage,sorted,remember,validateCatalog};
})();
