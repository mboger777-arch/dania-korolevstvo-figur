# /workspace/.venv3d/bin/python tools/trellis2.py IN.jpg OUTDIR  (microsoft/TRELLIS.2 HF Space, MIT)
import sys,shutil
from gradio_client import Client,handle_file
inp,out=sys.argv[1],sys.argv[2]
c=Client('microsoft/TRELLIS.2',verbose=False,token=__import__('os').environ.get('HF_TOKEN'))
c.predict(api_name='/start_session')
pi=c.predict(handle_file(inp),api_name='/preprocess_image');print('pre',pi)
shutil.copy(pi['path'] if isinstance(pi,dict) else pi,out+'/pre.png')
c.predict(handle_file(pi['path'] if isinstance(pi,dict) else pi),0,'1024',api_name='/image_to_3d');print('gen ok')
g=c.predict(100000,1024,api_name='/extract_glb');print(g)
shutil.copy(g[1] if g[1] else g[0],out+'/dania_raw.glb');print('saved')
