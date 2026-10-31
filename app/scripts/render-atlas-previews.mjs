// Render only the app's already licensed, local GLBs. No reference-site imagery.
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage();await page.goto('http://127.0.0.1:5175/');
 await page.evaluate(async()=>{
  const T=await import('/node_modules/.vite/deps/three.js');
  const {GLTFLoader}=await import('/node_modules/.vite/deps/three_examples_jsm_loaders_GLTFLoader__js.js');
  const {atlasCards,previewPresets}=await import('/src/atlasCatalog.ts');
  const {anatomy,byId}=await import('/src/anatomy.ts');
  const {default:base}=await import('/src/chunks.json');const {default:supplement}=await import('/src/supplementalChunks.json');
  const chunks=new Map([...base,...supplement].map(c=>[c.id,c]));const cache=new Map();const loader=new GLTFLoader();
  const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(640,640);renderer.setClearColor('#1b2328');renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
  window.atlasPreviewCards=[...previewPresets,...atlasCards].map(c=>({id:c.id,preview:c.preview,members:c.members}));
  window.renderAtlasCard=async index=>{
   const card=window.atlasPreviewCards[index];const ids=new Set(card.members);const needed=[...new Set(card.members.map(id=>byId.get(id).chunk))];
   for(const key of needed){if(cache.has(key))continue;const data=await fetch(chunks.get(key).url).then(r=>r.arrayBuffer());const gltf=await loader.parseAsync(data,'');const geometries=new Map();gltf.scene.traverse(obj=>{if(obj.isMesh){geometries.set(obj.userData.canonicalId??obj.name,obj.geometry);(Array.isArray(obj.material)?obj.material:[obj.material]).forEach(m=>m.dispose());}});cache.set(key,geometries);}
   const scene=new T.Scene();const box=new T.Box3();const materials=[];
   for(const s of anatomy){if(!ids.has(s.id))continue;const geometry=cache.get(s.chunk).get(s.id);const material=new T.MeshStandardMaterial({color:s.color,roughness:.58,side:T.DoubleSide});materials.push(material);const mesh=new T.Mesh(geometry,material);scene.add(mesh);box.expandByObject(mesh);}
   const center=box.getCenter(new T.Vector3()),size=box.getSize(new T.Vector3());const camera=new T.PerspectiveCamera(36,1,.001,100);const max=Math.max(size.x,size.y);const distance=Math.max(.05,max/2/Math.tan(Math.PI/10)*1.12+size.z*.6);
   camera.position.set(center.x+size.x*.12,center.y+size.y*.02,center.z+distance);camera.lookAt(center);camera.updateProjectionMatrix();scene.add(new T.AmbientLight('#dae4e9',1.4));
   for(const [color,intensity,pos] of [['#fff2de',2.5,[2,4,6]],['#b4d4df',1.5,[-4,1,2]],['#aec8cf',1,[-1,3,-4]]]){const light=new T.DirectionalLight(color,intensity);light.position.set(...pos).add(center);scene.add(light);}
   renderer.render(scene,camera);const result=renderer.domElement.toDataURL('image/webp',.88);materials.forEach(m=>m.dispose());return result;
  };
 });
 const cards=await page.evaluate(()=>window.atlasPreviewCards);const destination=new URL('../public/previews/',import.meta.url);await mkdir(destination,{recursive:true});const manifest=[];
 for(let i=0;i<cards.length;i++){const data=await page.evaluate(i=>window.renderAtlasCard(i),i);const bytes=Buffer.from(data.split(',')[1],'base64');const filename=cards[i].preview.split('/').pop();await writeFile(new URL(filename,destination),bytes);manifest.push({...cards[i],bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});process.stdout.write(`Rendered ${i+1}/${cards.length}: ${filename}\n`);}
 await writeFile(new URL('manifest.json',destination),JSON.stringify({generator:'Original AnatomyAtlas Three.js surface render',sourceManifests:['/models/bodyparts3d/manifest.json','/models/z-anatomy/manifest.json'],licenses:['CC BY-SA 2.1 Japan (BodyParts3D)','CC BY-SA 4.0 (Z-Anatomy palmar surfaces)'],previews:manifest},null,2));
 await writeFile(new URL('ATTRIBUTION.txt',destination),'AnatomyAtlas original preview renders of licensed anatomical meshes.\nBodyParts3D, The Database Center for Life Science, Japan, CC BY-SA 2.1 Japan.\nZ-Anatomy / Olivier Loranger and contributors, palmar surfaces only, CC BY-SA 4.0.\nSee /models/ATTRIBUTION.txt and each model source manifest for complete credits, modifications, links and source hashes.\nNo reference website screenshots or proprietary meshes are used.\n');
}finally{await browser.close();}
