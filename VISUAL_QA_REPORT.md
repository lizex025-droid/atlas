# AnatomyAtlas visual and interaction QA

## Current interactive-landmark delivery

Both new AnatomyLearning reference images (143414, 143424) and eight original T7 review views were visually inspected. The integrated study mode has a large isolated bone, floating heading, surface circles, source-aware details, category legend/filter, occlusion, marker visibility, context controls and saved views. Portrait projection and collapsible details keep the anatomy accessible on a phone. Source meshes remain visibly polygon-reduced; detailed reference textures and fine facet segmentations are not reproduced.

Final evidence: [landmark QA](LANDMARK_QA_REPORT.md), [production screenshot](app/test-results/landmarks-production.png), [superior endplate](app/test-results/landmarks-production-superior.png), [compact phone view](app/test-results/landmarks-production-mobile-compact.png), [coverage](LANDMARK_COVERAGE_REPORT.md). Fifty-one unit checks and build passed. Twenty browser workflows passed together before final opacity/binding hardening; six targeted workflows passed afterward, including real rendered-opacity change, transforms, scene restoration, mobile controls and checksum failure/retry. Production traversal passed with no page/HTTP errors. Exact run boundaries and the earlier interrupted attempt are recorded in LANDMARK_QA_REPORT.md.

Mapping remains **six gross T7 anchors, 23 unmapped/non-surface T7 records, one of 206 reference bones with reviewed coordinates**. Independent anatomical/clinical review is pending. This UI milestone does not complete the atlas-wide medical corpus.

## Knowledge-panel milestone verification — before the landmark extension

All six additional screenshots in `C:\Users\User\Pictures\ANATOMY` were visually opened (074015, 074408, 074426, 074441, 074502, 074530). Description, Parts, Surfaces, Landmarks, Cross-Sections and content-category organization informed the original implementation. Reference imagery and proprietary descriptions are not included in the app.

The redesigned long-form panel retains the dark workspace proportions and stable viewport. Actual 1680×900 renders were inspected for long descriptions, ossification/review notes, parts, surfaces, landmarks, semantic feature navigation and the coverage dashboard. Inspection found retained scroll position hiding the start of a newly selected tab; this was fixed with a tab/identity scroll reset and tested. Previous/More arrows now expose overflowing tabs. Long canonical IDs wrap. The final Parts image shows Head first, without an overlapping bottom bar.

- [Humerus Description](app/test-results/knowledge-humerus-description.png), [ossification](app/test-results/knowledge-humerus-ossification.png)
- [Parts](app/test-results/knowledge-humerus-parts.png), [Surfaces](app/test-results/knowledge-humerus-surfaces.png), [Landmarks](app/test-results/knowledge-humerus-landmarks.png)
- [Semantic feature](app/test-results/knowledge-humerus-feature.png), [coverage overview](app/test-results/knowledge-coverage-overview.png)
- [Production humerus](app/test-results/production-humerus.png), [production coverage](app/test-results/production-coverage.png)

Final combined verification: 42 unit checks and 15 browser workflows passed, including the retained entry/workspace tests and four new knowledge flows. They cover long content, tabs/scroll, parent/feature navigation, missing data, muscle context, pronunciation cancellation/fallback, coverage filters and camera preservation. Production verification traversed entry → regional atlas → T11 → left humerus → native speech → coverage with zero page/HTTP errors and zero initial GLB/graphics requests. Three installed voices were found and speech reported completion. Audible phonetic accuracy was not independently assessed. [Machine result](app/test-results/production-verification.json).

No full medical coverage, landmark segmentation, radiological slices or Complete Anatomy feature parity is claimed. Source-label mapping and source consultation are distinct from clinical approval. Screenshots/test outputs are local ignored QA artifacts.

## Earlier v0.3 comparison and run history

Reviewed 2026-10-31 in the existing application. Screenshots are actual browser renders, not mockups. All seven supplied Complete Anatomy screenshots and all twelve ANARUNY PNGs were opened visually; the latter's names/hashes are indexed in ANATOMYLEARNING_ANALYSIS.md. The proposed project references directory was absent. No reference imagery is bundled in the app.

## Layout comparison

The workspace follows the references' information hierarchy: persistent left anatomy panel, thin horizontal hierarchy, dominant near-black viewport, right tool rail and bottom system strip. At 1680x900 the panel is 284px, rail 80px, top bands total 88px and bottom bands total 112px. Text/lists scroll inside their region; drawer opening preserves the viewport rectangle. Tabs scroll horizontally; long names wrap or scroll. Selection is restrained green with neutral ivory/red source surfaces.

The entrance follows the ANARUNY four-area composition and narrow left rail. The atlas uses centred system headings, fine rules, regional image grids and dark caption bands. All 32 preview images are original renders of the installed licensed meshes. There are no lock overlays. Available functions determine the tile names: Atlas, Identification practice, Saved views and Section workspace. The last is visual sagittal clipping, not licensed radiology. Physiological animation and the reference's large quiz collection are not simulated.

## Actual captured and visually opened states

Files are under app/test-results and intentionally ignored by source control.

| Capture | Dimensions / observed result |
|---|---|
| [Entry](app/test-results/qa-entry-home.png) | 1680x900; asymmetric four-tile composition, original anatomy images, working navigation |
| [Regional atlas](app/test-results/qa-entry-atlas.png) | 1680x900; centred skeleton/region cards, collapsible sections, search |
| [Full-body workspace](app/test-results/qa-initial.png) | 1680x900; fully loaded skeleton, stable panel and system bar |
| [T11 Description](app/test-results/qa-t11-description.png) | 1680x900; canonical hierarchy, Latin qualifier, checked facts, isolated mesh |
| [T11 Parts](app/test-results/qa-t11-parts.png) | 1680x900; relevant content replaces Description, unsegmented parts stated clearly |
| [T11 Landmarks](app/test-results/qa-t11-landmarks.png) | 1680x900; pedicle/lamina/spinous information, no false subregion picking |
| [Palmar relations](app/test-results/qa-palmar-relations.png) | 1680x900; actual fascia mesh, fascia hierarchy, citations/registration warning, no stale T11 text |
| [Combined muscle/bone layers](app/test-results/dark-muscular.png) | 1440x1000; all 20 requested chunks loaded, visible muscular surfaces, multiple active systems |
| [Search](app/test-results/qa-search.png) | 1680x900; grouped results beside the fully loaded skeleton |
| [Identification practice](app/test-results/qa-identification-practice.png) | 1680x900; real isolated T11, no model-name label/information leakage from normal panel |
| [Mobile entrance](app/test-results/qa-entry-mobile.png) | 390x844; scrolling tiles, no horizontal document overflow |
| [Mobile workspace](app/test-results/dark-mobile.png) | 390x844; collapsed information, visible skeleton, horizontal system scrolling |

Production captures and the machine-readable request/error ledger are generated by scripts/verify-production.mjs: production-entry.png, production-t11.png and production-verification.json. The compiled app was tested separately from Vite development mode.

## Corrections made during review

- Fixed magnified close-focus HTML labels: constant screen size and bounded width replace distance-scaled overlays. Regression assertion limits label width below 220px.
- Repaired source encoding artifacts; current screenshots have clean symbols and text.
- Fixed missing Hand-to-upper-limb catalogue membership for both supplemental palmar surfaces. Catalogue tests now partition all 1,171 meshes exactly once.
- Prevented thyroid-named muscles/arteries from entering Endocrine through a broad name rule.
- Found an asynchronous readiness race in the screenshot helper: a previous layer's ready count could satisfy the wait while muscles were still loading. Readiness now also matches the current requested chunk count. Recaptured muscle/search screens show complete geometry (20/20 and 8/8 respectively).

## Test evidence and limits

Vitest: 25/25 checks passed (state, knowledge, groups, licensing, every GLB hash/topology/normal/ID and every preview hash). The final stricter-readiness browser pass completed ten workflows successfully. Its camera workflow timed out during an environment wall-clock jump, after an earlier successful camera pass; an isolated rerun then passed in 34.6s (39.8s including runner startup). This is not described as one uninterrupted eleven-test green run. The passing camera flow verifies real left-drag orbit, wheel zoom, right-drag pan and camera snapshots saved through the UI.

The other ten flows cover entry/no early model downloads, card selection/resident return, canonical search/browser navigation, quiz answers/score, narrow layout, original select/isolate/fade/notes/save/restore, failed-chunk retry, combined layers, T11 tabs/hierarchy, palmar replacement/missing facts, undo/settings and stable drawers. Production verification confirms zero initial GLB/graphics requests, deferred graphics after entry, successful model responses and no page errors.

Chromium used SwiftShader; representative physical-GPU performance, total process/GPU memory, every mesh individually, every transparency overlap, full screen-reader/axe coverage and all camera orientations remain unverified. Source geometry is reduced and mostly untextured; it does not match the reference's high-detail textured models. Medical coverage remains a checked-source pilot, with independent review and segmented landmarks pending. Live AnatomyLearning CDP/bundle inspection remains incomplete as recorded separately.
