# Быстрая проверка загрузки: титул → глава 0, ошибки консоли
import asyncio
from playwright.async_api import async_playwright
async def m():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    pg=await b.new_page(viewport={'width':915,'height':412});e=[]
    pg.on('pageerror',lambda x:e.append(str(x)));pg.on('console',lambda m:m.type=='error' and e.append(m.text))
    await pg.goto('http://127.0.0.1:8059/index.html?test&mute');await pg.wait_for_function('typeof scene!=="undefined"&&scene==="title"',timeout=90000)
    await pg.evaluate('go("ch",0)');await pg.wait_for_timeout(5000);print('scene',await pg.evaluate('scene'),'win',await pg.evaluate('SC.ch.win'),'errs',e);await b.close()
asyncio.run(m())
