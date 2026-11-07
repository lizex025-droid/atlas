import { anatomy, isRegisteredTissue } from './anatomy';
import type { CameraView } from './scene';
import { systemFor } from './classification';
import { toggleMembers } from './workspace';
import type { WorkspaceState } from './workspace';

/** Licensed Atlas meshes only; no Body Browser assets are imported. */
export const modelModes = [
 { id: 'skeleton', label: 'Skeleton', detail: 'Bony structures' },
 { id: 'muscles', label: 'Muscles', detail: 'Muscular system' },
 { id: 'nerves', label: 'Nerves', detail: 'Nervous system' },
 { id: 'organs', label: 'Organs', detail: 'Digestive, respiratory, endocrine and urogenital systems' },
] as const;
export type ModelModeId = typeof modelModes[number]['id'];
const organSystems = new Set(['Digestive', 'Respiratory', 'Endocrine', 'Urogenital']);

export function modelModeMembers(mode: ModelModeId): string[] {
 return anatomy.filter(model => {
  // Match the established initial scene for a seamless default preset.
  if (mode === 'skeleton') return model.system === 'Skeletal';
  const system = systemFor(model.id);
  if (mode === 'muscles') return system === 'Muscular' || (system === 'Connective Tissue' && isRegisteredTissue(model.id));
  if (mode === 'nerves') return system === 'Nervous';
  return system !== null && organSystems.has(system);
 }).map(model => model.id);
}

export function applyModelMode(state: WorkspaceState, mode: ModelModeId, camera: CameraView = state.camera): WorkspaceState {
 const keep = new Set(modelModeMembers(mode));
 const selectedIds = state.selectedIds.filter(id => keep.has(id));
 return {
  ...state,
  hidden: anatomy.filter(model => !keep.has(model.id)).map(model => model.id),
  opacity: {},
  selected: state.selected && keep.has(state.selected) ? state.selected : null,
  selectedIds,
  groupId: null,
  camera,
 };
}

export function activeModelMode(state: WorkspaceState): ModelModeId | null {
 const hidden = new Set(state.hidden);
 for (const mode of modelModes) {
  const visible = new Set(modelModeMembers(mode.id));
  if (visible.size !== anatomy.length - hidden.size) continue;
  if (anatomy.every(model => hidden.has(model.id) !== visible.has(model.id))) return mode.id;
 }
 return null;
}

/** Include the actual scalp, Achilles and plantar aponeuroses when muscles are
 * enabled from the layer bar, just as in the muscle preset. Respect subsequent
 * independent connective-tissue toggles and never hide existing layers. */
export function toggleMuscleLayer(state: WorkspaceState, muscleIds: string[]): WorkspaceState {
 const turningOn = muscleIds.every(id => state.hidden.includes(id));
 const next = toggleMembers(state, muscleIds);
 if (!turningOn) return next;
 const attachments = new Set(anatomy.filter(model => model.system === 'Connective Tissue' && isRegisteredTissue(model.id)).map(model => model.id));
 return {...next, hidden: next.hidden.filter(id => !attachments.has(id))};
}
