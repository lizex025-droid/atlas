// These rays were picked on orthographic renders of the exact licensed right-sided mesh.
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { Mesh, MeshBasicMaterial, DoubleSide, Raycaster, Vector3, Triangle } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const boneId = 'FMA23130';
const chunkUrl = '/models/bodyparts3d/skeletal-trunk-2.glb';
const chunkSha256 = 'ee64845d91b5029adb79d6105cec5b8d5c0b602f60066b3250331fde7469c56a';
const bytes = await readFile(new URL('../public' + chunkUrl, import.meta.url));
if (createHash('sha256').update(bytes).digest('hex') !== chunkSha256) {
  throw new Error('Review the right humerus again before binding a different mesh.');
}
const gltf = await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '');
const geometry = gltf.scene.getObjectByName(boneId)?.geometry;
if (!geometry?.index) throw new Error('Expected indexed right humerus.');
geometry.computeBoundingBox();
const center = geometry.boundingBox.getCenter(new Vector3());
const mesh = new Mesh(geometry, new MeshBasicMaterial({ side: DoubleSide }));
mesh.updateMatrixWorld();

const views = {
  medial: { outward: [1, 0, 0], right: [0, 0, -1] },
  lateral: { outward: [-1, 0, 0], right: [0, 0, 1] },
  posterior: { outward: [0, 0, -1], right: [-1, 0, 0] },
};
// Pixel selections use a 560 × 700 render, orthographic width 0.88 and height 1.10.
const picks = [
  ['head', 'medial', 290, 59, 'Rounded articular head viewed from medial.'],
  ['greater-tubercle', 'lateral', 278, 57, 'Gross prominence lateral to the head, above the shaft.'],
  ['medial-epicondyle', 'posterior', 268, 625, 'Medial distal projection, beside the trochlea.'],
  ['lateral-epicondyle', 'posterior', 371, 621, 'Lateral distal projection, outside the olecranon fossa.'],
  ['olecranon-fossa', 'posterior', 322, 604, 'Central depression on the posterior distal humerus.'],
];
const positions = geometry.getAttribute('position');
const anchors = {};
for (const [id, view, x, y, reviewNote] of picks) {
  const { outward, right } = views[view];
  const outwardVector = new Vector3(...outward);
  const origin = center.clone().addScaledVector(outwardVector, 2.5)
    .addScaledVector(new Vector3(...right), (x / 560 - 0.5) * 0.88);
  origin.y += (0.5 - y / 700) * 1.10;
  const direction = outwardVector.clone().negate();
  const hit = new Raycaster(origin, direction).intersectObject(mesh)[0];
  if (!hit?.face) throw new Error('No reviewed surface for ' + id);
  const triangle = [hit.face.a, hit.face.b, hit.face.c];
  const [a, b, c] = triangle.map(i => new Vector3().fromBufferAttribute(positions, i));
  const weights = Triangle.getBarycoord(hit.point, a, b, c, new Vector3()).toArray();
  const normal = hit.face.normal.clone();
  if (normal.dot(direction) > 0) normal.negate();
  anchors[id] = { triangle, weights, position: hit.point.toArray(), normal: normal.toArray(), reviewNote };
}

await writeFile(new URL('../src/content/right-humerus-anchors.json', import.meta.url), JSON.stringify({
  schemaVersion: 1,
  boneId,
  meshId: boneId,
  chunkUrl,
  chunkSha256,
  vertexCount: positions.count,
  triangleCount: geometry.index.count / 3,
  coordinateSpace: 'mesh-local',
  license: 'CC-BY-SA-2.1-JP',
  attribution: 'BodyParts3D / The Database Center for Life Science, Japan. Model-derived surface bindings under the same license. See /models/ATTRIBUTION.txt.',
  review: {
    status: 'geometry-reviewed',
    method: 'Manually identified in orthographic and oblique views of the original right mesh, projected to its indexed triangles and checked in annotated renders against anatomical reference views.',
    reviewedAt: '2026-11-07',
    medicalReview: 'pending',
    limitation: 'Representative gross surface points only. The polygon-reduced mesh shows surface discontinuities and does not establish exact landmark boundaries, cartilage, attachment footprints or patient-specific measurements.',
  },
  anchors,
}, null, 2) + '\n');
