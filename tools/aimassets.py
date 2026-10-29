# R12: painted aim assets -> assets/ui/aim_*.webp  (ring: glow on black -> alpha; hand/icons: chroma key)
import numpy as np
from PIL import Image
from scipy import ndimage
def key(im):
  a=np.asarray(im.convert('RGB')).astype(np.float32);r,g,b=a[...,0],a[...,1],a[...,2]
  d=g-np.maximum(r,b);al=1-np.clip((d-25)/(80-25),0,1)
  edge_px=al<.98
  a[...,1]=np.where(edge_px,np.minimum(g,np.maximum(r,b)+4),g)
  bgm=d>30;lb,nb=ndimage.label(bgm);edge=set(np.unique(np.concatenate([lb[0],lb[-1],lb[:,0],lb[:,-1]])))-{0}
  bg=np.isin(lb,list(edge));inside=~ndimage.binary_dilation(bg,iterations=1);al=np.where(inside,1.0,np.where(bg,0.0,al));al=ndimage.uniform_filter(al,2)
  m=al>.5;lab,n=ndimage.label(m);return a,al,lab,n
def save(a,al,box,name,size):
  x0,y0,x1,y1=box;rgba=np.dstack([a,al*255]).clip(0,255).astype(np.uint8)[y0:y1,x0:x1]
  im=Image.fromarray(rgba);im.thumbnail((size,size),Image.LANCZOS);c=Image.new('RGBA',(size,size));c.paste(im,((size-im.width)//2,(size-im.height)//2));c.save(f'assets/ui/{name}.webp',quality=90);print(name,c.size)
# ring
r=np.asarray(Image.open('refs/gen/aim_ring.jpg').convert('RGB')).astype(np.float32)
al=np.clip((r.max(-1)-14)/220,0,1);col=np.clip(r/np.maximum(al[...,None],1e-3),0,255)
col=np.where(al[...,None]>0,np.minimum(col,255),0)
Image.fromarray(np.dstack([col,al*255]).astype(np.uint8)).resize((256,256),Image.LANCZOS).save('assets/ui/aim_ring.webp',quality=90);print('ring')
# hand
a,al,lab,n=key(Image.open('refs/gen/aim_hand.jpg'))
sz=ndimage.sum(al>.5,lab,range(1,n+1));keep=np.isin(lab,1+np.where(sz>40)[0]);al=al*ndimage.binary_dilation(keep,iterations=3)
ys,xs=np.where(al>.5);save(a,al,(xs.min()-4,ys.min()-4,xs.max()+5,ys.max()+5),'aim_hand',160)
# icons: 3x2 grid
a,al,lab,n=key(Image.open('refs/gen/aim_icons.jpg'))
H,W=al.shape;names=['ic_goal','ic_boss','ic_beam','ic_fog','ic_grab','ic_shape']
for i,nm in enumerate(names):
  cx0,cy0=(i%3)*W//3,(i//3)*H//2;sub=al[cy0:cy0+H//2,cx0:cx0+W//3];ys,xs=np.where(sub>.5)
  save(a,al,(cx0+xs.min()-3,cy0+ys.min()-3,cx0+xs.max()+4,cy0+ys.max()+4),nm,96)
