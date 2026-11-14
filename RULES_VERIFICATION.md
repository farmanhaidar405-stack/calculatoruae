# Rules verification

Checked: 13 November 2026.

**Update, 14 November 2026.** The official English text of Federal Decree-Law
No. 33 of 2021 (PDF on u.ae, the UAE Government portal) was opened and Articles
1, 29, 43, 51, 53, 65 and 67 were read. Rows 1 to 15 below now rest on that
text, except where marked. Cabinet Resolution No. 1 of 2022 (Articles 19 and 29)
was NOT opened; rows that depend on it still rest on secondary sources.

Official text: https://u.ae/-/media/Mohre-2024/Federal-DecreeLaw-No-33-of-2021-Regarding-the-Regulation-of-Employment-Relationship-and-its-amendmen.pdf

This is still not a legal opinion. A UAE labour lawyer should sign off the open
points (A, C and the notice-waiver wording) before the site is described as
legally verified.

## Response to the independent audit of 14 November 2026

| Finding | Verdict | What was done |
|---|---|---|
| F-01 leap-year service count | Correct. Art 67 fixes a year at 365 days; the code divided by 366 in leap years | Remainder days are now divided by 365, never 366, so 365 counted days are always one year. Result shows calendar days counted. 3 regression tests |
| F-02 leave helper gives 24 days at 12 months | Correct | Band select removed. The helper takes total months and derives the band: 6 or less none, over 6 and under 12 two days a month, 12 or more 2.5 days a month |
| F-03 "nobody pays" on agreed waiver | Correct. Art 43(2) keeps the worker's rights for the contract notice period | Table, FAQ and a new section reworded |
| F-04 public holidays | Correct. Art 29(7) counts holidays inside annual leave as part of it unless the contract is more generous | Line replaced; sick leave separated |
| F-05 cap on basic vs total wage | Valid and unresolved. Art 51(6) says "two years' wage"; Art 1 defines "wage" as basic plus allowances | Headline still uses 24 months of basic (lower figure). Result now also shows the amount before the limit, and the settlement tool shows the total-wage reading. Page text states the ambiguity. NEEDS LEGAL SIGN-OFF |
| F-06 unpaid days above service | Correct | Rejected with an error naming the day count |
| F-07 impossible notice inputs | Correct | Served above notice rejected; notice outside 30 to 90 rejected |
| F-08 deductions not validated | Correct | Field and result line labelled as unchecked; new Deductions section citing Art 51(7); negative total carries a warning |
| F-09 31 days pays more than a month | Correct | Split into full unpaid months (at the monthly wage) and extra days (0 to 30) |
| F-10 effect of signing | Correct. Art 65(3) voids waivers that breach the law | Text rewritten |
| F-11 no primary-source check | Correct at the time | Official law text now read (see above). Regulations still to check |
| F-12 beta.government.ae link | Correct | Replaced with the u.ae PDF and the two uaelegislation.gov.ae pages the audit names. The uaelegislation links were not opened from the build environment; click them once |
| F-13 savings scheme not asked | Reasonable | Question added to the gratuity and settlement forms; a "yes or not sure" answer changes the result note |
| F-14 stale result can be copied | Correct | Copy and print are disabled while an input is invalid and the note says the figures are from the last valid entry |

Not applied: the audit suggests Cabinet Resolution No. 96 of 2023 as the scheme
reference. That number was not confirmed here, so the page cites Art 51(8) only.

The audit covered the four Work calculators only. The seven calculators added
later (rent, mortgage, car loan, VAT, zakat, overstay, e-invoicing) have not
been independently audited.

## Not built, on purpose

- **Domestic worker gratuity.** Sources conflict. Some say 14 days per year;
  a UAE law firm says the 2022 domestic workers law removed the old 14-day rule
  and no replacement has been issued; another site gives a third formula.
  No calculator was built. The gratuity page says the tool does not cover them.
- **DIFC, JAFZA, DMCC, DDA gratuity pages.** DIFC and ADGM have their own
  employment rules; other free zones generally follow the federal law, so
  separate pages would repeat the same calculation. Not built.

## Rules in the calculators

| # | Rule | Where | Confirmed from | Status |
|---|---|---|---|---|
| 1 | Gratuity needs 1+ year continuous service (foreign full-time worker) | Art 51(2) | Official text, Art 51(2) | Official |
| 2 | 21 days basic wage per year, first 5 years; 30 days per year after | Art 51(2) | Official text, Art 51(2) | Official |
| 3 | Part years pro-rated after first year | Art 51(3) | Official text | Official |
| 4 | Unpaid absence days excluded from service | Art 51(4) | Official text | Official |
| 5 | Based on last basic wage | Art 51(5) | Official text | Official |
| 6 | Total capped at two years' wage | Art 51(6) | Official text | Official; see open point A |
| 7 | Month = 30 days, year = 365 days | Art 67 | Official text | Official |
| 8 | No reduction for resignation | Art 51 | Official text (no resignation reduction in Art 51) | Official |
| 9 | Annual leave 30 days for each year; 2 days/month when service is over 6 months and under 1 year | Art 29(1) | Official text | Official |
| 10 | Unused leave at end of service paid on basic wage, incl. part year | Art 29(9); Cabinet Res 1/2022 Art 19 | Official text for Art 29(9); regulations Art 19 not opened | Official / secondary |
| 11 | Leave actually taken is paid at full wage | Art 29 | Gulf News | Secondary |
| 12 | Notice 30 to 90 days | Art 43(1) | Official text | Official |
| 13 | Notice allowance = wage for unserved part, on last wage (total) | Art 43(3),(4) | Official text | Official |
| 14 | One unpaid day off per week to job-hunt if employer terminated | Art 43(5) | Official text | Official |
| 15 | End of service dues payable within 14 days | Art 53 | Official text | Official |

## Stated in page text from general knowledge, not confirmed in this build

Check these lines or remove them:

- The old 1980 law's resignation reductions (one third for 1-3 years, two thirds
  for 3-5 years). Guide: gratuity on resignation.
- Article 44 (dismissal without notice), Article 45 (employee leaving without
  notice), Article 9 (probation notice) are named but their details are not used.
- "The current law has been in force since 2 February 2022" (Xero states this).
- DIFC and ADGM have their own employment regulations.
- An approved alternative end-of-service savings scheme exists (Art 51(8) lets
  Cabinet create alternative systems).

## Open points where the calculator makes a choice

- **A. The cap.** Art 51(6) says "two years' wage"; Art 1 defines "wage" as
  basic plus allowances, which supports a total-wage reading. The calculator
  still headlines 24 months of basic salary (the lower figure) and shows the
  uncapped amount beside it. It only bites at about 25.5 years of service.
  Needs legal sign-off; if the total-wage reading is confirmed, change
  `capMonths` handling in `gratuityFromYears`.
- **B. "21 days".** Applied as basic ÷ 30 × 21, the standard method in every
  source checked. A legal alert (Afridi & Angell, Dec 2021) notes the wording
  was clarified from "working days" to calendar days of basic wage.
- **C. Part years.** Whole years are counted by anniversary; the remainder is
  divided by 365 (Art 67), never 366, so 365 counted days are one full year.
  Unpaid days are divided by 365. This is one reasonable convention; MOHRE's
  own method was not confirmed.
- **D. Service count.** The last working day is included.
- **E. Leave under 6 months.** The law sets no figure; the estimator returns 0
  and tells the user to check the contract.

## Official links used on the site

- https://u.ae/-/media/Mohre-2024/Federal-DecreeLaw-No-33-of-2021-Regarding-the-Regulation-of-Employment-Relationship-and-its-amendmen.pdf (opened and read)
- https://uaelegislation.gov.ae/en/legislations/1541 and /1547 (from the audit; not opened here)
- https://www.mohre.gov.ae/

## Calculators added in the second batch

| # | Rule | Where | Confirmed from | Status |
|---|---|---|---|---|
| 16 | Dubai rent increase bands: 0 / 5 / 10 / 15 / 20% for rent up to 10 / 11-20 / 21-30 / 31-40 / over 40% below average | Decree No. 43 of 2013, Art 1 | DLD decree PDF (partial), Al Tamimi, Gulf News, Property Finder | Official text partly seen; secondary sources agree |
| 17 | 90 days written notice before renewal | Law 26 of 2007 as amended by Law 33 of 2008 | Khaleej Times, Haus & Haus | Secondary |
| 18 | Overstay fine AED 50 a day for visit, tourist and residence visas | ICP | Gulf News, Emirates 24/7 (July 2026), Wego | Secondary |
| 19 | E-invoicing fines: AED 5,000 per month; AED 100 per invoice and per credit note, each capped at AED 5,000 a month; AED 1,000 a day for not reporting a system failure | Cabinet Decision No. 106 of 2025 | Ministry of Finance news page, RSM, ClearTax | First three from the official MoF page; the AED 1,000 a day line from secondary sources |
| 20 | E-invoicing go-live: 1 Jan 2027 (revenue AED 50m+), 1 Jul 2027 (others), 1 Oct 2027 (government) | Ministerial Decision No. 244 of 2025 | KPMG, e-invoice.app | Secondary |
| 21 | Provider appointment deadlines: 31 Mar 2027 (under AED 50m); 30 Oct 2026 (AED 50m+, after an extension announced May 2026) | MD 244 as amended | KPMG; e-invoice.app only for the extension | **The 30 Oct 2026 date has one source. Confirm or remove.** |
| 22 | Mortgage minimum down payment: expat 20% / 30% / 40%; UAE national 15% / 25% / 35% (first home up to AED 5m / above / second or investment); maximum term 25 years | Central Bank mortgage regulations | Central Bank Rulebook (partial), several brokers | **Sources conflict.** Older articles give 25% for expats on a first home; the Rulebook extract and recent sources give 20%. Confirm on rulebook.centralbank.ae |
| 23 | Zakat: 2.5% lunar, 2.577% solar; nisab 85 g gold or 595 g silver (alternative 87.48 g / 612.36 g) | Awqaf guidance; AAOIFI Standard 35 | Arabic bullion article citing Awqaf, Alaan, Amal Invest | Secondary |
| 24 | VAT standard rate 5% | Federal Decree-Law No. 8 of 2017 | General knowledge | Not re-checked in this build |

### Open points in the second batch

- **F. Rent gap between 10% and 11%.** The decree says "up to 10%" then "11% to 20%". The calculator treats anything above 10% as the 5% band.
- **G. Overstay grace periods.** Sources give different grace periods (10, 30 and up to 90 days by visa type). None is built in; the user enters chargeable days.
- **H. Car loans.** No regulation is applied. A Central Bank cap on down payment or term could not be confirmed, so the page makes no claim about one.
- **I. E-invoicing scope.** The page does not say who is in scope beyond the revenue split. Dates have been amended once; recheck before each quarter.
- **J. From general knowledge on the VAT page:** VAT began on 1 January 2018; some supplies are zero-rated or exempt.
- **K. From general knowledge on the e-invoicing page:** the voluntary pilot began on 1 July 2026; a PDF is not an e-invoice; exchange runs through accredited service providers.
