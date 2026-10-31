# Anatomical model provenance and licenses

The entrance/catalogue uses 32 original Three.js renders of the licensed local meshes described below. public/previews/manifest.json records each image's canonical members, SHA-256, size and source-manifest/license references; ATTRIBUTION.txt gives credits. Generated renders retain the applicable attribution/share-alike obligations. No reference-site screenshots or proprietary anatomy imagery are included.

Default anatomy is BodyParts3D 4.0 from the official LSDB Archive, not the original 32 procedural placeholders.

BodyParts3D, (c) The Database Center for Life Science licensed under CC Attribution-Share Alike 2.1 Japan.
https://creativecommons.org/licenses/by-sa/2.1/jp/
https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html

Every imported OBJ header was checked before conversion. Although the current archive webpage offers CC BY 4.0, this conversion retains the older CC BY-SA 2.1 Japan notices embedded in these vintage meshes. Converted assets, asset contributions and derived catalogue/chunk metadata are distributed under CC BY-SA 2.1 Japan. The earlier CC0 declaration applied to the retired original procedural geometry, and does not cover these assets.

Changes: constituents grouped by FMA ID; indexed GLB conversion, rigid coordinate rotation, uniform scale and generated smooth normals. Upstream OBJ release is already 99% polygon-reduced. No additional decimation or anatomical reshaping. Application-assigned system colors, source taxonomy plus rule-based system assignment, and approximate spatial region filters are independent presentation choices.

Per-source URLs, mesh-member hashes, license evidence, archive identities and per-output hashes are in public/models/bodyparts3d/manifest.json. Attribution and changes ship as ATTRIBUTION.txt and are linked in the viewer. The source license page snapshot is also retained. See ../DATASET_LICENSE_REVIEW.md for the distinction between current webpage terms and embedded notices, and why Z-Anatomy assets were not imported.

No Complete Anatomy code, branding, meshes, shaders, content metadata or services are part of this application. Software dependencies retain their separate licenses. No anatomical accuracy, completeness, current nomenclature or clinical fitness has been independently certified.


## v0.3 selected supplement

Only Palmar aponeurosis.l and .r from the official Z-Anatomy Blender archive are included as separate CC BY-SA 4.0 assets and contributions. Credits: Z-Anatomy / Gauthier Kervyn; BodyParts3D / DBCLS credited upstream. See public/models/z-anatomy/SOURCE_LICENSE.txt, ATTRIBUTION.txt and manifest.json. No separately credited noncommercial kidney/inner-ear assets, templates, definitions, shaders, materials or scripts are distributed. Four mesh-center anchors provide approximate similarity registration; anatomical alignment remains independently unreviewed. Source and output hashes are recorded. This supplement does not relicense the main BodyParts3D collection.
