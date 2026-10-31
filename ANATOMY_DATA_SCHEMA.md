# Offline anatomical knowledge schema

## Bone-landmark schema extension

`landmarks.ts` adds bone-scoped feature IDs, category, laterality, description/relations, source IDs, surface/region/space distinction, mapping status and explicit missing-position reason. Reviewed anchors in `content/t7-anchors.json` include canonical mesh, model digest, coordinate space, triangle vertex IDs, barycentric weights, local position/normal, review evidence and derivative-data licence. A missing anchor is null, never a random position.

`SceneState.landmarkView` is an optional backward-compatible v2 scene field containing canonical bone/landmark, marker visibility, category, context and explode amount. Validation rejects cross-bone selections, unknown feature IDs, invalid categories and nonfinite transforms. The renderer reconstructs the anchor from actual indexed geometry under the parent Object3D transform. Per-bone 206-reference coverage is exported separately from the existing 1,171 modeled knowledge-record denominator.

## v0.4 model-driven knowledge layer

`app/src/knowledgeSchema.ts` separates medical types from rendering. Records carry stable IDs, laterality, parent/child links, standard terminology IDs, category-specific sections, claim-level source locators, content/review status, version and pronunciation metadata. Missing facts remain empty and evaluated as gaps. A consulted source is not independent medical approval.

`knowledge.ts` resolves cached records synchronously from the model catalogue, the researched batch and validated imports. There are 1,171 modeled identities plus 113 semantic-only identities. The new 112 feature records have no segmented mesh IDs; their parent bone remains a separate entity. No whole-bone mesh is presented as an isolated landmark.

`knowledgeDatabase.ts` exports normalized structures, names, hierarchy, sections, relationships, mesh mappings, sources, per-claim evidence, pronunciation, clinical correlations, variations and validation results. This audit export is not fetched on selection. `knowledgeImport.ts` validates JSON/quoted-CSV imports and increasing versions. `coverage.ts` evaluates category requirements and all mappings; no short paragraph qualifies as a complete record.

See [population workflow](CONTENT_POPULATION_WORKFLOW.md), [actual coverage](ANATOMICAL_COVERAGE_REPORT.md) and `CONTENT_PROGRESS.json`. The current runtime uses local cached JSON, not a production database server. Partitioned content loading remains future work for a substantially larger corpus.

Catalogue extension: AtlasCard stores id, title, canonical mesh members and preview URL; AtlasSection groups cards by presentation system. Source region fields remain unchanged, with Hand normalized only for upper-limb browsing. Registry group IDs permit existing version-2 scenes to retain regional selections. Source-informed classification still needs anatomical review.

The preview manifest records generator, source-model manifests, canonical member IDs, bytes and SHA-256 for 32 original WebP renders. Images retain the applicable attribution/share-alike obligations; they are views of installed meshes, not clinical evidence. Practice questions reference canonical mesh IDs and use the source English name as the answer; no medical facts are generated at runtime.

Implementation: app/src/knowledge.ts (typed persistent source records), anatomy.ts/catalog.json/supplemental.json (geometry registry), registry.ts (canonical/group/system resolution), workspace.ts (selection/visibility/framing), scene.ts (validated scene persistence). There is no per-click generative medical service or medical network lookup.

AnatomyRecord includes id, officialName, latinName nullable, synonyms, anatomicalSystem, region, parentId, childrenIds, hierarchyPath, description, classification, location, quickFacts, structureAndFunction, parts, surfaces, landmarks, attachments, articulations, anatomicalRelations, clinicalNotes, images, modelIds, meshIds, sourceReferences, verificationStatus, lastReviewedAt and kind. Type-specific extensions support origin, insertion, innervation, bloodSupply, actions, course and branches. Unpopulated facts stay empty, not fabricated.

Each Fact stores original text and source-ID references. A Feature adds a local semantic ID, name, optional Latin term and meshIds. A relationship can link a target canonical ID. SourceReference stores title, URL, locator, rights/reuse assessment, use boundary and access date. Feature IDs such as t11:body are local knowledge identifiers, not falsely asserted FMA or TA2 IDs. T11's level-specific Latin label is explained as a standard term plus XI, not a separate TA2 headword.

Verification distinguishes source-checked from metadata-only. Source-checked means the cited material was consulted and the short original fact statement cross-checked; it does not imply independent medical-expert certification. Clinical review remains pending and is shown in the UI. The first checked records cover T11, palmar aponeurosis and both palmaris-longus structures; left/right fascia aliases share side-neutral facts. Other entries provide licensed terminology/geometry and explicit missing-data states.

Data pipeline: identify exact concept -> consult primary terminology/anatomy sources -> assess rights -> write a concise original factual explanation -> attach per-fact references and review date -> bind only verified mesh identity -> validate references/IDs in tests -> publish with the app for offline retrieval. No source images are bundled in the knowledge records. Adding a mesh requires source/license/hash/transform provenance and separate review of anatomical alignment.

The asset manifest and anatomical record are distinct: a valid mesh license does not verify a clinical fact, and a checked fact does not prove geometry or a segmented landmark exists. Arbitrary cached medical results cannot replace source records. Selection updates synchronously; GLB loads use abort/identity checks to discard stale results.
