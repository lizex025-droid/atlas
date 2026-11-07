# Rohen 7th edition integration

The chapter and pagination inventory is bound to the SHA-256 in [edition.json](edition.json). The supplied file contains 548 physical pages. PDF pp. 15–516 correspond to printed pp. 1–502. PDF pp. 517–546 contain the index. Front matter, the extra blank leaf and the covers have separate classifications.

## First batch

- Printed p. 373, PDF p. 387. The anterior, medial and posterior right-humerus views account for 23 labels and the bone itself. The batch adds a distinct ulnar-groove record and expands the right humerus and medial epicondyle. The installed right humerus is now in Skeletal system → Upper limbs.
- Printed p. 372, PDF p. 386. The anterior and posterior views show the right shoulder girdle in relation to the thorax. All 16 numbered labels are indexed. A grouped rib label maps to four individual bone IDs. Seven scapular landmarks and three joint concepts or joint groups await canonical mappings. The current bones are registered, but the seven newly linked mesh records still need substantive content.
- The supplied index was spot-checked for the two plates. Complete index reconciliation is pending.

The public information panel shows both page numbers and the applicable label in Sources. A single click in the 3D viewer selects the record without reframing. Bony Markings and double-click provide explicit entry to the landmark study. A linked landmark can open its information record or locate a representative surface point when one has been reviewed.

## Geometry and rights

Five representative points use triangles from the existing right BodyParts3D humerus mesh. The points cover the humeral head, greater tubercle, both epicondyles and olecranon fossa. The asset retains the upstream CC BY-SA 2.1 Japan notice. Its SHA-256, vertex and triangle counts, point weights, original mesh attribution and limitations are in [the anchor bindings](../app/src/content/right-humerus-anchors.json).

The right humerus has 2,233 indexed vertices, 3,784 triangles and 564 indexed boundary edges. The structural audit found zero nonmanifold edges and zero degenerate triangles at its threshold. Surface discontinuities are visible in the proximal contour and the anterior distal fossa. Geometry review is limited to gross features. A higher-resolution licensed source, reliable comparative measurements and independent review are required for full model validation. The ulnar groove remains a semantic record without a marker.

The public repository contains anatomical facts, bibliographic locators, independently written explanations and attributed model data. The PDF, source page renders, raw extraction and full private ledger stay outside the published tree.

## Resume

1. Start at printed p. 371, PDF p. 385. Review the three scapular views, including the lettered and numbered labels. Resolve the overlapping right scapula entries on PDF p. 386 before moving to adjacent pages.
2. Use the existing knowledge import pipeline. Add canonical child links, claim locators, independent review status and explicit geometry gaps. Reuse records across pages.
3. Add mappings to [the reviewed page manifest](../app/src/content/rohen-reviews.json). Record the views on which each label appears. Multiple IDs can resolve one grouped label. A concept can remain unresolved with an explicit reason.
4. From `app`, run `npm run book:audit -- --write`, `npm run knowledge:audit` and `npm run landmarks:audit`. From the repository root, run the private inventory against the original attachment as shown below.
5. Run the unit and browser suites, build, deployment artifact check and publication audit. Keep production deployment separate from branch verification.

```bash
python scripts/inventory_rohen.py "/path/to/supplied-edition.pdf"
python scripts/inventory_rohen.py "/path/to/supplied-edition.pdf" --check
```

The inventory command requires Python 3.11+ and Poppler. It validates the source hash and each printed Arabic page number against its physical position. It writes the seven requested ledgers under the ignored `research/rohen/` directory. It does not persist extracted page prose or images. The safe [progress checkpoint](../BOOK_INTEGRATION_PROGRESS.json) records current counts, per-concept gaps and the next batch.

In a running instance, open `/#coverage` and expand **Rohen textbook integration**. Page classification, concept mapping, researched content, UI registration, existing geometry, surface points and independent review use separate denominators.
