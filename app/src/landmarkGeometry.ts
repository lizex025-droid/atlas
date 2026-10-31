import { Vector3 } from 'three';
import type { BufferGeometry } from 'three';
import type { SurfaceAnchor } from './landmarks';
// Barycentric binding is evaluated in the mesh's own coordinate frame.
// The parent Object3D then carries translation, scale and rotation to world space.
export function resolveSurfaceAnchor(geometry:BufferGeometry,anchor:SurfaceAnchor){
 const p=geometry.getAttribute('position');if(!p||anchor.position.length!==3||!anchor.position.every(Number.isFinite)||anchor.normal.length!==3||anchor.triangle.length!==3||anchor.weights.length!==3||anchor.triangle.some(i=>!Number.isInteger(i)||i<0||i>=p.count)||anchor.weights.some(w=>!Number.isFinite(w)||w< -1e-6||w>1+1e-6)||Math.abs(anchor.weights.reduce((a,b)=>a+b,0)-1)>1e-5)return null;
 const point=new Vector3();anchor.triangle.forEach((vertex,i)=>point.addScaledVector(new Vector3().fromBufferAttribute(p,vertex),anchor.weights[i]));
 const normal=new Vector3(...anchor.normal);if(!normal.lengthSq()||!normal.toArray().every(Number.isFinite))return null;normal.normalize();
 if(point.distanceTo(new Vector3(...anchor.position))>1e-5)return null;
 return {point,normal,displayPosition:point.clone().addScaledVector(normal,.00055)};
}
