import { inferDocumentDates, validateDates } from './chronology.mjs';

export const MAX_REPORT_CHARACTERS = 200000;
export const MAX_FILE_BYTES = 850000;
export function displayMarkdown(content) {
  let text=content.replace(/^\uFEFF/,'');
  const wrapper=text.trim().match(/^```(?:markdown|md)\s*\r?\n([\s\S]*?)\r?\n```$/i);
  if(wrapper)text=wrapper[1];
  return text.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/,'');
}
export function inspectMarkdown(content,filename='') {
  if(typeof content!=='string' || !content.trim())throw new Error('Add Markdown content before importing.');
  if(content.length>MAX_REPORT_CHARACTERS)throw new Error('A report can contain at most 200,000 characters.');
  let text=content.replace(/^\uFEFF/,'');
  const wrapper=text.trim().match(/^```(?:markdown|md)\s*\r?\n([\s\S]*?)\r?\n```$/i);
  if(wrapper)text=wrapper[1];
  const metadata={};
  const frontmatter=text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if(frontmatter) {
    for(const line of frontmatter[1].split(/\r?\n/)) {
      const pair=line.match(/^([a-z_]+):\s*(.*?)\s*$/i);if(!pair)continue;
      let value=pair[2];
      if((value.startsWith('"')&&value.endsWith('"'))||(value.startsWith("'")&&value.endsWith("'")))value=value.slice(1,-1);
      metadata[pair[1].toLowerCase()]=value;
    }
    text=text.slice(frontmatter[0].length);
  }
  const title=metadata.title || text.match(/^#\s+(.+)$/m)?.[1].trim() || filename.replace(/\.(md|markdown|txt)$/i,'') || 'Imported analysis';
  const dates={...inferDocumentDates(text)};
  for(const [field,key] of [['reportDate','report_date'],['informationCutoff','information_cutoff'],['marketDate','market_date']])if(metadata[key])dates[field]=metadata[key];
  return {title,query:metadata.query || '',agent:metadata.agent || '',dates,displayContent:text};
}
export function prepareMarkdownImport(input) {
  const metadata=inspectMarkdown(input.content,input.originalFile?.name || '');
  return {...input,title:input.title || metadata.title,query:input.query || (input.company?undefined:metadata.query),agent:input.agent || metadata.agent,dates:validateDates({...metadata.dates,...(input.dates || {})}),type:input.type || 'Imported analysis',importMethod:input.originalFile?'file':'paste'};
}
