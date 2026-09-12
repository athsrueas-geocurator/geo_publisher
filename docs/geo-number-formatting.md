# Numeric formatting for Education datasets

School-finance follow-up (2026-09-11): `precision-unlimited` was published and API-verified on shared Effect estimate value and Standard error in Education datasets. A fresh browser still rounds 3.1488 to 3.149 and 0.7906 to 0.791. Numeric storage is unchanged and exact. This standalone format is not yet a verified rendering fix; inspect current formatter behavior and metadata resolution. See `docs/school-finance-jjp-study-notes.md` and the `school-finance-jjp-remaining` publication evidence.

The current [repository formatter source](https://raw.githubusercontent.com/geobrowser/geogenesis/master/apps/web/core/utils/utils.ts), inspected 2026-09-11, sets GeoNumber.defaultFormat to `precision-unlimited` and passes the skeleton to IntlMessageFormat. That source alone does not explain the deployed rounding; verify the deployed code and the table/property metadata path before attributing a cause. Do not assume repository master equals the deployed build.

Verified against Health and the current Geo frontend on 2026-09-11.

- Store values as SDK numeric types, never text containing `%` or a currency sign.
- Root Format property: `396f8c72dfd04b5791ea09c1b9321b2f` (Text), attached to the numeric property entity.
- Health Mortality rate `5c9091d2e88bbd76b20bdfca78e8b76e` carries legacy `0.0%`. The live Wiskott-Aldrich Syndrome page displayed raw `0.01`, so that legacy pattern is not a working display example.
- Current frontend `apps/web/core/utils/utils.ts` uses IntlMessageFormat ICU number skeletons. `number-options-dropdown.tsx` uses `measure-unit/percent precision-unlimited` for its percentage toggle. That format labels a number in percentage units; it does not turn a stored fraction into percentage points.
- Education stores rates as fractions. Use `measure-unit/percent scale/100 precision-unlimited` on rate properties. Tested with the frontend's `intl-messageformat@11.2.9`: `0.04 → 4%`, `0.01 → 1%`, `0 → 0%`, `0.062 → 6.2%`.
- Retain explicit currency and price year for comparisons. The SDK also supports a unit ID on individual numeric values; currency-unit rendering should be verified before adopting it. Do not give a reusable, multicurrency Cost amount property a fixed dollar format.

Source: [Geo frontend number options](https://github.com/geobrowser/geogenesis/blob/master/apps/web/partials/entity-page/number-options-dropdown.tsx), [formatter](https://github.com/geobrowser/geogenesis/blob/master/apps/web/core/utils/utils.ts), [Health property](https://www.geobrowser.io/space/52c7ae149838b6d47ce0f3b2a5974546/5c9091d2e88bbd76b20bdfca78e8b76e). Live Health format records are saved in `data/education/health-number-format-discovery.json`.

STAR's pilot emits these formats as graph facts. Verify the actual table after indexing before publishing the remaining scenarios. Descriptive titles are not the numeric data source.

## Live STAR verification and remaining display issues

The [STAR dataset](https://www.geobrowser.io/space/dac259bad48a11adf97fe36857d85206/4874a8385a594633ab244f47889f9cab) was checked after indexing on 2026-09-11. Its discount and wage-growth columns display `4%` and `1%`, respectively, from numeric fractions `0.04` and `0.01`. Monetary columns display `7,537` and `15,180` with a separate USD column. The complete pilot verifier passed 59 checks, including the format facts and bounty link.

Outstanding issues observed directly:

1. Resolved: Price year previously displayed `1,998`. The STAR return pilot sets `group-off precision-integer`; browser review shows `1998` and stored integers are unchanged. See `star-return-publication.md`.
2. Claim rows display an additional `0%` rating badge inside the Name cell. This is Geo's claim rating, not a study effect, discount rate or confidence level. Dashboard consumers must use property IDs, not parse the rendered row text. Consider whether a more specific evidence-record type should avoid this debate UI without compromising Claim semantics.
3. Resolved: the description repair moved the rounding discussion into a methods block and replaced the operational instruction with reader-facing text retaining reported 7300. The return-pilot browser review confirms the corrected block below the tables.

These issues do not change the verified numeric values. Percentage and year formatting and the rounding-text correction are verified. Claim-rating ambiguity remains; consumers must read property IDs. All three modeled IRRs render correctly from fractions (`star-returns-full-visual.json`).
