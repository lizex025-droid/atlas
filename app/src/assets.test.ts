import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { anatomy } from './anatomy';
import chunks from './chunks.json';
import supplementalChunks from './supplementalChunks.json';
const base=new URL('../public/models/bodyparts3d/',import.meta.url);
const manifest=JSON.parse(readFileSync(new URL('manifest.json',base),'utf8'));
const supplement=JSON.parse(readFileSync(new URL('../public/models/z-anatomy/manifest.json',import.meta.url),'utf8'));
describe('licensed anatomical assets',()=>{
 it('records an explicit per-source license, source URL, SHA and changes for every structure',()=>{
  const mapped=new Set<string>();
  for(const m of manifest.models){expect(m.license).toBe('CC-BY-SA-2.1-JP');expect(m.sourceUrl).toMatch(/^https:\/\/dbarchive.biosciencedbc.jp\//);expect(m.sourceSha256).toMatch(/^[a-f0-9]{64}$/);expect(m.changes).toContain('GLB');mapped.add(m.id);}
  for(const m of supplement.models){expect(m.license).toBe('CC-BY-SA-4.0');expect(m.sourceObject).toMatch(/^Palmar aponeurosis\.[lr]$/);expect(m.sourceObjectGeometrySha256).toMatch(/^[a-f0-9]{64}$/);mapped.add(m.id);}
  expect(anatomy.every(s=>mapped.has(s.id))).toBe(true);
 });
 it('checks all chunk hashes, unique mesh IDs, indexed topology and normals',()=>{
  const seen=new Set<string>();
  for(const chunk of [...chunks,...supplementalChunks]){const data=readFileSync(new URL('../public'+chunk.url,import.meta.url));expect(data.length).toBe(chunk.bytes);expect(createHash('sha256').update(data).digest('hex')).toBe(chunk.sha256);expect(data.readUInt32LE(0)).toBe(0x46546c67);expect(data.readUInt32LE(8)).toBe(data.length);const json=JSON.parse(data.subarray(20,20+data.readUInt32LE(12)).toString());
   expect(json.nodes.map((n:{name:string})=>n.name)).toEqual(chunk.structures);
   for(const node of json.nodes){expect(seen.has(node.name)).toBe(false);seen.add(node.name);const primitive=json.meshes[node.mesh].primitives[0];expect(primitive.indices).toBeTypeOf('number');expect(primitive.attributes.NORMAL).toBeTypeOf('number');}
  }
  expect(seen.size).toBe(anatomy.length);
 });
 it('starts with skeleton only and has substantial skeletal and muscular coverage',async()=>{
  const {initialState}=await import('./scene');const state=initialState();
  expect(anatomy.filter(s=>s.system==='Skeletal').length).toBeGreaterThan(200);
  expect(anatomy.filter(s=>s.system==='Muscular').length).toBeGreaterThan(300);
  expect(anatomy.filter(s=>!state.hidden.includes(s.id)).every(s=>s.system==='Skeletal')).toBe(true);
 });
});
