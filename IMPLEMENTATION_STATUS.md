# AnatomyAtlas implementation status - v0.4

## Current landmark extension

Interactive Bony Markings is now integrated into the existing app: bone raycast selection and focus, floating heading/detail controls, category markers, tooltips, selection, occlusion, surface-bound transforms, surroundings, category filtering, marker visibility and compatible local scene restoration. Search/list information workflows and multiselection are retained. No proprietary reference models/coordinates/text were used.

Actual mapping scope: **six gross T7 surface anchors**, **23 unmapped/non-surface T7 records**, **1/206 reference bones with reviewed coordinates**; 199/206 reference bones have current model mappings. Fine facets/notches and independent medical review remain pending. See [system documentation](LANDMARK_SYSTEM.md), [generated report](LANDMARK_COVERAGE_REPORT.md) and [progress manifest](LANDMARK_PROGRESS.json). Engineering checks and final browser evidence are recorded in app/VERIFICATION.md and VISUAL_QA_REPORT.md.

Latest checks: 51 unit tests, production build and landmark audit passed. A combined 20 browser workflows passed before final opacity/binding hardening; six targeted landmark workflows passed afterward. Final production traversal passed with zero page/HTTP errors. [Exact QA record](LANDMARK_QA_REPORT.md). Portrait details can collapse, and selected-bone opacity remains controlled by the existing Tools panel.

## Knowledge milestone delivery — before the landmark extension

Implemented in the existing app: typed anatomical knowledge schema, cached canonical record retrieval, long-form dynamic information panel, category-specific tabs, linked semantic features, native pronunciation/cancellation, model-driven coverage dashboard, rights/provenance-aware JSON/CSV import and resumable audit checkpoints. Earlier 3D, entrance, practice, visibility, annotations and saved-scene workflows remain available.

Actual coverage: 1,171 selectable meshes across 42 GLBs; all have records and checked mesh mappings. Of these, 11 have partial researched content, including six expanded bilateral humerus/radius/ulna drafts; 1,160 have metadata-only records. There are 113 additional semantic identities, including 112 new feature profiles without separate geometry. Fully populated: **0**; independently medically verified: **0**. The standard adult reference has 199/206 represented bones; coccyx and bilateral auditory ossicles lack separately identified mappings. These are audited source identities, not clinical geometry certification.

Left humerus has detailed sourced sections, seven parts, six surfaces/borders and fourteen landmarks. Missing medical fields, historical ossification questions and absent submesh segmentations keep it explicitly partial. No protected Complete Anatomy corpus was extracted or copied.

Validation passed: **42/42 unit checks**, **15/15 browser workflows together**, TypeScript/Vite production build, all-model knowledge audit and permitted import dry-run. Production preview had no page/HTTP errors; native speech completed with three installed voices, without independent audible pronunciation validation. Vitest was updated to 4.1.12; installation reported zero known vulnerabilities at that check. Evidence: [verification](app/VERIFICATION.md), [coverage](ANATOMICAL_COVERAGE_REPORT.md), [implementation report](KNOWLEDGE_IMPLEMENTATION_REPORT.md), [visual QA](VISUAL_QA_REPORT.md).

Continue from [CONTENT_PROGRESS.json](CONTENT_PROGRESS.json), [population workflow](CONTENT_POPULATION_WORKFLOW.md) and [continuation prompt](POPULATION_MASTER_PROMPT.md). Full-corpus medical acceptance is still open.

## Earlier v0.3 baseline (historical)

## Delivered in the existing app

The white prototype shell has been replaced by a desktop-first dark anatomical workspace: persistent 284px information panel, horizontal hierarchy, dominant stable viewport, compact right tool rail and 12 system controls. UI_DESIGN_SYSTEM.md and UX_INTERACTION_SPEC.md describe the real implementation. Every reference screenshot was opened visually; no proprietary UI assets or descriptions are copied.

A typed, persistent offline knowledge repository connects selection to structure-specific content, citations, status and review date. T11 exposes descriptions/facts/parts/surfaces/landmarks; palmar fascia exposes attachments/relations/clinical information; both palmaris-longus entries have checked facts. English/FMA search is retained and checked Latin/synonym search added. Remaining records expose terminology/geometry and explicit unavailable medical information. No on-click medical generation, fabricated Latin or generic substitute descriptions.

Geometry is 1,169 BodyParts3D entries plus 2 explicitly identified Z-Anatomy palmar surfaces, in 42 chunks. The palmar supplement is separately licensed CC BY-SA 4.0 and registered approximately using four existing mesh-center anchors; residuals and source/output hashes are recorded. Main meshes retain their earlier CC BY-SA 2.1 Japan terms. The original backup remains private and untouched. ANATOMICAL_SOURCES.md records the review, including model-rights exceptions and tool integrity.

Shared state coordinates primary canonical ID, selected mesh set, group, hidden/opacity state, camera and annotations. Working actions include isolate, hide, fade, hide/fade others, reset visibility, group navigation, multiselect, undo, system toggles with hidden-selection clearing, interruptible smooth camera framing and reduced motion. Existing notes and named v2 saved views remain, including backward-compatible v2 optional fields. Source-model additions do not invalidate existing FMA IDs.

Right controls open functional Hub/Search/Tools/Library/source-catalogue/Settings/scene/Help panels. Tools include opacity, notes, visual sagittal clipping and object explode. Rendering quality, controls and accessibility preferences persist locally. The viewport does not resize/remount when a drawer opens. Progressive abortable loading, retry, geometry disposal, on-demand frames and split bundles remain. Fixed-size world-anchored labels prevent extreme magnification at close focus.

## Validation

The original five state tests and three asset checks remain, with eleven knowledge/interaction checks and six catalogue/preview/practice checks. All 25 unit/asset checks passed. Eleven browser workflows have passing evidence across the main run and isolated camera rerun; the interrupted full-run camera timeout is disclosed in VISUAL_QA_REPORT.md and app/VERIFICATION.md. Tests cover selection, notes/scenes, retry, combined systems, T11 tabs/hierarchy, palmar replacement, missing facts, actions/settings, entry navigation, practice and camera gestures. Production build and independent compiled-app smoke verification passed; large graphics/catalogue chunk advisories remain.

## Remaining limitations and honest unavailable states

Medical review is a checked-source pilot, not complete atlas-wide medical coverage or independent clinical certification. T11 part/facet surfaces and palmar transverse fibres do not have separately verified segmentations; the UI states this instead of faking highlighted subregions. Supplemental anatomy alignment is approximate; high-resolution landmark fidelity requires review. Most Latin terms, descriptions and type-specific extensions remain unavailable outside the pilot.

Pronunciation/audio, independently calibrated measurement, capped/labelled clinical cross-sections, anatomical rigs/physiological animation, clinical simulation, licensed thumbnails, cloud services and full feature parity are not delivered. Clipping is visual, explode transforms existing meshes only. Section/explode settings are transient and reset during restoration. v1 schematic views remain stored without automatic migration. Source-informed system assignment still needs anatomical curation; uncertain entries remain searchable under Other/unclassified. The graphics bundle is large; representative physical GPU and total-process memory measurements remain future work.

No original source application installer/executable ran. No DRM, permissions, authentication or protected assets were bypassed. No public deployment/repository was created. An official portable Blender runtime was used only to read selected licensed model datablocks with auto-execution disabled; no source template code was run. Acquisition/tool/reference caches are ignored and excluded from app distribution.

## Entrance and regional collection follow-up

The default root now opens an original image-led entrance based on all 12 visually inspected ANARUNY screenshots, without locks. #atlas provides 13 collapsible sections and 28 regional cards covering all 1,171 meshes once. Search opens canonical records; cards open real grouped geometry with bounds focus. Continue study retains the resident scene. #workspace remains a direct entry. All 32 WebP previews are generated from licensed local GLBs, with member IDs, hashes and attribution.

Tiles also open local saved views, a three-question identification exercise with hidden labels/feedback/score, and visual sagittal clipping. Physiological animation, radiological datasets and a large question bank remain absent. Graphics now load dynamically on first 3D entry; production verification confirmed zero graphics/GLB requests on the entrance. Thyroid-named muscles/arteries are no longer misclassified as endocrine glands. Supplemental Hand records now participate in upper-limb browsing without changing source metadata.

Readiness must match the currently requested chunk count, preventing a previous layer's settled count from marking new meshes complete. The 25 unit/asset/catalogue checks pass, including preview hashes and every group member. Browser and production evidence is recorded in VISUAL_QA_REPORT.md and app/VERIFICATION.md. Live REA page/bundle analysis remains incomplete because the requested browser endpoint is unreachable; see ANATOMYLEARNING_ANALYSIS.md. The private backup remains unchanged.
