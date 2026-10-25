# Сборка спрайт-атласов героев из листов refs/gen (после tools/cutout.py -> /tmp/cut)
# /home/box/rbvenv/bin/python tools/buildsprites.py
import json,os,subprocess,numpy as np,cv2
from PIL import Image
from scipy import ndimage
R='refs/gen';C='/tmp/cut';os.makedirs(C,exist_ok=True)
def cut(sheet,pre):
  if not os.path.exists(f'{C}/{pre}_0.png'):
    subprocess.run(['/home/box/rbvenv/bin/python','tools/cutout.py',f'{R}/{sheet}.jpg',f'{C}/{pre}'],check=True,stdout=subprocess.DEVNULL)
  out=[];i=0
  while os.path.exists(f'{C}/{pre}_{i}.png'):out.append(Image.open(f'{C}/{pre}_{i}.png').convert('RGBA'));i+=1
  return out
def patch(base,blink,band):
  B=np.asarray(base).astype(np.float32);H,W=B.shape[:2]
  K0=blink;best=None
  for s in np.linspace(.94,1.06,13):
    k=K0.resize((max(1,int(K0.width*H/K0.height*s)),max(1,int(H*s))),Image.LANCZOS);K=np.asarray(k).astype(np.float32)
    y0,y1=int(band[0]*H),int(band[1]*H)
    tpl=B[max(0,y0-30):y1+30,:,:3];msk=(B[max(0,y0-30):y1+30,:,3]>200)
    # поиск сдвига
    pad=24;Kp=np.zeros((K.shape[0]+2*pad+H,K.shape[1]+2*pad+W,4),np.float32);Kp[pad:pad+K.shape[0],pad:pad+K.shape[1]]=K
    for dy in range(-pad,pad+1,2):
      for dx in range(-pad,pad+1,2):
        yy=max(0,y0-30)+pad+dy+int((K.shape[0]-H)/2);xx=pad+dx+int((K.shape[1]-W)/2)
        if yy<0 or xx<0:continue
        reg=Kp[yy:yy+tpl.shape[0],xx:xx+W,:3]
        if reg.shape!=tpl.shape:continue
        e=np.abs(reg-tpl).mean(2)[msk].mean()
        if best is None or e<best[0]:best=(e,s,dy,dx,K,yy-max(0,y0-30),xx)
  e,s,dy,dx,K,oy,ox=best
  Kp=np.zeros((K.shape[0]+48+H,K.shape[1]+48+W,4),np.float32);Kp[24:24+K.shape[0],24:24+K.shape[1]]=K
  A=Kp[oy:oy+H,ox:ox+W]
  y0,y1=int(band[0]*H),int(band[1]*H)
  d=np.abs(A[...,:3]-B[...,:3]).mean(2);m=np.zeros_like(d,bool);m[y0:y1]=d[y0:y1]>32;m&=B[...,3]>200
  m=ndimage.binary_opening(m,iterations=1);lab,n=ndimage.label(ndimage.binary_dilation(m,iterations=5))
  if n:
    sz=ndimage.sum(np.ones_like(d),lab,range(1,n+1));keep=1+np.argsort(sz)[::-1][:3];keep=[k for k in keep if sz[k-1]>40]
    m=np.isin(lab,keep)
  f=cv2.GaussianBlur(m.astype(np.float32),(0,0),2.5)[...,None]
  O=B.copy();O[...,:3]=B[...,:3]*(1-f)+A[...,:3]*f
  print('  patch err %.1f s %.2f d %d,%d px %d'%(e,s,dy,dx,int(m.sum())))
  return Image.fromarray(O.clip(0,255).astype(np.uint8))
def anchor(im):
  a=np.asarray(im)[...,3]>128;H=a.shape[0];ys,xs=np.where(a[int(H*.45):]);return float(np.median(xs))
CH={}
def add(ch,name,im,hu,faceR=False):CH.setdefault(ch,[]).append(dict(n=name,im=im,hu=hu,fr=faceR))
def sheet_scale(ims,idx,hu):return [im.height/ims[idx].height*hu for im in ims]
# --- Даня ---
ta=cut('ta_dania','dania');tb=cut('ta_dania_blink','dania_bl');fb=cut('dania_front_blink','dania_fbl')
hs=sheet_scale(ta,0,2.0)
for i,n in enumerate(['f','q','s','b']):add('dania','st_'+n,ta[i],hs[i])
print('dania blink');add('dania','bl_f',patch(ta[0],fb[0],(.12,.3)),hs[0]);add('dania','bl_q',patch(ta[1],tb[1],(.12,.3)),hs[1]);add('dania','bl_s',patch(ta[2],tb[2],(.12,.3)),hs[2])
for sh,nm,h,fr in [('run_back_dania','rb',1.95,False),('run_front_dania','rf',1.95,False),('run_side_dania','rs',1.85,True)]:
  ims=cut(sh,sh);mh=np.mean([i.height for i in ims])
  for i,im in enumerate(ims):add('dania',f'{nm}{i}',im,im.height/mh*h,fr)
ps=cut('poses_dania','poses_dania');hp=sheet_scale(ps,1,2.0)
for i,n in enumerate(['cheer','oops','sitf','sitb','cast','jumpb']):add('dania',n,ps[i],hp[i])
# --- Кругляш ---
ta=cut('ta_krug','krug');tb=cut('ta_krug_blink','krug_bl');hs=sheet_scale(ta,0,1.02)
for i,n in enumerate(['f','q','s','b']):add('krug','st_'+n,ta[i],hs[i])
print('krug blink')
for i,n in enumerate(['f','q','s']):add('krug','bl_'+n,patch(ta[i],tb[i],(.2,.52)),hs[i])
ps=cut('poses_krug','poses_krug');hp=sheet_scale(ps,2,1.02)
for i,n in enumerate(['joy','oops','blink2','talk']):
  if n!='blink2':add('krug',n,ps[i],hp[i])
# --- Королева ---
ta=cut('ta_queen','queen');tb=cut('ta_queen_blink','queen_bl');hs=sheet_scale(ta,0,2.6)
for i,n in enumerate(['f','q','s','b']):add('queen','st_'+n,ta[i],hs[i])
print('queen blink')
for i,n in enumerate(['f','q','s']):add('queen','bl_'+n,patch(ta[i],tb[i],(.14,.27)),hs[i])
ps=cut('poses_queen','poses_queen');hp=sheet_scale(ps,1,2.6)
add('queen','talk',ps[0],hp[0]);add('queen','cheer',ps[2],hp[2])
# --- Кривуля ---
ta=cut('ta_kriv','kriv');tb=cut('ta_kriv_blink','kriv_bl');hs=sheet_scale(ta,0,2.95)
for i,n in enumerate(['f','q','s','b']):add('kriv','st_'+n,ta[i],hs[i])
print('kriv blink')
for i,n in enumerate(['f','q','s']):add('kriv','bl_'+n,patch(ta[i],tb[i],(.2,.4)),hs[i])
ps=cut('poses_kriv','poses_kriv');hp=sheet_scale(ps,3,2.95)
for i,n in enumerate(['happy','sad','shout']):add('kriv',n,ps[i],hp[i])
PPU={'dania':200,'krug':240,'queen':160,'kriv':145}
meta={}
for ch,fr in CH.items():
  ppu=PPU[ch];ims=[]
  for f in fr:
    th=max(8,round(f['hu']*ppu));im=f['im'].resize((max(4,round(f['im'].width*th/f['im'].height)),th),Image.LANCZOS)
    ims.append(im)
  # упаковка по полкам, ширина 2048
  AW=2048;G=14;x=y=G//2;rowh=0;pos=[]
  for im in ims:
    if x+im.width+G>AW:x=G//2;y+=rowh+G;rowh=0
    pos.append((x,y));x+=im.width+G;rowh=max(rowh,im.height)
  AH2=(y+rowh+G//2+3)//4*4
  at=Image.new('RGBA',(AW,AH2),(0,0,0,0))
  m={'w':AW,'h':AH2,'f':{}}
  for f,im,(px,py) in zip(fr,ims,pos):
    # "дилатация цвета" под прозрачными пикселями против тёмной каймы при фильтрации
    a=np.asarray(im).copy();al=a[...,3]
    rgb=a[...,:3].astype(np.float32);w=(al>0).astype(np.float32)
    for _ in range(4):
      bl=cv2.blur(rgb*w[...,None],(5,5));bw=cv2.blur(w,(5,5));fill=(w==0)&(bw>0)
      rgb[fill]=bl[fill]/bw[fill,None];w=np.maximum(w,fill.astype(np.float32))
    a[...,:3]=rgb.clip(0,255).astype(np.uint8);im=Image.fromarray(a)
    at.paste(im,(px,py))
    m['f'][f['n']]=[px,py,im.width,im.height,round(anchor(im),1),round(f['hu'],3),1 if f['fr'] else 0]
  at.save(f'assets/heroes/{ch}.webp','WEBP',quality=88,method=6)
  meta[ch]=m;print(ch,AW,AH2,os.path.getsize(f'assets/heroes/{ch}.webp')//1024,'KB',len(fr),'frames')
open('js/heroes_meta.js','w').write('const HMETA='+json.dumps(meta,separators=(',',':'))+';\n')
