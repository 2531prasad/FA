import path from 'node:path';

// Read only explicit declarations, outside code fences. Body claims never set roles.
export function parseResearchMetadata(content,file){
  let fence=null;
  const lines=content.split('\n').filter(line=>{
    const match=line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if(match){if(!fence)fence={char:match[1][0],length:match[1].length};else if(match[1][0]===fence.char&&match[1].length>=fence.length)fence=null;return false;}
    return !fence;
  });
  const boundary=lines.findIndex(line=>/^#{2,6}\s/.test(line));
  const header=lines.slice(0,boundary<0?lines.length:boundary);
  const declarations=new Map();
  for(const line of header){const match=line.match(/^\*\*([^*]+):\*\*\s*(.*?)\s*$/);if(match&&!declarations.has(match[1].toLowerCase()))declarations.set(match[1].toLowerCase(),match[2]);}
  const declaredRole=declarations.get('report role')||'';
  const role=/^independent fa$/i.test(declaredRole)?'independent':/^synthesis$/i.test(declaredRole)?'synthesis':null;
  const canonical=role==='synthesis'&&/^canonical$/i.test(declarations.get('status')||'');
  const issues=[];
  if(declaredRole&&!role)issues.push('Unrecognized report role');
  if(/^canonical$/i.test(declarations.get('status')||'')&&role!=='synthesis')issues.push('Canonical status requires a Synthesis report role');
  const sourceReports=[];
  for(const line of lines){
    const match=line.match(/^\*\*Source report:\*\*\s*\[[^\]]*\]\(<?([^)>]+)>?\)\s*(?:\|\s*SHA-256:\s*([a-f0-9]{64}))?\s*$/i);
    if(!match)continue;
    let target;try{target=decodeURIComponent(match[1]);}catch{continue;}
    if(/^[a-z]+:|^\/|\\|#|\?/i.test(target)||!/\.md$/i.test(target))continue;
    const normalized=path.posix.normalize(path.posix.join(path.posix.dirname(file),target));
    if(normalized.startsWith('../')||normalized.split('/').some(part=>part.startsWith('.'))||normalized===file)continue;
    if(!sourceReports.some(source=>source.path===normalized))sourceReports.push({path:normalized,hash:match[2]?.toLowerCase()||null});
  }
  const reportDates=[];
  for(const [label,keys] of [['Prepared',['prepared','report date']],['Information cutoff',['information cutoff','research cutoff']],['Price date',['price date','prices as of']]]){
    const raw=keys.map(key=>declarations.get(key)).find(Boolean);
    const date=raw?.match(/^(\d{4}-\d{2}-\d{2}|\d{1,2}\s+[A-Za-z]+\s+\d{4})(?=$|[.,;\s])/u)?.[1]||header.join('\n').match(new RegExp(`(?:${keys.join('|')})[:*\\s]*(\\d{4}-\\d{2}-\\d{2}|\\d{1,2}\\s+[A-Za-z]+\\s+\\d{4})(?=$|[.,;\\s*])`,'i'))?.[1];
    if(date)reportDates.push([label,date]);
  }
  return {role,canonical,model:declarations.get('model / agent')||null,brief:declarations.get('research brief')||null,declaredQuery:declarations.get('research query')||'',sourceReports,reportDates,metadataIssues:issues};
}
