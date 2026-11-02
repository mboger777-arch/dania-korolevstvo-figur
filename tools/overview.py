# Лист-обзор финала: python3 tools/overview.py [пары "группа:файл"]
import sys,glob,re,os
from PIL import Image,ImageDraw,ImageFont,ImageStat
D='shots/915x412'
def srt(g):return sorted(g,key=lambda f:[int(x) if x.isdigit() else x for x in re.split(r'(\d+)',f)])
G=[('Пролог','a_prologue'),('Вступление','a_intro'),('Сад','c7_'),('1 Долина Точек','c0_'),('2 Ломаная гора','c1_'),('3 Кузница углов','c2_'),('4 Город фигур','c3_'),('5 Соты','c4_'),('6 Гонка колёс','c5_'),('7 Кривуля','c6_'),('Титры','cr_')]
pick=dict(a.split('=') for a in sys.argv[1:])
F=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',26)
W,H=640,288;cells=[]
for name,p in G:
  g=[f for f in srt(glob.glob(f'{D}/{p}*.png')) if 'FAIL' not in f]
  if p in pick: ch=[f'{D}/{x}.png' for x in pick[p].split(',')]
  else: ch=[g[len(g)//2]] if len(g)<4 else [g[len(g)//2],g[int(len(g)*.85)]]
  for f in ch:cells.append((name,f))
C=4;R=(len(cells)+C-1)//C;S=Image.new('RGB',(C*W,R*(H+40)+70),(40,24,80));d=ImageDraw.Draw(S)
d.text((20,18),'Даня и Королевство Фигур — обзор v6.3 (915x412, бот, notour)',font=F,fill=(255,230,140))
bad=[]
for i,(n,f) in enumerate(cells):
  im=Image.open(f).convert('RGB');x,y=(i%C)*W,70+(i//C)*(H+40)
  b=sum(ImageStat.Stat(im).mean)/3
  if b<50:bad.append((f,round(b)))
  S.paste(im.resize((W-8,H)),(x+4,y+36));d.text((x+8,y+4),n+'  ·  '+os.path.basename(f)[:-4],font=F,fill=(255,255,255))
S.save('out/final_overview.png');print('cells',len(cells),'dark',bad)
