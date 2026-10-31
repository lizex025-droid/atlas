import { byId } from './anatomy';
import type { AnatomyRecord, Fact, Feature, SourceReference } from './knowledgeSchema';
export type { AnatomyRecord, Fact, Feature, SourceReference } from './knowledgeSchema';
import batch from './content/reviewed-batch.json';
import imported from './content/imported.json';
const date='2026-10-31';
export const sources:SourceReference[]=[
 {id:'fipat',title:'FIPAT. Terminologia Anatomica, 2nd ed. (2019), Part II',url:'https://cdn.dal.ca/content/dam/dalhousie/pdf/library/FIPAT/TA2/FIPAT-TA2-Part-2.pdf',license:'Publication CC BY-ND 4.0; individual terms public domain',use:'Individual terms and standard identifiers only; no PDF adaptation or figure reuse.',locator:'TA2 1058–1066, 2549; PDF pp. 21–22, 71 (zero-based)',accessedAt:date},
 {id:'thoracic',title:'StatPearls: Anatomy, Back, Thoracic Vertebrae',url:'https://www.ncbi.nlm.nih.gov/books/NBK459153/',license:'StatPearls: CC BY-NC-ND 4.0',use:'Factual reference for independently written brief explanations. No copied prose, images or article redistribution.',locator:'Structure and Function; atypical T11–T12',accessedAt:date},
 {id:'palmaris',title:'StatPearls: Anatomy, Shoulder and Upper Limb, Hand Palmaris Tendon',url:'https://www.ncbi.nlm.nih.gov/books/NBK519516/',license:'StatPearls: CC BY-NC-ND 4.0',use:'Factual reference only; no copied article content or illustrations.',locator:'Structure and Function',accessedAt:date},
 {id:'stecco',title:'Stecco et al. (2009): The palmaris longus muscle and its relations with the antebrachial fascia and the palmar aponeurosis',url:'https://pubmed.ncbi.nlm.nih.gov/19208432/',license:'Publisher copyright; no reuse permission assumed',use:'Bibliographic citation and anatomical facts only; no abstract or article text reproduced.',locator:'Clinical Anatomy 22(2):221–229; doi:10.1002/ca.20747',accessedAt:date},
 {id:'dupuytren',title:'StatPearls: Dupuytren Contracture',url:'https://www.ncbi.nlm.nih.gov/books/NBK526074/',license:'CC BY-NC-ND 4.0',use:'Brief original educational fact statement only; no copied article content or treatment guidance.',locator:'Introduction',accessedAt:date},
 {id:'bp3d',title:'BodyParts3D 4.0 / DBCLS',url:'https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html',license:'Imported OBJ notices: CC BY-SA 2.1 Japan; current archive page CC BY 4.0',use:'Licensed meshes and source FMA terminology. Per-model provenance is shipped in the asset manifest.',accessedAt:date},
 {id:'zanatomy',title:'Z-Anatomy: selected palmar-aponeurosis surfaces',url:'https://github.com/Z-Anatomy/Models-of-human-anatomy',license:'Selected palmar surfaces: CC BY-SA 4.0; BodyParts3D / DBCLS credited upstream',use:'Only identified palmar fascia geometry converted. No noncommercial kidney/inner-ear assets, definitions, scripts or materials distributed. Similarity alignment review pending.',accessedAt:date},
];
const f=(text:string,...refs:string[]):Fact=>({text,sources:refs});
const feature=(id:string,name:string,text:string,refs:string[]):Feature=>({id,name,text,sources:refs,meshIds:[]});
const empty={description:[],classification:[],location:[],quickFacts:[],structureAndFunction:[],parts:[],surfaces:[],landmarks:[],attachments:[],articulations:[],anatomicalRelations:[],clinicalNotes:[],images:[],childrenIds:[]};
const t11:AnatomyRecord={...empty,id:'FMA10059',officialName:'Eleventh thoracic vertebra',latinName:'Vertebra thoracica XI',synonyms:['T11','Vertebra T11'],anatomicalSystem:'Skeletal',region:'Thorax',kind:'bone',parentId:'group:thoracic',hierarchyPath:[{id:'system:Skeletal',name:'Skeletal system'},{id:'group:axial',name:'Axial skeleton'},{id:'group:spine',name:'Vertebral column'},{id:'group:thoracic',name:'Thoracic vertebrae'},{id:'FMA10059',name:'T11'}],
 description:[f('T11 lies near the lower end of the thoracic spine. Its rib-joint pattern differs from that of a typical mid-thoracic vertebra.','thoracic')],
 classification:[f('Atypical thoracic vertebra.','thoracic')],location:[f('Eleventh level of the thoracic vertebral column.','thoracic','bp3d')],
 quickFacts:[f('One complete costal facet is present on each side for the corresponding eleventh rib.','thoracic'),f('There is no transverse costal facet at T11.','thoracic'),f('Latin label uses the standard thoracic-vertebra term with the level numeral XI; it is not a separate TA2 headword.','fipat')],
 structureAndFunction:[f('The vertebral body and posterior arch surround the vertebral foramen. Articular processes contribute to joints with adjacent vertebrae.','thoracic')],
 parts:[feature('t11:body','Vertebral body','Anterior load-bearing component.',['thoracic']),feature('t11:arch','Vertebral arch','Pedicles and laminae form the posterior arch.',['thoracic']),feature('t11:processes','Vertebral processes','Spinous, transverse and articular processes project from the arch.',['thoracic'])],
 surfaces:[feature('t11:costal','Costal facets','A complete facet on each side articulates with rib 11.',['thoracic']),feature('t11:articular','Articular facets','Joint surfaces of the articular processes relate to adjacent vertebrae.',['thoracic'])],
 landmarks:[feature('t11:pedicles','Pedicles','Short bridges between the body and the posterior arch.',['thoracic']),feature('t11:laminae','Laminae','Paired components of the posterior arch.',['thoracic']),feature('t11:spinous','Spinous process','Posterior projection of the vertebral arch.',['thoracic'])],
 articulations:[f('The complete costal facets receive the heads of the eleventh ribs.','thoracic')],
 anatomicalRelations:[{...f('T10 is the adjacent vertebral level above T11.','bp3d'),targetId:'FMA10037',label:'T10'},{...f('T12 is the adjacent vertebral level below T11.','bp3d'),targetId:'FMA10081',label:'T12'}],
 clinicalNotes:[],modelIds:['bodyparts3d-4.0'],meshIds:['FMA10059'],sourceReferences:['fipat','thoracic','bp3d'],verificationStatus:'source-checked',lastReviewedAt:date};
const palmar:AnatomyRecord={...empty,id:'TA2:2549',officialName:'Palmar aponeurosis',latinName:'Aponeurosis palmaris',synonyms:['Palmar fascia'],anatomicalSystem:'Connective Tissue',region:'Hand',kind:'fascia',parentId:'group:upper-fascia',hierarchyPath:[{id:'system:Connective Tissue',name:'Connective tissue'},{id:'group:fascia',name:'Fasciae'},{id:'group:upper-fascia',name:'Upper-limb fasciae'},{id:'TA2:2549',name:'Palmar aponeurosis'}],
 description:[f('A fibrous sheet in the palm, associated with the distal tendon of palmaris longus and the palmar fascial system.','stecco','palmaris')],classification:[f('Aponeurosis; connective tissue of the upper limb.','fipat')],location:[f('Palmar region of the hand.','fipat','stecco')],
 quickFacts:[f('The palmaris longus tendon is continuous with the palmar aponeurosis.','stecco'),f('The aponeurosis can be present when palmaris longus is absent.','stecco')],
 structureAndFunction:[f('Tension transmitted by palmaris longus can help stabilize the skin of the palm.','palmaris')],
 attachments:[f('The distal palmaris longus tendon attaches to the palmar aponeurosis and flexor retinaculum.','palmaris')],
 anatomicalRelations:[{...f('Palmaris longus is an associated forearm muscle. Its model is a related structure, not a substitute for the aponeurosis.','palmaris'),targetId:'FMA38464',label:'Left palmaris longus'},{...f('The aponeurosis has anatomical continuity with the antebrachial fascial system through the palmaris longus tendon.','stecco')}],
 clinicalNotes:[f('Dupuytren disease can produce nodules and cords in palmar and digital fascia, with progressive finger flexion contracture.','dupuytren')],
 modelIds:['z-anatomy-palmar'],meshIds:['TA2:2549:L'],sourceReferences:['fipat','palmaris','stecco','dupuytren','zanatomy'],verificationStatus:'source-checked',lastReviewedAt:date};
const records=new Map<string,AnatomyRecord>([[t11.id,t11],[palmar.id,palmar]]);
const palmaris=(id:string,side:string):AnatomyRecord=>({...empty,id,officialName:side+' palmaris longus',latinName:null,synonyms:[],anatomicalSystem:'Muscular',region:'Forearm',kind:'muscle',parentId:byId.get(id)?.parents[0]?.id??null,hierarchyPath:[...(byId.get(id)?.parents??[])].reverse().concat({id,name:side+' palmaris longus'}),description:[f('A slender anterior forearm muscle with a long distal tendon. It contributes to wrist flexion and tension of the palmar aponeurosis.','palmaris')],attachments:[f('Proximal attachment: medial epicondyle of the humerus. Distal attachments include the palmar aponeurosis and flexor retinaculum.','palmaris')],quickFacts:[f('Palmaris longus is anatomically variable and may be absent.','palmaris')],modelIds:['bodyparts3d-4.0'],meshIds:[id],sourceReferences:['palmaris','bp3d'],verificationStatus:'source-checked',lastReviewedAt:date,extensions:{origin:[f('Medial humeral epicondyle.','palmaris')],insertion:[f('Palmar aponeurosis and flexor retinaculum.','palmaris')],actions:[f('Accessory contribution to wrist flexion and tension of the palmar fascia.','palmaris')]}});
const pilotRecords=[t11,palmar,palmaris('FMA38464','Left'),palmaris('FMA38463','Right')];
export const curatedRecords:AnatomyRecord[]=[...new Map([...pilotRecords,...batch.records as AnatomyRecord[],...imported.records as AnatomyRecord[]].map(r=>[r.id,r])).values()];
sources.push(...batch.sources as SourceReference[],...imported.sources as SourceReference[]);
for(const record of curatedRecords)records.set(record.id,record);
const cache=new Map<string,AnatomyRecord>();
export function getKnowledge(id:string):AnatomyRecord {
 const cached=cache.get(id);if(cached)return cached;
 const r=readKnowledge(id);const side=/\bleft\b/i.test(r.officialName)?'left':/\bright\b/i.test(r.officialName)?'right':'unspecified';
 const normalized:AnatomyRecord={...r,version:r.version??1,laterality:r.laterality??side,clinicalReview:r.clinicalReview??{status:'pending'},pronunciation:r.pronunciation??{englishText:r.officialName,latinText:r.latinName,sourceIds:[],verificationStatus:'tts-approximation',audioAvailable:false,method:'browser-speech-synthesis'}};cache.set(id,normalized);return normalized;
}

function readKnowledge(id:string):AnatomyRecord {
 if(id==='TA2:2549:L'||id==='TA2:2549:R'){const left=id.endsWith(':L');return {...palmar,id,officialName:'Palmar aponeurosis ('+(left?'left':'right')+')',meshIds:[id],anatomicalRelations:palmar.anatomicalRelations.map(r=>r.targetId?{...r,targetId:left?'FMA38464':'FMA38463',label:(left?'Left':'Right')+' palmaris longus',lateralityConstraint:'ipsilateral'}:r),hierarchyPath:[...palmar.hierarchyPath.slice(0,-1),{id,name:left?'Left palmar aponeurosis':'Right palmar aponeurosis'}]};}
 const record=records.get(id);if(record)return record;
 const model=byId.get(id);if(!model)throw new Error('Unknown anatomy ID: '+id);
 const connective=/cartilage|disk|disc|ligament|fascia|retinaculum|tendon|aponeurosis/i.test(model.name);
 const kind=connective?'other':model.system==='Skeletal'?'bone':model.system==='Muscular'?'muscle':/nerve/i.test(model.name)?'nerve':/artery|vein|aorta|vena/i.test(model.name)?'vessel':'organ';
 return {...empty,id,officialName:model.name,latinName:null,synonyms:[],anatomicalSystem:model.system,region:model.region,kind,parentId:model.parents[0]?.id??null,hierarchyPath:[...model.parents].reverse().concat({id:model.id,name:model.name}),modelIds:['bodyparts3d-4.0'],meshIds:[model.id],sourceReferences:['bp3d'],verificationStatus:'metadata-only',lastReviewedAt:null};
}
export function findKnowledge(query:string){const q=query.trim().toLowerCase();return curatedRecords.filter(r=>[r.id,r.officialName,r.latinName??'',...r.synonyms].some(s=>s.toLowerCase().includes(q)));}
