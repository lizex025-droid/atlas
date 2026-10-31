# Interactive bone landmarks in the existing AnatomyAtlas app

This feature is integrated into the existing renderer, canonical bone selection, visibility tools, camera and local scene library. Both supplied reference images were visually opened. No AnatomyLearning meshes, textures, marker coordinates, scripts, text or branding were copied.

## Using it

Click an actual bone in the viewport to open Bony Markings and smoothly frame the bone. Multiselection retains its existing additive behavior. Search/list selection continues to open the standard information panel without moving the camera; use the Bony Markings button to enter study mode. Standard workspace / Workspace exits the mode and restores normal visibility context. Orbit, pan and zoom remain available.

The floating heading identifies the exact canonical bone. Circular surface markers use the category legend. Hover or keyboard focus shows the name; click selects the record, shows description, classification, side, relationships and source links, and frames the marker while retaining bone context. The list provides keyboard-accessible selection of occluded anchors. Whole bone returns to the overview. The Markers toggle affects points only; category filtering affects both points and list. Hidden points behind actual scene surfaces are not interactive. The details panel can collapse to its toolbar to expose the anatomy on a phone; portrait projection widens the usable view. Collapsed information controls are inert to keyboard/screen-reader navigation.

Surroundings supports isolated bone, dim context and ordinary context. This is a study display override over the normal scene, not destructive removal of other models. Layers, search, notes, opacity and saved scenes remain in the original application. Section clipping suppresses surface points with an explicit notice. Explode transforms the bone and its points together. Landmark-mode saved views retain the bone, chosen landmark, marker visibility, category, context, explode amount and current camera in a validated optional extension of v2 scenes. Older scenes remain valid.

## What is actually mapped

The first model-specific batch is **FMA9968, seventh thoracic vertebra (T7)**. Six gross surface anchors have been visually checked: anterior body, superior bony endplate, inferior bony endplate, spinous-process tip, and left/right transverse-process ends. The points are not cartilage segmentation, attachment footprints or clinical annotation approval.

There are 29 distinct T7 information identities, including bilateral pedicles, laminae, articular processes/facets, costal facets and vertebral notches. Twenty-three currently lack reliable surface coordinates or represent an anatomical space. The vertebral foramen is explicitly a space and receives no arbitrary floating point. Fine facet/notch positions remain pending because this polygon-reduced mesh does not establish reliable boundaries. No nearest extremum is automatically labelled as an anatomical feature.

The complete 206-bone reference is tracked, grouped by axial/appendicular division and source region, with 199 represented by current mesh-label mappings. Only one reference bone currently has reviewed anchor positions. Other installed bones can be isolated and inspected; existing knowledge features are listed as unmapped, and bones without researched features show an explicit unavailable state. This is a scalable system with a bounded first mapping batch, not complete 206-bone landmark coverage or independent medical certification.

## Binding and validation

`app/src/landmarks.ts` defines categories, feature IDs, medical source locators, coverage and context-aware framing. `src/content/t7-anchors.json` binds each point to the exact model SHA-256, canonical mesh ID, vertex/triangle counts, three vertex indices, barycentric weights, local position and normal. `landmarkGeometry.ts` resolves the point from the actual triangle; invalid indices, weights and positions are rejected. The renderer parents the points beside their bone inside the same Object3D transform. Normal offset only prevents surface z-fighting. Parent rotation, scale and translation carry both to world space.

The progressive loader checks SHA-256 before using a model. `LandmarkMarkers.tsx` checks the expected mesh binding/counts, resolves only reviewed positions and uses scene raycast occlusion through Drei Html. Marker selection is subordinate to the canonical bone selection; it never changes the bone to a feature lacking geometry. `BoneLandmarkExplorer.tsx` handles details, legend, missing coordinates and full reference coverage. New data does not claim independently segmented mesh regions.

`npm run landmarks:audit` verifies the bound file digest, actual rendered triangles, weights, positions, unique IDs and source links. It generates `app/public/landmarks/coverage.json`, `LANDMARK_COVERAGE_REPORT.md` and `LANDMARK_PROGRESS.json` with exact pending identities. The original anatomy knowledge inventory remains a separate denominator.

## Reproducible mapping workflow

1. Choose the correctly sided canonical model and verify its per-file licence/hash. Never mirror a left mapping onto a different right mesh without independent review.
2. Read reliable anatomy references and record source/rights/locators. Separate anatomy identity from geometric evidence.
3. Render and visually inspect orthogonal and oblique views of that exact mesh. `scripts/inspect-landmark-geometry.mjs` renders the installed T7 only, not a reference website. It supports `PLAYWRIGHT_CHROMIUM_EXECUTABLE` for an installed Chromium.
4. Manually identify a visible gross feature. The T7-only `scripts/bake-t7-landmarks.mjs` projects individually reviewed rays onto that surface and stores triangle coordinates. Its hard-coded seeds are not a general anatomical detector and must not be extrapolated to other bones.
5. Review annotated views, laterality, normals, actual surface contact and occlusion. Leave uncertain features unverified and null. Independent anatomical/clinical approval is a separate future gate.
6. Run the landmark audit, unit tests, browser workflows and production build; inspect screenshots. Update the persistent progress manifest with gaps, not fabricated points.

## Sources and rights

Original brief morphology explanations reference the consulted public-domain **1918 English** Gray chapters [General Characteristics](https://anatomie.cosminpopa.ro/en/3a-general-characteristics-of-a-vertebra/) and [Thoracic Vertebrae](https://anatomie.cosminpopa.ro/en/3a-2-the-thoracic-vertebr/), with section locators stored in code. Contemporary translations/site design and illustrations are not reused. These historical morphology references do not establish current clinical guidance. NCBI direct access presented a challenge during this pass; no restriction was bypassed and no article corpus was imported.

The existing BodyParts3D GLB is DBCLS content under its shipped CC BY-SA 2.1 Japan notices. Mesh-derived anchor coordinates retain those attribution/share-alike obligations; original interface/code and medical explanations are separate. No new external anatomical model was downloaded. The private Complete Anatomy research backup is unchanged.

## Limits still open

Independent medical review, the other 205 reference-bone mappings, fine T7 features, high-resolution geometry/textures, actual attachment/region masks and clinically validated anatomical variation coverage are not delivered. Source spatial regions also retain their existing review limitations. Review the generated report rather than treating 206 as an achieved mapping count.
