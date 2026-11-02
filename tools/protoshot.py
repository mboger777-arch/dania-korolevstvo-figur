# python3 tools/protoshot.py -> shots/proto/*.png ; MODE=video -> frames shots/proto/vid/
import asyncio,os
from playwright.async_api import async_playwright
URL='http://127.0.0.1:8059/proto/hero.html'
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    pg=await (await b.new_context(viewport={'width':915,'height':412},has_touch=True,is_mobile=True)).new_page()
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
    await pg.goto(URL);await pg.wait_for_function('window.PROTO',timeout=60000);await pg.wait_for_timeout(2500);await pg.evaluate('window.MANUAL=1;PROTO.step(30)')
    async def s(n):await pg.screenshot(path=f'shots/proto/{n}.png');print(n,flush=True)
    print('fps',await pg.evaluate('PROTO.fps'));await s('idle')
    await pg.evaluate('PROTO.IN.y=-1;PROTO.step(45)');await s('run');await pg.evaluate('PROTO.IN.y=0;PROTO.step(30)')
    await pg.evaluate('PROTO.jump(0);PROTO.IN.jump=true;PROTO.step(2)');await s('jump0');await pg.evaluate('PROTO.step(6)');await s('jump1');await pg.evaluate('PROTO.IN.jump=false;PROTO.step(16)');await s('jump2')
    for i in range(40):
      if await pg.evaluate('PROTO.H.state')=='land':break
      await pg.evaluate('PROTO.step(1)')
    await pg.evaluate('PROTO.step(1)');await s('jump3');await pg.evaluate('PROTO.step(25)')
    await pg.evaluate('PROTO.ballNear();PROTO.act();PROTO.step(6)');await s('kick0');await pg.evaluate('PROTO.step(3)');await s('kick1');await pg.evaluate('PROTO.step(25)')
    await pg.evaluate('PROTO.ballFar();PROTO.act();PROTO.step(38)');await s('draw');await pg.evaluate('PROTO.step(30)')
    await pg.evaluate('PROTO.cheer();PROTO.step(10)');await s('cheer')
    await pg.evaluate('PROTO.CAM.yaw=PROTO.H.yaw+.5;PROTO.CAM.dist=2.5;PROTO.step(50)');await s('front')
    print('fps',await pg.evaluate('PROTO.fps'));print('errors',errs[:5]);await b.close()
asyncio.run(main())
