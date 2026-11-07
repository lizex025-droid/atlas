import reviews from './content/rohen-reviews.json';

type ModelReview={meshId:string;status:string;checks:Record<string,string>;blocker:string};
type UnresolvedConcept={conceptId:string;name:string;reason:string;kind:string};
type Label={
 label:number|string;
 recordIds:string[];
 views:string[];
 unresolved?:UnresolvedConcept;
};
export type BookPageReview={
 pdfPage:number;
 printedPage:number;
 chapter:string;
 subsection:string;
 figureId:string;
 laterality?:'left'|'right'|'midline';
 views:string[];
 visuallyReviewed:boolean;
 indexPagesChecked:number[];
 indexReconciliation:string;
 labelCount:number;
 subjectIds:string[];
 unresolvedSubjects?:UnresolvedConcept[];
 featureParentId?:string;
 labels:Label[];
 modelReviews:ModelReview[];
};
export const bookPages:BookPageReview[]=reviews.pages as BookPageReview[];
type PlateReference={printedPage:number;pdfPage:number;subsection:string;label:number|string|null};
const referencesByRecord=new Map<string,PlateReference[]>();
for(const page of bookPages){
 const {printedPage,pdfPage,subsection}=page;
 const entries=[{recordIds:page.subjectIds,label:null},...page.labels];
 for(const {recordIds,label} of entries){
  for(const recordId of recordIds){
   const refs=referencesByRecord.get(recordId)??[];
   refs.push({printedPage,pdfPage,subsection,label});
   referencesByRecord.set(recordId,refs);
  }
 }
}
export const bookReferencesFor=(id:string)=>referencesByRecord.get(id)??[];
