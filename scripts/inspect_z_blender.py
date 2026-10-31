"""Read selected Z-Anatomy object geometry with auto-execution disabled by the caller."""
import bpy,json
from pathlib import Path
R=Path(r'C:\Users\User\Projects\AnatomyAtlas')
source=R/'model-sources/z-anatomy/Startup.blend'
with bpy.data.libraries.load(str(source),link=False) as (src,dst):
 names=[name for name in src.objects if 'T11' in name or name in ['Palmar aponeurosis.l','Palmar aponeurosis.r','Femur.l','Femur.r','Frontal bone']]
 print('Selected names',names)
 dst.objects=names
objects=[o for o in dst.objects if o and o.type=='MESH']
for o in objects:
 if not o.name in bpy.context.scene.objects:bpy.context.scene.collection.objects.link(o)
bpy.context.view_layer.update()
result=[]
for o in objects:
 vertices=[list(o.matrix_world@v.co) for v in o.data.vertices]
 o.data.calc_loop_triangles()
 result.append({'name':o.name,'parent':o.parent.name if o.parent else None,'vertices':vertices,'faces':[list(t.vertices) for t in o.data.loop_triangles],'properties':{k:str(v)[:400] for k,v in o.items() if k not in ['M3','_RNA_UI']}})
 print(o.name,'verts',len(vertices),'bounds', [min(v[i] for v in vertices) for i in range(3)],[max(v[i] for v in vertices) for i in range(3)])
(R/'model-sources/z-anatomy/selected-geometry.json').write_text(json.dumps(result),encoding='utf8')
