import { groupName, groupCode } from './groups.mjs';
export function searchReport(report,query,{bodies=false,history=false}={}) {
  const needle=query.trim().toLocaleLowerCase();if(!needle)return {matches:true,hits:[]};
  const metadata=`${groupName(report)} ${groupCode(report)} ${report.title}`.toLocaleLowerCase().includes(needle),hits=[];
  if(bodies)for(const revision of history?[...report.revisions].reverse():report.revisions.slice(-1)) {
    const index=revision.content.toLocaleLowerCase().indexOf(needle);
    if(index>=0){const start=Math.max(0,index-55),end=Math.min(revision.content.length,index+query.length+95);hits.push({revision:revision.number,historical:revision.number!==report.revisions.at(-1).number,text:(start?'…':'')+revision.content.slice(start,end).replace(/\s+/g,' ')+(end<revision.content.length?'…':'')});}
  }
  return {matches:metadata||!!hits.length,hits};
}
export function highlightText(text,query,escape) {
  if(!query?.trim())return escape(text);
  const needle=query.trim().toLocaleLowerCase(),haystack=text.toLocaleLowerCase();let cursor=0,html='',index;
  while((index=haystack.indexOf(needle,cursor))>=0){html+=escape(text.slice(cursor,index))+`<mark>${escape(text.slice(index,index+needle.length))}</mark>`;cursor=index+needle.length;}
  return html+escape(text.slice(cursor));
}
