// Page behaviour for calculatoruae.ae.
// Security notes: no user input is ever written with innerHTML, nothing is
// sent over the network, nothing is stored, and no code is evaluated.
import {
  gratuity,
  leaveSalary,
  accruedLeaveDays,
  noticePay,
  finalSettlement,
  vat,
  mortgage,
  carLoan,
  zakat,
  rentIncrease,
  overstayFine,
  einvoicePenalty,
  daysUntil,
  MORE_RULES,
} from './calc.js';

const money = new Intl.NumberFormat('en-AE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const plain = new Intl.NumberFormat('en-AE', { maximumFractionDigits: 2 });
const aed = (n) => `AED ${money.format(n)}`;
const signed = (n) => (n < 0 ? `− AED ${money.format(Math.abs(n))}` : aed(n));

function serviceText(period) {
  const y = `${period.years} ${period.years === 1 ? 'year' : 'years'}`;
  const d = `${period.extraDays} ${period.extraDays === 1 ? 'day' : 'days'}`;
  const unpaid = period.unpaidDays > 0 ? `, less ${plain.format(period.unpaidDays)} unpaid days` : '';
  return `${y} and ${d}${unpaid} (${plain.format(period.calendarDays)} calendar days)`;
}

function gratuityLines(g) {
  const lines = [
    ['Service counted', serviceText(g.period)],
    ['Daily basic wage (basic ÷ 30)', aed(g.dailyWage)],
  ];
  if (!g.eligible) return lines;
  lines.push([`First 5 years: ${plain.format(g.firstDays)} days × daily wage`, aed(g.firstAmount)]);
  if (g.laterDays > 0) {
    lines.push([`After 5 years: ${plain.format(g.laterDays)} days × daily wage`, aed(g.laterAmount)]);
  }
  if (g.capped) {
    lines.push(['Before the two-year limit', aed(g.uncapped)]);
    lines.push(['Limit used: 24 months of basic salary', aed(g.cap)]);
  }
  return lines;
}

const SCHEME_NOTE =
  'You said your employer may be in the alternative savings scheme. This estimate does not apply to any period covered by that scheme.';
const CAP_NOTE =
  'The law limits gratuity to two years of wage without saying basic or total. This uses basic salary, the lower reading. On a total-wage reading you could be owed more.';

const tools = {
  gratuity(v) {
    const g = gratuity({ basic: v.basic, start: v.start, end: v.end, unpaidDays: v.unpaid || '0' });
    if (g.error) return g;
    return {
      total: g.amount,
      lines: gratuityLines(g),
      note: !g.eligible
        ? 'Gratuity starts after one year (365 days) of continuous service, so nothing is due yet.'
        : v.scheme === 'yes'
          ? SCHEME_NOTE
          : g.capped
            ? CAP_NOTE
            : 'Based on your last basic salary. Allowances are not included.',
    };
  },

  leave(v) {
    const r = leaveSalary({ basic: v.basic, unusedDays: v.days || '0' });
    if (r.error) return r;
    return {
      total: r.amount,
      lines: [
        ['Daily basic wage (basic ÷ 30)', aed(r.dailyWage)],
        ['Unused leave days', plain.format(r.days)],
      ],
      note: 'Unused leave at the end of service is paid on basic salary, without allowances.',
    };
  },

  notice(v) {
    const r = noticePay({ monthlyWage: v.wage, noticeDays: v.notice, servedDays: v.served || '0' });
    if (r.error) return r;
    return {
      total: r.amount,
      lines: [
        ['Daily wage (total salary ÷ 30)', aed(r.dailyWage)],
        ['Notice days not served', plain.format(r.unservedDays)],
      ],
      note:
        r.unservedDays === 0
          ? 'The notice period was served in full, so no notice allowance is due.'
          : 'The side that did not serve the notice period owes this amount to the other side.',
    };
  },

  settlement(v) {
    const s = finalSettlement({
      basic: v.basic,
      allowances: v.allowances || '0',
      start: v.start,
      end: v.end,
      unpaidDays: v.unpaid || '0',
      unusedLeaveDays: v.leaveDays || '0',
      unpaidSalaryMonths: v.salaryMonths || '0',
      unpaidSalaryDays: v.salaryDays || '0',
      noticeDirection: v.noticeDirection,
      unservedNoticeDays: v.noticeDays || '0',
      otherAdditions: v.additions || '0',
      otherDeductions: v.deductions || '0',
    });
    if (s.error) return s;
    const lines = [
      ['Service counted', serviceText(s.gratuity.period)],
      ['End of service gratuity', aed(s.gratuity.amount)],
      [`Unused leave: ${plain.format(s.leave.days)} days`, aed(s.leave.amount)],
      ['Unpaid salary', aed(s.unpaidSalary)],
    ];
    if (s.gratuity.capped) {
      lines.splice(2, 0, ['Gratuity if the limit is two years of total wage', aed(s.gratuityTotalWageCap)]);
    }
    if (s.noticeAmount !== 0) {
      lines.push([
        s.noticeAmount > 0 ? 'Notice pay owed to you' : 'Notice pay you owe',
        signed(s.noticeAmount),
      ]);
    }
    if (s.additions > 0) lines.push(['Other amounts owed to you', aed(s.additions)]);
    if (s.deductions > 0) lines.push(['Deductions you entered (not checked)', signed(-s.deductions)]);
    return {
      total: s.total,
      lines,
      note:
        s.total < 0
          ? 'A negative total does not by itself mean you must pay your employer. The law limits what can be deducted. Get advice before paying anything.'
          : v.scheme === 'yes'
            ? SCHEME_NOTE
            : s.gratuity.capped
              ? CAP_NOTE
              : s.deductions > 0
                ? 'Deductions are as you entered them. This tool cannot check that they are lawful.'
                : s.gratuity.eligible
                  ? 'Employers must pay end of service dues within 14 days of the contract ending.'
                  : 'No gratuity is included because service is under one year (365 days).',
    };
  },
  vat(v) {
    const r = vat({ amount: v.amount, mode: v.mode });
    if (r.error) return r;
    return {
      total: v.mode === 'add' ? r.gross : r.net,
      lines: [
        ['Amount before VAT', aed(r.net)],
        ['VAT at 5%', aed(r.vat)],
        ['Total including VAT', aed(r.gross)],
      ],
      note:
        v.mode === 'add'
          ? 'The large figure is the total including VAT.'
          : 'The large figure is the amount before VAT.',
    };
  },

  mortgage(v) {
    const r = mortgage({
      price: v.price,
      downPercent: v.down,
      annualRate: v.rate,
      years: v.years,
      buyer: v.buyer,
    });
    if (r.error) return r;
    return {
      total: r.monthly,
      lines: [
        ['Down payment', aed(r.downAmount)],
        ['Loan amount', aed(r.principal)],
        ['Total interest over the term', aed(r.totalInterest)],
        ['Total repaid', aed(r.totalPaid)],
      ],
      note: r.belowMinimum
        ? `Central Bank rules need a down payment of at least ${r.minDown}% for this buyer and price. Raise the down payment.`
        : 'Bank fees, insurance and registration costs are not included.',
    };
  },

  carLoan(v) {
    const r = carLoan({
      price: v.price,
      downPayment: v.down || '0',
      annualRate: v.rate,
      months: v.months,
      type: v.type,
    });
    if (r.error) return r;
    return {
      total: r.monthly,
      lines: [
        ['Loan amount', aed(r.principal)],
        ['Total interest', aed(r.totalInterest)],
        ['Total repaid', aed(r.totalPaid)],
      ],
      note:
        v.type === 'flat'
          ? 'Flat rate: interest is charged on the full loan for the whole term.'
          : 'Reducing rate: interest is charged only on what you still owe.',
    };
  },

  zakat(v) {
    const r = zakat({
      cash: v.cash || '0',
      gold: v.gold || '0',
      silver: v.silver || '0',
      investments: v.investments || '0',
      business: v.business || '0',
      receivables: v.receivables || '0',
      debts: v.debts || '0',
      metalPrice: v.metalPrice,
      nisab: v.nisab,
      year: v.year,
    });
    if (r.error) return r;
    return {
      total: r.amount,
      lines: [
        ['Total assets', aed(r.assets)],
        ['Net wealth after debts', aed(r.net)],
        ['Nisab today', aed(r.nisabValue)],
        ['Rate', `${r.rate}%`],
      ],
      note: r.due
        ? 'Your net wealth is at or above the nisab. Zakat is due if it has stayed there for a full year.'
        : 'Your net wealth is below the nisab, so no zakat is due.',
    };
  },

  rent(v) {
    const r = rentIncrease({ currentRent: v.current, marketRent: v.market });
    if (r.error) return r;
    const gap =
      r.gapPercent > 0
        ? `${plain.format(r.gapPercent)}% below the average`
        : r.gapPercent < 0
          ? `${plain.format(Math.abs(r.gapPercent))}% above the average`
          : 'Equal to the average';
    return {
      total: r.maxRent,
      lines: [
        ['Your rent is', gap],
        ['Maximum increase allowed', `${r.percent}%`],
        ['Increase in dirhams', aed(r.increase)],
      ],
      note:
        r.percent === 0
          ? 'No increase is allowed at this renewal.'
          : 'The landlord must give 90 days of written notice before the contract ends.',
    };
  },

  overstay(v) {
    const r = overstayFine({ days: v.days });
    if (r.error) return r;
    return {
      total: r.amount,
      lines: [
        ['Days overstayed', plain.format(r.days)],
        ['Fine per day', aed(r.perDay)],
      ],
      note: 'Service or exit permit fees may be added when you pay. Check the official amount with ICP or GDRFA.',
    };
  },

  einvoice(v) {
    const r = einvoicePenalty({
      monthsLate: v.monthsLate || '0',
      invoices: v.invoices || '0',
      creditNotes: v.creditNotes || '0',
      notifyDays: v.notifyDays || '0',
    });
    if (r.error) return r;
    const group = MORE_RULES.einvoice.groups[v.group];
    if (!group) return { error: 'Choose your business type.' };
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const pretty = (iso) =>
      new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      });
    const left = daysUntil(group.goLive, today);
    const lines = [
      ['Go live by', pretty(group.goLive)],
      [left >= 0 ? 'Days left to go live' : 'Days since the go-live date', plain.format(Math.abs(left))],
    ];
    if (group.appoint) lines.push(['Appoint a service provider by', pretty(group.appoint)]);
    if (r.implementation) lines.push(['Late implementation', aed(r.implementation)]);
    if (r.invoiceFine) lines.push(['Missed invoices (one month)', aed(r.invoiceFine)]);
    if (r.noteFine) lines.push(['Missed credit notes (one month)', aed(r.noteFine)]);
    if (r.notifyFine) lines.push(['Failure not reported', aed(r.notifyFine)]);
    return {
      total: r.amount,
      lines,
      note:
        r.amount === 0
          ? 'Enter a delay or missed documents to estimate the fines.'
          : 'Estimate of the listed fines only. The tax authority decides the actual penalty.',
    };
  },
};

function readForm(form) {
  const values = {};
  for (const el of form.elements) {
    if (el.name) values[el.name] = String(el.value).slice(0, 40);
  }
  return values;
}

function render(slip, form, result, title) {
  const totalEl = slip.querySelector('[data-out="total"]');
  const linesEl = slip.querySelector('[data-out="lines"]');
  const noteEl = slip.querySelector('[data-out="note"]');
  const errorEl = form.querySelector('[data-out="error"]');

  if (result.error) {
    errorEl.textContent = result.error;
    errorEl.hidden = false;
    slip.classList.add('is-stale');
    noteEl.textContent = 'Fix the highlighted input to update this result. The figures shown are from your last valid entry.';
    for (const btn of slip.querySelectorAll('.slip-actions button')) btn.disabled = true;
    return null;
  }
  errorEl.hidden = true;
  errorEl.textContent = '';
  slip.classList.remove('is-stale');
  for (const btn of slip.querySelectorAll('.slip-actions button')) btn.disabled = false;

  totalEl.textContent = signed(result.total);
  linesEl.replaceChildren();
  for (const [label, value] of result.lines) {
    const dt = document.createElement('dt');
    const dd = document.createElement('dd');
    dt.textContent = label;
    dd.textContent = value;
    const row = document.createElement('div');
    row.append(dt, dd);
    linesEl.append(row);
  }
  noteEl.textContent = result.note;

  const text = [title, `Total: ${signed(result.total)}`]
    .concat(result.lines.map(([l, val]) => `${l}: ${val}`))
    .concat(['Estimate from calculatoruae.ae. Not legal advice.'])
    .join('\n');
  return text;
}

function setUpTool(root) {
  const form = root.querySelector('form');
  const slip = root.querySelector('.slip');
  const run = tools[root.dataset.tool];
  if (!form || !slip || !run) return;
  const title = slip.querySelector('.slip-title').textContent;
  let summary = '';

  const today = new Date();
  const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  for (const el of form.querySelectorAll('input[data-default="today"]')) el.value = iso;

  const update = () => {
    const text = render(slip, form, run(readForm(form)), title);
    summary = text === null ? '' : text;
  };
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    update();
  });

  const copyBtn = slip.querySelector('[data-action="copy"]');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const original = copyBtn.textContent;
      try {
        if (!summary) return;
        await navigator.clipboard.writeText(summary);
        copyBtn.textContent = 'Copied';
      } catch {
        copyBtn.textContent = 'Copy not available';
      }
      setTimeout(() => {
        copyBtn.textContent = original;
      }, 1800);
    });
  }
  const printBtn = slip.querySelector('[data-action="print"]');
  if (printBtn) printBtn.addEventListener('click', () => window.print());

  // Leave estimator: fills the "unused days" field on request.
  const estimator = root.querySelector('[data-estimator]');
  if (estimator) {
    const out = estimator.querySelector('[data-out="estimate"]');
    const useBtn = estimator.querySelector('[data-action="use-estimate"]');
    let days = 0;
    const estimate = () => {
      const serviceMonths = estimator.querySelector('[name="serviceMonths"]').value || '0';
      const monthsThisYear = estimator.querySelector('[name="monthsThisYear"]').value || '0';
      const r = accruedLeaveDays({ serviceMonths, monthsThisYear });
      if (r.error) {
        out.textContent = r.error;
        useBtn.disabled = true;
        return;
      }
      days = r.days;
      useBtn.disabled = r.band === 'none';
      out.textContent =
        r.band === 'none'
          ? 'The law sets no leave figure for the first six months. Check your contract.'
          : r.band === 'monthly'
            ? `About ${plain.format(days)} days earned: 2 days for each month of service. Subtract any days you already took.`
            : `About ${plain.format(days)} days earned this leave year: 2.5 days a month. Add days carried over and subtract days taken.`;
    };
    estimator.addEventListener('input', estimate);
    estimator.addEventListener('change', estimate);
    useBtn.addEventListener('click', () => {
      form.elements.days.value = String(days);
      update();
      form.elements.days.focus();
    });
    estimate();
  }

  update();
  root.classList.add('is-ready');
}

for (const root of document.querySelectorAll('[data-tool]')) setUpTool(root);
