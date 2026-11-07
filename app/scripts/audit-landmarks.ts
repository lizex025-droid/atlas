import { mkdir,readFile,writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { Mesh,Triangle,Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { boneCoverage,boneLandmarks,landmarkModelBindings,landmarkSources,matchesLandmarkChunk } from '../src/landmarks';
import { resolveSurfaceAnchor } from '../src/landmarkGeometry';
import { sources } from '../src/knowledge';

const sourceRegistry=[...landmarkSources,...sources];
const errors:string[]=[];
const seenIds=new Set<string>();
const modelAudits=[];
for(const binding of landmarkModelBindings){
 const {boneId,meshId,chunkUrl,chunkSha256,triangleCount,vertexCount}=binding;
 if(boneId!==meshId||!matchesLandmarkChunk(binding))throw new Error('Invalid mesh/chunk binding '+boneId);
 const bytes=await readFile(new URL('../public'+chunkUrl,import.meta.url));
 const digest=createHash('sha256').update(bytes).digest('hex');
 if(digest!==chunkSha256)throw new Error('Bound model digest changed. Re-review '+boneId);
 const {scene}=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
 const mesh=scene.getObjectByName(meshId);
 if(!(mesh instanceof Mesh)||!mesh.geometry.index)throw new Error('Indexed mesh missing: '+meshId);
 const {geometry}=mesh;
 const positions=geometry.getAttribute('position'),index=geometry.index!;
 if(positions.count!==vertexCount||index.count!==triangleCount*3)throw new Error('Mesh size differs: '+meshId);
 const triangles=new Set<string>();
 const edgeCounts=new Map<string,number>();
 let degenerateTriangles=0;
 const a=new Vector3(),b=new Vector3(),c=new Vector3();
 const triangle=new Triangle(a,b,c);
 for(let i=0;i<index.count;i+=3){
  const u=index.getX(i),v=index.getX(i+1),w=index.getX(i+2);
  triangles.add([u,v,w].join(','));
  a.fromBufferAttribute(positions,u);b.fromBufferAttribute(positions,v);c.fromBufferAttribute(positions,w);
  const area=triangle.getArea();
  if(!Number.isFinite(area)||area<=1e-12)degenerateTriangles++;
  for(const [start,end] of [[u,v],[v,w],[w,u]]){
   const key=Math.min(start,end)+':'+Math.max(start,end);
   edgeCounts.set(key,(edgeCounts.get(key)??0)+1);
  }
 }
 const features=boneLandmarks(boneId);
 const anchored=features.filter(feature=>feature.anchor);
 if(anchored.length!==Object.keys(binding.anchors).length)errors.push('Orphan surface binding: '+boneId);
 for(const item of features){
  if(seenIds.has(item.id))errors.push('Duplicate '+item.id);
  seenIds.add(item.id);
  if(!item.sourceIds.every(id=>sourceRegistry.some(source=>source.id===id)))errors.push('Missing source '+item.id);
  const anchor=item.anchor;
  if(anchor&&(!resolveSurfaceAnchor(geometry,anchor)||!triangles.has(anchor.triangle.join(',')))){
   errors.push('Invalid indexed surface anchor '+item.id);
  }
 }
 const counts=[...edgeCounts.values()];
 modelAudits.push({boneId,geometryBinding:binding,surfaceAnchors:anchored.length,unmappedFeatures:features.length-anchored.length,features,
  indexedTopology:{vertexCount,triangleCount,boundaryEdges:counts.filter(n=>n===1).length,
   nonManifoldEdges:counts.filter(n=>n>2).length,degenerateTriangles}});
}
if(errors.length)throw new Error(errors.join('\n'));

const coverage=boneCoverage();
const t7=modelAudits.find(model=>model.boneId==='FMA9968')!;
const report={
 schemaVersion:1,checkedAt:new Date().toISOString(),complete:false,expectedReferenceBones:coverage.length,
 referenceBonesWithGeometry:coverage.filter(b=>b.meshIds.length).length,referenceBonesWithAnchors:coverage.filter(b=>b.anchors>0).length,
 surfaceAnchors:modelAudits.reduce((n,model)=>n+model.surfaceAnchors,0),unmappedT7Features:t7.unmappedFeatures,independentMedicalReview:'pending',
 geometryBinding:t7.geometryBinding,features:modelAudits.flatMap(model=>model.features),models:modelAudits,
 sources:sourceRegistry.filter(source=>modelAudits.some(model=>model.features.some(f=>f.sourceIds.includes(source.id)))),
 coverage,errors,
};
await mkdir('public/landmarks',{recursive:true});
const data=JSON.stringify(report,null,2)+'\n';
await writeFile('public/landmarks/coverage.json',data);
await writeFile('../LANDMARK_PROGRESS.json',JSON.stringify({
 schemaVersion:1,checkedAt:report.checkedAt,complete:false,modelDigest:t7.geometryBinding.chunkSha256,
 modelDigests:Object.fromEntries(modelAudits.map(model=>[model.boneId,model.geometryBinding.chunkSha256])),
 reportSha256:createHash('sha256').update(data).digest('hex'),
 next:['Obtain independent review of T7 and right humerus surface points','Review the left humerus independently','Seek higher-resolution licensed geometry for fine features'],
 coverage,features:report.features.map(l=>({id:l.id,status:l.mappingStatus,reason:l.reason})),
},null,2)+'\n');
const models=modelAudits.map(model=>`| ${model.boneId} | ${model.surfaceAnchors} | ${model.unmappedFeatures} | ${model.indexedTopology.triangleCount} | ${model.indexedTopology.boundaryEdges} | ${model.indexedTopology.nonManifoldEdges} | ${model.indexedTopology.degenerateTriangles} |`).join('\n');
const regional=(['Axial','Appendicular'] as const).map(division=>{
 const rows=coverage.filter(b=>b.division===division);
 return `| ${division} | ${rows.length} | ${rows.filter(b=>b.meshIds.length).length} | ${rows.filter(b=>b.anchors>0).length} |`;
}).join('\n');
await writeFile('../LANDMARK_COVERAGE_REPORT.md',`# Bone landmark coverage

Generated by \`npm run landmarks:audit\` against the installed licensed GLBs.

- Standard adult reference: ${coverage.length} bones, ${report.referenceBonesWithGeometry} represented by current source mappings.
- Reviewed surface points: ${report.surfaceAnchors} across ${report.referenceBonesWithAnchors}/${coverage.length} reference bones.
- Independent medical and anatomical review is pending. Structural anchor errors: ${errors.length}.

| Canonical mesh | Surface points | Unmapped features | Indexed triangles | Boundary edges | Nonmanifold edges | Degenerate triangles |
|---|---:|---:|---:|---:|---:|---:|
${models}

Counts describe the indexed source surfaces. Points use barycentric weights on the exact hashed mesh. Gross surface-point review does not establish closed topology, fine-feature segmentation or patient-specific anatomical accuracy.

| Division | Reference bones | With geometry | With anchors |
|---|---:|---:|---:|
${regional}

The per-bone and per-feature ledger is in [LANDMARK_PROGRESS.json](LANDMARK_PROGRESS.json). See [dataset rights](DATASET_LICENSE_REVIEW.md).
`);
console.log(JSON.stringify({referenceBones:coverage.length,withGeometry:report.referenceBonesWithGeometry,withAnchors:report.referenceBonesWithAnchors,
 surfaceAnchors:report.surfaceAnchors,topology:modelAudits.map(({boneId,indexedTopology})=>({boneId,...indexedTopology})),errors},null,2));
