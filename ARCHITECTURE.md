# Architecture and evidence ledger

## Interactive bone-landmark extension

The existing Viewer now opens a canonical bone study from a raycast click (except additive multiselection). Standard search/list selection retains the prior camera-preserving workflow, with an explicit Bony Markings entry. BoneLandmarkExplorer and LandmarkMarkers share a bone-scoped landmark selection; geometry remains owned by the progressive loader. Points are barycentric bindings to actual triangles, parented in the same transformed group as the bone and occluded by scene surfaces. Models are SHA-256 checked before parsing. A study visibility override preserves the underlying normal scene.

Landmark saved views use a validated optional extension of existing v2 scenes; older files still load. Coordinates, source facts, marker rendering and controls are separate modules. Actual first batch: six gross T7 anchors, 23 unmapped/non-surface T7 features, one of 206 adult-reference bones with reviewed positions. Independent anatomical approval remains pending. See [landmark system](LANDMARK_SYSTEM.md), [coverage](LANDMARK_COVERAGE_REPORT.md) and [checkpoint](LANDMARK_PROGRESS.json).

## v0.4 knowledge-system extension

The existing rendering, progressive loading, visibility, annotations and v2 scene persistence are retained. `InformationPanel` resolves one canonical selection through the cached knowledge repository; selection updates content without moving the camera. Explicit Focus/double-click performs framing. Semantic features open their own profile and parent navigation while clearing an unsupported exact mesh highlight.

Medical types, researched JSON, import validation, normalized export and coverage evaluation live respectively in `knowledgeSchema.ts`, `content/reviewed-batch.json`, `knowledgeImport.ts`, `knowledgeDatabase.ts` and `coverage.ts`. `PronunciationControl` uses native browser speech synthesis with cancellation and disclosed voice fallback. `CoverageDashboard` at `/#coverage` inventories every modeled identity and the independent 206-bone reference.

`knowledge:audit` checks all 42 GLB hashes and node IDs, writes public knowledge snapshots and a resumable `CONTENT_PROGRESS.json`. JSON/CSV import is dry-run by default, backs up before apply, and cannot award clinical approval. Sources have consulted-access, rights and evidence locators. None of this reads or redistributes the private Complete Anatomy backup. See [implementation report](KNOWLEDGE_IMPLEMENTATION_REPORT.md) for current scope and gaps.

## Atlas entrance extension

EntryScreen.tsx adds an original static-image entrance and regional collection. Hash routes distinguish start/atlas/workspace. No Canvas mounts before first workspace entry; subsequent catalogue visits keep the workspace mounted and inert underneath. App.tsx lazily imports Viewer; explicit Vite manual chunks keep graphics outside the entrance dependency graph.

classification.ts centralizes presentation membership. atlasCatalog.ts creates regional groups and preview presets; registry.ts registers them beside source/curated groups without circular data imports. Selection, visibility, framing and serialization reuse the typed workspace. IdentificationQuiz.tsx supplies three original mesh-ID questions with source-name answer checks, not generated anatomical facts.

The offline preview script renders only licensed local GLBs and records members/hashes/license references. Runtime images load separately from GLBs. Readiness compares loaded chunks against the current requested denominator. No AnatomyLearning source or resource enters these modules. Live reference limitations are in ANATOMYLEARNING_ANALYSIS.md; the historical installation analysis below remains separate.

## Scope and confidence

Read-only static inspection of a private copy of the supplied offline distribution, version 11.6.4.0. No installer, supplied application, DLL, or installation script was executed. Runtime camera behavior, service use and license-enabled content are unverified. Public documentation describes the product independently of this exact package. No source reconstruction or feature parity is claimed.

The machine-readable evidence is private in `research`: `inventory.json`, `package-inventory.json`, `package-texts.json`, and REA evidence bundles. SHA-256 binds observations to artifacts, not to vendor authenticity. ZIP CRC checks and matching copies do not verify the publisher signature or license validity.

## Verified distribution observations

- Offline directory: 17 readable files, 957,447,232 bytes; main MSIX bundle, 12 APPX dependencies under arm/arm64/x64/x86, a license XML, BAT/PowerShell wrappers and an empty log. All source files copied and hash-verified. The ZIP has 16 matching file members; the empty installation log exists only in the extracted tree.
- Bundle SHA-256: `030cc0e68a0e78cc8aa4a50618750d1651b3e92de262457c1bc23a73ef0fba5d`. REA bundle graph covers 11 central-directory entries, no integrity contradictions; it does not recursively establish inner-package behavior. Evidence parent `ev_ff195fd56227334bf71cea9ed9350ed46932b79d7217c1f99b1e52dad4fed54d` in `rea-bundle-evidence.json`.
- Python separately hashes 1,606 package entries including nested MSIX and all supplied dependency APPX members; no read/CRC errors. Main release package, language resource package and scale resource packages remain private. Full file names/sizes/digests are in `package-inventory.json`; formats in `PACKAGE_SUMMARY.md`.
- Main manifest declares Windows.Desktop and Windows.Team minimum 10.0.17763.0; x64 package identity 11.6.4.0; Microsoft.UI.Xaml.2.8, Microsoft.VCLibs.140.00.UWPDesktop and Microsoft.VCLibs.140.00 dependencies. It registers a protocol handler and WebView2 in-process classes, loopback content rules, internetClient, location, microphone and webcam capabilities. Declarations do not prove actual permission grants or use.
- Manifest build metadata names Visual Studio 2022, MSVC, XAML tasks, `ilc.exe`, and .NET Native shared framework configuration. This is build provenance text, not verified compiler execution. A native shell or .NET Native contribution is plausible; no CLI metadata in the selected images cannot rule out native-compiled managed ancestry.
- `CompleteAnatomy.exe`: 801,792-byte amd64 PE32+, SHA-256 `70a6915e153139a67b0271883c73bcfad563357f5df9c88c4ac036b9aeaa0628`. REA reports 309 imports from 20 DLLs, no CLI directory, no PE resources. Imports include the core library and WinRT APIs.
- `CompleteAnatomyLib.dll`: 17,866,752-byte amd64 PE32+, SHA-256 `2e415e2cb8cff9fcea723de64a7c89a58dc9c50f9c21182c5c82608ff3feac3a`. REA reports 753 imports from 37 DLLs, 228 export entries, and no CLI directory.
- Core imports include Objective-C runtime, GNUstep Foundation/CoreBase, dispatch, DXGI factory creation, D3D11 device creation, D3D12 ordinal import, D3DCompile, XAudio2 and Media Foundation. The EXE imports named C++ `ca::bridge` interfaces for views, buttons, video, web content and application lifecycle, and rendering interfaces exposing a DXGI swapchain.

PE imports Evidence: EXE `ev_3487953cec35619ccef2be20370843064c987ae1b22ac2c598ba4995f8a1de08`; core `ev_31165c85fbf54e1059aa3272d906c992cfddbe2a29bd200df73add2298202f1a`. Managed classification parents: `ev_be98353a91873cd62f54d6f47aacc0f6445223a58dc30e1954a221d4901826d8`, `ev_7702ce1d3f0cd7ea57aeecd956b280c83ea4c9506b37ab76ac95c6b4559356ab`. Core exports parent: `ev_ea76e98feadea8502240413254fb25bd85877affba12dc457c9f06f4087f1993`. See `rea-static-evidence.json`.

## Inferences and unresolved architecture

The inner release MSIX also received a separate REA graph inspection: SHA-256 `ea32f6c6be43caae13362c9c87a6ddbe4c297224b4c9558c43dddb888db3abbb`, 1,312 file occurrences, 1,148 content nodes, no integrity contradictions. Evidence parent `ev_5d205eb968d2568ce5d225e0068b01900ac4cb012b10514cebdc107bd9a9cef5` is exported in `research/rea-release-package-evidence.json`. This covers central-directory members, not observed execution.

The small platform executable plus larger core library and bridge symbols suggest a shared native core with Windows UI/service adapters. Direct3D rendering support is strongly evidenced; the active backend, draw pipeline, scene graph, engine authorship and third-party engine identity require additional evidence. WebView2 declarations and local HTML resources suggest hybrid web/native panels. They do not establish an Electron application.

Package entries include extensionless resources, `.cplist`, `.sj`, `.wcar`, `.bin`, `.gz`, `.plist`, `.json`, shaders, images, fonts, audio/video and libraries. Names/extensions are candidates until parsed; proprietary or protected model formats remain unknown. Nothing was decrypted, no restricted model was reconstructed, and no mesh was copied to the prototype. See `research/STATIC_FINDINGS.md` for bounded header/config/string observations and evidence offsets.

Camera controls, opacity and layering algorithms, selection acceleration, search indexing, annotations, educational content and scene persistence have partial naming/config/public evidence only unless explicitly corroborated in that findings ledger. Database schemas cannot be inferred from library names. Online URLs/capabilities are candidate dependencies, not captured traffic; authentication, API schemas, accounts and service availability remain unknown. No service endpoint was probed.

## Available REA capabilities and limits

REA MCP 6.8.0 connected successfully. Used archive opening/graph inspection, PE import/export/resource inspection, managed classification, desktop-directory overview and evidence export. These do not run target code. Directory overview examines only selectively materialized PE/manifests, not a full installed tree; its negative framework candidates are bounded to that subset. Native Ghidra provider is not configured (`GHIDRA_INSTALL_DIR` absent); no native pseudocode or call-path reconstruction is claimed. No provider installation/configuration change was made. DRM, encryption, license enforcement and authentication were left intact.

## Independent application design - v0.2

The previous 32-structure procedural default was replaced by a licensed BodyParts3D atlas. No proprietary research artifact is read by the application or import pipeline. The original findings above remain historical research observations.

The offline import pipeline reads official BodyParts3D OBJ archives and FMA terminology/relationships. Every candidate OBJ license is verified, source bytes hashed, same FJ elements deduplicated and constituents grouped under one unique FMA ID. Indexed GLB chunks group up to 40 structures per system/region. A manifest binds every imported source mesh to its source URL, hash, license, modifications and hashed output. Selected meshes retain the embedded CC BY-SA 2.1 Japan license; see DATASET_LICENSE_REVIEW.md.

React imports a typed generated catalogue with source IDs, English names, parents, chunk references and transformed bounds. Source part-of parents are supplemented with is-a parents; system classes use source ancestry and explicit rules. Region filters use approximate bounding-box centers. These presentation groups are not claimed to be a fully reviewed anatomical ontology. Search includes source parent IDs/names, and clicking a breadcrumb filters the catalogue to related structures.

The viewer loads 41 local GLB resources progressively through a three-worker fetch queue and GLTFLoader. Only chunks needed by visible structures remain resident; hidden-only chunks are disposed, in-flight requests abort when visibility changes, and stale parse results are disposed. A retry UI handles fetch/parse failures. Mesh picking maps to FMA IDs. Actual geometry bounds drive camera focus. Normals are generated offline; indexed surfaces, on-demand rendering and DPR capped at 1.5 control runtime cost. Catalogue/graphics/application bundles are separated. There is no backend or proprietary service dependency.

React state retains visibility, opacity, selected FMA ID, anchored notes and camera. Local saved views use anatomy-atlas.scenes.v2; v1 schematic records remain unchanged but are not automatically translated. Asset identity is deterministic through the manifest; clinical accuracy and full anatomical coverage are separate unresolved requirements. See IMPLEMENTATION_STATUS.md for actual checks and performance limits.


## v0.3 workspace and knowledge architecture

App.tsx holds one typed history-aware workspace state; workspace.ts owns pure selection/visibility/framing logic, registry.ts resolves canonical groups/system membership, and scene.ts validates backward-compatible v2 persistence. InformationPanel.tsx resolves the current canonical record from knowledge.ts synchronously. WorkspaceDrawer.tsx hosts functional search/tools/scenes/settings/help/source panels. Facts, UI state and meshes are separate layers. No stale asynchronous medical request exists; only mesh loading is asynchronous and abort/identity checked.

Supplemental geometry and chunks live separately from the original generated catalogue. Z-Anatomy GLB node extras preserve canonical IDs containing colons, avoiding glTF runtime name sanitization breaking identity. The viewport reuses existing geometry, frames bounds smoothly in the current camera direction, supports true multiselect/visibility, and keeps bounded pixel-sized labels. Side drawers overlay rather than resize the viewer. CSS tokens/responsive rules govern the dark workspace.

Knowledge schema and provenance: ANATOMY_DATA_SCHEMA.md and ANATOMICAL_SOURCES.md. Clinical review and mesh segmentation are separate from source/licensing checks. See IMPLEMENTATION_STATUS.md for scope and unavailable features.
