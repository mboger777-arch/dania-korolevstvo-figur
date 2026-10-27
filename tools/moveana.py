import json,sys,math
d=json.load(open(sys.argv[1]))
for k,L in d.items():
  L=[r for i,r in enumerate(L) if i==0 or r[6]>L[i-1][6]]
  sp=[math.hypot(L[i+1][0]-L[i][0],L[i+1][2]-L[i][2])/(L[i+1][6]-L[i][6]) for i in range(len(L)-1)]
  n=len(sp);mid=sp[n//4:n//2]
  m=sum(mid)/max(1,len(mid));jit=max(abs(a-m) for a in mid) if mid else 0
  t0=L[0][6];t90=next((round((L[i][6]-t0)*1000) for i,v in enumerate(sp) if v>0.9*m),None)
  stop=next((round((L[i][6]-t0)*1000) for i in range(n-1,0,-1) if sp[i]>.05),None)
  gfeet=max([abs(r[7]) for r in L if r[5]] or [0])
  print(f"{k:7s} frames={len(L)} v~{m:.2f} jit+-{jit:.2f} t90={t90}ms lastMove={stop}ms grounded|feet-ground|max={gfeet} air={sum(1 for r in L if not r[5])} maxY={max(r[1] for r in L)}")
