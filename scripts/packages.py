import zipfile, hashlib, json, collections, shutil
from pathlib import Path, PurePosixPath
ROOT=Path(r'C:\Users\User\Projects\AnatomyAtlas'); OUT=ROOT/'research'; BACK=ROOT/'reference-backup'
rows=[]; errors=[]; texts={}; extracted=[]
def sha(f):
 h=hashlib.sha256()
 while True:
  b=f.read(4*1024*1024)
  if not b:break
  h.update(b)
 return h.hexdigest()
def scan(path,label):
 with zipfile.ZipFile(path) as z:
  for ordinal,i in enumerate(z.infolist()):
   row={'container':label,'ordinal':ordinal,'path':i.filename,'bytes':i.file_size,'compressed_bytes':i.compress_size,'extension':PurePosixPath(i.filename).suffix.lower(),'directory':i.is_dir()}
   if not i.is_dir():
    try:
     if i.flag_bits & 1:raise ValueError('encrypted member: not accessed')
     with z.open(i) as f:row['sha256']=sha(f)
     name=PurePosixPath(i.filename)
     if name.name.lower().endswith(('.xml','.json','.config','.txt','.ini')) and i.file_size<2_000_000:
      texts[label+'!'+i.filename]=z.read(i).decode('utf-8-sig',errors='replace')
     # Only package and selected code/config materialization, no model recovery.
     if name.suffix.lower() in ('.msix','.appx') or (label.endswith('.msix') and (name.suffix.lower() in ('.exe','.dll') or name.name=='AppxManifest.xml')):
      if name.is_absolute() or '..' in name.parts or ':' in i.filename:raise ValueError('unsafe member path')
      target=OUT/'unpacked'/Path(label).name/Path(*name.parts)
      target.parent.mkdir(parents=True,exist_ok=True)
      if not target.exists():
       with z.open(i) as f,open(target,'xb') as o:shutil.copyfileobj(f,o)
      with open(target,'rb') as f:
       if sha(f)!=row['sha256']:raise ValueError('materialized member hash mismatch')
      extracted.append({'container':label,'member':i.filename,'path':str(target),'sha256':row['sha256']})
      if name.suffix.lower() in ('.msix','.appx'):scan(target,label+'!'+i.filename)
    except Exception as e:row['error']=str(e);errors.append({'container':label,'path':i.filename,'error':str(e)})
   rows.append(row)
for p in BACK.rglob('*'):
 if p.suffix.lower() in ('.msixbundle','.appx','.msix'):scan(p,str(p.relative_to(BACK)))
(OUT/'package-inventory.json').write_text(json.dumps({'members':rows,'errors':errors,'materialized':extracted},indent=2),encoding='utf8')
(OUT/'package-texts.json').write_text(json.dumps(texts,indent=2),encoding='utf8')
summary=collections.Counter(r['extension'] for r in rows if not r['directory'])
(OUT/'PACKAGE_SUMMARY.md').write_text('# Package inventory\n\nAll listed package entries were streamed for SHA-256 and ZIP CRC validation; nested MSIX package members are included. Model/media members were hashed without exporting their payloads. Selected PE artifacts and manifests were materialized solely for private read-only inspection.\n\n'+str(dict(summary))+'\n\nErrors: '+str(errors)+'\n\n'+'\n'.join(f'- `{r["container"]}!{r["path"]}` ({r["bytes"]:,} bytes)' for r in rows if r['extension'] in ('.exe','.dll','.db','.sqlite','.dat','.bin','.pak','.unity3d','.bundle','.json')) ,encoding='utf8')
print(json.dumps({'members':len(rows),'extensions':dict(summary),'errors':errors,'materialized':len(extracted)}))
