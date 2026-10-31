// Manual, model-specific review seeds; not a general extremum-based anatomy detector.
// Each ray must be checked in the multi-view review renders before publication.
import { readFile,writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { Mesh,MeshBasicMaterial,DoubleSide,Raycaster,Vector3,Triangle } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
const url='/models/bodyparts3d/skeletal-trunk-0.glb';const bytes=await readFile('public'+url);
const gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
let geometry;gltf.scene.traverse(o=>{if(o.name==='FMA9968')geometry=o.geometry;});
const mesh=new Mesh(geometry,new MeshBasicMaterial({side:DoubleSide}));mesh.updateMatrixWorld();
const seeds=[
 ['body',[0,1.443,.2],[0,0,-1],'Anterior vertebral body surface'],
 ['superior-endplate',[0,1.7,-.16],[0,-1,0],'Central superior bony endplate'],
 ['inferior-endplate',[0,1.1,-.16],[0,1,0],'Central inferior bony endplate'],
 ['spinous',[0,1.307,-.6],[0,0,1],'Posteroinferior spinous-process tip'],
 ['transverse-left',[.4,1.438,-.283],[-1,0,0],'Lateral end of left transverse process'],
 ['transverse-right',[-.4,1.438,-.283],[1,0,0],'Lateral end of right transverse process'],
];
const anchors={};const position=geometry.getAttribute('position');
for(const [id,origin,direction,note] of seeds){
 const ray=new Raycaster(new Vector3(...origin),new Vector3(...direction));const hit=ray.intersectObject(mesh)[0];if(!hit)throw new Error('No surface: '+id);
 const triangle=[hit.face.a,hit.face.b,hit.face.c];const [a,b,c]=triangle.map(i=>new Vector3().fromBufferAttribute(position,i));const weights=Triangle.getBarycoord(hit.point,a,b,c,new Vector3()).toArray();
 const normal=hit.face.normal.clone();if(normal.dot(ray.ray.direction)>0)normal.negate();
 anchors[id]={triangle,weights,position:hit.point.toArray(),normal:normal.toArray(),reviewNote:note};
}
await writeFile('src/content/t7-anchors.json',JSON.stringify({schemaVersion:1,boneId:'FMA9968',meshId:'FMA9968',chunkUrl:url,chunkSha256:createHash('sha256').update(bytes).digest('hex'),vertexCount:position.count,triangleCount:geometry.index.count/3,coordinateSpace:'mesh-local',license:'CC-BY-SA-2.1-JP',attribution:'BodyParts3D / The Database Center for Life Science, Japan. Original AnatomyAtlas gross-feature surface bindings derived from the licensed mesh; see /models/ATTRIBUTION.txt.',review:{status:'geometry-reviewed',method:'Manual gross-feature identification in eight orthogonal/oblique source-mesh views, surface ray projection and annotated multi-view review. No automatic anatomical inference.',reviewedAt:'2026-10-31',medicalReview:'pending',limitation:'Polygon-reduced gross bony surface; not cartilage, histology or a segmented feature mask.'},anchors},null,2)+'\n');
console.log(JSON.stringify(anchors,null,2));
