import { useMemo,useState } from 'react';
import type { CSSProperties } from 'react';
import { Html } from '@react-three/drei';
import type { BufferGeometry } from 'three';
import { landmarkCategories,landmarkBindingFor } from './landmarks';
import type { BoneLandmark } from './landmarks';
import { resolveSurfaceAnchor } from './landmarkGeometry';
export function LandmarkMarkers({boneId,geometry,items,selected,onSelect}:{boneId:string;geometry:BufferGeometry;items:BoneLandmark[];selected:string|null;onSelect:(id:string)=>void}){
 const [hover,setHover]=useState<string|null>(null);
 const bound=useMemo(()=>{
  const binding=landmarkBindingFor(boneId);
  if(!binding||geometry.getAttribute('position').count!==binding.vertexCount||geometry.index?.count!==binding.triangleCount*3)return [];
  return items.flatMap(item=>{
   const p=item.boneId===boneId&&item.anchor?resolveSurfaceAnchor(geometry,item.anchor):null;
   return p?[{item,p}]:[];
  });
 },[boneId,geometry,items]);
 return <>{bound.map(({item,p})=><Html key={item.id} position={p.displayPosition} center occlude zIndexRange={[12,8]} style={{pointerEvents:'auto'}}><button type="button" className={'landmark-marker '+(selected===item.id?'selected':'')} style={{'--marker-color':landmarkCategories[item.category].color} as CSSProperties} aria-label={'Landmark '+item.name} aria-pressed={selected===item.id} data-landmark={item.id} onPointerEnter={()=>setHover(item.id)} onPointerLeave={()=>setHover(null)} onFocus={()=>setHover(item.id)} onBlur={()=>setHover(null)} onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();onSelect(item.id);}}><span/>{hover===item.id?<span className="landmark-tooltip">{item.name}</span>:null}</button></Html>)}</>;
}
