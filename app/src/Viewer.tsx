import { Component, forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import { DoubleSide, Plane, Vector3,PerspectiveCamera } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { anatomy } from './anatomy';
import { useProgressiveGeometry } from './modelLoading';
import type { LoadProgress } from './modelLoading';
import type { SceneState, CameraView } from './scene';
import type { DisplaySettings } from './WorkspaceDrawer';
import { LandmarkMarkers } from './LandmarkMarkers';
import type { BoneLandmark } from './landmarks';
export type ViewerHandle={capture:()=>CameraView};
type Props={state:SceneState;cameraRequest:number;labels:boolean;onSelect:(id:string)=>void;onFocus:(id:string)=>void;onProgress:(p:LoadProgress)=>void;retry:number;selectedIds:string[];settings:DisplaySettings;section:number|null;explode:number;landmarkBone?:string|null;landmarks?:BoneLandmark[];selectedLandmark?:string|null;onLandmark?:(id:string)=>void};
const Scene = forwardRef<ViewerHandle,Props>(function Scene({state,cameraRequest,labels,onSelect,onFocus,onProgress,retry,selectedIds,settings,section,explode,landmarkBone,landmarks,selectedLandmark,onLandmark},ref){
 const controls=useRef<OrbitControlsImpl>(null);const {camera,invalidate,gl,size}=useThree();
 const animation=useRef<{position:Vector3;target:Vector3}|null>(null);
 const selection=useMemo(()=>new Set(selectedIds),[selectedIds]);
 const planes=useMemo(()=>section===null?[]:[new Plane(new Vector3(1,0,0),section)],[section]);
 useEffect(()=>{gl.localClippingEnabled=true;invalidate();},[gl,planes,invalidate]);
 useEffect(()=>{if(camera instanceof PerspectiveCamera){camera.zoom=landmarkBone?Math.min(1,size.width/size.height):1;if(landmarkBone)camera.setViewOffset(size.width,size.height,0,-size.height*.05,size.width,size.height);else camera.clearViewOffset();camera.updateProjectionMatrix();invalidate();}},[camera,landmarkBone,size.width,size.height,invalidate]);
 const hidden=useMemo(()=>new Set(state.hidden),[state.hidden]);
 const visible=useMemo(()=>anatomy.filter(s=>!hidden.has(s.id)&&(state.opacity[s.id]??1)>0),[hidden,state.opacity]);
 const {cache,progress}=useProgressiveGeometry(visible.map(s=>s.chunk),retry);
 useEffect(()=>{onProgress(progress);invalidate();},[progress,onProgress,invalidate]);
 useImperativeHandle(ref,()=>({capture:()=>({position:camera.position.toArray() as [number,number,number],target:(controls.current?.target.toArray()||[0,0,0]) as [number,number,number]})}),[camera]);
 useEffect(()=>{const target={position:new Vector3(...state.camera.position),target:new Vector3(...state.camera.target)};if(settings.reducedMotion){camera.position.copy(target.position);controls.current?.target.copy(target.target);controls.current?.update();animation.current=null;}else animation.current=target;invalidate();},[cameraRequest,camera,invalidate,state.camera,settings.reducedMotion]);
 useFrame((_,delta)=>{const a=animation.current;if(!a||!controls.current)return;const alpha=1-Math.exp(-Math.min(delta,.05)*10);camera.position.lerp(a.position,alpha);controls.current.target.lerp(a.target,alpha);controls.current.update();if(camera.position.distanceToSquared(a.position)<1e-8&&controls.current.target.distanceToSquared(a.target)<1e-8){camera.position.copy(a.position);controls.current.target.copy(a.target);animation.current=null;}invalidate();});
 return <><color attach="background" args={[landmarkBone?'#192026':'#10141b']}/><ambientLight intensity={1.15}/><directionalLight position={[4,6,7]} intensity={2.2}/><directionalLight position={[-4,2,-3]} intensity={1.2} color="#c1ccd7"/>
 {visible.map(s=>{const geometry=cache.get(s.chunk)?.get(s.id);if(!geometry)return null;const opacity=state.opacity[s.id]??1;const offset=explode?new Vector3(...s.position).normalize().multiplyScalar(explode*.7):undefined;const selected=selection.has(s.id);return <group key={s.id} position={offset}>
 <mesh geometry={geometry} dispose={null} onPointerOver={()=>{gl.domElement.style.cursor='pointer';}} onPointerOut={()=>{gl.domElement.style.cursor='grab';}} onDoubleClick={e=>{e.stopPropagation();onFocus(s.id);}} onClick={e=>{if(e.delta>5)return;e.stopPropagation();onSelect(s.id);}}>
 <meshStandardMaterial color={selected&&s.id!==landmarkBone?'#74dc92':s.color} emissive={selected?'#183d21':'#000000'} emissiveIntensity={.12} roughness={s.system==='Skeletal'?.55:.62} transparent={opacity<1} opacity={opacity} depthWrite={opacity>=.98} side={DoubleSide} clippingPlanes={planes}/></mesh>
 {s.id===landmarkBone&&landmarks?.length&&onLandmark?<LandmarkMarkers geometry={geometry} items={landmarks} selected={selectedLandmark??null} onSelect={onLandmark}/>:null}
 {(labels&&s.id===state.selected||state.annotations.some(a=>a.structure===s.id))?<Html position={s.position} center zIndexRange={[2,0]} style={{pointerEvents:'none'}}><span className="model-label">{s.name}{state.annotations.filter(a=>a.structure===s.id).map(a=><small key={a.id}>{a.text}</small>)}</span></Html>:null}</group>;})}
 <OrbitControls ref={controls} makeDefault minDistance={.05} maxDistance={18} target={[0,0,0]} enableDamping={!settings.reducedMotion} dampingFactor={.1} rotateSpeed={settings.rotationSpeed} onStart={()=>{animation.current=null;}}/>
 </>;
});
class ViewError extends Component<{children:ReactNode},{error:boolean}>{state={error:false};static getDerivedStateFromError(){return {error:true};}render(){return this.state.error?<div className="webgl-error">3D rendering is unavailable. Enable WebGL in your browser. Structure and scene controls remain available.</div>:this.props.children;}}
export const Viewer=forwardRef<ViewerHandle,Props>(function Viewer(props,ref){return <ViewError><Canvas camera={{position:[0,0,8.3],fov:43,near:.01,far:50}} dpr={props.settings.quality==='low'?1:props.settings.quality==='high'?[1,2]:[1,1.5]} frameloop="demand" aria-label="Interactive BodyParts3D anatomy model"><Scene {...props} ref={ref}/></Canvas></ViewError>;});
