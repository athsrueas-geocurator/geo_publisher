#!/usr/bin/env python3
import argparse
import json
from dataclasses import dataclass
from difflib import SequenceMatcher
from pathlib import Path

import pandas as pd


@dataclass
class Candidate:
    entity_name: str
    entity_type_id: str | None
    source_kind: str
    source_ref: str


def normalize_name(value: str) -> str:
    return " ".join(value.lower().strip().split())


def token_sort_ratio(a: str, b: str) -> float:
    a_sorted = " ".join(sorted(normalize_name(a).split(" ")))
    b_sorted = " ".join(sorted(normalize_name(b).split(" ")))
    return SequenceMatcher(None, a_sorted, b_sorted).ratio()


def fuzzy_score(a: str, b: str) -> float:
    direct = SequenceMatcher(None, normalize_name(a), normalize_name(b)).ratio()
    token = token_sort_ratio(a, b)
    return max(direct, token)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Fuzzy duplicate checker for Geo publish candidates")
    parser.add_argument("--proposed", required=True, help="Path to JSON array of proposed entities")
    parser.add_argument("--existing", required=True, help="Path to JSON array of existing entities")
    parser.add_argument("--out", required=True, help="Path to write JSON report")
    parser.add_argument("--high-threshold", type=float, default=0.92, help="High similarity threshold")
    parser.add_argument("--medium-threshold", type=float, default=0.85, help="Medium similarity threshold")
    return parser.parse_args()


def load_df(path: str, required_cols: list[str]) -> pd.DataFrame:
    payload = json.loads(Path(path).read_text(encoding="utf-8"))
    df = pd.DataFrame(payload)
    for col in required_cols:
        if col not in df.columns:
            df[col] = None
    return df


def main() -> None:
    args = parse_args()

    proposed_df = load_df(args.proposed, ["entityName", "entityTypeId", "sourceKind", "sourceRef"])  # noqa: N806
    existing_df = load_df(args.existing, ["id", "name", "typeId"])  # noqa: N806

    proposed_df = proposed_df.dropna(subset=["entityName"])
    existing_df = existing_df.dropna(subset=["name"])

    high_matches: list[dict] = []
    medium_matches: list[dict] = []

    for _, proposed in proposed_df.iterrows():
        proposed_name = str(proposed["entityName"]).strip()
        if not proposed_name:
            continue

        proposed_type = proposed.get("entityTypeId")
        pool = existing_df
        if proposed_type is not None and str(proposed_type).strip():
            type_filtered = existing_df[existing_df["typeId"] == proposed_type]
            if not type_filtered.empty:
                pool = type_filtered

        best: dict | None = None
        for _, existing in pool.iterrows():
            existing_name = str(existing["name"]).strip()
            if not existing_name:
                continue
            score = fuzzy_score(proposed_name, existing_name)
            if best is None or score > best["score"]:
                best = {
                    "score": score,
                    "existingId": str(existing.get("id", "")),
                    "existingName": existing_name,
                    "existingTypeId": existing.get("typeId"),
                }

        if best is None:
            continue

        record = {
            "sourceKind": proposed.get("sourceKind"),
            "sourceRef": proposed.get("sourceRef"),
            "proposedName": proposed_name,
            "proposedTypeId": proposed.get("entityTypeId"),
            "bestMatch": {
                "id": best["existingId"],
                "name": best["existingName"],
                "typeId": best["existingTypeId"],
            },
            "score": round(float(best["score"]), 4),
        }

        if best["score"] >= args.high_threshold:
            high_matches.append(record)
        elif best["score"] >= args.medium_threshold:
            medium_matches.append(record)

    report = {
        "summary": {
            "proposedCount": int(len(proposed_df.index)),
            "existingCount": int(len(existing_df.index)),
            "highThreshold": args.high_threshold,
            "mediumThreshold": args.medium_threshold,
            "highMatchCount": len(high_matches),
            "mediumMatchCount": len(medium_matches),
        },
        "highMatches": sorted(high_matches, key=lambda x: x["score"], reverse=True),
        "mediumMatches": sorted(medium_matches, key=lambda x: x["score"], reverse=True),
    }

    Path(args.out).write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
