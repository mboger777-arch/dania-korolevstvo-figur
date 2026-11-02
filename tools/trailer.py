# Трейлер: python3 tools/trailer.py → /workspace/dania_trailer.mp4 (кадры out/frames915 + голос)
import json,subprocess,os,re
FR='out/frames915';V=json.loads(re.search(r'const VOICE=(\{.*?\});',open('js/voice.js').read(),re.S).group(1))
fr=['a_prologue001','a_prologue002','a_prologue004','a_intro006','c7_02','c0_09','c0_14','c1_10','c1_16','c2_09','c2_14','c3_10','c3_16','c4_18','c4_29','c5_15','c5_25','c6_18','c6_34','cr_06']
D=2.9;X=.5;n=len(fr);T=n*D-(n-1)*X
inp=[];fl=[]
for i,f in enumerate(fr):
  inp+=['-loop','1','-t',str(D),'-i',f'{FR}/{f}.png']
  z='1.0+0.06*on/%d'%int(D*30)
  fl.append(f"[{i}:v]scale=1830:824,zoompan=z='{z}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={int(D*30)}:s=1280x576:fps=30,setsar=1,format=yuv420p[v{i}]")
prev='v0';off=0
for i in range(1,n):
  off+=D-X;fl.append(f'[{prev}][v{i}]xfade=transition=fade:duration={X}:offset={off:.2f}[x{i}]');prev=f'x{i}'
# титульная плашка в начале и в конце
fl.append(f"[{prev}]drawbox=y=ih-70:h=70:w=iw:color=0x281850@0.6:t=fill:enable='lt(t,3)+gt(t,{T-3:.2f})',drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='Даня и Королевство Фигур':fontcolor=0xffe08a:fontsize=40:x=(w-tw)/2:y=h-55:enable='lt(t,3)+gt(t,{T-3:.2f})'[vout]")
cl=[('pr1',0.3),('pr2',9.0),('c5_hk',27.0),('b_six',33.5),('f_1',40.0),('cr1',T-7.5)]
a0=n;ai=[]
for j,(k,t) in enumerate(cl):
  inp+=['-i','assets/voice/'+V[k][0]];fl.append(f'[{a0+j}:a]adelay={int(t*1000)}|{int(t*1000)},apad[a{j}]');ai.append(f'[a{j}]')
inp+=['-f','lavfi','-t',str(T),'-i','sine=f=261.6:r=44100','-f','lavfi','-t',str(T),'-i','sine=f=392:r=44100']
m=a0+len(cl);fl.append(f'[{m}:a][{m+1}:a]amix=2,volume=0.05,afade=in:d=2,afade=out:st={T-2:.2f}:d=2[bed]')
fl.append(''.join(ai)+f'[bed]amix={len(ai)+1}:normalize=0,atrim=0:{T:.2f}[aout]')
cmd=['ffmpeg','-y','-loglevel','error']+inp+['-filter_complex',';'.join(fl),'-map','[vout]','-map','[aout]','-c:v','libx264','-preset','veryfast','-crf','22','-c:a','aac','-b:a','128k','-t',f'{T:.2f}','/workspace/dania_trailer.mp4']
print('len',round(T,1));subprocess.check_call(cmd)
