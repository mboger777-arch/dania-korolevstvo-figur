# Прогон глав автопилотом: VP=844x390 CH=0,1,2 python3 tools/play.py   (FULL=1 — вся игра через интерфейс)
import asyncio,os,sys,json,time
from playwright.async_api import async_playwright
BASE=os.environ.get('URL','http://127.0.0.1:8059/index.html')
FLAGS=os.environ.get('FLAGS','test&fast&mute')
async def main():
  W,H=map(int,os.environ.get('VP','844x390').split('x'));out=f'shots/{W}x{H}';os.makedirs(out,exist_ok=True)
  CH=[int(c) for c in os.environ.get('CH','0').split(',')];SHOT=float(os.environ.get('SHOT','4'));TMO=float(os.environ.get('TMO','300'))
  rep={'vp':f'{W}x{H}','chapters':[]}
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    ctx=await b.new_context(viewport={'width':W,'height':H},has_touch=True,is_mobile=True,device_scale_factor=1)
    pg=await ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append('PAGE '+str(e)));pg.on('console',lambda m:errs.append(m.type+' '+m.text) if m.type in('error','warning') else None)
    FULL=os.environ.get('FULL')=='1'
    async def tap(bid,tmo=30):
      await pg.wait_for_function(f'UI.some(u=>u.id==="{bid}")',timeout=tmo*1000)
      x,y=await pg.evaluate(f'(()=>{{const u=UI.find(u=>u.id==="{bid}");return[u.x*S+OX+VVX,u.y*S+OY+VVY]}})()')
      await pg.touchscreen.tap(x,y)
    if FULL:
      await pg.goto(BASE+'?'+FLAGS);await pg.wait_for_function('typeof scene!=="undefined"&&scene==="title"',timeout=60000)
      await pg.screenshot(path=f'{out}/a_title.png');await tap('play')
      await pg.wait_for_function('scene==="intro"',timeout=10000);t0=time.time();k=0
      while True:
        await pg.wait_for_timeout(1500);sc=await pg.evaluate('scene')
        if sc!='intro':break
        k+=1;await pg.screenshot(path=f'{out}/a_intro{k:02d}.png')
        if time.time()-t0>120:raise SystemExit('intro stuck')
      await pg.wait_for_function('scene==="map"',timeout=10000);await pg.wait_for_timeout(800);await pg.screenshot(path=f'{out}/a_map0.png')
      CH=list(range(7))
    else:
      await pg.goto(BASE+'?'+FLAGS+'&map');await pg.wait_for_function('typeof scene!=="undefined"&&scene==="map"',timeout=60000)
    for ci in CH:
      [os.remove(f) for f in __import__('glob').glob(f'{out}/c{ci}_*.png')]
      await pg.evaluate('G.mistakes=0;G.botTimeouts=0;VLOG=[];ACTLOG=[]')
      if FULL: await pg.wait_for_function('!TALK',timeout=30000);await tap('ch'+str(ci));await pg.wait_for_function('scene==="ch"',timeout=10000)
      else: await pg.evaluate(f'go("ch",{ci})')
      t0=time.time();n=0;last=-99;bad=[];fps=[];maxair=0
      while time.time()-t0<TMO:
        await pg.wait_for_timeout(250)
        st=await pg.evaluate('JSON.stringify({sc:scene,a:audit3D(),fps:FPS,talk:TALK&&TALK.k,cut:CUT,goal:GOAL,err:TASK.err,hero:[HERO.x.toFixed(1),HERO.z.toFixed(1),HERO.mode]})');st=json.loads(st)
        if st['sc']!='ch':break
        fps.append(st['fps'])
        for c in st['a']:
          if not c['air'] and not c['sit'] and abs(c['gap'])>0.06: bad.append((round(time.time()-t0,1),c['n'],c['gap'],st['hero']))
          if c['n']=='dania': maxair=max(maxair,c['airT'])
        if time.time()-last>SHOT:
          last=time.time();n+=1;await pg.screenshot(path=f'{out}/c{ci}_{n:02d}.png')
      ok=st['sc']=='map';el=round(time.time()-t0,1)
      info=json.loads(await pg.evaluate('JSON.stringify({m:G.mistakes||0,bt:G.botTimeouts||0,done:SV.done,vl:VLOG,acts:ACTLOG})'))
      vl=info['vl'];cut=[] if 'fast' in FLAGS else [(v['k'],round((v['t1']-v['t0'])/1000,2),v['dur']) for v in vl if 't1' in v and v['dur'] and (v['t1']-v['t0'])/1000<v['dur']-0.15]
      noend=[v['k'] for v in vl[:-1] if 't1' not in v]
      r={'ch':ci,'ok':ok,'sec':el,'mistakes':info['m'],'botTimeouts':info['bt'],'feetBad':len(bad),'feetEx':bad[:5],'maxAir':maxair,'lines':len(vl),'cut':cut,'noend':noend,'fpsMin':round(min(fps),1) if fps else 0,'fpsAvg':round(sum(fps)/len(fps),1) if fps else 0,'acts':info.get('acts',[]),'last':st}
      rep['chapters'].append(r);print(json.dumps(r,ensure_ascii=False),flush=True)
      if not ok: await pg.screenshot(path=f'{out}/c{ci}_FAIL.png')
    if FULL:
      await pg.wait_for_timeout(1500);await pg.screenshot(path=f'{out}/a_map_end.png')
      await pg.reload();await pg.wait_for_function('typeof scene!=="undefined"&&scene==="title"',timeout=60000);await pg.wait_for_timeout(1500)
      rep['persist']=json.loads(await pg.evaluate('JSON.stringify({done:SV.done,medal:SV.medal,intro:SV.intro})'));print('persist',rep['persist'])
      await pg.screenshot(path=f'{out}/a_title_end.png')
    rep['errors']=errs[:30];print('errors:',errs[:30])
    json.dump(rep,open(f'{out}/report_ch.json','w'),ensure_ascii=False,indent=1)
    await b.close()
asyncio.run(main())
