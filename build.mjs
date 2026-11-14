// Static site generator for calculatoruae.ae. No dependencies.
// Usage: node build.mjs   ->   writes the finished site to ./dist
import { createHash } from 'node:crypto';
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pages } from './src/pages.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, 'dist');

export const SITE = {
  origin: 'https://calculatoruae.ae',
  name: 'Calculator UAE',
  email: 'hello@calculatoruae.ae',
  checked: '2026-11-13',
  checkedText: '13 November 2026',
  // Ads: set enabled to true and add your publisher ID after AdSense approval.
  // You must also switch the Content-Security-Policy in static/_headers to the
  // AdSense version documented in README.md, or the ads will be blocked.
  ads: { enabled: false, publisherId: 'ca-pub-0000000000000000' },
};

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const jsonLd = (data) =>
  `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;

const hash = (buf) => createHash('sha256').update(buf).digest('hex').slice(0, 10);

function write(path, content) {
  const full = join(OUT, path);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, content);
}

// ---------- assets (content-hashed so they can be cached forever) ----------
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
cpSync(join(ROOT, 'static'), OUT, { recursive: true });

const calcSrc = readFileSync(join(ROOT, 'src/calc.js'));
const calcName = `calc.${hash(calcSrc)}.js`;
write(`assets/${calcName}`, calcSrc);

const appSrc = readFileSync(join(ROOT, 'src/app.js'), 'utf8').replace('./calc.js', `./${calcName}`);
const appName = `app.${hash(appSrc)}.js`;
write(`assets/${appName}`, appSrc);

const cssSrc = readFileSync(join(ROOT, 'src/styles.css'));
const cssName = `styles.${hash(cssSrc)}.css`;
write(`assets/${cssName}`, cssSrc);

// ---------- shared chrome ----------
const NAV = [
  ['/gratuity-calculator/', 'Gratuity'],
  ['/final-settlement-calculator/', 'Final settlement'],
  ['/rent-increase-calculator/', 'Rent increase'],
  ['/mortgage-calculator/', 'Mortgage'],
  ['/vat-calculator/', 'VAT'],
  ['/calculators/', 'All calculators'],
  ['/guides/', 'Guides'],
];

const MARK = `<svg viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="11" fill="#f2b33d"/><path d="M24.1 12.7a9.5 9.5 0 1 0 0 14.6" fill="none" stroke="#072b25" stroke-width="5" stroke-linecap="round"/><path d="M18 17.2h14M18 22.8h14" stroke="#072b25" stroke-width="3.6" stroke-linecap="round"/></svg>`;

function header(path) {
  const links = NAV.map(
    ([href, label]) =>
      `<a href="${href}"${path.startsWith(href) ? ' aria-current="page"' : ''}>${esc(label)}</a>`,
  ).join('');
  return `<a class="skip" href="#main">Skip to content</a>
<header class="site-head"><div class="wrap">
<a class="brand" href="/" aria-label="Calculator UAE home">${MARK}<span>Calculator <b>UAE</b></span></a>
<nav class="site-nav" aria-label="Main">${links}</nav>
</div></header>`;
}

function footer() {
  const tools = pages.filter((p) => p.kind === 'tool');
  const guides = pages.filter((p) => p.kind === 'guide');
  const list = (items) =>
    items.map((p) => `<li><a href="${p.path}">${esc(p.short || p.h1)}</a></li>`).join('');
  return `<footer class="site-foot"><div class="wrap">
<div class="foot-grid">
<div><h2>Calculators</h2><ul>${list(tools)}</ul></div>
<div><h2>Guides</h2><ul>${list(guides)}</ul></div>
<div><h2>This site</h2><ul>
<li><a href="/about/">About and how we check rules</a></li>
<li><a href="/contact/">Contact</a></li>
<li><a href="/privacy/">Privacy</a></li>
<li><a href="/terms/">Terms</a></li>
<li><a href="/disclaimer/">Disclaimer</a></li>
</ul></div>
</div>
<p class="independent">${esc(SITE.name)} is an independent website. It is not run by, or connected to, the Ministry of Human Resources and Emiratisation or any other government body. Results are estimates, not legal advice.</p>
</div></footer>`;
}

function crumbs(page) {
  if (page.path === '/') return { html: '', schema: null };
  const trail = [['/', 'Home']];
  if (page.kind === 'guide') trail.push(['/guides/', 'Guides']);
  trail.push([page.path, page.short || page.h1]);
  const html = `<nav class="crumbs wrap" aria-label="Breadcrumb"><ol>${trail
    .map(([href, label], i) =>
      i === trail.length - 1
        ? `<li aria-current="page">${esc(label)}</li>`
        : `<li><a href="${href}">${esc(label)}</a></li>`,
    )
    .join('')}</ol></nav>`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map(([href, label], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: label,
      item: SITE.origin + href,
    })),
  };
  return { html, schema };
}

function schemas(page) {
  const url = SITE.origin + page.path;
  const org = { '@type': 'Organization', name: SITE.name, url: SITE.origin + '/' };
  const out = [];
  if (page.path === '/') {
    out.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE.name,
      url: SITE.origin + '/',
      inLanguage: 'en',
      description: page.description,
    });
    out.push({
      '@context': 'https://schema.org',
      ...org,
      logo: SITE.origin + '/icon-512.png',
      email: SITE.email,
    });
  }
  if (page.kind === 'tool') {
    out.push({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: page.h1,
      url,
      description: page.description,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript',
      inLanguage: 'en',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'AED' },
      dateModified: page.modified || SITE.checked,
      publisher: org,
    });
  }
  if (page.kind === 'guide') {
    out.push({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: page.h1,
      description: page.description,
      mainEntityOfPage: url,
      datePublished: page.published || SITE.checked,
      dateModified: page.modified || SITE.checked,
      inLanguage: 'en',
      author: org,
      publisher: org,
      image: SITE.origin + '/og.png',
    });
  }
  if (page.faq && page.faq.length) {
    out.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: page.faq.map(([q, a]) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    });
  }
  return out;
}

const adSlot = (name) =>
  `<div class="ad-slot" data-ad-slot="${name}"${SITE.ads.enabled ? '' : ' hidden'}></div>`;

function faqHtml(faq) {
  if (!faq || !faq.length) return '';
  return `<h2>Questions people ask</h2>${faq
    .map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`)
    .join('')}`;
}

function render(page) {
  const url = SITE.origin + page.path;
  const c = crumbs(page);
  const ld = schemas(page);
  if (c.schema) ld.push(c.schema);
  const ctx = { SITE, esc, adSlot, faqHtml, pages };
  const main = page.body(ctx).replace(
    /<div class="wrap page-head">([\s\S]*?)<\/div>/,
    (m, inner) =>
      `<div class="hero${page.tool ? ' hero-tool' : ''}">${c.html}<div class="wrap page-head">${inner}</div></div>`,
  );
  const robots = page.noindex
    ? 'noindex, follow'
    : 'index, follow, max-snippet:-1, max-image-preview:large';
  const adsTag = SITE.ads.enabled
    ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${esc(SITE.ads.publisherId)}" crossorigin="anonymous"></script>`
    : '';
  return `<!doctype html>
<html lang="en" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.description)}">
<meta name="robots" content="${robots}">
${page.noindex ? '' : `<link rel="canonical" href="${url}">`}
<meta name="theme-color" content="#072b25">
<meta property="og:type" content="${page.kind === 'guide' ? 'article' : 'website'}">
<meta property="og:site_name" content="${esc(SITE.name)}">
<meta property="og:title" content="${esc(page.title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE.origin}/og.png">
<meta property="og:locale" content="en_AE">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/assets/fonts/bricolage-grotesque.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/lexend.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/${cssName}">
${page.tool ? `<script type="module" src="/assets/${appName}"></script>` : ''}
${adsTag}
${ld.map(jsonLd).join('\n')}
</head>
<body>
${header(page.path)}
<main id="main">
${main}
</main>
${footer()}
</body>
</html>
`;
}

// ---------- pages ----------
const seenTitles = new Set();
const seenPaths = new Set();
for (const page of pages) {
  if (seenPaths.has(page.path)) throw new Error(`Duplicate path ${page.path}`);
  if (seenTitles.has(page.title)) throw new Error(`Duplicate title ${page.title}`);
  seenPaths.add(page.path);
  seenTitles.add(page.title);
  const file = page.file || join(page.path, 'index.html');
  write(file, render(page));
}

// ---------- sitemap, robots, llms.txt ----------
const indexable = pages.filter((p) => !p.noindex);
write(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexable
  .map(
    (p) =>
      `<url><loc>${SITE.origin}${p.path}</loc><lastmod>${p.modified || SITE.checked}</lastmod></url>`,
  )
  .join('\n')}
</urlset>
`,
);

const BOTS = [
  'Googlebot',
  'Bingbot',
  'Google-Extended',
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'PerplexityBot',
  'Applebot',
];
write(
  'robots.txt',
  `User-agent: *
Allow: /

${BOTS.map((b) => `User-agent: ${b}\nAllow: /`).join('\n\n')}

Sitemap: ${SITE.origin}/sitemap.xml
`,
);

const llmsLine = (p) => `- [${p.short || p.h1}](${SITE.origin}${p.path}): ${p.description}`;
write(
  'llms.txt',
  `# ${SITE.name}

> Free calculators for UAE private sector employment rules: end of service gratuity, unused leave pay, notice pay and the full final settlement. Each page states the rule, the formula, worked examples and its sources. Rules last checked ${SITE.checkedText}. Independent site, not affiliated with any government body. Results are estimates, not legal advice.

## Calculators
${pages.filter((p) => p.kind === 'tool').map(llmsLine).join('\n')}

## Guides
${pages.filter((p) => p.kind === 'guide').map(llmsLine).join('\n')}

## About
- [About and how we check rules](${SITE.origin}/about/): Who runs the site and how each rule is sourced and reviewed.
`,
);

console.log(`Built ${pages.length} pages to dist/ (${cssName}, ${appName}, ${calcName})`);
