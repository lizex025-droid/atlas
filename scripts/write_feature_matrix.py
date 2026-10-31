from pathlib import Path
root=Path(__file__).resolve().parents[1]
public=(root/'research/PUBLIC_FEATURES.md').read_text(encoding='utf8')
implemented={
 'Orbit, zoom and pan':'Implemented: OrbitControls; browser verification recorded in IMPLEMENTATION_STATUS.',
 'Structure selection':'Implemented: mesh picking and keyboard-accessible structure list; schematic structures only.',
 'Preset camera views':'Implemented: front/side/back, focus and reset.',
 'Hide selection':'Implemented: per-structure and system visibility.',
 'Fade selection':'Implemented: per-structure opacity slider; intersecting transparency can have sorting artifacts.',
 'Hide/fade others':'Partial: isolate hides others; no batch fade-others action.',
 'Isolate':'Partial: isolate selection and show-all/reset; no automatic restoration of exact pre-isolation visibility.',
 'Breadcrumb hierarchy':'Partial: system-grouped catalogue and region metadata; no complete anatomical ancestor graph.',
 'Search anatomy and content':'Partial: original structure names, systems and regions; no quiz/media search.',
 'Home, undo and redo':'Partial: camera/workspace reset; no command-history undo/redo.',
 'Labels and custom labels':'Partial: structure-anchored text notes and delete; no free placement/drag/group styling.',
 'Textboxes':'Partial: structure notes; no resizable/styled overlay editor.',
 'Saved Screens':'Partial: local named scenes save camera, visibility, opacity, selection and notes; no cloud library.',
 'Restore system visibility':'Implemented subset: show-all and per-system visibility controls.',
}
out=['# Functional feature matrix','', 'This is a bounded discovery inventory, not a claim to enumerate every product feature. User interaction/behavior columns describe official documentation; none was runtime-tested in the supplied application. Proposed requirements are independent designs. Prototype status applies only to app v0.1.0.','', '## Original prototype and public product comparison','', '| Feature | Purpose | Documented interaction / behavior | Independent implementation requirement | Evidence | Prototype status |','|---|---|---|---|---|---|']
for line in public.splitlines():
 if not line.startswith('| ') or line.startswith('| Feature'):continue
 name=line.split('|')[1].strip()
 status=implemented.get(name,'Not implemented; publicly documented, supplied-build runtime unverified.')
 if name=='Built-in recording creation':status='Retired according to official support; excluded from current target.'
 if name=='Discover tool':status='Unknown current behavior; specification deferred.'
 out.append(line+' '+status+' |')
out+=['','## Accessible-file features and architecture clues','', '| Area | Purpose / interaction | Observed evidence | Independent requirement | Status / limits |','|---|---|---|---|---|',
'| Model catalogue | Choose full/regional/microscopic models | Parsed ModelConfigurations.plist keys: ModelIdentifier, ODRTag, ModelVersions, ModelRegions, RegionMask; private STATIC_FINDINGS.md | Licensed mesh catalogue and region taxonomy | Prototype only original 32-structure schematic; proprietary payload encoding unresolved |',
'| Rendering | Present opaque and transparent anatomy | ca-pipeline.json operation/texture schema, opaque and transparent pass vocabulary; REA Direct3D imports | Three.js materials and explicit depth policy | Prototype uses ordinary WebGL transparency; proprietary algorithm not reconstructed |',
'| Picking | Click structure | picking-pipeline.json Node.pickingColor declaration | Raycaster plus stable IDs | Prototype R3F event picking; shipped runtime unverified |',
'| Camera | Navigate scene | WOLScene camera notification strings with offsets in STATIC_FINDINGS.md | Orbit/pan/zoom and serializable camera | Prototype controls implemented; original camera math unknown |',
'| Annotation | Label anatomy | labelManagerData/State native strings | Original note schema and world anchors | Prototype anchored text; original serialization unknown |',
'| Animation | Motion and scene transitions | morphAnimations native strings and package shader/media entries | Licensed rigs/clips, player, timeline | Deferred; no native call graph/runtime verification |',
'| Bookmarks / scene loading | Return to study state | BookmarkValidator/Helper, SceneLoader strings | Versioned persistence and validation | Prototype local scenes; shipped storage schema unknown |',
'| Local storage | Retain data | Storage-related strings, no main-package .db/.sqlite/.sql filenames in bounded scan | App-owned typed schema | Prototype localStorage; filename absence does not rule out runtime databases |',
'| Web and services | Embedded panels, content delivery | Manifest WebView2 registrations, loopback content rules, internetClient; networking strings | Original optional backend and validated routing | No proprietary services called; actual endpoints/requests/entitlements unknown |',
'| Windows packaging | Offline installation | Bundle/resource/dependency packages and installer wrapper text | Independent desktop packaging only if requested | Original wrappers read only; prototype Vite browser app |',
'| Unsupported containers | Hold packaged content | WCAR/BIN/280NPLIST/Objective-J markers in STATIC_FINDINGS.md | Obtain independently licensed assets in documented formats | No decrypting, unpacking protected meshes, or proprietary model redistribution |',
'', '## Evidence and coverage','', '[Public feature evidence](research/PUBLIC_FEATURES.md) contains official URLs, historical corrections and unavailable-page notes. [Static findings](research/STATIC_FINDINGS.md) contains exact artifact names/offsets and bounded query coverage. [Architecture](ARCHITECTURE.md) cites REA Evidence IDs. [Implementation status](IMPLEMENTATION_STATUS.md) distinguishes executed tests from remaining gaps.','', 'Feature flags, subscription entitlements, offline completeness, platform-specific availability, authentication, online collaboration and every normal-use workflow of the supplied application remain unverified. No installer or supplied application was launched. Public sources are a snapshot reviewed 2026-10-31.']
(root/'FEATURE_MATRIX.md').write_text('\n'.join(out),encoding='utf8')
