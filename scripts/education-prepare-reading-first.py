"""Reconcile reviewed table transcription with the primary PDF and prepare typed source records.

Run with the configured Python runtime (pdfplumber required). This does not publish.
Numeric strings retain reported precision; native and standardized estimates describe
the same outcome contrast, not independent observations. No SE is inferred from a p-value.
"""
from pathlib import Path
from decimal import Decimal
import hashlib
import json
import re
from datetime import datetime, timezone
import pdfplumber

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data/education"
PDF = ROOT / "tmp/pdfs/reading-first-2008.pdf"
transcription_bytes = (DATA / "reading-first-transcription.json").read_bytes()
source = json.loads(transcription_bytes)
pdf_bytes = PDF.read_bytes()
checks = []


def check(condition, label):
    if not condition:
        raise ValueError(label)
    checks.append(label)


with pdfplumber.open(PDF) as doc:
    needed = sorted({t[k] for t in source["tables"] for k in
                     ("mainPdfPage", "appendixPdfPage") if k in t})
    pages = {n: doc.pages[n-1].extract_text() for n in needed}


def verify_sequence(page, exhibit, values, key):
    text = pages[page].split(f"Exhibit {exhibit}:", 1)[1].split("NOTES:", 1)[0]
    # Decimal tokens exclude numeric grade labels and preserve negative signs and <.
    tokens = re.findall(r"<\d+\.\d+|-?\d+\.\d+", text)
    expected = [v for v in values if v is not None]
    matches = [i for i in range(len(tokens)-len(expected)+1)
               if tokens[i:i+len(expected)] == expected]
    check(len(matches) == 1, f"PDF page {page}, Exhibit {exhibit}: exact numeric row {key}")


records = []
for table in source["tables"]:
    for row in table["rows"]:
        key = row["key"]
        check(len(row["main"]) == 5, f"Main column count: {key}")
        verify_sequence(table["mainPdfPage"], table["mainExhibit"], row["main"], key)
        native_value, standardized_value = row["main"][2:4]
        native_se = sd_se = native_ci = sd_ci = None
        locations = [{"exhibit": table["mainExhibit"], "printedPage": table["mainPrintedPage"],
                      "pdfPage": table["mainPdfPage"], "role": "means, p-value and headline estimates"}]
        if "appendix" in row:
            a = row["appendix"]
            check(len(a) == 8, f"Appendix column count: {key}")
            verify_sequence(table["appendixPdfPage"], table["appendixExhibit"], a, key)
            native_value, native_se = a[:2]
            native_ci = {"level": "0.95", "lower": a[2], "upper": a[3]}
            standardized_value, sd_se = a[4:6]
            if standardized_value is not None:
                sd_ci = {"level": "0.95", "lower": a[6], "upper": a[7]}
            check(standardized_value == row["main"][3], f"Standardized estimates agree across exhibits: {key}")
            # Main text sometimes reports one decimal while Appendix D gives two.
            precision = Decimal(row["main"][2]).as_tuple().exponent
            check(Decimal(native_value).quantize(Decimal(10) ** precision) == Decimal(row["main"][2]),
                  f"Native precision reconciles across exhibits: {key}")
            locations.append({"exhibit": table["appendixExhibit"], "printedPage": table["appendixPrintedPage"],
                              "pdfPage": table["appendixPdfPage"], "role": "precise estimates, SEs and 95% CIs"})
        p = row["main"][4]
        p_value = {"operator": "<" if p.startswith("<") else "=", "value": p.lstrip("<")}
        check(Decimal("0") < Decimal(p_value["value"]) <= Decimal("1"), f"Valid reported p-value: {key}")
        for value, se, ci in [(native_value, native_se, native_ci), (standardized_value, sd_se, sd_ci)]:
            if ci:
                check(Decimal(ci["lower"]) <= Decimal(value) <= Decimal(ci["upper"]), f"CI includes estimate {value}: {key}")
                check(Decimal(se) > 0, f"Positive reported SE {se}: {key}")
        record = {
            "key": key, "measure": row["measure"], "grade": row["grade"],
            "domain": table["domain"], "instrument": table["instrument"],
            "analysisLevel": row.get("analysisLevel", table["analysisLevel"]),
            "followup": table["followup"],
            "native": {"value": native_value, "unit": row["unit"], "standardError": native_se,
                       "confidenceInterval": native_ci},
            "standardized": None if standardized_value is None else {
                "value": standardized_value, "unit": "standard deviations", "standardError": sd_se,
                "confidenceInterval": sd_ci, "normalization": table["standardization"]},
            "means": {
                "actualUnadjustedWithReadingFirst": row["main"][0],
                "estimatedCounterfactualWithoutReadingFirst": row["main"][1],
                "unit": row["meanUnit"],
                "interpretation": "The estimated counterfactual is calculated from the adjusted impact, not an observed control-group mean. Do not recompute the published impact by subtracting rounded means."},
            "pValue": p_value, "test": "two-tailed",
            "reportedSignificantAt05": Decimal(p_value["value"]) <= Decimal("0.05"),
            "sourceLocations": locations, "outcomeSampleSize": None,
            "uncertaintyStatus": "reported SE and 95% CI" if native_ci else "SE and CI not reported in the selected exhibits; p-value retained"
        }
        records.append(record)

check(len(records) == 33 and len({r["key"] for r in records}) == 33, "33 distinct outcome contrasts")
check(sum(r["native"]["confidenceInterval"] is not None for r in records) == 25, "25 contrasts have source-reported uncertainty")
check(sum(r["standardized"] is not None for r in records) == 30, "30 paired standardized representations; three N/A values retained")
check(sum(r["domain"] == "student achievement" for r in records) == 7, "Seven achievement contrasts; implementation is distinct")
check(all(n in source["visuallyReviewedPdfPages"] for n in needed), "All extracted tables have recorded visual review")
now = datetime.now(timezone.utc).isoformat()
pdf_hash = hashlib.sha256(pdf_bytes).hexdigest()
transcription_hash = hashlib.sha256(transcription_bytes).hexdigest()
extraction = {
    "preparedAt": now, "status": "source-verified; Geo mapping and publication pending",
    "publication": {"title": "Reading First Impact Study Final Report", "reportNumber": "NCEE 2009-4038",
                    "year": 2008, "month": "November",
                    "authors": ["Beth C. Gamse", "Robin Tepper Jacob", "Megan Horst", "Beth Boulay", "Fatih Unlu"],
                    "sourceUrl": source["sourceUrl"], "pdfSha256": pdf_hash,
                    "citationNote": "Authors follow the report's suggested citation; additional contributors appear on the title page."},
    "context": {
        "program": "Reading First", "study": "Reading First Impact Study",
        "design": "17 regression-discontinuity sites and one group-randomized site",
        "assignment": "Receipt of Reading First funds; five treated and five control schools in the randomized site.",
        "siteComposition": "17 school districts and one state program across 13 states",
        "sample": {"initialSchools": 258, "finalSchools": 248, "readingFirstSchools": 125,
                   "nonReadingFirstSchools": 123, "sites": 18, "states": 13,
                   "unit": "schools, not a per-outcome student N"},
        "estimand": "Regression-adjusted impact of Reading First funding, averaged across sites in proportion to their number of Reading First sample schools.",
        "model": "Linear site rating specification and selected covariates; multilevel models account for clustering. See Chapter 2 and Appendix B for outcome-specific details.",
        "methodsLocator": "Chapter 2, printed pp. 17 and 24; Appendix B, printed B-3 to B-5",
        "matchedProgramCost": None,
        "costStatus": "Not extracted or matched; evaluation contract and state grants must not be treated as per-pupil delivery cost."
    },
    "limitations": [
        "Native and standardized forms are the same outcome contrast. Do not count them as independent effects or studies.",
        "A common SD label does not establish comparability across outcomes, populations or standardization samples.",
        "Nonsignificant estimates are not zero effects; preserve their negative and positive confidence bounds.",
        "Decoding was measured only in grade one in spring 2007. Comprehension estimates pool three spring collections.",
        "Instructional practices, engagement and self-reported implementation are distinct from measured achievement.",
        "Survey SEs and confidence intervals are not supplied in these selected exhibits; no values are inferred from p-values.",
        "Reading-coach survey response rates differ between funded and unfunded schools (p=0.037); self-reports and missingness limit interpretation.",
        "The 248-school study sample is not the number of students in each outcome analysis; some grade/year cells omit a school.",
        "Percentage-point impacts are differences, not percent changes; proportion-difference units are separately retained.",
        "Rounded CI endpoints can equal zero for an estimate marked significant; retain source p-values and bounds without alteration.",
        "This extraction covers Exhibits 2.1-2.6 and D.1-D.4, not all subgroup, yearly, mechanism or robustness analyses in the report."
    ],
    "verification": {"transcriptionSha256": transcription_hash, "numericChecks": len(checks),
                     "visualChecked": True, "visualPages": source["visuallyReviewedPdfPages"]},
    "records": records
}
output = DATA / "reading-first-extraction.json"
output.write_text(json.dumps(extraction, indent=2, ensure_ascii=False)+"\n", encoding="utf8")
report = {"checkedAt": now, "passed": True, "pdfSha256": pdf_hash,
          "transcriptionSha256": transcription_hash, "recordCount": len(records),
          "representationCount": 63, "checks": checks,
          "scope": "Exact numerical row sequences in the primary PDF plus recorded visual row/column review; this is not publication verification."}
(DATA / "reading-first-extraction-verification.json").write_text(json.dumps(report, indent=2)+"\n", encoding="utf8")
print(json.dumps({"output": str(output), "records": len(records), "representations": 63,
                  "checks": len(checks), "pdfSha256": pdf_hash}))
