export const TIME_ZONE = 'Asia/Kolkata';
const keys = ['reportDate', 'informationCutoff', 'marketDate'];
export function validateDates(input={}) {
  const dates={};
  const fail=message=>{const error=new Error(message);error.status=400;throw error;};
  for(const key of keys) {
    if(input[key]===undefined || input[key]===null || input[key]==='')continue;
    const value=input[key];
    if(typeof value!=='string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value+'T00:00:00Z')) || new Date(value+'T00:00:00Z').toISOString().slice(0,10)!==value)fail(`${key} must be a valid YYYY-MM-DD date.`);
    dates[key]=value;
  }
  if(dates.reportDate && dates.informationCutoff && dates.informationCutoff>dates.reportDate)fail('The information cutoff cannot follow the report date.');
  if(dates.reportDate && dates.marketDate && dates.marketDate>dates.reportDate)fail('The market-price date cannot follow the report date.');
  return dates;
}
export function inferDocumentDates(content) {
  const opening=content.slice(0,2000);
  const months={january:'01',february:'02',march:'03',april:'04',may:'05',june:'06',july:'07',august:'08',september:'09',october:'10',november:'11',december:'12'};
  function extract(pattern){const match=opening.match(pattern);return match?`${match[3]}-${months[match[2].toLowerCase()]}-${match[1].padStart(2,'0')}`:undefined;}
  const date='(\\d{1,2})\\s+(January|February|March|April|May|June|July|August|September|October|November|December)\\s+(\\d{4})';
  const dates={reportDate:extract(new RegExp('Prepared[^\\n]{0,12}?'+date,'i')),informationCutoff:extract(new RegExp('(?:Research|Information) cutoff[^\\n]{0,12}?'+date,'i')),marketDate:extract(new RegExp('Prices[^\\n]{0,80}?'+date,'i'))};
  if(!dates.marketDate && dates.informationCutoff) {
    const partial=opening.match(/Prices[^\n]{0,80}?(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)/i);
    if(partial && months[partial[2].toLowerCase()]===dates.informationCutoff.slice(5,7)) { const candidate=`${dates.informationCutoff.slice(0,4)}-${months[partial[2].toLowerCase()]}-${partial[1].padStart(2,'0')}`;if(candidate<=dates.informationCutoff)dates.marketDate=candidate; }
  }
  return validateDates(dates);
}
export function reportDates(report,revision=report?.revisions?.at(-1)) { return revision?.dates || report?.initialDates || report?.dates || {}; }
export function formatDay(value) { return value?new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',year:'numeric',timeZone:TIME_ZONE}).format(new Date(value+'T00:00:00Z')):'Not recorded'; }
export function formatInstant(value) { return value?new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false,timeZone:TIME_ZONE}).format(new Date(value))+' IST':'Not recorded'; }
export function localDay(value=new Date()) { const parts=new Intl.DateTimeFormat('en-CA',{year:'numeric',month:'2-digit',day:'2-digit',timeZone:TIME_ZONE}).formatToParts(value);return ['year','month','day'].map(type=>parts.find(p=>p.type===type).value).join('-'); }
export function buildTimeline(reports) {
  const milestones=[],events=[];
  for(const report of reports) {
    const dates=reportDates(report);
    for(const [field,label] of [['marketDate','Market prices as of'],['informationCutoff','Information cutoff'],['reportDate','Report dated']])if(dates[field])milestones.push({day:dates[field],label,reportId:report.id,title:report.title,evidence:dates[field]===report.initialDates?.[field]?(report.dateSources?.[field] || 'Original report metadata'):`Local revision ${report.revisions.at(-1).number} metadata`});
    for(const revision of report.revisions) events.push({at:revision.createdAt,label:revision.number===1?(report.originalFile||report.importMethod?'Local import':report.sources?.length?'Source compilation':'Report created'):'Revision saved',reportId:report.id,title:report.title,version:revision.number,note:revision.summary,source:'Local workspace',sources:report.sources || []});
    for(const event of report.ledger?.events || [])events.push({at:event.created_at,label:'Thesis Ledger '+event.kind,reportId:report.id,title:report.title,note:event.note,source:'Thesis Ledger snapshot',ledgerVersion:event.version});
    for(const event of report.dateEvents || [])events.push({at:event.at,label:'Date metadata recorded',reportId:report.id,title:report.title,note:event.note,source:'Local workspace'});
  }
  milestones.sort((a,b)=>a.day.localeCompare(b.day)||a.title.localeCompare(b.title));
  events.sort((a,b)=>Date.parse(a.at)-Date.parse(b.at)||a.title.localeCompare(b.title));
  return {milestones,events};
}
