'use strict';
// ===== необязательные занятия в главах: фигурки-кристаллы, батут, каракули, мяч, гонка, меловая площадка, наклейки =====
const ACTS={
 0:{gems:[[-6,6,'circle'],[7,-2,'tri'],[-3.5,-2.5,'square'],[8,18,'pent'],[-8,24,'hex']],pad:[5,4,'star'],ball:[9.5,3,9.5,8.6],race:[-9,1,-9,9],chalk:[9,23],scrib:[[6,20.5],[11,16.5],[-11,20]]},
 1:{gems:[[0,29,'circle'],[0,47,'tri'],[0,65,'square'],[2,82,'pent'],[2,115,'hex']],scrib:[[-7.5,33],[7.5,61]]},
 2:{gems:[[8,-2,'circle'],[-9.5,3,'tri'],[8,15,'square'],[-8,27,'pent'],[8,36,'hex']],pad:[6.5,5,'star'],ball:[-8,.5,-8,5.4],chalk:[-7,16],scrib:[[6.5,30],[-7,35],[7,24]]},
 3:{gems:[[-8,-2,'circle'],[8,-2,'tri'],[-8.5,4.5,'square'],[8.5,4.5,'pent']],pad:[-6,1.5,'star'],scrib:[[6,1.5],[-3,-2]]},
 4:{gems:[[10,10,'circle'],[-10,14,'tri'],[9,31,'square'],[-9,31,'pent'],[5,-2,'hex']],pad:[-8,19,'star'],ball:[7.5,1,7.5,6.6],race:[-9.5,-1.5,-9.5,8.5],chalk:[8,19],scrib:[[-10,24],[10,24],[-6,34]]},
 5:{gems:[[0,30,'circle'],[-2,42,'tri'],[2,54,'square'],[0,66,'pent'],[-2,80,'hex'],[2,94,'star']],pad:[6,-1,null],scrib:[[3,40],[-3,90]]},
 6:{gems:[[-9,0,'circle'],[9,0,'tri'],[-9,19,'square'],[9,19,'hex']]}};
const GEMCOL={circle:0xff5a7a,tri:0x3fbf63,square:0x3d8fe8,pent:0xff9a2a,hex:0xffd23a,star:0xb070ff};
const GEMCSS={circle:'#ff5a7a',tri:'#3fbf63',square:'#3d8fe8',pent:'#ff9a2a',hex:'#ffd23a',star:'#b070ff'};
// наклейки альбома
const STK=[['gem0','circle','Долина Точек'],['gem1','tri','Ломаная гора'],['gem2','square','Кузница углов'],['gem3','pent','Город Отверстий'],['gem4','hex','Пчелиные соты'],['gem5','star','Гонка колёс'],['gem6','circle','Замок Кривули'],
 ['pad','spring','Батут'],['scrib','scrib','Без каракулей'],['goal','ball','Гол!'],['race','cup','Гонка'],['ch_circle','circle','Рисую круг'],['ch_tri','tri','Рисую треугольник'],['ch_quad','square','Рисую квадрат']];
if(!SV.st)SV.st={};if(!SV.seen)SV.seen={};
const ACT={on:false,items:[],gems:[],ci:-1,pend:[],pop:null,conf:[],draw:null,hintT:0,prevG:null};
let ACTLOG=[];
const alog=(k,v)=>{ACTLOG.push(k+(v!=null?':'+v:''))};
// реплики занятий: никогда не обрывают и не перебивают основную речь
function actFree(){return !TALK&&!SQ.length&&!CUT}
function asay(k){if(actFree()){run(()=>say(k));return true}return false}
function aIntro(kind,line,g){if(SV.seen[kind])return;SV.seen[kind]=1;save();ACT.pend.push(line);if(g)aHint(g);alog('intro',kind)}
function aHint(g){if(HINT.g!==g)ACT.prevG=HINT.g;HINT.g=g;HINT.shownT=T;HINT.t0=T;ACT.hintT=T+4}
function sticker(id){if(SV.st[id])return;SV.st[id]=1;save();ACT.pop={id,t0:T};ACT.newStk=true;confetti();SFX.star();alog('sticker',id);ACT.pend.push('a_stick')}
function confetti(){const v=vis();for(let i=0;i<70;i++)ACT.conf.push({x:v.x0+Math.random()*v.w,y:v.y0-20-Math.random()*200,vx:rnd(-60,60),vy:rnd(150,320),r:rnd(0,6),vr:rnd(-6,6),c:['#ff5a7a','#ffd23a','#3fbf63','#3d8fe8','#b070ff','#ff9a2a'][i%6],t0:T});if(typeof HERO!=='undefined')burst(V3(HERO.x,HERO.y+2,HERO.z),0xffe066,40,6)}
// ---- фигурка-кристалл ----
function gemMesh(kind,p){const g=new THREE.Group();const col=GEMCOL[kind];const mt=M(col,{em:col,ei:.55});let m;
 if(kind==='star'){m=mesh(starGeo(.42),mt,0,0,0,g);m.geometry.center()}
 else if(kind==='square'){m=mesh(GEO.box,mt,0,0,0,g,[.62,.62,.16])}
 else{const geo=kind==='circle'?GEO.cyl:kind==='tri'?GEO.tri:kind==='pent'?GEO.pent:GEO.hex;m=mesh(geo,mt,0,0,0,g,[.4,.16,.4]);m.rotation.x=Math.PI/2;if(kind==='tri')m.rotation.y=0;m.rotation.z=kind==='tri'?Math.PI:0}
 const gl=mesh(GEO.sphL,M(0xffffff,{basic:1,op:.22}),0,0,0,g,.5);(p||WORLD).add(g);return g}
function gemShadow(x,y,z,col){const r=mesh(new THREE.RingGeometry(.35,.55,24),M(col,{basic:1,op:.45}),x,y+.04,z);r.rotation.x=-Math.PI/2;return r}
// ---- батут ----
function padMesh(x,z){const g=new THREE.Group();g.position.set(x,groundAt(x,z),z);mesh(GEO.cyl,0x3a3a58,0,.12,0,g,[1.05,.24,1.05]);const top=mesh(GEO.cyl,M(0x3fd0ff,{em:0x1080c0,ei:.5}),0,.26,0,g,[.9,.06,.9]);
 for(let i=0;i<3;i++){const r=mesh(new THREE.TorusGeometry(.5-i*.15,.04,6,24),M(0xffffff,{basic:1,op:.8}),0,.3,0,g);r.rotation.x=Math.PI/2}
 const ar=mesh(GEO.cone,M(0xffffff,{em:0xffffff,ei:.4,op:.85}),0,1.5,0,g,[.25,.4,.25]);WORLD.add(g);return{g,top,ar}}
// ---- каракуля Кривули ----
function scribMesh(x,z,seed){const g=new THREE.Group();g.position.set(x,groundAt(x,z)+1,z);const P=tanglePts(9,seed,.45,0);P.push(P[0].clone());
 mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(P,true),70,.055,5,true),new THREE.MeshLambertMaterial({color:0x3a2060,emissive:0x2a0050,emissiveIntensity:.4}),0,0,0,g);
 for(const s of [-1,1])mesh(GEO.sphL,0xffffff,s*.12,.18,-.38,g,.08);WORLD.add(g);return g}
// ---- мяч и ворота ----
function goalMesh(x,z){const g=new THREE.Group();g.position.set(x,groundAt(x,z),z);for(const s of [-1,1]){mesh(GEO.cylL,0xffffff,s*1.4,.75,0,g,[.08,1.5,.08]);mesh(GEO.cylL,0xffffff,s*1.4,.75,1,g,[.06,1.5,.06]);cylBlock(x+s*1.4,z,.15,2)}
 const bar=mesh(GEO.cylL,0xffffff,0,1.5,0,g,[.08,2.88,.08]);bar.rotation.z=Math.PI/2;mesh(GEO.box,M(0xffffff,{basic:1,op:.25}),0,.75,1,g,[2.8,1.5,.03]);
 for(const s of [-1,1])mesh(GEO.box,M(0xffffff,{basic:1,op:.2}),s*1.4,.75,.5,g,[.03,1.5,1]);mesh(GEO.box,M(0xffffff,{basic:1,op:.2}),0,1.5,.5,g,[2.8,.03,1]);WORLD.add(g);return g}
function ballMesh(){const g=new THREE.Group();mesh(GEO.sph,0xffffff,0,0,0,g,.36);for(let i=0;i<6;i++){const a=i/6*6.283;mesh(GEO.sphL,0x2a2a40,Math.cos(a)*.3,Math.sin(a)*.3*(i%2?1:-1)*.6,Math.sin(a)*.3,g,.09)}mesh(GEO.sphL,0x2a2a40,0,.34,0,g,.09);WORLD.add(g);return g}
// ---- флажок ----
function flagMesh(x,z,col,t){const g=new THREE.Group();g.position.set(x,groundAt(x,z),z);mesh(GEO.cylL,0x5a4030,0,1.1,0,g,[.06,2.2,.06]);mesh(GEO.box,M(col,{em:col,ei:.4}),.4,1.9,0,g,[.8,.5,.05]);
 const r=mesh(new THREE.RingGeometry(.9,1.15,28),M(col,{basic:1,op:.6}),0,.05,0,g);r.rotation.x=-Math.PI/2;if(t)label3D(t,'#fff',.55,{p:g,st:'#2a1050'}).position.set(0,2.7,0);WORLD.add(g);return g}
// ---- меловая площадка ----
function chalkMesh(x,z){const g=new THREE.Group();g.position.set(x,groundAt(x,z)+.02,z);const c=document.createElement('canvas');c.width=c.height=256;const q=c.getContext('2d');q.fillStyle='#2f4a3c';q.beginPath();q.arc(128,128,126,0,7);q.fill();q.strokeStyle='#c8a060';q.lineWidth=8;q.stroke();
 q.strokeStyle='rgba(255,255,255,.85)';q.lineWidth=6;q.lineCap=q.lineJoin='round';q.beginPath();q.arc(78,92,30,0,7);q.stroke();q.beginPath();q.moveTo(178,60);q.lineTo(214,124);q.lineTo(142,124);q.closePath();q.stroke();q.strokeRect(100,150,62,62);
 const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;const m=mesh(new THREE.CircleGeometry(1.5,40),new THREE.MeshBasicMaterial({map:tx}),0,.03,0,g);m.rotation.x=-Math.PI/2;
 const ch=mesh(GEO.cylL,M(0xffffff,{em:0xffffff,ei:.3}),1.1,.6,-1.1,g,[.08,.5,.08]);ch.rotation.z=.6;label3D('Мел','#fff',.5,{p:g,st:'#2a1050'}).position.set(0,1.9,0);WORLD.add(g);return g}

function actSetup(i){ACT.on=false;ACT.items=[];ACT.gems=[];ACT.ci=i;ACT.pend=[];ACT.draw=null;ACT.tour=new Set();const C=ACTS[i];if(!C)return;ACT.on=true;
 const sh=(x,z)=>{let ok=!nogo(x,z);for(const b of BLOCKS)if(b.on&&inBlock(b,x,z,.3))ok=false;for(const c of CYLS)if(c.on&&Math.hypot(x-c.x,z-c.z)<c.r+.3)ok=false;if(!ok)console.warn('act blocked',i,x,z);return ok};
 const mkGem=(x,z,kind,y)=>{const b=baseAt(x,z);const g=gemMesh(kind);const gy=y!=null?b+y:b+1.0;g.position.set(x,gy,z);const s=gemShadow(x,b,z,GEMCOL[kind]);const o={k:'gem',x,z,y:gy,kind,g,s,got:false,ph:Math.random()*6};ACT.gems.push(o);ACT.items.push(o);return o};
 for(const [x,z,k] of C.gems)mkGem(x,z,k);
 if(C.pad){const [x,z,k]=C.pad;const p=padMesh(x,z);const o={k:'pad',x,z,...p,sq:0,n:0};ACT.items.push(o);if(k)o.gem=mkGem(x,z,k,4.3)}
 if(C.scrib)C.scrib.forEach(([x,z],j)=>{const g=scribMesh(x,z,i*10+j+3);ACT.items.push({k:'scrib',x,z,g,alive:true,ph:j})});
 if(C.ball){const [bx,bz,gx,gz]=C.ball;sh(bx,bz);const gl=goalMesh(gx,gz);const b=ballMesh();const o={k:'ball',x:bx,z:bz,gx,gz,g:b,goal:gl,bx,bz,vx:0,vz:0,y:groundAt(bx,bz)+.36,lk:HERO.kickT||0,score:0,cool:0};b.position.set(bx,o.y,bz);ACT.items.push(o)}
 if(C.race){const [sx,sz,fx,fz]=C.race;const o={k:'race',x:sx,z:sz,fx,fz,st:'idle',a:flagMesh(sx,sz,0x3fbf63,'Старт'),b:flagMesh(fx,fz,0xff5a7a,'Финиш'),t0:0,away:true};ACT.items.push(o)}
 if(C.chalk){const [x,z]=C.chalk;const o={k:'chalk',x,z,g:chalkMesh(x,z),away:true,made:[]};ACT.items.push(o)}
 for(const o of ACT.items)if(o.k!=='gem'||o.y<3)sh(o.x,o.z);
 TICK.push(actTick)}

function actTick(dt){if(!ACT.on||scene!=='ch')return;
 // отложенные объяснения: только когда никто не говорит
 if(ACT.pend.length&&actFree()){const k=ACT.pend.shift();run(()=>say(k))}
 if(ACT.hintT&&T>ACT.hintT){ACT.hintT=0;if(HINT.g&&ACT.prevG!==undefined){HINT.g=ACT.prevG}ACT.prevG=null}
 const walk=HERO.mode==='walk'&&!HERO.lock&&!CUT;const hy=HERO.y+.9;
 for(const o of ACT.items){
  if(o.k==='gem'){if(o.got)continue;o.g.rotation.y+=dt*2;o.g.position.y=o.y+Math.sin(T*2.5+o.ph)*.12;
   if(!CUT&&Math.hypot(HERO.x-o.x,HERO.z-o.z)<1.1&&Math.abs(o.y-hy)<1.4){o.got=true;o.g.visible=false;o.s.visible=false;SFX.ding();burst(V3(o.x,o.y,o.z),GEMCOL[o.kind],26,3.5,.25);const n=ACT.gems.filter(g=>g.got).length;bigNum(n,GEMCSS[o.kind]);alog('gem',o.kind);
    if(!SV.seen.gem){aIntro('gem','a_gem')}else asay('g_'+o.kind);
    if(n===ACT.gems.length){sticker('gem'+ACT.ci);ACT.pend.unshift('a_allgems')}}}
  else if(o.k==='pad'){o.sq=Math.max(0,o.sq-dt*3);o.top.scale.y=1-o.sq*.6;o.ar.position.y=1.5+Math.sin(T*4)*.15;o.ar.visible=!o.n;
   const d=Math.hypot(HERO.x-o.x,HERO.z-o.z);if(d<3.5&&walk)aIntro('pad','a_pad','move');
   if(walk&&d<.95&&HERO.gr&&HERO.y<o.g.position.y+.5){HERO.vy=13.2;HERO.gr=false;HERO.y+=.05;o.sq=1;o.n++;SFX.boing();burst(V3(o.x,o.g.position.y+.4,o.z),0x8fe0ff,16,3);alog('pad');if(o.n===1)sticker('pad')}}
  else if(o.k==='scrib'){if(!o.alive)continue;o.g.rotation.y+=dt*1.3;o.g.rotation.x=Math.sin(T*2+o.ph)*.3;o.g.position.y=baseAt(o.x,o.z)+1+Math.sin(T*3+o.ph)*.15;
   const d=Math.hypot(HERO.x-o.x,HERO.z-o.z);if(d<4&&walk)aIntro('scrib','a_scrib','move');
   if(!CUT&&d<1.15){o.alive=false;o.g.visible=false;SFX.pop();burst(o.g.position,0x8e44d8,30,4,.3);burst(o.g.position,0xffe066,16,3);alog('scrib');const left=ACT.items.filter(s=>s.k==='scrib'&&s.alive).length;if(!left){sticker('scrib');ACT.pend.unshift('a_scrib_all')}}}
  else if(o.k==='ball')ballTick(o,dt,walk);
  else if(o.k==='race')raceTick(o,dt,walk);
  else if(o.k==='chalk')chalkTick(o,dt,walk)}}

function ballTick(o,dt,walk){const d=Math.hypot(HERO.x-o.bx,HERO.z-o.bz);if(d<3&&walk)aIntro('ball','a_ball','swipe');
 const kicked=(HERO.kickT||0)!==o.lk;o.lk=HERO.kickT||0;
 if(kicked&&walk&&d<1.9){const a=HERO.yaw;const sp=10;o.vx=Math.sin(a)*sp;o.vz=Math.cos(a)*sp;SFX.kick();alog('kick')}
 else if(walk&&d<.75&&HERO.sp>.5){const nx=(o.bx-HERO.x)/(d||1),nz=(o.bz-HERO.z)/(d||1);o.vx+=nx*4;o.vz+=nz*4}
 o.bx+=o.vx*dt;o.bz+=o.vz*dt;const f=Math.pow(.35,dt);o.vx*=f;o.vz*=f;
 if(BOUNDS){if(o.bx<BOUNDS[0]+.4||o.bx>BOUNDS[1]-.4){o.vx*=-.7;o.bx=clamp(o.bx,BOUNDS[0]+.4,BOUNDS[1]-.4)}if(o.bz<BOUNDS[2]+.4||o.bz>BOUNDS[3]-.4){o.vz*=-.7;o.bz=clamp(o.bz,BOUNDS[2]+.4,BOUNDS[3]-.4)}}
 if(nogo(o.bx,o.bz)){o.bx-=o.vx*dt;o.bz-=o.vz*dt;o.vx*=-.6;o.vz*=-.6}
 for(const s of [-1,1]){const px=o.gx+s*1.4;if(Math.hypot(o.bx-px,o.bz-o.gz)<.5){o.vx*=-.8;o.bx+= (o.bx-px)*.2}}
 // за воротами — сетка
 const lx=o.bx-o.gx,lz=o.bz-o.gz;if(Math.abs(lx)<1.35&&lz>0&&lz<1.1&&o.cool<=0){o.score++;o.cool=2.5;SFX.star();burst(V3(o.bx,1,o.bz+.3),0xffe066,40,5);alog('goal');if(DANIA)DANIA.cheerT=T;if(KRUG)KRUG.cheerT=T;if(!SV.st.goal){sticker('goal');ACT.pend.unshift('a_goal')}else asay('a_goal2')}
 if(lz>.9&&Math.abs(lx)<1.45){o.bz=o.gz+.9;o.vz=-Math.abs(o.vz)*.3}
 if(Math.abs(lx)>1.45&&lz>-.2&&lz<1.1&&Math.abs(Math.abs(lx)-1.4)<.3){o.vx*=-.6}
 if(o.cool>0){o.cool-=dt;if(o.cool<=0){o.bx=o.x;o.bz=o.z;o.vx=o.vz=0;burst(V3(o.x,.6,o.z),0xffffff,14,2)}}
 const v=Math.hypot(o.vx,o.vz);o.g.position.set(o.bx,groundAt(o.bx,o.bz)+.36,o.bz);if(v>.05){o.g.rotation.x+=o.vz*dt/.36;o.g.rotation.z-=o.vx*dt/.36}}

function raceTick(o,dt,walk){const k=KRUG;const ds=Math.hypot(HERO.x-o.x,HERO.z-o.z),df=Math.hypot(HERO.x-o.fx,HERO.z-o.fz);
 if(ds<4&&walk&&o.st==='idle')aIntro('race','a_race','move');
 if(o.st==='idle'){if(ds>1.6)o.away=true;if(walk&&ds<1.1&&o.away&&k&&k.mode==='follow'&&actFree()){o.away=false;o.st='count';o.t0=T;k.mode='none';place(k,o.x+1.3,o.z);faceTo(k,o.fx,o.fz);HERO.lock=true;HERO.x=o.x;HERO.z=o.z;HERO.yaw=Math.atan2(o.fx-o.x,o.fz-o.z);run(()=>say('a_go'));alog('race','start')}}
 else if(o.st==='count'){HERO.yaw=Math.atan2(o.fx-o.x,o.fz-o.z);const u=T-o.t0;const n=3-Math.floor(u/.8);if(n>=1&&n!==o.cn){o.cn=n;bigNum(n);SFX.click()}if(u>2.4&&(!TALK||TALK.k!=='a_go')){o.st='run';o.t0=T;HERO.lock=false;k.mode='go';k.tgt={x:o.fx+1.3,z:o.fz};bigNum('!','#3fbf63');SFX.whoosh()}}
 else if(o.st==='run'){const kd=Math.hypot(k.root.position.x-o.fx-1.3,k.root.position.z-o.fz);
  if(df<1.3){o.st='end';k.mode='follow';k.cheerT=T;if(DANIA)DANIA.cheerT=T;SFX.star();burst(V3(o.fx,1.5,o.fz),0xffe066,40,5);alog('race','win');if(!SV.st.race){sticker('race')}ACT.pend.unshift('a_win')}
  else if(kd<.3||T-o.t0>12){o.st='end';k.mode='follow';k.cheerT=T;alog('race','lose');ACT.pend.unshift('a_lose')}}
 else if(o.st==='end'){if(ds>2&&df>2)o.st='idle'}}

// ---- меловая площадка: рисуем пальцем, узнаём фигуру ----
function chalkTick(o,dt,walk){const d=Math.hypot(HERO.x-o.x,HERO.z-o.z);if(d>1.9)o.away=true;
 if(ACT.draw&&(CUT||scene!=='ch'))chalkClose();
 ACT.nearChalk=(!ACT.draw&&walk&&d<1.7&&!CUT)?o:null}
function chalkOpen(o){ACT.draw={o,pts:null,res:null,resT:0,t0:T,touched:false,ptr:null};INPMODE='ui';HERO.lock=true;HERO.vx=HERO.vz=0;JOY=null;RT=null;alog('chalk','open');
 if(!SV.seen.chalk){SV.seen.chalk=1;save();ACT.pend.unshift('a_chalk')}}
function chalkClose(){const D=ACT.draw;if(!D)return;ACT.draw=null;if(!CUT){INPMODE='play';HERO.lock=false}alog('chalk','close')}
function chalkBoard(){const v=vis();const w=Math.min(860,v.w-260),h=Math.min(470,v.h-170);return{x:640-w/2,y:Math.max(safeT()+(TALK?150:20),v.y0+v.h/2-h/2+30),w,h}}
const ACTPTR={down(x,y,id){const D=ACT.draw;if(!D)return false;const b=chalkBoard();if(x>b.x&&x<b.x+b.w&&y>b.y&&y<b.y+b.h){D.pts=[[x,y]];D.ptr=id;D.touched=true;D.res=null;SFX.chalk();INP.last=T}return true},
 move(x,y,id){const D=ACT.draw;if(!D||!D.pts||D.ptr!==id)return;const p=D.pts[D.pts.length-1];if(Math.hypot(x-p[0],y-p[1])>4)D.pts.push([x,y]);INP.last=T},
 up(id){const D=ACT.draw;if(!D||!D.pts||D.ptr!==id)return;D.ptr=null;chalkDone(D.pts)}};
function chalkDone(pts){const D=ACT.draw;if(!D)return;const r=recogShape(pts);D.res=r;D.resT=T;D.last=pts;D.pts=null;alog('draw',r||'none');
 if(!r){SFX.bad();asay('a_ch_bad');return}
 SFX.ok();if(DANIA)DANIA.cheerT=T;const o=D.o;sticker('ch_'+r);asay('a_ch_'+r);
 // фигура появляется на площадке
 const kind=r==='quad'?'square':r;const g=gemMesh(kind);const n=o.made.length;const a=n*2.1;g.position.set(o.x+Math.cos(a)*2.2,baseAt(o.x,o.z)+.6,o.z+Math.sin(a)*2.2);g.scale.setScalar(1.6);o.made.push(g);TICK.push(dt=>{g.rotation.y+=dt})}
// распознавание: замкнутость, круглость, число углов (упрощение ломаной)
function recogShape(P){if(!P||P.length<8)return null;let L=0;for(let i=1;i<P.length;i++)L+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);if(L<220)return null;
 let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(const [x,y] of P){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}const dg=Math.hypot(x1-x0,y1-y0);
 const gap=Math.hypot(P[0][0]-P[P.length-1][0],P[0][1]-P[P.length-1][1]);if(gap>Math.max(70,dg*.3))return null;
 // равномерная выборка
 const N=64,Q=[];const step=L/N;let acc=0;Q.push(P[0]);for(let i=1;i<P.length&&Q.length<N;i++){let a=P[i-1],b=P[i];let s=Math.hypot(b[0]-a[0],b[1]-a[1]);while(acc+s>=step&&Q.length<N){const t=(step-acc)/s;const q=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];Q.push(q);a=q;s=Math.hypot(b[0]-a[0],b[1]-a[1]);acc=0}acc+=s}
 const cx=Q.reduce((s,p)=>s+p[0],0)/Q.length,cy=Q.reduce((s,p)=>s+p[1],0)/Q.length;const R=Q.map(p=>Math.hypot(p[0]-cx,p[1]-cy));const mr=R.reduce((a,b)=>a+b,0)/R.length;const sd=Math.sqrt(R.reduce((s,r)=>s+(r-mr)**2,0)/R.length)/mr;
 // углы: резкие повороты направления
 const n=Q.length,K=4;const turn=[];for(let i=0;i<n;i++){const a=Q[(i-K+n)%n],b=Q[i],c=Q[(i+K)%n];const a1=Math.atan2(b[1]-a[1],b[0]-a[0]),a2=Math.atan2(c[1]-b[1],c[0]-b[0]);turn.push(Math.abs(Math.atan2(Math.sin(a2-a1),Math.cos(a2-a1))))}
 const cs=[];for(let i=0;i<n;i++){if(turn[i]>.75&&turn[i]>=turn[(i-1+n)%n]&&turn[i]>=turn[(i+1)%n]){if(!cs.some(j=>Math.min(Math.abs(j-i),n-Math.abs(j-i))<6))cs.push(i)}}
 if(sd<.13&&cs.length<=2)return 'circle';if(cs.length===3)return 'tri';if(cs.length===4)return 'quad';if(sd<.17&&cs.length<3)return 'circle';return null}
// для автопилота: фигура как набор точек на доске
function chalkPts(kind){const b=chalkBoard();const cx=b.x+b.w/2,cy=b.y+b.h/2+20,r=Math.min(b.w,b.h)*.3;const P=[];
 if(kind==='circle'){for(let i=0;i<=48;i++){const a=i/48*6.283;P.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r])}}
 else if(kind==='scribble'){for(let i=0;i<40;i++)P.push([cx-r+i*r/20,cy+Math.sin(i*.9)*r*.5])}
 else{const V=kind==='tri'?[[0,-1],[.95,.75],[-.95,.75]]:[[-.8,-.8],[.8,-.8],[.8,.8],[-.8,.8]];for(let k=0;k<=V.length;k++){const a=V[k%V.length],c=V[(k+1)%V.length];if(k===V.length){P.push([cx+a[0]*r,cy+a[1]*r]);break}for(let j=0;j<12;j++){const t=j/12;P.push([cx+(a[0]+(c[0]-a[0])*t)*r,cy+(a[1]+(c[1]-a[1])*t)*r])}}}
 return P}
function shapeIcon(kind,x,y,r,fill,st){X.save();X.translate(x,y);X.beginPath();
 if(kind==='circle')X.arc(0,0,r,0,7);else if(kind==='square'||kind==='quad')X.rect(-r*.85,-r*.85,r*1.7,r*1.7);
 else if(kind==='star'){for(let i=0;i<10;i++){const a=i/10*6.283-Math.PI/2,rr=i%2?r*.45:r;X.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}X.closePath()}
 else{const n=kind==='tri'?3:kind==='pent'?5:6;for(let i=0;i<n;i++){const a=i/n*6.283-Math.PI/2;X.lineTo(Math.cos(a)*r,Math.sin(a)*r*(n===3?1.1:1)+(n===3?r*.15:0))}X.closePath()}
 if(fill){X.fillStyle=fill;X.fill()}if(st){X.lineWidth=Math.max(3,r*.14);X.strokeStyle=st;X.stroke()}X.restore()}
function drawChalk(){const D=ACT.draw;if(!D)return;const v=vis();X.fillStyle='rgba(20,10,50,.45)';X.fillRect(v.x0,v.y0,v.w,v.h);const b=chalkBoard();
 X.save();X.shadowColor='rgba(0,0,0,.4)';X.shadowBlur=16;X.fillStyle='#b07a3a';rr(b.x-16,b.y-16,b.w+32,b.h+32,26);X.fill();X.restore();X.fillStyle='#2f4a3c';rr(b.x,b.y,b.w,b.h,14);X.fill();
 txt('Нарисуй фигуру пальцем',b.x+b.w/2,b.y+38,40,'#ffffff',{f:FONT,st:'#1a2a20',lw:6,id:'chalkT',box:[b.x,b.y,b.x+b.w,b.y+b.h]});
 const ic=[['circle','ch_circle'],['tri','ch_tri'],['square','ch_quad']];ic.forEach(([k,id],j)=>{const ix=b.x+50,iy=b.y+110+j*90;shapeIcon(k,ix,iy,28,SV.st[id]?GEMCSS[k]:null,SV.st[id]?'#fff':'rgba(255,255,255,.5)')});
 X.lineCap=X.lineJoin='round';const S0=D.pts||((D.res!==undefined&&T-D.resT<1.4)?D.last:null);
 if(S0&&S0.length>1){X.strokeStyle=D.pts?'rgba(255,255,255,.95)':(D.res?'#ffd23a':'rgba(255,140,140,.9)');X.lineWidth=12;X.beginPath();X.moveTo(S0[0][0],S0[0][1]);for(const p of S0)X.lineTo(p[0],p[1]);X.stroke()}
 if(D.res&&T-D.resT<2){const nm={circle:'Круг!',tri:'Треугольник!',quad:'Четыре угла!'}[D.res];txt(nm,b.x+b.w/2,b.y+b.h-46,56,'#ffd23a',{f:FONT,st:'#1a2a20',lw:8,id:'chalkR'})}
 // рука показывает, как рисовать, пока ребёнок не начал
 if(!D.touched){const u=((T-D.t0)%3)/2.4;if(u<1){const P=chalkPts('tri');const k=Math.min(P.length-1,Math.floor(u*P.length));X.strokeStyle='rgba(255,255,255,.6)';X.lineWidth=10;X.beginPath();X.moveTo(P[0][0],P[0][1]);for(let i=1;i<=k;i++)X.lineTo(P[i][0],P[i][1]);X.stroke();drawHandShape(P[k][0]-10,P[k][1]-4,true)}}
 labelBtn('chalkX',b.x+b.w-90,b.y+b.h+2,190,72,'Готово',()=>chalkClose(),{size:38})}
// ---- счётчик фигурок, наклейка, конфетти ----
function actDraw(){if(!ACT.on)return;drawChalk();
 if(ACT.nearChalk&&!ACT.draw&&INPMODE==='play'){const o=ACT.nearChalk;labelBtn('chalkgo',640,safeB()-70,250,76,'✏️ Рисовать',()=>{if(ACT.nearChalk)chalkOpen(o)},{size:34,pulse:true});if(!SV.seen.chalkbtn){SV.seen.chalkbtn=1;save();aHint('tap')}}
 if(ACT.gems.length&&!ACT.draw&&!(typeof ACT2!=='undefined'&&ACT2.bld)&&!TALK&&!CUT){const n=ACT.gems.length,w=24+n*46,x=safeL()+92,y=safeT()+84;panel(x,y,w,62,{fill:'rgba(255,250,236,.9)',st:'#6a4bb8',lw:4,r:20});
  ACT.gems.forEach((g,j)=>shapeIcon(g.kind,x+35+j*46,y+31,17,g.got?GEMCSS[g.kind]:null,g.got?'#2a1050':'rgba(90,70,140,.55)'))}
 drawConf()}
function drawConf(){const dt=DT;ACT.conf=ACT.conf.filter(c=>T-c.t0<3.5);for(const c of ACT.conf){c.x+=c.vx*dt;c.y+=c.vy*dt;c.r+=c.vr*dt;X.save();X.translate(c.x,c.y);X.rotate(c.r);X.fillStyle=c.c;X.fillRect(-8,-5,16,10);X.restore()}
 const P=ACT.pop;if(P){const u=T-P.t0;if(u>3){ACT.pop=null}else{const k=u<.3?ease(u/.3):u>2.6?(3-u)/.4:1;const v=vis();X.save();X.globalAlpha=Math.max(0,Math.min(1,k));const cx=v.x0+v.w/2,cy=v.y0+v.h*.58;X.translate(cx,cy);X.scale(k,k);
  panel(-190,-120,380,240,{fill:'rgba(255,250,236,.97)',st:'#ffb52e',lw:7,r:30});txt('Новая наклейка!',0,-82,40,'#6a4bb8',{f:FONT,st:0,id:'stkT'});drawSticker(P.id,0,20,62,true);X.restore()}}}
function drawSticker(id,x,y,r,own){const s=STK.find(s=>s[0]===id);if(!s)return;const ic=s[1];X.save();X.translate(x,y);X.beginPath();X.arc(0,0,r,0,7);X.fillStyle=own?'#fff6d8':'rgba(120,110,150,.25)';X.fill();X.lineWidth=r*.09;X.strokeStyle=own?'#ffb52e':'rgba(120,110,150,.5)';X.setLineDash(own?[]:[8,8]);X.stroke();X.setLineDash([]);
 const col=own?null:'rgba(120,110,150,.35)';
 if(['circle','tri','square','pent','hex','star'].includes(ic))shapeIcon(ic,0,0,r*.55,col||GEMCSS[ic],own?'#2a1050':null);
 else if(ic==='ball'){X.beginPath();X.arc(0,0,r*.55,0,7);X.fillStyle=col||'#ffffff';X.fill();if(own){X.lineWidth=4;X.strokeStyle='#2a1050';X.stroke();shapeIcon('pent',0,0,r*.2,'#2a1050')}}
 else if(ic==='cup'){X.fillStyle=col||'#ffd23a';X.beginPath();X.moveTo(-r*.45,-r*.45);X.lineTo(r*.45,-r*.45);X.quadraticCurveTo(r*.4,r*.15,0,r*.2);X.quadraticCurveTo(-r*.4,r*.15,-r*.45,-r*.45);X.fill();X.fillRect(-r*.08,r*.15,r*.16,r*.25);X.fillRect(-r*.3,r*.38,r*.6,r*.12)}
 else if(ic==='spring'){X.strokeStyle=col||'#3fa0e0';X.lineWidth=r*.12;X.beginPath();for(let i=0;i<=24;i++){const t=i/24;X.lineTo(Math.sin(t*6.283*3)*r*.35,r*.45-t*r*.9)}X.stroke()}
 else if(ic==='scrib'){X.strokeStyle=col||'#7a3bb0';X.lineWidth=r*.1;X.beginPath();for(let i=0;i<=30;i++){const t=i/30*6.283*2.5;X.lineTo(Math.cos(t)*r*.4+Math.sin(t*1.7)*r*.12,Math.sin(t*1.3)*r*.35)}X.stroke();if(own){X.strokeStyle='#ff4a4a';X.lineWidth=r*.12;X.beginPath();X.moveTo(-r*.5,-r*.5);X.lineTo(r*.5,r*.5);X.stroke()}}
 X.restore()}
// ---- альбом наклеек на карте ----
let ALBUM=false;
function drawAlbum(){const v=vis();X.fillStyle='rgba(20,10,50,.6)';X.fillRect(v.x0,v.y0,v.w,v.h);const w=Math.min(1100,v.w-120),h=Math.min(600,v.h-60);const x=640-w/2,y=v.y0+v.h/2-h/2;panel(x,y,w,h,{fill:'rgba(255,250,236,.98)',st:'#ffb52e',lw:7,r:30});
 const n=STK.filter(s=>SV.st[s[0]]).length;txt('Альбом наклеек  '+n+' / '+STK.length,640,y+44,46,'#6a4bb8',{f:FONT,st:0,id:'albT'});
 const cols=Math.ceil(STK.length/2),cw=(w-60)/cols,chh=(h-110)/2;STK.forEach((s,j)=>{const cx=x+30+cw*(j%cols+.5),cy=y+96+chh*(Math.floor(j/cols)+.42);const r=Math.min(cw,chh)*.36;drawSticker(s[0],cx,cy,r,!!SV.st[s[0]]);txt(s[2],cx,cy+r+24,22,SV.st[s[0]]?'#3a1a6a':'#9a90b0',{f:FONT,st:0,box:[cx-cw/2,cy,cx+cw/2,cy+r+50]})});
 hitBtn('albX',640,v.y0+v.h/2,v.w,v.h,()=>{ALBUM=false})}
{const md=SC.map.draw;SC.map.draw=function(){md.call(this);const n=STK.filter(s=>SV.st[s[0]]).length;
  if(ALBUM){UI.length=0;drawAlbum();return}
  labelBtn('album',safeR()-130,safeB()-56,230,80,'Альбом '+n,()=>{ALBUM=true;ACT.newStk=false},{size:36,pulse:!!ACT.newStk})}}
{const me=SC.ch.enter;SC.ch.enter=function(i){ALBUM=false;me.call(this,i);actSetup(i)}}
{const cd=SC.ch.draw;SC.ch.draw=function(){cd.call(this);actDraw()}}
// ---- автопилот: обходит занятия, которые сейчас можно достать (тест) ----
function actReach(x,z){const n=Math.ceil(Math.hypot(x-HERO.x,z-HERO.z)/.4);for(let k=1;k<=n;k++){const t=k/n,px=HERO.x+(x-HERO.x)*t,pz=HERO.z+(z-HERO.z)*t;if(nogo(px,pz))return false;for(const b of BLOCKS)if(b.on&&b.y1>HERO.y+.5&&inBlock(b,px,pz,.35))return false;for(const c of CYLS)if(c.on&&c.y1>HERO.y+.5&&Math.hypot(px-c.x,pz-c.z)<c.r+.35)return false}return true}
async function bSoft(f,s){const t0=T;await bUntil(()=>f()||T-t0>s)}
async function actTour(){if(!ACT.on||ACT.ci===6||HERO.mode!=='walk'||HERO.lock||CUT)return;const sx=HERO.x,sz=HERO.z;let any=false;const TR=[[sx,sz]];
 for(let pass=0;pass<12;pass++){const left=ACT.items.filter(o=>!ACT.tour.has(o)&&!(o.k==='gem'&&(o.got||o.y>3))&&!(o.k==='scrib'&&!o.alive)&&actReach(o.x,o.z));if(!left.length)break;
  left.sort((a,b)=>hd(a.x,a.z)-hd(b.x,b.z));const o=left[0];ACT.tour.add(o);any=true;alog('tour',o.k);
  if(o.k==='gem'||o.k==='scrib'){await bGo(o.x,o.z,.5,8)}
  else if(o.k==='pad'){await bGo(o.x,o.z,.4,8);await bWait(2.2);await bGo(o.x+1.6,o.z,.5,4)}
  else if(o.k==='ball'){for(let t=0;t<4&&!o.score;t++){const ax=o.gx-o.bx,az=o.gz+.5-o.bz,al=Math.hypot(ax,az)||1;const off=t===0?1.2:0;await bGo(o.bx-ax/al*1.3+off,o.bz-az/al*1.3,.3,6);const a=Math.atan2(o.gx-HERO.x+off*.0,o.gz+.5-HERO.z)+(t===0?.6:0);bAimA(a);await bWait(.35);bAimA(null);bSwipe();await bWait(2.2)}}
  else if(o.k==='race'){await bGo(o.x,o.z,.5,8);await bSoft(()=>o.st==='run',10);if(o.st==='run'){await bGo(o.fx,o.fz,.6,10);await bSoft(()=>o.st==='end',6)}await bWait(.5)}
  else if(o.k==='chalk'){await bGo(o.x,o.z,.5,8);await bSoft(()=>ACT.nearChalk,4);if(ACT.nearChalk)chalkOpen(ACT.nearChalk);if(ACT.draw){await bWait(1.5);for(const k of ['scribble','tri','circle']){chalkDone(chalkPts(k));await bWait(1.8)}await bSoft(()=>actFree(),12);chalkClose();await bGo(o.x+2.5,o.z-1,.6,4)}}
  TR.push([HERO.x,HERO.z])}
 if(any){await bSoft(()=>actFree(),15);for(let j=TR.length-2;j>=0;j--){const [px,pz]=TR[j];if(j>0&&actReachFrom(HERO.x,HERO.z,sx,sz))continue;await bGo(px,pz,.8,10)}}}
function actReachFrom(ax,az,x,z){const hx=HERO.x,hz=HERO.z;HERO.x=ax;HERO.z=az;const r=actReach(x,z);HERO.x=hx;HERO.z=hz;return r}
