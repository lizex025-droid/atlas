# AnatomyAtlas v0.4 verification

## Latest bone-landmark checks

Final unit run: **51/51 passed**, six files. Final TypeScript/Vite build passed (2,175 modules; app 422.84 KB / 67.20 gzip; Viewer 7.65 KB / 3.61 gzip; CSS 36.99 KB / 8.53 gzip; existing graphics/catalogue large-chunk advisories). `npm run landmarks:audit` passed with zero errors and exact source SHA-256/triangle checks.

Browser run boundaries: a combined **20/20** workflow run passed with zero skipped/flaky/unexpected tests (`test-results-landmarks-acceptance/.last-run.json`, [summary](test-results/landmarks-acceptance-summary.json)). After final opacity/model-binding hardening, **6/6** targeted landmark workflows passed (`test-results-landmarks-final/.last-run.json`), including a rendered-image comparison proving the existing opacity tool changes the bone. No 21-case combined final run is claimed. The original tests remain present.

`node scripts/verify-landmarks-production.mjs` passed on the final build against preview 4175. It traverses real GLB loading, T7 study, surface-marker click, superior-endplate focus, portrait fitting and collapsed details; `errors: []`, `failures: []`. [Result](test-results/landmarks-production-verification.json), [screenshots and scope](../LANDMARK_QA_REPORT.md). Geometry checks are not independent medical approval. Only T7 has installed reviewed anchors; all other reference-bone mappings remain pending.

The earlier interrupted attempt had screenshot/loading timeouts and subsequently unavailable local servers; it is not counted as a passed run. The fresh combined acceptance run above passed after restart.

## Knowledge milestone run — before the landmark extension

- `npm test`: **42/42 passed**, five files, Vitest 4.1.12. Includes all modeled/semantic IDs, source evidence, side consistency, parent links, category gaps, truthful completion, import rights/shape/version checks, normalized preservation and cached lookup performance.
- `npm run test:e2e -- --workers=1 --output=test-results-all`: **15/15 passed in one run** (3.5 minutes). Retained entrance/workspace flows plus four new knowledge workflows; result `test-results-all/.last-run.json` is passed with no failed IDs.
- `npm run knowledge:audit`: passed all 42 GLB hashes/node inventories and 1,284 identities; structural validation errors zero. Reports distinguish missing medical content from valid structural mapping.
- `npm run knowledge:import -- public/knowledge/import-example.json`: dry-run passed for one example record, no new sources; **applied:false**. No external user corpus was applied.
- `npm run build`: TypeScript and Vite passed, 2,169 modules, 17.14 seconds. CSS 31.30 KB (7.40 gzip), app index 383.12 KB (54.21 gzip), shared client 221.88 KB (69.05 gzip), Viewer 27.75 KB (9.05 gzip), graphics 941.71 KB (254.88 gzip), catalogue 977.84 KB (113.10 gzip). Large graphics/catalogue advisories remain. Knowledge audit export is not a per-selection runtime fetch.
- `node scripts/verify-production.mjs` against `http://127.0.0.1:4175`: passed entry → atlas → real GLBs → T11 → left humerus details → native speech → coverage. Zero page/HTTP errors, zero initial GLB/graphics requests. Three installed voices; playback reported completion. **Audible phonetic quality was not independently verified.** Full result: [production-verification.json](test-results/production-verification.json).
- Dependency installation after upgrading Vitest reported zero known vulnerabilities at that check; no claim about future advisories.

Pronunciation interaction tests mock only the speech service boundary and use native utterance types; production checks use the real API. Neither establishes medically accurate audio. All 1,171 modeled records remain medically incomplete: 11 partial and 1,160 metadata-only; full/independently medically verified counts are zero. Geometry-label validation is not clinical certification. See [visual QA](../VISUAL_QA_REPORT.md) and [coverage](../ANATOMICAL_COVERAGE_REPORT.md).

### Final architecture and flow review

React best-practices review checked component boundaries, hooks, event cleanup, stable canonical keys, deferred filtering/paginated coverage, cached record lookup, explicit missing states and accessible controls. Graphics remain lazy; the large normalized audit export is not loaded into the selection path. Native voice listeners are removed and playback is cancelled on selection/unmount. No server/API credentials are required for the local knowledge path.

| Story boundary | Evidence / result |
|---|---|
| Entrance → workspace | Compiled browser traversal; no initial GLB/graphics fetch, models requested on entry |
| Mesh selection → identity | Canonical FMA23131 and distinct laterality validated against GLB nodes and unit/browser checks |
| Identity → knowledge → panel | Cached local batch, detailed humerus section asserted in production, contextual tabs/feature-parent flows tested |
| User action → native speech | Real synthesis API, three voices and completion status; audible accuracy unverified |
| Registry → coverage | All 1,171 modeled records, exact gaps and 199/206 reference shown in production |
| Runtime health | Production `errors: []`, `failures: []`; build passed with known large-chunk advisories |

## Earlier v0.3 evidence (historical)

Current story: entrance -> regional atlas/search -> licensed GLB responses -> canonical selection and checked-source information -> visibility/camera tools -> validated local scene persistence. Identification practice shares real meshes while hiding labels and anatomical details during questions.

## Current results

- TypeScript/Vite production build passed. App module 67.33 KB (22.35 KB gzip), client/shared runtime 221.88 KB (69.05 KB gzip), deferred Viewer 27.75 KB (9.05 KB gzip), deferred graphics 941.71 KB (254.88 KB gzip), catalogue 977.84 KB (113.10 KB gzip). Large catalogue/graphics advisories remain; GLB/image payloads are separate.
- Vitest: 25/25 passed across state, knowledge, catalogue/practice and asset suites. Every generated preview's membership and SHA-256 is checked, along with all GLBs and rights metadata.
- Ten browser workflows passed with the corrected readiness denominator. The eleventh (camera gestures) timed out during an environment wall-clock jump, then passed on an isolated rerun: 34.6s test / 39.8s runner. An earlier isolated pass also succeeded. No single uninterrupted eleven-test green run is claimed.
- Browser coverage includes original notes/scenes/retry/mobile workflows, all context tabs, group breadcrumbs, palmar replacement, missing facts, system combinations, entry/catalogue search, preserved resident scene, three-question practice and real orbit/zoom/pan saved through the UI.
- Production smoke verification passed independently on 4175: zero initial GLB/graphics requests; graphics loaded only on entry; regional meshes and T11 rendered; current record/isolate worked; no page errors or HTTP failures. scripts/verify-production.mjs writes test-results/production-verification.json and production screenshots.
- Final visual review caught and corrected premature layer-ready waits; muscle screenshots now show 20/20 chunks and actual muscular surfaces. Full review, references, images and limitations: ../VISUAL_QA_REPORT.md.

Commands: npm test; npm run build; npm run test:e2e; node scripts/verify-production.mjs. Chromium executable used: C:/Users/User/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe. Both local servers bind loopback (Vite 5175; production preview 4175). Browser tests use SwiftShader, not a validated physical GPU. No backend/account/proprietary service or Complete Anatomy backup is read by the app. Clinical review, complete terminology/content, higher-resolution LODs and segmented landmarks remain open.

The original v0.2 record below is retained as historical evidence; its counts and bundle sizes do not describe the current version.

## Historical v0.2 verification

Story: open the licensed anatomical atlas, progressively load the skeleton, add muscular surfaces, select an FMA structure, change visibility/opacity, annotate, save camera and scene, then reload and restore.

## Results

- TypeScript and Vite production build passed. Output: application JS 46.97 KB (15.57 KB gzip), catalogue JS 977.84 KB (113.10 KB gzip), graphics JS 1,175.95 KB (328.13 KB gzip). Catalogue/graphics still emit the large-chunk advisory. GLB assets are separate from these JS sizes.
- Vitest: 8/8 passed in 1.9 seconds. Five existing state-test purposes retained with FMA fixtures; three asset tests verify license/hash metadata, all chunk hashes/indexed geometry/normals/unique IDs and skeletal/muscular startup coverage.
- Playwright: 3/3 passed in 2.1 minutes. Desktop mesh picking, FMA search, right femur isolation/opacity/note/focus/save/reload/restore; mobile search/corrupt storage/no horizontal overflow; simulated chunk HTTP 503 and retry, no initial muscle fetches, deferred muscle fetches, hide/dispose and restoration requests.
- Production preview smoke check passed independently on port 4175: compiled split bundles initialized without page errors; all 8 skeleton chunks loaded (14.7 MiB), followed by all 20 skeleton+muscle chunks (72.0 MiB), with real surfaces rendered and a screenshot captured.
- Screenshots visually reviewed: initial-desktop.png, workspace-desktop.png, workspace-mobile.png, bodyparts-skeleton.png, bodyparts-muscles.png. Production screenshot: production-anatomy.png. All are under test-results/ and excluded from version control.

Commands: npm test; npm run build; npm run test:e2e. The browser suite uses port 5175, reusing a server there or starting Vite automatically. Set PLAYWRIGHT_CHROMIUM_EXECUTABLE to an installed Chromium executable if needed. This run used C:/Users/User/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe. A fresh setup can use npx playwright install chromium.

## Boundaries

The application is static: UI -> local GLB HTTP response -> GLTFLoader -> indexed geometry -> WebGL; workspace -> versioned localStorage -> validated restored scene. No account, backend API or proprietary service is involved. Each asset SHA was checked offline in tests. The UI's MB indicator uses binary MiB values and represents visible chunk payload, not measured process/GPU memory.

Chromium used SwiftShader. Representative physical GPUs, all 1,169 structures individually, every depth/transparency overlap, camera drag/wheel and all deletion controls were not separately tested. The production smoke check covered rendering and layer loading; the complete study/restore suite ran on Vite development mode. Clinical/anatomical review, exact terminology currency and full-resolution LODs remain open.

## Current preview

Production preview: http://127.0.0.1:4175 . Development server: http://127.0.0.1:5175 . Both bind loopback. A visible browser tab could not be opened because browser connectors were unavailable; the screenshots show the working result. Restart either server from this app directory if the session process has stopped.
