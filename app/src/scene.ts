import { anatomy, byId } from './anatomy';
import type { Vec3 } from './anatomy';
import { knownId, groups } from './registry';
import { validLandmarkView } from './landmarks';
import type { LandmarkView } from './landmarks';
export type CameraView = { position: Vec3; target: Vec3 };
export type Annotation = { id:string; structure:string; text:string };
export type SceneState = { hidden:string[]; opacity:Record<string,number>; selected:string|null; annotations:Annotation[]; camera:CameraView; selectedIds?:string[]; groupId?:string|null;landmarkView?:LandmarkView };
export type SavedScene = SceneState & { id:string; name:string; date:string };
export const defaultCamera:CameraView={position:[0,0,8.3],target:[0,0,0]};
export const initialState = ():SceneState=>({hidden:anatomy.filter(s=>s.system!=='Skeletal').map(s=>s.id),opacity:{},selected:null,annotations:[],camera:structuredClone(defaultCamera)});
export const isolate = (id:string):string[] => anatomy.filter(s=>s.id!==id).map(s=>s.id);
const finiteVec = (v:unknown):v is Vec3=> Array.isArray(v)&&v.length===3&&v.every(n=>typeof n==='number'&&Number.isFinite(n)&&Math.abs(n)<10000);
export function validateScene(v:unknown):v is SavedScene {
 if (!v||typeof v!=='object') return false;
 const s=v as SavedScene;
 if(s.landmarkView!==undefined&&(!validLandmarkView(s.landmarkView)||s.landmarkView.boneId!==s.selected))return false;
 if(typeof s.selected==='string'&&groups.has(s.selected)&&!byId.has(s.selected))return false;
 return typeof s.id==='string'&&typeof s.name==='string'&&s.name.length<=80&&typeof s.date==='string'&&Array.isArray(s.hidden)&&s.hidden.every(id=>typeof id==='string'&&byId.has(id))&&(s.selected===null||typeof s.selected==='string'&&knownId(s.selected))&&(s.groupId===undefined||s.groupId===null||typeof s.groupId==='string'&&knownId(s.groupId))&&(s.selectedIds===undefined||Array.isArray(s.selectedIds)&&s.selectedIds.every(id=>typeof id==='string'&&byId.has(id)))&&!!s.opacity&&typeof s.opacity==='object'&&Object.entries(s.opacity).every(([id,n])=>byId.has(id)&&typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=1)&&Array.isArray(s.annotations)&&s.annotations.length<=500&&s.annotations.every(a=>!!a&&typeof a.id==='string'&&byId.has(a.structure)&&typeof a.text==='string'&&a.text.length<=500)&&!!s.camera&&finiteVec(s.camera.position)&&finiteVec(s.camera.target);
}
export const STORAGE_KEY='anatomy-atlas.scenes.v2';
export function decodeScenes(raw:string|null):SavedScene[] { try { const v=JSON.parse(raw||'[]'); return Array.isArray(v)?v.filter(validateScene).slice(0,30):[]; } catch { return []; } }
