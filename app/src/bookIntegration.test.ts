import { describe,expect,it } from 'vitest';
import { bookPages,bookReferencesFor } from './bookReferences';
import { getKnowledge } from './knowledge';
import { getLandmarkAnchor,landmarkBindingFor } from './landmarks';
import { byId } from './anatomy';
import { atlasById } from './atlasCatalog';
import { members } from './registry';

describe('Rohen right humerus integration',()=>{
 it('maps all 23 numbered labels to unique ipsilateral concepts',()=>{
  const plate=bookPages.find(page=>page.pdfPage===387)!;
  expect(plate.printedPage).toBe(373);
  expect(plate.labels.map(l=>l.label)).toEqual(Array.from({length:23},(_,i)=>i+1));
  expect(new Set(plate.labels.flatMap(l=>l.recordIds)).size).toBe(23);
  for(const label of plate.labels){
   const record=getKnowledge(label.recordIds[0]);
   expect(record.parentId).toBe(plate.subjectIds[0]);
   expect(record.laterality).toBe('right');
   expect(bookReferencesFor(record.id)).toContainEqual({pdfPage:387,printedPage:373,subsection:'Humerus',label:label.label});
   expect(members(record.id)).toEqual([]);
  }
 });
 it('files the humerus under the upper limb while retaining its original storage chunk',()=>{
  expect(atlasById.get('atlas:skeletal-2')?.members).toContain('FMA23130');
  expect(atlasById.get('atlas:skeletal-1')?.members).not.toContain('FMA23130');
  expect(byId.get('FMA23130')?.chunk).toBe('skeletal-trunk-2');
 });
 it('leaves the ulnar groove semantic and keeps the right-side bindings distinct',()=>{
  const right='FMA23130',left='FMA23131';
  const ulnarGroove='feature:'+right+':ulnar-groove';
  expect(getKnowledge(ulnarGroove).standardIds).toEqual(['TA2:1208']);
  expect(getLandmarkAnchor(right,ulnarGroove)).toBeNull();
  expect(getLandmarkAnchor(right,'feature:'+left+':head')).toBeNull();
  expect(landmarkBindingFor(left)).toBeUndefined();
  expect(getLandmarkAnchor(right,'feature:'+right+':head')?.position[0]).toBeLessThan(0);
 });
});
