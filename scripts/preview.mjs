// Builds preview.html: every page of the site in ONE self-contained file,
// for looking at the design and trying the calculators without deploying.
// The real site (dist/) uses separate URLs; this file is not for hosting.
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST = join(ROOT, 'dist');
const files = [];
(function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (f === 'index.html') files.push(p);
  }
})(DIST);

const nameOf = (path) => (path === '/' ? 'home' : path.replace(/^\/|\/$/g, '').replace(/\//g, '-'));
const home = readFileSync(join(DIST, 'index.html'), 'utf8');
const header = /<header class="site-head">[\s\S]*?<\/header>/.exec(home)[0];
const footer = /<footer class="site-foot">[\s\S]*?<\/footer>/.exec(home)[0];

const fix = (html) =>
  html.replace(/href="(\/[^"]*)"/g, (m, path) => (path.includes('.') ? m : `href="#${nameOf(path)}"`));

let n = 0;
const sections = files
  .map((file) => {
    const html = readFileSync(file, 'utf8');
    const path = file.replace(DIST, '').replace(/index\.html$/, '');
    const title = /<title>(.*?)<\/title>/.exec(html)[1];
    let inner = html.slice(html.indexOf('</header>') + 9, html.indexOf('<footer class="site-foot">'));
    n += 1;
    inner = inner
      .replace(/<main id="main">/, '<main>')
      .replace(/(id|for|aria-describedby)="(f|h)-/g, `$1="p${n}-$2-`);
    return `<section data-page="${nameOf(path)}" data-title="${title}" hidden>${fix(inner)}</section>`;
  })
  .join('\n');

const assets = readdirSync(join(DIST, 'assets'));
const read = (prefix, ext) => readFileSync(join(DIST, 'assets', assets.find((f) => f.startsWith(prefix) && f.endsWith(ext))), 'utf8');
const font = (file) => `data:font/woff2;base64,${readFileSync(join(DIST, 'assets/fonts', file)).toString('base64')}`;
const css = read('styles.', '.css')
  .replace('/assets/fonts/bricolage-grotesque.woff2', font('bricolage-grotesque.woff2'))
  .replace('/assets/fonts/lexend.woff2', font('lexend.woff2'))
  .replaceAll('/assets/rosette.svg', `data:image/svg+xml;base64,${readFileSync(join(DIST, 'assets/rosette.svg')).toString('base64')}`);
const calc = read('calc.', '.js').replace(/^export /gm, '');
const app = read('app.', '.js').replace(/import \{[\s\S]*?\} from '.*?';/, '');

const out = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Calculator UAE: site preview</title>
<style>${css}
.preview-note{background:var(--ink);color:var(--paper);font-size:.85rem;padding:.45rem 0}
.preview-note p{margin:0}</style>
</head>
<body>
<div class="preview-note"><p class="wrap">Preview of calculatoruae.ae: all pages in one file. The live site uses a separate URL for each page.</p></div>
${fix(header)}
${sections}
${fix(footer)}
<script>(function(){
${calc}
${app}
var pages = document.querySelectorAll('section[data-page]');
function show(){
  var name = location.hash.slice(1) || 'home', found = false;
  pages.forEach(function(s){ var on = s.dataset.page === name; s.hidden = !on; if (on) { found = true; document.title = s.dataset.title; } });
  if (!found) { pages.forEach(function(s){ s.hidden = s.dataset.page !== 'home'; }); }
  document.querySelectorAll('.site-nav a').forEach(function(a){
    if (a.getAttribute('href') === '#' + name) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  window.scrollTo({ top: 0, behavior: 'instant' });
}
window.addEventListener('hashchange', show);
show();
})();</script>
</body>
</html>
`;
writeFileSync(join(ROOT, 'preview.html'), out);
console.log(`preview.html written (${Math.round(out.length / 1024)} KB, ${files.length} pages)`);
