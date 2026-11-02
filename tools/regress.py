# Регрессия: старые сейвы b9, битый сейв, откат на старого Даню без 3D, альбом и книжка правил на карте
import asyncio,json,os
from playwright.async_api import async_playwright
B='http://127.0.0.1:8059/index.html';OUT='shots/regress';os.makedirs(OUT,exist_ok=True)
ARGS=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']
async def click(pg,id):
  xy=await pg.evaluate("(id)=>{const b=UI.find(u=>u.id===id);if(!b)return null;return [b.x*S+OX+VVX,b.y*S+OY+VVY]}",id)
  if not xy:return False
  await pg.mouse.click(xy[0],xy[1]);await pg.wait_for_timeout(700);return True
async def case(b,name,save,block3d=False,ch=None):
  ctx=await b.new_context(viewport={'width':915,'height':412});pg=await ctx.new_page();errs=[]
  pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
  if block3d: await pg.route('**/dania.glb*',lambda r:r.abort())
  if save is not None: await ctx.add_init_script("localStorage.setItem('figur59',%s)"%json.dumps(save))
  await pg.goto(B+'?test&mute&notour');await pg.wait_for_function('typeof scene!=="undefined"&&scene==="title"',timeout=90000)
  r={'case':name}
  await click(pg,'play');await pg.wait_for_timeout(2500)
  await pg.evaluate('if(typeof skipTalk==="function"&&TALK)skipTalk()');
  if ch is not None:
    await pg.evaluate(f'go("ch",{ch})');await pg.wait_for_timeout(15000)
    r['d3ok']=await pg.evaluate('D3.ok');r['dania']=await pg.evaluate('!!DANIA&&!!DANIA.g||!!DANIA')
  else:
    await pg.evaluate('go("map")');await pg.wait_for_timeout(2500)
    r['done']=await pg.evaluate('SV.done');r['btns']=await pg.evaluate('UI.map(u=>u.id).filter(i=>/^ch|album|rbook/.test(i))')
    r['album']=await click(pg,'album');await pg.screenshot(path=f'{OUT}/{name}_album.png');r['albumOpen']=await pg.evaluate('ALBUM')
    await click(pg,'albX');r['rbook']=await click(pg,'rbook');r['rbOpen']=await pg.evaluate('RBOOK');await pg.screenshot(path=f'{OUT}/{name}_rbook.png')
  await pg.screenshot(path=f'{OUT}/{name}.png');r['scene']=await pg.evaluate('scene');r['errors']=errs;print(json.dumps(r,ensure_ascii=False),flush=True);await ctx.close()
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=ARGS)
    await case(b,'fresh',None)
    await case(b,'b9_mid',json.dumps({'done':[1,1,1,0,0,0,0],'intro':1,'medal':0}))
    await case(b,'b9_full',json.dumps({'done':[1,1,1,1,1,1,1],'intro':1,'medal':1}))
    await case(b,'b9_short',json.dumps({'done':[1,1],'intro':1}))
    await case(b,'broken','{oops')
    await case(b,'no3d',None,block3d=True,ch=0)
    await b.close()
asyncio.run(main())
