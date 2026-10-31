// Original local geometry review renders. Never reads reference-site resources.
import { chromium } from '@playwright/test';
import { mkdir,writeFile } from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage();await page.goto('http://127.0.0.1:5175/#workspace');
 const anchorData=JSON.parse(await (await import('node:fs/promises')).readFile('src/content/t7-anchors.json','utf8').catch(()=>'{}'));
 const result=await page.evaluate(async(anchorData)=>{
  const T=await import('/node_modules/three/build/three.module.js');
  const {GLTFLoader}=await import('/node_modules/three/examples/jsm/loaders/GLTFLoader.js');
  const bytes=await fetch('/models/bodyparts3d/skeletal-trunk-0.glb').then(r=>r.arrayBuffer());
  const gltf=await new GLTFLoader().parseAsync(bytes,'');let geometry;gltf.scene.traverse(o=>{if(o.name==='FMA9968')geometry=o.geometry;});
  geometry.computeBoundingBox();const box=geometry.boundingBox,center=box.getCenter(new T.Vector3());
  const renderer=new T.WebGLRenderer({antialias:true});renderer.setSize(720,720);renderer.setClearColor('#192128');
  const scene=new T.Scene();scene.add(new T.Mesh(geometry,new T.MeshStandardMaterial({color:'#e5dac1',roughness:.58,side:T.DoubleSide})));
  scene.add(new T.AmbientLight('#dce5ec',1.4));const light=new T.DirectionalLight('#ffffff',2.4);scene.add(light);
  const camera=new T.PerspectiveCamera(35,1,.001,100);const images=[];
  for(const [index,anchor] of Object.values(anchorData.anchors??{}).entries()){
   const canvas=document.createElement('canvas');canvas.width=64;canvas.height=64;const ctx=canvas.getContext('2d');ctx.fillStyle='#ffcc50';ctx.beginPath();ctx.arc(32,32,27,0,Math.PI*2);ctx.fill();ctx.fillStyle='#141414';ctx.font='bold 34px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(index+1),32,33);
   const sprite=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(canvas),depthTest:false}));sprite.position.fromArray(anchor.position);sprite.scale.setScalar(.012);sprite.renderOrder=100;scene.add(sprite);
  }
  for(const [name,dir] of [['anterior',[0,0,1]],['posterior',[0,0,-1]],['left',[1,0,0]],['right',[-1,0,0]],['superior',[0,1,.001]],['inferior',[0,-1,.001]],['oblique',[.8,1,1]],['posterior-oblique',[.8,.7,-1]]]){
   camera.position.copy(center).add(new T.Vector3(...dir).normalize().multiplyScalar(.53));camera.up.set(0,1,0);if(name==='superior'||name==='inferior')camera.up.set(0,0,-1);camera.lookAt(center);light.position.copy(camera.position);renderer.render(scene,camera);images.push({name,data:renderer.domElement.toDataURL('image/png')});
  }
  window.landmarkReview={T,geometry,renderer,scene,camera,center,light};
  return {images,vertices:Array.from(geometry.attributes.position.array),indices:Array.from(geometry.index.array),box:{min:box.min.toArray(),max:box.max.toArray()}};
 },anchorData);
 await mkdir('test-results/landmark-review',{recursive:true});
 for(const {name,data} of result.images)await writeFile(`test-results/landmark-review/t7-${name}.png`,Buffer.from(data.split(',')[1],'base64'));
 delete result.images;await writeFile('test-results/landmark-review/t7-geometry.json',JSON.stringify(result));
 process.stdout.write('Saved eight T7 review views and indexed geometry.\n');
}finally{await browser.close();}
