# v5 (new Pixar-proportion A-pose model): blender -b -P tools/rig_dania5.py -- IN.glb OUT.glb [TRI]
# v2: decimate, delight texture, bigger head, right fist, face/chest decal patches, hood+lace bones,
#     custom distance weights + smoothing, hand-keyed clips (anticipation / follow-through / foot planting)
import bpy,sys,math,bmesh,statistics
import numpy as np
from mathutils import Vector,Quaternion
a=sys.argv[sys.argv.index('--')+1:];IN,OUT=a[0],a[1];TRI=int(a[2]) if len(a)>2 else 24000
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=IN)
me=[o for o in bpy.context.scene.objects if o.type=='MESH'][0]
for o in list(bpy.context.scene.objects): o.select_set(o==me)
bpy.context.view_layer.objects.active=me
mw=me.matrix_world.copy();me.parent=None;me.matrix_world=mw
bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
for o in list(bpy.context.scene.objects):
    if o!=me: bpy.data.objects.remove(o)
zs=[v.co.z for v in me.data.vertices];H=1.15;s=H/(max(zs)-min(zs));z0=min(zs)
for v in me.data.vertices: v.co=Vector((v.co.x*s,v.co.y*s,(v.co.z-z0)*s))
bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.mesh.remove_doubles(threshold=0.0005);bpy.ops.object.mode_set(mode='OBJECT')
n=len(me.data.polygons);m=me.modifiers.new('d','DECIMATE');m.ratio=min(1,TRI/n);bpy.ops.object.modifier_apply(modifier='d')
print('TRIS',len(me.data.polygons))
for p in me.data.polygons: p.use_smooth=True
def sst(a,b,x): t=min(1,max(0,(x-a)/(b-a)));return t*t*(3-2*t)
# ---------- texture: 1024, soft delight (divide out low-frequency luminance), warmer + more saturated
img=max(bpy.data.images,key=lambda i:i.size[0]*i.size[1])
if img.size[0]>1024: img.scale(1024,1024)
w,h=img.size;px=np.array(img.pixels[:],dtype=np.float32).reshape(h,w,4)
bl=img.copy();bl.scale(20,20);bl.scale(w,h);bp=np.array(bl.pixels[:],dtype=np.float32).reshape(h,w,4)
lum=lambda p:p[...,0]*.3+p[...,1]*.59+p[...,2]*.11
L=lum(px);BL=lum(bp);ref=float(np.median(BL[BL>.05]))
r=np.clip((ref/(BL+1e-3))**.3,.85,1.25)[...,None]
rgb=px[...,:3]*r;g=lum(rgb)[...,None];rgb=g+(rgb-g)*1.0
rgb=rgb*np.array([1.01,1.0,.98],dtype=np.float32);rgb=np.clip(rgb,0,1)
px[...,:3]=rgb;img.pixels.foreach_set(px.ravel());img.update();bpy.data.images.remove(bl)
def texat(uv):
    x=min(w-1,max(0,int(uv[0]*w)));y=min(h-1,max(0,int(uv[1]*h)));return px[y,x,:3]
# ---------- joints (front-image units) -> blender
V=[v.co for v in me.data.vertices]
def depth(p):
    c=[q.y for q in V if abs(q.z-p.z)<.03 and abs(q.x-p.x)<.05];return statistics.median(c) if c else 0
def B(x,y): p=Vector((x*s,0,(y+0.5)*s));p.y=depth(p);return p
# ---------- decal patches (built before head scaling so UVs stay in reference coords)
FACE=(-.14,.14,.72,1.0)
ymid=statistics.median([q.y for q in V if .80<q.z<.92 and abs(q.x)<.12])
# ---------- v4: erase baked eyes / brows / mouth directly in the base texture (UV-space inpaint from surrounding skin)
uvl0=me.data.uv_layers.active.data
def in_erase(c):
    for sx in (-1,1):
        if ((c.x-sx*.053)/.032)**2+((c.z-.869)/.03)**2<1: return True
        if .012<sx*c.x<.095 and .895<c.z<.935: return True
    return abs(c.x)<.05 and .78<c.z<.815
def in_face(c): return (c.x/.12)**2+((c.z-.85)/.11)**2<1
M=np.zeros((h,w),bool);VA=np.zeros((h,w),bool)
def rast(poly,tgt):
    uv=[uvl0[li].uv for li in poly.loop_indices]
    for k in range(1,len(uv)-1):
        a,b,c=[np.array((q[0]*w,q[1]*h)) for q in (uv[0],uv[k],uv[k+1])]
        x0,x1=int(max(0,min(a[0],b[0],c[0])-1)),int(min(w-1,max(a[0],b[0],c[0])+1));y0,y1=int(max(0,min(a[1],b[1],c[1])-1)),int(min(h-1,max(a[1],b[1],c[1])+1))
        if x1<x0 or y1<y0: continue
        X,Y=np.meshgrid(np.arange(x0,x1+1)+.5,np.arange(y0,y1+1)+.5)
        d=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1])
        if abs(d)<1e-9: continue
        l1=((b[1]-c[1])*(X-c[0])+(c[0]-b[0])*(Y-c[1]))/d;l2=((c[1]-a[1])*(X-c[0])+(a[0]-c[0])*(Y-c[1]))/d;l3=1-l1-l2
        e=-.08;tgt[y0:y1+1,x0:x1+1]|=(l1>e)&(l2>e)&(l3>e)
for p in me.data.polygons:
    c=p.center
    if c.y>ymid+.01 or not in_face(c): continue
    rast(p,M if in_erase(c) else VA)
rgb=px[...,:3];skm=np.median(rgb[VA&~M],axis=0)
VA&=~M&(np.abs(rgb-skm).sum(-1)<.22)
def box(a,r):
    for ax in (0,1):
        c=np.cumsum(np.pad(a,[(r+1,r)] if a.ndim==1 else ([(r+1,r),(0,0)] if ax==0 else [(0,0),(r+1,r)])+([(0,0)] if a.ndim==3 else []),mode='edge'),axis=ax)
        a=(np.take(c,range(2*r+1,c.shape[ax]),axis=ax)-np.take(c,range(0,c.shape[ax]-2*r-1),axis=ax))/(2*r+1)
    return a
fill=np.tile(skm,(h,w,1)).astype(np.float32);got=np.zeros((h,w),bool)
for r in (10,20,40,80):
    wv=box(box(VA.astype(np.float32),r),r);cv=box(box(rgb*VA[...,None],r),r)
    ok=(wv>.02)&~got;fill[ok]=cv[ok]/wv[ok,None];got|=ok
Md=box(box(M.astype(np.float32),2),2)>0.01
soft=np.clip(box(Md.astype(np.float32),2),0,1)[...,None]
px[...,:3]=rgb*(1-soft)+fill*soft
FR=np.zeros((h,w),bool)
for p in me.data.polygons:
    if p.center.y<ymid+.01 and in_face(p.center) and not (abs(p.center.x)<.02 and .82<p.center.z<.86): rast(p,FR)
FR&=VA|Md
sm=box(box(px[...,:3]*FR[...,None],8),8)/np.maximum(box(box(FR.astype(np.float32),8),8),1e-3)[...,None]
px[FR,:3]=px[FR,:3]*.35+sm[FR]*.65
img.pixels.foreach_set(px.ravel());img.update()
print('ERASED px',int(Md.sum()),'valid',int(VA.sum()),'skin',skm)
# ---------- v4: colour transfer to key-art palette (skin warm peach, hoodie terracotta-orange)
def regmed(sel):
    T=np.zeros((h,w),bool)
    for p in me.data.polygons:
        if sel(p.center) and p.center.y<ymid+.02: rast(p,T)
    return T
HO=regmed(lambda c:abs(c.x)<.09 and .48<c.z<.58)
rgb=px[...,:3];hom=np.median(rgb[HO],axis=0);print('HOODIE',hom)
SK_T=np.array([.95,.62,.40],np.float32);HO_T=np.array([.85,.38,.10],np.float32)
def near(m,sc): return np.exp(-((rgb-m)**2).sum(-1)/sc)[...,None]
ws=near(skm,.012);wh=near(hom,.02)*(1-ws)
rgb=rgb+ws*(SK_T-skm)*.85+wh*(HO_T-hom)*.8
px[...,:3]=np.clip(rgb,0,1)
FM=FR|Md;fm0=np.median(px[FM,:3],axis=0)
FX=np.zeros((h,w),bool)
for p in me.data.polygons:
    c=p.center
    if (c.x/.15)**2+((c.z-.85)/.12)**2<1 and p.normal.y<.3 and c.z<.93: rast(p,FX)
FX&=(np.abs(px[...,:3]-fm0).sum(-1)<.3)
FM|=FX;px[FM,:3]=px[FM,:3]*.22+fm0*.78
img.pixels.foreach_set(px.ravel());img.update()
def make_patch(name,sel,uvf):
    d=me.data.copy();ob=bpy.data.objects.new(name,d);bpy.context.scene.collection.objects.link(ob)
    bm=bmesh.new();bm.from_mesh(d);bm.normal_update()
    bmesh.ops.delete(bm,geom=[f for f in bm.faces if not sel(f)],context='FACES')
    uvl=bm.loops.layers.uv.active
    for f in bm.faces:
        for l in f.loops: l[uvl].uv=uvf(l.vert.co)
    for v in bm.verts: v.co+=v.normal*.0013
    bm.to_mesh(d);bm.free()
    mt=bpy.data.materials.new(name);d.materials.clear();d.materials.append(mt);return ob
inb=lambda f,b,yl:all(b[0]<v.co.x<b[1] and b[2]<v.co.z<b[3] and v.co.y<yl for v in f.verts)
face=make_patch('face',lambda f:f.normal.y<-.1 and inb(f,FACE,ymid),lambda c:((c.x-FACE[0])/(FACE[1]-FACE[0]),(c.z-FACE[2])/(FACE[3]-FACE[2])))
CH=(.012,.10,.565,.665);ych=statistics.median([q.y for q in V if .56<q.z<.67 and abs(q.x)<.1])
chest=make_patch('chest',lambda f:f.normal.y<-.4 and inb(f,CH,ych),lambda c:((c.x-CH[0])/(CH[1]-CH[0]),(c.z-CH[2])/(CH[3]-CH[2])))
# skin tone for covering old eyes: texels of cheek region
uvl=me.data.uv_layers.active.data
def ring(cx,cz,r0,r1,sx=1.0):
    sk=[]
    for p in me.data.polygons:
        c=p.center;d=(((c.x-cx)/sx)**2+(c.z-cz)**2)**.5
        if r0<d<r1 and c.y<ymid and p.normal.y<-.2:
            for li in p.loop_indices: sk.append(texat(uvl[li].uv))
    return [float(x) for x in (np.median(np.array(sk),axis=0) if sk else np.array([.93,.66,.55]))]
fm=face.data.materials[0]
fm['skinR']=ring(-.053,.869,.03,.04);fm['skinL']=ring(.053,.869,.03,.04);fm['skinM']=ring(0,.797,.012,.02,3.0)
print('SKIN',fm['skinR'],fm['skinL'],fm['skinM'])
# ---------- right fist: fold fingers toward palm centre
wr=Vector((-.316,-.01,.517));ht=Vector((-.40,-.01,.45));dh=(ht-wr).normalized()
for v in me.data.vertices:
    t=(v.co-wr).dot(dh)
    if v.co.x<-.29 and t>-.005 and (v.co-wr).length<.10:
        c=wr+dh*.03;k=1-.62*sst(.0,.035,t);v.co=c+(v.co-c)*k
# ---------- bigger head (cartoon proportions), pivot under chin
HS=1.0;yh=statistics.median([q.y for q in V if .88<q.z<.92 and abs(q.x)<.06]);piv=Vector((0,yh,.80))
for ob in (me,face):
    for v in ob.data.vertices:
        f=1+(HS-1)*sst(.775,.83,v.co.z)
        if f>1: v.co=piv+(v.co-piv)*f
# ---------- armature
bpy.ops.object.armature_add(enter_editmode=True);arm=bpy.context.object;arm.name='Rig';ad=arm.data
eb=ad.edit_bones;eb.remove(eb[0])
def bone(n,hd,tl,par=None):
    b=eb.new(n);b.head=hd;b.tail=tl
    if par: b.parent=eb[par];b.use_connect=False
    return b
bone('hips',B(0,-.14),B(0,-.06));bone('spine',B(0,-.06),B(0,.04),'hips');bone('chest',B(0,.04),B(0,.12),'spine')
bone('neck',B(0,.12),B(0,.17),'chest');bone('head',B(0,.17),B(0,.5),'neck')
yn=depth(Vector((0,0,.72)))
bone('hood',Vector((0,yn+.05,.75)),Vector((0,yn+.075,.65)),'chest')
yl=min([q.y for q in V if .61<q.z<.70 and abs(q.x)<.05])
for sd,k in (('L',1),('R',-1)):
    bone('lace.'+sd,Vector((.029*k,yl,.705)),Vector((.029*k,yl,.605)),'chest')
    bone('shoulder.'+sd,B(.02*k,.11),B(.10*k,.11),'chest')
    bone('upper_arm.'+sd,B(.10*k,.11),B(.21*k,.03),'shoulder.'+sd)
    bone('forearm.'+sd,B(.21*k,.03),B(.275*k,-.05),'upper_arm.'+sd)
    bone('hand.'+sd,B(.275*k,-.05),B(.33*k,-.10),'forearm.'+sd)
    bone('thigh.'+sd,B(.05*k,-.16),B(.06*k,-.295),'hips')
    bone('shin.'+sd,B(.06*k,-.295),B(.068*k,-.42),'thigh.'+sd)
    f=B(.068*k,-.45);t=Vector((f.x,f.y-.09,.02))
    bone('foot.'+sd,B(.068*k,-.42),t,'shin.'+sd)
for b in eb: b.roll=0
bpy.ops.object.mode_set(mode='OBJECT')
bpy.ops.object.select_all(action='DESELECT')
for o in (me,face,chest): o.select_set(True)
arm.select_set(True);bpy.context.view_layer.objects.active=arm
bpy.ops.object.parent_set(type='ARMATURE_NAME')
# ---------- weights
from mathutils.geometry import intersect_point_line
bones={b.name:(b.head_local.copy(),b.tail_local.copy()) for b in arm.data.bones}
G={n:me.vertex_groups.get(n) or me.vertex_groups.new(name=n) for n in bones}
crotch=bones['thigh.L'][0].z;neckz=bones['neck'][0].z
def dw(co,names):
    ws={}
    for n in names:
        hd,tl=bones[n];p,f=intersect_point_line(co,hd,tl);f=min(1,max(0,f));d=(co-(hd+(tl-hd)*f)).length+.006;ws[n]=1/d**3
    S=sum(ws.values());return {n:w/S for n,w in ws.items()}
for v in me.data.vertices:
    co=v.co;k='L' if co.x>0 else 'R'
    if co.z<crotch+.02 and abs(co.x)<.2:
        tl=sst(crotch+.02,crotch-.05,co.z)
        W={n:w*tl for n,w in dw(co,['thigh.'+k,'shin.'+k,'foot.'+k]).items()};W['hips']=W.get('hips',0)+(1-tl)
    else:
        ta=sst(.115,.165,abs(co.x))*(1-sst(neckz,neckz+.04,co.z))
        W={n:w*ta for n,w in dw(co,['shoulder.'+k,'upper_arm.'+k,'forearm.'+k,'hand.'+k]).items()}
        for n,w in dw(co,['hips','spine','chest','neck','head']).items(): W[n]=W.get(n,0)+w*(1-ta)
    for n,w in W.items():
        if w>1e-4: G[n].add([v.index],w,'REPLACE')
bpy.ops.object.select_all(action='DESELECT');me.select_set(True);bpy.context.view_layer.objects.active=me
bpy.ops.object.mode_set(mode='WEIGHT_PAINT');bpy.ops.object.vertex_group_smooth(group_select_mode='ALL',factor=.5,repeat=3);bpy.ops.object.mode_set(mode='OBJECT')
# secondary: hood + laces (after smoothing so they stay crisp)
def blend(idx,n,wt):
    for g in me.vertex_groups:
        try: g.add([idx],g.weight(idx)*(1-wt),'REPLACE')
        except RuntimeError: pass
    G[n].add([idx],wt,'ADD')
for v in me.data.vertices:
    co=v.co
    if abs(co.x)<.14 and .58<co.z<.80:
        wh=sst(.04,.085,co.y-yn)*sst(.60,.67,co.z)
        if wh>.01: blend(v.index,'hood',wh*.9)
    for sd,k in (('L',1),('R',-1)):
        if abs(co.x-.029*k)<.011 and .60<co.z<.705 and co.y<yl+.012:
            blend(v.index,'lace.'+sd,sst(.695,.66,co.z))
bpy.ops.object.mode_set(mode='WEIGHT_PAINT');bpy.ops.object.vertex_group_limit_total(group_select_mode='ALL',limit=4);bpy.ops.object.vertex_group_normalize_all(lock_active=False);bpy.ops.object.mode_set(mode='OBJECT')
for o,bn in ((face,'head'),(chest,'chest')):
    g=o.vertex_groups.get(bn);idx=[v.index for v in o.data.vertices]
    for vg in list(o.vertex_groups):
        if vg.name!=bn: vg.remove(idx)
    g.add(idx,1.0,'REPLACE')
print('WEIGHTS done')
# ---------- animation helpers (world-axis intents)
pb=arm.pose.bones
for p in pb: p.rotation_mode='QUATERNION'
bpy.context.scene.render.fps=30
AX={'x':Vector((1,0,0)),'y':Vector((0,1,0)),'z':Vector((0,0,1))}
def lq(name,rots):
    R=arm.data.bones[name].matrix_local.to_3x3();q=Quaternion()
    for ax,d in rots: q=Quaternion(AX[ax],math.radians(d))@q
    return (R.inverted()@q.to_matrix()@R).to_quaternion()
def side(k,base): return [(ax,d*(-1 if (k<0 and ax in 'yz') else 1)) for ax,d in base]
def armp(k,down=50,fwd=0,elbow=0,out=0,twist=0):
    s='L' if k>0 else 'R'
    return {'upper_arm.'+s:side(k,[('y',down-11-out),('x',-fwd)]),'forearm.'+s:side(k,[('x',-elbow),('z',twist)])}
def legp(k,fwd=0,knee=0,foot=0,out=0):
    s='L' if k>0 else 'R'
    return {'thigh.'+s:side(k,[('x',-fwd),('y',-out)]),'shin.'+s:[('x',knee)],'foot.'+s:[('x',foot)]}
def flat(fwd,knee,kk=1.0): return (fwd-knee)*kk
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
m=math
def cyc(name,N,fn,step=2): act(name,[(1+i,fn(i/N*2*m.pi)) for i in range(0,N+1,step)])
S=m.sin;C=m.cos
WAND=dict(down=58,fwd=22,elbow=38,twist=0)   # right hand carries the wand a bit forward
def idle(t):
    return P(al=dict(down=60+2*S(t),fwd=4,elbow=14),ar=dict(down=WAND['down']+2*S(t),fwd=WAND['fwd'],elbow=WAND['elbow']),
      chest=[('x',-1.5*S(t))],spine=[('y',1.5*S(t*.5))],head=[('z',3*S(t*.5+1)),('x',-3)],hips=[('y',-1.5*S(t*.5))],
      ll=dict(knee=3),lr=dict(knee=3+2*S(t*.5)),z=.003*S(t)-.002)
cyc('idle',60,idle,3)
def leg(t,A,K,k0,off=0):
    fwd=A*S(t)+off;sw=max(0,C(t-.35));knee=k0+K*sw**1.2
    stance=sst(0,.5,-C(t));foot=flat(fwd,knee,.9)*stance+(-12*sw)
    return dict(fwd=fwd,knee=knee,foot=foot)
def gait(A,K,k0,AR,EL,bob,lean,tw,run):
    def f(t):
        z=(-bob*C(2*t)) if run else (bob*C(2*t)*.6)
        return P(ll=leg(t,A,K,k0,lean*.3),lr=leg(t+m.pi,A,K,k0,lean*.3),
          al=dict(down=64,fwd=-AR*S(t)+4,elbow=EL+12*S(t)),ar=dict(down=62,fwd=AR*S(t)+8,elbow=EL-12*S(t)),
          hips=[('z',-tw*S(t)),('y',2.5*C(t))],spine=[('x',lean)],chest=[('z',tw*1.6*S(t))],head=[('x',-lean*.7),('z',-tw*.5*S(t))],z=z-(.02 if run else 0))
    return f
cyc('walk',32,gait(30,42,6,24,25,.016,4,5,False))
cyc('run',20,gait(48,95,10,52,82,.035,13,8,True))
# jump: deep anticipation, stretch on take-off, tuck at apex, reach for ground
crouch=P(ll=dict(fwd=48,knee=92,foot=flat(48,92)),lr=dict(fwd=48,knee=92,foot=flat(48,92)),spine=[('x',24)],head=[('x',-16)],
  al=dict(down=70,fwd=-48,elbow=15),ar=dict(down=70,fwd=-40,elbow=25),z=-.15)
act('jump_crouch',[(1,idle(0)),(4,crouch)])
rise=P(ll=dict(fwd=-6,knee=8,foot=-25),lr=dict(fwd=-10,knee=12,foot=-25),spine=[('x',-6)],head=[('x',-8)],al=dict(down=-55,fwd=35,elbow=18),ar=dict(down=-45,fwd=40,elbow=25),z=.02)
tuck=P(ll=dict(fwd=58,knee=95,foot=-10),lr=dict(fwd=30,knee=85,foot=-10),spine=[('x',6)],al=dict(down=-25,fwd=30,elbow=35,out=10),ar=dict(down=-20,fwd=35,elbow=40,out=10),head=[('x',-4)])
reach=P(ll=dict(fwd=30,knee=25,foot=5),lr=dict(fwd=12,knee=20,foot=5),spine=[('x',4)],al=dict(down=10,fwd=15,elbow=20,out=25),ar=dict(down=12,fwd=22,elbow=30,out=25),head=[('x',4)])
act('jump_air',[(1,rise),(6,tuck),(11,reach)])
squash=P(ll=dict(fwd=46,knee=88,foot=flat(46,88)),lr=dict(fwd=46,knee=88,foot=flat(46,88)),spine=[('x',22)],head=[('x',-14)],al=dict(down=35,fwd=20,elbow=25,out=15),ar=dict(down=35,fwd=25,elbow=30,out=15),z=-.14)
over=P(ll=dict(knee=2),lr=dict(knee=2),spine=[('x',-3)],al=dict(down=55,elbow=10),ar=dict(down=55,fwd=15,elbow=30),z=.01)
act('jump_land',[(1,reach),(3,squash),(8,over),(13,idle(0))])
# kick (right foot): wind-up, contact @f9, follow-through, little hop back
act('kick',[(1,idle(0)),
 (5,P(lr=dict(fwd=-38,knee=95,foot=-20),ll=dict(fwd=6,knee=22,foot=flat(6,22)),spine=[('x',4),('z',-6)],chest=[('z',-10)],al=dict(down=30,fwd=35,out=10),ar=dict(down=35,fwd=-30,elbow=30),z=-.03)),
 (9,P(lr=dict(fwd=62,knee=10,foot=25),ll=dict(fwd=-6,knee=15,foot=flat(-6,15)),spine=[('x',-12)],chest=[('z',10)],al=dict(down=25,fwd=-35,out=15),ar=dict(down=30,fwd=45,elbow=40),head=[('x',8)])),
 (13,P(lr=dict(fwd=95,knee=5,foot=30),ll=dict(fwd=-10,knee=10,foot=-15),spine=[('x',-18)],chest=[('z',14)],al=dict(down=15,fwd=-40,out=25),ar=dict(down=20,fwd=50,elbow=40,out=10),head=[('x',12)],z=.03)),
 (19,P(lr=dict(fwd=20,knee=40),ll=dict(knee=20,foot=flat(0,20)),spine=[('x',6)],al=dict(down=50,elbow=15),ar=dict(down=50,fwd=20,elbow=35),z=-.03)),
 (24,idle(0))])
# chalk: draws a big triangle in the air with the wand; leans in, concentrates
TRI=[(85,10),(55,62),(100,62)]
def chalk(t):
    u=(t/(2*m.pi))*3%3;i=int(u);f=u-i;a0=TRI[i];a1=TRI[(i+1)%3];f=f*f*(3-2*f)
    fw=a0[0]+(a1[0]-a0[0])*f;dn=a0[1]+(a1[1]-a0[1])*f
    return P(ar=dict(down=dn,fwd=fw,elbow=12),al=dict(down=55,fwd=10,elbow=35,out=10),spine=[('x',14),('z',-4)],chest=[('z',-6+4*f)],head=[('x',10),('z',-6)],
      ll=dict(fwd=22,knee=34,foot=flat(22,34)),lr=dict(fwd=-12,knee=14,foot=flat(-12,14)),z=-.035)
cyc('chalk',48,chalk,2)
# cheer: anticipation dip, big jump with both fists up, land, fist pump
up=lambda e:dict(down=-80,fwd=10,elbow=e,out=-8)
act('cheer',[(1,idle(0)),
 (6,P(ll=dict(fwd=30,knee=62,foot=flat(30,62)),lr=dict(fwd=30,knee=62,foot=flat(30,62)),spine=[('x',18)],al=dict(down=70,fwd=-30,elbow=40),ar=dict(down=70,fwd=-25,elbow=40),z=-.1)),
 (11,P(ll=dict(fwd=-4,knee=8,foot=-25),lr=dict(fwd=-4,knee=8,foot=-25),spine=[('x',-10)],head=[('x',-16)],al=up(15),ar=up(15),z=.13)),
 (16,P(ll=dict(fwd=35,knee=70),lr=dict(fwd=10,knee=50),spine=[('x',-6)],head=[('x',-18)],al=up(30),ar=up(30),z=.16)),
 (21,P(ll=dict(fwd=36,knee=70,foot=flat(36,70)),lr=dict(fwd=36,knee=70,foot=flat(36,70)),spine=[('x',12)],head=[('x',-10)],al=up(40),ar=up(40),z=-.1)),
 (27,P(ll=dict(knee=6),lr=dict(knee=6),spine=[('x',-6)],head=[('x',-14)],al=up(10),ar=up(10),z=.0)),
 (32,P(ll=dict(knee=14),lr=dict(knee=14),spine=[('x',-3)],head=[('x',-12)],al=up(70),ar=up(70),z=-.02)),
 (37,P(ll=dict(knee=6),lr=dict(knee=6),spine=[('x',-6)],head=[('x',-14)],al=up(10),ar=up(10),z=.0)),
 (46,idle(0))])
# stride (foot travel per cycle) for slip-free playback
def stride(name):
    A=bpy.data.actions[name];arm.animation_data.action=A;ys=[]
    for f in range(int(A.frame_range[0]),int(A.frame_range[1])+1):
        bpy.context.scene.frame_set(f);ys.append((arm.matrix_world@pb['foot.L'].head).y)
    arm.animation_data.action=None;return max(ys)-min(ys)
for nme in ('walk','run'): print('STRIDE',nme,round(stride(nme),4))
setpose(idle(0))
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=OUT,export_format='GLB',export_animations=True,export_animation_mode='NLA_TRACKS',export_image_format='WEBP',export_image_quality=90,export_extras=True)
print('EXPORTED',OUT)
