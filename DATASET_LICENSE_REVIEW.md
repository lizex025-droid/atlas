# Anatomical dataset review and imported asset rights

Reviewed 2026-10-31 before dataset acquisition/integration. No Complete Anatomy reference files were read or changed during this development pass.

## BodyParts3D

Primary download page: https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html

The official license page https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html (updated 2025-02-27) offers the database under CC Attribution 4.0 International. That page was fetched and verified before downloading the official 4.0 archives. Copies and hashes of the page/metadata are retained in the ignored `model-sources/bodyparts3d-4.0` acquisition cache.

The downloaded vintage OBJ files themselves retain **CC Attribution-Share Alike 2.1 Japan** notices. The importer checks that notice in every candidate OBJ header before conversion, rejects missing/unknown licenses, and records source-member SHA-256, archive URL, source member, FMA ID, output chunk and modifications per imported mesh. This project preserves the embedded CC BY-SA 2.1 Japan terms for its converted meshes and asset contributions, rather than stripping the older notice on the strength of the current website grant. License: https://creativecommons.org/licenses/by-sa/2.1/jp/ . Attribution, license links, changes and share-alike declaration ship with the assets and are linked visibly in the app.

Archives obtained directly from the official host:

- `partof_BP3D_4.0_obj_99.zip`, 64,888,505 bytes, SHA-256 `9fbc713fffeee924a5a657d9813d84d7eb957bded63adb854931dd5e3eb61c97`.
- `isa_BP3D_4.0_obj_99.zip`, 142,903,898 bytes, SHA-256 `40665852c49f218326590e204db91064a1ecfc3c6f8cbd7bbbcaac62c7cd409e`.

PART-OF supplies the initial whole-body elements; IS-A supplements skeletal/muscular elements. Same FJ elements are imported once. Constituents sharing an FMA concept are grouped into a single selectable structure. Elements without verified FMA mapping are excluded and recorded. Per-source/per-output details are in `app/public/models/bodyparts3d/manifest.json`. No files were fetched from unofficial asset mirrors.

The published source archives are already **99% polygon-reduced**. Conversion preserves their remaining triangle surfaces, applies one uniform scale and rigid axis rotation, generates smooth normals, and packs indexed geometry into GLB. No additional decimation, mesh invention or medical reshaping is applied. The anatomical source is established; clinical accuracy and fidelity at every landmark have not been independently validated.

## Z-Anatomy

Primary license reviewed: https://github.com/Z-Anatomy/Models-of-human-anatomy/blob/master/License.txt

The repository broadly declares CC BY-SA 4.0 and credits BodyParts3D. Its own credits also identify incorporated reference/adapted assets under CC BY-NC-SA 4.0 (inner ear) and CC BY-NC 4.0 (kidney), plus other sources. Blanket repository licensing is therefore insufficient to establish the rights of every individual model. **No Z-Anatomy meshes were downloaded or integrated.** A future importer must resolve each selected asset's source and applicable terms before acquisition. This does not block the directly sourced BodyParts3D implementation.

## Boundaries

The procedural 32-structure catalogue is replaced as the default content. Converted assets and their metadata are a separately attributed collection. Application code and software-library licenses remain separate; the old original-model CC0 declaration does not apply to BodyParts3D. No application brand, restricted anatomy model, code, shader or metadata from the private Complete Anatomy research copy is included.


## v0.3 scoped follow-up

The earlier no-Z-Anatomy-import statement describes v0.2. A later scoped review selected only Palmar aponeurosis.l/.r, covered by the official repository CC BY-SA 4.0 grant and not the named kidney/inner-ear exceptions. These two surfaces are now separately attributed and manifested. No blanket import of the archive occurred. See ANATOMICAL_SOURCES.md for extraction, license and registration details. Source archive is retained only in the ignored acquisition cache. Geometry was read with an official checksum-verified Blender runtime, factory startup and --disable-autoexec; source template scripts were not run.
