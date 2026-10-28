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
    await pg.wait_for_timeout(1600);await pg.mouse.up()
    for i in range(16):
      await pg.wait_for_timeout(500)
      if await ev('!!L.bridge'):break
    ok=await ev('!!L.bridge');res['beam']={'aim':a,'bridge':ok}
    # 3) фонарь на туман (гл.1)
    for i in range(60):
      await pg.wait_for_timeout(500);await skip()
      if await ev('GOAL.indexOf("туман")>=0&&!CUT'):break
    await ev('heroAt(0,22,0)');await pg.wait_for_timeout(1500);await skip();await pg.mouse.move(W*.8,H*.6);await pg.mouse.down();shot=False
    for i in range(60):
      await pg.wait_for_timeout(500)
      if not shot and i==3: await pg.screenshot(path=f'{out}/fog.png');shot=True
      if os.environ.get('DBG'):print(await ev('JSON.stringify([GOAL,CUT,!!TALK,INP.hold,INPMODE,HERO.x.toFixed(1),HERO.z.toFixed(1),HERO.yaw.toFixed(2),L.clouds.map(c=>c.alive?c.hp.toFixed(2):0),AIM.t&&AIM.t.kind])'))
      if await ev('!L.fog||L.clouds.every(c=>!c.alive)'):break
      if i%8==7: await pg.mouse.up();await skip();await pg.mouse.down()
    await pg.mouse.up();res['fog']={'cleared':await ev('L.clouds.every(c=>!c.alive)')}
    # 1) мяч в ворота (гл.0): Даня смотрит мимо ворот, тап по кольцу
    await ev('(()=>{const o=ACT.items.find(i=>i.k==="ball");heroAt(o.bx-.6,o.bz-1.5,1.1);ACT.pend.length=0})()');await pg.wait_for_timeout(500);await skip()
    await pg.wait_for_timeout(500);await pg.screenshot(path=f'{out}/ball.png');a=await aimxy();ok=False
    if a: await pg.touchscreen.tap(a[0],a[1]);await pg.wait_for_timeout(2500);ok=await ev('ACTLOG.includes("goal")')
    res['ball']={'aim':a,'goal':ok}
    # 4) меловая доска (гл.2): кнопка «Рисовать» тапом, дрожащий незамкнутый треугольник пальцем
    await start(2)
    await ev('(()=>{const o=ACT.items.find(i=>i.k==="chalk");heroAt(o.x,o.z-1,0);ACT.pend.length=0})()')
    for i in range(40):
      await pg.wait_for_timeout(300);await skip()
      if await ev('!!ACT.nearChalk&&INPMODE==="play"'):break
    bx=await ev('[640*S+OX+VVX,(safeB()-70)*S+OY+VVY]');await pg.touchscreen.tap(bx[0],bx[1]);await pg.wait_for_timeout(1200);await skip()
    if os.environ.get('DBG'):print('chalkdbg',await ev('JSON.stringify([!!ACT.nearChalk,HERO.mode,HERO.lock,CUT,INPMODE,HERO.x,HERO.z,!!TALK])'),bx)
    opened=await ev('!!ACT.draw');cd=await pg.context.new_cdp_session(pg);res_draw=[]
    import random
    for kind,V in [('tri',[[0,-1],[.95,.75],[-.95,.75]]),('circle',None),('quad',[[-.8,-.8],[.8,-.8],[.8,.8],[-.8,.8]])]:
      cb=await ev('(()=>{const b=chalkBoard();return[(b.x+b.w/2)*S+OX+VVX,(b.y+b.h/2+20)*S+OY+VVY,Math.min(b.w,b.h)*.3*S]})()');P=[]
      if V is None:
        for k in range(44):a=k/48*6.283;P.append((cb[0]+math.cos(a)*cb[2],cb[1]+math.sin(a)*cb[2]*.92))
      else:
        for k in range(len(V)):
          a,c=V[k],V[(k+1)%len(V)]
          for t in range(10):u=t/10;P.append((cb[0]+(a[0]+(c[0]-a[0])*u)*cb[2],cb[1]+(a[1]+(c[1]-a[1])*u)*cb[2]))
        P=P[:int(len(P)*.9)]
      P=[(x+random.uniform(-3,3),y+random.uniform(-3,3)) for x,y in P]
      await cd.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':P[0][0],'y':P[0][1]}]})
      for i,(x,y) in enumerate(P[1:]):
        await cd.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x,'y':y}]});await pg.wait_for_timeout(16)
        if kind=='tri' and i==len(P)-4:await pg.screenshot(path=f'{out}/chalk.png')
      await cd.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});await pg.wait_for_timeout(900)
      res_draw.append(await ev('ACTLOG.filter(s=>s.startsWith("draw:")).slice(-1)[0]||null'))
    await ev('chalkClose()');await pg.wait_for_timeout(400)
    res['chalk']={'opened':opened,'draws':res_draw,'ok':res_draw==['draw:tri','draw:circle','draw:quad']}
    # 5) пнуть фигуру в дырку (гл.3)
    await start(3);g0=await ev('GOAL');n=0
    for k in range(6):
      s=await ev('(()=>{const s=L.shapes.find(s=>s.alive&&!s.passed&&L.holes.some(h=>h.open&&!h.full&&h.accept(s.kind)))||L.shapes.find(s=>s.alive&&!s.passed);if(!s)return null;const p=s.b.position;heroAt(p.x+.8,p.z-2.2,-.9);return[p.x,p.z]})()')
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
