import { describe,it,expect } from 'vitest';
import { curatedRecords,getKnowledge,sources } from './knowledge';
import { byId } from './anatomy';
import { searchRegistry,systemMembers } from './registry';
import { workspaceInitial,selectStructure,visibility,toggleMembers,frame } from './workspace';
import { validateScene } from './scene';
describe('source-backed selection and knowledge',()=>{
 it('stores provenance and review status for every checked fact',()=>{
  for(const r of curatedRecords){expect(r.verificationStatus).toBe('source-checked');expect(r.lastReviewedAt).toBeTruthy();
   for(const fact of [...r.description,...r.classification,...r.location,...r.quickFacts,...r.structureAndFunction,...r.parts,...r.surfaces,...r.landmarks,...r.attachments,...r.articulations,...r.anatomicalRelations,...r.clinicalNotes]){expect(fact.sources.length).toBeGreaterThan(0);expect(fact.sources.every(id=>sources.some(s=>s.id===id))).toBe(true);}
  }
 });
 it('searches canonical IDs, Latin and verified synonyms',()=>{expect(searchRegistry('T11')).toContain('FMA10059');expect(searchRegistry('aponeurosis palmaris')).toContain('TA2:2549');});
 it('replaces structure content synchronously without leaking T11 into palmar facts',()=>{const t=getKnowledge('FMA10059');const p=getKnowledge('TA2:2549');expect(t.parts.length).toBeGreaterThan(0);expect(p.parts).toEqual([]);expect(p.description.map(f=>f.text).join(' ')).not.toContain('vertebra');expect(p.clinicalNotes.length).toBeGreaterThan(0);});
 it('leaves unreviewed structures explicitly without fabricated description or Latin',()=>{const r=getKnowledge('FMA24474');expect(r.verificationStatus).toBe('metadata-only');expect(r.description).toEqual([]);expect(r.latinName).toBeNull();});
 it('applies multi-object visibility and clears a hidden selection',()=>{let s=selectStructure(workspaceInitial(),'FMA10059');s=selectStructure(s,'FMA24474',true);expect(s.selectedIds).toHaveLength(2);s=visibility(s,'isolate');expect(s.hidden).not.toContain('FMA10059');s=visibility(s,'fade');expect(s.opacity.FMA10059).toBe(.18);s=visibility(s,'hide');expect(s.selected).toBeNull();expect(s.selectedIds).toEqual([]);});
 it('selects parent groups and preserves camera direction during framing',()=>{const s=selectStructure(workspaceInitial(),'group:thoracic',false,true);expect(s.selectedIds.length).toBeGreaterThan(10);expect(s.groupId).toBe('group:thoracic');const f=frame(['FMA10059'],{position:[8,0,0],target:[0,0,0]});expect(f.position[0]).toBeGreaterThan(f.target[0]);expect(f.position[2]).toBe(f.target[2]);});
 it('clears selections when their visible system is hidden',()=>{const s=selectStructure(workspaceInitial(),'FMA10059');const next=toggleMembers(s,systemMembers.get('Skeletal')!);expect(next.selected).toBeNull();expect(next.hidden).toContain('FMA10059');});
 it('accepts semantic knowledge selection but rejects group IDs in the primary record slot',()=>{const base={...workspaceInitial(),id:'x',date:'2026-10-31',name:'x'};expect(validateScene({...base,selected:'TA2:2549'})).toBe(true);expect(validateScene({...base,selected:'group:thoracic'})).toBe(false);});
 it('maps every actual relationship mesh link to a registered canonical structure',()=>{for(const r of curatedRecords)for(const relation of r.anatomicalRelations)if(relation.targetId)expect(byId.has(relation.targetId)).toBe(true);});
 it('binds palmar concept selection to its installed left mesh and keeps its medical record',()=>{const state=selectStructure(workspaceInitial(),'TA2:2549');expect(state.selected).toBe('TA2:2549:L');expect(state.selectedIds).toEqual(['TA2:2549:L']);expect(getKnowledge(state.selected!).latinName).toBe('Aponeurosis palmaris');});
 it('does not label an intervertebral disk as bone',()=>{expect(getKnowledge('FMA13508').kind).toBe('other');});
});
