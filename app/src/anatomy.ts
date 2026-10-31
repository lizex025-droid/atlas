import catalog from './catalog.json';
import supplemental from './supplemental.json';
export type Vec3 = [number, number, number];
export type Structure = { id:string; name:string; system:string; region:string; color:string; position:Vec3; size:Vec3; chunk:string; parents:{id:string;name:string}[]; description:string; shapes:never[] };
export const anatomy = [...catalog,...supplemental] as Structure[];
export const systems = [...new Set(anatomy.map(s=>s.system))];
export const byId = new Map(anatomy.map(s=>[s.id,s]));
export function searchStructures(query:string) {
 const q=query.trim().toLocaleLowerCase();
 return anatomy.filter(s=>[s.id,s.name,s.system,s.region,...s.parents.flatMap(p=>[p.id,p.name])].some(v=>v.toLocaleLowerCase().includes(q)));
}
export const regions = [...new Set(anatomy.map(s=>s.region))];
