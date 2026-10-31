# AnatomyLearning: bounded reference analysis

Review date: 2026-10-31. Target: https://browser.anatomylearning.com/. Requested CDP endpoint: `http://127.0.0.1:9222`. This report separates user-supplied visual evidence, vendor documentation, attempted live inspection and independent implementation decisions.

## Result and scope

**Live REA inspection is incomplete.** The connected REA server answered discovery requests, but could not reach the supplied browser endpoint. No page target ID, DOM snapshot, script inventory, JavaScript bundle analysis, runtime scene graph or network capture was obtained. The absence of a reachable debugging endpoint does not establish that the public website is unavailable to other users.

All 12 PNGs in `C:\Users\User\Pictures\ANARUNY` were opened with the image inspection tool during the parent implementation session. Their visible layout is usable design evidence. They do not demonstrate the result of clicking any control, identify the rendering library or grant permission to reuse the depicted anatomical artwork.

The public [AnatomyLearning homepage](https://anatomylearning.com/) was accessible through the web research tool. It advertises a real-3D anatomical model, over 6,000 labelled points, muscle/joint animations, radiological cross-sections, over 500 labelled quizzes, a structured atlas and international terminology references. Its browser requirements list WebGL 2, a 64-bit browser, 4 GB RAM and a network connection. These are vendor statements, not verified browser-session behavior or measured requirements. The browser application URL was inaccessible through that research tool as well.

## Live inspection attempt ledger

| Step | Attempt and result | Evidence boundary |
|---|---|---|
| Browser discovery | `list_browser_targets`, endpoint `http://127.0.0.1:9222`, allowed origin `https://browser.anatomylearning.com`; returned `provider_unavailable`, `reason: endpoint_unreachable` | Discovery failed before a target could be selected. No successful page Evidence ID was returned. |
| Local availability check | Read-only TCP-port and Edge-process queries returned no matching listener/process in the session | Bounded observation at the time of the check; not proof of the user's previous browser state. |
| Discovery retry | One retry of `list_browser_targets` returned the same error | No further unchanged retries were made. |
| Dedicated-browser startup | Attempt to start a hidden dedicated Edge process was rejected by automatic policy review: `blocked by policy` | The rejected action did not establish a running analysis browser. No alternate launch or policy bypass was attempted. |
| Page inspection | `inspect_web_page` not run | Requires a discovered target ID. Accessible DOM, resources and runtime metadata remain unknown. |
| Bundle analysis | `analyze_web_bundle` not run | Requires a discovered target ID. No engine/library fingerprint, script parse or source-map inspection is claimed. |
| Behavior observation | No live actions, instrumentation or passive runtime capture completed | Camera, object picking, layer transitions, quizzes and animation behavior remain untested. |

The failure messages above are operational observations, not successful REA page-analysis Evidence. Do not attach unrelated native Complete Anatomy Evidence IDs to this website. No website Evidence bundle with successful target observations exists for this pass.

A final retained-evidence check used `get_evidence_bundle` with `detail: summary` and operation filter `list_browser_targets`. It reported zero matching records (zero retained records in the connected session), so no earlier successful browser discovery was available to reuse. No incomplete preview is being treated as a successful live capture.

## Screenshot evidence index

Files remain private reference material outside distributable application assets. The SHA-256 values below bind this review to the supplied PNGs; they do not verify the date/content of the original website session.

| File, under `C:\Users\User\Pictures\ANARUNY` | Visible content | SHA-256 |
|---|---|---|
| Screenshot 2026-10-31 031630.png | Atlas title, skeletal regional cards, articular-system heading, breadcrumb/search/grid controls | `53fec4abc7b9cb6bea6ec7dacc305039790f9cf6acf8690b5bfa9549b5521a05` |
| Screenshot 2026-10-31 031647.png | Muscular and arterial regional grids, lock overlays, narrow left rail | `1ad43fab1038cee5cddf19fa05c02bc73649cd6c68c9c167b2ff41ede6fae80d` |
| Screenshot 2026-10-31 031700.png | Heart card and regional venous grid | `796c7d991a39a64cd20c2c6c71d4c59e2bd3c39fb1c7f0bbfb15cf2d694bca4d` |
| Screenshot 2026-10-31 031715.png | Central/peripheral nervous-system cards and lymphoid categories | `b2a69f8ca5ccf6a2affd6e2d664d63125ee702297e11b73bd9cc142cd5586bd9` |
| Screenshot 2026-10-31 031741.png | Lymphoid-organ and regional lymph-node cards | `9028867d53e1168d85f604f77cfdd19192ad29f883b774ea86aaed1e00d1ed1c` |
| Screenshot 2026-10-31 031759.png | Sensory-organ and respiratory cards | `0e95bb736044ae7de36e9a65cafae4eb88364482070a72631197ee95925d1981` |
| Screenshot 2026-10-31 031810.png | Alimentary-system grid: teeth, oral cavity, glands, pharynx, oesophagus and abdominal organs | `5f7265d6b04a599c3c48638f3fef6520966ec23a693d9b1d065e4446af21ba84` |
| Screenshot 2026-10-31 031821.png | Lower alimentary cards and urinary/reproductive cards | `a1b6b7d602a9db948a7a603e5682ff769a22a815db23756d90029f59798c5140` |
| Screenshot 2026-10-31 031834.png | Urinary-system and endocrine-gland sections | `2a6857ce9cd23c71043b86418880148ef72b31105f490b43f2f61119c19a2acf` |
| Screenshot 2026-10-31 032019.png | Trunk-bone overview and spine/thoracic-cage/pelvis subcategories | `9800c361f6b0841f16055d20e8d93365ce80d68db427b1e0c198ee95b3d10040` |
| Screenshot 2026-10-31 032305.png | Upper-limb overview/bones/markings cards and individual bone categories | `f1529e1e0ec92b052d6bc390d1811ae239ad72ba4a148d8d86cfa7c27ee94c13` |
| Screenshot 2026-10-31 032500.png | Entry composition: large Atlas tile, tall Quizzes tile, stacked Animations and sectional/radiological tiles | `de9be4edc66b27384ab1eba522a13d51ccb23b7c038701a2b5169d4b0c272c07` |

## Verified visual structure

The screenshots show a restrained dark teal/charcoal background, a narrow darker left navigation rail, muted light typography, centred section headings with fine horizontal rules, and large anatomical image cards. Cards use delicate outlines and translucent dark caption strips near the bottom. Most system sections divide content by head/neck, trunk, upper limb and lower limb. Sparse sections centre fewer cards. The atlas and its subcategories share the same visual grammar.

Visible controls include Back, 3D Model, a menu affordance, breadcrumb levels, a magnifying-glass icon, a grid icon and upward chevrons near section headings. Chevron placement suggests collapsible sections, but screenshots alone do not verify collapse behavior. Lock overlays are visible on many cards; their access-control meaning and unlocking mechanism were not inspected. The user's independent application should omit those overlays as requested; doing so in AnatomyAtlas does not alter or unlock the reference website.

## Feature and technical evidence matrix

| Investigation topic | Established evidence | Unknown / limitation | Independent AnatomyAtlas direction |
|---|---|---|---|
| Rendering technology | Official homepage names WebGL 2 as a browser requirement | Active API, engine, framework, shader pipeline, canvas arrangement and engine version unverified. WebGL compatibility does not establish Three.js, Unity or any other engine. | Retain original React/TypeScript/Three.js/R3F implementation. |
| Scene organization | Atlas screenshots show system and regional categories | Runtime scene graph, mesh IDs, hierarchy storage, instancing and transforms unknown | Use the licensed-model canonical-ID registry and explicit groups. |
| Rotation, zoom and pan | A 3D-model navigation control is visible | Actual gestures, limits, inertia, orientation and camera projection unobserved | Keep working orbit/pan/zoom and bounds-based focus; verify in our app. |
| Structure selection | Detailed anatomy illustrations and individual bone categories are visible | Raycasting/picking algorithm, selected colors, multi-selection and deselection behavior unobserved | Bind mesh picking to one typed canonical selection state. |
| Model hierarchy and body systems | Multiple named systems, regional groups and nested trunk/upper-limb categories appear in the supplied PNGs | Completeness, exact ontology, canonical IDs and data relationships unknown | Build selectable study groups from available licensed mesh metadata; mark approximate classification. |
| Visibility and layers | Categories identify systems; no working layer transition was captured | Hide/isolate, depth ordering, fade/highlighting and per-object transparency unverified | Preserve actual per-object visibility/opacity and combined-system controls. |
| Search | A search icon is visible in atlas screenshots | Search fields, matching, filtering, languages and result behavior unobserved | Retain English/FMA search and checked Latin/synonyms; add original atlas filtering. |
| Labels | Labelled points are advertised in official documentation | Label placement, occlusion, interaction and exact coverage unobserved | Use bounded, world-anchored labels from the licensed catalogue. |
| Information panels | No structure-information panel is demonstrated in this screenshot set | Descriptions, citations, tabs, relationships and panel synchronization unknown | Continue the independent source-backed offline knowledge panel; never fill gaps with invented facts. |
| Animations | Entry tile is visible; vendor documentation advertises motion features | Playback, rigs, anatomy correctness, clip data and controls unverified | Do not present camera motion or object explode as physiological animation. |
| Quizzes | Entry tile is visible; vendor documentation advertises quizzes | Question types, scoring, feedback, persistence and dataset unknown | An original identification exercise can use licensed IDs/names and independently tested scoring. |
| Sectional/radiological anatomy | Entry tile is visible; vendor documentation advertises this content | Scan rights, calibration, slice orientation, modality and 3D registration unverified | Distinguish a visual clipping plane from validated radiological/clinical cross-sections. |
| Loading and performance | Vendor lists browser requirements | Chunk layout, network waterfall, compression, LOD, memory/GPU cost and measured frame rate unknown | Keep abortable incremental GLB loading, disposal and honest measured QA. |
| Asset formats and metadata | None captured | GLB/OBJ/FBX/WASM/Unity asset-bundle formats, texture maps, topology and licenses unknown | Use only separately reviewed BodyParts3D/Z-Anatomy assets and manifests; do not infer rights from browser accessibility. |
| Services and storage | Vendor lists a network connection requirement | APIs, authentication, offline cache, local storage and backend topology unobserved | Preserve our local scene storage without introducing speculative dependencies. |

## Implementation boundary

The screenshot layout can inform an independently written entry screen and categorized atlas. Generate thumbnails from AnatomyAtlas's licensed meshes with attribution, rather than distributing screenshots, extracting target images or copying protected models. Keep all pre-existing selection, visibility, annotations, camera, source references and saved views usable after entry navigation. Browser-observation limitations do not block development of those original features.

AnatomyAtlas's architecture and test results must be described from its own source and verification artifacts, not attributed to AnatomyLearning. This report does not claim feature parity, recovered source code, recovered 3D models, complete anatomy coverage or clinical certification.

## Remaining live-inspection checklist

- [ ] A reachable user-authorized debugging browser and selected target identity.
- [ ] `inspect_web_page`: permitted DOM, script/resource inventory and runtime metadata, retaining Evidence IDs.
- [ ] `analyze_web_bundle`: bounded static architecture/library candidates, with capture and parsing coverage explicitly recorded.
- [ ] Permitted passive observation of actual 3D behavior and loading; any later interactive actions must remain within the user's declared scope.
- [ ] Evidence export for successful observations, if obtained, separate from private installation research.

Do not retry the rejected browser-launch action or change security/debugging policies to complete this checklist. Once the supplied browser endpoint is made available, resume at discovery and retain the actual results; do not rewrite this incomplete pass as a successful live inspection.
