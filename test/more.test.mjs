import test from 'node:test';
import assert from 'node:assert/strict';
import { vat, loan, mortgage, carLoan, zakat, rentIncrease, overstayFine, einvoicePenalty, daysUntil } from '../src/calc.js';

test('VAT at 5%: add and remove', () => {
  assert.deepEqual(vat({ amount: 1000, mode: 'add' }), { net: 1000, vat: 50, gross: 1050 });
  assert.deepEqual(vat({ amount: 1050, mode: 'remove' }), { net: 1000, vat: 50, gross: 1050 });
  assert.equal(vat({ amount: 199, mode: 'remove' }).vat, 9.48);
  assert.ok(vat({ amount: 'x', mode: 'add' }).error);
  assert.ok(vat({ amount: 10, mode: 'other' }).error);
});

test('loan: reducing balance matches the standard formula', () => {
  // AED 1,000,000 over 25 years at 4.5%: 5,558.32 a month
  const r = loan({ principal: 1000000, annualRate: 4.5, months: 300 });
  assert.equal(r.monthly, 5558.32);
  assert.equal(loan({ principal: 12000, annualRate: 0, months: 12 }).monthly, 1000);
  assert.ok(loan({ principal: 1000, annualRate: 5, months: 0 }).error);
  assert.ok(loan({ principal: 1000, annualRate: 5, months: 12.5 }).error);
});

test('loan: flat rate charges interest on the full amount for the full term', () => {
  // AED 80,000 at 3% flat for 60 months: interest 12,000; payment 1,533.33
  const r = loan({ principal: 80000, annualRate: 3, months: 60, type: 'flat' });
  assert.equal(r.totalInterest, 12000);
  assert.equal(r.monthly, 1533.33);
});

test('mortgage: down payment minimums by buyer and price', () => {
  const ok = mortgage({ price: 1500000, downPercent: 20, annualRate: 4.5, years: 25, buyer: 'expatFirst' });
  assert.equal(ok.principal, 1200000);
  assert.equal(ok.monthly, 6669.99);
  assert.equal(ok.belowMinimum, false);
  assert.equal(mortgage({ price: 1500000, downPercent: 15, annualRate: 4.5, years: 25, buyer: 'expatFirst' }).belowMinimum, true);
  assert.equal(mortgage({ price: 1500000, downPercent: 15, annualRate: 4.5, years: 25, buyer: 'nationalFirst' }).belowMinimum, false);
  assert.equal(mortgage({ price: 6000000, downPercent: 25, annualRate: 4.5, years: 25, buyer: 'expatFirst' }).minDown, 30);
  assert.equal(mortgage({ price: 2000000, downPercent: 35, annualRate: 4.5, years: 20, buyer: 'expatSecond' }).belowMinimum, true);
  assert.ok(mortgage({ price: 1500000, downPercent: 20, annualRate: 4.5, years: 30, buyer: 'expatFirst' }).error);
  assert.ok(mortgage({ price: 1500000, downPercent: 20, annualRate: 4.5, years: 25, buyer: 'x' }).error);
});

test('car loan', () => {
  const r = carLoan({ price: 100000, downPayment: 20000, annualRate: 3, months: 60, type: 'flat' });
  assert.equal(r.monthly, 1533.33);
  assert.ok(carLoan({ price: 100000, downPayment: 120000, annualRate: 3, months: 60, type: 'flat' }).error);
});

test('zakat: 2.5% of net wealth at or above nisab, nothing below', () => {
  const base = { cash: 50000, gold: 20000, debts: 10000, metalPrice: 400, nisab: 'gold85', year: 'lunar' };
  const z = zakat(base);
  assert.equal(z.nisabValue, 34000);
  assert.equal(z.net, 60000);
  assert.equal(z.amount, 1500);
  assert.equal(zakat({ ...base, year: 'solar' }).amount, 1546.2);
  const below = zakat({ cash: 20000, metalPrice: 400, nisab: 'gold85', year: 'lunar' });
  assert.equal(below.due, false);
  assert.equal(below.amount, 0);
  assert.equal(zakat({ cash: 20000, metalPrice: 4, nisab: 'silver595', year: 'lunar' }).amount, 500);
  assert.equal(zakat({ cash: 5000, debts: 9000, metalPrice: 400, nisab: 'gold85', year: 'lunar' }).net, 0);
  assert.ok(zakat({ cash: 1, metalPrice: 0, nisab: 'gold85', year: 'lunar' }).error);
});

test('rent increase bands under Decree 43 of 2013', () => {
  const pct = (current, market) => rentIncrease({ currentRent: current, marketRent: market }).percent;
  assert.equal(pct(100000, 100000), 0);
  assert.equal(pct(120000, 100000), 0); // above market
  assert.equal(pct(90000, 100000), 0); // exactly 10% below
  assert.equal(pct(89000, 100000), 5);
  assert.equal(pct(80000, 100000), 5); // exactly 20%
  assert.equal(pct(75000, 100000), 10);
  assert.equal(pct(65000, 100000), 15);
  assert.equal(pct(60000, 100000), 15); // exactly 40%
  assert.equal(pct(50000, 100000), 20);
  const r = rentIncrease({ currentRent: 90000, marketRent: 110000 });
  assert.equal(r.percent, 5);
  assert.equal(r.maxRent, 94500);
  assert.ok(rentIncrease({ currentRent: 0, marketRent: 100 }).error);
});

test('overstay fine is AED 50 a day', () => {
  assert.equal(overstayFine({ days: 15 }).amount, 750);
  assert.equal(overstayFine({ days: 0 }).amount, 0);
  assert.ok(overstayFine({ days: 2.5 }).error);
  assert.ok(overstayFine({ days: -1 }).error);
});

test('e-invoicing penalties with monthly caps', () => {
  assert.equal(einvoicePenalty({ monthsLate: 3 }).amount, 15000);
  assert.equal(einvoicePenalty({ monthsLate: 0.5 }).amount, 5000); // part month counts
  assert.equal(einvoicePenalty({ invoices: 20 }).amount, 2000);
  assert.equal(einvoicePenalty({ invoices: 400 }).amount, 5000); // capped
  assert.equal(einvoicePenalty({ invoices: 400, creditNotes: 80 }).amount, 10000); // separate caps
  assert.equal(einvoicePenalty({ notifyDays: 4 }).amount, 4000);
  assert.equal(einvoicePenalty({ monthsLate: 2, invoices: 10, creditNotes: 5, notifyDays: 1 }).amount, 12500);
  assert.ok(einvoicePenalty({ monthsLate: -1 }).error);
});

test('daysUntil', () => {
  assert.equal(daysUntil('2027-07-01', '2026-11-13'), 230);
  assert.equal(daysUntil('2026-10-30', '2026-11-13'), -14);
  assert.equal(daysUntil('bad', '2026-11-13'), null);
});
