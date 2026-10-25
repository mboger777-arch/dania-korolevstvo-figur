'use strict';
// ===== автопилот теста (?test): сначала ошибка, потом исправление — на каждом задании =====
let BSTEER=null,BTOK=0,BAIM=null,BGOAL=null,BSLED=null,BLASTN=0;
async function bUntil(f,tmo){const tok=BTOK,t0=T;await until(()=>tok!==BTOK||f()||(tmo&&T-t0>tmo));if(tok!==BTOK)throw STALE;if(tmo&&T-t0>tmo){G.botTimeouts=(G.botTimeouts||0)+1;console.warn('bot timeout',scene,SC.ch.i,String(f).slice(0,80),BGOAL?BGOAL.x+','+BGOAL.z+' hero '+HERO.x.toFixed(1)+','+HERO.z.toFixed(1):'')}}
const bWait=s=>{const t0=T;return bUntil(()=>T-t0>=s)};
function bHold(v){BOT.hold=v}
function bAim(x,z){BAIM={x,z}}function bAimA(a){BAIM=a==null?null:{a}}
async function bGo(x,z,tol,soft){BGOAL={x,z,tol:tol||.5};try{if(soft){const tok=BTOK,t0=T;await until(()=>tok!==BTOK||hd(x,z)<(tol||.5)||T-t0>soft);if(tok!==BTOK)throw STALE}else await bUntil(()=>hd(x,z)<(tol||.5),25)}finally{BGOAL=null}}
async function bPath(pts,tol){for(const [x,z] of pts)await bGo(x,z,tol||.7)}
function bTap(){INP.tapQ=T;INP.used.tap=1;INP.last=T}
function bSwipe(){INP.swipeQ=T;INP.used.swipe=1;INP.swipeDir=0;INP.last=T}
async function bSled(L,mode){BSLED={L,mode};try{await bUntil(()=>HERO.mode!=='sled',40)}finally{BSLED=null;BOT.jx=0}}
function botJoy(dx,dz,k){const cy=camYawNow();const fx=Math.sin(cy),fz=Math.cos(cy),rx=-Math.cos(cy),rz=Math.sin(cy);const m=Math.hypot(dx,dz)||1;k=k==null?1:k;BOT.jx=(dx*rx+dz*rz)/m*k;BOT.jy=(dx*fx+dz*fz)/m*k}
function botFrame(){if(!BOT.on)return;
 if(scene==='ch'&&TASK.botN!==BLASTN){BLASTN=TASK.botN;BTOK++;BOT.hold=false;BAIM=BGOAL=BSLED=null;BOT.jx=BOT.jy=0;const fn=TASK.bot;if(fn)run(async()=>{if(typeof actTour==='function')await actTour();await fn()})}
 if(BSLED){if(HERO.mode!=='sled'){BOT.jx=0;return}const fl=BSLED.L.flags.filter(f=>!f.passed&&f.z>HERO.z-.3).sort((a,b)=>a.z-b.z);let tx=0;
  if(fl.length){const z0=fl[0].z;const row=fl.filter(f=>f.z===z0);let f=row.find(f=>BSLED.mode==='red'?!f.blue:f.blue)||row[0];tx=f.x;const idx=BSLED.L.flags.filter(f=>f.blue).indexOf(f);if(BSLED.mode===2&&idx===1)tx=-f.x}
  BOT.jx=clamp((HERO.x-tx)*.8,-1,1);BOT.jy=0;return}
 if(BSTEER&&HERO.mode==='sled'){BOT.jx=clamp((HERO.x-BSTEER())*.8,-1,1);BOT.jy=0;return}
 if(BGOAL){const dx=BGOAL.x-HERO.x,dz=BGOAL.z-HERO.z,d=Math.hypot(dx,dz);botJoy(dx,dz,clamp(d/1.4,.3,1));return}
 if(BAIM){const a=BAIM.a!=null?BAIM.a:Math.atan2(BAIM.x-HERO.x,BAIM.z-HERO.z);botJoy(Math.sin(a),Math.cos(a),1);return}
 BOT.jx=BOT.jy=0}
function botInit(){BOT.on=true}
