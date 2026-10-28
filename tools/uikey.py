# Хромакей сгенерированной UI-графики: прозрачен только зелёный фон, связанный с краем (зелёные самоцветы внутри остаются)
import sys,numpy as np
from PIL import Image
from scipy import ndimage
def key(src,dst,mx=1024):
  a=np.asarray(Image.open(src).convert('RGB')).astype(float);r,g,b=a[...,0],a[...,1],a[...,2]
  m=np.maximum(r,b);d=g-m
  bc=np.median(np.r_[a[0],a[-1],a[:,0],a[:,-1]],axis=0);dist=np.sqrt(((a-bc)**2).sum(-1));lab,n=ndimage.label((d>25)&(dist<110));edge=set(np.unique(np.r_[lab[0],lab[-1],lab[:,0],lab[:,-1]]))-{0}
  bg=ndimage.binary_dilation(np.isin(lab,list(edge)),iterations=2)
  al=np.where(bg,np.clip(1-(d-25)/60,0,1),1.0);a[...,1]=np.where(bg&(d>0),m,g)
  im=Image.fromarray(np.dstack([a,al*255]).astype(np.uint8),'RGBA');im=im.crop(im.getchannel('A').point(lambda v:255 if v>20 else 0).getbbox())
  if max(im.size)>mx:im.thumbnail((mx,mx))
  im.save(dst,quality=88);print(dst,im.size)
if __name__=='__main__':key(sys.argv[1],sys.argv[2],int(sys.argv[3]) if len(sys.argv)>3 else 1024)
