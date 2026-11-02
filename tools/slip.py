# python3 tools/slip.py : deterministic stance-foot slip of in-game 3D Dania (d3update at 60 Hz, root moved at speed sp). slip/body -> 0 is ideal
import asyncio,math
from playwright.async_api import async_playwright
JS="""(sp)=>{const c=DANIA,v=new THREE.Vector3(),out=[];const fs=[D3.B.footL,D3.B.footR];c.anim='run';c.cheerT=-9;c.kickT=-9;c.hold=false;c.root.rotation.y=0;c.vyaw=0;let z=0;const dt=1/60;
 for(let i=0;i<240;i++){z+=sp*dt;c.root.position.set(0,0,z);c.anim='run';d3update(c,dt,sp);c.root.updateMatrixWorld(true);if(i>=120){const q=[];for(const b of fs){b.getWorldPosition(v);q.push([v.y,v.z])}out.push(q)}}return out}"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    pg=await (await b.new_context(viewport={'width':320,'height':200})).new_page()
    await pg.goto('http://127.0.0.1:8059/index.html?mute&ch=0&nopad');await pg.wait_for_function('typeof scene!=="undefined"&&scene==="ch"&&DANIA&&D3.ok',timeout=90000)
    await pg.evaluate("cancelAnimationFrame&&0;window.SCN=null;DANIA.update=()=>{};0")
    for sp in (2.0,3.0,4.5,6.0):
      d=await pg.evaluate(JS,sp);res=[]
      for k in (0,1):
        lo=min(r[k][0] for r in d);sl=[abs(d[i+1][k][1]-d[i][k][1])*60 for i in range(len(d)-1) if d[i][k][0]<lo+.015]
        sl.sort();res.append(round(sl[len(sl)//2],2) if sl else None)
      print('speed',sp,'stance slip L/R',res,'ratio',[round(x/sp,2) for x in res if x is not None])
    await b.close()
asyncio.run(main())
