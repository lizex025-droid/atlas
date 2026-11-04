# Body Browser 3D source audit and Atlas integration

Source: https://github.com/sanjeedha/body_browser_3D (default branch `master`).
Target: https://github.com/lizex025-droid/atlas (default branch `main`).
Reviewed: 2026-11-04.

## What is actually in the source

A legacy static HTML / Three.js / COLLADA demonstration of 3D models, not a structured human-anatomy knowledge base.

- Human viewer: `human.html`; a three-position range control chooses male, skeleton and female COLLADA scenes.
- Camera: `js/OrbitControls.js` enables orbit-style model manipulation; `human.html` adds lights, camera and renderer.
- Other demonstration pages: `index.html`, `ele.html`, `rav.html`, `lb.html`, `mammoth.html` (mammoth, raven, lion cub and human navigation).
- Legacy localisation: `js/localization_humanbody.js` contains static English, Spanish and Telugu navigation labels. These are not a translated clinical anatomy database.
- Legacy dependencies: local `three.min.js`, `ColladaLoader.js`, `OBJLoader.js`, jQuery and Bootstrap, plus older mobile/animation/gallery libraries.
- Five Collada assets: `images/Hand.dae`, `images/body.dae`, `images/girl-dae/girl.dae`, `images/man-dae/male.dae`, `images/skeleton.dae`. These are not per-bone/per-muscle semantic records.
- Human page includes fixed-size geometry layout, repeated library script inclusions and HTTP resources; do not adopt these patterns into a current mobile-first application.
- No top-level README or LICENSE or other explicit license file appeared in the repository tree at the time of review. Public GitHub visibility alone does not confer redistribution rights.
- Source does NOT supply sourced bone landmarks, detailed origin/insertion/action/innervation records, verified clinical notes, or a complete index of 206 bones.

## What Atlas already provides

React 19, Three.js 0.180 with React Three Fiber, responsive 3D gestures, progressive licensed BodyParts3D surface chunks, search/hierarchy, multi-selection, isolate/hide/fade, information panels, citations, bony-marking study mode, camera presets, annotations, saved views, identification quizzes and system layers.

The historic source's orbit navigation is already covered by Atlas and should not introduce a second 3D engine or obsolete JavaScript bundle. Models from the other project should not be imported without asset-by-asset permission and mesh/identity verification. Male/female body shape switching cannot honestly be added from Atlas's existing models without separate appropriately licensed, anatomically validated assets.

## Implemented: fast anatomy view presets

New `app/src/modelModes.ts`, `app/src/modelModes.css` and `app/src/modelModes.test.ts` provide a compact four-way switch:

1. Skeleton - Atlas's original full skeletal mesh subset.
2. Muscles - muscular meshes.
3. Nerves - nervous meshes.
4. Organs - digestive, respiratory, endocrine and urogenital meshes.

The preset changes only which **existing licensed Atlas structures** are visible. It does not mislabel an available model as male, female or a fully dissected body. Transitions preserve the user's current 3D camera (including orbit position), retain notes, clear obsolete opacity and discard invisible selected structures; Atlas's existing Undo allows reversing transitions. The active setting is derived from actual visibility so restored study views and manual layer toggles cannot show an incorrect preset. Mobile uses touch-sized horizontal scrolling controls. No new model download endpoint is introduced.

## Not imported / next steps

- No source code, 3D assets, graphics, medical prose or historic third-party packages were copied.
- No new language translation claimed. Translation should cover the modern Atlas UI and medically verified terminology, not the source's old navbar only.
- No multi-sex morphology without separately verifiable asset licensing, correspondence mapping, quality controls and valid attribution.
- No non-human demonstrations, because Atlas is a human anatomy educational application.
- No claim of complete anatomical records. Content completeness remains governed by Atlas's existing coverage audit and source-reviewed content pipeline.

If future rights are established for a model, convert and validate outside production first, record provenance and source hashes, reconcile structure IDs, and audit performance and mobile usage before adding it.
