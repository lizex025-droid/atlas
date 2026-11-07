#!/usr/bin/env python3
"""Build the private Rohen ledger from the exact reference edition and reviewed batches."""
import argparse
import csv
import hashlib
import io
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DESTINATION = ROOT / "research" / "rohen"
FRONT = [
    ("front-cover", None), ("blank", None), ("half-title", "I"),
    ("edition-list", "II"), ("title", "III"), ("copyright", "IV"),
    ("preface", "V"), ("preface", "VI"), ("contents", "VII"),
    ("contents", "VIII"), ("contents", "IX"), ("contents", "X"),
    ("contents", "XI"), ("blank", "XII"),
]
BACK = {547: "blank", 548: "back-cover"}


def load(path):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def read_pages(pdf, edition):
    with pdf.open("rb") as stream:
        digest = hashlib.file_digest(stream, "sha256").hexdigest()
    if digest != edition["pdfSha256"]:
        raise ValueError("PDF hash differs from the reviewed edition. Verify pagination before adding it.")
    text = subprocess.run(
        ["pdftotext", "-layout", str(pdf), "-"], check=True, capture_output=True, text=True, encoding="utf-8"
    ).stdout
    pages = text.split("\f")
    if pages.pop() != "" or len(pages) != edition["physicalPages"]:
        raise ValueError("Unexpected physical page count")
    return pages


def page_header(text, printed):
    first_line = next(line.strip() for line in text.splitlines() if line.strip())
    number = str(printed)
    if first_line == number:
        return ""
    if first_line.startswith(number + " "):
        return first_line[len(number):].strip()
    if first_line.endswith(" " + number):
        return first_line[:-len(number)].strip()
    raise ValueError(f"Printed page {printed} is missing from its extracted header")


def section_for(starts, printed):
    return next(name for first, name in reversed(starts) if printed >= first)


def collect_pages(pages, edition, reviewed):
    index_checked = {index for page in reviewed.values() for index in page["indexPagesChecked"]}
    for physical, text in enumerate(pages, 1):
        printed = physical - edition["printedOffset"]
        kind, chapter, subsection, heading = "", "", "", ""
        if physical <= len(FRONT):
            kind, printed = FRONT[physical - 1]
        elif physical in BACK:
            kind, printed = BACK[physical], None
        else:
            heading = page_header(text, printed)
            if printed <= edition["printedAnatomyPages"][1]:
                kind = "anatomy"
                chapter = section_for(edition["chapterStarts"], printed)
                subsection = section_for(edition["headAndNeckSubsectionStarts"], printed) if chapter == "Head and Neck" else heading or chapter
            elif printed <= edition["printedIndexPages"][1]:
                kind = "index"
            else:
                raise ValueError(f"Unclassified physical page {physical}")
        review = reviewed.get(physical)
        yield {
            "pdfPage": physical, "printedPage": printed, "classification": kind,
            "chapter": chapter, "subsection": subsection, "header": heading,
            "textLayerPresent": bool(text.strip()),
            "reviewStatus": "text-and-visual-reviewed" if review else "index-entries-spot-checked" if physical in index_checked
                else "visual-review-pending" if kind == "anatomy" else "classified",
            "figureId": review["figureId"] if review else "",
            "identifiedOccurrences": sum(len(e["recordIds"]) + bool(e.get("unresolved")) for e in review["labels"])
                + len(review["subjectIds"]) + len(review.get("unresolvedSubjects", [])) if review else "",
            "nextAction": "Inspect figures and enumerate concepts" if kind == "anatomy" and not review
                else "Reconcile index entries against the complete concept ledger" if kind == "index" else "",
        }


def collect_mappings(reviews, checkpoint):
    records = {record["id"]: record for record in checkpoint["concepts"]}
    for page in reviews:
        if page["pdfPage"] not in checkpoint["reviewedPdfPages"]:
            raise ValueError("Book audit checkpoint is stale")
        entries = [{"label": None, "recordIds": page["subjectIds"], "views": page["views"]}, *page["labels"]]
        entries.extend({"label": None, "recordIds": [], "views": page["views"], "unresolved": item}
                       for item in page.get("unresolvedSubjects", []))
        for entry in entries:
            location = {
                "pdfPage": page["pdfPage"], "printedPage": page["printedPage"],
                "chapter": page["chapter"], "subsection": page["subsection"],
                "figureId": page["figureId"], "views": entry["views"], "label": entry["label"],
            }
            if item := entry.get("unresolved"):
                yield {**location, "conceptId": item["conceptId"], "name": item["name"], "kind": item["kind"],
                       "canonicalId": None, "atlasRecordId": None, "outstandingTask": item["reason"]}
            for record_id in entry["recordIds"]:
                record = records[record_id]
                geometry = "separate-mesh" if record["meshIds"] else "reviewed-surface-point" if record["hasAnchor"] else "semantic-only"
                yield {
                    **location, "conceptId": record["id"], "canonicalId": record["id"], "atlasRecordId": record_id,
                    "name": record["name"], "standardIds": record["standardIds"],
                    "meshIds": record["meshIds"],
                    "surfacePointParentMeshId": record["parentId"] if record["hasAnchor"] else None,
                    "geometryStatus": geometry, "websiteRegistryVerified": record["uiRegistered"],
                    "contentStatus": "partial" if record["contentGaps"] else "applicable-sections-present",
                    "sourceEvidenceAndRightsLogged": record["sourceRightsChecked"],
                    "independentMedicalReview": record["independentMedicalReview"],
                    "outstandingContentSections": record["contentGaps"],
                }


def csv_text(pages):
    output = io.StringIO(newline="")
    writer = csv.DictWriter(output, fieldnames=pages[0].keys(), lineterminator="\n")
    writer.writeheader()
    writer.writerows(pages)
    return output.getvalue()


def json_text(value):
    return json.dumps(value, ensure_ascii=False, indent=2) + "\n"


def save(files, check):
    if check:
        for name, text in files.items():
            if (DESTINATION / name).read_text(encoding="utf-8") != text:
                raise ValueError(f"Private ledger is stale: {name}")
        return
    DESTINATION.mkdir(parents=True, exist_ok=True)
    for name, text in files.items():
        target = DESTINATION / name
        temp = target.with_suffix(target.suffix + ".tmp")
        temp.write_text(text, encoding="utf-8")
        temp.replace(target)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("pdf", type=Path)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    edition = load("book-integration/edition.json")
    checkpoint = load("BOOK_INTEGRATION_PROGRESS.json")
    if checkpoint["editionPdfSha256"] != edition["pdfSha256"]:
        raise ValueError("Book audit checkpoint refers to a different PDF")
    reviews = load("app/src/content/rohen-reviews.json")["pages"]
    source_pages = read_pages(args.pdf, edition)
    pages = list(collect_pages(source_pages, edition, {p["pdfPage"]: p for p in reviews}))
    mappings = list(collect_mappings(reviews, checkpoint))
    concepts = {}
    for item in mappings:
        record = concepts.setdefault(item["conceptId"], {
            "id": item["conceptId"], "canonicalId": item["canonicalId"], "name": item["name"],
            "standardIds": item.get("standardIds", []), "locations": [],
        })
        record["locations"].append({k: item[k] for k in ("pdfPage", "printedPage", "figureId", "label")})
    gaps = {
        "pendingAnatomyPdfPages": [p["pdfPage"] for p in pages if p["reviewStatus"] == "visual-review-pending"],
        "indexPdfPagesForFullReconciliation": [p["pdfPage"] for p in pages if p["classification"] == "index"],
        "content": [{"id": item["canonicalId"], "pendingSections": item["outstandingContentSections"]}
                    for item in mappings if item.get("outstandingContentSections")],
        "semanticFeaturesWithoutReviewedPoints": [item["canonicalId"] for item in mappings if item.get("geometryStatus") == "semantic-only"],
        "models": [model for page in reviews for model in page["modelReviews"]],
        "next": checkpoint["next"],
    }
    outputs = {
        "BOOK_COVERAGE_MATRIX.json": json_text({"edition": edition, "pages": pages, "mappings": mappings}),
        "BOOK_PAGE_AUDIT.csv": csv_text(pages),
        "ANATOMICAL_CONCEPT_INDEX.json": json_text({"complete": False, "concepts": list(concepts.values())}),
        "BOOK_TO_ATLAS_MAPPING.json": json_text({"complete": False, "mappings": mappings}),
        "UNMAPPED_STRUCTURES.json": json_text({"scope": "Identified concepts on visually audited pages", "unmapped": [item for item in mappings if not item["canonicalId"]],
                                             "unauditedPagesMayContainUnmappedConcepts": True}),
        "ANATOMY_RESEARCH_GAPS.json": json_text(gaps),
        "BOOK_INTEGRATION_PROGRESS.json": json_text(checkpoint),
    }
    save(outputs, args.check)
    print(f"{len(pages)} physical pages inventoried, {len(reviews)} visually reviewed, "
          f"{len(concepts)} identified concepts, {len(gaps['pendingAnatomyPdfPages'])} anatomy pages pending")


if __name__ == "__main__":
    main()
