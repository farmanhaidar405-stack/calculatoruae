// All page content for calculatoruae.ae.
// To add a calculator: add the maths to calc.js (with tests), a handler in
// app.js, and a page object here with kind: 'tool'.

const LAW = 'Federal Decree-Law No. 33 of 2021';
const LAW_PDF =
  'https://u.ae/-/media/Mohre-2024/Federal-DecreeLaw-No-33-of-2021-Regarding-the-Regulation-of-Employment-Relationship-and-its-amendmen.pdf';
const LAW_PAGE = 'https://uaelegislation.gov.ae/en/legislations/1541';
const REGS_PAGE = 'https://uaelegislation.gov.ae/en/legislations/1547';
const MOHRE = 'https://www.mohre.gov.ae/';

import { morePages } from './pages-more.mjs';

// ---------- form building blocks ----------
const money = (name, label, value, hint = '') => `<div class="field">
<label for="f-${name}">${label}</label>
${hint ? `<span class="hint" id="h-${name}">${hint}</span>` : ''}
<div class="control"><span class="unit" aria-hidden="true">AED</span>
<input id="f-${name}" name="${name}" type="text" inputmode="decimal" autocomplete="off" maxlength="12" value="${value}"${hint ? ` aria-describedby="h-${name}"` : ''}></div>
</div>`;

const days = (name, label, value, hint = '', max = 999) => `<div class="field">
<label for="f-${name}">${label}</label>
${hint ? `<span class="hint" id="h-${name}">${hint}</span>` : ''}
<div class="control">
<input id="f-${name}" name="${name}" type="text" inputmode="decimal" autocomplete="off" maxlength="6" data-max="${max}" value="${value}"${hint ? ` aria-describedby="h-${name}"` : ''}><span class="unit" aria-hidden="true">days</span></div>
</div>`;

const date = (name, label, value, hint = '', today = false) => `<div class="field">
<label for="f-${name}">${label}</label>
${hint ? `<span class="hint" id="h-${name}">${hint}</span>` : ''}
<div class="control">
<input id="f-${name}" name="${name}" type="date" min="1950-01-01" max="2100-12-31" value="${value}"${today ? ' data-default="today"' : ''}${hint ? ` aria-describedby="h-${name}"` : ''}></div>
</div>`;

const slip = (title, checked) => `<aside class="slip" aria-label="${title}">
<p class="slip-title">${title}</p>
<p class="slip-total" data-out="total" role="status" aria-live="polite">AED 0.00</p>
<dl class="slip-lines" data-out="lines"></dl>
<p class="slip-note" data-out="note"></p>
<div class="slip-actions">
<button type="button" data-action="copy">Copy result</button>
<button type="button" data-action="print">Print or save as PDF</button>
</div>
<p class="slip-foot">Estimate from calculatoruae.ae. Not legal advice. Rules checked ${checked}.</p>
</aside>`;

const toolBlock = (tool, title, fields, checked) => `<div class="tool wrap" data-tool="${tool}">
<form novalidate aria-label="${title} inputs">
${fields}
<p class="form-error" data-out="error" role="alert" hidden></p>
<noscript><p class="noscript">This calculator needs JavaScript. The formula and worked examples below work without it.</p></noscript>
</form>
${slip(title, checked)}
</div>`;

const gratuityFields = `${money('basic', 'Monthly basic salary', '5000', 'Basic only. Leave out housing, transport and other allowances.')}
<div class="pair">
${date('start', 'First day of work', '2021-01-01')}
${date('end', 'Last working day', '2026-11-13', '', true)}
</div>
${days('unpaid', 'Unpaid absence days', '0', 'Unpaid leave or absence. These days do not count as service.', 36500)}
<div class="field">
<label for="f-scheme">Is your employer in the alternative end of service savings scheme?</label>
<span class="hint" id="h-scheme">Some employers pay into an approved savings scheme in place of gratuity.</span>
<div class="control"><select id="f-scheme" name="scheme" aria-describedby="h-scheme">
<option value="no">No</option>
<option value="yes">Yes, or not sure</option>
</select></div></div>`;

const sources = (items) => `<h2>Sources</h2>
<ul class="sources">${items.map((i) => `<li>${i}</li>`).join('')}
<li><a href="${LAW_PDF}" rel="noopener">Official text of ${LAW} and its amendments (PDF, UAE Government portal)</a></li>
<li><a href="${LAW_PAGE}" rel="noopener">${LAW} on the UAE Legislation platform</a></li>
<li><a href="${REGS_PAGE}" rel="noopener">Cabinet Resolution No. 1 of 2022, the implementing regulations, on the UAE Legislation platform</a></li>
<li><a href="${MOHRE}" rel="noopener">Ministry of Human Resources and Emiratisation (MOHRE)</a></li>
</ul>`;

const related = (links) => `<h2>Related calculators and guides</h2>
<ul>${links.map(([href, text]) => `<li><a href="${href}">${text}</a></li>`).join('')}</ul>`;

const pageHead = (h1, answer, checked) => `<div class="wrap page-head">
<h1>${h1}</h1>
<p class="answer">${answer}</p>
<p class="checked">Rules last checked: <time datetime="2026-11-13">${checked}</time></p>
</div>`;

const SECTIONS = ['Work', 'Housing', 'Money', 'Business', 'Visa'];
const tile = (p, withCat) =>
  `<li><a href="${p.path}"${p.lead ? ' class="lead"' : ''}><span class="fig">${p.fig[0]}<small>${p.fig[1]}</small></span><span class="name">${p.short}</span><span class="blurb">${p.blurb}</span>${withCat ? `<span class="cat">${p.section || 'Work'}</span>` : ''}</a></li>`;

// Grouped by section, for the hub pages.
export const toolLedger = (all, tag = 'h3') =>
  SECTIONS.map((name) => {
    const items = all.filter((p) => p.kind === 'tool' && (p.section || 'Work') === name);
    if (!items.length) return '';
    return `<${tag} class="board-title">${name}</${tag}><ul class="board">${items
      .map((p) => tile(p, false))
      .join('\n')}</ul>`;
  }).join('\n');

// One board with a section tag on each tile, for the home page.
export const toolBoard = (all) =>
  `<ul class="board">${SECTIONS.flatMap((name) =>
    all.filter((p) => p.kind === 'tool' && (p.section || 'Work') === name),
  )
    .map((p) => tile(p, true))
    .join('\n')}</ul>`;

// ---------- pages ----------
export const pages = [
  // ===== Home =====
  {
    path: '/',
    kind: 'home',
    tool: true,
    title: 'UAE Calculators: Gratuity, Rent, Mortgage, VAT, Zakat',
    description:
      'Free UAE calculators for gratuity, final settlement, Dubai rent increases, mortgages, car loans, VAT, zakat, overstay fines and e-invoicing penalties.',
    h1: 'UAE calculators that show the rule behind the number',
    body: ({ SITE, pages }) => `<div class="wrap page-head">
<h1>UAE calculators that show the rule behind the number</h1>
<p class="answer">Start with the most used one. Enter your basic salary and dates to see your end of service gratuity, with every step shown. Calculators for rent, loans, VAT, zakat, visas and e-invoicing are listed below.</p>
</div>
${toolBlock('gratuity', 'Gratuity estimate', gratuityFields, SITE.checkedText)}
<div class="wrap home-section">
<h2>All calculators</h2>
${toolBoard(pages)}
<h2>Guides</h2>
<ul class="ledger">
${pages
  .filter((p) => p.kind === 'guide')
  .map((p) => `<li><a href="${p.path}">${p.short}</a><p>${p.blurb}</p></li>`)
  .join('\n')}
</ul>
</div>
<div class="wrap home-note">
<h2>How these calculators work</h2>
<p>Every calculator applies a named UAE law, decree or regulation. Each page names it, shows the formula in words, and gives worked examples you can check by hand.</p>
<p>The sums run in your browser. Nothing you type is sent to us or saved. Read <a href="/about/">how we check the rules</a>.</p>
<p>The results are estimates. Your contract, a free zone's own rules or a court decision can change what you are paid.</p>
</div>`,
  },

  // ===== Gratuity =====
  {
    path: '/gratuity-calculator/',
    kind: 'tool',
    tool: true,
    short: 'Gratuity calculator',
    fig: ['21 / 30', 'days a year'],
    lead: true,
    blurb: '21 days of basic salary a year for five years, then 30 days a year.',
    title: 'UAE Gratuity Calculator: End of Service Pay',
    description:
      'Calculate UAE end of service gratuity: 21 days of basic salary per year for the first five years, 30 days per year after, with a step-by-step breakdown.',
    h1: 'UAE gratuity calculator',
    faq: [
      [
        'How is gratuity calculated in the UAE?',
        'Divide your last monthly basic salary by 30 to get a daily wage. Multiply it by 21 days for each of your first five years of service and by 30 days for each year after that. Part years count in proportion once you have completed one year.',
      ],
      [
        'Is gratuity calculated on basic salary or total salary?',
        'On basic salary only. Article 51 bases gratuity on the last basic wage, so housing, transport and other allowances are left out.',
      ],
      [
        'Do I get gratuity if I resign?',
        'Yes, if you have completed at least one year of continuous service. The current law has no reduction for resigning; the reduced rates in the old 1980 law no longer apply.',
      ],
      [
        'How much gratuity do I get after 5 years in the UAE?',
        'After exactly five years you get 105 days of basic wage, which is 3.5 months of basic salary. On a basic salary of AED 5,000 that is AED 17,500.',
      ],
      [
        'Is there a maximum gratuity?',
        "Yes. Total gratuity cannot exceed two years' wage. The law does not say whether that means basic or total wage. This calculator applies 24 months of basic salary and also shows the figure before the limit.",
      ],
      [
        'When must gratuity be paid?',
        'Employers must pay end of service dues within 14 days of the contract ending, under Article 53 of the labour law.',
      ],
    ],
    body: ({ SITE, adSlot, faqHtml }) => `${pageHead(
      'UAE gratuity calculator',
      `End of service gratuity in the UAE private sector is 21 days of basic salary for each of your first five years of service and 30 days of basic salary for each year after that. You need at least one year of continuous service, and the total cannot exceed two years' wage.`,
      SITE.checkedText,
    )}
${toolBlock('gratuity', 'Gratuity estimate', gratuityFields, SITE.checkedText)}
<div class="wrap">${adSlot('after-result')}</div>
<article class="wrap prose">
<h2>How UAE gratuity is calculated</h2>
<p>The rule comes from Article 51 of ${LAW}. It applies to foreign employees working full time in the private sector.</p>
<p class="formula">Gratuity = (basic salary ÷ 30) × 21 × years up to five, plus (basic salary ÷ 30) × 30 × years after five</p>
<ol>
<li>Take your last monthly basic salary and divide by 30. This is your daily basic wage.</li>
<li>Count your service from your first day to your last working day, both included. Remove any days of unpaid absence.</li>
<li>If the result is under one year, which the law fixes at 365 days, no gratuity is due.</li>
<li>Give 21 days of wage for each of the first five years, and 30 days for each year after.</li>
<li>Count a part year in proportion. Six months in year three earns half of 21 days.</li>
<li>Check the total against the limit of two years' wage.</li>
</ol>
<div class="table-scroll"><table>
<caption>Days of basic wage earned, by length of service</caption>
<thead><tr><th>Service</th><th class="num">Days of basic wage</th><th class="num">In months of basic salary</th></tr></thead>
<tbody>
<tr><td>Under 1 year</td><td class="num">0</td><td class="num">0</td></tr>
<tr><td>1 year</td><td class="num">21</td><td class="num">0.7</td></tr>
<tr><td>3 years</td><td class="num">63</td><td class="num">2.1</td></tr>
<tr><td>5 years</td><td class="num">105</td><td class="num">3.5</td></tr>
<tr><td>7 years</td><td class="num">165</td><td class="num">5.5</td></tr>
<tr><td>10 years</td><td class="num">255</td><td class="num">8.5</td></tr>
</tbody></table></div>

<h2>Worked examples</h2>
<h3>Three years on a basic salary of AED 4,000</h3>
<p>Daily wage: 4,000 ÷ 30 = AED 133.33. Days earned: 3 × 21 = 63. Gratuity: 133.33 × 63 = <strong>AED 8,400</strong>.</p>
<h3>Seven years on a basic salary of AED 10,000</h3>
<p>Daily wage: 10,000 ÷ 30 = AED 333.33. First five years: 5 × 21 = 105 days. Next two years: 2 × 30 = 60 days. Gratuity: 333.33 × 165 = <strong>AED 55,000</strong>.</p>
<h3>Two years and 73 days on a basic salary of AED 6,000</h3>
<p>73 days is one fifth of a year, so service is 2.2 years. Days earned: 2.2 × 21 = 46.2. Daily wage: AED 200. Gratuity: 200 × 46.2 = <strong>AED 9,240</strong>.</p>
<h3>Eleven months of service</h3>
<p>Service is under one year, so gratuity is <strong>AED 0</strong>. Unused leave and unpaid salary are still owed; use the <a href="/final-settlement-calculator/">final settlement calculator</a>.</p>

<h2>How this calculator counts service</h2>
<p>Article 67 of the law says a year is 365 days and a month is 30 days. This calculator counts whole years by the anniversary of your start date, then divides the leftover days by 365. That means 365 counted days are always one full year, including in a leap year. The result shows the number of calendar days it counted so you can check it.</p>
<p>If you are within a day or two of one year, the exact count matters. Confirm your dates with your employer or MOHRE.</p>

<h2>What counts as basic salary?</h2>
<p>Basic salary is the wage written in your employment contract, before allowances. Housing, transport, phone and other allowances are not part of it. Gratuity uses the last basic salary you were paid, not an average over your service. See <a href="/guides/basic-salary-vs-total-salary-uae/">basic salary vs total salary</a>.</p>

<h2>Special cases</h2>
<ul>
<li><strong>Resignation.</strong> The current law does not reduce gratuity because you resigned. Read <a href="/guides/gratuity-on-resignation-uae/">gratuity on resignation</a>.</li>
<li><strong>Unpaid leave.</strong> Days of unpaid absence are removed from your service before the sum is done.</li>
<li><strong>The two-year limit.</strong> Article 51(6) caps gratuity at two years' wage. It does not say basic wage, and the law's definition of "wage" includes allowances, so the limit may be two years of total wage. This calculator applies 24 months of basic salary, the lower reading, and shows the figure before the limit as well. It only matters after about 25 years of service. If it affects you, get legal advice.</li>
<li><strong>UAE nationals.</strong> Emirati employees are covered by the pension and social security system instead of gratuity.</li>
<li><strong>DIFC and ADGM.</strong> These two financial free zones have their own employment rules, so this calculator does not apply there. Other free zones generally follow the federal labour law.</li>
<li><strong>Savings scheme.</strong> Article 51(8) lets the Cabinet approve alternative end of service schemes. If your employer has enrolled you in one, this calculator does not apply to the enrolled period. Answer the last question in the form and the result will say so.</li>
<li><strong>Domestic workers.</strong> They are covered by a separate law, ${'Federal Decree-Law No. 9 of 2022'}, and this calculator does not apply to them.</li>
<li><strong>Part-time and other work patterns.</strong> The implementing regulations set separate proportional rules. This calculator covers full-time work only.</li>
</ul>

<h2>Common mistakes</h2>
<ul>
<li>Using total salary. Gratuity is based on basic salary only.</li>
<li>Using 30 days for every year once you pass five years. The first five years stay at 21 days each.</li>
<li>Ignoring part years. After the first year, extra months and days count in proportion.</li>
<li>Applying the old one-third and two-thirds resignation reductions. They belonged to the repealed 1980 law.</li>
</ul>
${adSlot('mid-content')}
${faqHtml(pages[1].faq)}
${sources([
  `${LAW} on the Regulation of Employment Relationships, Article 51 (gratuity) and Article 53 (payment within 14 days).`,
  'Cabinet Resolution No. 1 of 2022, the implementing regulations of the labour law.',
])}
${related([
  ['/final-settlement-calculator/', 'Final settlement calculator'],
  ['/leave-salary-calculator/', 'Leave salary calculator'],
  ['/notice-pay-calculator/', 'Notice pay calculator'],
  ['/guides/how-gratuity-is-calculated-uae/', 'How gratuity is calculated in the UAE'],
])}
${adSlot('end')}
</article>`,
  },

  // ===== Leave salary =====
  {
    path: '/leave-salary-calculator/',
    kind: 'tool',
    tool: true,
    short: 'Leave salary calculator',
    fig: ['30', 'days a year'],
    blurb: 'Cash value of unused annual leave when you leave, paid on basic salary.',
    title: 'UAE Leave Salary Calculator: Unused Annual Leave Pay',
    description:
      'Calculate the pay for unused annual leave when a UAE job ends: basic salary ÷ 30 × unused leave days, with the legal source and worked examples.',
    h1: 'UAE leave salary calculator',
    faq: [
      [
        'How is unused leave paid when I leave a job in the UAE?',
        'Unused annual leave is paid in cash on your basic salary. Divide your monthly basic salary by 30 and multiply by the number of unused leave days.',
      ],
      [
        'Is leave encashment based on basic or total salary?',
        'When your service ends, unused leave is paid on basic salary. Leave you actually take during employment is paid at your full wage, including allowances.',
      ],
      [
        'How many days of annual leave do I get in the UAE?',
        'Thirty days for each year of service. If you have worked more than six months but less than a year, you earn two days for each month.',
      ],
      [
        'Do I get paid for leave earned in my last, unfinished year?',
        'Yes. Leave for part of a year is paid in proportion to the time worked. For someone past their first year, that is 2.5 days for each month.',
      ],
      [
        'Can my employer refuse to pay unused leave?',
        'No. The law entitles you to payment for leave you did not use before your service ended, however many days that is.',
      ],
    ],
    body: ({ SITE, adSlot, faqHtml }) => `${pageHead(
      'UAE leave salary calculator',
      'When a UAE private sector job ends, your unused annual leave is paid in cash on your basic salary. The sum is your monthly basic salary divided by 30, multiplied by your unused leave days. Annual leave is 30 days a year after one year of service.',
      SITE.checkedText,
    )}
${toolBlock(
  'leave',
  'Leave pay estimate',
  `${money('basic', 'Monthly basic salary', '5000', 'Basic only, without allowances.')}
${days('days', 'Unused leave days', '10', 'Days you have earned and not taken.', 1000)}
<details class="estimator" data-estimator>
<summary>Not sure how many days you have earned?</summary>
<div class="pair">
<div class="field"><label for="f-serviceMonths">Total months with this employer</label>
<div class="control"><input id="f-serviceMonths" name="serviceMonths" type="text" inputmode="decimal" maxlength="5" value="30"><span class="unit" aria-hidden="true">months</span></div></div>
<div class="field"><label for="f-monthsThisYear">Months worked in the current leave year</label>
<span class="hint" id="h-monthsThisYear">Only used once you have a year or more of service.</span>
<div class="control"><input id="f-monthsThisYear" name="monthsThisYear" type="text" inputmode="decimal" maxlength="5" value="6" aria-describedby="h-monthsThisYear"><span class="unit" aria-hidden="true">months</span></div></div>
</div>
<p data-out="estimate" role="status"></p>
<button type="button" data-action="use-estimate">Use this number</button>
</details>`,
  SITE.checkedText,
)}
<div class="wrap">${adSlot('after-result')}</div>
<article class="wrap prose">
<h2>How leave salary is calculated</h2>
<p>Article 29 of ${LAW} gives employees paid annual leave and says that leave not used before the job ends must be paid. The implementing regulations (Cabinet Resolution No. 1 of 2022, Article 19) say this payment is worked out on the basic salary.</p>
<p class="formula">Leave pay = (basic salary ÷ 30) × unused leave days</p>
<div class="table-scroll"><table>
<caption>Annual leave earned under Article 29</caption>
<thead><tr><th>Time with the employer</th><th>Leave earned</th></tr></thead>
<tbody>
<tr><td>Six months or less</td><td>No figure set by the law; check your contract</td></tr>
<tr><td>More than six months, less than one year</td><td>2 days for each month</td></tr>
<tr><td>One year or more</td><td>30 days a year, which is 2.5 days a month</td></tr>
</tbody></table></div>

<h2>Worked examples</h2>
<h3>Twelve unused days on a basic salary of AED 6,000</h3>
<p>Daily wage: 6,000 ÷ 30 = AED 200. Leave pay: 200 × 12 = <strong>AED 2,400</strong>.</p>
<h3>Leaving nine months into the leave year</h3>
<p>You have worked more than a year in total and taken no leave this year. Leave earned: 9 × 2.5 = 22.5 days. On a basic salary of AED 4,500 the daily wage is AED 150, so leave pay is 150 × 22.5 = <strong>AED 3,375</strong>.</p>
<h3>Eight months of service in total</h3>
<p>Between six months and a year you earn 2 days a month: 8 × 2 = 16 days. On a basic salary of AED 3,000 that is 100 × 16 = <strong>AED 1,600</strong>, less any days already taken.</p>

<h2>Leave you take is paid differently from leave you cash in</h2>
<p>These two are often mixed up. When you go on annual leave during your employment, you are paid your full wage, which includes allowances. When your service ends and leftover days are paid in cash, the law uses basic salary only. A contract can be more generous than the law, so check yours.</p>

<h2>Carried-over leave</h2>
<p>The law says an employer cannot stop you using earned leave for more than two years. Many companies limit how many days roll over into the next year. If your payslip or HR system shows a leave balance, use that number here and compare the result with your settlement.</p>

<h2>Common mistakes</h2>
<ul>
<li>Using total salary for leave paid at the end of service. The legal minimum uses basic salary.</li>
<li>Forgetting the last, unfinished year. Leave for part of a year is still owed.</li>
<li>Assuming public holidays are added back. Under Article 29(7), a public holiday that falls inside your annual leave counts as part of that leave, unless your contract or company policy is more generous.</li>
<li>Treating sick leave as annual leave. Sick leave is a separate entitlement with its own rules.</li>
</ul>
${adSlot('mid-content')}
${faqHtml(pages[2].faq)}
${sources([
  `${LAW}, Article 29 (annual leave).`,
  'Cabinet Resolution No. 1 of 2022, Article 19 (payment for unused leave on basic salary).',
])}
${related([
  ['/final-settlement-calculator/', 'Final settlement calculator'],
  ['/gratuity-calculator/', 'Gratuity calculator'],
  ['/guides/basic-salary-vs-total-salary-uae/', 'Basic salary vs total salary in the UAE'],
])}
${adSlot('end')}
</article>`,
  },

  // ===== Notice pay =====
  {
    path: '/notice-pay-calculator/',
    kind: 'tool',
    tool: true,
    short: 'Notice pay calculator',
    fig: ['30–90', 'days'],
    blurb: 'What is owed when a 30 to 90 day notice period is cut short.',
    title: 'UAE Notice Pay Calculator: Notice Period Salary',
    description:
      'Calculate UAE notice period pay: total monthly salary ÷ 30 × the notice days not served. Covers pay owed to you or by you under Article 43.',
    h1: 'UAE notice pay calculator',
    faq: [
      [
        'How is notice period pay calculated in the UAE?',
        'Divide your last total monthly salary by 30 and multiply by the number of notice days that were not served. Total salary here means basic salary plus allowances.',
      ],
      [
        'How long is the notice period in the UAE?',
        'Between 30 and 90 days after probation, as written in your employment contract. Different rules apply during probation.',
      ],
      [
        'Do I have to pay my employer if I leave without serving notice?',
        'Yes. The side that does not serve the notice period pays the other side the wage for the unserved days, even if no harm was caused.',
      ],
      [
        'Is notice pay based on basic salary or total salary?',
        'On the last wage you received, which is your total salary including allowances. This is different from gratuity and unused leave, which use basic salary.',
      ],
      [
        'Can the notice period be waived?',
        'Yes, by agreement. Article 43(2) lets both sides shorten or skip the notice period, but the worker keeps the rights attached to the notice period in the contract. What is paid depends on the agreement, so get it in writing.',
      ],
    ],
    body: ({ SITE, adSlot, faqHtml }) => `${pageHead(
      'UAE notice pay calculator',
      'If a notice period is cut short in the UAE, the side that ended it early pays the other side the wage for the unserved days. The sum is your last total monthly salary divided by 30, multiplied by the notice days not served. Notice periods run from 30 to 90 days.',
      SITE.checkedText,
    )}
${toolBlock(
  'notice',
  'Notice pay estimate',
  `${money('wage', 'Total monthly salary', '8000', 'Basic salary plus all regular allowances.')}
<div class="pair">
${days('notice', 'Notice period in your contract', '30', 'From 30 to 90 days after probation.', 90)}
${days('served', 'Notice days served', '0', 'Days worked after notice was given.', 90)}
</div>`,
  SITE.checkedText,
)}
<div class="wrap">${adSlot('after-result')}</div>
<article class="wrap prose">
<h2>How notice pay is calculated</h2>
<p>Article 43 of ${LAW} lets either side end an employment contract for a legitimate reason by giving written notice. The contract continues during the notice period and you are paid your full wage for it.</p>
<p>If either side does not serve all of the notice, that side pays a notice period allowance to the other. It equals the wage for the whole notice period or the part not served, based on the last wage received.</p>
<p class="formula">Notice pay = (total monthly salary ÷ 30) × notice days not served</p>

<h2>Notice salary and notice allowance are different</h2>
<p>During a notice period you work and are paid your normal full wage. The notice allowance in this calculator is something else: compensation owed by the side that did not serve the notice. A worker who is released early by agreement keeps the rights for the contract notice period under Article 43(2).</p>

<h2>Who pays whom</h2>
<div class="table-scroll"><table>
<thead><tr><th>What happened</th><th>Who pays</th></tr></thead>
<tbody>
<tr><td>Employer ends the contract and asks you to leave at once</td><td>Employer pays you</td></tr>
<tr><td>You resign and leave before the notice period ends</td><td>You pay the employer</td></tr>
<tr><td>Both sides agree to shorten or skip the notice</td><td>Depends on the agreement; the worker's rights for the contract notice period are kept</td></tr>
<tr><td>You work the full notice period</td><td>No allowance is due; you receive your normal salary</td></tr>
</tbody></table></div>

<h2>Worked examples</h2>
<h3>Dismissed with no notice on a total salary of AED 18,000</h3>
<p>Contract notice: 30 days, none served. Daily wage: 18,000 ÷ 30 = AED 600. Notice pay owed to you: 600 × 30 = <strong>AED 18,000</strong>.</p>
<h3>Resigning and leaving after 10 days</h3>
<p>Same salary and contract, 10 days served. Unserved days: 20. You owe the employer 600 × 20 = <strong>AED 12,000</strong>, usually taken from your final settlement.</p>
<h3>A 60-day notice period with 45 days served</h3>
<p>Total salary AED 9,000, so the daily wage is AED 300. Unserved days: 15. Notice pay: 300 × 15 = <strong>AED 4,500</strong>.</p>

<h2>Special cases</h2>
<ul>
<li><strong>Probation.</strong> Notice during probation follows Article 9 of the law, with its own shorter periods. This calculator is for contracts after probation.</li>
<li><strong>Dismissal without notice.</strong> Article 44 lists serious cases, such as proven misconduct, where an employer can dismiss without notice. No notice pay is due then.</li>
<li><strong>Leaving without notice.</strong> Article 45 lists cases where an employee can leave without notice, such as an employer breaching the contract.</li>
<li><strong>Job search day.</strong> If the employer ended the contract, you may take one unpaid day off each week of the notice period to look for work.</li>
</ul>

<h2>Common mistakes</h2>
<ul>
<li>Using basic salary. Notice pay uses your last total wage.</li>
<li>Assuming notice pay is only owed to employees. It runs in both directions.</li>
<li>Relying on a verbal agreement to leave early. Without written agreement the unserved days can be charged.</li>
<li>Assuming an agreed early release wipes out notice pay. The law keeps the worker's rights for the notice period in the contract.</li>
</ul>
${adSlot('mid-content')}
${faqHtml(pages[3].faq)}
${sources([`${LAW}, Article 43 (notice), Article 44 and Article 45 (ending a contract without notice), Article 9 (probation).`])}
${related([
  ['/final-settlement-calculator/', 'Final settlement calculator'],
  ['/gratuity-calculator/', 'Gratuity calculator'],
  ['/guides/final-settlement-uae-what-is-included/', 'What a UAE final settlement includes'],
])}
${adSlot('end')}
</article>`,
  },

  // ===== Final settlement =====
  {
    path: '/final-settlement-calculator/',
    kind: 'tool',
    tool: true,
    short: 'Final settlement calculator',
    fig: ['14', 'days to pay'],
    blurb: 'Gratuity, unused leave, unpaid salary and notice pay in one total.',
    title: 'UAE Final Settlement Calculator: Total End of Service Dues',
    description:
      'Add up your full UAE final settlement: gratuity, unused leave, unpaid salary and notice pay, less deductions. Print the breakdown or save it as a PDF.',
    h1: 'UAE final settlement calculator',
    faq: [
      [
        'What is included in a final settlement in the UAE?',
        'End of service gratuity, pay for unused annual leave, salary for days worked and not yet paid, any notice pay, and other amounts in your contract such as a repatriation ticket. Lawful deductions are then taken off.',
      ],
      [
        'How long does an employer have to pay the final settlement?',
        'Fourteen days from the date the contract ends, under Article 53 of the labour law.',
      ],
      [
        'Can I print or save my settlement calculation?',
        'Yes. Use the print button under the result and choose Save as PDF in your browser. Only the breakdown is printed.',
      ],
      [
        'What can an employer deduct from my final settlement?',
        'Only amounts owed under the law or a court judgment, such as notice pay for unserved days or the balance of a salary advance. The implementing regulations limit what can be deducted, and this calculator cannot check a deduction for you.',
      ],
      [
        'What should I do if my settlement is not paid?',
        'You can file a labour complaint with the Ministry of Human Resources and Emiratisation (MOHRE). Keep your contract, payslips and any written settlement figure.',
      ],
    ],
    body: ({ SITE, adSlot, faqHtml }) => `${pageHead(
      'UAE final settlement calculator',
      'A UAE final settlement is everything your employer owes you when the job ends: gratuity, pay for unused leave, unpaid salary and any notice pay, less lawful deductions. Employers must pay it within 14 days of the contract ending.',
      SITE.checkedText,
    )}
${toolBlock(
  'settlement',
  'Final settlement estimate',
  `<div class="pair">
${money('basic', 'Monthly basic salary', '5000', 'Used for gratuity and leave.')}
${money('allowances', 'Monthly allowances', '3000', 'Housing, transport and others.')}
</div>
<div class="pair">
${date('start', 'First day of work', '2021-01-01')}
${date('end', 'Last working day', '2026-11-13', '', true)}
</div>
<div class="pair">
${days('unpaid', 'Unpaid absence days', '0', 'Removed from service.', 36500)}
${days('leaveDays', 'Unused leave days', '10', 'Earned and not taken.', 1000)}
</div>
<div class="pair">
${days('salaryMonths', 'Full months of unpaid salary', '0', 'Whole months not yet paid.', 24).replace('>days<', '>months<')}
${days('salaryDays', 'Extra unpaid days', '13', 'Part of a month, 0 to 30.', 30)}
</div>
<div class="pair">
<div class="field"><label for="f-noticeDirection">Notice period</label>
<span class="hint" id="h-noticeDirection">Was notice cut short?</span>
<div class="control"><select id="f-noticeDirection" name="noticeDirection" aria-describedby="h-noticeDirection">
<option value="none">Served in full or waived</option>
<option value="employerOwes">Employer cut it short</option>
<option value="employeeOwes">I left early</option>
</select></div></div>
${days('noticeDays', 'Notice days not served', '0', 'Only if notice was cut short.', 90)}
</div>
<div class="pair">
${money('additions', 'Other amounts owed to you', '0', 'Ticket, bonus, expenses.')}
${money('deductions', 'Deductions', '0', 'As claimed by the employer. Not checked for lawfulness.')}
</div>
<div class="field">
<label for="f-scheme">Is your employer in the alternative end of service savings scheme?</label>
<span class="hint" id="h-scheme">Some employers pay into an approved savings scheme in place of gratuity.</span>
<div class="control"><select id="f-scheme" name="scheme" aria-describedby="h-scheme">
<option value="no">No</option>
<option value="yes">Yes, or not sure</option>
</select></div></div>`,
  SITE.checkedText,
)}
<div class="wrap">${adSlot('after-result')}</div>
<article class="wrap prose">
<h2>What the settlement adds up</h2>
<div class="table-scroll"><table>
<thead><tr><th>Line</th><th>Formula</th><th>Salary used</th></tr></thead>
<tbody>
<tr><td><a href="/gratuity-calculator/">Gratuity</a></td><td>21 days a year for five years, then 30 days a year</td><td>Basic</td></tr>
<tr><td><a href="/leave-salary-calculator/">Unused leave</a></td><td>Basic ÷ 30 × unused days</td><td>Basic</td></tr>
<tr><td>Unpaid salary</td><td>Full months at the monthly wage, plus total salary ÷ 30 × extra days</td><td>Total</td></tr>
<tr><td><a href="/notice-pay-calculator/">Notice pay</a></td><td>Total salary ÷ 30 × unserved days</td><td>Total</td></tr>
<tr><td>Other amounts</td><td>As set in your contract</td><td>n/a</td></tr>
<tr><td>Deductions</td><td>The amount you enter; the tool cannot check it is lawful</td><td>n/a</td></tr>
</tbody></table></div>
<p>The two salary bases are the most common source of disputes. Gratuity and unused leave use basic salary. Unpaid salary and notice pay use your total wage.</p>

<h2>Worked example</h2>
<p>Basic salary AED 6,000 and allowances AED 3,000. Three full years of service. Ten unused leave days, 15 days of unpaid salary, and the employer ended the contract without the 30 days of notice. There is AED 500 in expenses to be repaid and a salary advance of AED 1,000 to deduct.</p>
<ul>
<li>Gratuity: 6,000 ÷ 30 × 63 days = AED 12,600</li>
<li>Unused leave: 6,000 ÷ 30 × 10 = AED 2,000</li>
<li>Unpaid salary: 9,000 ÷ 30 × 15 = AED 4,500</li>
<li>Notice pay: 9,000 ÷ 30 × 30 = AED 9,000</li>
<li>Expenses: AED 500</li>
<li>Advance deducted: AED 1,000</li>
</ul>
<p>Total: <strong>AED 27,600</strong>.</p>

<h2>When it must be paid</h2>
<p>Article 53 of ${LAW} requires the employer to pay wages and all end of service entitlements within 14 days of the contract ending. If that does not happen, you can file a complaint with MOHRE.</p>

<h2>Before you sign a settlement</h2>
<ul>
<li>Check that gratuity uses your current basic salary and your full service dates.</li>
<li>Check the leave balance against your own records.</li>
<li>Ask for each deduction to be listed and explained.</li>
<li>Sign only after you have checked the payment has actually arrived, and keep a copy and proof of payment.</li>
</ul>
<p>A signature is evidence that you received the amounts listed. It does not by itself give up rights the law guarantees: under Article 65(3), a waiver or settlement of a worker's rights is void where it goes against the law. For a dispute, contact MOHRE or a lawyer.</p>

<h2>Deductions</h2>
<p>Article 51(7) lets an employer deduct from end of service benefits only amounts owed under the law or a court judgment, as set out in the implementing regulations. Common examples are a salary advance or loan balance and notice pay for unserved days. This calculator subtracts whatever you enter and cannot tell whether a deduction is allowed. If the total comes out negative, that does not by itself mean you owe your employer money.</p>

<h2>What this calculator leaves out</h2>
<p>It does not include compensation for unlawful dismissal, overtime claims, commission disputes or the value of a repatriation ticket unless you enter it under other amounts. DIFC and ADGM employees, domestic workers and UAE nationals are covered by different rules.</p>
${adSlot('mid-content')}
${faqHtml(pages[4].faq)}
${sources([
  `${LAW}, Article 29 (leave), Article 43 (notice), Article 51 (gratuity) and Article 53 (payment within 14 days).`,
  'Cabinet Resolution No. 1 of 2022, the implementing regulations.',
])}
${related([
  ['/gratuity-calculator/', 'Gratuity calculator'],
  ['/leave-salary-calculator/', 'Leave salary calculator'],
  ['/notice-pay-calculator/', 'Notice pay calculator'],
  ['/guides/final-settlement-uae-what-is-included/', 'What a UAE final settlement includes'],
])}
${adSlot('end')}
</article>`,
  },

  // ===== Calculators hub =====
  {
    path: '/calculators/',
    kind: 'hub',
    short: 'All calculators',
    title: 'All UAE Calculators by Topic',
    description:
      'Every Calculator UAE tool in one list: work and end of service, housing, money, business and visa calculators, each with its rule and source.',
    h1: 'All UAE calculators',
    body: ({ pages }) => `<div class="wrap page-head">
<h1>All UAE calculators</h1>
<p class="answer">Each calculator applies one UAE rule, shows the working, and links to its source.</p>
</div>
<div class="wrap home-section">${toolLedger(pages, 'h2')}</div>`,
  },

  // ===== Guides hub =====
  {
    path: '/guides/',
    kind: 'hub',
    short: 'Guides',
    title: 'UAE End of Service Guides',
    description:
      'Plain-language guides to UAE end of service rules: how gratuity is calculated, basic vs total salary, resignation, and what a final settlement includes.',
    h1: 'UAE end of service guides',
    body: ({ pages }) => `<div class="wrap page-head">
<h1>UAE end of service guides</h1>
<p class="answer">Short explanations of the rules behind each calculator, with the article of the law they come from.</p>
</div>
<div class="wrap home-section">
<ul class="ledger">
${pages
  .filter((p) => p.kind === 'guide')
  .map((p) => `<li><a href="${p.path}">${p.short}</a><p>${p.blurb}</p></li>`)
  .join('\n')}
</ul>
<h2>Calculators</h2>
${toolLedger(pages)}
</div>`,
  },

  // ===== Guide 1 =====
  {
    path: '/guides/how-gratuity-is-calculated-uae/',
    kind: 'guide',
    short: 'How gratuity is calculated in the UAE',
    blurb: 'The formula step by step, with a table for 1 to 20 years of service.',
    title: 'How Gratuity Is Calculated in the UAE: Formula and Table',
    description:
      'UAE gratuity step by step: daily basic wage × 21 days per year for five years, then 30 days per year, with a table from 1 to 20 years of service.',
    h1: 'How gratuity is calculated in the UAE',
    faq: [
      [
        'What is the gratuity formula in the UAE?',
        'Basic salary divided by 30, multiplied by 21 days for each of the first five years and 30 days for each later year. Part years count in proportion after the first full year.',
      ],
      [
        'How much gratuity do I get after 10 years?',
        'Ten years earns 255 days of basic wage, which is 8.5 months of basic salary. On AED 5,000 basic that is AED 42,500.',
      ],
    ],
    body: ({ SITE, faqHtml }) => `${pageHead(
      'How gratuity is calculated in the UAE',
      'UAE gratuity is your daily basic wage multiplied by 21 days for each of your first five years of service, plus 30 days for each year after that. Your daily basic wage is your last monthly basic salary divided by 30. You must complete one year before anything is due.',
      SITE.checkedText,
    )}
<article class="wrap prose">
<h2>The four numbers you need</h2>
<ol>
<li><strong>Last monthly basic salary.</strong> From your contract or latest payslip, without allowances.</li>
<li><strong>Start date.</strong> Your first day of work with this employer.</li>
<li><strong>Last working day.</strong> The final day of your contract or notice period.</li>
<li><strong>Unpaid absence days.</strong> Any unpaid leave across your whole service.</li>
</ol>
<p>Put them into the <a href="/gratuity-calculator/">gratuity calculator</a>, or follow the steps below by hand.</p>

<h2>Step by step</h2>
<h3>1. Find your daily basic wage</h3>
<p>Divide the monthly basic salary by 30. The labour law treats every month as 30 days. A basic salary of AED 5,000 gives AED 166.67 a day.</p>
<h3>2. Count your service in years</h3>
<p>Count full years from your start date, then turn the leftover days into a fraction of a year. Subtract unpaid absence days. Three years and 146 days is 3.4 years.</p>
<h3>3. Apply 21 days, then 30 days</h3>
<p>Each of the first five years earns 21 days of wage. Each year after the fifth earns 30 days. The higher rate applies only to the later years; it does not go back and raise the first five.</p>
<h3>4. Check the limit</h3>
<p>The total cannot be more than two years' wage. Most people never reach it: it takes about 25 years of service.</p>

<h2>Gratuity table for a basic salary of AED 5,000</h2>
<div class="table-scroll"><table>
<thead><tr><th>Years of service</th><th class="num">Days of wage</th><th class="num">Gratuity</th></tr></thead>
<tbody>
<tr><td>1</td><td class="num">21</td><td class="num">AED 3,500</td></tr>
<tr><td>2</td><td class="num">42</td><td class="num">AED 7,000</td></tr>
<tr><td>3</td><td class="num">63</td><td class="num">AED 10,500</td></tr>
<tr><td>4</td><td class="num">84</td><td class="num">AED 14,000</td></tr>
<tr><td>5</td><td class="num">105</td><td class="num">AED 17,500</td></tr>
<tr><td>6</td><td class="num">135</td><td class="num">AED 22,500</td></tr>
<tr><td>8</td><td class="num">195</td><td class="num">AED 32,500</td></tr>
<tr><td>10</td><td class="num">255</td><td class="num">AED 42,500</td></tr>
<tr><td>15</td><td class="num">405</td><td class="num">AED 67,500</td></tr>
<tr><td>20</td><td class="num">555</td><td class="num">AED 92,500</td></tr>
</tbody></table></div>
<p>For a different salary, scale the figure. A basic salary of AED 10,000 doubles every amount in the table.</p>

<h2>Why your employer's figure may differ</h2>
<ul>
<li>They used a different basic salary, for example before your last raise. The law uses the last basic wage.</li>
<li>They removed unpaid leave days you did not expect.</li>
<li>Your contract gives more than the legal minimum.</li>
<li>You work in DIFC or ADGM, which have their own rules.</li>
</ul>
${faqHtml(pages[7].faq)}
${sources([`${LAW}, Article 51.`])}
${related([
  ['/gratuity-calculator/', 'Gratuity calculator'],
  ['/guides/gratuity-on-resignation-uae/', 'Gratuity on resignation'],
  ['/guides/basic-salary-vs-total-salary-uae/', 'Basic salary vs total salary'],
])}
</article>`,
  },

  // ===== Guide 2 =====
  {
    path: '/guides/basic-salary-vs-total-salary-uae/',
    kind: 'guide',
    short: 'Basic salary vs total salary in the UAE',
    blurb: 'Which salary figure each end of service payment uses, and why it matters.',
    title: 'Basic Salary vs Total Salary in the UAE: What Counts',
    description:
      'Basic salary is the contract wage before allowances; total salary adds housing, transport and other allowances. See which one each UAE payment uses.',
    h1: 'Basic salary vs total salary in the UAE',
    faq: [
      [
        'What is basic salary in the UAE?',
        'The wage stated in your employment contract for your work, before any allowances are added.',
      ],
      [
        'Does a higher basic salary increase gratuity?',
        'Yes. Gratuity and unused leave pay are based on basic salary, so two people with the same total pay can receive different gratuity.',
      ],
    ],
    body: ({ SITE, faqHtml }) => `${pageHead(
      'Basic salary vs total salary in the UAE',
      'Basic salary is the wage written in your employment contract before allowances. Total salary is basic salary plus allowances such as housing and transport. Gratuity and unused leave are paid on basic salary; notice pay and normal monthly wages use total salary.',
      SITE.checkedText,
    )}
<article class="wrap prose">
<h2>The two definitions</h2>
<p>The UAE labour law defines both terms in Article 1. The <strong>basic wage</strong> is what the contract sets as pay for the work itself. The <strong>wage</strong>, often called total or gross salary, is the basic wage plus cash and in-kind allowances such as housing, transport and cost of living.</p>

<h2>Which payment uses which</h2>
<div class="table-scroll"><table>
<thead><tr><th>Payment</th><th>Salary used</th><th>Source</th></tr></thead>
<tbody>
<tr><td>End of service gratuity</td><td>Basic</td><td>Article 51</td></tr>
<tr><td>Unused leave paid when service ends</td><td>Basic</td><td>Cabinet Resolution 1 of 2022, Article 19</td></tr>
<tr><td>Annual leave you actually take</td><td>Total</td><td>Article 29</td></tr>
<tr><td>Notice pay</td><td>Total</td><td>Article 43</td></tr>
<tr><td>Salary for days worked</td><td>Total</td><td>Your contract</td></tr>
</tbody></table></div>

<h2>Why the split matters</h2>
<p>Take two employees who both earn AED 10,000 a month and both leave after five years.</p>
<ul>
<li>Employee A has a basic salary of AED 7,000. Gratuity: 7,000 ÷ 30 × 105 = <strong>AED 24,500</strong>.</li>
<li>Employee B has a basic salary of AED 4,000. Gratuity: 4,000 ÷ 30 × 105 = <strong>AED 14,000</strong>.</li>
</ul>
<p>Same monthly pay, a difference of AED 10,500 at the end. When you compare job offers, look at the basic figure as well as the total.</p>

<h2>Where to find your basic salary</h2>
<ul>
<li>Your MOHRE employment contract, which lists basic salary and each allowance on separate lines.</li>
<li>Your payslip.</li>
<li>Your offer letter, if the contract matches it.</li>
</ul>
<p>If your contract shows one all-inclusive figure with no split, ask your employer in writing which part is basic.</p>
${faqHtml(pages[8].faq)}
${sources([`${LAW}, Article 1 (definitions), Article 29, Article 43 and Article 51.`, 'Cabinet Resolution No. 1 of 2022, Article 19.'])}
${related([
  ['/gratuity-calculator/', 'Gratuity calculator'],
  ['/leave-salary-calculator/', 'Leave salary calculator'],
  ['/notice-pay-calculator/', 'Notice pay calculator'],
])}
</article>`,
  },

  // ===== Guide 3 =====
  {
    path: '/guides/gratuity-on-resignation-uae/',
    kind: 'guide',
    short: 'Gratuity on resignation in the UAE',
    blurb: 'Resigning no longer reduces gratuity. What still affects the amount.',
    title: 'Gratuity on Resignation in the UAE: Do You Still Get It?',
    description:
      'Yes. Under the current UAE labour law, employees who resign after one year of service get full gratuity. The old resignation reductions were removed.',
    h1: 'Gratuity on resignation in the UAE',
    faq: [
      [
        'Do I get full gratuity if I resign in the UAE?',
        'Yes, provided you have completed at least one year of continuous service. The amount is the same as if the employer had ended the contract.',
      ],
      [
        'Do I get gratuity if I resign before one year?',
        'No. Gratuity starts after one full year of continuous service. You are still owed unpaid salary and any unused leave.',
      ],
    ],
    body: ({ SITE, faqHtml }) => `${pageHead(
      'Gratuity on resignation in the UAE',
      'If you resign from a private sector job in the UAE after at least one year of continuous service, you receive full gratuity. The current labour law, in force since 2 February 2022, does not reduce gratuity for resigning.',
      SITE.checkedText,
    )}
<article class="wrap prose">
<h2>What changed</h2>
<p>The old labour law of 1980 paid a reduced gratuity to employees on unlimited contracts who resigned: one third for one to three years of service, two thirds for three to five years, and the full amount only after five years. Many websites and older calculators still show these reductions.</p>
<p>${LAW} replaced that law. Article 51 sets one formula, 21 days of basic wage a year for the first five years and 30 days a year after, with no separate table for resignation.</p>

<h2>What you get when you resign</h2>
<div class="table-scroll"><table>
<thead><tr><th>Service when you leave</th><th>Gratuity</th></tr></thead>
<tbody>
<tr><td>Under 1 year</td><td>None</td></tr>
<tr><td>1 to 5 years</td><td>21 days of basic wage for each year, in full</td></tr>
<tr><td>More than 5 years</td><td>105 days, plus 30 days for each year after the fifth</td></tr>
</tbody></table></div>
<p>Work out your own figure with the <a href="/gratuity-calculator/">gratuity calculator</a>.</p>

<h2>What can still reduce your settlement</h2>
<ul>
<li><strong>Leaving before your notice period ends.</strong> You owe the employer pay for the unserved days. See the <a href="/notice-pay-calculator/">notice pay calculator</a>.</li>
<li><strong>Unpaid leave.</strong> Those days are removed from your service.</li>
<li><strong>Amounts you owe.</strong> A salary advance or loan balance can be deducted.</li>
</ul>

<h2>Dismissal for misconduct</h2>
<p>Article 44 lists serious cases in which an employer can dismiss without notice. Article 51 itself does not set a different gratuity for these cases. If you were dismissed this way and gratuity is being withheld, ask MOHRE or a lawyer before accepting the figure.</p>
${faqHtml(pages[9].faq)}
${sources([`${LAW}, Article 44 and Article 51.`, 'Federal Law No. 8 of 1980 (repealed), for the earlier resignation reductions.'])}
${related([
  ['/gratuity-calculator/', 'Gratuity calculator'],
  ['/final-settlement-calculator/', 'Final settlement calculator'],
  ['/guides/how-gratuity-is-calculated-uae/', 'How gratuity is calculated in the UAE'],
])}
</article>`,
  },

  // ===== Guide 4 =====
  {
    path: '/guides/final-settlement-uae-what-is-included/',
    kind: 'guide',
    short: 'What a UAE final settlement includes',
    blurb: 'Every line of a final settlement and the 14-day payment deadline.',
    title: 'UAE Final Settlement: What Is Included and When It Is Paid',
    description:
      'A UAE final settlement covers gratuity, unused leave, unpaid salary and notice pay, less deductions, and must be paid within 14 days of the contract ending.',
    h1: 'What a UAE final settlement includes',
    faq: [
      [
        'How many days does a company have to pay final settlement in the UAE?',
        'Fourteen days from the end of the contract, under Article 53 of the labour law.',
      ],
      [
        'Is the air ticket part of the final settlement?',
        'A repatriation ticket depends on your contract and circumstances. If you are owed one in cash, add it under other amounts in the calculator.',
      ],
    ],
    body: ({ SITE, faqHtml }) => `${pageHead(
      'What a UAE final settlement includes',
      'A final settlement in the UAE is the total your employer owes you when your job ends. It includes end of service gratuity, pay for unused annual leave, salary for days worked, and notice pay where it applies, less any lawful deductions. It must be paid within 14 days.',
      SITE.checkedText,
    )}
<article class="wrap prose">
<h2>The lines on a settlement</h2>
<h3>Gratuity</h3>
<p>Owed after one full year of service: 21 days of basic wage a year for five years, then 30 days a year. <a href="/gratuity-calculator/">Calculate gratuity</a>.</p>
<h3>Unused annual leave</h3>
<p>Leave you earned and did not take is paid on basic salary, including leave for the last unfinished year. <a href="/leave-salary-calculator/">Calculate leave pay</a>.</p>
<h3>Unpaid salary</h3>
<p>Salary for the days you worked since your last payslip, at your total wage, plus any agreed overtime or commission.</p>
<h3>Notice pay</h3>
<p>Added if the employer cut the notice period short; deducted if you did. <a href="/notice-pay-calculator/">Calculate notice pay</a>.</p>
<h3>Other contract amounts</h3>
<p>Items your contract promises, such as a repatriation ticket, a bonus already earned, or expenses to be repaid.</p>
<h3>Deductions</h3>
<p>Amounts you owe the employer under the law or a court order, such as a salary advance. Ask for each one to be itemised.</p>

<h2>The 14-day deadline</h2>
<p>Article 53 of ${LAW} says the employer must pay the employee's wages and all other entitlements within 14 days of the contract ending. If the deadline passes, you can file a labour complaint with MOHRE.</p>

<h2>Checklist before you accept</h2>
<ol>
<li>Run your own numbers with the <a href="/final-settlement-calculator/">final settlement calculator</a> and print the result.</li>
<li>Compare it line by line with the employer's statement.</li>
<li>Check the basic salary, service dates and leave balance they used.</li>
<li>Query any deduction you do not recognise, in writing.</li>
<li>Sign only when the amounts agree or the difference is explained, and the payment has arrived. A signature does not give up rights the law guarantees (Article 65(3)).</li>
</ol>
${faqHtml(pages[10].faq)}
${sources([`${LAW}, Articles 29, 43, 51 and 53.`])}
${related([
  ['/final-settlement-calculator/', 'Final settlement calculator'],
  ['/guides/basic-salary-vs-total-salary-uae/', 'Basic salary vs total salary'],
  ['/guides/gratuity-on-resignation-uae/', 'Gratuity on resignation'],
])}
</article>`,
  },

  // ===== Trust pages =====
  {
    path: '/about/',
    kind: 'page',
    short: 'About',
    title: 'About Calculator UAE and How We Check Rules',
    description:
      'Who runs Calculator UAE, how each calculator is sourced from UAE law, how often rules are reviewed, and how to report an error.',
    h1: 'About Calculator UAE',
    body: ({ SITE }) => `<div class="wrap page-head"><h1>About Calculator UAE</h1>
<p class="answer">Calculator UAE is an independent website that turns UAE rules into free calculators. It is run from the UAE by an independent publisher.</p></div>
<article class="wrap prose">
<h2>How we check rules</h2>
<ol>
<li>Each calculator applies a named article of a UAE law or regulation. The article is listed under Sources on the page.</li>
<li>Every rule is stored with its source and the date it was last checked. The date is shown on each page. The current check date is ${SITE.checkedText}.</li>
<li>The maths behind each calculator is covered by automated tests using worked examples, including edge cases such as service of exactly one year.</li>
<li>When a law changes, the calculator, examples and check date are updated together.</li>
</ol>
<h2>What we do not do</h2>
<ul>
<li>We do not give legal advice. Results are estimates to help you check a figure.</li>
<li>We do not collect what you type. The sums run in your browser.</li>
<li>We are not connected to MOHRE or any government body.</li>
</ul>
<h2>Report an error</h2>
<p>If you think a rule or a result is wrong, email <a href="mailto:${SITE.email}">${SITE.email}</a> with the page and the numbers you entered.</p>
</article>`,
  },
  {
    path: '/contact/',
    kind: 'page',
    short: 'Contact',
    title: 'Contact Calculator UAE',
    description: 'How to contact Calculator UAE to report an error, suggest a calculator or ask about the site.',
    h1: 'Contact',
    body: ({ SITE }) => `<div class="wrap page-head"><h1>Contact</h1>
<p class="answer">Email <a href="mailto:${SITE.email}">${SITE.email}</a>. We read every message and aim to reply within three working days.</p></div>
<article class="wrap prose">
<h2>What to include</h2>
<ul>
<li>To report a wrong result: the page, the numbers you entered and the result you expected.</li>
<li>To suggest a calculator: the rule or question you want covered.</li>
</ul>
<p>We cannot advise on individual employment disputes. For those, contact the Ministry of Human Resources and Emiratisation or a licensed lawyer.</p>
</article>`,
  },
  {
    path: '/privacy/',
    kind: 'page',
    short: 'Privacy',
    title: 'Privacy Policy | Calculator UAE',
    description: 'Calculator UAE runs its calculators in your browser and does not collect or store the figures you enter. Full privacy policy.',
    h1: 'Privacy policy',
    body: ({ SITE }) => `<div class="wrap page-head"><h1>Privacy policy</h1>
<p class="answer">The figures you type into a calculator stay in your browser. They are not sent to us, stored, or shared.</p>
<p class="checked">Last updated: <time datetime="${SITE.checked}">${SITE.checkedText}</time></p></div>
<article class="wrap prose">
<h2>What we collect</h2>
<p>We do not ask for your name, Emirates ID, passport or employer. The site has no accounts and no forms that send data to us.</p>
<h2>Hosting logs</h2>
<p>Our hosting provider processes standard technical data, such as IP address and browser type, to deliver pages and block abuse.</p>
<h2>Cookies and advertising</h2>
<p>The site does not currently set cookies. If we add advertising or visitor statistics, third parties such as Google may use cookies to show and measure ads. This page will be updated first, and where the law requires it you will be asked for consent.</p>
<h2>Email</h2>
<p>If you email us, we use your address only to reply.</p>
<h2>Contact</h2>
<p>Questions about privacy: <a href="mailto:${SITE.email}">${SITE.email}</a>.</p>
</article>`,
  },
  {
    path: '/terms/',
    kind: 'page',
    short: 'Terms',
    title: 'Terms of Use | Calculator UAE',
    description: 'Terms for using Calculator UAE: free calculators for personal use, estimates only, no legal or financial advice.',
    h1: 'Terms of use',
    body: ({ SITE }) => `<div class="wrap page-head"><h1>Terms of use</h1>
<p class="answer">You may use the calculators free of charge. Results are estimates and are not legal, financial or tax advice.</p>
<p class="checked">Last updated: <time datetime="${SITE.checked}">${SITE.checkedText}</time></p></div>
<article class="wrap prose">
<h2>Using the site</h2>
<p>Do not try to disrupt the site, copy it in bulk, or present its results as official figures from any authority.</p>
<h2>Accuracy</h2>
<p>We work to keep rules current and show the date each was checked. Laws change and individual cases differ, so we cannot guarantee that a result matches what you will be paid.</p>
<h2>Liability</h2>
<p>To the extent the law allows, we are not liable for losses that result from relying on a result. Confirm important figures with your employer, MOHRE or a licensed adviser.</p>
<h2>Links</h2>
<p>Links to official sources are provided for reference. We do not control those sites.</p>
<h2>Changes</h2>
<p>We may update these terms. The date above shows the latest version.</p>
</article>`,
  },
  {
    path: '/disclaimer/',
    kind: 'page',
    short: 'Disclaimer',
    title: 'Disclaimer | Calculator UAE',
    description: 'Calculator UAE is independent and not affiliated with any government body. Results are estimates, not legal advice.',
    h1: 'Disclaimer',
    body: () => `<div class="wrap page-head"><h1>Disclaimer</h1>
<p class="answer">Calculator UAE is an independent website. It is not affiliated with, endorsed by, or run by the Ministry of Human Resources and Emiratisation or any other government body.</p></div>
<article class="wrap prose">
<h2>Estimates only</h2>
<p>The calculators apply the general rules of UAE law to the numbers you enter. They cannot see your contract, your employer's policies, a free zone's own regulations or a court decision, any of which can change the result.</p>
<h2>Not legal advice</h2>
<p>Nothing on this site is legal advice. For a dispute or a decision with money at stake, contact MOHRE or a licensed lawyer.</p>
<h2>Official names</h2>
<p>Names of laws and authorities are used only to identify the rules a calculator applies.</p>
</article>`,
  },
  {
    path: '/404/',
    file: '404.html',
    kind: 'page',
    noindex: true,
    short: 'Page not found',
    title: 'Page Not Found | Calculator UAE',
    description: 'This page does not exist. Use the links to reach the UAE gratuity, leave, notice pay and final settlement calculators.',
    h1: 'Page not found',
    body: ({ pages }) => `<div class="wrap page-head"><h1>Page not found</h1>
<p class="answer">That address does not exist. Pick a calculator below.</p></div>
<div class="wrap home-section">${toolLedger(pages, 'h2')}</div>`,
  },
];

pages.push(...morePages({ money, days, toolBlock, related, pageHead }));
