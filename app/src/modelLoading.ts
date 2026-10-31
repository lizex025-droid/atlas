import { useEffect, useRef, useState } from 'react';
import { BufferGeometry, Mesh, Material } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import chunks from './chunks.json';
import supplementalChunks from './supplementalChunks.json';
export type LoadProgress = { loaded:number; total:number; bytes:number; errors:string[] };
export const chunkById = new Map([...chunks,...supplementalChunks].map(c=>[c.id,c]));
const loader = new GLTFLoader();
export function useProgressiveGeometry(ids:string[],retry:number) {
 const cache=useRef(new Map<string,Map<string,BufferGeometry>>());
 const [,render]=useState(0);
 const [progress,setProgress]=useState<LoadProgress>({loaded:0,total:0,bytes:0,errors:[]});
 const key=[...new Set(ids)].sort().join('|');
 useEffect(()=>{
  const wanted=new Set(key.split('|').filter(Boolean));const controller=new AbortController();let cancelled=false;
  for(const [id,geometries] of cache.current)if(!wanted.has(id)){geometries.forEach(g=>g.dispose());cache.current.delete(id);}
  const queue=[...wanted].filter(id=>!cache.current.has(id));let next=0;const errors:string[]=[];
  const update=()=>{if(!cancelled)setProgress({loaded:[...wanted].filter(id=>cache.current.has(id)).length,total:wanted.size,bytes:[...cache.current.keys()].reduce((n,id)=>n+(chunkById.get(id)?.bytes??0),0),errors:[...errors]});};
  update();render(n=>n+1);
  async function worker(){
   while(!cancelled&&next<queue.length){const id=queue[next++];const chunk=chunkById.get(id);if(!chunk)continue;
    try{
     const response=await fetch(chunk.url,{signal:controller.signal});if(!response.ok)throw new Error('HTTP '+response.status);
     const bytes=await response.arrayBuffer();if(cancelled)return;
     const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(b=>b.toString(16).padStart(2,'0')).join('');
     if(digest!==chunk.sha256)throw new Error('Model checksum mismatch');if(cancelled)return;
     const gltf=await loader.parseAsync(bytes,'');const geometries=new Map<string,BufferGeometry>();
     gltf.scene.traverse(object=>{if(object instanceof Mesh){geometries.set(object.userData.canonicalId??object.name,object.geometry);const materials=Array.isArray(object.material)?object.material:[object.material];materials.forEach((m:Material)=>m.dispose());}});
     if(cancelled){geometries.forEach(g=>g.dispose());return;}
     if(!chunk.structures.every(id=>geometries.has(id))){geometries.forEach(g=>g.dispose());throw new Error('Missing mesh IDs');}
     cache.current.set(id,geometries);render(n=>n+1);update();
    }catch(error){if(!cancelled){errors.push(chunk.id+': '+String(error));update();}}
   }
  }
  void Promise.all(Array.from({length:Math.min(3,queue.length)},()=>worker()));
  return ()=>{cancelled=true;controller.abort();};
 },[key,retry]);
 useEffect(()=>()=>{cache.current.forEach(group=>group.forEach(g=>g.dispose()));cache.current.clear();},[]);
 return {cache:cache.current,progress};
}
