# python3 tools/protovid.py -> /workspace/dania_3d.mp4
import asyncio,os,subprocess
from playwright.async_api import async_playwright
O='shots/proto/vid3d';import shutil;shutil.rmtree(O,True);os.makedirs(O,exist_ok=True)
SEQ=[('',45,'idle'),('PROTO.IN.y=-.5',30,'walk'),('PROTO.IN.y=-1',30,''),('PROTO.IN.y=-1;PROTO.IN.x=.7',40,''),('PROTO.IN.x=0;PROTO.IN.y=0',20,''),('PROTO.CAM.lock=1;PROTO.CAM.yaw=PROTO.H.yaw+.75;',20,''),
 ('PROTO.CAM.lock=1;PROTO.CAM.yaw=PROTO.H.yaw+.75;PROTO.jump(0);PROTO.IN.jump=false',35,'jump'),('PROTO.jump(0);PROTO.IN.jump=true',10,'jump-high'),('PROTO.IN.jump=false',35,''),
 ('PROTO.CAM.lock=1;PROTO.CAM.yaw=PROTO.H.yaw+.75;PROTO.ballNear();PROTO.act()',45,'kick'),('PROTO.CAM.lock=1;PROTO.CAM.yaw=PROTO.H.yaw+.75;PROTO.ballFar();PROTO.act()',60,'draw'),('PROTO.CAM.lock=1;PROTO.CAM.yaw=PROTO.H.yaw+.75;PROTO.cheer()',45,'cheer'),('PROTO.CAM.lock=0;PROTO.IN.y=.6;PROTO.IN.x=.8',45,'run-front'),('PROTO.IN.y=0;PROTO.IN.x=0;PROTO.CAM.lock=1;PROTO.CAM.yaw=PROTO.H.yaw+.75;',40,'')]
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    pg=await (await b.new_context(viewport={'width':915,'height':412},has_touch=True,is_mobile=True)).new_page()
    await pg.goto('http://127.0.0.1:8059/proto/hero.html');await pg.wait_for_function('window.PROTO&&window.PROTO_READY',timeout=120000);await pg.wait_for_timeout(2000)
    await pg.evaluate('window.MANUAL=1;PROTO.step(20)');n=0
    for js,fr,lab in SEQ:
      if js:await pg.evaluate(js)
      for i in range(fr):
        await pg.evaluate('PROTO.step(1)');await pg.screenshot(path=f'{O}/f{n:04d}.png');n+=1
    await b.close()
  subprocess.run(['ffmpeg','-y','-loglevel','error','-framerate','30','-i',f'{O}/f%04d.png','-c:v','libx264','-pix_fmt','yuv420p','-vf','scale=916:412','/workspace/dania_3d.mp4'],check=True);print('frames',n)
asyncio.run(main())
