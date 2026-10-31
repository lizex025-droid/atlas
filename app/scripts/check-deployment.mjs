import { readFile,readdir,stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
const manifest=JSON.parse(await readFile('dist/deployment.json','utf8'));let files=0,maxBytes=0;
async function walk(dir){for(const item of await readdir(dir,{withFileTypes:true})){const file=path.join(dir,item.name);if(item.isDirectory())await walk(file);else{const {size}=await stat(file);if(size>25*1024*1024)throw new Error('Pages file limit exceeded: '+file);maxBytes=Math.max(maxBytes,size);files++;}}}
await walk('dist');if(files>20000)throw new Error('Pages file-count limit exceeded');
for(const asset of manifest.assets){const bytes=await readFile(path.join('dist',asset.path.slice(1)));if(bytes.length!==asset.bytes||createHash('sha256').update(bytes).digest('hex')!==asset.sha256)throw new Error('Public asset missing or changed during build: '+asset.path);}
if(manifest.models!==42)throw new Error('Expected all 42 current model containers');await readFile('dist/index.html');await readFile('dist/_headers');
console.log(JSON.stringify({status:'passed',files,publicAssets:manifest.assets.length,models:manifest.models,largestFileBytes:maxBytes,commit:manifest.commit},null,2));
