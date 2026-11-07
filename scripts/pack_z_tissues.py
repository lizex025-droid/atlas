"""Build the licensed muscle/nerve supplement from extracted Z-Anatomy arrays.

Usage: python scripts/pack_z_tissues.py EXTRACTED_DIRECTORY GLTFPACK
EXTRACTED_DIRECTORY contains index.json files from extract_z_tissues.py.
Requires NumPy, SciPy and native gltfpack 1.0. Extract only the official pinned source.
"""
import argparse
import collections
import hashlib
import json
from pathlib import Path
import re
import struct
import subprocess
import tempfile

import numpy as np
from scipy.interpolate import RBFInterpolator

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'app/src'
OUT = ROOT / 'app/public/models/z-anatomy'
SOURCE_COMMIT = '8dd357ed52a675db0c5f8d7fa9a8621cbfeee713'
SOURCE = 'https://github.com/Z-Anatomy/Models-of-human-anatomy'
SOURCE_ARCHIVE_SHA256 = 'e029688545627bd0214b269e1063143abb580aad72b2c2445d6d8a9a0d9da736'
ATTRIBUTION = 'Z-Anatomy / Gauthier Kervyn (CC BY-SA 4.0); BodyParts3D / DBCLS credited upstream'
REGIONS = ('Head & neck', 'Trunk', 'Upper limbs', 'Lower limbs & pelvis')
MUSCLE_MATERIALS = {
    'Abductor', 'Adductor', 'Extension', 'External rotation', 'Flexion', 'Internal rotator',
    'Flexion fingers', 'Levator', 'Extensor extremities', 'Depressor', 'Biarticular',
    'Extension hand/foot', 'Flexion hand/foot', 'Orbicularis/Constrictor', 'Ingestion',
    'Phonation', 'Superficial', 'Trapezius', 'Masticator', 'Diaphragm',
}
CONNECTIVE = {'calcaneal tendon', 'patellar ligament', 'epicranial aponeurosis', 'plantar aponeurosis'}
CORD = {'White matter of spinal cord', 'Anterior horn of spinal cord', 'Posterior horn of spinal cord'}
ALIASES = {
    'external abdominal oblique': 'external oblique', 'internal abdominal oblique': 'internal oblique',
    'scapular spinal part of deltoid': 'spinal part of deltoid',
    'inferior gemellus': 'gemellus inferior', 'superior gemellus': 'gemellus superior',
    'obliquus inferior capitis': 'obliquus capitis inferior',
    'obliquus superior capitis': 'obliquus capitis superior',
    'rectus anterior capitis': 'rectus capitis anterior',
    'rectus lateralis capitis': 'rectus capitis lateralis',
    'rectus posterior major capitis': 'rectus capitis posterior major',
    'rectus posterior minor capitis': 'rectus capitis posterior minor',
    'interspinales thoracis': 'interspinalis thoracis',
    'anterior belly of digastric': 'digastric', 'posterior belly of digastric': 'digastric',
}
# These compound surfaces overlap an existing separately selectable constituent.
OVERLAPPING_GROUPS = re.compile(
    r'^longus colli$|^iliocostalis colli$|^longissimus colli$|^spinalis colli$|'
    r'^semispinalis colli$|^splenius colli$|^.*intertransversarii.*lumborum$|'
    r'^oblique arytenoid$|^ary epiglottic part of oblique arytenoid$|'
    r'^lumbrical .*foot$|^plantar interossei$'
)

def identity(name):
    value = name.lower()
    side = ''
    if value.endswith(('.l', '.r')):
        value, side = value[:-2], value[-1]
    elif match := re.search(r'\b(left|right)\b', value):
        side = match[1][0]
        value = value[:match.start()] + value[match.end():]
    value = re.sub(r'\b(?:muscles?|the)\b', ' ', value)
    value = re.sub(r'\b(clavicular|sternocostal|abdominal) head\b', r'\1 part', value)
    key = ' '.join(re.findall(r'[a-z0-9]+', value))
    return ALIASES.get(key, key), side

def source_name(name):
    if name.endswith(('.l', '.r')):
        return ('Left ' if name[-1] == 'l' else 'Right ') + name[0].lower() + name[1:-2]
    return name

def read_objects(directory):
    objects = {}
    for index in sorted(directory.glob('*/index.json')):
        for name, row in json.loads(index.read_text()).items():
            if name in objects:
                raise ValueError(f'Duplicate source object: {name}')
            objects[name] = {**row, 'file': index.parent / row['file']}
    return objects

def registration(objects, catalog):
    ordinals = 'first second third fourth fifth sixth seventh eighth ninth tenth eleventh twelfth'.split()
    bones = {m['name'].lower(): m for m in catalog if m['system'] == 'Skeletal'}
    anchor_names = {
        'frontal bone', 'mandible', 'sacrum', 'ulna', 'radius', 'humerus', 'scapula', 'clavicle',
        'hip bone', 'femur', 'patella', 'tibia', 'fibula', 'talus', 'calcaneus',
    }
    anchors = []
    for name, row in objects.items():
        label = source_name(name).lower()
        if match := re.fullmatch(r'vertebra ([ctl])(\d+)', label):
            kind = {'c': 'cervical', 't': 'thoracic', 'l': 'lumbar'}[match[1]]
            label = f'{ordinals[int(match[2])-1]} {kind} vertebra'
        elif identity(name)[0] not in anchor_names:
            continue
        if label in bones:
            anchors.append((name, row, bones[label]))

    x = np.array([np.mean(row['bounds'], axis=0) for _, row, _ in anchors])
    y = np.array([m['position'] for _, _, m in anchors])
    a, b = x - x.mean(0), y - y.mean(0)
    u, _, vh = np.linalg.svd(a.T @ b)
    rotation = u @ vh
    scale = np.sum((a @ rotation) * b) / np.sum(a * a)
    translation = y.mean(0) - x.mean(0) @ rotation * scale
    assert len(anchors) >= 45 and np.linalg.det(rotation) > 0 and 3.1 < scale < 3.4
    fitted = x @ rotation * scale + translation
    residuals = y - fitted
    # Smooth small corrections between nearby landmarks; this preserves complete
    # nerve trees without segment seams. Atlas positions and side remain explicit.
    displacement = RBFInterpolator(fitted, residuals, kernel='thin_plate_spline', smoothing=.035)
    def transform(vertices):
        points = vertices @ rotation * scale + translation
        delta = displacement(points)
        # Cap extrapolation outside the sampled skeleton.
        delta *= np.minimum(1, .085 / np.maximum(np.linalg.norm(delta, axis=1, keepdims=True), 1e-8))
        return (points + delta).astype('<f4')

    def rms(positions):
        return round(float(np.sqrt(np.mean(np.sum((positions - y) ** 2, axis=1)))), 6)
    evidence = {
        'method': 'Similarity fit and regularized thin-plate interpolation of bony bounding-box centers',
        'anchors': [{'sourceObject': n, 'atlasId': m['id']} for n, _, m in anchors],
        'scale': scale, 'rotation': rotation.tolist(), 'translation': translation.tolist(),
        'rigidFitRms': rms(fitted), 'correctedAnchorRms': rms(transform(x)),
        'maxCorrectionWorldUnits': .085,
        'status': 'Registered to Atlas; independent anatomical validation pending.',
    }
    return transform, evidence

def region_for(name, system, bounds):
    center = bounds.mean(0)
    if system == 'Nervous':
        if re.search(r'brachial plexus|radial nerve|ulnar nerve|median nerve|brachial cutaneous|'
                     r'musculocutaneous|axillary nerve|pectoral nerve|scapular nerve|'
                     r'thoracodorsal|long thoracic nerve|subclavian nerve|palmar digital|subscapular',
                     name, re.I):
            return REGIONS[2]
        if re.search(r'spinal|cauda equina|intercostal|sympathetic|splanchnic|vagus|'
                     r'iliohypogastric|ilio-inguinal|genitofemoral', name, re.I):
            return REGIONS[1]
    if center[1] > 1.87:
        return REGIONS[0]
    if center[1] < -.23 or re.search(r'glute|femoral|obturator nerve|pudendal|plantar|'
                                     r'pyramidalis|iliacus|psoas minor', name, re.I):
        return REGIONS[3]
    if abs(center[0]) > .53:
        return REGIONS[2]
    return REGIONS[1]

def tissue_models(objects, catalog, transform):
    lookup = collections.defaultdict(list)
    for model in catalog:
        lookup[identity(model['name'])].append(model)
    grouped = collections.defaultdict(list)
    for name, row in objects.items():
        key, side = identity(name)
        materials = set(row['mats'])
        if re.search(r'cochlear nerve|^vestibular nerve', name, re.I):
            continue  # Separately credited inner-ear material.
        if (any(re.fullmatch(r'Nerve(?:-[1-8])?', m) for m in materials) or name in CORD):
            system = 'Nervous'
        elif key in CONNECTIVE and 'Tendon' in materials:
            system = 'Connective Tissue'
        elif MUSCLE_MATERIALS & materials and not re.search(r'papillary muscle|sheet', name, re.I):
            system = 'Muscular'
        else:
            continue
        matches = [m for m in lookup[key, side] if m['system'] == system]
        # Treat the two sides of a set of intercostal layers as constituents of
        # the existing unsided ID. Keep the smaller, separately named structures.
        if re.search(r'^.*intercostal$', key) and system == 'Muscular':
            matches = [m for m in lookup[key, ''] if m['system'] == system]
        if len(matches) > 1 or (not matches and OVERLAPPING_GROUPS.search(key)):
            continue
        existing = matches[0] if matches else None
        model_id = existing['id'] if existing else 'ZAN:' + re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
        grouped[model_id].append((name, row, system, existing))

    for model_id, parts in sorted(grouped.items()):
        names, data, systems, existing_models = zip(*parts)
        system, existing = systems[0], existing_models[0]
        vertices, faces, weights, sources = [], [], [], []
        offset = 0
        for name, row in zip(names, data):
            with np.load(row['file']) as geometry:
                v = transform(geometry['v'])
                f = geometry['f'].astype('<u4')
                if not len(f) or not np.isfinite(v).all() or np.max(np.abs(v)) > 4:
                    raise ValueError(f'Invalid geometry for {name}')
                slots = np.array([m in ('Tendon', 'Fascia') for m in row['mats']], dtype=np.float32)
                mask = slots[geometry['mat']]
                source_hash = hashlib.sha256()
                for array in (geometry['v'], geometry['f'], geometry['mat']):
                    source_hash.update(array.tobytes())
            area = np.linalg.norm(np.cross(v[f[:, 1]] - v[f[:, 0]], v[f[:, 2]] - v[f[:, 0]]), axis=1)
            tendon = np.zeros(len(v), dtype=np.float32)
            total = np.zeros(len(v), dtype=np.float32)
            for corner in f.T:
                np.add.at(tendon, corner, area * mask)
                np.add.at(total, corner, area)
            vertices.append(v)
            faces.append(f + offset)
            weights.append(tendon / np.maximum(total, 1e-12))
            sources.append({'sourceObject': name, 'sourceObjectGeometrySha256': source_hash.hexdigest()})
            offset += len(v)
        v, f, w = np.concatenate(vertices), np.concatenate(faces), np.concatenate(weights)
        bounds = np.array([v.min(0), v.max(0)])
        if existing:
            old_size = np.linalg.norm(existing['size'])
            center_shift = np.linalg.norm(bounds.mean(0) - existing['position'])
            ratio = np.linalg.norm(np.ptp(bounds, axis=0)) / old_size
            if center_shift > max(.12, .27 * old_size) or not .63 <= ratio <= 1.62:
                print(f'Skipping outlying match {model_id} {names}: center {center_shift:.3f}, size ratio {ratio:.3f}')
                continue
        center = bounds.mean(0)
        name = existing['name'] if existing else source_name(names[0])
        region = existing['region'] if existing else region_for(name, system, bounds)
        if existing and system == 'Muscular' and region == 'Trunk' and (
            abs(center[0]) > .53 or re.search(r'biceps brachii|triceps brachii|deltoid', name, re.I)
        ):
            region = REGIONS[2]
        color = {'Muscular': '#a6412e', 'Nervous': '#d8aa55', 'Connective Tissue': '#d5c5a2'}[system]
        if existing:
            parents = existing['parents']
        else:
            slug = re.sub(r'[^a-z]+', '-', region.lower()).strip('-')
            parents = [{'id': 'group:tissue:' + system.lower().replace(' ', '-') + ':' + slug,
                        'name': system + ' · ' + region}]
        row = {'id': model_id, 'name': name, 'system': system, 'region': region, 'color': color,
               'position': center.round(6).tolist(), 'size': np.ptp(bounds, axis=0).round(6).tolist(),
               'parents': parents, 'description': 'Z-Anatomy surface registered to the Atlas skeleton.', 'shapes': []}
        provenance = {'id': model_id, 'sources': sources, 'license': 'CC-BY-SA-4.0',
                      'replacesBodyParts3D': existing is not None,
                      'sourceTriangles': len(f), 'sourceTendonFaces': bool(np.any(w > 0)),
                      'changes': 'Landmark registration, indexed GLB, smooth normals, tendon weights, bounded simplification and meshopt.'}
        yield row, provenance, v, f, w

def write_glb(path, batch, copyright_notice=ATTRIBUTION):
    binary = bytearray()
    views, accessors, nodes, meshes = [], [], [], []
    def attribute(array, component, kind, target=34962, bounds=False):
        binary.extend(b'\0' * (-len(binary) % 4))
        data = array.tobytes()
        views.append({'buffer': 0, 'byteOffset': len(binary), 'byteLength': len(data), 'target': target})
        binary.extend(data)
        info = {'bufferView': len(views)-1, 'componentType': component, 'count': len(array), 'type': kind}
        if bounds:
            info.update(min=array.min(0).tolist(), max=array.max(0).tolist())
        accessors.append(info)
        return len(accessors) - 1
    for row, _, v, f, tendon in batch:
        normals = np.zeros_like(v)
        cross = np.cross(v[f[:, 1]]-v[f[:, 0]], v[f[:, 2]]-v[f[:, 0]])
        for corner in f.T:
            np.add.at(normals, corner, cross)
        normals /= np.maximum(np.linalg.norm(normals, axis=1, keepdims=True), 1e-8)
        attributes = {'POSITION': attribute(v, 5126, 'VEC3', bounds=True),
                      'NORMAL': attribute(normals, 5126, 'VEC3')}
        if row['system'] == 'Muscular' and np.any(tendon > 0):
            attributes['COLOR_0'] = attribute(np.repeat(tendon[:, None], 3, axis=1).astype('<f4'), 5126, 'VEC3')
        indices = attribute(f.ravel(), 5125, 'SCALAR', target=34963)
        nodes.append({'name': row['id'], 'mesh': len(meshes)})
        meshes.append({'name': row['id'], 'primitives': [{'attributes': attributes, 'indices': indices}]})
    binary.extend(b'\0' * (-len(binary) % 4))
    document = {'asset': {'version': '2.0', 'copyright': copyright_notice},
                'scene': 0, 'scenes': [{'nodes': list(range(len(nodes)))}],
                'nodes': nodes, 'meshes': meshes, 'buffers': [{'byteLength': len(binary)}],
                'bufferViews': views, 'accessors': accessors}
    data = json.dumps(document, separators=(',', ':')).encode()
    data += b' ' * (-len(data) % 4)
    path.write_bytes(struct.pack('<5I', 0x46546c67, 2, 28 + len(data) + len(binary), len(data), 0x4e4f534a)
                     + data + struct.pack('<2I', len(binary), 0x004e4942) + binary)

def batches(items):
    batch, count = [], 0
    for item in items:
        triangles = len(item[3])
        if batch and (count + triangles > 145_000 or len(batch) >= 55):
            yield batch
            batch, count = [], 0
        batch.append(item)
        count += triangles
    if batch:
        yield batch

def read_legacy_meshes(catalog, replaced):
    base = OUT.parent / 'bodyparts3d'
    groups = collections.defaultdict(list)
    for row in catalog:
        if row['id'] not in replaced and row['system'] in ('Muscular', 'Nervous'):
            groups[row['chunk']].append(row)
    for chunk, rows in groups.items():
        data = (base / (chunk + '.glb')).read_bytes()
        json_end = 20 + struct.unpack_from('<I', data, 12)[0]
        document = json.loads(data[20:json_end])
        nodes = {node['name']: node for node in document['nodes']}
        def attribute(index, dtype, width):
            a = document['accessors'][index]
            view = document['bufferViews'][a['bufferView']]
            offset = json_end + 8 + view['byteOffset']
            return np.frombuffer(data, dtype, a['count'] * width, offset).reshape(-1, width)
        for row in rows:
            mesh = document['meshes'][nodes[row['id']]['mesh']]['primitives'][0]
            vertices = attribute(mesh['attributes']['POSITION'], '<f4', 3)
            faces = attribute(mesh['indices'], '<u4', 1).reshape(-1, 3)
            yield row, {'id': row['id'], 'sourceChunk': chunk}, vertices, faces, np.zeros(len(vertices))

def pack_batch(gltfpack, raw, chunk_id, system, region, batch, legacy=False):
    destination = OUT / (chunk_id + '.glb')
    credit = ('BodyParts3D / The Database Center for Life Science, CC BY-SA 2.1 Japan'
              if legacy else ATTRIBUTION)
    write_glb(raw, batch, credit)
    subprocess.run([gltfpack, '-i', str(raw), '-o', str(destination), '-cc', '-vpf', '-vp', '16',
                    '-kn', '-ke', '-kv', '-si', '0.62', '-se', '0.0025'], check=True)
    data = destination.read_bytes()
    doc = json.loads(data[20:20 + struct.unpack_from('<I', data, 12)[0]])
    ids = [node['name'] for node in doc['nodes'] if 'mesh' in node]
    assert set(ids) == {item[0]['id'] for item in batch}, chunk_id
    return {'id': chunk_id, 'url': '/models/z-anatomy/' + destination.name, 'system': system,
            'region': region, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest(), 'structures': ids}

def pack(directory, gltfpack):
    with (directory / 'Z-Anatomy.zip').open('rb') as archive:
        archive_sha256 = hashlib.file_digest(archive, 'sha256').hexdigest()
    if archive_sha256 != SOURCE_ARCHIVE_SHA256:
        raise ValueError('Source archive does not match the reviewed commit')
    catalog = json.loads((SRC / 'catalog.json').read_text())
    objects = read_objects(directory)
    transform, registration_evidence = registration(objects, catalog)
    items = list(tissue_models(objects, catalog, transform))
    replaced = {row['id'] for row, *_ in items}
    groups = collections.defaultdict(list)
    for legacy, candidates in ((False, items), (True, read_legacy_meshes(catalog, replaced))):
        for item in candidates:
            groups[legacy, item[0]['system'], item[0]['region']].append(item)
    rows, models, chunks, legacy_models = [], [], [], []
    with tempfile.TemporaryDirectory() as temporary:
        raw = Path(temporary) / 'source.glb'
        for (legacy, system, region), items in sorted(groups.items()):
            prefix = 'bp-study' if legacy else 'z'
            for i, batch in enumerate(batches(items)):
                chunk_id = f'{prefix}-{system.lower().replace(" ", "-")}-{REGIONS.index(region)}-{i}'
                chunk = pack_batch(gltfpack, raw, chunk_id, system, region, batch, legacy)
                chunks.append(chunk)
                for row, provenance, *_ in batch:
                    output = chunk_id + '.glb'
                    if legacy:
                        legacy_models.append({**provenance, 'output': output})
                    else:
                        rows.append({**row, 'chunk': chunk_id})
                        models.append({**provenance, 'output': output})
    (SRC / 'tissueModels.json').write_text(json.dumps(rows, separators=(',', ':')) + '\n')
    (SRC / 'tissueChunks.json').write_text(json.dumps(chunks, indent=2) + '\n')
    manifest = {
        'dataset': 'Z-Anatomy registered muscles, peripheral nerves and selected related connective tissue',
        'sourceUrl': SOURCE, 'sourceCommit': SOURCE_COMMIT,
        'sourceArchiveSha256': archive_sha256,
        'license': 'CC-BY-SA-4.0', 'licenseUrl': 'https://creativecommons.org/licenses/by-sa/4.0/',
        'attribution': ATTRIBUTION, 'registration': registration_evidence,
        'upstreamCredits': ['BodyParts3D / DBCLS (source model)', 'University of Dundee, CAHID: Cranial Nerves and Foramina (CC BY 4.0)'],
        'models': models, 'chunks': chunks,
        'optimizedBodyParts3D': {'sourceManifest': '/models/bodyparts3d/manifest.json',
                                 'license': 'CC-BY-SA-2.1-JP', 'models': legacy_models},
    }
    (OUT / 'tissues-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
    print(collections.Counter(row['system'] for row in rows), len(chunks), sum(c['bytes'] for c in chunks))

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('extracted', type=Path)
    parser.add_argument('gltfpack')
    args = parser.parse_args()
    pack(args.extracted, args.gltfpack)
