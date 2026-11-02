# blender -b -P tools/rig_dania.py -- IN.glb OUT.glb  : decimate, rig (auto weights), keyframe anims, export
import bpy,sys,math,bmesh
from mathutils import Vector,Euler
a=sys.argv[sys.argv.index('--')+1:];IN,OUT=a[0],a[1];TRI=int(a[2]) if len(a)>2 else 24000
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=IN)
me=[o for o in bpy.context.scene.objects if o.type=='MESH'][0]
for o in list(bpy.context.scene.objects):
    if o!=me: o.select_set(False)
bpy.context.view_layer.objects.active=me;me.select_set(True)
mw=me.matrix_world.copy();me.parent=None;me.matrix_world=mw
bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
for o in list(bpy.context.scene.objects):
    if o!=me: bpy.data.objects.remove(o)
# normalize: feet at 0, height H
zs=[v.co.z for v in me.data.vertices];H=1.15;s=H/(max(zs)-min(zs));z0=min(zs)
for v in me.data.vertices: v.co=Vector((v.co.x*s,v.co.y*s,(v.co.z-z0)*s))
# merge + decimate
bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.mesh.remove_doubles(threshold=0.0005);bpy.ops.object.mode_set(mode='OBJECT')
n=len(me.data.polygons);m=me.modifiers.new('d','DECIMATE');m.ratio=min(1,TRI/n);bpy.ops.object.modifier_apply(modifier='d')
print('TRIS',len(me.data.polygons))
# texture downsize to 1024
for im in bpy.data.images:
    if im.size[0]>1024: im.scale(1024,1024)
# joints from front image (mesh units y in [-.5,.5]) -> blender
def P(x,y,zf=0.0): return Vector((-x*s*1.0, zf, (y+0.5)*s))  # mirror x? fix below
J=dict(hips=(0,-.11),spine=(0,0.02),chest=(0,.12),neck=(0,.17),head=(0,.24),headtop=(0,.5),
 sh=(.07,.15),el=(.185,.025),wr=(.255,-.064),ht=(.31,-.12),hip=(.05,-.152),kn=(.067,-.285),an=(.076,-.406),toe=(.08,-.47))
# vertex y-depth (front/back) centre at a height for each joint
import statistics
V=[v.co for v in me.data.vertices]
def depth(p):
    c=[q.y for q in V if abs(q.z-p.z)<.03 and abs(q.x-p.x)<.05];return statistics.median(c) if c else 0
def B(x,y): p=Vector((x*s,0,(y+0.5)*s));p.y=depth(p);return p
bpy.ops.object.armature_add(enter_editmode=True);arm=bpy.context.object;arm.name='Rig';ad=arm.data
eb=ad.edit_bones;eb.remove(eb[0])
def bone(n,h,t,par=None):
    b=eb.new(n);b.head=h;b.tail=t
    if par: b.parent=eb[par];b.use_connect=False
    return b
bone('hips',B(0,-.15),B(0,-.06));bone('spine',B(0,-.06),B(0,.06),'hips');bone('chest',B(0,.06),B(0,.16),'spine')
bone('neck',B(0,.16),B(0,.21),'chest');bone('head',B(0,.21),B(0,.5),'neck')
for sd,k in (('L',1),('R',-1)):
    bone('shoulder.'+sd,B(.02*k,.15),B(.07*k,.15),'chest')
    bone('upper_arm.'+sd,B(.07*k,.15),B(.185*k,.025),'shoulder.'+sd)
    bone('forearm.'+sd,B(.185*k,.025),B(.255*k,-.064),'upper_arm.'+sd)
    bone('hand.'+sd,B(.255*k,-.064),B(.31*k,-.12),'forearm.'+sd)
    bone('thigh.'+sd,B(.05*k,-.152),B(.067*k,-.285),'hips')
    bone('shin.'+sd,B(.067*k,-.285),B(.076*k,-.406),'thigh.'+sd)
    f=B(.076*k,-.44);t=Vector((f.x,f.y-.09,.02))
    bone('foot.'+sd,B(.076*k,-.406),t,'shin.'+sd)
for b in eb: b.roll=0
bpy.ops.object.mode_set(mode='OBJECT')
bpy.ops.object.select_all(action='DESELECT');me.select_set(True);arm.select_set(True);bpy.context.view_layer.objects.active=arm
bpy.ops.object.parent_set(type='ARMATURE_NAME')
# custom distance weights (bone heat fails on TRELLIS mesh)
from mathutils.geometry import intersect_point_line
bones={b.name:(b.head_local.copy(),b.tail_local.copy()) for b in arm.data.bones}
G={n:me.vertex_groups.get(n) or me.vertex_groups.new(name=n) for n in bones}
xs=bones['upper_arm.L'][0].x; crotch=bones['thigh.L'][0].z+0.0
def dw(co,names):
    ws={}
    for n in names:
        h,t=bones[n];p,f=intersect_point_line(co,h,t);f=min(1,max(0,f));d=(co-(h+(t-h)*f)).length+.004;ws[n]=1/d**4
    S=sum(ws.values());return {n:w/S for n,w in ws.items()}
def sst(a,b,x): t=min(1,max(0,(x-a)/(b-a)));return t*t*(3-2*t)
for v in me.data.vertices:
    co=v.co;k='L' if co.x>0 else 'R'
    if co.z<crotch+.02 and abs(co.x)<.2:
        tl=sst(crotch+.02,crotch-.05,co.z)
        W={n:w*tl for n,w in dw(co,['thigh.'+k,'shin.'+k,'foot.'+k]).items()}
        W['hips']=W.get('hips',0)+(1-tl)
    else:
        ta=sst(.105,.15,abs(co.x))*(1-sst(bones['neck'][0].z,bones['neck'][0].z+.04,co.z))
        W={n:w*ta for n,w in dw(co,['upper_arm.'+k,'forearm.'+k,'hand.'+k]).items()}
        for n,w in dw(co,['hips','spine','chest','neck','head']).items(): W[n]=W.get(n,0)+w*(1-ta)
    top=sorted(W.items(),key=lambda a:-a[1])[:4];S=sum(w for _,w in top)
    for n,w in top:
        if w>0: G[n].add([v.index],w/S,'REPLACE')
print('WEIGHTS custom done')
# --- animations: rotations given as world-axis intents relative to rest
from mathutils import Quaternion,Matrix
pb=arm.pose.bones
for p in pb: p.rotation_mode='QUATERNION'
bpy.context.scene.render.fps=30
AX={'x':Vector((1,0,0)),'y':Vector((0,1,0)),'z':Vector((0,0,1))}
def lq(name,rots):
    R=arm.data.bones[name].matrix_local.to_3x3();q=Quaternion()
    for ax,d in rots: q=Quaternion(AX[ax],math.radians(d))@q
    return (R.inverted()@q.to_matrix()@R).to_quaternion()
def side(k,base):  # mirror helper: for R side flip y,z rotations
    return [(ax,d*(-1 if (k<0 and ax in 'yz') else 1)) for ax,d in base]
def armp(k,down=50,fwd=0,elbow=0,out=0):
    return {('upper_arm.'+('L' if k>0 else 'R')):side(k,[('y',down-out),('x',-fwd)]),
            ('forearm.'+('L' if k>0 else 'R')):[('x',-elbow)]}
def legp(k,fwd=0,knee=0,foot=0):
    s='L' if k>0 else 'R'
    return {'thigh.'+s:[('x',-fwd)],'shin.'+s:[('x',knee)],'foot.'+s:[('x',foot)]}
def P(**kw):
    d={}
    d.update(armp(1,**kw.get('al',{})));d.update(armp(-1,**kw.get('ar',{})))
    d.update(legp(1,**kw.get('ll',{})));d.update(legp(-1,**kw.get('lr',{})))
    for b in ('spine','chest','neck','head','hips'):
        if b in kw: d[b]=kw[b]
    d['_z']=kw.get('z',0);return d
def setpose(d):
    for p in pb: p.rotation_quaternion=(1,0,0,0);p.location=(0,0,0)
    for n,r in d.items():
        if n=='_z': pb['hips'].location=(0,r,0);continue
        pb[n].rotation_quaternion=lq(n,r)
def act(name,frames):
    arm.animation_data_create();A=bpy.data.actions.new(name);arm.animation_data.action=A
    for f,d in frames:
        setpose(d)
        for p in pb: p.keyframe_insert('rotation_quaternion',frame=f);p.keyframe_insert('location',frame=f)
    A.use_fake_user=True;t=arm.animation_data.nla_tracks.new();t.name=name;t.strips.new(name,1,A);arm.animation_data.action=None
import math as m
def cyc(name,N,fn,step=2):
    act(name,[(1+i,fn(i/N*2*m.pi)) for i in range(0,N+1,step)])
idle=lambda t:P(al=dict(down=40,elbow=10),ar=dict(down=40,elbow=10),chest=[('x',1.5*m.sin(t))],head=[('z',2*m.sin(t*.5+1)),('x',-2)],z=.004*m.sin(t))
cyc('idle',60,idle,3)
def gait(A,K,AR,bob,lean):
    return lambda t:P(ll=dict(fwd=A*m.sin(t),knee=max(0,K*m.sin(t-1.6))+5),lr=dict(fwd=-A*m.sin(t),knee=max(0,-K*m.sin(t-1.6))+5),
      al=dict(down=55,fwd=-AR*m.sin(t),elbow=25+AR*.4),ar=dict(down=55,fwd=AR*m.sin(t),elbow=25+AR*.4),
      spine=[('x',lean)],chest=[('z',4*m.sin(t))],head=[('x',-lean*.6)],z=bob*abs(m.cos(t))-bob*.5)
cyc('walk',32,gait(28,40,22,.025,4))
cyc('run',20,gait(48,85,45,.05,12))
crouch=P(ll=dict(fwd=35,knee=65,foot=-30),lr=dict(fwd=35,knee=65,foot=-30),spine=[('x',18)],al=dict(down=60,fwd=-25,elbow=20),ar=dict(down=60,fwd=-25,elbow=20),z=-.11)
air=P(ll=dict(fwd=45,knee=70),lr=dict(fwd=15,knee=40),al=dict(down=-35,out=0,elbow=20),ar=dict(down=-35,elbow=20),spine=[('x',-6)],head=[('x',-8)])
act('jump_crouch',[(1,idle(0)),(5,crouch)])
act('jump_air',[(1,air),(10,P(ll=dict(fwd=25,knee=30),lr=dict(fwd=10,knee=25),al=dict(down=0,elbow=15),ar=dict(down=0,elbow=15)))])
act('jump_land',[(1,crouch),(10,idle(0))])
act('kick',[(1,idle(0)),(6,P(lr=dict(fwd=-40,knee=70),ll=dict(knee=12),spine=[('x',8)],al=dict(down=30,fwd=30),ar=dict(down=40,fwd=-30))),
 (10,P(lr=dict(fwd=80,knee=0,foot=20),ll=dict(knee=10,fwd=-8),spine=[('x',-10)],al=dict(down=25,fwd=-35),ar=dict(down=30,fwd=40))),
 (18,idle(0))])
chalk=lambda t:P(ar=dict(down=55+8*m.sin(t),fwd=55+10*m.cos(t),elbow=15),al=dict(down=45,elbow=20),spine=[('x',22)],head=[('x',15)],
  ll=dict(fwd=25,knee=40),lr=dict(fwd=8,knee=30),z=-.05)
cyc('chalk',40,chalk,4)
cheer=lambda t:P(al=dict(down=-75-10*m.sin(t),elbow=10),ar=dict(down=-75-10*m.sin(t),elbow=10),head=[('x',-12)],spine=[('x',-5)],
  ll=dict(knee=max(0,20*m.sin(t))),lr=dict(knee=max(0,20*m.sin(t))),z=.06*max(0,m.sin(t)))
cyc('cheer',30,cheer,3)
setpose(idle(0))
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=OUT,export_format='GLB',export_animations=True,export_animation_mode='NLA_TRACKS',export_image_format='WEBP',export_image_quality=88)
print('EXPORTED',OUT)
