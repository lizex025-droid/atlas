import { describe, expect, it } from 'vitest';
import { anatomy } from './anatomy';
import { modelModeMembers, modelModes, applyModelMode, activeModelMode, toggleMuscleLayer } from './modelModes';
import { workspaceInitial } from './workspace';

describe('human anatomy browser presets', () => {
 it('provides four nonempty, unique, real-mesh categories', () => {
  for (const mode of modelModes) {
   const ids = modelModeMembers(mode.id);
   expect(ids.length).toBeGreaterThan(0);
   expect(new Set(ids).size).toBe(ids.length);
   expect(ids.every(id => anatomy.some(model => model.id === id))).toBe(true);
  }
 });
 it('recognizes the existing skeleton-only initial state', () => {
  expect(activeModelMode(workspaceInitial())).toBe('skeleton');
 });
 it('switches meshes without moving the camera or discarding notes', () => {
  const start = workspaceInitial();
  const selected = { ...start, selected: 'FMA24474', selectedIds: ['FMA24474'], groupId: 'group:axial', annotations: [{id:'n',structure:'FMA24474',text:'Remember this'}], opacity: {FMA24474:0.5} };
  const camera = { position: [2, 3, 4] as [number, number, number], target: [0, 1, 0] as [number, number, number] };
  const next = applyModelMode(selected, 'muscles', camera);
  expect(activeModelMode(next)).toBe('muscles');
  expect(next.camera).toEqual(camera);
  expect(next.selected).toBeNull();
  expect(next.selectedIds).toEqual([]);
  expect(next.groupId).toBeNull();
  expect(next.annotations).toEqual(selected.annotations);
  expect(next.opacity).toEqual({});
  const back = applyModelMode(next, 'skeleton');
  expect(activeModelMode(back)).toBe('skeleton');
  expect(back.camera).toEqual(camera);
 });
 it('does not incorrectly mark a mixed custom layer selection as a preset', () => {
  const initial = workspaceInitial();
  const extra = modelModeMembers('muscles')[0];
  expect(activeModelMode({ ...initial, hidden: initial.hidden.filter(id => id !== extra) })).toBeNull();
 });
});

it('reveals registered muscle attachments without hiding the skeleton or notes', () => {
 const start = workspaceInitial();
 const ids = anatomy.filter(m => m.system === 'Muscular').map(m => m.id);
 const next = toggleMuscleLayer(start, ids);
 const scalp = anatomy.find(m => /epicranial aponeurosis/i.test(m.name))!;
 expect(scalp).toBeDefined();
 expect(next.hidden).not.toContain(scalp.id);
 for (const m of anatomy.filter(m => m.system === 'Skeletal')) expect(next.hidden).not.toContain(m.id);
 expect(next.camera).toEqual(start.camera);
 const off = toggleMuscleLayer(next, ids);
 expect(ids.every(id => off.hidden.includes(id))).toBe(true);
 expect(off.hidden).not.toContain(scalp.id);
});
