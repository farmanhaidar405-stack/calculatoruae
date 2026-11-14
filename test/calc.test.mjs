import test from 'node:test';
import assert from 'node:assert/strict';
import {
  toAmount,
  parseDate,
  servicePeriod,
  gratuity,
  gratuityFromYears,
  leaveSalary,
  accruedLeaveDays,
  noticePay,
  finalSettlement,
} from '../src/calc.js';

test('toAmount rejects anything that is not a plain non-negative number', () => {
  assert.equal(toAmount('5000'), 5000);
  assert.equal(toAmount('5,000.50'), 5000.5);
  assert.equal(toAmount(' 12 '), 12);
  for (const bad of ['', 'abc', '-5', '1e9', '5000<script>', '0x10', 'NaN', 'Infinity', '1.2.3', null, undefined, {}, [], NaN, Infinity, -1]) {
    assert.equal(toAmount(bad), null, `should reject ${String(bad)}`);
  }
  assert.equal(toAmount(10000001), null);
});

test('parseDate is strict', () => {
  assert.notEqual(parseDate('2024-02-29'), null);
  for (const bad of ['2023-02-29', '2024-13-01', '24-01-01', '2024/01/01', '', null, '2024-01-01T00:00', '1800-01-01']) {
    assert.equal(parseDate(bad), null, `should reject ${String(bad)}`);
  }
});

test('service period counts whole years by anniversary, last day included', () => {
  const p = servicePeriod('2020-01-01', '2022-12-31');
  assert.equal(p.years, 3);
  assert.equal(p.extraDays, 0);
  assert.equal(p.totalYears, 3);
  assert.equal(p.calendarDays, 1096);
  assert.ok(servicePeriod('2022-01-01', '2021-01-01').error);
  // leap-day start does not break anniversaries
  assert.equal(servicePeriod('2020-02-29', '2021-02-27').years, 1);
});

test('audit F-01: 365 counted days are one year, in a leap year too (Article 67)', () => {
  // 2024 is a leap year: 1 Jan to 30 Dec is 365 days, 1 Jan to 31 Dec is 366.
  const d364 = gratuity({ basic: 5000, start: '2024-01-01', end: '2024-12-29' });
  const d365 = gratuity({ basic: 5000, start: '2024-01-01', end: '2024-12-30' });
  const d366 = gratuity({ basic: 5000, start: '2024-01-01', end: '2024-12-31' });
  assert.equal(d364.period.calendarDays, 364);
  assert.equal(d364.amount, 0);
  assert.equal(d365.period.calendarDays, 365);
  assert.equal(d365.eligible, true);
  assert.equal(d365.amount, 3500);
  assert.equal(d366.amount, 3500);
  // non-leap year: 364 days no, 365 days yes
  assert.equal(gratuity({ basic: 5000, start: '2023-01-01', end: '2023-12-30' }).amount, 0);
  assert.equal(gratuity({ basic: 5000, start: '2023-01-01', end: '2023-12-31' }).amount, 3500);
  // a year that spans a 29 February (start 1 Mar 2023)
  assert.equal(gratuity({ basic: 5000, start: '2023-03-01', end: '2024-02-27' }).amount, 0);
  assert.equal(gratuity({ basic: 5000, start: '2023-03-01', end: '2024-02-28' }).amount, 3500);
  assert.equal(gratuity({ basic: 5000, start: '2023-03-01', end: '2024-02-29' }).amount, 3500);
});

test('audit A04: service never goes down when the last day moves later', () => {
  for (const start of ['2019-03-01', '2020-01-01', '2020-02-29', '2023-07-15', '2024-01-01']) {
    let previous = -1;
    const first = Date.parse(`${start}T00:00:00Z`);
    for (let i = 0; i < 1500; i += 1) {
      const end = new Date(first + i * 86400000).toISOString().slice(0, 10);
      const years = servicePeriod(start, end).totalYears;
      assert.ok(years >= previous, `${start} to ${end}`);
      previous = years;
    }
  }
});

test('audit F-06: unpaid days cannot exceed the days between the dates', () => {
  const r = gratuity({ basic: 5000, start: '2020-01-01', end: '2022-12-31', unpaidDays: 5000 });
  assert.match(r.error, /cannot be more than the 1096 days/);
  assert.equal(gratuity({ basic: 5000, start: '2020-01-01', end: '2022-12-31', unpaidDays: 1096 }).amount, 0);
});

test('gratuity: under one year is zero', () => {
  const g = gratuity({ basic: 8000, start: '2025-01-01', end: '2025-11-30' });
  assert.equal(g.eligible, false);
  assert.equal(g.amount, 0);
});

test('gratuity: exactly one year, 21 days of basic', () => {
  const g = gratuity({ basic: 3000, start: '2024-01-01', end: '2024-12-31' });
  assert.equal(g.eligible, true);
  assert.equal(g.amount, 2100);
});

test('gratuity: 3 years on AED 4,000 basic = AED 8,400', () => {
  const g = gratuity({ basic: 4000, start: '2020-01-01', end: '2022-12-31' });
  assert.equal(g.firstDays, 63);
  assert.equal(g.amount, 8400);
});

test('gratuity: exactly 5 years on AED 5,000 basic = AED 17,500', () => {
  const g = gratuity({ basic: 5000, start: '2019-06-01', end: '2024-05-31' });
  assert.equal(g.firstDays, 105);
  assert.equal(g.laterDays, 0);
  assert.equal(g.amount, 17500);
});

test('gratuity: 6 years on AED 10,000 basic = AED 45,000', () => {
  const g = gratuity({ basic: 10000, start: '2018-01-01', end: '2023-12-31' });
  assert.equal(g.firstDays + g.laterDays, 135);
  assert.equal(g.amount, 45000);
});

test('gratuity: 7 years on AED 10,000 basic = AED 55,000', () => {
  const g = gratuity({ basic: 10000, start: '2017-01-01', end: '2023-12-31' });
  assert.equal(g.amount, 55000);
});

test('gratuity: part years are pro-rated (2 years + 73 days = 2.2 years)', () => {
  const g = gratuity({ basic: 6000, start: '2021-01-01', end: '2023-03-14' });
  assert.equal(g.period.years, 2);
  assert.equal(g.period.extraDays, 73);
  assert.equal(g.amount, 9240);
});

test('gratuity: unpaid absence days are removed from service', () => {
  const full = gratuity({ basic: 6000, start: '2021-01-01', end: '2023-03-14' });
  const less = gratuity({ basic: 6000, start: '2021-01-01', end: '2023-03-14', unpaidDays: 73 });
  assert.equal(less.amount, 8400);
  assert.ok(less.amount < full.amount);
  // unpaid days can push service under one year
  const none = gratuity({ basic: 6000, start: '2024-01-01', end: '2024-12-31', unpaidDays: 10 });
  assert.equal(none.amount, 0);
});

test('gratuity: capped at two years of wage', () => {
  // 5 yrs = 105 days, then 30/yr. Cap 720 days reached at 25.5 years.
  const g = gratuityFromYears(10000, 30);
  assert.equal(g.capped, true);
  assert.equal(g.amount, 240000);
  assert.equal(g.uncapped, 285000); // audit F-05: the figure before the limit is kept
  const under = gratuityFromYears(10000, 25);
  assert.equal(under.capped, false);
  assert.equal(under.amount, 235000);
});

test('gratuity: bad input returns an error, never NaN', () => {
  assert.ok(gratuity({ basic: 'abc', start: '2020-01-01', end: '2022-01-01' }).error);
  assert.ok(gratuity({ basic: 5000, start: 'x', end: '2022-01-01' }).error);
  assert.ok(gratuity({ basic: 5000, start: '2020-01-01', end: '2022-01-01', unpaidDays: -3 }).error);
});

test('leave salary uses basic / 30', () => {
  assert.equal(leaveSalary({ basic: 6000, unusedDays: 12 }).amount, 2400);
  assert.equal(leaveSalary({ basic: 4500, unusedDays: 0 }).amount, 0);
  assert.equal(leaveSalary({ basic: 5000, unusedDays: 7.5 }).amount, 1250);
  assert.ok(leaveSalary({ basic: 5000, unusedDays: -1 }).error);
});

test('audit F-02: leave accrual band comes from total service', () => {
  assert.deepEqual(accruedLeaveDays({ serviceMonths: 4 }), { band: 'none', days: 0 });
  assert.deepEqual(accruedLeaveDays({ serviceMonths: 6 }), { band: 'none', days: 0 });
  assert.deepEqual(accruedLeaveDays({ serviceMonths: 8 }), { band: 'monthly', days: 16 });
  assert.deepEqual(accruedLeaveDays({ serviceMonths: 11 }), { band: 'monthly', days: 22 });
  // exactly one year is the 30-day entitlement, never 24
  assert.deepEqual(accruedLeaveDays({ serviceMonths: 12, monthsThisYear: 12 }), { band: 'annual', days: 30 });
  assert.deepEqual(accruedLeaveDays({ serviceMonths: 40, monthsThisYear: 6 }), { band: 'annual', days: 15 });
  assert.ok(accruedLeaveDays({ serviceMonths: 40, monthsThisYear: 13 }).error);
  assert.ok(accruedLeaveDays({ serviceMonths: 12, monthsThisYear: 20 }).error);
  assert.ok(accruedLeaveDays({ serviceMonths: 'x' }).error);
});

test('notice pay uses total wage / 30 for unserved days', () => {
  assert.equal(noticePay({ monthlyWage: 18000, noticeDays: 30, servedDays: 0 }).amount, 18000);
  assert.equal(noticePay({ monthlyWage: 18000, noticeDays: 30, servedDays: 10 }).amount, 12000);
  assert.equal(noticePay({ monthlyWage: 9000, noticeDays: 90, servedDays: 90 }).amount, 0);
  assert.equal(noticePay({ monthlyWage: 9000, noticeDays: 60, servedDays: 45 }).amount, 4500);
});

test('audit F-07: impossible notice inputs are rejected', () => {
  assert.match(noticePay({ monthlyWage: 9000, noticeDays: 30, servedDays: 45 }).error, /cannot be more/);
  assert.match(noticePay({ monthlyWage: 9000, noticeDays: 0 }).error, /30 to 90/);
  assert.match(noticePay({ monthlyWage: 9000, noticeDays: 14 }).error, /30 to 90/);
  assert.match(noticePay({ monthlyWage: 9000, noticeDays: 120 }).error, /30 to 90/);
});

test('final settlement adds and subtracts every line', () => {
  const s = finalSettlement({
    basic: 6000,
    allowances: 3000,
    start: '2020-01-01',
    end: '2022-12-31',
    unpaidDays: 0,
    unusedLeaveDays: 10,
    unpaidSalaryDays: 15,
    noticeDirection: 'employerOwes',
    unservedNoticeDays: 30,
    otherAdditions: 500,
    otherDeductions: 1000,
  });
  // gratuity 12,600 + leave 2,000 + notice 9,000 + salary 4,500 + 500 - 1,000
  assert.equal(s.gratuity.amount, 12600);
  assert.equal(s.leave.amount, 2000);
  assert.equal(s.noticeAmount, 9000);
  assert.equal(s.unpaidSalary, 4500);
  assert.equal(s.total, 27600);

  const owed = finalSettlement({
    basic: 6000,
    allowances: 3000,
    start: '2020-01-01',
    end: '2022-12-31',
    noticeDirection: 'employeeOwes',
    unservedNoticeDays: 30,
  });
  assert.equal(owed.noticeAmount, -9000);
  assert.equal(owed.total, 3600);

  assert.ok(finalSettlement({ basic: 6000, start: '2020-01-01', end: '2022-12-31', noticeDirection: 'hack' }).error);
});

test('audit F-09: a full unpaid month is one month of wage, not 31 days', () => {
  const base = { basic: 6000, allowances: 3000, start: '2020-01-01', end: '2022-12-31', noticeDirection: 'none' };
  assert.equal(finalSettlement({ ...base, unpaidSalaryMonths: 1 }).unpaidSalary, 9000);
  assert.equal(finalSettlement({ ...base, unpaidSalaryMonths: 2, unpaidSalaryDays: 10 }).unpaidSalary, 21000);
  assert.match(finalSettlement({ ...base, unpaidSalaryDays: 31 }).error, /0 to 30/);
  assert.ok(finalSettlement({ ...base, unpaidSalaryMonths: 1.5 }).error);
});

test('audit F-05: both readings of the two-year limit are reported', () => {
  const s = finalSettlement({
    basic: 10000,
    allowances: 5000,
    start: '1996-01-01',
    end: '2025-12-31',
    noticeDirection: 'none',
  });
  assert.equal(s.gratuity.capped, true);
  assert.equal(s.gratuity.amount, 240000); // 24 months of basic
  assert.equal(s.gratuity.uncapped, 285000);
  assert.equal(s.gratuityTotalWageCap, 285000); // 24 months of total wage = 360,000, above uncapped
});
