import { anatomy } from './anatomy';
import { bodySystems, systemFor } from './classification';
export type AtlasCard={id:string;title:string;members:string[];preview:string};
export type AtlasSection={id:string;title:string;cards:AtlasCard[]};
const regionFor=(s:typeof anatomy[number])=>s.region==='Hand'?'Upper limbs':s.region;
const regions=[['Head & neck','Head and neck'],['Trunk','Trunk'],['Upper limbs','Upper limbs'],['Lower limbs & pelvis','Lower limbs and pelvis']] as const;
const card=(id:string,title:string,members:string[]):AtlasCard=>({id:'atlas:'+id,title,members,preview:'/previews/'+id+'.webp'});
export const atlasSections:AtlasSection[]=bodySystems.map(system=>({
 id:system.toLowerCase().replaceAll(' ','-'),title:system==='Skeletal'?'Bones · Skeletal system':system==='Muscular'?'Muscles · Muscular system':system+' system',
 cards:regions.map(([region,title],i)=>card(system.toLowerCase().replaceAll(' ','-')+'-'+i,title,anatomy.filter(s=>systemFor(s.id)===system&&regionFor(s)===region).map(s=>s.id))).filter(c=>c.members.length),
}));
const other=anatomy.filter(s=>systemFor(s.id)===null);
atlasSections.push({id:'other',title:'Additional structures · classification pending',cards:regions.map(([region,title],i)=>card('other-'+i,title,other.filter(s=>regionFor(s)===region).map(s=>s.id))).filter(c=>c.members.length)});
export const atlasCards=atlasSections.flatMap(s=>s.cards);
export const atlasById=new Map(atlasCards.map(c=>[c.id,c]));
export const previewPresets=[
 card('home-atlas','Atlas of anatomy',anatomy.filter(s=>s.region==='Head & neck'&&(s.system==='Skeletal'||s.system==='Muscular')).map(s=>s.id)),
 card('home-quiz','Identification practice',anatomy.filter(s=>s.region==='Trunk'&&s.system==='Cardiovascular').map(s=>s.id)),
 card('home-library','Saved study views',anatomy.filter(s=>s.region==='Upper limbs'&&s.system==='Skeletal').map(s=>s.id)),
 card('home-section','Section workspace',anatomy.filter(s=>s.region==='Trunk'&&(s.system==='Skeletal'||s.system==='Respiratory')).map(s=>s.id)),
];
