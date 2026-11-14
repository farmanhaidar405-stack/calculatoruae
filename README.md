# calculatoruae.ae

Static site of 11 UAE calculators (work, housing, money, business, visa) and 4 guides. No backend, no database, no
dependencies. Everything the browser needs is in `dist/`.

## Commands

    node build.mjs            # rebuild dist/ from src/ and static/
    npm test                  # 33 unit tests on the calculation rules
    node scripts/check.mjs    # links, titles, canonicals, JSON-LD, orphans
    node scripts/serve.mjs    # preview at http://localhost:8788 with the real CSP
    node scripts/preview.mjs  # preview.html: the whole site in one file, for viewing only
    node scripts/rosette.mjs  # regenerate the engraved background pattern

Needs Node 20 or newer. There is nothing to `npm install`.

## Deploy to Cloudflare Pages (free)

1. Push this folder to a private GitHub repository.
2. Cloudflare dashboard > Workers & Pages > Create > Pages > connect the repo.
3. Build command: `node build.mjs`. Output directory: `dist`.
4. Custom domains > add `calculatoruae.ae` and `www.calculatoruae.ae`.
5. Add a redirect rule from `www` to the bare domain so only one version is indexed.
6. SSL/TLS > set "Always Use HTTPS" on.

`dist/_headers` sets the security headers. Check them after launch at
securityheaders.com.

## Before launch: things only you can do

- Create the mailbox `hello@calculatoruae.ae` (it is shown on Contact, About, Privacy).
  To use another address, change `email` in `build.mjs`.
- Read `RULES_VERIFICATION.md` and confirm each rule against the official law text.
- Open the two official links under "Sources" on any tool page and confirm they load.
- Add your name and a short bio to the About page (`src/pages.mjs`, path `/about/`).
  A named owner helps trust with readers, Google and AdSense reviewers.
- Follow `SEO_CHECKLIST.md` for Search Console, Bing and AdSense timing.

## How it is protected

- No server code, logins, forms or database, so there is nothing to inject into or log in to.
- Content-Security-Policy allows scripts, styles and fonts from this domain only.
  No inline scripts, inline styles or event-handler attributes exist in the HTML
  (`scripts/check.mjs` fails the build check if one appears).
- User input is validated in `calc.js` (`toAmount`, `parseDate`): only plain
  non-negative numbers and real dates are accepted, with upper limits. Anything
  else returns an error message, never a calculation.
- Results are written with `textContent`, never `innerHTML`.
- No cookies, no storage, no network requests after page load, no third-party code.
- HSTS, X-Frame-Options DENY, nosniff, strict referrer policy, locked-down
  Permissions-Policy.

Account security matters more than code here: turn on two-factor login for
the domain registrar, Cloudflare and GitHub, and lock the domain against transfer.

## Update a rule

1. Change the number in `RULES` at the top of `src/calc.js`.
2. Update the matching test in `test/calc.test.mjs` and run `npm test`.
3. Update the page text and worked examples in `src/pages.mjs`.
4. Change `checked` and `checkedText` in `build.mjs`.
5. Update `RULES_VERIFICATION.md`, then `node build.mjs`.

## Add a calculator

1. `src/calc.js`: add a pure function that returns `{ error }` or a result. Add tests.
2. `src/app.js`: add a handler to `tools` that returns `{ total, lines, note }`.
3. `src/pages.mjs`: add a page object with `kind: 'tool'`, `tool: true`, a unique
   `path`, `title` (60 characters or fewer), `description`, `faq`, and a `body`
   that calls `toolBlock('<handler name>', ...)`.
4. `node build.mjs && node scripts/check.mjs`. The home page, footer, sitemap and
   llms.txt pick the new page up automatically.

Each new page must do a different calculation. Do not generate pages that only
swap a city or a word; Google's spam updates target exactly that.

## Turn on ads after AdSense approval

1. `build.mjs`: set `ads.enabled` to `true` and put in your publisher ID.
2. `static/ads.txt`: replace the comment with the line AdSense gives you.
3. `static/_headers`: replace the Content-Security-Policy line with:

       Content-Security-Policy: default-src 'none'; script-src 'self' https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.google.com https://*.doubleclick.net https://*.adtrafficquality.google 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; frame-src https://*.doubleclick.net https://*.googlesyndication.com https://*.google.com; connect-src 'self' https://*.google.com https://*.googlesyndication.com https://*.doubleclick.net https://*.adtrafficquality.google; manifest-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; upgrade-insecure-requests

   Ads need a looser policy than the site ships with. Test in the browser console
   for blocked requests and adjust; Google changes its ad domains over time.
4. Add `<ins class="adsbygoogle">` markup inside the `.ad-slot` elements
   (`adSlot()` in `build.mjs`). The slots reserve 280px so pages do not jump.
5. Update the Privacy page and add a consent banner if you serve EU/UK visitors.

## Later languages

`<html lang dir>` is set in one place (`render()` in `build.mjs`) and the CSS
uses logical properties in most places, so Arabic and Urdu versions can be added
as `/ar/` and `/ur/` page sets with `hreflang` links. Translate properly; do not
publish machine-translated copies unchecked.
