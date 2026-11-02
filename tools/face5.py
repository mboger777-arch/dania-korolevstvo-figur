# v5: split the projected key-art-matched face (proto/face_art.png) into base (no brows/mouth) + brows + mouth layers
from PIL import Image,ImageFilter,ImageDraw;import numpy as np
im=np.array(Image.open('proto/face_art.png')).astype(float);rgb=im[...,:3]/255;al=im[...,3]
lum=rgb@[.3,.59,.11]
def poly(pts,w):
  m=Image.new('L',(512,512),0);d=ImageDraw.Draw(m);d.line(pts,fill=255,width=w,joint='curve')
  for p in (pts[0],pts[-1]):d.ellipse((p[0]-w/2,p[1]-w/2,p[0]+w/2,p[1]+w/2),fill=255)
  return np.array(m)>0
def bez(a,b,c,n=24):return [tuple((1-t)**2*np.array(a)+2*(1-t)*t*np.array(b)+t*t*np.array(c)) for t in np.linspace(0,1,n)]
BL=bez((86,172),(135,98),(208,122));BR=bez((312,120),(380,98),(430,172))
brow=(poly(BL,30)|poly(BR,30))&(lum<.6)
MO=bez((165,366),(256,404),(347,366))
mouth=poly(MO,22)
def dil(m,r):return np.array(Image.fromarray((m*255).astype(np.uint8)).filter(ImageFilter.MaxFilter(r)))>0
B=dil(brow,5);M=mouth
def fbox(a,r):
  for ax in (0,1):
    c=np.cumsum(np.pad(a,[(r+1,r) if i==ax else (0,0) for i in range(a.ndim)],mode='edge'),axis=ax)
    a=(np.take(c,range(2*r+1,c.shape[ax]),axis=ax)-np.take(c,range(0,c.shape[ax]-2*r-1),axis=ax))/(2*r+1)
  return a
B=dil(brow,9);M=dil(mouth,5)
valid=(lum>.55)&(np.abs(rgb-[.95,.62,.42]).sum(-1)<.3)&~B&~M
out=rgb.copy();got=~(B|M)
for r in (4,8,16,32,64):
  w=fbox(valid.astype(float),r);c=fbox(rgb*valid[...,None],r)
  ok=(B|M)&(w>.01)&~got;out[ok]=c[ok]/w[ok,None];got|=ok
soft=np.array(Image.fromarray(((B|M)*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2.5))).astype(float)[...,None]/255
base=rgb*(1-soft)+out*soft
Image.fromarray(np.dstack([base*255,al]).astype(np.uint8),'RGBA').save('proto/face_base.png')
def part(m,name,fe=1.2):
  a=np.array(Image.fromarray((m*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(fe))).astype(float)
  Image.fromarray(np.dstack([rgb*255,a]).astype(np.uint8),'RGBA').save(name)
part(dil(brow,3),'proto/face_brows.png');part(mouth&(lum<.7),'proto/face_mouth.png')
Image.fromarray((base*255).astype(np.uint8)).save('/tmp/fb2.png')
print('skin',np.median(rgb[valid],0)*255)
