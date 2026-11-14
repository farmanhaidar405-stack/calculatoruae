# SEO, AEO and GEO checklist

## What is built in

| Item | Status |
|---|---|
| One unique title (60 chars or fewer) and meta description per page | Done, checked by `scripts/check.mjs` |
| Self-referencing canonical on every indexable page | Done |
| Trailing-slash URLs, lowercase, hyphenated, no duplicates | Done |
| sitemap.xml with lastmod | Done |
| robots.txt allowing search and AI crawlers, with sitemap line | Done |
| llms.txt | Done |
| Home page links to every tool and guide; footer links on every page; no orphans | Done, checked |
| Breadcrumbs + BreadcrumbList schema | Done |
| WebApplication schema on tools, Article on guides, FAQPage where FAQs are visible, WebSite + Organization on home | Done, JSON parses |
| All text in the HTML (readable without JavaScript) | Done |
| 40-60 word direct answer under each H1 | Done |
| Question-style headings, tables, worked examples, sources, last-checked date | Done |
| Open Graph image, favicon, touch icon, manifest | Done |
| 404 page (noindex) with tool links | Done |
| Layout shift | Measured 0 on the gratuity page |
| Page weight | About 125 KB per tool page including both fonts |
| Fixed-height ad slots, hidden until ads are on | Done |

Not done: a Lighthouse run and Google's Rich Results Test. Run both on the live
site (pagespeed.web.dev and search.google.com/test/rich-results).

Note: Google stopped showing FAQ rich results in May 2026. The FAQ markup is
kept because it is harmless and other engines read it; do not expect FAQ
dropdowns in Google results.

## Pages

| URL | Main keyword | Words |
|---|---|---|
| / | uae calculators | 460 |
| /gratuity-calculator/ | gratuity calculator uae | 1,050 |
| /leave-salary-calculator/ | uae leave salary calculator | 810 |
| /notice-pay-calculator/ | notice period salary calculation uae | 760 |
| /final-settlement-calculator/ | final settlement calculator uae | 780 |
| /rent-increase-calculator/ | rera rent calculator / rent increase calculator dubai | 610 |
| /mortgage-calculator/ | uae mortgage calculator | 560 |
| /car-loan-calculator/ | dubai car loan calculator | 490 |
| /vat-calculator/ | vat calculator uae | 450 |
| /zakat-calculator/ | zakat calculator | 700 |
| /overstay-fine-calculator/ | overstay fine uae | 510 |
| /e-invoicing-penalty-calculator/ | e invoicing penalties uae | 680 |
| /calculators/ | hub page | 200 |
| /guides/how-gratuity-is-calculated-uae/ | how is gratuity calculated in uae | 530 |
| /guides/basic-salary-vs-total-salary-uae/ | basic salary vs total salary uae | 410 |
| /guides/gratuity-on-resignation-uae/ | gratuity on resignation uae | 430 |
| /guides/final-settlement-uae-what-is-included/ | final settlement uae | 430 |

The seven newer tool pages are 450 to 700 words, shorter than the Work pages.
The guides are shorter than the 1,000 words often advised for AdSense review.
Extend them with your own knowledge before applying.

## Launch steps (yours)

1. Deploy, then load every page once and check the browser console for errors.
2. Google Search Console: add the domain property, verify by DNS, submit
   `https://calculatoruae.ae/sitemap.xml`, then use URL Inspection > Request
   indexing on the home page and the four tools.
3. Bing Webmaster Tools: import from Search Console and submit the sitemap.
   ChatGPT search draws on Bing, so this matters for AI answers.
4. Check `site:calculatoruae.ae` in Google after one to two weeks.
5. Free listings that need no budget: Google Business Profile is not needed;
   submit to a few tool directories and answer real gratuity questions on
   Reddit and Quora with a link only where it helps.

## Next pages, in order

1. Gratuity after N years pages are NOT recommended (same calculation, thin).
2. Four more guides: unpaid leave and gratuity; what to do if the settlement
   is late; limited vs unlimited contract history; leave carry-over rules.
3. Arabic and Urdu versions of the four tools.
4. One guide per newer tool (rent notice rules, flat vs reducing rate, nisab, e-invoicing readiness).

## AdSense timing

Apply once the site has all trust pages (done), 15 or more guides, your name on
the About page, and some organic visits showing in Search Console. Applying on
day one with nine content pages risks a "low value content" rejection.
