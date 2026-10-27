# OUT=shots/r5before VP=844x390 CHS=0,1,2 python3 tools/tour.py  -> per-chapter frames
import asyncio,os,sys,json
from playwright.async_api import async_playwright
URL=os.environ.get('URL','http://127.0.0.1:8059/index.html?mute')
OUT=os.environ.get('OUT','shots/tour');CHS=[int(c) for c in os.environ.get('CHS','0,1,2,3,4,5,6').split(',')]
async def main():
  W,H=map(int,os.environ.get('VP','844x390').split('x'));os.makedirs(OUT,exist_ok=True)
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    pg=await (await b.new_context(viewport={'width':W,'height':H},has_touch=True,is_mobile=True)).new_page()
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
    await pg.goto(URL);await pg.wait_for_function('typeof scene!=="undefined"&&scene!==""',timeout=60000)
    async def snap(nm):
      await pg.screenshot(path=f'{OUT}/{nm}.png',timeout=90000);print(nm,flush=True)
    for ci in CHS:
      await pg.evaluate(f'go("ch",{ci})')
      await pg.wait_for_timeout(400);await snap(f'c{ci}_cut0')
      await pg.wait_for_timeout(1300);await snap(f'c{ci}_cut1')
      await pg.wait_for_timeout(2500);await snap(f'c{ci}_cut2')
      for i in range(150):
        await pg.wait_for_timeout(700)
        if await pg.evaluate('(()=>{if(TALK)skipTalk();return scene==="ch"&&!CUT&&!TALK&&HERO.mode!=="cut"})()'):break
      await pg.wait_for_timeout(1500);await snap(f'c{ci}_start')
      pts=await pg.evaluate('JSON.stringify((ACTS[%d]||{}).gems||[])'%ci)
      for j,g in enumerate(json.loads(pts)[:4]):
        await pg.evaluate(f'heroAt({g[0]},{g[1]-3},0);if(TALK)skipTalk()')
        await pg.wait_for_timeout(1800);await pg.evaluate('if(TALK)skipTalk()');await pg.wait_for_timeout(500);await snap(f'c{ci}_p{j}')
    print('errors',errs[:10]);await b.close()
asyncio.run(main())
