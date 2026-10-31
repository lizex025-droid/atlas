# AnatomyAtlas independent anatomy workspace

Interactive **Bony Markings**: click a bone in 3D or select it and press Bony Markings. T7 (FMA9968) has six reviewed gross surface anchors with hover, details, occlusion, category filtering and saved landmark views. Other bones show explicit mapping gaps; 206-bone coverage is tracked, not claimed complete. [Landmark guide](LANDMARK_SYSTEM.md) · [actual coverage](LANDMARK_COVERAGE_REPORT.md) · [resume checkpoint](LANDMARK_PROGRESS.json).

Version 0.4 adds the model-driven knowledge system, detailed partial upper-limb bone records, contextual information tabs, working approximate native pronunciation, licensed/source-evidenced import workflow and `/#coverage`. The requested complete medical corpus is not finished: all 1,171 modeled IDs are mapped, 11 profiles are partial, 1,160 are metadata-only, and none is independently medically verified.

Start with [implementation and test results](IMPLEMENTATION_STATUS.md), [actual coverage](ANATOMICAL_COVERAGE_REPORT.md), [knowledge delivery report](KNOWLEDGE_IMPLEMENTATION_REPORT.md), [population workflow](CONTENT_POPULATION_WORKFLOW.md), [resumable checkpoint](CONTENT_PROGRESS.json) and [continuation prompt](POPULATION_MASTER_PROMPT.md). [Final screenshots](VISUAL_QA_REPORT.md) document the working app, not mockups.

The independent application is in [app](app). Run `npm install`, then `npm run dev` there; `npm run build` produces `app/dist`. Consult the app README for controls and tests.

The original visual entrance opens a regional atlas, identification practice, saved views and a section workspace. Preview: http://127.0.0.1:4175 while the local preview process is running. Root / is the entrance; /#atlas the collection; /#workspace direct 3D. Images are original licensed-model renders, with no lock overlays or reference-site artwork.

Current design and evidence: [design system](UI_DESIGN_SYSTEM.md), [interaction specification](UX_INTERACTION_SPEC.md), [data schema](ANATOMY_DATA_SCHEMA.md), [sources](ANATOMICAL_SOURCES.md), [visual QA](VISUAL_QA_REPORT.md), [AnatomyLearning findings and limits](ANATOMYLEARNING_ANALYSIS.md).

Research reports: [inventory](FILE_INVENTORY.md), [private copy verification](COPY_REPORT.md), [architecture](ARCHITECTURE.md), [feature matrix](FEATURE_MATRIX.md), [implementation status](IMPLEMENTATION_STATUS.md), [roadmap](ROADMAP.md).

`reference-backup` contains a verified private copy of the supplied installation directory. `research` contains private package inventories, selected analysis artifacts and evidence. These directories are excluded by the root .gitignore. Git ignore rules are a convenience, not an access-control mechanism: publish only a reviewed app tree or its build output. No public repository or deployment was created.

No installer or supplied executable was launched. Source access restrictions were not changed. The original ZIP remains in Downloads. The app now uses licensed BodyParts3D surfaces with per-model source/license/hash provenance and independently written code. See DATASET_LICENSE_REVIEW.md. No Complete Anatomy assets or runtime dependency are included; clinical validation and full feature parity remain unverified.
