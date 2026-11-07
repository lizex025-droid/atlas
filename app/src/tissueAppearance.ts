import { Color, Vector3 } from 'three';
import type { BufferGeometry, MeshStandardMaterial, MeshStandardMaterialParameters } from 'three';
import type { Structure } from './anatomy';

type Profile = { axis: Vector3; across: Vector3; depth: Vector3; origin: Vector3; pattern: number; seed: number };
const profiles = new WeakMap<BufferGeometry, Profile>();

function profile(model: Structure, geometry: BufferGeometry): Profile {
 const cached = profiles.get(geometry);
 if (cached) return cached;
 const points = geometry.getAttribute('position');
 const center = new Vector3(...model.position);
 const side = Math.sign(center.x) || 1;
 const name = model.name.toLowerCase();
 const axis = new Vector3(0, 1, 0);
 const origin = center.clone();
 let pattern = 0;
 if (/pectoralis major|deltoid|temporalis/.test(name)) {
  pattern = 1;
  if (name.includes('pectoralis')) origin.add(new Vector3(side * model.size[0] * .54, model.size[1] * .28, 0));
  else if (name.includes('deltoid')) origin.y -= model.size[1] * .48;
  else origin.y -= model.size[1] * .54;
 } else if (/orbicularis/.test(name)) {
  pattern = 2;
 } else if (/oblique.*abdom|external oblique|internal oblique/.test(name)) {
  axis.set(side * (name.includes('internal') ? -.65 : .65), 1, .12);
 } else if (/trapezius/.test(name)) {
  axis.set(side, name.includes('ascending') ? .9 : name.includes('descending') ? -.65 : .08, 0);
 } else if (/latissimus|gluteus maximus/.test(name)) {
  axis.set(side, name.includes('latissimus') ? 1 : -.65, .12);
 } else {
  const xx = new Vector3(), yy = new Vector3(), zz = new Vector3();
  const step = Math.max(1, Math.floor(points.count / 700));
  const offset = new Vector3();
  for (let i = 0; i < points.count; i += step) {
   offset.set(points.getX(i), points.getY(i), points.getZ(i)).sub(center);
   xx.addScaledVector(offset, offset.x);
   yy.addScaledVector(offset, offset.y);
   zz.addScaledVector(offset, offset.z);
  }
  axis.set(.31, .88, .19);
  for (let i = 0; i < 7; i++) {
   const {x, y, z} = axis;
   axis.set(xx.x * x + xx.y * y + xx.z * z, yy.x * x + yy.y * y + yy.z * z, zz.x * x + zz.y * y + zz.z * z).normalize();
  }
  if (axis.lengthSq() < .1) axis.set(0, 1, 0);
 }
 axis.normalize();
 const across = new Vector3().crossVectors(axis, Math.abs(axis.z) < .9 ? new Vector3(0, 0, 1) : new Vector3(1, 0, 0)).normalize();
 const depth = new Vector3().crossVectors(axis, across);
 const seed = [...model.id].reduce((sum, letter) => (sum * 31 + letter.charCodeAt(0)) % 997, 1);
 const result = {axis, across, depth, origin, pattern, seed};
 profiles.set(geometry, result);
 return result;
}

const striation = /* glsl */`
 float fiberBand(float phase) {
  float antialias = 1.0 - smoothstep(.42, 2.6, fwidth(phase));
  return sin(phase) * antialias;
 }
 float striations(vec3 p, vec3 n) {
  if (tissuePattern > 1.5) {
   vec2 xy = p.xy * vec2(1.0, 1.25);
   return .58 * fiberBand(1650.0 * length(xy)) + .24 * fiberBand(3190.0 * length(xy));
  }
  if (tissuePattern > .5) {
   float angle = atan(p.y, abs(p.x) + .003);
   return .64 * fiberBand(angle * 330.0 + p.z * 17.0) + .21 * fiberBand(angle * 671.0);
  }
  float a = dot(p, tissueAcross), b = dot(p, tissueDepth), l = dot(p, tissueAxis);
  float bend = 0.65 * sin(9.7 * l + tissueSeed + 8.0 * a);
  float flank = smoothstep(.15, .86, abs(dot(n, tissueAcross)));
  float planeA = .64 * fiberBand(1550.0 * a + bend) + .24 * fiberBand(3127.0 * a + .63 * bend);
  float planeB = .64 * fiberBand(1550.0 * b + bend) + .24 * fiberBand(3127.0 * b + .63 * bend);
  return mix(planeA, planeB, flank);
 }
`;

const tendonColor = new Color('#e3d7b9');
const nerveColor = new Color('#d5a14d');
const muscleColor = new Color('#a94f39');
const selectionColor = new Color('#74dc92');

type Appearance = MeshStandardMaterialParameters & Partial<Pick<MeshStandardMaterial, 'onBeforeCompile' | 'customProgramCacheKey'>>;

export function tissueAppearance(model: Structure, geometry: BufferGeometry, selected: boolean): Appearance {
 const muscle = model.system === 'Muscular';
 const nerve = model.system === 'Nervous' && model.chunk.startsWith('z-nervous-');
 if (!muscle && !nerve) return {color: selected ? selectionColor : model.color, roughness: model.system === 'Skeletal' ? .55 : .62};
 const hasTendon = muscle && geometry.hasAttribute('color');
 const fiber = muscle ? profile(model, geometry) : null;
 return {
  color: selected ? selectionColor : muscle ? muscleColor : nerveColor,
  roughness: muscle ? .42 : .48,
  vertexColors: hasTendon,
  customProgramCacheKey: () => muscle ? 'atlas-muscle-v2' : 'atlas-nerve-v1',
  onBeforeCompile(shader) {
   shader.vertexShader = shader.vertexShader
    .replace('#include <common>', '#include <common>\nvarying vec3 tissuePosition;\nvarying vec3 tissueNormal;')
    .replace('#include <begin_vertex>', '#include <begin_vertex>\ntissuePosition = position;\ntissueNormal = normal;');
   const common = '#include <common>\nvarying vec3 tissuePosition;\nvarying vec3 tissueNormal;';
   if (!fiber) {
    shader.fragmentShader = shader.fragmentShader
     .replace('#include <common>', common)
     .replace('#include <color_fragment>', `
      float grain = sin(dot(tissuePosition, vec3(113.7, 191.1, 233.6)));
      float sheen = sin(dot(tissuePosition, vec3(21.2, 38.0, 47.7)));
      diffuseColor.rgb *= .92 + .11 * sheen + .045 * grain;
     `);
    return;
   }
   Object.assign(shader.uniforms, {
    tissueAxis: {value: fiber.axis}, tissueAcross: {value: fiber.across}, tissueDepth: {value: fiber.depth},
    tissueOrigin: {value: fiber.origin}, tissuePattern: {value: fiber.pattern}, tissueSeed: {value: fiber.seed},
    tissueTendon: {value: tendonColor},
   });
   shader.fragmentShader = shader.fragmentShader
    .replace('#include <common>', common + `
     uniform vec3 tissueAxis, tissueAcross, tissueDepth, tissueOrigin, tissueTendon;
     uniform float tissuePattern, tissueSeed;
     ` + striation)
    .replace('#include <color_fragment>', `
     vec3 p = tissuePosition - tissueOrigin;
     vec3 tissueN = normalize(tissueNormal);
     float fiber = striations(p, tissueN);
     float tendon = 0.0;
     #ifdef USE_COLOR
      tendon = smoothstep(.1, .91, vColor.r);
     #endif
     float grain = sin(dot(p, vec3(39.5, 63.3, 55.7)) + tissueSeed)
        * sin(dot(p, vec3(72.9, 19.1, -66.9)));
     float belly = 1.0 + .025 * grain + .10 * fiber;
     vec3 attachmentColor = mix(tissueTendon, diffuseColor.rgb, step(diffuseColor.r, diffuseColor.g));
     diffuseColor.rgb = mix(diffuseColor.rgb * belly, attachmentColor * (.98 + .04 * fiber), tendon);
    `)
    .replace('#include <roughnessmap_fragment>', `
     #include <roughnessmap_fragment>
     roughnessFactor = clamp(roughnessFactor + .025 * fiber - .06 * tendon, .30, .65);
    `)
    .replace('#include <normal_fragment_maps>', `
     #include <normal_fragment_maps>
     vec3 sx = dFdx(-vViewPosition), sy = dFdy(-vViewPosition);
     vec3 r1 = cross(sy, normal), r2 = cross(normal, sx);
     float determinant = dot(sx, r1);
     float height = fiber * mix(.000035, .000018, tendon);
     vec3 slope = sign(determinant) * (dFdx(height) * r1 + dFdy(height) * r2);
     normal = normalize(max(abs(determinant), 1e-12) * normal - slope);
    `);
  },
 };
}
