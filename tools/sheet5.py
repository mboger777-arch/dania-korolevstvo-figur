# python3 tools/sheet4.py -> shots/proto/v5/*.png + sheets/v5.png (phone sheet ~1600x1000)
import asyncio,os,subprocess
from playwright.async_api import async_playwright
O='shots/proto/v5';os.makedirs(O,exist_ok=True)
SET="{const P=PROTO,H=P.H,C=P.CAM;H.pos.set(0,0,1);H.vel.set(0,0,0);H.yaw=Math.PI;C.lock=1;C.yaw=Math.PI+.7;C.look.set(0,.66,1);C.pos.set(Math.sin(C.yaw)*2.6,1.1,1+Math.cos(C.yaw)*2.6);};"
CAM="""(a)=>{const P=PROTO,h=P.H.pos,c=P.cam,y=P.H.yaw+a.ang;c.position.set(h.x+Math.sin(y)*a.d,a.cy+h.y*1.0,h.z+Math.cos(y)*a.d);c.lookAt(h.x,a.ly+h.y*1.0,h.z);c.fov=a.fov;c.aspect=innerWidth/innerHeight;c.updateProjectionMatrix();P.render()}"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    pg=await (await b.new_context(viewport={'width':440,'height':560})).new_page()
    await pg.goto('http://127.0.0.1:8059/proto/hero.html');await pg.wait_for_function('window.PROTO&&window.PROTO_READY',timeout=120000)
    await pg.evaluate("window.MANUAL=1;PROTO.hideUI(1);PROTO.ballFar();PROTO.step(10)")
    async def s(n,ang=-.6,d=1.75,cy=.85,ly=.6,fov=40):await pg.evaluate(CAM,{'ang':ang,'d':d,'cy':cy,'ly':ly,'fov':fov});await pg.screenshot(path=f'{O}/{n}.png');print(n,flush=True)
    async def reset(k=25):await pg.evaluate(SET+f"PROTO.step({k});"+SET+"PROTO.step(1)")
    await reset(40);await s('face_front',ang=0,d=1.0,cy=.95,ly=.92,fov=26);await s('full_front',ang=0,d=2.3,cy=.62,ly=.56,fov=36);await s('idle');await s('hero',d=2.0,ly=.6,fov=38)
    await pg.evaluate(SET+"PROTO.IN.x=Math.sin(.7);PROTO.IN.y=-Math.cos(.7);PROTO.step(16)");await pg.evaluate("PROTO.step(1,.001)");await s('run',ang=-.9)
    await pg.evaluate("PROTO.IN.x=0;PROTO.IN.y=0");await reset()
    await pg.evaluate("PROTO.jump(0);PROTO.IN.jump=true;PROTO.step(10);PROTO.IN.jump=false;PROTO.step(4)");await s('jump',d=2.0)
    await pg.evaluate("for(let i=0;i<60&&PROTO.H.state!=='land';i++)PROTO.step(1);PROTO.step(1)");await reset()
    await pg.evaluate("PROTO.ballNear();PROTO.act();PROTO.step(9)");await s('kick',ang=-1.0);await pg.evaluate("PROTO.step(30);PROTO.ballFar()");await reset()
    await pg.evaluate("PROTO.act();PROTO.step(36)");await s('draw',ang=-.3,d=1.9,ly=.7);await pg.evaluate("PROTO.step(40)");await reset()
    await pg.evaluate("PROTO.cheer();PROTO.step(11)");await s('cheer',ang=-.4,d=1.9,ly=.7);await pg.evaluate("PROTO.step(60)");await reset()
    for e in ['smile','happy','surprise','focus','determined','delight','blink']:
      await pg.evaluate(f"window.FORCE_EMO='{e}';PROTO.step(3)");await s('emo_'+e,ang=-.3,d=.9,cy=.98,ly=.93,fov=30)
    await pg.evaluate("window.FORCE_EMO=null");await reset()
    await s('back',ang=3.0,d=2.0,fov=38)
    await b.close()
asyncio.run(main())
