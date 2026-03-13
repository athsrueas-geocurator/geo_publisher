"""Quick verification runner for lessons.csv entries.

Fetches each URL sequentially and checks whether the metadata keywords appear in the page
source. Generates both stdout progress and a JSON record that highlights missing keywords for
each column so you can review which rows need manual attention.
"""

from __future__ import annotations

import csv
import json
import re
import time
from dataclasses import asdict, dataclass
from pathlib import Path

import requests


LESSONS_CSV = Path("lessons.csv")
OUTPUT_JSON = Path("lesson_verification.json")
REQUEST_TIMEOUT = 25
SLEEP_SECONDS = 0.5


def parse_keywords(cell: str | None) -> list[str]:
    if not cell:
        return []
    pieces = re.split(r"[;,]", cell)
    return [piece.strip() for piece in pieces if piece.strip()]


def chunk_matches(content: str, chunk: str) -> bool:
    words = [word for word in re.split(r"\W+", chunk.lower()) if word]
    if not words:
        return False
    return all(word in content for word in words)


@dataclass
class ColumnResult:
    missing: list[str]
    total: int


def inspect_column(html: str | None, column_values: list[str]) -> ColumnResult:
    html_lower = html.lower() if html else ""
    missing = []
    for chunk in column_values:
        if html_lower and chunk_matches(html_lower, chunk):
            continue
        missing.append(chunk)
    return ColumnResult(missing=missing, total=len(column_values))


def extract_title(html: str) -> str | None:
    match = re.search(r"<title[^>]*>(.*?)</title>", html, re.I | re.S)
    if not match:
        return None
    return match.group(1).strip()


def fetch_page(url: str) -> tuple[int, str | None, str]:
    response = requests.get(url, timeout=REQUEST_TIMEOUT)
    response.raise_for_status()
    content_type = response.headers.get("Content-Type", "")
    text = None
    if content_type.startswith("text"):
        text = response.text
    return response.status_code, text, content_type.split(";")[0]


def verify_lessons() -> None:
    if not LESSONS_CSV.exists():
        raise FileNotFoundError(f"{LESSONS_CSV} not found")

    with LESSONS_CSV.open(encoding="utf-8") as fh:
        reader = list(csv.DictReader(fh))

    total = len(reader)
    results: list[dict] = []

    for idx, row in enumerate(reader, start=1):
        lesson_id = row.get("lesson_id", "<unknown>")
        name = row.get("Name", "")
        url = row.get("Web URL", "")
        print(f"[{idx}/{total}] {lesson_id} - {name}")
        if not url:
            print("  ! no URL provided")
            results.append({"lesson_id": lesson_id, "url": url, "error": "missing url"})
            continue

        try:
            status, html, content_type = fetch_page(url)
            title = extract_title(html) if html else None
            print(f"  -> status {status}, content-type {content_type}")
            if title:
                print(f"  -> title: {title}")
        except requests.RequestException as exc:  # pragma: no cover - networking
            print(f"  ! failed to fetch {url}: {exc}")
            results.append({"lesson_id": lesson_id, "url": url, "error": str(exc)})
            continue

        html_lower = html.lower() if html else None
        columns_to_check = [
            ("Skills", parse_keywords(row.get("Skills"))),
            ("Roles", parse_keywords(row.get("Roles"))),
            ("Topics", parse_keywords(row.get("Topics"))),
            ("Tags", parse_keywords(row.get("Tags"))),
            ("Description", parse_keywords(row.get("Description"))),
        ]

        column_results: dict[str, ColumnResult] = {}
        for column_name, keyword_list in columns_to_check:
            column_results[column_name] = inspect_column(html_lower, keyword_list)
            missing = column_results[column_name].missing
            if missing:
                print(f"    - {column_name}: {len(missing)}/{len(keyword_list)} missing")
            else:
                print(f"    - {column_name}: all keywords present")

        results.append(
            {
                "lesson_id": lesson_id,
                "name": name,
                "url": url,
                "status": status,
                "content_type": content_type,
                "title": title,
                "column_verification": {name: asdict(result) for name, result in column_results.items()},
            }
        )
        time.sleep(SLEEP_SECONDS)

    OUTPUT_JSON.write_text(json.dumps(results, indent=2, ensure_ascii=False))
    print(f"\nWrote verification summary to {OUTPUT_JSON}")


if __name__ == "__main__":
    verify_lessons()
