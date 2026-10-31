import os, json, hashlib, shutil, zipfile, collections, datetime
from pathlib import Path
ROOT=Path(r'C:\Users\User\Projects\AnatomyAtlas')
SRC=Path(r'C:\Users\User\Downloads\CompleteAnatomy_Latest_Offline_x64')
ZIP=Path(str(SRC)+'.zip')
DST=ROOT/'reference-backup'
OUT=ROOT/'research'
OUT.mkdir(parents=True,exist_ok=True)
DST.mkdir(exist_ok=True)
errors=[]; files=[]; dirs=[]; comparisons=[]
def digest(stream):
 h=hashlib.sha256()
 while True:
  b=stream.read(4*1024*1024)
  if not b: break
  h.update(b)
 return h.hexdigest()
def hashfile(p):
 with open(p,'rb') as f:return digest(f)
def magic(p):
 with open(p,'rb') as f:b=f.read(32)
 if b[:2]==b'MZ':return 'PE/DOS candidate'
 if b[:2]==b'PK':return 'ZIP container'
 if b.startswith(b'SQLite format 3'):return 'SQLite'
 if b.startswith(b'UnityFS'):return 'UnityFS'
 return 'extension-classified; unparsed'
def err(e):errors.append({'stage':'enumerate','path':e.filename,'error':str(e)})
for base,children,names in os.walk(SRC,followlinks=False,onerror=err):
 for name in list(children):
  p=Path(base)/name; rel=p.relative_to(SRC)
  if p.is_symlink() or (p.stat().st_file_attributes & 0x400):
   children.remove(name);errors.append({'path':str(p),'stage':'enumerate','error':'reparse point skipped'});continue
  dirs.append(str(rel));(DST/rel).mkdir(parents=True,exist_ok=True)
 for name in names:
  p=Path(base)/name;rel=p.relative_to(SRC);row={'path':str(rel),'absolute_source':str(p),'extension':p.suffix.lower()}
  try:
   st=p.stat();row.update(bytes=st.st_size,mtime_ns=st.st_mtime_ns,ctime_ns=st.st_ctime_ns,attributes=st.st_file_attributes)
   if st.st_file_attributes & 0x400:raise ValueError('reparse point skipped')
   row['sha256']=hashfile(p);row['format']=magic(p)
   target=DST/rel
   if target.exists():
    if hashfile(target)!=row['sha256']:raise ValueError('existing destination differs; not overwritten')
   else:shutil.copy2(p,target)
   row['copy_sha256']=hashfile(target);row['copy_verified']=row['sha256']==row['copy_sha256']
   row['source_recheck_sha256']=hashfile(p)
   row['source_stable']=row['source_recheck_sha256']==row['sha256']
  except Exception as e:row['error']=str(e);errors.append({'path':str(p),'stage':'hash/copy','error':str(e)})
  files.append(row)
for rel in reversed(dirs):
 try:shutil.copystat(SRC/rel,DST/rel)
 except Exception as e:errors.append({'path':rel,'stage':'directory-metadata','error':str(e)})
index={r['path'].replace('\\','/'):r for r in files}
with zipfile.ZipFile(ZIP) as z:
 for i,info in enumerate(z.infolist()):
  row={'ordinal':i,'path':info.filename,'bytes':info.file_size,'compressed_bytes':info.compress_size,'crc32':f'{info.CRC:08x}','directory':info.is_dir()}
  if not info.is_dir():
   try:
    with z.open(info) as f:row['sha256']=digest(f)
    key=info.filename
    if key.startswith(SRC.name+'/'):key=key[len(SRC.name)+1:]
    source=index.get(key)
    row['source_relative_path']=key;row['matches_extracted']=bool(source and source.get('sha256')==row['sha256'])
   except Exception as e:row['error']=str(e);errors.append({'path':info.filename,'stage':'zip','error':str(e)})
  comparisons.append(row)
data={'created_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'source':str(SRC),'zip':str(ZIP),'zip_bytes':ZIP.stat().st_size,'zip_sha256':hashfile(ZIP),'directories':dirs,'files':files,'zip_entries':comparisons,'errors':errors,'extracted_not_in_zip':sorted(set(index)-{r.get('source_relative_path') for r in comparisons})}
(OUT/'inventory.json').write_text(json.dumps(data,indent=2),encoding='utf8')
ext=collections.Counter(r['extension'] for r in files)
lines=['# File inventory','',f'Source: `{SRC}`',f'Archive: `{ZIP}`','',f'{len(files)} files; {len(dirs)} subdirectories; {sum(r.get("bytes",0) for r in files):,} bytes.',f'ZIP SHA-256: `{data["zip_sha256"]}`','',f'Extensions: {dict(ext)}','', 'Full machine-readable paths, timestamps, attributes, archive entries, SHA-256 values and errors: [research/inventory.json](research/inventory.json).','', '| Path | Bytes | Format | SHA-256 |','|---|---:|---|---|']
for r in files:lines.append(f'| {r["path"]} | {r.get("bytes","?")} | {r.get("format","unreadable")} | {r.get("sha256","unavailable")} |')
lines+=['','## ZIP comparison',f'{sum(r.get("matches_extracted",False) for r in comparisons)} matching file entries out of {sum(not r["directory"] for r in comparisons)}.',f'Extracted-only files: {data["extracted_not_in_zip"]}',f'Errors: {errors}','', 'Container members are inventoried separately during read-only package analysis. Extension or magic classification alone does not establish semantics.']
(ROOT/'FILE_INVENTORY.md').write_text('\n'.join(lines),encoding='utf8')
(ROOT/'COPY_REPORT.md').write_text('\n'.join(['# Private copy report','',f'Destination: `{DST}`',f'{sum(r.get("copy_verified",False) for r in files)}/{len(files)} files SHA-256 verified; {sum(r.get("source_stable",False) for r in files)}/{len(files)} source hashes stable after copy.',f'Errors: {errors}','', 'Source files were read, never executed or intentionally modified. No permission changes, moves, renames or deletions. shutil.copy2 preserves ordinary timestamps and attributes where supported; ACLs, NTFS alternate streams, creation timestamps and full forensic metadata preservation are not guaranteed. Reading may affect OS-managed access times. Directory structure including empty accessible directories retained. Source reparse points are recorded and skipped.', '', 'The original ZIP remains at the supplied Downloads path; its digest and per-member comparison are in research/inventory.json. It was not redundantly copied.', '', 'reference-backup and research are private; never publish them or include them in the app. The original installer package remains packaged; selective read-only extraction for analysis belongs in research, not app.']),encoding='utf8')
print(json.dumps({'files':len(files),'bytes':sum(r.get('bytes',0) for r in files),'verified':sum(r.get('copy_verified',False) for r in files),'zip_matches':sum(r.get('matches_extracted',False) for r in comparisons),'errors':errors}))
