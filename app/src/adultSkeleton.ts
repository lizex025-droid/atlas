import { byId,anatomy } from './anatomy';
export type AdultBone={id:string;name:string;division:'Axial'|'Appendicular';meshIds:string[];mapping:'exact-name'|'component-group'|'not-installed'};
// Independently enumerated standard adult convention, checked against NCI SEER
// axial/appendicular tables. Patellae included; teeth/accessory sesamoids excluded.
const expected:{name:string;division:'Axial'|'Appendicular';aliases?:string[]}[]=[];
function add(name:string,division:'Axial'|'Appendicular',aliases?:string[]){expected.push({name,division,aliases});}
function pair(name:string,division:'Axial'|'Appendicular'){for(const side of ['Left','Right'])add(side+' '+name,division);}
for(const name of ['Frontal bone','Occipital bone','Sphenoid bone','Ethmoid','Vomer','Mandible','Hyoid bone','Sacrum','Coccyx','Sternum'])add(name,'Axial');
for(const name of ['parietal bone','temporal bone','nasal bone','maxilla','lacrimal bone','zygomatic bone','palatine bone','inferior nasal concha','malleus','incus','stapes'])pair(name,'Axial');
const ordinals=['First','Second','Third','Fourth','Fifth','Sixth','Seventh','Eighth','Ninth','Tenth','Eleventh','Twelfth'];
for(const [region,count] of [['cervical',7],['thoracic',12],['lumbar',5]] as const)for(let i=0;i<count;i++)add(ordinals[i]+' '+region+' vertebra','Axial',region==='cervical'&&i<2?[i===0?'Atlas':'Axis']:undefined);
for(let i=0;i<12;i++)for(const side of ['Left','Right'])add(side+' '+ordinals[i].toLowerCase()+' rib','Axial');
for(const name of ['clavicle','scapula','humerus','radius','ulna','scaphoid','lunate','triquetral','pisiform','trapezium','trapezoid','capitate','hamate','hip bone','femur','patella','tibia','fibula','talus','calcaneus','cuboid bone','medial cuneiform bone','intermediate cuneiform bone','lateral cuneiform bone'])pair(name,'Appendicular');
for(const side of ['left','right']){
 add('Navicular bone of '+side+' foot','Appendicular');
 for(let i=0;i<5;i++)for(const type of ['metacarpal','metatarsal'])add(side[0].toUpperCase()+side.slice(1)+' '+ordinals[i].toLowerCase()+' '+type+' bone','Appendicular');
 for(const [type,digits] of [['finger',['thumb','index finger','middle finger','ring finger','little finger']],['toe',['big toe','second toe','third toe','fourth toe','little toe']]] as const)for(let d=0;d<5;d++)for(const segment of ['Proximal','Middle','Distal'])if(!(d===0&&segment==='Middle'))add(segment+' phalanx of '+side+' '+digits[d],'Appendicular');
}
const nameIndex=new Map(anatomy.map(s=>[s.name.toLowerCase(),s.id]));
export const adultSkeleton:AdultBone[]=expected.map((b,index)=>{
 const exact=[b.name,...b.aliases??[]].map(name=>nameIndex.get(name.toLowerCase())).filter((id):id is string=>!!id);
 const components=b.name==='Sternum'?['FMA7486','FMA7487','FMA7488'].filter(id=>byId.has(id)):[];
 const meshIds=exact.length?exact:components;
 return {id:'adult-bone:'+String(index+1).padStart(3,'0'),name:b.name,division:b.division,meshIds,mapping:exact.length?'exact-name':components.length?'component-group':'not-installed'};
});
export const adultSkeletonSources=['https://training.seer.cancer.gov/anatomy/skeletal/divisions/','https://training.seer.cancer.gov/anatomy/skeletal/divisions/axial.html','https://training.seer.cancer.gov/anatomy/skeletal/divisions/appendicular.html'];
