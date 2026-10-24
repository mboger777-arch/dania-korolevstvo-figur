# Проверка голоса в реальном режиме (без ?fast, со звуком): вся игра через интерфейс, по VLOG — ни одна реплика не оборвана
# (t1-t0 >= длительность файла) и каждая дошла до конца. Результат: поля cut/noend в shots/<vp>/report_ch.json
import os,subprocess,sys
env=dict(os.environ,FULL='1',FLAGS='test',TMO=os.environ.get('TMO','900'),SHOT=os.environ.get('SHOT','30'))
sys.exit(subprocess.call([sys.executable,os.path.join(os.path.dirname(__file__),'play.py')],env=env))
