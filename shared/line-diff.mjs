export function lineDiff(before, after) {
  const a = before.split('\n'), b = after.split('\n');
  let start = 0, end = 0;
  while (start < a.length && start < b.length && a[start] === b[start]) start++;
  while (end < a.length - start && end < b.length - start && a[a.length - 1 - end] === b[b.length - 1 - end]) end++;
  const x = a.slice(start, a.length - end), y = b.slice(start, b.length - end);
  const ops = a.slice(0, start).map(text => ({type: 'context', text}));
  if (x.length * y.length <= 2_000_000) {
    const rows = Array.from({length: x.length + 1}, () => new Uint32Array(y.length + 1));
    for (let i = x.length - 1; i >= 0; i--) for (let j = y.length - 1; j >= 0; j--)
      rows[i][j] = x[i] === y[j] ? rows[i+1][j+1] + 1 : Math.max(rows[i+1][j], rows[i][j+1]);
    let i = 0, j = 0;
    while (i < x.length || j < y.length) {
      if (i < x.length && j < y.length && x[i] === y[j]) { ops.push({type:'context', text:x[i++]}); j++; }
      else if (i < x.length && (j === y.length || rows[i+1][j] >= rows[i][j+1])) ops.push({type:'removed', text:x[i++]});
      else ops.push({type:'added', text:y[j++]});
    }
  } else {
    ops.push(...x.map(text => ({type:'removed', text})), ...y.map(text => ({type:'added', text})));
  }
  ops.push(...a.slice(a.length - end).map(text => ({type:'context', text})));
  let oldLine = 0, newLine = 0;
  return ops.map(op => ({...op, oldLine: op.type === 'added' ? null : ++oldLine, newLine: op.type === 'removed' ? null : ++newLine}));
}
