import test from 'node:test';
import assert from 'node:assert/strict';
import {parseResearchMetadata} from '../shared/research-metadata.mjs';
const hash='a'.repeat(64);

test('roles and canonical status require explicit opening declarations',()=>{
  const legacy=parseResearchMetadata('# Legacy\n\n## Discussion\n\n**Report role:** Synthesis\n**Status:** Canonical','Reports/review.md');
  assert.equal(legacy.role,null);assert.equal(legacy.canonical,false);
  const independent=parseResearchMetadata('# Perspective\n\n**Report role:** Independent FA\n**Status:** Canonical\n**Model / agent:** Model A\n**Research brief:** brief-01\n**Research query:** Shared scope\n**Information cutoff:** 2026-10-13\n\n## Analysis','Reports/a.md');
  assert.equal(independent.role,'independent');assert.equal(independent.canonical,false);assert.equal(independent.model,'Model A');
  assert.equal(independent.brief,'brief-01');assert.equal(independent.declaredQuery,'Shared scope');
  assert.deepEqual(independent.reportDates,[['Information cutoff','2026-10-13']]);assert.equal(independent.metadataIssues.length,1);
});

test('source pins preserve exact versions and reject external or escaped paths',()=>{
  const result=parseResearchMetadata(`# Canonical\n\n**Report role:** Synthesis\n**Status:** Canonical\n\n## Source reports\n\n**Source report:** [A](../a.md) | SHA-256: ${hash}\n\n**Source report:** [B](<peer%20b.md>)\n\n**Source report:** [External](https://example.com/a.md) | SHA-256: ${hash}\n\n**Source report:** [Escape](../../outside.md) | SHA-256: ${hash}\n\n**Source report:** [Self](review.md) | SHA-256: ${hash}`,'Reports/review.md');
  assert.equal(result.canonical,true);
  assert.deepEqual(result.sourceReports,[{path:'a.md',hash},{path:'Reports/peer b.md',hash:null}]);
});

test('metadata templates in code blocks do not classify a report or invent provenance',()=>{
  const result=parseResearchMetadata(`# Example\n\n\`\`\`markdown\n**Report role:** Synthesis\n**Status:** Canonical\n**Source report:** [A](a.md) | SHA-256: ${hash}\n\`\`\`\n\n## Body\n\nOrdinary content.`,'example.md');
  assert.equal(result.role,null);assert.equal(result.canonical,false);assert.deepEqual(result.sourceReports,[]);assert.equal(result.model,null);
});

test('legacy explicit cutoff wording is recognized without inventing a price year',()=>{
  const result=parseResearchMetadata('# Legacy\n\n**Research cutoff: 11 October 2026. Investment horizon: three to five years.** Prices use 9 October trading.\n\n## Analysis','legacy.md');
  assert.deepEqual(result.reportDates,[['Information cutoff','11 October 2026']]);assert.equal(result.role,null);
});
