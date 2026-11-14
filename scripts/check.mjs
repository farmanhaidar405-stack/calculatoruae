// Post-build checks: links, titles, descriptions, canonicals, JSON-LD, ids.
// Usage: node scripts/check.mjs
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = join(fileURLToPath(new URL('..', import.meta.url)), 'dist');
const files = [];
(function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.html')) files.push(p);
  }
})(DIST);

let problems = 0;
const fail = (file, msg) => { problems += 1; console.log(`PROBLEM ${file.replace(DIST, '')}: ${msg}`); };
const rows = [];
const inbound = new Map();
for (const file of files) {
  const html = readFileSync(file, 'utf8');
  const rel = file.replace(DIST, '').replace(/index\.html$/, '');
  const title = (/<title>(.*?)<\/title>/.exec(html) || [])[1] || '';
  const desc = (/<meta name="description" content="(.*?)">/.exec(html) || [])[1] || '';
  const canonical = (/<link rel="canonical" href="(.*?)">/.exec(html) || [])[1] || '';
  const h1s = html.match(/<h1[ >]/g) || [];
  const decoded = (s) => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
  if (decoded(title).length > 60) fail(file, `title ${decoded(title).length} chars`);
  if (decoded(desc).length > 158 || decoded(desc).length < 70) fail(file, `description ${decoded(desc).length} chars`);
  if (h1s.length !== 1) fail(file, `${h1s.length} h1 elements`);
  if (!rel.includes('404') && canonical !== `https://calculatoruae.ae${rel}`) fail(file, `canonical ${canonical}`);
  if (/ on[a-z]+="|style="|javascript:/i.test(html)) fail(file, 'inline handler or style found');
  const ids = [...html.matchAll(/ id="(.*?)"/g)].map((m) => m[1]);
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dup.length) fail(file, `duplicate ids ${[...new Set(dup)].join(', ')}`);
  const types = [];
  for (const m of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) {
    try { types.push(JSON.parse(m[1])['@type']); } catch { fail(file, 'invalid JSON-LD'); }
  }
  for (const m of html.matchAll(/(?:href|src)="(\/[^"#]*)/g)) {
    const target = m[1];
    const t = join(DIST, target);
    const ok = existsSync(t) && (statSync(t).isFile() || existsSync(join(t, 'index.html')));
    if (!ok) fail(file, `broken link ${target}`);
    if (target.endsWith('/') && target !== rel) inbound.set(target, (inbound.get(target) || 0) + 1);
  }
  const text = html.replace(/<script.*?<\/script>/gs, '').replace(/<(header|footer|nav)[\s\S]*?<\/\1>/g, '').replace(/<[^>]+>/g, ' ');
  rows.push({ page: rel, titleLen: decoded(title).length, descLen: decoded(desc).length, words: text.split(/\s+/).filter(Boolean).length, schema: types.join(', ') });
}
for (const r of rows) if (!r.page.includes('404') && r.page !== '/' && !inbound.get(r.page)) { problems += 1; console.log(`PROBLEM ${r.page}: orphan page`); }
console.table(rows);
console.log(problems ? `${problems} problem(s) found` : 'All checks passed');
process.exit(problems ? 1 : 0);
