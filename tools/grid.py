# grid.py out.png title img1 [img2 ...]  (2 columns, half-size, captions = file stem)
import sys,os
from PIL import Image,ImageDraw,ImageFont
out,title,*ims=sys.argv[1:];W,H=422,195;cols=int(os.environ.get('COLS','2'))
rows=(len(ims)+cols-1)//cols;im=Image.new('RGB',(cols*(W+10)+10,rows*(H+26)+44),'#20243a');d=ImageDraw.Draw(im)
f=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',18);fs=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',13)
d.text((10,10),title,fill='white',font=f)
for i,p in enumerate(ims):
  x=10+(i%cols)*(W+10);y=40+(i//cols)*(H+26)
  if os.path.exists(p):im.paste(Image.open(p).convert('RGB').resize((W,H)),(x,y))
  d.text((x,y+H+4),os.path.basename(p).rsplit('.',1)[0],fill='#ffe080',font=fs)
im.save(out)
