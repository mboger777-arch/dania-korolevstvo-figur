# compose phone sheet 1600x1000 from shots/proto/v4/*.png
from PIL import Image,ImageDraw,ImageFont
D='shots/proto/v4/';W,H=1600,1000;S=Image.new('RGB',(W,H),(250,244,232));d=ImageDraw.Draw(S)
try:F=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',26)
except:F=None
def fit(im,w,h):
    r=max(w/im.width,h/im.height);im=im.resize((int(im.width*r+.5),int(im.height*r+.5)));x=(im.width-w)//2;y=(im.height-h)//2;return im.crop((x,y,x+w,y+h))
def lab(t,x,y):d.text((x+10,y+6),t,fill='white',font=F,stroke_width=3,stroke_fill='black')
k=Image.open('refs/v2/dania_keyart.jpg').convert('RGB').crop((150,0,650,720));S.paste(fit(k,560,600),(0,0));lab('key art',0,0)
S.paste(fit(Image.open(D+'hero.png'),440,600),(560,0));lab('3D v4 · 3/4',560,0)
for i,n in enumerate(['emo_smile','emo_surprise','emo_focus','emo_delight']):
    S.paste(fit(Image.open(D+n+'.png'),300,300),(1000+(i%2)*300,(i//2)*300));lab(n[4:],1000+(i%2)*300,(i//2)*300)
for i,n in enumerate(['idle','run','jump','kick','draw','cheer']):
    w=W//6;S.paste(fit(Image.open(D+n+'.png').crop((40,0,400,560)),w,400),(i*w,600));lab(n,i*w,600)
S.save('sheets/v4_dania3d_compare.png');print(S.size)
