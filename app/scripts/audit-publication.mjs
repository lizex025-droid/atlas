import { execFileSync } from 'node:child_process';
import { readFile,stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(fileURLToPath(new URL('../../',import.meta.url)));const actual=execFileSync('git',['rev-parse','--show-toplevel'],{cwd:root,encoding:'utf8'}).trim();
if(path.resolve(actual)!==root)throw new Error('Refusing publication audit outside the isolated AnatomyAtlas repository');
const files=execFileSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean);const problems=[];let bytes=0,models=0;
const patterns=[/github_pat_[A-Za-z0-9_]{20,}/,/gh[pousr]_[A-Za-z0-9]{20,}/,/AKIA[A-Z0-9]{16}/,/sk-[A-Za-z0-9_-]{30,}/,/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/];
for(const file of files){
 if(/^(reference-backup|research|model-sources|tools)\//.test(file)||/(^|\/)(\.env(?:\..*)?|\.dev\.vars.*|node_modules|dist|\.wrangler)(\/|$)/.test(file)&&!file.endsWith('.env.example')||/(^|\/)test-results[^/]*\//.test(file)){problems.push({file,reason:'private/generated path'});continue;}
 const size=(await stat(path.join(root,file))).size;bytes+=size;if(size>100*1024*1024)problems.push({file,reason:'GitHub regular-file size limit'});
 if(file.endsWith('.glb'))models++;
 if(/\.(glb|webp|png|jpe?g|gif|ico|woff2?)$/i.test(file))continue;
 const text=await readFile(path.join(root,file),'utf8');if(patterns.some(p=>p.test(text)))problems.push({file,reason:'credential/private-key pattern; value suppressed'});
}
if(models!==42)problems.push({reason:'Expected all 42 model containers'});
console.log(JSON.stringify({root,files:files.length,bytes,models,problems},null,2));if(problems.length)process.exitCode=1;
