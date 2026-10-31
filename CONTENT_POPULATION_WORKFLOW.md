# AnatomyAtlas content population and resumption

Work in the existing app. This workflow uses original factual writing and explicitly permitted imports. It does not read Complete Anatomy databases, screenshots as medical evidence, installation backups, encrypted resources or proprietary definitions.

## Current authoritative files

- `app/src/catalog.json` and `supplemental.json`: actual selectable mesh identities and source metadata.
- `knowledgeSchema.ts`: typed records, category requirements, claims, sections, pronunciation and evidence links.
- `app/src/content/reviewed-batch.json`: first original six-bone batch and 112 semantic feature profiles. `scripts/seed-reviewed-batch.py` reproducibly emits that batch from the original explanations already researched in this session; it is not an automated medical-fact generator.
- `app/src/content/imported.json`: versioned permitted imports; starts empty.
- `knowledge.ts`: cached canonical lookup and explicitly empty metadata records for unpopulated models. Unknown medical fields are not filled from names or model positions.
- `adultSkeleton.ts`: independently enumerated 206-reference convention checked against NCI SEER tables. It is distinct from the actual mesh count.
- `coverage.ts`, `knowledgeDatabase.ts`: validation, category-field evaluation and normalized exports.
- `CONTENT_PROGRESS.json`: resumable per-ID/per-section gaps and validated content/model digests. Changed content revisions preserve the previous checkpoint in `content-checkpoints/`.

## Research a batch

1. Read the checkpoint and generated coverage report. Choose pending canonical IDs; do not restart the installation inventory or overwrite existing medical facts blindly.
2. Verify the exact structure, anatomical type, laterality and actual mesh node. Use standard terminology IDs where consulted; an internal `feature:` ID is not an official FMA or TA2 identifier.
3. Consult primary anatomy/medical references and record exact URLs, titles, dates, licenses, access mode and claim locators. A source citation alone does not prove consultation or medical accuracy.
4. Write original structure-specific prose and structured facts. Use category-specific requirements; do not inflate a word count or substitute a system summary. Evaluate each applicable field; missing facts remain `not-started` or `needs-review`.
5. Keep conflicts and historical data visible. Gray 1918 morphology is explicitly historical; its maturation ages are not modern diagnostic standards. Current clinical claims need current supporting sources. The first batch deliberately flags ossification for review.
6. Provide per-claim `sources` and `evidence` (`sourceId`, `locator`, `status`). Clinical claims receive the same checks. A `not-applicable` section needs a sourced explanation, not an empty escape from completeness checks.
7. Register parts/surfaces/landmarks with stable side-specific IDs. If there is no separately segmented geometry, set `meshIds: []`; retain the parent backlink and show the separate-geometry limitation. Never map the whole humerus to its greater tubercle.
8. Set a content version and population-batch ID. Leave independent clinical review pending until a real reviewer/date are recorded through an accountable review process.

## Permitted JSON import

Run from `app`:

```powershell
npm run knowledge:audit
npm run knowledge:import -- --file public/knowledge/import-example.json
```

The generated example is an editable copy of the existing original left-humerus draft with an increased version. The command validates only; it does not apply it or make it medically complete. For a genuine new permitted revision, edit the file and its sources, then use:

```powershell
npm run knowledge:import -- --file path/to/researched-batch.json --apply
npm run knowledge:audit
npm test
npm run build
npm run test:e2e
```

The root object requires `schemaVersion: 1`, `rightsDeclaration: "original-factual-synthesis-or-authorized-reuse"`, `sources` and complete structured `records`. Existing source IDs are referenced without redefining them. New sources need a consultation date, locator, license/use assessment, HTTPS URL and permission classification. Records must increase their version and retain legitimate mesh mappings/laterality. Generic imports cannot certify medical approval. New `feature:` records may be imported with a known parent and a parent update containing the child backlink; they cannot claim whole-bone geometry as segmented feature geometry.

The importer rejects unknown model IDs, duplicate records/sources, missing provenance/claims, mismatched laterality and malformed fields. On apply it backs up the previous import file in the ignored `.knowledge-import-backups` directory and replaces only the app's import JSON. This is author-supplied provenance validation, not automatic verification of remote source truth or a medical review signature.

## CSV interface

A CSV needs a `record` column holding one complete JSON record per row; standard doubled quotes and multiline quoted cells are supported. Pass `--sources permitted-sources.json` containing the schema version, rights declaration and sources. The same validation/apply rules apply. No arbitrary script, HTML or model binary executes during import.

## Acceptance and offline data

`knowledge:audit` reads and hashes all 42 legitimate GLBs, checks node identities, validates modeled and semantic records, and produces `app/public/knowledge/database.json`, `coverage.json`, import example and a SHA-256 manifest. The export contains structures, names, hierarchy groups, sections, relationships, model mappings, sources/claim evidence, pronunciations, clinical correlations, variations and validation results. It is a static normalized local database with a migration path to relational tables. The runtime currently reads the structured JSON batch plus cached model metadata; the public database is an export/audit snapshot, not a network service queried on every click.

The UI is dynamic for all registered IDs. Selection does not initiate medical research or generative prose. Larger future corpora should partition content behind the same canonical repository while preserving all medical data and source evidence; the current checked batch is held locally and cached synchronously.

Speech uses the browser/OS synthesis API with cancellation and voice discovery. English fallback metadata covers every modeled term. Verified IPA is currently limited to the consulted humerus entry. Latin voice absence is explicit and uses a labelled approximation. Synthesized utterances are not stored as licensed source recordings; the browser API does not expose reusable audio bytes. Audible quality and clinical pronunciation require separate review.

A major bone is not complete because it has a paragraph, a speaker or a populated name. Category fields, sources, identity, mapping, laterality and review gates must all pass. No fully populated or medically verified profiles are claimed in this release. Continue with scapula/clavicle, remaining skeleton and its features, then modeled muscles, nerves, vessels, connective tissues, lymphatics/organs and all remaining IDs. Keep the entire pending queue visible throughout.
