import { anatomy, byId } from './anatomy';
import { curatedRecords, getKnowledge } from './knowledge';
import { bodySystems, systemFor } from './classification';
export { bodySystems, systemFor } from './classification';
export type { BodySystem } from './classification';
import { atlasCards } from './atlasCatalog';
import { adultSkeleton } from './adultSkeleton';
export const systemMembers=new Map(bodySystems.map(system=>[system,anatomy.filter(s=>systemFor(s.id)===system).map(s=>s.id)]));
export const groups=new Map<string,{id:string;name:string;members:string[]}>();
for(const s of anatomy)for(const p of s.parents){const group=groups.get(p.id)??{...p,members:[]};group.members.push(s.id);groups.set(p.id,group);}
for(const system of bodySystems)groups.set('system:'+system,{id:'system:'+system,name:system+' system',members:systemMembers.get(system)??[]});
for(const [id,name,matcher] of [
 ['group:axial','Axial skeleton',(s:typeof anatomy[number])=>s.system==='Skeletal'&&s.parents.some(p=>/axial|vertebral|skull|thorax/.test(p.name))],
 ['group:spine','Vertebral column',(s:typeof anatomy[number])=>/vertebra|sacrum|coccyx/.test(s.name.toLowerCase())],
 ['group:thoracic','Thoracic vertebrae',(s:typeof anatomy[number])=>/thoracic vertebra/.test(s.name.toLowerCase())],
] as const)groups.set(id,{id,name,members:anatomy.filter(matcher).map(s=>s.id)});
for(const card of atlasCards)groups.set(card.id,{id:card.id,name:card.title,members:card.members});
for(const [id,name,ids] of [
 ['group:appendicular','Appendicular skeleton',adultSkeleton.filter(b=>b.division==='Appendicular').flatMap(b=>b.meshIds)],
 ['group:upper-limb','Upper limb',adultSkeleton.filter(b=>b.division==='Appendicular'&&!/hip|femur|patella|tibia|fibula|talus|calcaneus|cuboid|cuneiform|navicular|metatarsal|toe/i.test(b.name)).flatMap(b=>b.meshIds)],
 ['group:arm','Arm',['FMA23131','FMA23130']],
 ['group:forearm','Forearm',['FMA23465','FMA23464','FMA23468','FMA23467']],
 ['group:fascia','Fasciae',['TA2:2549:L','TA2:2549:R']],
 ['group:upper-fascia','Upper-limb fasciae',['TA2:2549:L','TA2:2549:R']],
] as const)groups.set(id,{id,name,members:[...new Set(ids)]});
export function members(id:string):string[]{return byId.has(id)?[id]:groups.get(id)?.members??curatedRecords.find(r=>r.id===id)?.meshIds??[];}
export function knownId(id:string){return byId.has(id)||groups.has(id)||curatedRecords.some(r=>r.id===id);}
export function titleFor(id:string){return groups.get(id)?.name??getKnowledge(id).officialName;}
export function displaySystem(id:string){return systemFor(id)??(bodySystems.includes(getKnowledge(id).anatomicalSystem as typeof bodySystems[number])?getKnowledge(id).anatomicalSystem:'Other / unclassified');}
export function searchRegistry(query:string,system='All systems'){
 const q=query.trim().toLocaleLowerCase();
 const ids=[...anatomy.map(s=>s.id),...curatedRecords.filter(r=>!byId.has(r.id)).map(r=>r.id)];
 return ids.filter(id=>{if(system!=='All systems'&&displaySystem(id)!==system)return false;const r=getKnowledge(id);return [r.id,r.officialName,r.latinName??'',...r.synonyms,r.region,r.anatomicalSystem,...r.hierarchyPath.map(p=>p.name)].some(s=>s.toLowerCase().includes(q));}).slice(0,q?150:80);
}
