# Размер героев на экране по главам: python3 tools/camprobe.py [VP] [prefix]
import asyncio,sys,json
from playwright.async_api import async_playwright
async def main():
  W,H=map(int,(sys.argv[1] if len(sys.argv)>1 else '844x390').split('x'));pre=sys.argv[2] if len(sys.argv)>2 else '/tmp/cp'
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    pg=await b.new_page(viewport={'width':W,'height':H});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)+' '+str(getattr(e,'stack',''))[:300]));pg.on('console',lambda m:errs.append('C:'+m.text) if m.type in('error','warning') else None)
    await pg.goto('http://127.0.0.1:8059/index.html?test&mute&fast&map');await pg.wait_for_function('typeof scene!=="undefined"&&scene==="map"',timeout=60000)
    for i in range(7):
      await pg.evaluate(f'go("ch",{i})')
      await pg.wait_for_timeout(1200);await pg.screenshot(path=f'{pre}_{i}_cut.png')
      a=await pg.evaluate('JSON.stringify({cut:!!(SCN&&SCN.cut),a:audit3D().map(x=>[x.n,x.hPx]),H:innerHeight})')
      try: await pg.wait_for_function('SCN&&!SCN.cut&&INPMODE==="play"',timeout=60000)
      except Exception as e: print('nowait',i)
      await pg.wait_for_timeout(1500);await pg.screenshot(path=f'{pre}_{i}_play.png')
      b2=await pg.evaluate('JSON.stringify({a:audit3D().map(x=>[x.n,x.hPx]),H:innerHeight,goal:GOAL})')
      print(i,a,b2)
    print('errors',errs[:5])
asyncio.run(main())
