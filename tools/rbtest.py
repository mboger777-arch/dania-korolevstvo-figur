# python3 tools/rbtest.py : бот открывает книжку правил настоящими кликами, листает, нажимает правило (голос), закрывает; ошибки и перекрытие репликой
import asyncio,os
from playwright.async_api import async_playwright
OUT='shots/915x412';os.makedirs(OUT,exist_ok=True)
async def click(pg,id):
  xy=await pg.evaluate("(id)=>{const b=UI.find(u=>u.id===id);if(!b)return null;return [b.x*S+OX+VVX,b.y*S+OY+VVY]}",id)
  if not xy:return False
  await pg.mouse.click(xy[0],xy[1]);await pg.wait_for_timeout(500);return True
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required'])
    pg=await (await b.new_context(viewport={'width':915,'height':412})).new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.goto('http://127.0.0.1:8059/index.html?map');await pg.wait_for_function('typeof scene!=="undefined"&&scene==="map"',timeout=90000)
    await pg.evaluate('SV.done[7]=1;SV.done[0]=1;SV.done[1]=1;SV.done[2]=1');await pg.wait_for_function('!!TALK',timeout=20000)
    r={}
    r['open']=await click(pg,'rbook');r['book']=await pg.evaluate('RBOOK');r['talkAfterOpen']=await pg.evaluate('!!TALK')
    await pg.screenshot(path=OUT+'/rb_1.png')
    r['rule']=await click(pg,'rule0');await pg.wait_for_timeout(600);r['talkRule']=await pg.evaluate('TALK&&TALK.k');await pg.screenshot(path=OUT+'/rb_2.png')
    ids=await pg.evaluate("UI.map(u=>u.id)");r['ids']=ids
    for nx in ('rbnext','next','rbn'):
      if nx in ids:r['next']=await click(pg,nx);break
    await pg.wait_for_timeout(400);r['page']=await pg.evaluate('RBPG');await pg.screenshot(path=OUT+'/rb_3.png')
    for cl in ('rbx','rbclose','x','close'):
      if cl in ids:r['close']=await click(pg,cl);break
    r['closed']=not await pg.evaluate('RBOOK');print(r,'errs',errs)
    await b.close()
asyncio.run(main())
