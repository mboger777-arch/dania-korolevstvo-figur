# python3 tools/closeup.py OUTPREFIX : close-ups (face per emotion, wand hand, elbows) — hero at origin facing +z
import asyncio,sys
from playwright.async_api import async_playwright
O=sys.argv[1]
JS="""(a)=>{const P=PROTO;P.H.pos.set(0,0,0);P.H.vel.set(0,0,0);P.H.yaw=0;window.MANUAL=1;P.hideUI(1);P.ballFar();
 if(a.emo){window.FORCE_EMO=a.emo}P.step(a.n||1);const c=P.cam;c.position.set(...a.cp);c.lookAt(...a.lk);c.fov=a.fov||30;c.updateProjectionMatrix();P.render()}"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    pg=await (await b.new_context(viewport={'width':915,'height':412})).new_page()
    pg.on('console',lambda m:print('CONSOLE',m.text) if m.type=='error' else None);pg.on('pageerror',lambda e:print('PAGEERR',e))
    await pg.goto('http://127.0.0.1:8059/proto/hero.html');await pg.wait_for_function('window.PROTO&&window.PROTO_READY',timeout=120000)
    for emo in ['smile','happy','surprise','focus','determined','delight','blink']:
      await pg.evaluate(JS,{'emo':emo,'n':40,'cp':[0.12,1.0,1.05],'lk':[0,.93,0],'fov':24});await pg.screenshot(path=f'{O}_face_{emo}.png')
    await pg.evaluate("window.FORCE_EMO=null")
    await pg.evaluate(JS,{'n':30,'cp':[-.9,1.0,1.5],'lk':[-.15,.55,0],'fov':30});await pg.screenshot(path=f'{O}_hand.png')
    await pg.evaluate(JS,{'n':5,'cp':[1.2,1.2,2.6],'lk':[0,.6,0],'fov':32});await pg.screenshot(path=f'{O}_full.png')
    await pg.evaluate(JS,{'n':5,'cp':[0,1.0,-2.4],'lk':[0,.6,0],'fov':32});await pg.screenshot(path=f'{O}_back.png')
    await b.close()
asyncio.run(main())
