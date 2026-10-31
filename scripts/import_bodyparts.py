"""Convert the directly licensed BodyParts3D 4.0 archive to indexed GLB chunks.
No application-reference files are read. Requires numpy, downloaded official metadata/archive.
"""
import csv, json, hashlib, zipfile, struct, re, collections, datetime
from pathlib import Path
import numpy as np
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'model-sources/bodyparts3d-4.0'
OUT=ROOT/'app/public/models/bodyparts3d'
OUT.mkdir(parents=True,exist_ok=True)
BASE='https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST/'
LICENSE='https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html'
ATTRIBUTION='BodyParts3D, (c) The Database Center for Life Science licensed under CC Attribution-Share Alike 2.1 Japan'
assert 'Attribution 4.0 International' in (SOURCE/'license.html').read_text(encoding='utf8')
def sha(data):return hashlib.sha256(data).hexdigest()
def table(name):return list(csv.reader((SOURCE/name).open(encoding='utf-8-sig'),delimiter='\t'))[1:]
names={r[0]:r[2] for r in table('isa_parts_list_e.txt')}
names.update({r[0]:r[2] for r in table('partof_parts_list_e.txt')})
parents={}; isa=collections.defaultdict(list)
for p,pn,c,cn in table('partof_inclusion_relation_list.txt'):parents[c]=p;names[p]=pn;names[c]=cn
for p,pn,c,cn in table('isa_inclusion_relation_list.txt'):isa[p].append(c)
for p,pn,c,cn in table('isa_inclusion_relation_list.txt'):
 if c not in parents:parents[c]=p
def descendants(root,graph):
 found=set();todo=[root]
 while todo:
  x=todo.pop()
  if x in found:continue
  found.add(x);todo.extend(graph.get(x,[]))
 return found
bones=descendants('FMA5018',isa);muscles=descendants('FMA5022',isa)
def chain(fid):
 path=[];seen=set()
 while fid in parents and fid not in seen:
  seen.add(fid);fid=parents[fid];path.append({'id':fid,'name':names.get(fid,fid)})
 return path
def system(fid,name):
 if fid in bones:return 'Skeletal'
 if fid in muscles:return 'Muscular'
 ancestors=' '.join(p['name'] for p in chain(fid)).lower()
 if any(x in name+' '+ancestors for x in ['artery','vein','aorta','cardiac chamber','heart']):return 'Cardiovascular'
 if 'muscle' in ancestors or any(x in name for x in ['pectoralis','deltoid','biceps','triceps','gluteus','gastrocnemius']):return 'Muscular'
 if any(x in name for x in ['costal cartilage','manubrium','sternum','xiphoid']):return 'Skeletal'
 if 'skeletal system' in ancestors or 'skeleton' in ancestors:return 'Skeletal'
 for needle,value in [('respiratory','Respiratory'),('nervous','Nervous'),('digestive','Digestive'),('cardiovascular','Cardiovascular'),('urinary','Urinary'),('reproductive','Reproductive')]:
  if needle in ancestors:return value
 if any(x in name for x in ['artery','vein','aorta','atrium','ventricle','cardiac','heart']):return 'Cardiovascular'
 if any(x in name for x in ['nerve','brain','cereb','spinal cord']):return 'Nervous'
 if any(x in name for x in ['lung','bronch','trachea']):return 'Respiratory'
 if any(x in name for x in ['liver','stomach','intestine','colon','esophagus','pancreas','gallbladder']):return 'Digestive'
 return 'Other'
def readobj(data):
 vertices=[];faces=[]
 for line in data.decode('utf8').splitlines():
  if line.startswith('v '):vertices.append([float(v) for v in line.split()[1:4]])
  elif line.startswith('f '):
   vs=[int(v.split('/')[0]) for v in line.split()[1:]]
   vs=[v-1 if v>0 else len(vertices)+v for v in vs]
   for i in range(1,len(vs)-1):faces.append([vs[0],vs[i],vs[i+1]])
 v=np.asarray(vertices,dtype=np.float32);f=np.asarray(faces,dtype=np.uint32)
 if not len(v) or not len(f) or not np.isfinite(v).all() or f.max()>=len(v):raise ValueError('Invalid OBJ')
 return v,f
archive=SOURCE/'partof_BP3D_4.0_obj_99.zip'
archive_hash=sha(archive.read_bytes()); meshes=[]; rejected=[]
archives=[archive]
additional=SOURCE/'isa_BP3D_4.0_obj_99.zip'
if additional.exists():archives.append(additional)
known_members=set()
for source_archive in archives:
 with zipfile.ZipFile(source_archive) as z:
  for name in z.namelist():
   if not name.lower().endswith('.obj'):continue
   member_id=Path(name).stem
   if member_id in known_members:continue
   data=z.read(name);header=data[:3000].decode('utf8')
   assert 'Creative Commons Attribution-Share Alike 2.1 Japan' in header, 'Unverified license: '+name
   match=re.search(r'# Concept ID : (FMA\d+)',header)
   if not match:rejected.append({'member':name,'reason':'no verified FMA mapping'});continue
   fid=match.group(1)
   if fid not in names:rejected.append({'member':name,'reason':'no verified terminology mapping'});continue
   sys=system(fid,names[fid])
   if source_archive==additional and sys not in ('Skeletal','Muscular'):continue
   v,f=readobj(data);known_members.add(member_id)
   meshes.append({'id':fid,'name':names[fid],'sources':[{'sourceArchive':source_archive.name,'sourceMember':name,'sourceSha256':sha(data),'triangles':len(f),'vertices':len(v)}],'v':v,'f':f,'system':sys})
by_fma=collections.defaultdict(list)
for m in meshes:by_fma[m['id']].append(m)
meshes=[]
for fid,parts in by_fma.items():
 m=parts[0];verts=[];faces=[];sources=[];offset=0
 for part in parts:
  verts.append(part['v']);faces.append(part['f']+offset);offset+=len(part['v']);sources.extend(part['sources'])
 m['v']=np.concatenate(verts);m['f']=np.concatenate(faces);m['sources']=sources;meshes.append(m)
if not meshes:raise ValueError('No matched meshes; inspect archive naming')
allmin=np.min([m['v'].min(axis=0) for m in meshes],axis=0);allmax=np.max([m['v'].max(axis=0) for m in meshes],axis=0)
# Source coordinates: Z superior, Y posterior; preserve shape with rigid axis rotation and uniform scale.
center=(allmin+allmax)/2;scale=5.6/float(allmax[2]-allmin[2])
def region(c):
 if c[1]>1.9:return 'Head & neck'
 if c[1]<-.35:return 'Lower limbs & pelvis'
 if abs(c[0])>.62:return 'Upper limbs'
 return 'Trunk'
palette={'Skeletal':'#e5dac1','Muscular':'#b85f59','Nervous':'#ddbc68','Respiratory':'#8baebc','Digestive':'#bf9466','Cardiovascular':'#c95768','Urinary':'#b78479','Reproductive':'#b590b4','Other':'#a3b9b2'}
for m in meshes:
 v=(m['v']-center)*scale;m['v']=np.ascontiguousarray(v[:,[0,2,1]]*np.array([1,1,-1],dtype=np.float32),dtype='<f4')
 # Axis transform determinant +1, so source triangle winding is retained.
 m['position']=np.round((m['v'].min(0)+m['v'].max(0))/2,6).tolist();m['region']=region(m['position'])
groups=collections.defaultdict(list)
for m in meshes:groups[(m['system'],m['region'])].append(m)
catalog=[];chunks=[];provenance=[]
for (sys,reg),items in sorted(groups.items()):
 for start in range(0,len(items),40):
  batch=items[start:start+40];slug=re.sub('[^a-z0-9]+','-',sys.lower()+'-'+reg.lower())+'-'+str(start//40)
  blob=bytearray();views=[];accessors=[];nodes=[];gmeshes=[]
  def accessor(arr,component,typ,limits=False,target=34962):
   while len(blob)%4:blob.append(0)
   offset=len(blob);b=arr.tobytes();blob.extend(b);views.append({'buffer':0,'byteOffset':offset,'byteLength':len(b),'target':target})
   a={'bufferView':len(views)-1,'componentType':component,'count':len(arr),'type':typ}
   if limits:a.update(min=arr.min(0).tolist(),max=arr.max(0).tolist())
   accessors.append(a);return len(accessors)-1
  for m in batch:
   v,f=m['v'],m['f'];normal=np.zeros_like(v);a=np.cross(v[f[:,1]]-v[f[:,0]],v[f[:,2]]-v[f[:,0]])
   for j in range(3):np.add.at(normal,f[:,j],a)
   normal/=np.maximum(np.linalg.norm(normal,axis=1,keepdims=True),1e-12)
   p=accessor(v,5126,'VEC3',True);n=accessor(normal.astype('<f4'),5126,'VEC3');idx=accessor(f.flatten().astype('<u4'),5125,'SCALAR',target=34963)
   nodes.append({'name':m['id'],'mesh':len(gmeshes),'extras':{'fmaId':m['id']}});gmeshes.append({'name':m['id'],'primitives':[{'attributes':{'POSITION':p,'NORMAL':n},'indices':idx}]})
   size=(v.max(0)-v.min(0)).tolist()
   catalog.append({'id':m['id'],'name':m['name'][0].upper()+m['name'][1:],'system':sys,'region':reg,'color':palette[sys],'position':m['position'],'size':size,'chunk':slug,'parents':chain(m['id']),'description':'BodyParts3D 4.0 anatomical surface. '+m['id']+' • '+m['name']+'. Source geometry is polygon-reduced; not independently clinically validated.','shapes':[]})
   for source in m['sources']:
    provenance.append({'id':m['id'],'name':m['name'],'sourceUrl':BASE+source['sourceArchive'],**source,'license':'CC-BY-SA-2.1-JP','licenseEvidence':'Embedded OBJ license header verified before conversion; current archive license page separately retained','author':'The Database Center for Life Science','output':slug+'.glb','changes':'99% reduced upstream OBJ; constituent meshes grouped by FMA ID; rigid axis transform, uniform scale, smooth normals, indexed GLB conversion; no additional simplification'})
  gltf={'asset':{'version':'2.0','generator':'AnatomyAtlas BodyParts3D importer','copyright':ATTRIBUTION},'scene':0,'scenes':[{'nodes':list(range(len(nodes)))}],'nodes':nodes,'meshes':gmeshes,'buffers':[{'byteLength':len(blob)}],'bufferViews':views,'accessors':accessors}
  js=json.dumps(gltf,separators=(',',':')).encode();js+=b' '*((-len(js))%4);blob.extend(b'\x00'*((-len(blob))%4))
  out=struct.pack('<III',0x46546c67,2,12+8+len(js)+8+len(blob))+struct.pack('<II',len(js),0x4e4f534a)+js+struct.pack('<II',len(blob),0x004e4942)+blob
  (OUT/(slug+'.glb')).write_bytes(out);chunks.append({'id':slug,'url':'/models/bodyparts3d/'+slug+'.glb','system':sys,'region':reg,'bytes':len(out),'sha256':sha(out),'structures':[m['id'] for m in batch]})
catalog.sort(key=lambda m:(list(palette).index(m['system']),m['region'],m['name']))
(ROOT/'app/src/catalog.json').write_text(json.dumps(catalog,separators=(',',':')),encoding='utf8')
(ROOT/'app/src/chunks.json').write_text(json.dumps(chunks,indent=2),encoding='utf8')
manifest={'dataset':'BodyParts3D 4.0 PART-OF plus skeletal/muscular IS-A, 99% polygon reduction','license':'CC-BY-SA-2.1-JP','licenseUrl':'https://creativecommons.org/licenses/by-sa/2.1/jp/','licenseEvidence':'Each embedded OBJ header; archive page currently offers CC BY 4.0. This conversion retains the embedded vintage share-alike license.','licenseVerifiedUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'licenseEvidenceSha256':sha((SOURCE/'license.html').read_bytes()),'attribution':ATTRIBUTION,'archives':[{'url':BASE+p.name,'sha256':sha(p.read_bytes())} for p in archives],'transform':{'sourceCenter':center.tolist(),'uniformScale':scale,'axes':'x,z,-y'},'models':provenance,'chunks':chunks,'rejected':rejected}
(OUT/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf8')
used={c['id']+'.glb' for c in chunks}
for stale in OUT.glob('*.glb'):
 if stale.name not in used:stale.unlink()
(OUT/'license-source.html').write_bytes((SOURCE/'license.html').read_bytes())
(OUT/'ATTRIBUTION.txt').write_text(ATTRIBUTION+'\nhttps://creativecommons.org/licenses/by-sa/2.1/jp/\n'+LICENSE+'\nConverted meshes and contributions are distributed under CC BY-SA 2.1 Japan. Changes: indexed GLB conversion, rigid coordinate transform, uniform scale and generated smooth normals. Upstream release is 99% polygon-reduced. No endorsement or clinical validation claimed.\n',encoding='utf8')
(SOURCE/'import-summary.json').write_text(json.dumps({'structures':len(catalog),'chunks':len(chunks),'bytes':sum(c['bytes'] for c in chunks),'systems':dict(collections.Counter(m['system'] for m in catalog)),'triangles':sum(x['triangles'] for x in provenance),'sourceBounds':[allmin.tolist(),allmax.tolist()],'rejected':rejected},indent=2),encoding='utf8')
print((SOURCE/'import-summary.json').read_text())
