"""Acquire only official, pinned BodyParts3D sources; no proprietary references.
Run import_bodyparts.py afterwards (NumPy required). Cached sources are reused only after hash checks.
"""
from pathlib import Path
import urllib.request, hashlib, concurrent.futures, math
ROOT=Path(__file__).resolve().parents[1]/'model-sources/bodyparts3d-4.0'
ROOT.mkdir(parents=True,exist_ok=True)
BASE='https://dbarchive.biosciencedbc.jp/'
def sha(p):
 h=hashlib.sha256()
 with p.open('rb') as f:
  while b:=f.read(1024*1024):h.update(b)
 return h.hexdigest()
license_bytes=urllib.request.urlopen(BASE+'en/bodyparts3d/lic.html',timeout=60).read()
assert b'Attribution 4.0 International' in license_bytes, 'Archive license changed; review before downloading'
(ROOT/'license.html').write_bytes(license_bytes)
for name in ['partof_parts_list_e.txt','isa_parts_list_e.txt','partof_inclusion_relation_list.txt','isa_inclusion_relation_list.txt','partof_element_parts.txt']:
 if not (ROOT/name).exists():
  data=urllib.request.urlopen(BASE+'data/bodyparts3d/LATEST/'+name,timeout=120).read();(ROOT/name).write_bytes(data)
for name,total,digest in [
 ('partof_BP3D_4.0_obj_99.zip',64888505,'9fbc713fffeee924a5a657d9813d84d7eb957bded63adb854931dd5e3eb61c97'),
 ('isa_BP3D_4.0_obj_99.zip',142903898,'40665852c49f218326590e204db91064a1ecfc3c6f8cbd7bbbcaac62c7cd409e')]:
 target=ROOT/name
 if target.exists() and sha(target)==digest:print('Verified cached',name);continue
 step=math.ceil(total/8)
 def fetch_range(i):
  start=i*step;end=min(total-1,(i+1)*step-1)
  request=urllib.request.Request(BASE+'data/bodyparts3d/LATEST/'+name,headers={'Range':f'bytes={start}-{end}'})
  path=ROOT/(name+'.range-'+str(i))
  with urllib.request.urlopen(request,timeout=120) as response,path.open('wb') as output:
   assert response.status==206 and response.headers['Content-Range']==f'bytes {start}-{end}/{total}'
   while data:=response.read(1024*1024):output.write(data)
  assert path.stat().st_size==end-start+1
  return path
 with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:parts=list(pool.map(fetch_range,range(8)))
 temporary=ROOT/(name+'.partial')
 with temporary.open('wb') as output:
  for part in parts:
   with part.open('rb') as f:
    while data:=f.read(1024*1024):output.write(data)
 if sha(temporary)!=digest:raise ValueError('Source hash differs; re-review upstream release: '+name)
 temporary.replace(target)
 for part in parts:part.unlink()
 print('Verified download',name)
print('Acquisition complete. The importer checks embedded license notices before converting each candidate OBJ.')
