# Interaction specification

## Interactive Bony Markings

A 3D raycast click on a bone now enters focused bone study unless additive multiselection is enabled. Search/list selection retains the standard camera-preserving knowledge workflow, with an explicit Bony Markings button. Study mode has a floating canonical-bone heading, compact details/list, surroundings control, category legend/filter, marker toggle and Whole bone/Workspace return controls.

Surface points follow the bone's local transform and hide behind scene geometry. Hover/focus names the feature; click keeps a persistent bone-scoped selected ID and frames the feature with whole-bone context. Accessible list buttons also reach occluded points. Unmapped features show their actual information and missing-position reason without highlighting a fabricated surface. The vertebral foramen is a space, not a surface marker. Section clipping suppresses points with a notice. Landmark views restore through the original Library using validated optional scene metadata. Exact coverage is in LANDMARK_COVERAGE_REPORT.md.

## v0.4 selection-to-knowledge behavior

Normal mesh, search, feature and parent selection updates the canonical record and breadcrumbs without camera movement. Focus and double-click are explicit camera actions. Changing identity cancels previous pronunciation and resets the content tab/scroll; changing tabs resets content scroll. Per-category tabs expose actual fields, and missing information remains unavailable rather than borrowing a previous structure's article.

Parts, surfaces and landmarks with a semantic record open that record. A feature without segmented geometry has no mesh highlight or pretend isolate target; its parent control returns to the correct side-specific bone. Cross-Sections explains the absence of licensed slice data; visual section clipping is a separate scene tool.

Listen calls browser SpeechSynthesis, supports stop/cancellation and reports completion/errors. English and available Latin text are separate requests. IPA is shown only where sourced; synthesized Latin fallback is explicitly approximate. No verified recorded audio is implied. Coverage filters and row inspection expose incomplete profiles without hiding them. Importing data cannot grant medical approval.

## Coordinated selection

One workspace state owns the primary canonical ID, selected mesh-ID set, group ID, hidden IDs, opacity, camera and annotations. Anatomical facts are resolved synchronously from the offline repository. Mesh/list/search selection replaces the primary record; switching records resets the information tab to Description. Multi selection adds geometry to the active set. Semantic palmar-aponeurosis selection resolves its installed left mesh; left/right mesh selections resolve the corresponding source-backed record.

Click selects; double-click or Focus frames bounds while preserving the current viewing direction. Parent breadcrumbs resolve known mesh groups, reveal their members and frame them. Source parent chains supplement curated T11 navigation. Unknown parents are disabled instead of pretending to navigate. Camera interpolation is interruptible by OrbitControls and disabled by reduced motion. Opening drawers does not alter viewport bounds or remount the Canvas.

## Visibility and tools

Isolate/Hide others hide the complement of the selection; Hide hides the selected set and clears its primary selection; Fade reduces selected opacity to 0.18; Fade others changes the complement. Reset visibility restores all objects and opacity. Undo restores the previous workspace snapshot (up to 30). System buttons can combine layers, remove hidden selections and dispose no-longer-needed chunks. A system with no registered geometry is disabled and labelled unavailable.

Tools include bounds focus/reset, opacity, annotations, a movable sagittal clipping plane and an exploded display transform. Clipping has no caps and is not labelled a clinical cross-section. Explode separates existing mesh objects without inventing subdivisions or physiological motion. Measurement and pronunciation are explicitly unavailable without validated calibration/audio.

## Navigation and persistence

Right rail: Hub offers anatomy entry points; Search searches names, source IDs, Latin terms and checked synonyms with grouped/system-filtered results; Tools controls actual scene state; Library stores local named study views; Store opens an honestly labelled model-source catalogue; Settings changes quality/accessibility/controls; Save Scene opens Library; Help explains controls. No checkout/account functionality is implied.

Search shortcut /; Escape closes a drawer; Ctrl/Cmd+Z undoes outside text fields. Existing v2 views preserve camera, primary/multi/group selection, visibility, opacity and notes. Older v2 records without multi/group fields restore safely. v1 schematic records remain untouched. Display preferences use separate local storage. Clipping/explode are transient tools and reset on scene restoration; they are not currently serialized.

## Required study flows

T11: search T11 or select its mesh; show canonical FMA10059, source-checked facts and Latin term with XI level qualifier; explore Description/Parts/Surfaces/Landmarks/Relations/Sources; isolate and focus. Its parts/surfaces are described but not separately segmented in the installed mesh, which the panel states explicitly.

Palmar aponeurosis: search English/Latin; highlight the installed Z-Anatomy left/right surface; replace T11 content/tabs/hierarchy; show attachments, relationships and a brief clinical note with citations. Transverse-fibre subregions are not mapped. Alignment of the supplemental surface is approximate and disclosed. Related palmaris-longus geometry is linked as a different structure, never substituted for fascia.

## Entrance, collection and identification practice

Root / opens the entrance, #atlas the collection and #workspace the full-body workspace. Browser Back/Forward follows these routes. Tiles open the atlas, identification practice, saved views or the visual section tool. Before first entry no Canvas, GLB or graphics bundle loads. Later catalogue visits retain the resident workspace; Continue study returns without re-fetching it.

The collection has twelve system sections plus an unclassified section. Twenty-eight regional groups partition all 1,171 surfaces once. Hand metadata maps to upper-limb browsing without changing source records. Sections collapse; the optional index jumps within the scroll area. Search shares the canonical repository. Cards reveal actual meshes, frame bounds and update group information/system controls. Missing system geometry is explicit.

Practice has three original four-choice mesh-name questions. Names, notes and information are hidden during questions; camera controls remain available. Answering locks the choice, checks the source name and updates feedback/score. Next isolates another real mesh; completion permits replay or return to exploration. No timers, persisted quiz progress, clinical grading or comprehensive question bank is claimed.
