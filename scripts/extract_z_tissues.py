"""Extract licensed tissue meshes without executing code from the .blend.

Run with Blender 4.3.2:
  blender --factory-startup --disable-autoexec -b -t 2 --python-exit-code 1 \
    --python scripts/extract_z_tissues.py -- /path/to/Startup.blend /path/to/extraction
Keep the official Z-Anatomy.zip next to the resulting extraction subfolders.
"""
import hashlib
import json
from pathlib import Path
import re
import sys

import bpy
import numpy as np

CATALOG = Path(__file__).resolve().parents[1] / 'app/src/catalog.json'
ANCHORS = re.compile(
    r'^(?:Femur|Humerus|Tibia|Fibula|Radius|Ulna|Clavicle|Scapula|Hip bone|Patella|'
    r'Calcaneus|Talus|Frontal bone|Mandible|Sacrum|Vertebra [CTL]\d+|Medial head of gastrocnemius|'
    r'Rectus femoris muscle|Sciatic nerve|White matter of spinal cord|Pectoralis major muscle|'
    r'Sternocostal head of pectoralis major muscle|Ulnar nerve|Anterior part of deltoid muscle|'
    r'Calcaneal tendon)(?:\.[rl])?$',
    re.I,
)
TISSUE_TERMS = re.compile(
    r'\b(muscles?|nerves?|plexus|cauda equina|spinal ganglion|ganglia of sympathetic trunk|'
    r'sympathetic trunk|anterior horn of spinal cord|posterior horn of spinal cord|calcaneal tendon|'
    r'patellar ligament|epicranial aponeurosis|plantar aponeurosis|iliotibial tract|patellar retinaculum)\b',
    re.I,
)
BLEND_SHA256 = '9f08a17ea0115fed80b2a73ecdf0a1bc2ab2f6956f37c593ce23d513ea35afcd'

def normalize(name):
    return re.sub(r'\W+', ' ', re.sub(r'\b(?:muscles?|of the|the)\b', ' ', name.lower())).strip()

def selected_names(source):
    legacy = set()
    for model in json.loads(CATALOG.read_text()):
        if model['system'] != 'Muscular':
            continue
        label = model['name'].lower()
        side = re.search(r'\b(left|right)\b', label)
        legacy.add((normalize(re.sub(r'\b(left|right)\b', ' ', label)), side[1][0] if side else ''))
    with bpy.data.libraries.load(str(source), link=False) as (src, _):
        names = list(src.objects)
    anchors = [name for name in names if ANCHORS.fullmatch(name)]
    candidates = []
    for name in names:
        if name in anchors or not re.fullmatch(r'[^.]+(?:\.[lr])?', name):
            continue
        base, side = (name[:-2], name[-1]) if name.endswith(('.r', '.l')) else (name, '')
        if TISSUE_TERMS.search(name) or (normalize(base), side) in legacy:
            candidates.append(name)
    return anchors, candidates

def export_batch(source, names, output):
    output.mkdir(parents=True, exist_ok=True)
    scene = bpy.context.scene
    with bpy.data.libraries.load(str(source), link=False) as (_, target):
        target.objects = names
    for obj in target.objects:
        if obj and obj.name not in scene.objects:
            scene.collection.objects.link(obj)
    bpy.context.view_layer.update()
    depsgraph = bpy.context.evaluated_depsgraph_get()
    index = {}
    for obj in target.objects:
        if not obj or obj.type not in ('MESH', 'CURVE'):
            continue
        evaluated = obj.evaluated_get(depsgraph)
        uses_evaluated = bool(obj.modifiers) or obj.type == 'CURVE'
        mesh = evaluated.to_mesh() if uses_evaluated else obj.data
        try:
            if not len(mesh.vertices):
                continue
            vertices = np.empty(len(mesh.vertices) * 3, dtype=np.float32)
            mesh.vertices.foreach_get('co', vertices)
            matrix = np.array(evaluated.matrix_world)
            vertices = vertices.reshape(-1, 3) @ matrix[:3, :3].T + matrix[:3, 3]
            mesh.calc_loop_triangles()
            triangles = np.empty(len(mesh.loop_triangles) * 3, dtype=np.int32)
            mesh.loop_triangles.foreach_get('vertices', triangles)
            polygon_slots = np.empty(len(mesh.polygons), dtype=np.int32)
            mesh.polygons.foreach_get('material_index', polygon_slots)
            polygons = np.empty(len(mesh.loop_triangles), dtype=np.int32)
            mesh.loop_triangles.foreach_get('polygon_index', polygons)
            slots = [slot.material.name if slot.material else '' for slot in obj.material_slots]
            filename = f'{len(index)}.npz'
            np.savez_compressed(output / filename, v=vertices.astype(np.float32),
                                f=triangles.reshape(-1, 3), mat=polygon_slots[polygons])
            index[obj.name] = {'file': filename, 'mats': slots,
                               'bounds': [vertices.min(0).tolist(), vertices.max(0).tolist()]}
        finally:
            if uses_evaluated:
                evaluated.to_mesh_clear()
    (output / 'index.json').write_text(json.dumps(index, indent=2))
    for obj in target.objects:
        if obj:
            bpy.data.objects.remove(obj, do_unlink=True)
    bpy.data.orphans_purge(do_recursive=True)
    print(f'Extracted {len(index)} objects into {output}', flush=True)

def main():
    source, output = map(Path, sys.argv[sys.argv.index('--') + 1:])
    with source.open('rb') as stream:
        if hashlib.file_digest(stream, 'sha256').hexdigest() != BLEND_SHA256:
            raise ValueError('Source must match the pinned Z-Anatomy Startup.blend')
    anchors, candidates = selected_names(source)
    export_batch(source, anchors, output / 'probe')
    for offset in range(0, len(candidates), 100):
        export_batch(source, candidates[offset:offset + 100], output / f'selection-{offset // 100}')

if __name__ == '__main__':
    main()
