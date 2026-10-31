import type { AnatomyRecord,SourceReference } from './knowledgeSchema';
import { evaluateSections,recordFacts,validateRecord } from './coverage';
export function normalizedDatabase(records:AnatomyRecord[],sources:SourceReference[],hierarchyGroups:unknown[]){
 return {
  schemaVersion:1,
  anatomical_structures:records.map(({id,officialName,kind,anatomicalSystem,laterality,version,verificationStatus,clinicalReview})=>({id,officialName,kind,anatomicalSystem,laterality,version,verificationStatus,clinicalReview})),
  anatomical_names:records.map(r=>({id:r.id,english:r.officialName,latin:r.latinName,synonyms:r.synonyms,standardIds:r.standardIds??[]})),
  anatomical_hierarchies:records.map(r=>({id:r.id,parentId:r.parentId,childrenIds:r.childrenIds,path:r.hierarchyPath})),
  hierarchy_groups:hierarchyGroups,
  anatomical_sections:records.map(r=>({id:r.id,evaluation:evaluateSections(r),description:r.description,classification:r.classification,location:r.location,quickFacts:r.quickFacts,structureAndFunction:r.structureAndFunction,parts:r.parts,surfaces:r.surfaces,landmarks:r.landmarks,attachments:r.attachments,articulations:r.articulations,detailed:r.detailedSections??[],extensions:r.extensions??{}})),
  anatomical_relationships:records.flatMap(r=>r.anatomicalRelations.map(f=>({structureId:r.id,...f}))),
  model_mesh_mappings:records.map(r=>({id:r.id,meshIds:r.meshIds,modelIds:r.modelIds,mappingStatus:r.meshIds.length?'installed':'semantic-only-no-separate-geometry'})),
  anatomical_sources:sources,
  source_evidence:records.flatMap(r=>recordFacts(r).map((fact,i)=>({claimId:r.id+':claim:'+i,structureId:r.id,text:fact.text,sourceIds:fact.sources,evidence:fact.evidence??[],checkedAt:r.lastReviewedAt,locatorStatus:fact.evidence?.length?'claim-linked':'legacy-source-level-only'}))),
  pronunciation_records:records.map(r=>({id:r.id,...r.pronunciation})),
  clinical_correlations:records.map(r=>({id:r.id,claims:r.clinicalNotes})),
  anatomical_variations:records.map(r=>({id:r.id,sections:r.detailedSections?.filter(s=>s.id.startsWith('variations'))??[]})),
  data_validation_results:records.map(r=>({id:r.id,issues:validateRecord(r)})),
 };
}
