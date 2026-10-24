# python3 tools/sheet.py 'shots/844x390/c0_*.png' out.png [cols]
import sys,glob
from PIL import Image,ImageDraw
fs=sorted(glob.glob(sys.argv[1]));cols=int(sys.argv[3]) if len(sys.argv)>3 else 4
a=Image.open(fs[0]);W,H=a.size[0]//2,a.size[1]//2;rows=(len(fs)+cols-1)//cols
im=Image.new('RGB',(W*cols,H*rows),'white');d=ImageDraw.Draw(im)
for i,f in enumerate(fs):
  x,y=(i%cols)*W,(i//cols)*H;im.paste(Image.open(f).convert('RGB').resize((W,H)),(x,y));d.text((x+4,y+H-14),f.split('/')[-1],fill='red')
im.save(sys.argv[2]);print(sys.argv[2],len(fs))
