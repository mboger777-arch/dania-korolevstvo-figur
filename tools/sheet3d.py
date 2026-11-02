# python3 tools/sheet3d.py -> shots/proto/s_*.png : clean 3/4-front pose shots (hero at origin, facing +z)
import asyncio
from playwright.async_api import async_playwright
SET="{const P=PROTO,H=P.H,C=P.CAM;H.pos.set(0,0,1);H.vel.set(0,0,0);H.yaw=Math.PI;C.lock=1;C.yaw=Math.PI+.7;C.look.set(0,.66,1);C.pos.set(Math.sin(C.yaw)*2.6,1.1,1+Math.cos(C.yaw)*2.6);};"
RUN="const cy=PROTO.CAM.yaw;PROTO.IN.x=Math.sin(cy+Math.PI)*0+(-Math.cos(cy))*0;"
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    pg=await (await b.new_context(viewport={'width':915,'height':412},has_touch=True,is_mobile=True)).new_page()
    await pg.goto('http://127.0.0.1:8059/proto/hero.html');await pg.wait_for_function('window.PROTO&&window.PROTO_READY',timeout=120000)
    await pg.evaluate("window.MANUAL=1;PROTO.hideUI(1);PROTO.ballFar();PROTO.step(10)")
    async def s(n):await pg.screenshot(path=f'shots/proto/s_{n}.png');print(n,flush=True)
    async def reset(k=25):await pg.evaluate(SET+f"PROTO.step({k});"+SET+"PROTO.step(1)")
    await reset(40);await s('idle')
    # run toward +z : choose stick so world dir=(0,1): ix=dot(t,r), iy=-dot(t,f)
    await pg.evaluate(SET+"const cy=PROTO.CAM.yaw;PROTO.IN.x=Math.sin(.7);PROTO.IN.y=-Math.cos(.7);PROTO.step(14)")
    await pg.evaluate("const P=PROTO;P.H.pos.set(0,0,1);P.CAM.look.set(0,.66,1);P.CAM.pos.set(Math.sin(P.CAM.yaw)*2.6,1.1,1+Math.cos(P.CAM.yaw)*2.6);P.H.yaw=Math.PI;P.step(1,.001)");await s('run')
    await pg.evaluate("PROTO.IN.x=0;PROTO.IN.y=0");await reset()
    await pg.evaluate("PROTO.jump(0);PROTO.IN.jump=true;PROTO.step(10);PROTO.IN.jump=false;PROTO.step(4)");await s('jump')
    await pg.evaluate("for(let i=0;i<60&&PROTO.H.state!=='land';i++)PROTO.step(1);PROTO.step(1)");await reset()
    await pg.evaluate("PROTO.ballNear();PROTO.act();PROTO.step(9)");await s('kick');await pg.evaluate("PROTO.step(30);PROTO.ballFar()");await reset()
    await pg.evaluate("PROTO.act();PROTO.step(36)");await s('draw');await pg.evaluate("PROTO.step(40)");await reset()
    await pg.evaluate("PROTO.cheer();PROTO.step(11)");await s('cheer')
    await b.close()
asyncio.run(main())
