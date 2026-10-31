"""Package only the two identified Z-Anatomy palmar-aponeurosis meshes.
Source object extraction uses official Blender with --disable-autoexec; no template scripts run.
"""
from pathlib import Path
import json,struct,hashlib,urllib.request
import numpy as np
R=Path(__file__).resolve().parents[1];S=R/'model-sources/z-anatomy';O=R/'app/public/models/z-anatomy';O.mkdir(parents=True,exist_ok=True)
assert 'Attribution-ShareAlike 4.0' in (S/'License.txt').read_text(encoding='utf8',errors='replace')
raw=json.loads((S/'selected-geometry.json').read_text());lookup={m['name']:m for m in raw}
catalog=json.loads((R/'app/src/catalog.json').read_text());bp={m['id']:m for m in catalog}
anchors=[('Femur.l','FMA24475'),('Femur.r','FMA24474'),('Frontal bone','FMA52734'),('Vertebra T11','FMA10059')]
x=np.array([(np.array(lookup[name]['vertices']).min(0)+np.array(lookup[name]['vertices']).max(0))/2 for name,_ in anchors]);y=np.array([bp[fid]['position'] for _,fid in anchors])
# Similarity registration only, no anatomical deformation. Record residuals for review.
xm=x.mean(0);ym=y.mean(0);a=x-xm;b=y-ym;u,s,vt=np.linalg.svd(a.T@b);rot=u@vt
if np.linalg.det(rot)<0:u[:,-1]*=-1;rot=u@vt
scale=float(np.sum((a@rot)*b)/np.sum(a*a));translation=ym-xm@rot*scale
residual=np.linalg.norm(x@rot*scale+translation-y,axis=1)
print('registration residual world units',residual.tolist())
blob=bytearray();views=[];access=[];nodes=[];meshes=[];models=[];records=[]
def acc(array,component,kind,limits=False,target=34962):
 blob.extend(b'\0'*((-len(blob))%4));offset=len(blob);data=array.tobytes();blob.extend(data);views.append({'buffer':0,'byteOffset':offset,'byteLength':len(data),'target':target});a={'bufferView':len(views)-1,'componentType':component,'type':kind,'count':len(array)}
 if limits:a.update(min=array.min(0).tolist(),max=array.max(0).tolist())
 access.append(a);return len(access)-1
for side in ['l','r']:
 name='Palmar aponeurosis.'+side;src=lookup[name];fid='TA2:2549:'+side.upper();v=np.asarray(np.array(src['vertices'])@rot*scale+translation,dtype='<f4');faces=np.array(src['faces'],dtype='<u4');n=np.zeros_like(v);cross=np.cross(v[faces[:,1]]-v[faces[:,0]],v[faces[:,2]]-v[faces[:,0]])
 for j in range(3):np.add.at(n,faces[:,j],cross)
 n/=np.maximum(np.linalg.norm(n,axis=1,keepdims=True),1e-12)
 pi=acc(v,5126,'VEC3',True);ni=acc(n,5126,'VEC3');ii=acc(faces.flatten(),5125,'SCALAR',target=34963);nodes.append({'name':fid,'mesh':len(meshes),'extras':{'canonicalId':fid}});meshes.append({'name':fid,'primitives':[{'attributes':{'POSITION':pi,'NORMAL':ni},'indices':ii}]})
 position=((v.min(0)+v.max(0))/2).tolist();size=(v.max(0)-v.min(0)).tolist();models.append({'id':fid,'name':('Left' if side=='l' else 'Right')+' palmar aponeurosis','system':'Connective Tissue','region':'Hand','color':'#d1cec5','position':position,'size':size,'chunk':'z-palmar','parents':[{'id':'group:upper-fascia','name':'Upper-limb fasciae'},{'id':'group:fascia','name':'Fasciae'}],'description':'Source mesh: Z-Anatomy / Palmar aponeurosis. Similarity-registered to this atlas; anatomical alignment review pending.','shapes':[]})
 records.append({'id':fid,'sourceObject':name,'sourceObjectGeometrySha256':hashlib.sha256(json.dumps(src,sort_keys=True).encode()).hexdigest(),'license':'CC-BY-SA-4.0','licenseEvidence':'Repository License.txt and Readme.md; selected object is palmar fascia, not the separately credited noncommercial kidney or inner-ear assets.','creator':'Z-Anatomy / Gauthier Kervyn; BodyParts3D / DBCLS credited upstream','vertices':len(v),'triangles':len(faces),'changes':'Only selected object raw surfaces; smooth normals; rigid similarity registration using four atlas mesh centers; indexed GLB, no textures, material code, definitions or template code reused.'})
gltf={'asset':{'version':'2.0','generator':'AnatomyAtlas licensed supplement','copyright':'Z-Anatomy / Gauthier Kervyn, CC BY-SA 4.0; BodyParts3D / DBCLS credited upstream'},'scene':0,'scenes':[{'nodes':[0,1]}],'nodes':nodes,'meshes':meshes,'buffers':[{'byteLength':len(blob)}],'bufferViews':views,'accessors':access}
js=json.dumps(gltf,separators=(',',':')).encode();js+=b' '*((-len(js))%4);blob.extend(b'\0'*((-len(blob))%4));data=struct.pack('<III',0x46546c67,2,28+len(js)+len(blob))+struct.pack('<II',len(js),0x4e4f534a)+js+struct.pack('<II',len(blob),0x004e4942)+blob
(O/'palmar.glb').write_bytes(data);chunks=[{'id':'z-palmar','url':'/models/z-anatomy/palmar.glb','system':'Connective Tissue','region':'Hand','bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'structures':[m['id'] for m in models]}]
(R/'app/src/supplemental.json').write_text(json.dumps(models,indent=2));(R/'app/src/supplementalChunks.json').write_text(json.dumps(chunks,indent=2))
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
manifest={'dataset':'Z-Anatomy selected palmar fascia supplement','sourceUrl':'https://github.com/Z-Anatomy/Models-of-human-anatomy','archiveSha256':sha(S/'Z-Anatomy.zip'),'blendSha256':sha(S/'Startup.blend'),'license':'CC-BY-SA-4.0','licenseUrl':'https://creativecommons.org/licenses/by-sa/4.0/','licenseSha256':sha(S/'License.txt'),'models':records,'chunks':chunks,'registration':{'anchorMeshIds':[fid for _,fid in anchors],'scale':scale,'rotation':rot.tolist(),'translation':translation.tolist(),'residualWorldUnits':residual.tolist(),'status':'Approximate similarity registration; independent anatomical alignment review pending'},'lastReviewedAt':'2026-10-31'}
(O/'manifest.json').write_text(json.dumps(manifest,indent=2));(O/'SOURCE_LICENSE.txt').write_bytes((S/'License.txt').read_bytes())
(O/'ATTRIBUTION.txt').write_text('Z-Anatomy - The libre 3D atlas of anatomy - CC BY-SA 4.0\nGauthier Kervyn (design, 3D, anatomy); BodyParts3D - The Database Center for Life Science - CC BY-SA 2.1 Japan credited upstream.\nhttps://github.com/Z-Anatomy/Models-of-human-anatomy\nhttps://creativecommons.org/licenses/by-sa/4.0/\nOnly Palmar aponeurosis.l/.r surfaces converted. No kidney, inner-ear, definitions, templates, materials or scripts redistributed. Changes: rigid similarity registration, normals, indexed GLB. Alignment and clinical review pending. Converted meshes and contributions remain CC BY-SA 4.0.\n',encoding='utf8')
print('Packed',len(models),'meshes',len(data),'bytes')
