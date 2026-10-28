# OUT=shots/popb VP=844x390 python3 tools/popups.py -> every popup/overlay frame
import asyncio,os
from playwright.async_api import async_playwright
URL=os.environ.get('URL','http://127.0.0.1:8059/index.html?mute');OUT=os.environ.get('OUT','shots/pop')
async def main():
  W,H=map(int,os.environ.get('VP','844x390').split('x'));os.makedirs(OUT,exist_ok=True)
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    ctx=await b.new_context(viewport={'width':W,'height':H},has_touch=True,is_mobile=True);pg=await ctx.new_page()
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
    await pg.goto(URL);await pg.wait_for_function('typeof scene!=="undefined"&&scene!==""',timeout=60000)
    async def snap(nm,w=900):
      await pg.wait_for_timeout(w);await pg.screenshot(path=f'{OUT}/{nm}.png',timeout=90000);print(nm,flush=True)
    async def ev(s): await pg.evaluate(s)
    await snap('title',1500)
    await ev('go("map")');await snap('map',1500)
    await ev('STK.slice(0,7).forEach(s=>SV.st[s[0]]=1);ALBUM=true');await snap('album')
    await ev('ALBUM=false;SV.medal=1');await snap('map_medal')
    await ev('go("ch",0)');await snap('talk_queen',2500)
    for i in range(150):
      await pg.wait_for_timeout(600)
      if await pg.evaluate('(()=>{if(TALK)skipTalk();return scene==="ch"&&!CUT&&!TALK&&HERO.mode!=="cut"})()'):break
    await snap('goal',1500)
    await ev('run(()=>say("n_tri_ask"))');await snap('talk_npc',1200)
    await ev('stopTalk();run(()=>say("u_move"))');await snap('talk_krug',1200)
    await ev('stopTalk();ACT.pop={id:STK[0][0],t0:T}');await snap('sticker',700)
    await ev('ACT.pop=null;const o=ACT.items.find(o=>o.k==="chalk");chalkOpen(o)');await snap('chalk',1500)
    await ev('chalkClose()');await snap('_',300)
    await ev('bldOpen()');await snap('build',1500)
    await ev('bldClose();stopTalk();ACT.pend.length=0;SC.ch.win=T');await snap('win',1200)
    await ev('SC.ch.win=0;const m0=T;LVDRAW=()=>{const v=vis(),k=ease(Math.min(1,(T-m0)*1.6));X.fillStyle=`rgba(40,20,90,${.45*k})`;X.fillRect(v.x0,v.y0,v.w,v.h);X.save();X.translate(v.x0+v.w/2,v.y0+v.h*.48);X.scale(k,k);drawMedal(0,0,90);X.restore();txt("Мастер фигур",v.x0+v.w/2,v.y0+v.h*.48+150,60,"#ffe08a",{f:FONT,st:"#4a1f8a",lw:10,id:"mf"})};if(typeof MEDALDRAW==="function")LVDRAW=MEDALDRAW')
    await snap('medal',1500)
    await ev('LVDRAW=null;go("ch",2)')
    for i in range(150):
      await pg.wait_for_timeout(600)
      if await pg.evaluate('(()=>{if(TALK)skipTalk();return scene==="ch"&&!CUT&&!TALK&&HERO.mode!=="cut"})()'):break
    await ev('ANGCARD={deg:90}');await snap('angcard',1200)
    await pg.set_viewport_size({'width':H,'height':W});await snap('rotate',1200)
    print('errors',errs[:10]);await b.close()
asyncio.run(main())
