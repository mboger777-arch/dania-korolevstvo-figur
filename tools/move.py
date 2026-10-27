# OUT=shots/move VP=844x390 CH=0 python3 tools/move.py -> frames of running in each direction + jump, plus per-frame log
import asyncio,os,json
from playwright.async_api import async_playwright
URL=os.environ.get('URL','http://127.0.0.1:8059/index.html?mute');OUT=os.environ.get('OUT','shots/move');CH=int(os.environ.get('CH','0'))
DIRS=[('left',-1,0),('right',1,0),('dleft',-.7,.7),('dright',.7,.7),('away',0,1),('toward',0,-1)]
async def main():
  W,H=map(int,os.environ.get('VP','844x390').split('x'));os.makedirs(OUT,exist_ok=True)
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    pg=await (await b.new_context(viewport={'width':W,'height':H},has_touch=True,is_mobile=True)).new_page()
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
    await pg.goto(URL);await pg.wait_for_function('typeof scene!=="undefined"&&scene!==""',timeout=60000)
    await pg.evaluate(f'go("ch",{CH})')
    for i in range(150):
      await pg.wait_for_timeout(600)
      if await pg.evaluate('(()=>{if(TALK)skipTalk();return scene==="ch"&&!CUT&&!TALK&&HERO.mode!=="cut"})()'):break
    SX,SZ=os.environ.get('AT','0,4').split(',')
    res={}
    for nm,jx,jy in DIRS:
      await pg.evaluate(f'heroAt({SX},{SZ},0);if(TALK)skipTalk();ACT.pend&&(ACT.pend.length=0);INPMODE="play";JOY=null')
      await pg.wait_for_timeout(900)
      await pg.evaluate(f'JOY={{id:-7,x0:300,y0:500,x:300+({jx})*90,y:500-({jy})*90}};window.MLOG=[];window.MLT=1;(function f(){{if(!window.MLT)return;MLOG.push([+HERO.x.toFixed(3),+HERO.y.toFixed(3),+HERO.z.toFixed(3),DANIA.fr,DANIA.mir,HERO.gr,+T.toFixed(4),+(DANIA.root.position.y-groundAt(HERO.x,HERO.z,HERO.y+.1)).toFixed(3)]);requestAnimationFrame(f)}})()')
      await pg.wait_for_timeout(700);await pg.screenshot(path=f'{OUT}/{nm}.png')
      await pg.evaluate('JOY=null');await pg.wait_for_timeout(500)
      res[nm]=await pg.evaluate('MLT=0;MLOG');print(nm,res[nm][len(res[nm])//2],flush=True)
    await pg.evaluate(f'heroAt({SX},{SZ},0);JOY={{id:-7,x0:300,y0:500,x:300,y:430}};window.MLOG=[];window.MLT=1;(function f(){{if(!window.MLT)return;MLOG.push([+HERO.x.toFixed(3),+HERO.y.toFixed(3),+HERO.z.toFixed(3),DANIA.fr,DANIA.mir,HERO.gr,+T.toFixed(4),+(DANIA.root.position.y-groundAt(HERO.x,HERO.z,HERO.y+.1)).toFixed(3)]);requestAnimationFrame(f)}})()')
    await pg.wait_for_timeout(500);await pg.evaluate('INP.tapQ=T');
    for k,t in enumerate([120,200,200,250]):
      await pg.wait_for_timeout(t);await pg.screenshot(path=f'{OUT}/jump{k}.png')
    await pg.wait_for_timeout(600);res['jump']=await pg.evaluate('MLT=0;JOY=null;MLOG')
    json.dump(res,open(f'{OUT}/log.json','w'));print('errors',errs[:5]);await b.close()
asyncio.run(main())
