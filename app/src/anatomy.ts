import catalog from './catalog.json';
import supplemental from './supplemental.json';
import tissues from './tissueModels.json';
import tissueChunks from './tissueChunks.json';
export type Vec3 = [number, number, number];
export type Structure = { id:string; name:string; system:string; region:string; color:string; position:Vec3; size:Vec3; chunk:string; parents:{id:string;name:string}[]; description:string; shapes:never[] };
const tissueById = new Map((tissues as Structure[]).map(model => [model.id, model]));
const compacted = new Map(tissueChunks.filter(chunk => chunk.id.startsWith('bp-study-'))
 .flatMap(chunk => chunk.structures.map(id => [id, chunk.id] as const)));
const legacy = [...catalog, ...supplemental] as Structure[];
const legacyIds = new Set(legacy.map(model => model.id));
export const newTissueIds = tissues.filter(model => !legacyIds.has(model.id)).map(model => model.id);
export const anatomy = [
 ...legacy.map(model => {
  const chunk = compacted.get(model.id);
  return tissueById.get(model.id) ?? (chunk ? {...model, chunk} : model);
 }),
 ...newTissueIds.map(id => tissueById.get(id)!),
];
export function isRegisteredTissue(id: string) { return tissueById.has(id); }
export const systems = [...new Set(anatomy.map(s=>s.system))];
export const byId = new Map(anatomy.map(s=>[s.id,s]));
export function searchStructures(query:string) {
 const q=query.trim().toLocaleLowerCase();
 return anatomy.filter(s=>[s.id,s.name,s.system,s.region,...s.parents.flatMap(p=>[p.id,p.name])].some(v=>v.toLocaleLowerCase().includes(q)));
}
export const regions = [...new Set(anatomy.map(s=>s.region))];
