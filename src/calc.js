// Pure calculation logic for calculatoruae.ae. No DOM access here, so every
// rule can be unit-tested. Rules and sources: see RULES_VERIFICATION.md.

export const RULES = Object.freeze({
  lastChecked: '2026-11-13',
  daysInMonth: 30, // the law treats a month as 30 days
  daysInYear: 365, // and a year as 365 days
  gratuity: Object.freeze({
    minYears: 1,
    firstTierYears: 5,
    firstTierDays: 21,
    laterDays: 30,
    capMonths: 24, // "two years' wage"
  }),
  leave: Object.freeze({ daysPerYear: 30, daysPerMonthSixToTwelve: 2 }),
  notice: Object.freeze({ minDays: 30, maxDays: 90 }),
});

export const LIMITS = Object.freeze({
  maxMoney: 10000000,
  maxDays: 36500,
});

const DAY_MS = 86400000;

export function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

// Accepts only a finite, non-negative number within a limit. Anything else
// (text, NaN, Infinity, negatives, absurd sizes) is rejected, never coerced.
export function toAmount(value, max = LIMITS.maxMoney) {
  if (typeof value === 'string') {
    const cleaned = value.trim().replace(/,/g, '');
    if (!/^\d+(\.\d+)?$/.test(cleaned)) return null;
    value = Number(cleaned);
  }
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  if (value < 0 || value > max) return null;
  return value;
}

// Strict YYYY-MM-DD parser. Returns a UTC timestamp or null.
export function parseDate(text) {
  if (typeof text !== 'string') return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (y < 1950 || y > 2100) return null;
  const t = Date.UTC(y, mo - 1, d);
  const check = new Date(t);
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== mo - 1 || check.getUTCDate() !== d) {
    return null;
  }
  return t;
}

function addYears(t, years) {
  const d = new Date(t);
  const y = d.getUTCFullYear() + years;
  const mo = d.getUTCMonth();
  const day = d.getUTCDate();
  const out = new Date(Date.UTC(y, mo, day));
  // 29 Feb in a non-leap year rolls to 1 Mar; pull back to 28 Feb.
  if (out.getUTCMonth() !== mo) return Date.UTC(y, mo + 1, 0);
  return out.getTime();
}

// Service from the first day to the last working day, both included.
//
// Date convention (Article 67: a year is 365 days, a month is 30 days):
//   1. Whole years are counted by anniversary of the start date.
//   2. The days left over are divided by 365, never by 366.
//   3. So 365 counted days always equal one full year, in a leap year too.
// Unpaid absence days (Article 51(4)) are taken off at 1/365 of a year each.
export function servicePeriod(startText, endText, unpaidDays = 0) {
  const start = parseDate(startText);
  const end = parseDate(endText);
  const unpaid = toAmount(unpaidDays, LIMITS.maxDays);
  if (start === null) return { error: 'Enter a valid start date.' };
  if (end === null) return { error: 'Enter a valid last working day.' };
  if (unpaid === null) return { error: 'Unpaid absence days must be zero or more.' };
  if (end < start) return { error: 'The last working day is before the start date.' };

  const endExclusive = end + DAY_MS;
  const calendarDays = Math.round((endExclusive - start) / DAY_MS);
  if (unpaid > calendarDays) {
    return {
      error: `Unpaid absence days cannot be more than the ${calendarDays} days between your dates.`,
    };
  }
  let years = 0;
  while (years < 100 && addYears(start, years + 1) <= endExclusive) years += 1;
  const extraDays = Math.round((endExclusive - addYears(start, years)) / DAY_MS);
  const fraction = Math.min(extraDays, RULES.daysInYear) / RULES.daysInYear;
  const totalYears = Math.max(years + fraction - unpaid / RULES.daysInYear, 0);
  return { years, extraDays, calendarDays, unpaidDays: unpaid, totalYears };
}

// Article 51, Federal Decree-Law No. 33 of 2021.
export function gratuityFromYears(basicMonthly, totalYears) {
  const basic = toAmount(basicMonthly);
  if (basic === null) return { error: 'Enter your monthly basic salary in AED.' };
  if (typeof totalYears !== 'number' || !Number.isFinite(totalYears) || totalYears < 0) {
    return { error: 'Service length is not valid.' };
  }
  const g = RULES.gratuity;
  const dailyWage = basic / RULES.daysInMonth;
  const eligible = totalYears >= g.minYears;
  const firstYears = eligible ? Math.min(totalYears, g.firstTierYears) : 0;
  const laterYears = eligible ? Math.max(totalYears - g.firstTierYears, 0) : 0;
  const firstDays = firstYears * g.firstTierDays;
  const laterDays = laterYears * g.laterDays;
  const uncapped = dailyWage * (firstDays + laterDays);
  const cap = basic * g.capMonths;
  const capped = uncapped > cap;
  return {
    eligible,
    totalYears,
    dailyWage: round2(dailyWage),
    firstYears,
    laterYears,
    firstDays: round2(firstDays),
    laterDays: round2(laterDays),
    firstAmount: round2(dailyWage * firstDays),
    laterAmount: round2(dailyWage * laterDays),
    uncapped: round2(uncapped),
    cap: round2(cap),
    capped,
    amount: round2(capped ? cap : uncapped),
  };
}

export function gratuity({ basic, start, end, unpaidDays = 0 }) {
  const period = servicePeriod(start, end, unpaidDays);
  if (period.error) return period;
  const result = gratuityFromYears(basic, period.totalYears);
  if (result.error) return result;
  return { ...result, period };
}

// Article 29(9) and Cabinet Resolution No. 1 of 2022, Article 19:
// unused leave at the end of service is paid on the basic wage.
export function leaveSalary({ basic, unusedDays }) {
  const b = toAmount(basic);
  const days = toAmount(unusedDays, 1000);
  if (b === null) return { error: 'Enter your monthly basic salary in AED.' };
  if (days === null) return { error: 'Unused leave days must be between 0 and 1,000.' };
  const dailyWage = b / RULES.daysInMonth;
  return { dailyWage: round2(dailyWage), days, amount: round2(dailyWage * days) };
}

// Article 29(1): (a) 30 days for each year of service; (b) 2 days a month when
// service is more than six months but less than one year. Six months or less:
// the law sets no figure. The band is worked out from total service, so the
// two inputs cannot contradict each other.
export function accruedLeaveDays({ serviceMonths, monthsThisYear = 0 }) {
  const total = toAmount(serviceMonths, 720);
  if (total === null) return { error: 'Total months with this employer must be between 0 and 720.' };
  if (total <= 6) return { band: 'none', days: 0 };
  if (total < 12) return { band: 'monthly', days: round2(total * RULES.leave.daysPerMonthSixToTwelve) };
  const current = toAmount(monthsThisYear, 12);
  if (current === null) return { error: 'Months in the current leave year must be between 0 and 12.' };
  if (current > total) return { error: 'Months in the current leave year cannot exceed total months.' };
  return { band: 'annual', days: round2((current * RULES.leave.daysPerYear) / 12) };
}

// Article 43(3)-(4): the notice period allowance equals the last wage (basic
// plus allowances) for the part of the notice period that was not served.
// Article 43(1): the contract notice period is 30 to 90 days.
export function noticePay({ monthlyWage, noticeDays, servedDays = 0 }) {
  const wage = toAmount(monthlyWage);
  const notice = toAmount(noticeDays, 100000);
  const served = toAmount(servedDays, 100000);
  if (wage === null) return { error: 'Enter your total monthly salary in AED.' };
  if (notice === null || notice < RULES.notice.minDays || notice > RULES.notice.maxDays) {
    return { error: 'After probation, the contract notice period must be 30 to 90 days.' };
  }
  if (served === null) return { error: 'Notice days served must be zero or more.' };
  if (served > notice) return { error: 'Notice days served cannot be more than the notice period.' };
  const unserved = notice - served;
  const dailyWage = wage / RULES.daysInMonth;
  return {
    dailyWage: round2(dailyWage),
    unservedDays: unserved,
    amount: round2(dailyWage * unserved),
  };
}

export function finalSettlement(input) {
  const basic = toAmount(input.basic);
  const allowances = toAmount(input.allowances ?? 0);
  const salaryMonths = toAmount(input.unpaidSalaryMonths ?? 0, 24);
  const salaryDays = toAmount(input.unpaidSalaryDays ?? 0, 30);
  const additions = toAmount(input.otherAdditions ?? 0);
  const deductions = toAmount(input.otherDeductions ?? 0);
  if (basic === null) return { error: 'Enter your monthly basic salary in AED.' };
  if (allowances === null) return { error: 'Monthly allowances must be zero or more.' };
  if (salaryMonths === null || !Number.isInteger(salaryMonths)) {
    return { error: 'Full unpaid months must be a whole number from 0 to 24.' };
  }
  if (salaryDays === null) {
    return { error: 'Extra unpaid days must be 0 to 30. Enter a full month as 1 month.' };
  }
  if (additions === null) return { error: 'Other amounts owed to you must be zero or more.' };
  if (deductions === null) return { error: 'Deductions must be zero or more.' };
  if (!['none', 'employerOwes', 'employeeOwes'].includes(input.noticeDirection)) {
    return { error: 'Choose a notice option.' };
  }

  const g = gratuity({
    basic,
    start: input.start,
    end: input.end,
    unpaidDays: input.unpaidDays ?? 0,
  });
  if (g.error) return g;
  const leave = leaveSalary({ basic, unusedDays: input.unusedLeaveDays ?? 0 });
  if (leave.error) return leave;

  const totalWage = basic + allowances;
  const dailyWage = totalWage / RULES.daysInMonth;
  let noticeAmount = 0;
  if (input.noticeDirection !== 'none') {
    const unserved = toAmount(input.unservedNoticeDays ?? 0, RULES.notice.maxDays);
    if (unserved === null) return { error: 'Notice days not served must be between 0 and 90.' };
    const amount = round2(dailyWage * unserved);
    noticeAmount = input.noticeDirection === 'employerOwes' ? amount : -amount;
  }
  // A full unpaid month is one month's wage, whatever its length in days.
  // Part months use the 30-day convention of Article 67.
  const unpaidSalary = round2(totalWage * salaryMonths + dailyWage * salaryDays);
  const total = round2(
    g.amount + leave.amount + noticeAmount + unpaidSalary + additions - deductions,
  );
  // The same gratuity if the two-year limit is read on total wage instead.
  const gratuityTotalWageCap = round2(Math.min(g.uncapped, totalWage * RULES.gratuity.capMonths));
  return {
    gratuity: g,
    gratuityTotalWageCap,
    leave,
    noticeAmount,
    unpaidSalary,
    additions,
    deductions,
    total,
  };
}

// ====================== Money, housing, business, visa ======================

export const MORE_RULES = Object.freeze({
  vatRate: 5, // Federal Decree-Law No. 8 of 2017
  overstayPerDay: 50, // ICP standard daily fine
  zakat: Object.freeze({ lunar: 2.5, solar: 2.577 }),
  nisabGrams: Object.freeze({ gold85: 85, gold8748: 87.48, silver595: 595, silver61236: 612.36 }),
  // Dubai Decree No. 43 of 2013, Article 1: [rent is up to X% below average, max increase %]
  rentBands: Object.freeze([
    [10, 0],
    [20, 5],
    [30, 10],
    [40, 15],
    [Infinity, 20],
  ]),
  // Central Bank mortgage regulations: minimum down payment % by buyer and price
  mortgage: Object.freeze({
    threshold: 5000000,
    maxYears: 25,
    minDown: Object.freeze({
      expatFirst: [20, 30],
      nationalFirst: [15, 25],
      expatSecond: [40, 40],
      nationalSecond: [35, 35],
    }),
  }),
  // Cabinet Decision No. 106 of 2025
  einvoice: Object.freeze({
    perMonthNotImplemented: 5000,
    perDocument: 100,
    documentCapPerMonth: 5000,
    perDayNotNotified: 1000,
    groups: Object.freeze({
      large: Object.freeze({ goLive: '2027-01-01', appoint: '2026-10-30' }),
      small: Object.freeze({ goLive: '2027-07-01', appoint: '2027-03-31' }),
      government: Object.freeze({ goLive: '2027-10-01', appoint: null }),
    }),
  }),
});

export function vat({ amount, mode }) {
  const a = toAmount(amount, 1000000000);
  if (a === null) return { error: 'Enter an amount in AED.' };
  const rate = MORE_RULES.vatRate / 100;
  if (mode === 'add') return { net: round2(a), vat: round2(a * rate), gross: round2(a * (1 + rate)) };
  if (mode === 'remove') {
    const net = a / (1 + rate);
    return { net: round2(net), vat: round2(a - net), gross: round2(a) };
  }
  return { error: 'Choose whether to add or remove VAT.' };
}

// Reducing-balance or flat-rate instalment loan.
export function loan({ principal, annualRate, months, type = 'reducing' }) {
  const p = toAmount(principal, 1000000000);
  const rate = toAmount(annualRate, 100);
  const n = toAmount(months, 600);
  if (p === null) return { error: 'Loan amount is not valid.' };
  if (rate === null) return { error: 'Interest rate must be between 0 and 100.' };
  if (n === null || n < 1 || !Number.isInteger(n)) return { error: 'Loan term must be a whole number of months.' };
  let monthly;
  if (type === 'flat') {
    monthly = (p + p * (rate / 100) * (n / 12)) / n;
  } else if (type === 'reducing') {
    const r = rate / 100 / 12;
    monthly = r === 0 ? p / n : (p * r) / (1 - (1 + r) ** -n);
  } else {
    return { error: 'Choose a rate type.' };
  }
  const totalPaid = monthly * n;
  return {
    principal: round2(p),
    monthly: round2(monthly),
    totalPaid: round2(totalPaid),
    totalInterest: round2(totalPaid - p),
  };
}

export function mortgage({ price, downPercent, annualRate, years, buyer }) {
  const value = toAmount(price, 1000000000);
  const down = toAmount(downPercent, 100);
  const y = toAmount(years, MORE_RULES.mortgage.maxYears);
  if (value === null || value === 0) return { error: 'Enter the property price in AED.' };
  if (down === null) return { error: 'Down payment must be between 0 and 100 percent.' };
  if (y === null || y < 1 || !Number.isInteger(y)) return { error: 'Term must be 1 to 25 whole years.' };
  const mins = MORE_RULES.mortgage.minDown[buyer];
  if (!mins) return { error: 'Choose a buyer type.' };
  const minDown = value > MORE_RULES.mortgage.threshold ? mins[1] : mins[0];
  const downAmount = (value * down) / 100;
  const result = loan({ principal: value - downAmount, annualRate, months: y * 12 });
  if (result.error) return result;
  return { ...result, downAmount: round2(downAmount), minDown, belowMinimum: down < minDown };
}

export function carLoan({ price, downPayment, annualRate, months, type }) {
  const value = toAmount(price, 100000000);
  const down = toAmount(downPayment, 100000000);
  if (value === null || value === 0) return { error: 'Enter the car price in AED.' };
  if (down === null) return { error: 'Down payment must be zero or more.' };
  if (down > value) return { error: 'The down payment is more than the car price.' };
  return loan({ principal: value - down, annualRate, months: toAmount(months, 600), type });
}

export function zakat(input) {
  const names = ['cash', 'gold', 'silver', 'investments', 'business', 'receivables', 'debts'];
  const v = {};
  for (const name of names) {
    v[name] = toAmount(input[name] ?? 0, 1000000000000);
    if (v[name] === null) return { error: 'Each amount must be zero or more, in AED.' };
  }
  const price = toAmount(input.metalPrice, 1000000);
  if (price === null || price === 0) return { error: 'Enter today\'s price per gram of the metal.' };
  const grams = MORE_RULES.nisabGrams[input.nisab];
  if (!grams) return { error: 'Choose a nisab standard.' };
  const rate = MORE_RULES.zakat[input.year];
  if (!rate) return { error: 'Choose a lunar or solar year.' };
  const assets = v.cash + v.gold + v.silver + v.investments + v.business + v.receivables;
  const net = Math.max(assets - v.debts, 0);
  const nisabValue = grams * price;
  const due = net >= nisabValue;
  return {
    assets: round2(assets),
    net: round2(net),
    nisabValue: round2(nisabValue),
    rate,
    due,
    amount: due ? round2((net * rate) / 100) : 0,
  };
}

// Dubai Decree No. 43 of 2013.
export function rentIncrease({ currentRent, marketRent }) {
  const current = toAmount(currentRent, 1000000000);
  const market = toAmount(marketRent, 1000000000);
  if (current === null || current === 0) return { error: 'Enter your current yearly rent in AED.' };
  if (market === null || market === 0) return { error: 'Enter the average rent from the rental index in AED.' };
  const gap = ((market - current) / market) * 100;
  const band = MORE_RULES.rentBands.find(([limit]) => gap <= limit);
  const percent = gap <= 0 ? 0 : band[1];
  const increase = (current * percent) / 100;
  return {
    gapPercent: round2(gap),
    percent,
    increase: round2(increase),
    maxRent: round2(current + increase),
  };
}

export function overstayFine({ days }) {
  const d = toAmount(days, LIMITS.maxDays);
  if (d === null || !Number.isInteger(d)) return { error: 'Enter a whole number of overstay days.' };
  return { days: d, perDay: MORE_RULES.overstayPerDay, amount: d * MORE_RULES.overstayPerDay };
}

export function daysUntil(dateText, todayText) {
  const target = parseDate(dateText);
  const today = parseDate(todayText);
  if (target === null || today === null) return null;
  return Math.round((target - today) / DAY_MS);
}

export function einvoicePenalty({ monthsLate = 0, invoices = 0, creditNotes = 0, notifyDays = 0 }) {
  const e = MORE_RULES.einvoice;
  const months = toAmount(monthsLate, 120);
  const inv = toAmount(invoices, 100000000);
  const notes = toAmount(creditNotes, 100000000);
  const days = toAmount(notifyDays, 3660);
  if (months === null) return { error: 'Months late must be between 0 and 120.' };
  if (inv === null || notes === null) return { error: 'Document counts must be zero or more.' };
  if (days === null) return { error: 'Days must be zero or more.' };
  const implementation = Math.ceil(months) * e.perMonthNotImplemented; // part months count in full
  const invoiceFine = Math.min(Math.floor(inv) * e.perDocument, e.documentCapPerMonth);
  const noteFine = Math.min(Math.floor(notes) * e.perDocument, e.documentCapPerMonth);
  const notifyFine = Math.ceil(days) * e.perDayNotNotified;
  return {
    implementation,
    invoiceFine,
    noteFine,
    notifyFine,
    amount: implementation + invoiceFine + noteFine + notifyFine,
  };
}
