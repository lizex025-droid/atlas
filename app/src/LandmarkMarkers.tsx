import { useMemo,useState } from 'react';
import type { CSSProperties } from 'react';
import { Html } from '@react-three/drei';
import type { BufferGeometry } from 'three';
import { landmarkCategories,landmarkModelBinding } from './landmarks';
import type { BoneLandmark } from './landmarks';
import { resolveSurfaceAnchor } from './landmarkGeometry';
export function LandmarkMarkers({geometry,items,selected,onSelect}:{geometry:BufferGeometry;items:BoneLandmark[];selected:string|null;onSelect:(id:string)=>void}){
 const [hover,setHover]=useState<string|null>(null);
 const bound=useMemo(()=>geometry.getAttribute('position').count===landmarkModelBinding.vertexCount&&geometry.index?.count===landmarkModelBinding.triangleCount*3?items.flatMap(item=>{const p=item.boneId===landmarkModelBinding.boneId&&item.anchor?resolveSurfaceAnchor(geometry,item.anchor):null;return p?[{item,p}]:[];}):[],[geometry,items]);
 return <>{bound.map(({item,p})=><Html key={item.id} position={p.displayPosition} center occlude zIndexRange={[12,8]} style={{pointerEvents:'auto'}}><button type="button" className={'landmark-marker '+(selected===item.id?'selected':'')} style={{'--marker-color':landmarkCategories[item.category].color} as CSSProperties} aria-label={'Landmark '+item.name} aria-pressed={selected===item.id} data-landmark={item.id} onPointerEnter={()=>setHover(item.id)} onPointerLeave={()=>setHover(null)} onFocus={()=>setHover(item.id)} onBlur={()=>setHover(null)} onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();onSelect(item.id);}}><span/>{hover===item.id?<span className="landmark-tooltip">{item.name}</span>:null}</button></Html>)}</>;
}
