# python3 tools/shot5.py OUT.png "jsBefore" ang d cy ly fov [W H]  (proto/hero.html, server :8059)
import asyncio,sys
from playwright.async_api import async_playwright
a=sys.argv[1:];OUT,JS=a[0],a[1];ang,d,cy,ly,fov=map(float,a[2:7]);W,H=(int(a[7]),int(a[8])) if len(a)>8 else (440,560)
CAM="""(a)=>{const P=PROTO,h=P.H.pos,c=P.cam,y=P.H.yaw+a.ang;c.position.set(h.x+Math.sin(y)*a.d,a.cy+h.y,h.z+Math.cos(y)*a.d);c.lookAt(h.x,a.ly+h.y,h.z);c.fov=a.fov;c.aspect=innerWidth/innerHeight;c.updateProjectionMatrix();P.render()}"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    pg=await (await b.new_context(viewport={'width':W,'height':H})).new_page()
    await pg.goto('http://127.0.0.1:8059/proto/hero.html'+__import__('os').environ.get('Q',''));await pg.wait_for_function('window.PROTO&&window.PROTO_READY',timeout=120000)
    await pg.evaluate("window.MANUAL=1;PROTO.hideUI(1);PROTO.ballFar();PROTO.step(10);{const P=PROTO,H=P.H;H.pos.set(0,0,1);H.vel.set(0,0,0);H.yaw=Math.PI;P.CAM.lock=1};PROTO.step(30);"+JS)
    await pg.evaluate(CAM,{'ang':ang,'d':d,'cy':cy,'ly':ly,'fov':fov});await pg.screenshot(path=OUT);await b.close()
asyncio.run(main())
