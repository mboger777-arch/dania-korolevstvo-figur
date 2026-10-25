# хромакей + разрезание листа-разворота на виды: python3 tools/cutout.py refs/gen/ta_dania.jpg out_prefix
import sys,numpy as np
from PIL import Image
from scipy import ndimage
src,pre=sys.argv[1],sys.argv[2]
im=np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
r,g,b=im[...,0],im[...,1],im[...,2]
d=g-np.maximum(r,b)
a=1-np.clip((d-18)/(70-18),0,1)
# despill
g2=np.minimum(g,np.maximum(r,b)+4);im[...,1]=np.where(a<1,np.minimum(g2,g),np.minimum(g,np.maximum(r,b)*1.0+40))
im[...,1]=np.minimum(im[...,1],np.maximum(r,b)+ (a>0.98)*40)
# убрать мусор: оставить крупные компоненты
m=a>0.5;lab,n=ndimage.label(m);sz=ndimage.sum(m,lab,range(1,n+1))
keep=np.isin(lab,1+np.where(sz>400)[0]);keep=ndimage.binary_dilation(keep,iterations=3)
a=a*keep
# эрозия края на 1px против ореола
a=np.minimum(a,ndimage.grey_erosion(a,size=(2,2)) *1.0+0.0)
rgba=np.dstack([im,a*255]).clip(0,255).astype(np.uint8)
# фигуры = крупные связные компоненты; мелкие (палочка, звёздочки) — к ближайшей фигуре
lab,n=ndimage.label(a>0.25);objs=ndimage.find_objects(lab);sz=ndimage.sum(np.ones_like(a),lab,range(1,n+1))
big=[k for k in range(n) if sz[k]>6000];big.sort(key=lambda k:objs[k][1].start)
own={k:[k] for k in big}
for k in range(n):
  if k in big or sz[k]<30:continue
  sy,sx=objs[k];cx=(sx.start+sx.stop)/2;cy=(sy.start+sy.stop)/2
  def dist(b):
    by,bx=objs[b];dx=max(bx.start-cx,0,cx-bx.stop);dy=max(by.start-cy,0,cy-by.stop);return dx+dy
  own[min(big,key=dist)].append(k)
print('views',len(big))
for i,b in enumerate(big):
  m=np.isin(lab,[q+1 for q in own[b]]);m=ndimage.binary_dilation(m,iterations=2)
  ys,xs=np.where(m&(a>0.1));y0,y1,x0,x1=ys.min(),ys.max()+1,xs.min(),xs.max()+1
  out=rgba[y0:y1,x0:x1].copy();out[...,3]=(out[...,3]*m[y0:y1,x0:x1]).astype(np.uint8)
  Image.fromarray(out).save(f'{pre}_{i}.png');print(i,'w',x1-x0,'h',y1-y0,'y',y0,y1)
