# Тест голоса при быстрой игре (аналог voicetest.py из Таси): бот проходит всю игру через интерфейс
# в реальном времени со звуком (без ?fast), потом по VLOG: задержка старта реплики от момента, когда она
# могла начаться (max(запрос, конец предыдущей)), обрывы заданий/истории (p>=2 и файл не доигран), наложения.
# PASS: lat_max<=0.5 с, нет обрывов p>=2, нет «стухших» заданий. Использование: VP=915x412 python3 tools/voicetest.py [--analyse]
import os,sys,json,glob,subprocess
VP=os.environ.get('VP','915x412');OUT=f'shots/{VP}'
if '--analyse' not in sys.argv:
  env=dict(os.environ,FULL='1',FLAGS='test&notour',VP=VP,TMO=os.environ.get('TMO','900'),SHOT='20')
  for f in glob.glob(f'{OUT}/vlog_*.json'):os.remove(f)
  subprocess.call([sys.executable,os.path.join(os.path.dirname(__file__),'play.py')],env=env)
allok=True;tot=[]
for f in sorted(glob.glob(f'{OUT}/vlog_*.json')):
  V=json.load(open(f));pl=[v for v in V if 't0' in v];late=[];cuts=[];lat=[];over=[]
  for i,v in enumerate(pl):
    ready=max(v.get('tr',v['t0']),v.get('pe',0));st=v.get('tp')
    if st is None:
      if v.get('dur') and i<len(pl)-1:cuts.append(v['k']+':noplay')  # последняя запись могла только начаться при снимке лога
      continue
    d=(st-ready)/1000;lat.append(d)
    if d>.5:late.append((v['k'],round(d,2)))
    if v.get('p',2)>=2 and v.get('dur') and ('t1' not in v and i<len(pl)-1 or v.get('ended') is False and v.get('how')!='skip'):cuts.append(v['k'])
    if i and 't1' in pl[i-1] and pl[i-1]['t1']>v['t0']+1:over.append(v['k'])
  drops=[v['k'] for v in V if v.get('drop') and v.get('k','')[:1]!='g' and v.get('p',1)>1]
  stale=[v['k'] for v in V if v.get('drop')=='stale']
  lat.sort();ok=(not late) and not cuts and not over
  allok&=ok;tot+=lat
  r=dict(f=os.path.basename(f),played=len(pl),lat_med=round(lat[len(lat)//2],3) if lat else None,lat_max=round(lat[-1],3) if lat else None,late=late,task_cuts=cuts,overlaps=over,stale_praise=len(stale),interrupted_praise=sum(1 for v in V if v.get('cut')=='interrupt'))
  print('PASS' if ok else 'FAIL',json.dumps(r,ensure_ascii=False),flush=True)
tot.sort();print('TOTAL','PASS' if allok else 'FAIL',len(tot),'реплик, медиана',round(tot[len(tot)//2],3) if tot else '-','макс',round(tot[-1],3) if tot else '-')
