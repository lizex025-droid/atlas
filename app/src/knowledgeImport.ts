import type { AnatomyRecord,SourceReference } from './knowledgeSchema';
import { allRecordIds } from './coverage';
import { getKnowledge,sources } from './knowledge';
import { byId } from './anatomy';
import { categorySections } from './knowledgeSchema';
export type ImportBundle={schemaVersion:1;rightsDeclaration:'original-factual-synthesis-or-authorized-reuse';sources:SourceReference[];records:AnatomyRecord[]};
export function validateImport(input:unknown):string[]{
 const errors:string[]=[];if(!input||typeof input!=='object')return ['Import must be an object'];const p=input as ImportBundle;
 if(p.schemaVersion!==1)errors.push('Unsupported schema version');if(p.rightsDeclaration!=='original-factual-synthesis-or-authorized-reuse')errors.push('Explicit rights declaration required; importing protected application text is not permitted');
 if(!Array.isArray(p.sources)||!Array.isArray(p.records))return [...errors,'sources and records arrays required'];
 if(p.records.length>500)errors.push('Batch exceeds 500 records; split into resumable batches');
 const sourceIds=new Set(sources.map(s=>s.id));const inputSources=new Set<string>();
 for(const s of p.sources){if(!s||typeof s!=='object'){errors.push('Invalid source');continue;}if(inputSources.has(s.id)||sourceIds.has(s.id))errors.push('Duplicate/existing source ID: '+s.id);inputSources.add(s.id);sourceIds.add(s.id);if(!s.id||!s.title||!s.license||!s.use||!s.locator||!/^\d{4}-\d{2}-\d{2}$/.test(s.accessedAt??'')||!/^https:\/\//.test(s.url??''))errors.push('Source provenance/consultation/locator incomplete: '+s.id);if(!['public-domain','factual-reference-only','licensed-reuse'].includes(s.permission??''))errors.push('Source permission assessment required: '+s.id);}
 const recordIds=new Set<string>();
 const incomingIds=new Set(p.records.flatMap(r=>r&&typeof r.id==='string'?[r.id]:[]));
 for(const r of p.records){
  if(!r||typeof r!=='object'){errors.push('Record must be an object');continue;}if(recordIds.has(r.id))errors.push('Duplicate record ID: '+r.id);recordIds.add(r.id);
  const existing=allRecordIds.includes(r.id);
  const newFeature=!existing&&typeof r.id==='string'&&/^feature:[A-Za-z0-9:_-]+$/.test(r.id)&&r.kind==='landmark'&&!!r.parentId&&allRecordIds.includes(r.parentId);
  if(!existing&&!newFeature){errors.push('Unknown canonical ID: '+r.id+'; register its model identity first');continue;}
  const old=getKnowledge(existing?r.id:r.parentId!);if(!Number.isInteger(r.version)||(r.version??0)<=(existing?old.version??1:0))errors.push('Version must increase for '+r.id);
  if(newFeature){if(!Array.isArray(r.meshIds)||r.meshIds.length)errors.push('New semantic feature must not claim existing whole-bone geometry: '+r.id);const parent=p.records.find(p=>p.id===r.parentId)??old;if(!parent.childrenIds?.includes(r.id))errors.push('New feature requires a parent backlink in the same batch: '+r.id);}
  if(r.clinicalReview?.status==='approved')errors.push('Generic import cannot certify independent medical approval: '+r.id);
  const side=/\bleft\b/i.test(old.officialName)?'left':/\bright\b/i.test(old.officialName)?'right':null;if(side&&r.laterality!==side)errors.push('Laterality mismatch: '+r.id);
  let malformed=false;for(const key of ['description','classification','location','quickFacts','structureAndFunction','parts','surfaces','landmarks','attachments','articulations','anatomicalRelations','clinicalNotes','images','childrenIds','meshIds','modelIds','sourceReferences','synonyms','hierarchyPath'] as const)if(!Array.isArray(r[key])){errors.push('Array field required: '+r.id+'.'+key);malformed=true;}if(malformed)continue;
  if(!Object.hasOwn(categorySections,r.kind))errors.push('Unsupported anatomical category: '+r.kind);
  if(!r.officialName||!r.kind||!r.anatomicalSystem||!r.region)errors.push('Identity/category missing: '+r.id);
  const namedSide=/\bleft\b/i.test(r.officialName)?'left':/\bright\b/i.test(r.officialName)?'right':null;if(side&&namedSide&&side!==namedSide)errors.push('Displayed-name laterality mismatch: '+r.id);
  if(!Array.isArray(r.description)||!Array.isArray(r.meshIds)||!Array.isArray(r.sourceReferences))continue;
  if(byId.has(r.id)&&!r.meshIds.includes(r.id))errors.push('Selectable model mapping removed: '+r.id);
  for(const id of r.meshIds)if(!byId.has(id))errors.push('Unknown mesh '+id);
  for(const id of r.sourceReferences)if(!sourceIds.has(id))errors.push('Unknown source '+id);
  if(!r.description.length)errors.push('Imported medical profile needs a nonempty original description: '+r.id);
  if(r.extensions&&Object.values(r.extensions).some(v=>!Array.isArray(v))){errors.push('Extension fields must be claim arrays: '+r.id);continue;}
  if(r.detailedSections!==undefined&&(!Array.isArray(r.detailedSections)||r.detailedSections.some(s=>!s||!s.id||!s.title||!Array.isArray(s.facts)))){errors.push('Malformed medical section: '+r.id);continue;}
  for(const section of r.detailedSections??[])if(section.status==='not-applicable'&&(!section.reviewNote?.trim()||!section.facts.length))errors.push('Not-applicable section requires a sourced rationale: '+r.id);
  const facts=[...r.description,...r.classification??[],...r.location??[],...r.quickFacts??[],...r.structureAndFunction??[],...r.parts??[],...r.surfaces??[],...r.landmarks??[],...r.attachments??[],...r.articulations??[],...r.anatomicalRelations??[],...r.clinicalNotes??[],...Object.values(r.extensions??{}).flat(),...(r.detailedSections??[]).flatMap(s=>s.facts??[])];
  for(const f of facts)if(!f||typeof f.text!=='string'||!f.text.trim()||!Array.isArray(f.sources)||!f.sources.length||!f.sources.every(id=>sourceIds.has(id)&&r.sourceReferences.includes(id))||!Array.isArray(f.evidence)||!f.evidence.length||!f.evidence.every(e=>e&&f.sources.includes(e.sourceId)&&typeof e.locator==='string'&&e.locator.trim()&&e.status==='source-checked'))errors.push('Unsupported/empty claim or missing consulted-source locator: '+r.id);
  for(const id of r.childrenIds??[])if(!allRecordIds.includes(id)&&!incomingIds.has(id))errors.push('Unknown child '+id);
  for(const f of r.anatomicalRelations??[])if(f.targetId&&!allRecordIds.includes(f.targetId)&&!incomingIds.has(f.targetId))errors.push('Unknown related entity '+f.targetId);
 }
 return [...new Set(errors)];
}
// RFC-style quoted fields; the record column holds a complete JSON record.
export function parseKnowledgeCsv(text:string):unknown[]{
 const rows:string[][]=[];let row:string[]=[],field='',quoted=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(field);field='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(field);if(row.some(v=>v.trim()))rows.push(row);row=[];field='';}else field+=c;}
 if(quoted)throw new Error('Unclosed CSV quote');if(field||row.length){row.push(field);rows.push(row);}const header=rows.shift();if(!header?.includes('record'))throw new Error('CSV requires a record column containing JSON');const index=header.indexOf('record');return rows.map((r,i)=>{try{return JSON.parse(r[index]);}catch{throw new Error('Invalid JSON record on CSV row '+(i+2));}});
}
