# Тач-прицел: VP=844x390 python tools/aimtest.py -> бьёт по целям тапом в каждой активности
import asyncio,os,json,math
from playwright.async_api import async_playwright
URL=os.environ.get('URL','http://127.0.0.1:8059/index.html?mute&map')
async def main():
  W,H=map(int,os.environ.get('VP','844x390').split('x'));out=os.environ.get('OUT',f'shots/aim_{W}x{H}');os.makedirs(out,exist_ok=True);res={}
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    pg=await (await b.new_context(viewport={'width':W,'height':H},has_touch=True,is_mobile=True)).new_page()
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto(URL);await pg.wait_for_function('typeof scene!=="undefined"&&scene==="map"',timeout=60000)
    ev=pg.evaluate
    async def start(ci):
      await ev(f'ACTLOG=[];go("ch",{ci})')
      for i in range(200):
        await pg.wait_for_timeout(500)
        if await ev('(()=>{if(TALK)skipTalk();return scene==="ch"&&!CUT&&!TALK&&GOAL!==""&&HERO.mode!=="cut"})()'):break
      await pg.wait_for_timeout(600);await ev('window.L=LEVELS[SC.ch.i]')
    async def aimxy():
      return await ev('(()=>{if(!aimLive())return null;const t=AIM.t,s=toScreen(t.x,t.y,t.z);return s.vis?[s.x*S+OX+VVX,s.y*S+OY+VVY,t.kind,!!t.ready]:null})()')
    async def skip():
      await ev('if(TALK)skipTalk()')
    # 2) луч А→Б (гл.1): держим палец справа, джойстик не трогаем — Даня доворачивается сам
    await start(0)
    await ev('heroAt(L.A.x,L.A.z,Math.atan2(L.B.x-L.A.x,L.B.z-L.A.z)+.75)');await pg.wait_for_timeout(1200);await skip()
    await pg.mouse.move(W*.8,H*.6);await pg.mouse.down();await pg.wait_for_timeout(1400);await pg.screenshot(path=f'{out}/beam.png');a=await aimxy()
    for i in range(16):
      await pg.wait_for_timeout(500)
      if await ev('!!L.bridge'):break
    await pg.mouse.up();ok=await ev('!!L.bridge');res['beam']={'aim':a,'bridge':ok}
    # 3) фонарь на туман (гл.1)
    for i in range(60):
      await pg.wait_for_timeout(500);await skip()
      if await ev('GOAL.indexOf("туман")>=0&&!CUT'):break
    await ev('heroAt(0,22,0)');await pg.wait_for_timeout(1500);await skip();await pg.mouse.move(W*.8,H*.6);await pg.mouse.down();shot=False
    for i in range(60):
      await pg.wait_for_timeout(500)
      if not shot and i==3: await pg.screenshot(path=f'{out}/fog.png');shot=True
      if await ev('!L.fog||L.clouds.every(c=>!c.alive)'):break
      if i%8==7: await pg.mouse.up();await skip();await pg.mouse.down()
    await pg.mouse.up();res['fog']={'cleared':await ev('L.clouds.every(c=>!c.alive)')}
    # 1) мяч в ворота (гл.0): Даня смотрит мимо ворот, тап по кольцу
    await ev('(()=>{const o=ACT.items.find(i=>i.k==="ball");heroAt(o.bx-.6,o.bz-1.5,1.1);ACT.pend.length=0})()');await pg.wait_for_timeout(500);await skip()
    await pg.wait_for_timeout(500);await pg.screenshot(path=f'{out}/ball.png');a=await aimxy();ok=False
    if a: await pg.touchscreen.tap(a[0],a[1]);await pg.wait_for_timeout(2500);ok=await ev('ACTLOG.includes("goal")')
    res['ball']={'aim':a,'goal':ok}
    # 4) пнуть фигуру в дырку (гл.3)
    await start(3);g0=await ev('GOAL');n=0
    for k in range(6):
      s=await ev('(()=>{const s=L.shapes.find(s=>s.alive&&!s.passed);if(!s)return null;const p=s.b.position;heroAt(p.x+.8,p.z-2.2,-.9);return[p.x,p.z]})()')
      if not s:break
      await pg.wait_for_timeout(700);await skip()
      if k==0: await pg.screenshot(path=f'{out}/shape.png')
      a=await aimxy()
      if a and a[2]=='shape': await pg.touchscreen.tap(a[0],a[1]);n+=1
      await pg.wait_for_timeout(2500);await skip()
      if await ev(f'GOAL!=={json.dumps(g0)}'):break
    res['shape']={'taps':n,'advanced':await ev(f'GOAL!=={json.dumps(g0)}')}
    # 5) Кривуля: отбить комок тапом по кольцу (гл.6)
    await start(6);g0=await ev('GOAL');taps=0;shot=False
    for i in range(400):
      await pg.wait_for_timeout(150)
      a=await aimxy()
      if a and a[2]=='boss' and a[3]:
        if not shot: await pg.screenshot(path=f'{out}/boss.png');shot=True
        await pg.touchscreen.tap(a[0],a[1]);taps+=1;await pg.wait_for_timeout(500)
      if await ev(f'GOAL!=={json.dumps(g0)}&&GOAL!==""'):break
      await skip()
    res['boss']={'taps':taps,'advanced':await ev(f'GOAL!=={json.dumps(g0)}'),'goal':await ev('GOAL')}
    res['errors']=errs[:5];print(json.dumps(res,ensure_ascii=False));await b.close()
asyncio.run(main())
