import re,json,hashlib,collections,zipfile,plistlib
from pathlib import Path
ROOT=Path(r'C:\Users\User\Projects\AnatomyAtlas')
research=ROOT/'research'
package=json.loads((research/'package-inventory.json').read_text(encoding='utf8'))
texts=json.loads((research/'package-texts.json').read_text(encoding='utf8'))
core=next(p for p in (research/'unpacked').iterdir() if p.name.endswith('x64_ReleaseProduction.msix'))
topics={'UI':r'Xaml|IWebView|IButton|IView|ViewController|UIView|UIButton|UILabel','camera':r'camera|orbit|rotation|zoom|panGesture','visibility':r'opacity|transparen|isolate|visibility|layer','search':r'anatom|search|hierarch','annotations':r'annotat|label|pinTool|drawing','animation':r'animat|muscleMotion|timeline|keyframe','scene':r'scene|bookmark|screenManager','storage':r'sqlite|database|NSUserDefaults|NSKeyedArchiver','network':r'https?://[^\s]+|libcurl|NSURLRequest'}
lines=['# Bounded static findings','','Private read-only inspection of copied package artifacts. No application, installer or library was executed. ASCII strings below are observed byte sequences, not proof of reachable behavior. No protected data was decrypted. PE imports and architecture are independently recorded in the REA evidence bundle.','','## Native string evidence','']
for f in [core/'CompleteAnatomy.exe',core/'CompleteAnatomyLib.dll']:
 data=f.read_bytes()
 strings=[(m.start(),m.group().decode('ascii')) for m in re.finditer(rb'[\x20-\x7e]{5,}',data)]
 lines += [f'### {f.name}', '',f'SHA-256 `{hashlib.sha256(data).hexdigest()}`; {len(data):,} bytes; scanned {len(strings):,} ASCII runs of at least five characters. UTF-16 and compressed strings were not exhaustively decoded.','']
 for topic,pattern in topics.items():
  matches=[(offset,s) for offset,s in strings if re.search(pattern,s,re.I) and len(s)<350 and not re.search(r'password|token=|secret=|licensekey',s,re.I)]
  lines += [f'**{topic}** — {len(matches)} matching ASCII runs; bounded sample:', '']
  seen=set()
  for offset,s in matches:
   if s in seen:continue
   seen.add(s)
   if len(seen)>8:break
   s=s.replace('`','').replace('|','\\|')
   if topic=='network' and 'http' in s:
    s=re.sub(r'(https?://[^/\s?]+)[^\s]*',r'\1/[path omitted]',s)
   lines.append(f'- File offset `0x{offset:x}`: `{s}`')
  lines.append('')
members=package['members']
main=[r for r in members if 'x64_ReleaseProduction.msix' in r['container']]
lines += ['## Package resource organization','',f'Package inventory covers {len(members):,} member records, including {len(main):,} main-package entries; errors: {package["errors"]}.','', 'Extension counts in main package: '+str(dict(collections.Counter(r['extension'] for r in main))), '']
for group,pattern in {'Model/container candidates':r'\.3d|\.dat$|\.bin$|\.pak$|\.db$|\.sqlite|model|anatom','UI/graphics resources':r'\.xaml$|\.cso$|shader|\.metallib$|\.hlsl$|\.json$','Storage schema candidates':r'\.sql$|\.sqlite|\.db$','Online/config candidates':r'config|endpoint|server|\.plist$'}.items():
 matches=[r for r in main if re.search(pattern,r['path'],re.I)]
 lines += [f'### {group}', '',f'{len(matches)} matching names; paths alone do not identify semantics. Bounded sample:', '']
 for r in matches[:25]:lines.append(f'- `{r["path"]}` — {r["bytes"]:,} bytes')
 lines.append('')
lines+=['## Manifest declarations','']
for key,value in texts.items():
 if key.endswith('x64_ReleaseProduction.msix!AppxManifest.xml'):
  lines+=['Observed from main AppxManifest.xml (declarations, not runtime observations):','']
  for item in re.findall(r'<(?:Identity|TargetDeviceFamily|PackageDependency|Application|Capability|uap:Capability|rescap:Capability|uap:Extension|Extension)\b[^>]*>',value):lines.append('- `'+item.replace('`','')+'`')
lines+=['','## Selected container headers and plaintext schemas','']
pkg=next(p for p in (research/'unpacked').rglob('*x64_ReleaseProduction.msix') if p.is_file())
with zipfile.ZipFile(pkg) as z:
 for name in ['Resources/CompleteAnatomy/Assets.wcar','Resources/CompleteAnatomy/dds/bcc103822e3044488cbada0f18032ef7.bin','Resources/CompleteAnatomy/shaders.tar.gz','Mobile3D4MEngine/Info.cplist','Mobile3D4MEngine/Browser.environment/Mobile3D4MEngine.sj']:
  with z.open(name) as f:head=f.read(64)
  label='unknown/unsupported payload'
  if head.startswith(b'\x1f\x8b'):label='gzip header; contents not expanded'
  elif head.startswith(b'DDS '):label='DDS texture header'
  elif head.startswith(b'bplist'):label='binary plist header'
  elif head.startswith(b'280NPLIST'):label='280 North property-list serialization marker'
  elif head.startswith(b'@STATIC'):label='Objective-J static archive marker'
  elif head.startswith(b'PK'):label='ZIP header'
  lines.append(f'- `{name}`: prefix `{head[:16].hex()}`; {label}. No model decoding attempted.')
 for name in ['Resources/CompleteAnatomy/ca-pipeline.json','Resources/CompleteAnatomy/picking-pipeline.json','Resources/CompleteAnatomy/ModelConfigurations.plist','Resources/CompleteAnatomy/animated_models_CH.plist']:
  raw=z.read(name)
  try:
   data=json.loads(raw) if name.endswith('.json') else plistlib.loads(raw)
   if isinstance(data,list):
    listkeys=sorted({k for v in data if isinstance(v,dict) for k in v})
    lines+=['',f'`{name}`: parsed plaintext list with {len(data)} records; record keys: `'+', '.join(listkeys)+'`.']
    lines+=['Declared model labels (metadata, does not establish payload availability): '+', '.join(str(v.get('ModelName','')) for v in data if isinstance(v,dict))+'.']
   else:lines+=['',f'`{name}`: parsed plaintext '+type(data).__name__+'; top-level keys: `'+', '.join(map(str,list(data)[:40]))+'`.']
   if name.endswith('pipeline.json'):
    keys=collections.Counter();values=[]
    def walk(obj):
     if isinstance(obj,dict):
      keys.update(obj.keys())
      for v in obj.values():walk(v)
     elif isinstance(obj,list):
      for v in obj:walk(v)
     elif isinstance(obj,str) and re.search(r'blend|depth|transparent|opaque|shader|target|pass|geometry|picking',obj,re.I):values.append(obj)
    walk(data)
    lines+=['Observed nested schema keys: `'+', '.join(keys)+'`.','Observed bounded render vocabulary: `'+', '.join(dict.fromkeys(values[:24]))+'`.']
  except Exception as e:lines+=['',f'`{name}`: unsupported by standard parser ({type(e).__name__}); not decoded further.']
lines+=['','## Question ledger','', '| Question | Result and evidence type | Remaining uncertainty |','|---|---|---|','| Architecture | Verified PE AMD64 EXE imports core DLL; no CLI directory, per REA. Native bridge APIs in import/export tables. | Manifest compiler metadata may indicate .NET Native tooling ancestry; absence of CLI in shipped native PE does not exclude that ancestry. Internal call graph unavailable without configured native provider. |','| Framework/rendering | Verified core imports Objective-C/GNUstep, Direct3D 11/12, DXGI and shader compiler. | A custom cross-platform renderer is a reasonable inference; exact runtime backend and engine identity not established. |','| UI architecture | Bridge and UI names in imports/strings and compiled XAML resource filenames. Objective-J static/archive markers where reported. | Event wiring and visual state transitions not observed. |','| Model organization | Main-package resource paths catalogued and hashed. Selected magic headers reported above. | WCAR/BIN payload encoding, anatomical entity mapping and mesh layout remain unknown; no protected models exported or decoded. |','| Camera/object interaction | Camera/gesture names are static evidence of implementation vocabulary. | Actual gesture mapping, picking precision and constraints require approved runtime observation. |','| Rendering/visibility/layers | Import tables, plaintext render pipeline schema, and visibility-related strings. | Runtime-selected pipeline, blend order and opacity/layer behavior remain unobserved. |','| Search/navigation | Search and anatomy-related names found where listed. | Index format, ranking and exact entity hierarchy not proven. |','| Annotation/education | Static strings are bounded clues; public official documentation is a separate evidence source. | File formats, drawing coordinate system and full authored content workflows unobserved. |','| Animation/scenes | Static names and resource metadata recorded. | State machine, interpolation, playback and persistence semantics unknown. |','| Local storage | GNUstep defaults/archive APIs and storage strings are clues. No .db/.sqlite/.sql main-package filenames found. | No application runtime data directory inspected; no schema completeness claim. |','| Online services | Network APIs and embedded endpoint strings are static capability evidence. | No live service contacted; current availability, authentication and traffic unverified. |','','## Coverage limits','','Broad string keyword matches contain false positives (for example MIME type names and Windows UI animations); counts are literal string matches, not feature counts. This is a bounded non-executing strings/resource inspection. It does not reconstruct source, prove dead-code reachability, verify licensing or signature trust, infer encryption from unknown bytes, or establish feature parity. The full path/hash inventory is retained separately. No endpoint credentials are included in this report.']
(research/'STATIC_FINDINGS.md').write_text('\n'.join(lines),encoding='utf8')
print('Wrote',research/'STATIC_FINDINGS.md')
