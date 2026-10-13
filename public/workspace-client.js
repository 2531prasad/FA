// Keep the published reader on the existing local API and static export contract.
window.FAWorkspace={readOnly:true,remote:true,async api(route,options){return (await ready).api(route,options);}};
const ready=Promise.all([import('./data-client.js'),import('./shared/folio-adapter.mjs')]).then(async([data,folio])=>{
  const client=await data.createDataClient(),adapter=await folio.createFolioAdapter(client);
  window.FAWorkspace.readOnly=client.runtime.readOnly;
  document.querySelector('#import-report').hidden=client.runtime.readOnly;
  document.querySelector('#workspace-tools').hidden=client.runtime.readOnly;
  document.querySelector('#connection').textContent=client.runtime.readOnly?'Published library':'Local workspace';
  document.querySelector('#footer-status').textContent=client.runtime.readOnly?'Read-only export · Revision history preserved':'Local reports · Revision history preserved';
  return adapter;
});
