# VP=844x390 python3 tools/shot.py "name:js" ...  -> shots/<vp>/<name>.png
import asyncio,os,sys
from playwright.async_api import async_playwright
URL=os.environ.get('URL','http://127.0.0.1:8059/index.html?mute')
async def main():
  W,H=map(int,os.environ.get('VP','844x390').split('x'));out=f'shots/{W}x{H}';os.makedirs(out,exist_ok=True)
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    ctx=await b.new_context(viewport={'width':W,'height':H},has_touch=True,is_mobile=True,device_scale_factor=1)
    pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append(m.text) if m.type in('error','warning') else None)
    await pg.goto(URL);await pg.wait_for_function('typeof scene!=="undefined"&&scene!==""',timeout=60000)
    for a in sys.argv[1:]:
      nm,_,js=a.partition(':')
      if js:await pg.evaluate(js)
      await pg.wait_for_timeout(int(os.environ.get('WAIT','2000')))
      await pg.screenshot(path=f'{out}/{nm}.png')
      print(nm, await pg.evaluate('JSON.stringify({sc:scene,fps:FPS|0,talk:TALK&&TALK.k,a:audit3D().map(c=>c.n+":"+c.gap.toFixed(2)+"/"+(c.hPx|0))})'))
    print('errors:',errs[:10])
    await b.close()
asyncio.run(main())
