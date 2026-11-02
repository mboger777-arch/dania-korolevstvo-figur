# python tools/sheet5_compose.py -> sheets/v5_dania3d_compare.png (1600x1000)
from PIL import Image,ImageDraw
S='shots/proto/v5/';W=Image.new('RGB',(1600,1000),'white');d=ImageDraw.Draw(W)
def put(p,x,y,w,h,lab):
  im=Image.open(p).convert('RGB');im.thumbnail((w,h-18));W.paste(im,(x+(w-im.width)//2,y+18+(h-18-im.height)//2));d.text((x+6,y+3),lab,fill='black')
put('refs/v5/keyface.png',0,0,800,300,'ART face');put(S+'face_front.png',800,0,800,300,'v5 3D face')
put('refs/v5/keybody.png',0,300,800,330,'ART full');put(S+'full_front.png',800,300,800,330,'v5 3D full')
for i,(n,l) in enumerate([('run','run'),('jump','jump'),('kick','kick'),('draw','wand'),('emo_happy','happy'),('back','back')]):put(S+n+'.png',i*266,630,266,370,l)
W.save('sheets/v5_dania3d_compare.png')
