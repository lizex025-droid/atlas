import { describe, it, expect } from 'vitest';
import { anatomy, searchStructures } from './anatomy';
import { initialState, isolate, decodeScenes, validateScene } from './scene';
describe('study workspace state',()=>{
 it('searches names, systems and regions case-insensitively',()=>{expect(searchStructures('FMA24474').map(s=>s.id)).toContain('FMA24474');expect(searchStructures('muscular').length).toBeGreaterThan(300);expect(searchStructures('lower limbs').length).toBeGreaterThan(0);});
 it('isolates exactly one known structure',()=>{const hidden=isolate('FMA24474');expect(hidden).toHaveLength(anatomy.length-1);expect(hidden).not.toContain('FMA24474');});
 it('round-trips a complete saved scene including camera and annotations',()=>{const scene={...initialState(),id:'test',name:'Study',date:'2026-10-31',selected:'FMA24474',hidden:['FMA52734'],opacity:{FMA24474:.5},annotations:[{id:'n',structure:'FMA24474',text:'My note'}],camera:{position:[1,2,3],target:[0,1,0]}};expect(validateScene(scene)).toBe(true);expect(decodeScenes(JSON.stringify([scene]))).toEqual([scene]);});
 it('rejects corrupt, unknown structure and invalid camera records',()=>{expect(decodeScenes('{broken')).toEqual([]);expect(decodeScenes(JSON.stringify([{...initialState(),id:'x',name:'x',date:'x',hidden:['proprietary-model']}]))).toEqual([]);expect(validateScene({...initialState(),id:'x',name:'x',date:'x',camera:{position:[null,0,0],target:[0,0,0]}})).toBe(false);});
 it('provides unique FMA structure identities and real mesh references',()=>{expect(new Set(anatomy.map(s=>s.id)).size).toBe(anatomy.length);expect(anatomy.every(s=>s.chunk&&s.size.every(n=>n>0))).toBe(true);});
});
