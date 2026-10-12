import { buildSynthesisPacket } from './shared/synthesis.mjs';

export async function createDataClient(base=new URL('./',location.href)) {
  const response=await fetch(new URL('runtime.json',base));
  if(!response.ok)throw new Error('The workspace configuration could not be loaded.');
  const runtime=await response.json();
  if(!['local','static'].includes(runtime.mode))throw new Error('Unknown workspace mode.');
  let library;
  async function api(route,body) {
    if(runtime.mode==='static'){
      if(body)throw new Error('This hosted library is read-only. Use the local workspace to save reports or synchronize Git.');
      if(!library){const result=await fetch(new URL('library.json',base));if(!result.ok)throw new Error('The published report library could not be loaded.');library=await result.json();}
      if(route==='/api/reports')return structuredClone(library.reports);
      const match=route.match(/^\/api\/reports\/([a-zA-Z0-9_-]+)(\/synthesis-packet)?$/);
      const report=match&&library.reports.find(r=>r.id===match[1]);
      if(report)return match[2]?buildSynthesisPacket(report,library.reports):structuredClone(report);
      throw new Error('This action is available in the local workspace.');
    }
    const result=await fetch(new URL(route.replace(/^\//,''),base),body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{});
    const data=await result.json();if(!result.ok)throw Object.assign(new Error(data.error || 'The operation failed.'),{status:result.status});return data;
  }
  return {runtime,api};
}
