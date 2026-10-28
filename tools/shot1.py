# SC=intro OUT=x.png VP=844x390 WAIT=2500 JS='...' python3 tools/shot1.py -> one frame of a scene
import asyncio,os
from playwright.async_api import async_playwright
async def main():
  W,H=map(int,os.environ.get('VP','844x390').split('x'))
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    pg=await (await b.new_context(viewport={'width':W,'height':H},has_touch=True,is_mobile=True)).new_page()
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto('http://127.0.0.1:8059/index.html?mute');await pg.wait_for_function('typeof scene!=="undefined"&&scene!==""',timeout=60000)
    await pg.evaluate(os.environ.get('GO','go("intro")'));await pg.wait_for_timeout(int(os.environ.get('WAIT','2500')))
    if os.environ.get('JS'):await pg.evaluate(os.environ['JS']);await pg.wait_for_timeout(600)
    await pg.screenshot(path=os.environ.get('OUT','/tmp/s.png'));print('errors',errs[:5]);await b.close()
asyncio.run(main())
