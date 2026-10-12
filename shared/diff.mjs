const tokens=text=>text.match(/\s+|[\p{L}\p{N}_]+|[^\s]/gu) || [];
function grouped(parts) {const output=[];for(const part of parts){if(!part.text)continue;if(output.at(-1)?.type===part.type)output.at(-1).text+=part.text;else output.push({...part});}return output;}
export function wordDiff(before,after,{maxWork=200000}={}) {
  const a=tokens(before),b=tokens(after);let start=0,end=0;
  while(start<a.length&&start<b.length&&a[start]===b[start])start++;
  while(end<a.length-start&&end<b.length-start&&a[a.length-end-1]===b[b.length-end-1])end++;
  const left=a.slice(start,a.length-end),right=b.slice(start,b.length-end),prefix=a.slice(0,start).join(''),suffix=end?a.slice(-end).join(''):'';
  const finish=(middle,coarse=false)=>({parts:grouped([{type:'same',text:prefix},...middle,{type:'same',text:suffix}]),coarse});
  const fallback=()=>finish([{type:'remove',text:left.join('')},{type:'add',text:right.join('')}],true);
  if(!left.length)return finish([{type:'add',text:right.join('')}]);
  if(!right.length)return finish([{type:'remove',text:left.join('')}]);
  if(left.length+right.length>30000)return fallback();
  const trace=[],v=new Map([[1,0]]);let work=0;
  for(let d=0;d<=left.length+right.length;d++) {
    trace.push(new Map(v));
    for(let k=-d;k<=d;k+=2) {
      if(++work>maxWork)return fallback();
      let x=k===-d || (k!==d&&(v.get(k-1)??-1)<(v.get(k+1)??-1))?(v.get(k+1)??0):(v.get(k-1)??0)+1,y=x-k;
      while(x<left.length&&y<right.length&&left[x]===right[y]){x++;y++;if(++work>maxWork)return fallback();}
      v.set(k,x);
      if(x>=left.length&&y>=right.length) {
        const parts=[];let px=left.length,py=right.length;
        for(let depth=trace.length-1;depth>=0;depth--) {
          const previous=trace[depth],diagonal=px-py;
          const prevK=diagonal===-depth || (diagonal!==depth&&(previous.get(diagonal-1)??-1)<(previous.get(diagonal+1)??-1))?diagonal+1:diagonal-1;
          const prevX=previous.get(prevK)??0,prevY=prevX-prevK;
          while(px>prevX&&py>prevY)parts.push({type:'same',text:left[--px]}),py--;
          if(depth===0)break;
          if(px===prevX)parts.push({type:'add',text:right[--py]});else parts.push({type:'remove',text:left[--px]});
        }
        return finish(parts.reverse());
      }
    }
  }
  return fallback();
}
export function diffHTML(before,after,escape) {const diff=wordDiff(before,after);return `${diff.coarse?'<p class="form-note">Large changes are grouped to keep this preview responsive.</p>':''}<div class="word-diff">${diff.parts.map(p=>p.type==='same'?escape(p.text):`<${p.type==='add'?'ins':'del'}>${escape(p.text)}</${p.type==='add'?'ins':'del'}>`).join('')}</div>`;}
