# Рендер героев в ряд как refs/lineup.jpg: python3 tools/lineup.py out.png [VP]
import asyncio,os,sys
from playwright.async_api import async_playwright
async def main():
  out=sys.argv[1] if len(sys.argv)>1 else '/tmp/lineup.png';W,H=map(int,(sys.argv[2] if len(sys.argv)>2 else '1280x720').split('x'))
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    pg=await b.new_page(viewport={'width':W,'height':H});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
    await pg.goto('http://127.0.0.1:8059/index.html?test&mute&map');await pg.wait_for_function('typeof scene!=="undefined"&&scene==="map"',timeout=60000)
    await pg.evaluate('''go("ch",0);''');await pg.wait_for_timeout(500)
    await pg.evaluate('''GEN++;stopTalk();GOAL='';clearWorld();groundPlane();spawnHeroes({queen:1,kriv:1});
      place(DANIA,-2.4,0,0);place(KRUG,-.9,0,0);place(QUEEN,.8,0,0);place(KRIV,2.6,0,0);HERO.lock=true;HERO.x=-2.4;HERO.z=0;HERO.mode='cut';
      scene='lineup';SC.lineup={hud:false};SCN=SC.lineup;TICK.push(()=>{CAMS.mode='shot';CAMS.sp=V3(0,1.3,7.2);CAMS.sl=V3(0,1.15,0);CAMS.k=99});window.LINEUP=1''')
    print(await pg.evaluate('JSON.stringify([CAMS.mode,TICK.length,scene,CAM.position.z])'))
    for i,t in enumerate([900,1500]):
      await pg.wait_for_timeout(t);await pg.screenshot(path=out.replace('.png',f'_{i}.png') if i else out)
    print('errors',errs[:5])
asyncio.run(main())
