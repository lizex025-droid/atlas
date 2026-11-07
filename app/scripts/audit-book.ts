import { readFile,writeFile } from 'node:fs/promises';
import { bookPages,bookReferencesFor } from '../src/bookReferences';
import { allRecordIds,evaluateSections,recordFacts,validateRecord } from '../src/coverage';
import { byId } from '../src/anatomy';
import { getKnowledge,sources } from '../src/knowledge';
import { boneLandmarks } from '../src/landmarks';
import { knownId,members,searchRegistry } from '../src/registry';
import edition from '../../book-integration/edition.json';

const ids=new Set(allRecordIds);
const reviewedPages=new Set<number>();
const conceptIds=new Set<string>();
const landmarkIds=new Set<string>();
const auditedModels=new Map<string,string>();
const unmapped=new Map<string,{kind:string}>();
for(const page of bookPages){
 const {pdfPage,printedPage,subjectIds,labels,modelReviews}=page;
 const chapter=edition.chapterStarts.filter(([start])=>Number(start)<=printedPage).at(-1)?.[1];
 if(!page.visuallyReviewed||!Number.isInteger(pdfPage)||printedPage!==pdfPage-edition.printedOffset||
    printedPage<edition.printedAnatomyPages[0]||printedPage>edition.printedAnatomyPages[1]||
    chapter!==page.chapter||reviewedPages.has(pdfPage)||labels.length!==page.labelCount)throw new Error('Invalid or repeated page '+pdfPage);
 if(page.indexPagesChecked.some(p=>p-edition.printedOffset<edition.printedIndexPages[0]||
    p-edition.printedOffset>edition.printedIndexPages[1]))throw new Error('Invalid index locator on PDF page '+pdfPage);
 reviewedPages.add(pdfPage);
 const seenLabels=new Set<string>();
 for(const feature of labels){
  const key=String(feature.label).trim();
  if(!key||seenLabels.has(key)||!feature.views.length||feature.views.some(view=>!page.views.includes(view))||
     (!feature.recordIds.length&&!feature.unresolved))throw new Error('Invalid or incomplete label '+key+' on PDF page '+pdfPage);
  seenLabels.add(key);
 }
 for(const item of [...page.unresolvedSubjects??[],...labels.flatMap(label=>label.unresolved?[label.unresolved]:[])]){
  if(!item.conceptId||!item.name.trim()||!item.reason.trim())throw new Error('Missing reason for unresolved concept');
  unmapped.set(item.conceptId,item);
 }
 for(const recordId of [...subjectIds,...labels.flatMap(label=>label.recordIds)]){
  if(!ids.has(recordId))throw new Error('Unregistered mapping: '+recordId);
  const record=getKnowledge(recordId);
  if(page.laterality&&record.laterality!==page.laterality)throw new Error('Cross-side mapping: '+recordId);
  if(page.featureParentId&&recordId!==page.featureParentId&&
     (record.parentId!==page.featureParentId||!getKnowledge(page.featureParentId).childrenIds.includes(recordId))){
   throw new Error('Invalid feature parent: '+recordId);
  }
  conceptIds.add(recordId);
  if(record.kind==='landmark')landmarkIds.add(recordId);
 }
 for(const modelReview of modelReviews){
  if(!byId.has(modelReview.meshId)||!conceptIds.has(modelReview.meshId))throw new Error('Invalid model review: '+modelReview.meshId);
  auditedModels.set(modelReview.meshId,modelReview.status);
 }
}

const concepts=[...conceptIds].map(getKnowledge);
const sections=concepts.flatMap(evaluateSections).filter(section=>section.status!=='not-applicable');
const conceptStatus=concepts.map(record=>{
 const meshIds=members(record.id);
 const hasAnchor=Boolean(record.parentId&&boneLandmarks(record.parentId).some(l=>l.id===record.id&&l.anchor));
 const uiRegistered=knownId(record.id)&&searchRegistry(record.id).includes(record.id)&&bookReferencesFor(record.id).length>0;
 const facts=recordFacts(record);
 const sourceRightsChecked=facts.length>0&&record.images.length===0&&Boolean(record.contentLicense)&&
  facts.every(fact=>fact.sources.every(id=>sources.some(s=>s.id===id&&s.url.startsWith('https://')&&s.license&&s.use)&&
    fact.evidence?.some(e=>e.sourceId===id&&e.locator.trim()&&e.status==='source-checked')));
 if(validateRecord(record).some(issue=>issue.severity==='error'))throw new Error('Invalid anatomical record: '+record.id);
 return {
  id:record.id,name:record.officialName,parentId:record.parentId,
  standardIds:record.standardIds??[],meshIds,hasAnchor,uiRegistered,sourceRightsChecked,
  contentGaps:evaluateSections(record).filter(s=>s.status==='not-started'||s.status==='needs-review').map(s=>s.id),
  independentMedicalReview:record.clinicalReview?.status??'pending',
 };
});
const chapterPages=edition.chapterStarts.map(([first,chapter],i)=>{
 const last=Number(edition.chapterStarts[i+1]?.[0]??edition.printedAnatomyPages[1]+1)-1;
 return {chapter,anatomyPages:last-Number(first)+1,visuallyReviewed:bookPages.filter(page=>page.chapter===chapter).length};
});
const total=concepts.length;
const landmarkTotal=landmarkIds.size+[...unmapped.values()].filter(c=>c.kind==='landmark').length;
const surfaceAnchors=conceptStatus.filter(record=>record.hasAnchor).length;
const anatomyPages=edition.printedAnatomyPages[1]-edition.printedAnatomyPages[0]+1;
const metrics=[
 {label:'Physical pages inventoried',done:edition.physicalPages,total:edition.physicalPages,scope:'Edition-specific pagination ledger'},
 {label:'Anatomy pages visually audited',done:reviewedPages.size,total:anatomyPages,scope:'Inspected against the page image'},
 {label:'Anatomical concepts mapped',done:total,total:total+unmapped.size,scope:'Concepts identified on reviewed pages'},
 {label:'Source-checked knowledge sections',done:sections.filter(section=>section.status==='source-checked'&&section.facts>0).length,total:sections.length,scope:'Applicable sections on mapped records'},
 {label:'Records registered in the website',done:conceptStatus.filter(r=>r.uiRegistered).length,total,scope:'Registry, search and source-reference links'},
 {label:'Existing separate 3D meshes',done:conceptStatus.filter(r=>r.meshIds.length).length,total,scope:'Whole structures and individually segmented features'},
 {label:'Full geometry validation passes',done:[...auditedModels.values()].filter(status=>status==='passed').length,total:auditedModels.size,scope:'Models compared to reference views'},
 {label:'Landmark knowledge records',done:landmarkIds.size,total:landmarkTotal,scope:'Features on reviewed plates'},
 {label:'Landmarks with reviewed surface points',done:surfaceAnchors,total:landmarkTotal,scope:'Representative points on the licensed asset'},
 {label:'Records with traceable evidence and rights notes',done:conceptStatus.filter(r=>r.sourceRightsChecked).length,total,scope:'Claim locators and declared reuse basis'},
 {label:'Independent medical review',done:conceptStatus.filter(r=>r.independentMedicalReview==='approved').length,total,scope:'Mapped records'},
];
const dashboard={schemaVersion:1,complete:false,metrics,chapters:chapterPages};
const next={pdfPage:385,printedPage:371,chapter:'Upper Limb',subsection:'Scapula',action:'Audit the three scapular views, add the right scapula knowledge and child features, and resolve the overlapping shoulder plate labels on PDF p. 386. Track joint concepts independently.'};
const checkpoint={
 ...dashboard,editionPdfSha256:edition.pdfSha256,
 reviewedPdfPages:[...reviewedPages].sort((a,b)=>a-b),next,
 concepts:conceptStatus,unmappedConcepts:[...unmapped.values()],modelReviews:bookPages.flatMap(p=>p.modelReviews),
};
const outputs=[
 {url:new URL('../src/content/book-coverage.json',import.meta.url),value:dashboard},
 {url:new URL('../../BOOK_INTEGRATION_PROGRESS.json',import.meta.url),value:checkpoint},
];
for(const {url,value} of outputs){
 const result=JSON.stringify(value,null,2)+'\n';
 if(process.argv.includes('--write'))await writeFile(url,result);
 else if(await readFile(url,'utf8')!==result)throw new Error('Stale book coverage. Run npm run book:audit -- --write');
}
console.log(JSON.stringify(dashboard,null,2));
