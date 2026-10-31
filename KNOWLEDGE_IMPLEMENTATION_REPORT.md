# AnatomyAtlas v0.4: knowledge-system implementation

This is a verified engineering/content foundation and a partial researched corpus, not final acceptance of the requested complete atlas. All six images in `C:\Users\User\Pictures\ANATOMY` were opened visually: 074015 (Description), 074408 (Parts), 074426 (Surfaces), 074441 (Landmarks), 074502 (Cross-Sections) and 074530 (model/content categories), each named Screenshot 2026-10-31. Their organization informed the implementation; their protected artwork and medical prose were not copied.

## Actual delivered data

The model audit finds 1,171 selectable canonical meshes across 42 GLBs. Each has a persistent exported information record and a checked node-ID/hash mapping; zero modeled IDs lack records or mappings. This does not imply that their medical descriptions are complete.

The database has 1,284 identities: 1,171 modeled records and 113 semantic-only identities. The new batch contributes six modeled bone drafts (bilateral humerus, radius and ulna) plus 112 side-specific parts/surfaces/landmarks. Eleven modeled records have some researched medical content including the older pilot; 1,160 remain metadata skeletons. Expanded bone drafts: six. Fully populated modeled records: zero. Independently medically verified records: zero. Every modeled record remains incomplete under the requested acceptance criteria.

The independent adult reference enumerates 206 bones (80 axial, 126 appendicular). 198 reference entries match source labels directly and the sternum maps to three components counted together, giving 199 represented reference bones. Coccyx and bilateral malleus/incus/stapes lack separately identified mappings in the current catalogue. This is a source-label/mesh-ID audit, not an independent clinical certification of every surface. Accessory foot sesamoids do not inflate the adult reference count.

## Left humerus

Canonical FMA23131 maps to the actual left humerus and remains distinct from right FMA23130. The panel shows the source-consulted Latin term and dictionary IPA; original prose covers morphology, orientation, joints, attachment regions, arterial supply, development, the classical ossification scheme, documented variants, surface anatomy and clinical nerve/injury relationships. It has seven Parts, six Surfaces/borders and fourteen Landmarks linked to 27 separate information profiles. Same-side scapula/radius/ulna relations are validated.

Choosing a feature opens its own information and parent breadcrumb; it does not substitute the parent mesh for an absent segmentation. Ordinary selection/parent navigation preserves the camera. Source-level disagreements are visible: the olecranon is not a humeral ossification centre, and historical maturation data are flagged for contemporary review. Venous/lymphatic drainage and bone-specific innervation remain unpopulated. The humerus is therefore explicitly partial and has not passed final medical/segmented-geometry acceptance.

## UI and pronunciation

The left panel now renders long descriptions and section headings, category-specific muscle/nerve/vessel/connective-tissue tabs, linked feature records, sources and review gaps. Tab arrows expose overflow; changing tabs resets the content scroll. Clinical cross-section images are explicitly unavailable; visual clipping remains a separate tool. The existing dark workspace, atlas entrance, progressive meshes, notes, multiselect, visibility, camera and scenes are retained.

The pronunciation button calls browser SpeechSynthesis with voice discovery, cancellation, error reporting and source-dictionary IPA where consulted. English fallback metadata exists for all 1,171 modeled structures; known Latin terms have a separate control with explicit fallback when no Latin voice is installed. There are no shipped medical recordings or fabricated IPA entries. Automated playback tests mock the speech service boundary while exercising real utterance objects, English/Latin requests and cancellation. They do not establish audible phonetic correctness; independent listening review and installed user-browser voices remain necessary.

## Pipeline and validation

Final checks on 2026-10-31: 42/42 unit checks in five files, 15/15 Playwright workflows in one combined run, TypeScript/Vite build, 42-file GLB knowledge audit and example import dry-run passed. Production traversal returned zero page/HTTP errors, deferred all initial GLB/graphics requests and completed native speech with three installed voices. Audible phonetic accuracy was not assessed. Raw production evidence is in `app/test-results/production-verification.json`; screenshots and exact limits are linked in VISUAL_QA_REPORT.md.

`knowledge:audit` validates the complete inventory and writes a normalized offline database, detailed coverage JSON, SHA-256 manifest, permitted-import example, report and resumable checkpoint. JSON/quoted CSV imports validate rights/provenance, versions, field shapes, claims, laterality, model references and parent links; apply backs up the previous app import file. New semantic features cannot falsely claim whole-bone geometry. Imports do not automatically prove remote source truth or grant medical approval.

Tests also found/fixed a legacy right-palmar fascia relation pointing to left palmaris longus, and shared batch-builder list state that could mix left/right relations. Explicit ipsilateral-link validation and isolated record construction prevent recurrence. No original research backup or proprietary source executable was changed or executed for this work.

Sources/rights and command-level results are maintained in ANATOMICAL_SOURCES.md, ANATOMICAL_COVERAGE_REPORT.md, CONTENT_POPULATION_WORKFLOW.md, VISUAL_QA_REPORT.md and app/VERIFICATION.md. CONTENT_PROGRESS.json retains every pending model ID and section. POPULATION_MASTER_PROMPT.md is the requested continuation prompt. Complete-corpus acceptance remains open.
