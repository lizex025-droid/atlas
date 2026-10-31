import { anatomy,byId } from './anatomy';
import { curatedRecords,getKnowledge,sources } from './knowledge';
import type { AnatomyRecord,Fact } from './knowledgeSchema';
import { categorySections } from './knowledgeSchema';
import { bodySystems,systemFor } from './classification';
import { adultSkeleton } from './adultSkeleton';
import { groups } from './registry';
export const allRecordIds=[...new Set([...anatomy.map(s=>s.id),...curatedRecords.map(r=>r.id)])];
const known=new Set(allRecordIds);
export function recordFacts(r:AnatomyRecord):Fact[]{return [...r.description,...r.classification,...r.location,...r.quickFacts,...r.structureAndFunction,...r.parts,...r.surfaces,...r.landmarks,...r.attachments,...r.articulations,...r.anatomicalRelations,...r.clinicalNotes,...Object.values(r.extensions??{}).flat(),...(r.detailedSections??[]).flatMap(s=>s.facts)];}
export function sectionFacts(r:AnatomyRecord,id:string):Fact[]{
 const basic:Record<string,Fact[]>={description:r.description,classification:r.classification,location:r.location,parts:r.parts,surfaces:r.surfaces.filter(f=>!/border/i.test(f.name)),borders:r.surfaces.filter(f=>/border/i.test(f.name)),landmarks:r.landmarks,relations:r.anatomicalRelations,attachments:r.attachments,articulations:r.articulations,clinical:r.clinicalNotes,function:r.structureAndFunction,...r.extensions};
 return [...basic[id]??[],...(r.detailedSections??[]).filter(s=>s.id===id||s.id.startsWith(id+'-')).flatMap(s=>s.facts)];
}
export function evaluateSections(r:AnatomyRecord){return categorySections[r.kind].map(id=>{const facts=sectionFacts(r,id);const section=r.detailedSections?.find(s=>s.id===id);return {id,status:section?.status??(facts.length?'source-checked':'not-started'),facts:facts.length,reviewNote:section?.reviewNote??null};});}
export type ValidationIssue={id:string;code:string;severity:'error'|'review';message:string};
export function validateRecord(r:AnatomyRecord):ValidationIssue[]{
 const issues:ValidationIssue[]=[];const issue=(code:string,message:string,severity:ValidationIssue['severity']='error')=>issues.push({id:r.id,code,severity,message});
 if(!r.id||!r.officialName.trim())issue('identity','Canonical ID/name missing');
 for(const id of r.meshIds)if(!byId.has(id))issue('mesh','Invalid mesh '+id);
 const model=byId.get(r.id);if(model&&!r.meshIds.includes(model.id))issue('mapping','Selectable mesh has no corresponding record mapping');
 const side=/\bleft\b/i.test(model?.name??r.officialName)?'left':/\bright\b/i.test(model?.name??r.officialName)?'right':null;
 if(side&&r.laterality&&side!==r.laterality)issue('laterality','Record contradicts source laterality');
 const displayedSide=/\bleft\b/i.test(r.officialName)?'left':/\bright\b/i.test(r.officialName)?'right':null;
 if(side&&displayedSide&&side!==displayedSide)issue('name-laterality','Displayed name contradicts canonical mesh side');
 for(const child of r.childrenIds){if(!known.has(child))issue('child','Unknown child '+child);else if(getKnowledge(child).parentId!==r.id)issue('parent-child','Child does not point back to parent '+child);}
 if(r.parentId&&!known.has(r.parentId)&&!groups.has(r.parentId))issue('parent','Unknown anatomical or hierarchy parent');
 const facts=recordFacts(r);
 for(const f of facts){if(!f.text.trim())issue('empty-claim','Empty medical claim');if(!f.sources.length)issue('uncited-claim','Medical claim lacks sources');for(const id of f.sources){if(!sources.some(s=>s.id===id))issue('unknown-source','Unknown source '+id);if(!r.sourceReferences.includes(id))issue('undeclared-source','Claim reference is not in record bibliography: '+id);}for(const evidence of f.evidence??[])if(!evidence.locator.trim()||!f.sources.includes(evidence.sourceId))issue('evidence','Invalid claim-level evidence locator');}
 for(const relation of r.anatomicalRelations)if(relation.targetId){if(!known.has(relation.targetId))issue('relation','Unknown relationship '+relation.targetId);else if((relation as {lateralityConstraint?:string}).lateralityConstraint==='ipsilateral'&&side){const target=getKnowledge(relation.targetId);if(target.laterality!==side)issue('relationship-laterality','Ipsilateral link crosses to the other side: '+relation.targetId);}}
 if(r.populationBatch)for(const f of facts)if(!f.evidence?.length)issue('evidence-gap','New-batch medical claim lacks a source locator');
 for(const section of r.detailedSections??[])if(section.status==='not-applicable'&&(!section.reviewNote?.trim()||!section.facts.length))issue('applicability','Not-applicable status requires a sourced rationale: '+section.id);
 if(r.pronunciation?.verificationStatus==='dictionary-checked'&&(!r.pronunciation.ipaEnglish||!r.pronunciation.sourceIds.length||r.pronunciation.sourceIds.some(id=>!sources.some(s=>s.id===id)||!r.sourceReferences.includes(id))))issue('pronunciation-source','Dictionary transcription needs a consulted declared source');
 if(r.clinicalReview?.status==='approved'&&(!r.clinicalReview.reviewer||!r.clinicalReview.reviewedAt))issue('review-attestation','Medical approval lacks reviewer/date');
 if(!r.description.length)issue('description-missing','Medical description not populated','review');
 if(r.clinicalReview?.status!=='approved')issue('medical-review','Independent medical review pending','review');
 for(const s of evaluateSections(r))if(s.status==='not-started'||s.status==='needs-review')issue('section:'+s.id,'Section requires research/review: '+s.id,'review');
 return issues;
}
export function contentStatus(r:AnatomyRecord){
 const errors=validateRecord(r).some(i=>i.severity==='error');if(errors)return 'Requires review';
 if(!r.description.length)return 'Skeleton record only';
 const evaluated=evaluateSections(r);const populated=evaluated.every(s=>(s.status==='source-checked'&&s.facts>0)||s.status==='not-applicable');
 // All substantive category fields, terminology and real mesh mapping required.
 // Clinical approval is a separate, stricter gate; a short article cannot qualify.
 const full=populated&&r.latinName&&r.meshIds.length>0&&r.pronunciation&&r.sourceReferences.length>0;
 if(full&&r.clinicalReview?.status==='approved')return 'Medically verified';
 if(full)return 'Fully populated';
 return 'Partially populated';
}
export const coverageStatuses=['Not started','Skeleton record only','Partially populated','Fully populated','Medically verified','Requires review'] as const;
export function coverageRows(){return anatomy.map(model=>{const r=getKnowledge(model.id);const issues=validateRecord(r);return {id:r.id,name:r.officialName,kind:r.kind,system:systemFor(r.id)??'Other / unclassified',laterality:r.laterality,status:contentStatus(r),mapped:r.meshIds.includes(model.id),description:r.description.length>0,expandedDescription:r.populationBatch==='upper-limb-001'&&r.description.length>1,relations:r.anatomicalRelations.length>0,substructures:r.parts.length+r.surfaces.length+r.landmarks.length,clinical:r.clinicalNotes.length>0,references:r.sourceReferences.length>0,medicalReferences:r.sourceReferences.some(id=>!['bp3d','zanatomy'].includes(id)),pronunciation:r.pronunciation?.method==='browser-speech-synthesis',recordedAudio:false,medicalReview:r.clinicalReview?.status??'pending',missingSections:evaluateSections(r).filter(s=>s.status==='not-started'||s.status==='needs-review').map(s=>s.id),errors:issues.filter(i=>i.severity==='error')};});}
export function coverageSummary(){const rows=coverageRows();return {schemaVersion:1,totalSelectable:rows.length,recordsCreated:rows.length,missingRecords:0,mapped:rows.filter(r=>r.mapped).length,unmapped:rows.filter(r=>!r.mapped).length,expandedDescriptions:rows.filter(r=>r.expandedDescription).length,verifiedDescriptions:rows.filter(r=>r.medicalReview==='approved').length,statuses:Object.fromEntries(coverageStatuses.map(status=>[status,rows.filter(r=>r.status===status).length])),systems:[...bodySystems,'Other / unclassified'].map(system=>{const items=rows.filter(r=>r.system===system);return {system,total:items.length,mapped:items.filter(r=>r.mapped).length,records:items.length,expandedDescriptions:items.filter(r=>r.expandedDescription).length,relations:items.filter(r=>r.relations).length,substructureInformation:items.filter(r=>r.substructures).length,clinical:items.filter(r=>r.clinical).length,medicalReferences:items.filter(r=>r.medicalReferences).length,pronunciationFallback:items.filter(r=>r.pronunciation).length,incomplete:items.filter(r=>!['Fully populated','Medically verified'].includes(r.status)).length};}),adultSkeleton:{expected:adultSkeleton.length,axial:adultSkeleton.filter(b=>b.division==='Axial').length,appendicular:adultSkeleton.filter(b=>b.division==='Appendicular').length,represented:adultSkeleton.filter(b=>b.meshIds.length).length,exact:adultSkeleton.filter(b=>b.mapping==='exact-name').length,componentGroups:adultSkeleton.filter(b=>b.mapping==='component-group').length,missing:adultSkeleton.filter(b=>!b.meshIds.length)},semanticOnly:allRecordIds.filter(id=>!byId.has(id)).length,validationErrors:rows.flatMap(r=>r.errors)};}
