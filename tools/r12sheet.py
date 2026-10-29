# before/after лист прицела: python3 tools/r12sheet.py out.png beforeDir afterDir [afterDir2]
import sys
from PIL import Image,ImageDraw,ImageFont
out,bd,ad=sys.argv[1:4];ad2=sys.argv[4] if len(sys.argv)>4 else None
F=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',22)
names=['beam','fog','ball','boss','shape','chalk']
def crop(d,n):
  im=Image.open(f'{d}/{n}.png').convert('RGB');W,H=im.size;cw,ch=int(W*.5),int(H*.66)
  # центр — по яркому золоту прицела не ищем: берём фиксированные окна на 0.5 кадра
  cx={'beam':.38,'fog':.72,'ball':.75,'boss':.75,'shape':.35,'chalk':.6}[n];cy={'beam':.4,'fog':.42,'ball':.45,'boss':.45,'shape':.62,'chalk':.45}[n]
  x0=int(min(max(0,W*cx-cw/2),W-cw));y0=int(min(max(0,H*cy-ch/2),H-ch));return im.crop((x0,y0,x0+cw,y0+ch)).resize((cw*2,ch*2),Image.LANCZOS)
cols=[('ДО (b8) 667x375',bd),('ПОСЛЕ (b9) 667x375',ad)]+([('ПОСЛЕ (b9) 844x390',ad2)] if ad2 else [])
tiles=[[crop(d,n) for n in names] for _,d in cols]
tw,th=tiles[0][0].size;tiles=[[t.resize((tw,th)) for t in col] for col in tiles]
S=Image.new('RGB',(len(cols)*(tw+12)+130,len(names)*(th+12)+60),(28,22,46));D=ImageDraw.Draw(S)
for j,(lab,_) in enumerate(cols):D.text((130+j*(tw+12)+10,16),lab,font=F,fill=(255,214,90))
for i,n in enumerate(names):
  D.text((14,50+i*(th+12)+th//2-12),n,font=F,fill=(255,255,255))
  for j in range(len(cols)):S.paste(tiles[j][i],(130+j*(tw+12),50+i*(th+12)))
S.save(out);print(out,S.size)
