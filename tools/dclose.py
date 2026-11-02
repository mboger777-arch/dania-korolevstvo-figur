# python3 tools/dclose.py PREFIX : in-game close-ups of 3D Dania (front/side/back/head side) -> shots/dclose/PREFIX_*.png
import asyncio,sys,os
from playwright.async_api import async_playwright
O=sys.argv[1];os.makedirs('shots/dclose',exist_ok=True)
V=[('front',(0,1.3,3.2),(0,1.0,0),40),('side',(3.2,1.3,0),(0,1.0,0),40),('back',(0,1.4,-3.2),(0,1.0,0),40),('head',(1.1,1.75,.9),(0,1.6,0),30),('headf',(0,1.7,1.3),(0,1.6,0),30),('chest',(0,1.25,1.4),(0,1.1,0),30),('prof',(1.5,1.65,0),(0,1.6,0),30)]
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    pg=await (await b.new_context(viewport={'width':915,'height':412})).new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto('http://127.0.0.1:8059/index.html?mute&ch=0&nopad');await pg.wait_for_function('typeof scene!=="undefined"&&scene==="ch"&&DANIA',timeout=90000)
    await pg.wait_for_timeout(1500)
    await pg.evaluate("window.CLOSE=null;const _c=camStep;camStep=function(dt){if(!CLOSE)return _c(dt);const p=DANIA.root.position;CAM.position.set(p.x+CLOSE[0],p.y+CLOSE[1],p.z+CLOSE[2]);CAM.lookAt(p.x+CLOSE[3],p.y+CLOSE[4],p.z+CLOSE[5]);CAM.fov=CLOSE[6];CAM.updateProjectionMatrix()};DANIA.root.rotation.y=0;HERO.yaw=0;HERO.lock=true;for(const c of CHARS)if(c!==DANIA)c.root.visible=false;GOAL='';0")
    for n,cp,lk,f in V:
      await pg.evaluate(f"CLOSE=[{cp[0]},{cp[1]},{cp[2]},{lk[0]},{lk[1]},{lk[2]},{f}];DANIA.root.rotation.y=0;DANIA.vyaw=0;TALK=null;0")
      await pg.wait_for_timeout(900);await pg.screenshot(path=f'shots/dclose/{O}_{n}.png')
    print('errors',errs[:5]);await b.close()
asyncio.run(main())
