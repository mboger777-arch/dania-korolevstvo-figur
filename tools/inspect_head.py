# blender -b -P tools/inspect_head.py -- RAW.glb out.png x0 x1 z0 z1 [view=front|side|back]
import bpy,sys,math
from mathutils import Vector
a=sys.argv[sys.argv.index('--')+1:];IN,OUT=a[0],a[1];x0,x1,z0,z1=map(float,a[2:6]);view=a[6] if len(a)>6 else 'front'
bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.gltf(filepath=IN)
me=[o for o in bpy.context.scene.objects if o.type=='MESH']
sc=bpy.context.scene;sc.render.engine='BLENDER_WORKBENCH';sh=sc.display.shading;sh.light='FLAT';sh.color_type='TEXTURE'
sc.render.resolution_x=int(800*(x1-x0)/(z1-z0)) if view!='side' else 800;sc.render.resolution_y=800
import bpy_extras
deps=bpy.context.evaluated_depsgraph_get()
cam=bpy.data.cameras.new('c');cam.type='ORTHO';cam.ortho_scale=max(x1-x0,z1-z0);co=bpy.data.objects.new('c',cam);sc.collection.objects.link(co);sc.camera=co
cx=(x0+x1)/2;cz=(z0+z1)/2
if view=='front':co.location=(cx,-5,cz);co.rotation_euler=(math.pi/2,0,0)
elif view=='back':co.location=(cx,5,cz);co.rotation_euler=(math.pi/2,0,math.pi)
else:co.location=(5,cx,cz);co.rotation_euler=(math.pi/2,0,math.pi/2)
sc.render.film_transparent=True;sc.render.filepath=OUT;bpy.ops.render.render(write_still=True)
