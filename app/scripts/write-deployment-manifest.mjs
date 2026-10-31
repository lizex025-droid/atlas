import { readdir,readFile,writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
const root=path.resolve('public');const assets=[];
async function walk(directory){for(const item of await readdir(directory,{withFileTypes:true})){const file=path.join(directory,item.name);if(item.isSymbolicLink())throw new Error('Public assets may not contain symbolic links');if(item.isDirectory())await walk(file);else if(item.name!=='deployment.json'){const bytes=await readFile(file);assets.push({path:'/'+path.relative(root,file).split(path.sep).join('/'),bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});}}}
await walk(root);assets.sort((a,b)=>a.path.localeCompare(b.path));let commit=process.env.CF_PAGES_COMMIT_SHA??null;
if(!commit)try{commit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();}catch{}
if(commit&&!/^[a-f0-9]{40}$/.test(commit))throw new Error('Invalid build commit identity');
const manifest={schemaVersion:1,application:'AnatomyAtlas',repository:'lizex025-droid/atlas',commit,builtAt:new Date().toISOString(),assets,models:assets.filter(a=>a.path.endsWith('.glb')).length,images:assets.filter(a=>/\.(webp|png|jpe?g|svg)$/.test(a.path)).length,texturePolicy:'The current GLBs use original assigned materials; no separate texture payloads are declared. All existing public assets are retained.'};
await writeFile(path.join(root,'deployment.json'),JSON.stringify(manifest,null,2)+'\n');console.log(`Deployment manifest: ${assets.length} assets, ${manifest.models} models, commit ${commit??'not-yet-committed'}`);
