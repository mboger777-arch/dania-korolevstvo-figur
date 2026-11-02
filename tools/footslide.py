# python3 tools/footslide.py [URL] -> per gait: stance-foot horizontal slip speed vs body speed (proto/hero.html PROTO API)
import asyncio,sys,json
from playwright.async_api import async_playwright
URL=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8059/proto/hero.html'
JS="""(mag)=>{const P=PROTO,H=P.H;H.pos.set(0,0,0);H.vel.set(0,0,0);P.IN.x=0;P.IN.y=-mag;P.step(60);const v=PROTO.cam.position.clone();const out=[];
 const f=[P.B['footL']||P.B['foot.L'],P.B['footR']];for(let i=0;i<90;i++){P.step(1,1/60);const r=[];for(const b of f){b.getWorldPosition(v);r.push([v.x,v.y,v.z])}out.push([r,[H.pos.x,H.pos.z]])}P.IN.y=0;return out}"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    pg=await (await b.new_context(viewport={'width':400,'height':300})).new_page()
    await pg.goto(URL);await pg.wait_for_function('window.PROTO&&window.PROTO_READY',timeout=120000)
    await pg.evaluate("window.MANUAL=1;PROTO.ballFar();0")
    for name,mag in (('walk',.45),('run',1.0)):
      d=await pg.evaluate(JS,mag);import math
      body=[math.hypot(d[i+1][1][0]-d[i][1][0],d[i+1][1][1]-d[i][1][1])*60 for i in range(len(d)-1)]
      slips=[]
      for k in (0,1):
        ys=[r[0][k][1] for r in d];lo=min(ys)
        for i in range(len(d)-1):
          if d[i][0][k][1]<lo+.012: slips.append(math.hypot(d[i+1][0][k][0]-d[i][0][k][0],d[i+1][0][k][2]-d[i][0][k][2])*60)
      slips.sort();print(name,'body %.2f m/s'%(sum(body)/len(body)),'stance slip median %.3f p90 %.3f m/s (n=%d)'%(slips[len(slips)//2],slips[int(len(slips)*.9)],len(slips)))
    await b.close()
asyncio.run(main())
