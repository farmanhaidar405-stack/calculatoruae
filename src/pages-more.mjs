// Calculators outside the Work section: Money, Housing, Business, Visa.

const link = (href, text) => `<a href="${href}" rel="noopener">${text}</a>`;

export function morePages({ money, days, toolBlock, related, pageHead }) {
  const num = (name, label, value, unit, hint = '', maxlength = 8) => `<div class="field">
<label for="f-${name}">${label}</label>
${hint ? `<span class="hint" id="h-${name}">${hint}</span>` : ''}
<div class="control">
<input id="f-${name}" name="${name}" type="text" inputmode="decimal" autocomplete="off" maxlength="${maxlength}" value="${value}"${hint ? ` aria-describedby="h-${name}"` : ''}><span class="unit" aria-hidden="true">${unit}</span></div>
</div>`;

  const select = (name, label, options, hint = '') => `<div class="field">
<label for="f-${name}">${label}</label>
${hint ? `<span class="hint" id="h-${name}">${hint}</span>` : ''}
<div class="control"><select id="f-${name}" name="${name}"${hint ? ` aria-describedby="h-${name}"` : ''}>
${options.map(([v, t]) => `<option value="${v}">${t}</option>`).join('')}
</select></div></div>`;

  const src = (items) => `<h2>Sources</h2><ul class="sources">${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;

  const page = (p) => ({
    kind: 'tool',
    tool: true,
    ...p,
    body: ({ SITE, adSlot, faqHtml }) => `${pageHead(p.h1, p.answer, SITE.checkedText)}
${toolBlock(p.handler, p.slipTitle, p.fields, SITE.checkedText)}
<div class="wrap">${adSlot('after-result')}</div>
<article class="wrap prose">
${p.content}
${adSlot('mid-content')}
${faqHtml(p.faq)}
${src(p.sources)}
${related(p.related)}
${adSlot('end')}
</article>`,
  });

  return [
    // ===== VAT =====
    page({
      path: '/vat-calculator/',
      section: 'Money',
      handler: 'vat',
      short: 'VAT calculator',
      fig: ['5%', 'VAT'],
      blurb: 'Add 5% VAT to a price, or take it out of a VAT-inclusive total.',
      title: 'UAE VAT Calculator: Add or Remove 5% VAT',
      description:
        'Add 5% UAE VAT to a net price or remove it from a VAT-inclusive total. Shows the net amount, the VAT and the total, with the formula for each.',
      h1: 'UAE VAT calculator',
      slipTitle: 'VAT result',
      answer:
        'The standard rate of VAT in the UAE is 5%. To add VAT, multiply the net price by 1.05. To find the VAT inside a VAT-inclusive price, divide the total by 21. This calculator does both and shows the net amount, the VAT and the total.',
      fields: `${money('amount', 'Amount', '1000')}
${select('mode', 'What do you want to do?', [
  ['add', 'Add VAT to this amount'],
  ['remove', 'Remove VAT from this amount'],
])}`,
      content: `<h2>How UAE VAT is calculated</h2>
<p>VAT was introduced in the UAE on 1 January 2018 under Federal Decree-Law No. 8 of 2017. The standard rate is 5% and it applies to most goods and services.</p>
<p class="formula">Adding VAT: total = net price × 1.05<br>Removing VAT: net price = total ÷ 1.05</p>
<div class="table-scroll"><table>
<thead><tr><th>You have</th><th>You want</th><th>Do this</th></tr></thead>
<tbody>
<tr><td>Price before VAT</td><td>VAT amount</td><td>Multiply by 0.05</td></tr>
<tr><td>Price before VAT</td><td>Price with VAT</td><td>Multiply by 1.05</td></tr>
<tr><td>Price with VAT</td><td>Price before VAT</td><td>Divide by 1.05</td></tr>
<tr><td>Price with VAT</td><td>VAT amount</td><td>Divide by 21</td></tr>
</tbody></table></div>
<h2>Worked examples</h2>
<h3>Adding VAT to AED 1,000</h3>
<p>VAT: 1,000 × 0.05 = AED 50. Total: <strong>AED 1,050</strong>.</p>
<h3>Finding the VAT inside AED 1,050</h3>
<p>Net price: 1,050 ÷ 1.05 = AED 1,000. VAT: <strong>AED 50</strong>.</p>
<h3>A receipt total of AED 199</h3>
<p>Net price: 199 ÷ 1.05 = AED 189.52. VAT: <strong>AED 9.48</strong>.</p>
<h2>A common mistake</h2>
<p>Taking 5% off a VAT-inclusive price does not give the price before VAT. Five percent of AED 1,050 is AED 52.50, but the VAT inside it is AED 50. Always divide by 1.05.</p>
<h2>What this calculator does not cover</h2>
<p>Some supplies are zero-rated or exempt from VAT. This calculator applies the standard 5% rate only. Whether a business must register for VAT depends on its taxable turnover; check the Federal Tax Authority's guidance for the current thresholds.</p>`,
      faq: [
        ['What is the VAT rate in the UAE?', 'The standard rate is 5%. Some supplies are zero-rated or exempt.'],
        ['How do I remove VAT from a price in the UAE?', 'Divide the VAT-inclusive price by 1.05 to get the price before VAT. The difference is the VAT.'],
        ['How do I calculate 5% VAT quickly?', 'Multiply the net price by 0.05 for the VAT, or by 1.05 for the total. For a VAT-inclusive price, divide by 21 to get the VAT.'],
      ],
      sources: [
        'Federal Decree-Law No. 8 of 2017 on Value Added Tax.',
        link('https://tax.gov.ae/', 'Federal Tax Authority'),
      ],
      related: [
        ['/e-invoicing-penalty-calculator/', 'E-invoicing deadline and penalty calculator'],
        ['/zakat-calculator/', 'Zakat calculator'],
      ],
    }),

    // ===== Mortgage =====
    page({
      path: '/mortgage-calculator/',
      section: 'Housing',
      handler: 'mortgage',
      short: 'Mortgage calculator',
      fig: ['20%', 'down'],
      blurb: 'Monthly payment, total interest and the minimum down payment rule.',
      title: 'UAE Mortgage Calculator: Monthly Payment and Down Payment',
      description:
        'Calculate a UAE home loan payment and total interest, and check your down payment against the Central Bank minimum for expats and UAE nationals.',
      h1: 'UAE mortgage calculator',
      slipTitle: 'Monthly payment',
      answer:
        'A UAE mortgage payment depends on the loan amount, the interest rate and the term, which can be up to 25 years. Central Bank rules also set a minimum down payment: 20% for an expat buying a first home priced up to AED 5 million, and more above that price or for a second property.',
      fields: `${money('price', 'Property price', '1500000')}
<div class="pair">
${num('down', 'Down payment', '20', '%', 'Share of the price paid in cash.', 5)}
${num('rate', 'Interest rate', '4.5', '% a year', 'Ask your bank for the current rate.', 5)}
</div>
<div class="pair">
${num('years', 'Loan term', '25', 'years', 'Up to 25 years.', 2)}
${select('buyer', 'Buyer', [
  ['expatFirst', 'Expat, first home'],
  ['nationalFirst', 'UAE national, first home'],
  ['expatSecond', 'Expat, second or investment'],
  ['nationalSecond', 'UAE national, second or investment'],
])}
</div>`,
      content: `<h2>How the monthly payment is calculated</h2>
<p>Home loans are repaid in equal monthly instalments on a reducing balance. Each payment covers that month's interest on what you still owe, and the rest reduces the loan.</p>
<p class="formula">Payment = loan × r ÷ (1 − (1 + r)<sup>−n</sup>), where r is the yearly rate ÷ 12 and n is the number of months</p>
<h2>Minimum down payment under Central Bank rules</h2>
<div class="table-scroll"><table>
<thead><tr><th>Purchase</th><th class="num">Expat</th><th class="num">UAE national</th></tr></thead>
<tbody>
<tr><td>First home, price up to AED 5 million</td><td class="num">20%</td><td class="num">15%</td></tr>
<tr><td>First home, price above AED 5 million</td><td class="num">30%</td><td class="num">25%</td></tr>
<tr><td>Second home or investment property</td><td class="num">40%</td><td class="num">35%</td></tr>
</tbody></table></div>
<p>These are the lowest down payments the rules allow for a completed property. A bank can ask for more. The longest term allowed is 25 years.</p>
<h2>Worked example</h2>
<p>An expat buys a first home for AED 1,500,000 with 20% down. Down payment: AED 300,000. Loan: AED 1,200,000. At 4.5% a year over 25 years, the payment is <strong>AED 6,669.99 a month</strong>. Total interest over the term is about AED 801,000.</p>
<h2>Costs this calculator leaves out</h2>
<ul>
<li>Property registration and transfer fees.</li>
<li>Bank arrangement, valuation and mortgage registration fees.</li>
<li>Life and property insurance required by the bank.</li>
<li>Agent commission and service charges.</li>
</ul>
<p>Rates also change. Many UAE home loans have a fixed rate for a few years and then move to a variable rate, so the payment can rise or fall later.</p>
<h2>Other limits banks apply</h2>
<p>Banks also look at your total monthly debt payments against your income and at your age when the loan ends. These depend on your own figures, so ask for a written pre-approval before you commit to a purchase.</p>`,
      faq: [
        ['What is the minimum down payment for a mortgage in the UAE?', 'For an expat buying a first home priced up to AED 5 million it is 20% of the price. It is 30% above AED 5 million and 40% for a second or investment property. UAE nationals need 15%, 25% and 35%.'],
        ['What is the maximum mortgage term in the UAE?', 'Twenty-five years under Central Bank regulations.'],
        ['How much is the monthly payment on a AED 1 million mortgage?', 'At 4.5% a year over 25 years, a loan of AED 1,000,000 costs AED 5,558.32 a month.'],
      ],
      sources: [
        `${link('https://rulebook.centralbank.ae/node/2856', 'Central Bank of the UAE Rulebook: Regulations Regarding Mortgage Loans')} (loan-to-value limits and 25-year maximum term).`,
      ],
      related: [
        ['/rent-increase-calculator/', 'Dubai rent increase calculator'],
        ['/car-loan-calculator/', 'Car loan calculator'],
      ],
    }),

    // ===== Car loan =====
    page({
      path: '/car-loan-calculator/',
      section: 'Money',
      handler: 'carLoan',
      short: 'Car loan calculator',
      fig: ['Flat', 'vs reducing'],
      blurb: 'Monthly instalment on a flat or reducing rate, and what the loan costs.',
      title: 'UAE Car Loan Calculator: Flat vs Reducing Rate',
      description:
        'Calculate a UAE car loan instalment on a flat or reducing rate, see the total interest, and compare the two rate types on the same loan.',
      h1: 'UAE car loan calculator',
      slipTitle: 'Monthly instalment',
      answer:
        'A car loan instalment depends on the amount borrowed, the rate, the term and whether the rate is flat or reducing. A flat rate charges interest on the full loan for the whole term, so a 3% flat rate costs far more than a 3% reducing rate.',
      fields: `<div class="pair">
${money('price', 'Car price', '100000')}
${money('down', 'Down payment', '20000')}
</div>
<div class="pair">
${num('rate', 'Interest rate', '3', '% a year', '', 5)}
${num('months', 'Loan term', '60', 'months', '', 3)}
</div>
${select('type', 'Rate type', [
  ['flat', 'Flat rate'],
  ['reducing', 'Reducing rate'],
], 'Your bank\'s offer letter says which one it is.')}`,
      content: `<h2>Flat rate and reducing rate</h2>
<p>UAE car loans are often advertised with a flat rate. The number looks low because of how it is applied.</p>
<div class="table-scroll"><table>
<thead><tr><th></th><th>Flat rate</th><th>Reducing rate</th></tr></thead>
<tbody>
<tr><td>Interest is charged on</td><td>The full loan, every year</td><td>Only what you still owe</td></tr>
<tr><td>Formula</td><td>(Loan + loan × rate × years) ÷ months</td><td>Standard reducing-balance instalment</td></tr>
<tr><td>Same percentage means</td><td>Higher cost</td><td>Lower cost</td></tr>
</tbody></table></div>
<h2>Worked example</h2>
<p>Car price AED 100,000 with AED 20,000 down, so the loan is AED 80,000 over 60 months.</p>
<ul>
<li>At 3% flat: interest is 80,000 × 3% × 5 = AED 12,000. Instalment: 92,000 ÷ 60 = <strong>AED 1,533.33</strong>.</li>
<li>At 3% reducing: instalment <strong>AED 1,437.50</strong>, and total interest about AED 6,250.</li>
</ul>
<p>The same 3% costs almost twice as much on a flat rate. As a rough guide, a flat rate is close to a reducing rate of a little under double the number.</p>
<h2>How to compare two offers</h2>
<ol>
<li>Ask each bank whether the rate is flat or reducing.</li>
<li>Enter both offers here with the same loan and term.</li>
<li>Compare the total interest, then add each bank's processing fee and insurance.</li>
</ol>
<h2>What this calculator leaves out</h2>
<p>Processing fees, insurance, registration and early settlement charges are not included. Banks also set their own minimum down payment and maximum term, so confirm both before you agree a price with a dealer.</p>`,
      faq: [
        ['What is the difference between flat and reducing rate on a car loan?', 'A flat rate charges interest on the full loan amount for the whole term. A reducing rate charges interest only on the balance still owed, so the same percentage costs less.'],
        ['How is a flat rate car loan instalment calculated?', 'Multiply the loan by the yearly rate and by the number of years to get total interest, add it to the loan, and divide by the number of months.'],
        ['Is 3% flat the same as 3% reducing?', 'No. On a five-year loan, 3% flat costs about the same as a reducing rate of roughly 5.6%.'],
      ],
      sources: ['Standard loan arithmetic. No UAE regulation is applied by this calculator; lending terms are set by each bank.'],
      related: [
        ['/mortgage-calculator/', 'Mortgage calculator'],
        ['/zakat-calculator/', 'Zakat calculator'],
      ],
    }),

    // ===== Zakat =====
    page({
      path: '/zakat-calculator/',
      section: 'Money',
      handler: 'zakat',
      short: 'Zakat calculator',
      fig: ['2.5%', 'of net wealth'],
      blurb: '2.5% of net wealth above the nisab, in AED, by gold or silver standard.',
      title: 'Zakat Calculator in AED: Nisab and 2.5% Calculation',
      description:
        'Calculate zakat in AED: add cash, gold, silver, investments and business stock, deduct debts, check the nisab by gold or silver, and apply 2.5%.',
      h1: 'Zakat calculator in AED',
      slipTitle: 'Zakat due',
      answer:
        'Zakat is 2.5% of your net zakatable wealth if it has stayed at or above the nisab for one lunar year. The nisab is the value of 85 grams of gold or 595 grams of silver. Add your cash, gold, silver, investments and trade goods, subtract debts due now, and apply the rate.',
      fields: `<div class="pair">
${money('cash', 'Cash and bank balances', '50000')}
${money('gold', 'Value of gold you own', '20000')}
</div>
<div class="pair">
${money('silver', 'Value of silver you own', '0')}
${money('investments', 'Shares and investments', '0')}
</div>
<div class="pair">
${money('business', 'Business stock for sale', '0')}
${money('receivables', 'Money owed to you', '0', 'Loans you expect to be repaid.')}
</div>
${money('debts', 'Debts you must pay now', '10000', 'Bills and instalments currently due.')}
<div class="pair">
${select('nisab', 'Nisab standard', [
  ['gold85', 'Gold, 85 grams'],
  ['gold8748', 'Gold, 87.48 grams'],
  ['silver595', 'Silver, 595 grams'],
  ['silver61236', 'Silver, 612.36 grams'],
])}
${num('metalPrice', 'Today\'s price per gram', '400', 'AED', 'Of the metal chosen. 24 carat for gold.', 9)}
</div>
${select('year', 'Zakat year', [
  ['lunar', 'Lunar (Hijri) year, 2.5%'],
  ['solar', 'Solar (Gregorian) year, 2.577%'],
])}`,
      content: `<h2>How zakat is calculated</h2>
<ol>
<li>Pick your zakat date and add up what you own on that day: cash, gold and silver, investments, goods held for sale and money owed to you.</li>
<li>Subtract debts and bills that are due now.</li>
<li>Work out the nisab: grams of the metal × today's price per gram.</li>
<li>If your net wealth is at or above the nisab and has been for a lunar year, zakat is 2.5% of the whole net amount.</li>
</ol>
<p class="formula">Zakat = (assets − debts due) × 2.5%, if the result is at or above the nisab</p>
<h2>Which nisab to use</h2>
<div class="table-scroll"><table>
<thead><tr><th>Standard</th><th>Gold</th><th>Silver</th><th>Used by</th></tr></thead>
<tbody>
<tr><td>85 g / 595 g</td><td>85 grams</td><td>595 grams</td><td>UAE Awqaf guidance, AAOIFI</td></tr>
<tr><td>87.48 g / 612.36 g</td><td>87.48 grams</td><td>612.36 grams</td><td>Common in South Asia and the UK</td></tr>
</tbody></table></div>
<p>The silver nisab is much lower in money terms than the gold nisab, so more people owe zakat under it. Scholars differ on which to use for cash; follow the view you trust or ask a scholar.</p>
<h2>Worked examples</h2>
<h3>Above the nisab</h3>
<p>Cash AED 50,000, gold worth AED 20,000, debts due AED 10,000. Net wealth: AED 60,000. With gold at AED 400 a gram, the 85-gram nisab is AED 34,000. Zakat: 60,000 × 2.5% = <strong>AED 1,500</strong>.</p>
<h3>Below the nisab</h3>
<p>Net wealth of AED 20,000 against the same AED 34,000 gold nisab: <strong>no zakat is due</strong>. Under the silver nisab at AED 4 a gram (AED 2,380), zakat would be AED 500.</p>
<h2>Lunar or solar year</h2>
<p>Zakat is due once every lunar year, which is about 11 days shorter than a calendar year. If you keep your accounts by the calendar year, the rate used is 2.577% to make up the difference.</p>
<h2>What is not counted</h2>
<p>Your home, car, furniture and other things kept for personal use are not zakatable. Rules for jewellery in regular use, pension balances and long-term debts differ between schools, so check with a scholar. This calculator does not cover zakat al-fitr, livestock or crops.</p>`,
      faq: [
        ['How much is zakat on money?', 'It is 2.5% of your net zakatable wealth, provided it has stayed at or above the nisab for one lunar year.'],
        ['What is the nisab for zakat in the UAE?', 'The value of 85 grams of gold or 595 grams of silver. In dirhams it changes with metal prices: multiply the grams by today\'s price per gram.'],
        ['Do I pay zakat on the whole amount or only what is above the nisab?', 'On the whole net amount. The nisab is a threshold, not an allowance.'],
        ['Why is the rate 2.577% for a solar year?', 'A calendar year is about 11 days longer than a lunar year, so the rate is raised to keep the amount equivalent.'],
      ],
      sources: [
        'General Authority of Islamic Affairs, Endowments and Zakat (Awqaf), UAE: nisab of 85 grams of gold, 2.5% lunar and 2.577% solar rates.',
        'AAOIFI Shariah Standard No. 35 (Zakah): nisab of 85 grams of gold or 595 grams of silver.',
      ],
      related: [
        ['/vat-calculator/', 'VAT calculator'],
        ['/gratuity-calculator/', 'Gratuity calculator'],
      ],
    }),

    // ===== Rent increase =====
    page({
      path: '/rent-increase-calculator/',
      section: 'Housing',
      handler: 'rent',
      short: 'Dubai rent increase calculator',
      fig: ['0–20%', 'cap'],
      blurb: 'The most a Dubai landlord can raise rent at renewal under Decree 43.',
      title: 'Dubai Rent Increase Calculator (RERA Decree 43)',
      description:
        'Check the maximum rent increase a Dubai landlord can ask at renewal under Decree No. 43 of 2013, from your current rent and the rental index average.',
      h1: 'Dubai rent increase calculator',
      slipTitle: 'Maximum new yearly rent',
      answer:
        'In Dubai, a landlord can raise the rent at renewal only if your rent is more than 10% below the average for similar properties. The most allowed is 5%, 10%, 15% or 20%, depending on how far below the average you are, and the landlord must give 90 days\' written notice.',
      fields: `${money('current', 'Your current yearly rent', '90000')}
${money('market', 'Average yearly rent for similar properties', '110000', 'From the Dubai Land Department rental index for your area and unit type.')}`,
      content: `<h2>The rent increase bands</h2>
<p>Dubai Decree No. 43 of 2013 sets the largest increase allowed when a tenancy contract is renewed. It compares your rent with the average rent for similar units, taken from the official rental index.</p>
<div class="table-scroll"><table>
<thead><tr><th>Your rent compared with the average</th><th class="num">Maximum increase</th></tr></thead>
<tbody>
<tr><td>Up to 10% below, equal or above</td><td class="num">None</td></tr>
<tr><td>11% to 20% below</td><td class="num">5%</td></tr>
<tr><td>21% to 30% below</td><td class="num">10%</td></tr>
<tr><td>31% to 40% below</td><td class="num">15%</td></tr>
<tr><td>More than 40% below</td><td class="num">20%</td></tr>
</tbody></table></div>
<p class="formula">Gap = (average rent − your rent) ÷ average rent × 100</p>
<p>The increase is a percentage of your current rent, not of the average.</p>
<h2>Worked examples</h2>
<h3>Rent AED 90,000, average AED 110,000</h3>
<p>Gap: 20,000 ÷ 110,000 = 18.2% below. Band: 5%. Maximum new rent: 90,000 × 1.05 = <strong>AED 94,500</strong>.</p>
<h3>Rent AED 95,000, average AED 100,000</h3>
<p>Gap: 5% below. <strong>No increase is allowed</strong> at this renewal.</p>
<h3>Rent AED 55,000, average AED 100,000</h3>
<p>Gap: 45% below. Band: 20%, the legal maximum. Maximum new rent: <strong>AED 66,000</strong>.</p>
<h2>Where to get the average rent</h2>
<p>Use the Dubai Land Department's rental index. Since January 2025 this is the Smart Rental Index, which takes the building and unit into account. Enter the average it gives for your property here.</p>
<h2>The 90-day notice rule</h2>
<p>A landlord who wants to change the rent must tell you in writing at least 90 days before the contract ends. Without that notice, the contract renews on the same rent even if the index would allow an increase.</p>
<h2>If you disagree</h2>
<p>Show the landlord the index result and the band above. If that does not settle it, either side can take the case to the Rental Disputes Center in Dubai.</p>
<h2>Limits of this calculator</h2>
<p>It applies to Dubai only. Other emirates have their own rules. It gives the legal ceiling, not the rent you must accept: you and the landlord can agree on less.</p>`,
      faq: [
        ['How much can a landlord increase rent in Dubai?', 'Nothing if your rent is within 10% of the average for similar properties. Otherwise up to 5%, 10%, 15% or 20%, depending on how far below the average your rent is. Twenty percent is the maximum.'],
        ['How much notice must a Dubai landlord give for a rent increase?', 'At least 90 days in writing before the tenancy contract ends.'],
        ['Can my landlord raise the rent in the middle of the contract?', 'No. Rent can change only at renewal.'],
        ['Is the increase calculated on my rent or the market rent?', 'On your current rent. The market average is used only to decide which band applies.'],
      ],
      sources: [
        `${link('https://dlp.dubai.gov.ae/Legislation%20Reference/2013/Decree%20No.%20(43)%20of%202013%20Determining%20Rent%20Increase%20for%20Real%20Property.html', 'Decree No. (43) of 2013 Determining Rent Increase for Real Property in the Emirate of Dubai')}, Article 1.`,
        `${link('https://dubailand.gov.ae/', 'Dubai Land Department')} rental index.`,
        'Dubai Law No. 26 of 2007 as amended by Law No. 33 of 2008 (90-day notice).',
      ],
      related: [
        ['/mortgage-calculator/', 'Mortgage calculator'],
        ['/final-settlement-calculator/', 'Final settlement calculator'],
      ],
    }),

    // ===== Overstay =====
    page({
      path: '/overstay-fine-calculator/',
      section: 'Visa',
      handler: 'overstay',
      short: 'Overstay fine calculator',
      fig: ['AED 50', 'a day'],
      blurb: 'AED 50 for each day past your visa or grace period.',
      title: 'UAE Overstay Fine Calculator: AED 50 per Day',
      description:
        'Calculate a UAE visa overstay fine at the standard AED 50 per day for tourist, visit and residence visas, counted after any grace period ends.',
      h1: 'UAE overstay fine calculator',
      slipTitle: 'Overstay fine',
      answer:
        'The UAE overstay fine is AED 50 for each day you stay after your visa or grace period ends. The same daily rate applies to tourist, visit and residence visas. Multiply the number of overstay days by 50 to get the fine.',
      fields: `${num('days', 'Days overstayed', '15', 'days', 'Count from the day after your visa or grace period ended.', 5)}`,
      content: `<h2>How the fine is calculated</h2>
<p>The Federal Authority for Identity, Citizenship, Customs and Port Security (ICP) has set one standard rate for overstaying: AED 50 a day for visit, tourist and residence visas.</p>
<p class="formula">Fine = overstay days × AED 50</p>
<div class="table-scroll"><table>
<thead><tr><th>Days overstayed</th><th class="num">Fine</th></tr></thead>
<tbody>
<tr><td>1</td><td class="num">AED 50</td></tr>
<tr><td>7</td><td class="num">AED 350</td></tr>
<tr><td>15</td><td class="num">AED 750</td></tr>
<tr><td>30</td><td class="num">AED 1,500</td></tr>
<tr><td>90</td><td class="num">AED 4,500</td></tr>
<tr><td>180</td><td class="num">AED 9,000</td></tr>
</tbody></table></div>
<p>The fine has no upper limit. It keeps growing until you leave or fix your status.</p>
<h2>Count the days correctly</h2>
<p>Many visas have a grace period after they expire or are cancelled, and the fine starts only when it ends. The length of the grace period depends on your visa type and category, and published figures differ. Check the exact end date on your visa record with ICP, or with GDRFA for a Dubai visa, and count from the following day.</p>
<h2>Older rates you may still see</h2>
<p>Some websites still show AED 100 a day for tourist visas or a higher charge for the first day. Those belong to the earlier system. The standard rate is now AED 50 a day for all three visa types.</p>
<h2>Other costs</h2>
<p>This calculator shows the daily fine only. Service, exit permit or administration fees may be added when you pay, and a long overstay can affect future visa applications.</p>
<h2>How to check and pay the real amount</h2>
<p>Your official fine is shown on the ICP smart services website or app, or on the GDRFA website for Dubai visas. You can also pay at the airport when you leave. This site cannot look up your record.</p>`,
      faq: [
        ['How much is the overstay fine in the UAE per day?', 'AED 50 a day for tourist, visit and residence visas.'],
        ['When does the overstay fine start?', 'The day after your visa expires or, where your visa has one, the day after its grace period ends.'],
        ['Is there a maximum overstay fine in the UAE?', 'No. The fine is charged for every day of overstay with no upper limit.'],
        ['Where can I check my actual overstay fine?', 'On the ICP smart services website or app, or the GDRFA website for visas issued in Dubai.'],
      ],
      sources: [
        `${link('https://icp.gov.ae/', 'Federal Authority for Identity, Citizenship, Customs and Port Security (ICP)')}: standard overstay fine of AED 50 a day.`,
        'UAE Government announcement standardising overstay fines for visit, tourist and residence visas.',
      ],
      related: [
        ['/gratuity-calculator/', 'Gratuity calculator'],
        ['/final-settlement-calculator/', 'Final settlement calculator'],
      ],
    }),

    // ===== E-invoicing =====
    page({
      path: '/e-invoicing-penalty-calculator/',
      section: 'Business',
      handler: 'einvoice',
      short: 'E-invoicing deadline and penalty calculator',
      fig: ['1 Jul', '2027'],
      blurb: 'Your UAE e-invoicing go-live date, days left, and the fines for missing it.',
      title: 'UAE E-Invoicing Deadline and Penalty Calculator',
      description:
        'Find your UAE e-invoicing go-live date by revenue, see the days left, and estimate fines under Cabinet Decision No. 106 of 2025 for missing it.',
      h1: 'UAE e-invoicing deadline and penalty calculator',
      slipTitle: 'Estimated penalties',
      answer:
        'UAE e-invoicing becomes mandatory on 1 January 2027 for businesses with revenue of AED 50 million or more, and on 1 July 2027 for all other businesses in scope. Missing the deadline costs AED 5,000 a month, and each invoice not sent through the system costs AED 100, up to AED 5,000 a month.',
      fields: `${select('group', 'Your business', [
  ['small', 'Revenue under AED 50 million'],
  ['large', 'Revenue AED 50 million or more'],
  ['government', 'Government entity'],
])}
${num('monthsLate', 'Months late going live', '0', 'months', 'Or late appointing a service provider. Part months count in full.', 4)}
<div class="pair">
${num('invoices', 'Invoices missed in a month', '0', 'invoices', 'Not issued through the system on time.', 8)}
${num('creditNotes', 'Credit notes missed in a month', '0', 'notes', '', 8)}
</div>
${num('notifyDays', 'Days late reporting a system failure', '0', 'days', 'Failure to notify the tax authority.', 4)}`,
      content: `<h2>Mandatory dates</h2>
<p>The Ministry of Finance set the timetable in Ministerial Decision No. 244 of 2025. A voluntary pilot began on 1 July 2026.</p>
<div class="table-scroll"><table>
<thead><tr><th>Who</th><th>Appoint an accredited service provider by</th><th>Go live by</th></tr></thead>
<tbody>
<tr><td>Revenue of AED 50 million or more</td><td>30 October 2026 (extended date)</td><td>1 January 2027</td></tr>
<tr><td>Revenue under AED 50 million</td><td>31 March 2027</td><td>1 July 2027</td></tr>
<tr><td>Government entities</td><td>Confirm with the Ministry</td><td>1 October 2027</td></tr>
</tbody></table></div>
<p>The Ministry has amended these dates once already. Confirm the current dates on the Ministry of Finance website before you plan around them.</p>
<h2>Penalties under Cabinet Decision No. 106 of 2025</h2>
<div class="table-scroll"><table>
<thead><tr><th>Violation</th><th class="num">Fine</th><th>Limit</th></tr></thead>
<tbody>
<tr><td>Not implementing the system, or not appointing a provider, on time</td><td class="num">AED 5,000</td><td>Each month or part month</td></tr>
<tr><td>E-invoice not issued and sent on time</td><td class="num">AED 100 each</td><td>AED 5,000 a month</td></tr>
<tr><td>E-credit note not issued and sent on time</td><td class="num">AED 100 each</td><td>AED 5,000 a month</td></tr>
<tr><td>Not notifying the authority of a system failure</td><td class="num">AED 1,000</td><td>Each day or part day</td></tr>
</tbody></table></div>
<p>The penalties do not apply to a business that joins the system voluntarily before its mandatory date.</p>
<h2>Worked examples</h2>
<h3>Going live three months late</h3>
<p>3 × AED 5,000 = <strong>AED 15,000</strong>.</p>
<h3>Forty invoices sent outside the system in one month</h3>
<p>40 × AED 100 = AED 4,000, under the monthly limit: <strong>AED 4,000</strong>.</p>
<h3>Four hundred invoices missed in one month</h3>
<p>400 × AED 100 = AED 40,000, limited to <strong>AED 5,000</strong> for that month.</p>
<h2>What e-invoicing means in practice</h2>
<ul>
<li>A PDF or scanned invoice is not an e-invoice. The invoice must be structured data in the required format.</li>
<li>Invoices are exchanged through an accredited service provider, not sent directly.</li>
<li>Your accounting or ERP system has to produce the required fields for every invoice and credit note.</li>
</ul>
<h2>Limits of this calculator</h2>
<p>It estimates the listed fines for the numbers you enter. The invoice and credit note figures are for one calendar month. Other violations in the Decision are not included, and the tax authority decides the actual penalty. This tool does not check or generate invoices.</p>`,
      faq: [
        ['When is e-invoicing mandatory in the UAE?', 'From 1 January 2027 for businesses with revenue of AED 50 million or more, from 1 July 2027 for other businesses in scope, and from 1 October 2027 for government entities.'],
        ['What is the penalty for not implementing e-invoicing in the UAE?', 'AED 5,000 for each month or part month of delay in implementing the system or appointing an accredited service provider.'],
        ['What is the fine for not issuing an e-invoice?', 'AED 100 for each invoice not issued and sent on time, limited to AED 5,000 a month. The same applies separately to credit notes.'],
        ['Do the penalties apply if I join early?', 'No. They do not apply to businesses using the system voluntarily before their mandatory date.'],
      ],
      sources: [
        `${link('https://mof.gov.ae/en/news/ministry-of-finance-announces-the-issuance-of-cabinet-resolution-on-administrative-fines-related-to-electronic-invoicing-system/', 'Ministry of Finance: Cabinet resolution on administrative fines for the Electronic Invoicing System')}.`,
        `${link('https://tax.gov.ae/Datafolder/Files/Legislation/2025/Cabinet%20Decision%20No.%20106%20of%202025.pdf', 'Cabinet Decision No. 106 of 2025')} (penalties).`,
        `${link('https://mof.gov.ae/wp-content/uploads/2025/09/Ministerial-Decision-No.-244-of-2025-on-the-Implementation-of-the-Electronic-Invoicing-System.pdf', 'Ministerial Decision No. 244 of 2025')} (implementation dates).`,
      ],
      related: [
        ['/vat-calculator/', 'VAT calculator'],
        ['/final-settlement-calculator/', 'Final settlement calculator'],
      ],
    }),
  ];
}
