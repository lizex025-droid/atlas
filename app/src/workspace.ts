import { anatomy, byId } from './anatomy';
import type { Vec3 } from './anatomy';
import { defaultCamera, initialState } from './scene';
import type { SceneState, CameraView } from './scene';
import { members } from './registry';
export type WorkspaceState=SceneState&{selectedIds:string[];groupId:string|null};
export function workspaceInitial():WorkspaceState{return {...initialState(),selectedIds:[],groupId:null};}
export function frame(ids:string[],camera:CameraView):CameraView {
 const models=ids.flatMap(id=>byId.has(id)?[byId.get(id)!]:[]);if(!models.length)return camera;
 const min:Vec3=[Infinity,Infinity,Infinity],max:Vec3=[-Infinity,-Infinity,-Infinity];
 for(const model of models)for(let i=0;i<3;i++){min[i]=Math.min(min[i],model.position[i]-model.size[i]/2);max[i]=Math.max(max[i],model.position[i]+model.size[i]/2);}
 const target=min.map((v,i)=>(v+max[i])/2) as Vec3;const radius=Math.hypot(...max.map((v,i)=>(v-min[i])/2));
 const delta=camera.position.map((v,i)=>v-camera.target[i]);const length=Math.hypot(...delta)||1;const distance=Math.max(.2,radius/Math.sin(43*Math.PI/360)*1.15);
 return {target,position:target.map((v,i)=>v+delta[i]/length*distance) as Vec3};
}
export function selectStructure(s:WorkspaceState,id:string,multi=false,focus=false,camera=s.camera):WorkspaceState {
 if(id==='TA2:2549'&&byId.has('TA2:2549:L'))id='TA2:2549:L';
 const ids=members(id);const group=ids.length>1;
 const selectedIds=multi?[...new Set([...s.selectedIds,...ids])]:ids;
 return {...s,selected:group?null:id,groupId:group?id:null,selectedIds,hidden:s.hidden.filter(v=>!ids.includes(v)),camera:focus?frame(ids,camera):s.camera};
}
export function visibility(s:WorkspaceState,action:'isolate'|'hide'|'fade'|'hide-others'|'fade-others'|'reset',ids=s.selectedIds):WorkspaceState {
 if(action==='reset')return {...s,hidden:[],opacity:{}};
 const target=new Set(ids);if(!target.size)return s;
 if(action==='isolate'||action==='hide-others')return {...s,hidden:anatomy.filter(a=>!target.has(a.id)).map(a=>a.id)};
 if(action==='hide')return {...s,hidden:[...new Set([...s.hidden,...ids])],selected:null,groupId:null,selectedIds:[]};
 const opacity={...s.opacity};for(const a of anatomy)if(action==='fade'?target.has(a.id):!target.has(a.id))opacity[a.id]=.18;
 return {...s,opacity};
}
export function toggleMembers(s:WorkspaceState,ids:string[]):WorkspaceState {
 const on=ids.some(id=>!s.hidden.includes(id));const hidden=on?[...new Set([...s.hidden,...ids])]:s.hidden.filter(id=>!ids.includes(id));const selectedIds=s.selectedIds.filter(id=>!hidden.includes(id));
 return {...s,hidden,selectedIds,selected:s.selected&&hidden.includes(s.selected)?null:s.selected,groupId:selectedIds.length?s.groupId:null};
}
export const cameraPresets={Front:defaultCamera,Side:{position:[8.3,0,0],target:[0,0,0]},Back:{position:[0,0,-8.3],target:[0,0,0]}} satisfies Record<string,CameraView>;
