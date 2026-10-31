import anchors from './content/t7-anchors.json';
import chunks from './chunks.json';
import { anatomy } from './anatomy';
import { byId } from './anatomy';
import type { Vec3 } from './anatomy';
import { getKnowledge } from './knowledge';
import { adultSkeleton } from './adultSkeleton';
import type { CameraView,SceneState } from './scene';

export const landmarkCategories={
 marking:{name:'Bony markings',color:'#fff1c9'},
 articular:{name:'Articular surfaces',color:'#ffffff'},
 process:{name:'Processes and projections',color:'#ffc85c'},
 tubercle:{name:'Tuberosities and tubercles',color:'#edaa47'},
 depression:{name:'Fossae, grooves and depressions',color:'#be9973'},
 foramen:{name:'Foramina and canals',color:'#e9df8d'},
 ridge:{name:'Ridges, crests and lines',color:'#e5bd78'},
 muscle:{name:'Muscle attachment sites',color:'#d39b72'},
 ligament:{name:'Ligament attachment sites',color:'#a88562'},
} as const;
export type LandmarkCategory=keyof typeof landmarkCategories;
export type SurfaceAnchor={triangle:number[];weights:number[];position:number[];normal:number[];reviewNote:string};
export type BoneLandmark={id:string;boneId:string;name:string;category:LandmarkCategory;side:'left'|'right'|'midline'|'unspecified';description:string;relations:string;sourceIds:string[];attachmentKind:'surface'|'region'|'space';anchor:SurfaceAnchor|null;mappingStatus:'geometry-reviewed'|'unverified';reason:string};
export const landmarkSources=[
 {id:'gray-vertebra',title:'Gray (1918): General Characteristics of a Vertebra',url:'https://anatomie.cosminpopa.ro/en/3a-general-characteristics-of-a-vertebra/',locator:'Body; Pedicles; Laminae; Processes',license:'Underlying 1918 English text public domain. Original factual explanations; no modern translation or imagery reused.',accessedAt:'2026-10-31'},
 {id:'gray-thoracic',title:'Gray (1918): The Thoracic Vertebrae',url:'https://anatomie.cosminpopa.ro/en/3a-2-the-thoracic-vertebr/',locator:'Middle thoracic morphology, body facets, arch and processes',license:'Underlying 1918 English text public domain; modern site/translation excluded. Historical morphology, not clinical guidance.',accessedAt:'2026-10-31'},
];
type Seed=[string,string,LandmarkCategory,string,string?,BoneLandmark['attachmentKind']?];
const seeds:Seed[]=[
 ['body','Vertebral body','marking','Anterior load-bearing region.','The arch lies behind it; adjacent bodies are connected through discs.'],
 ['superior-endplate','Superior bony endplate','articular','Upper bony surface of the vertebral body.','Faces the disc above. The model does not resolve the cartilaginous endplate.'],
 ['inferior-endplate','Inferior bony endplate','articular','Lower bony surface of the vertebral body.','Faces the disc below; this marker identifies bone, not cartilage.'],
 ['spinous','Spinous process','process','Midline projection extending backward and downward.','Muscle and ligament attachment region; the marker is not an attachment footprint.'],
 ['transverse-left','Left transverse process','process','Left lateral projection of the vertebral arch.','Its anterior extremity carries the transverse costal facet.'],
 ['transverse-right','Right transverse process','process','Right lateral projection of the vertebral arch.','Its anterior extremity carries the transverse costal facet.'],
 ['pedicle-left','Left pedicle','marking','Short bridge from body to arch.'],
 ['pedicle-right','Right pedicle','marking','Short bridge from body to arch.'],
 ['lamina-left','Left lamina','marking','Plate joining the arch to the spinous region.'],
 ['lamina-right','Right lamina','marking','Plate joining the arch to the spinous region.'],
 ['vertebral-foramen','Vertebral foramen','foramen','Opening bounded by body and arch.','A space, not a bony surface point; no marker is placed in empty space.','space'],
 ...(['left','right'] as const).flatMap(side=>[
  ['superior-articular-process-'+side,side[0].toUpperCase()+side.slice(1)+' superior articular process','process','Upward projection at the pedicle-lamina junction.'],
  ['inferior-articular-process-'+side,side[0].toUpperCase()+side.slice(1)+' inferior articular process','process','Downward projection continuous with the lamina.'],
  ['superior-articular-facet-'+side,side[0].toUpperCase()+side.slice(1)+' superior articular facet','articular','Joint surface facing predominantly backward.','Meets the inferior facet of the vertebra above.'],
  ['inferior-articular-facet-'+side,side[0].toUpperCase()+side.slice(1)+' inferior articular facet','articular','Joint surface facing predominantly forward.','Meets the superior facet of the vertebra below.'],
  ['superior-costal-'+side,side[0].toUpperCase()+side.slice(1)+' superior costal demifacet','articular','Rib-head surface near the upper body-pedicle junction.'],
  ['inferior-costal-'+side,side[0].toUpperCase()+side.slice(1)+' inferior costal demifacet','articular','Rib-head surface near the lower lateral body margin.'],
  ['transverse-costal-'+side,side[0].toUpperCase()+side.slice(1)+' transverse costal facet','articular','Anterior surface near the transverse-process end.','Receives the rib tubercle.'],
  ['superior-notch-'+side,side[0].toUpperCase()+side.slice(1)+' superior vertebral notch','depression','Concavity above the pedicle.','Adjacent notches contribute to the intervertebral foramen.'],
  ['inferior-notch-'+side,side[0].toUpperCase()+side.slice(1)+' inferior vertebral notch','depression','Concavity below the pedicle.','Adjacent notches contribute to the intervertebral foramen.'],
 ] as Seed[]),
];
export const landmarkBindingMatches=chunks.some(c=>c.id===byId.get(anchors.meshId)?.chunk&&c.url===anchors.chunkUrl&&c.sha256===anchors.chunkSha256);
export const t7Landmarks:BoneLandmark[]=seeds.map(([key,name,category,description,relations='',kind='surface'])=>{
 const anchor=landmarkBindingMatches?(anchors.anchors as Record<string,SurfaceAnchor>)[key]??null:null;
 return {id:'landmark:FMA9968:'+key,boneId:'FMA9968',name,category,side:key.includes('left')?'left':key.includes('right')?'right':'midline',description,relations,sourceIds:['gray-vertebra','gray-thoracic'],attachmentKind:anchor?'region':kind,anchor,mappingStatus:anchor?'geometry-reviewed':'unverified',reason:anchor?'Gross feature reviewed against source-mesh views; independent anatomical review pending.':kind==='space'?'An anatomical space has no single surface attachment.':'No reliable model-specific surface anchor has been established on this reduced mesh.'};
});
export const landmarkModelBinding=anchors;
export function isBone(id:string|null):boolean{return !!id&&byId.has(id)&&getKnowledge(id).kind==='bone';}
export type LandmarkView={boneId:string;landmarkId:string|null;markersVisible:boolean;context:'show'|'dim'|'isolate';category:string;explode:number};
export function validLandmarkView(value:unknown):value is LandmarkView{if(!value||typeof value!=='object')return false;const v=value as LandmarkView;return isBone(v.boneId)&&typeof v.markersVisible==='boolean'&&['show','dim','isolate'].includes(v.context)&&(v.category==='all'||Object.hasOwn(landmarkCategories,v.category))&&typeof v.explode==='number'&&Number.isFinite(v.explode)&&v.explode>=0&&v.explode<=2&&(v.landmarkId===null||boneLandmarks(v.boneId).some(l=>l.id===v.landmarkId));}
export function boneLandmarks(id:string):BoneLandmark[]{
 if(id==='FMA9968')return t7Landmarks;
 if(!isBone(id))return [];
 const r=getKnowledge(id);return [...new Map([...r.parts,...r.surfaces,...r.landmarks].map(f=>[f.id,f])).values()].map(f=>({id:f.id,boneId:id,name:f.name,category:'marking',side:r.laterality??'unspecified',description:f.text,relations:'',sourceIds:f.sources,attachmentKind:'region',anchor:null,mappingStatus:'unverified',reason:'Information exists; a reliable anchor on this particular mesh has not been established.'}));
}
export function boneCoverage(){return adultSkeleton.map(b=>({...b,region:b.meshIds.length?byId.get(b.meshIds[0])?.region??'Unknown':'Not installed',anchors:b.meshIds.reduce((n,id)=>n+boneLandmarks(id).filter(l=>l.anchor).length,0)}));}
export function boneStudyState<T extends SceneState>(state:T,boneId:string|null,context:'show'|'dim'|'isolate'):T{
 if(!boneId)return state;
 return {...state,hidden:context==='isolate'?anatomy.filter(a=>a.id!==boneId).map(a=>a.id):state.hidden,opacity:context==='dim'?{...Object.fromEntries(anatomy.filter(a=>a.id!==boneId).map(a=>[a.id,.12])),[boneId]:state.opacity[boneId]??1}:state.opacity};
}
export function explodeOffset(id:string,amount:number):Vec3{const p=byId.get(id)?.position??[0,0,0];const length=Math.hypot(...p)||1;return p.map(v=>v/length*amount*.7) as Vec3;}
export function boneStudyCamera(boneId:string,camera:CameraView,explode=0):CameraView{
 const bone=byId.get(boneId);if(!bone)return camera;const offset=explodeOffset(boneId,explode);const target=bone.position.map((v,i)=>v+offset[i]) as Vec3;
 const distance=Math.max(.08,Math.hypot(...bone.size)/2/Math.sin(43*Math.PI/360)*(boneId==='FMA9968'?.78:1.15));
 const direction=camera.position.map((v,i)=>v-camera.target[i]);const length=Math.hypot(...direction)||1;
 return {target,position:target.map((v,i)=>v+direction[i]/length*distance) as Vec3};
}
export function landmarkCamera(boneId:string,anchor:SurfaceAnchor,camera:CameraView,explode=0):CameraView{
 const bone=byId.get(boneId);if(!bone)return camera;const offset=explodeOffset(boneId,explode);
 const target=anchor.position.map((v,i)=>v*.35+bone.position[i]*.65+offset[i]) as Vec3;
 const distance=Math.max(.2,Math.hypot(...bone.size)/2/Math.sin(43*Math.PI/360)*.78);
 const n=anchor.normal;const length=Math.hypot(...n)||1;
 return {target,position:target.map((v,i)=>v+n[i]/length*distance) as Vec3};
}
