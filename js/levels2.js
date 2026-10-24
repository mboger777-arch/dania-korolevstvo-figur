'use strict';
// ===================== Глава 4: Город Отверстий (пинаем фигуры) =====================
function shapePath(kind,k){k=k||1;const s=new THREE.Shape();
 if(kind==='tri'){s.moveTo(-.8*k,-.6*k);s.lineTo(.8*k,-.6*k);s.lineTo(0,.75*k);s.closePath()}
 else if(kind==='sq'){s.moveTo(-.62*k,-.62*k);s.lineTo(.62*k,-.62*k);s.lineTo(.62*k,.62*k);s.lineTo(-.62*k,.62*k);s.closePath()}
 else if(kind==='rect'){s.moveTo(-1.25*k,-.5*k);s.lineTo(1.25*k,-.5*k);s.lineTo(1.25*k,.5*k);s.lineTo(-1.25*k,.5*k);s.closePath()}
 else if(kind==='gate'){s.moveTo(-1.5*k,-1.3*k);s.lineTo(1.5*k,-1.3*k);s.lineTo(1.5*k,1.3*k);s.lineTo(-1.5*k,1.3*k);s.closePath()}
 else s.absarc(0,0,.66*k,0,Math.PI*2,false);return s}
const SHC={tri:0xff5a6a,sq:0x3d8fe8,rect:0x3fbf63,disc:0xffb52e},SHH={tri:.6,sq:.62,rect:.5,disc:.66},SHW={tri:.8,sq:.62,rect:1.25,disc:.66};
function eyes(p,x,y,z,s){for(const e of [-1,1]){mesh(GEO.sph,0xffffff,x+e*.2*s,y,z,p,[.13*s,.15*s,.06]);mesh(GEO.sph,0x221133,x+e*.2*s,y,z-.05,p,[.06*s,.08*s,.04])}}
// фигуры не касаются плоскости cannon (её трение «прилипает»): пол и торможение — вручную в tick
function slideMat(b){b.collisionFilterGroup=2;b.collisionFilterMask=2}
function mkShape(kind,x,z){const g=new THREE.Group();const geo=new THREE.ExtrudeGeometry(shapePath(kind),{depth:.8,bevelEnabled:true,bevelSize:.05,bevelThickness:.05,bevelSegments:2,curveSegments:28});geo.translate(0,0,-.4);
 mesh(geo,M(SHC[kind]),0,0,0,g);eyes(g,0,kind==='tri'?-.05:.1,-.47,1);WORLD.add(g);const h=SHH[kind];
 const b=physBody(g,new CANNON.Box(new CANNON.Vec3(SHW[kind],h,.45)),1,x,h,z,{fixed:true,damp:.6});slideMat(b);return{kind,g,b,alive:true,passed:false}}
LEVELS[3]={cast:{queen:true},build(){groundPlane(TEX.stone,0xe8d8c0);hills(0x9bc86a);BOUNDS=[-9.5,9.5,-3,13.2];
 for(let i=0;i<8;i++){house(-14+i*4,22+(i%2)*2,1,Math.PI,i%4)}
 const wall=mesh(GEO.box,M(0xc9b28e),0,1.6,14,null,[20,3.2,.8]);wall.material=new THREE.MeshLambertMaterial({map:TEX.stone,color:0xe0cfb0});
 for(const x of [-10.4,10.4]){mesh(GEO.box,0xb0987a,x,2,14,null,[1,4,1.2]);mesh(GEO.cone,0xd2483c,x,4.6,14,null,[.9,1.2,.9])}
 NOGO.push((x,z)=>z>13.15);
 this.holes=[];const mkHole=(kind,x,y,accept)=>{const g=new THREE.Group();g.position.set(x,y,13.58);const rim=mesh(new THREE.ShapeGeometry(shapePath(kind,1.22),32),M(0xffd23a,{basic:1}),0,0,-.005,g);const dk=mesh(new THREE.ShapeGeometry(shapePath(kind,1.08),32),M(0x1a1030,{basic:1}),0,0,-.012,g);
  rim.rotation.y=dk.rotation.y=Math.PI;WORLD.add(g);const cover=mesh(GEO.box,0x9a6a3a,x,y,13.45,null,[kind==='gate'?3.6:2.1,kind==='gate'?3:1.8,.15]);for(let i=-1;i<=1;i++)mesh(GEO.box,0x7a4a26,0,i*.3,-.1,cover,[.95,.06,.4]);
  const h={kind,x,y,g,cover,open:false,full:false,accept,tol:kind==='gate'?1.35:.75,rim};this.holes.push(h);return h};
 this.hT=mkHole('tri',-4,.62,k=>k==='tri');this.hS=mkHole('sq',0,.64,k=>k==='sq');this.hG=mkHole('gate',5.2,1.32,k=>k==='sq'||k==='rect');
 const sign=label3D('4 прямых угла','#fff',.5,{st:'#3a1a6a'});sign.position.set(5.2,3.0,13.4);this.sign=sign;sign.visible=false;
 this.shapes=[];this.lastKick=-9;heroAt(0,1,0);place(QUEEN,7.5,10.5,-2.4);
 TICK.push(dt=>this.tick(dt))},
 open(h){h.open=true;const c=h.cover;const t0=T;SFX.creak();TICK.push(()=>{const k=clamp((T-t0)*1.6,0,1);c.rotation.x=-k*1.45;c.position.y=lerp(h.y,.1,k);c.position.z=13.45-k*.9;if(k>=1)c.visible=false})},
 add(kind,x,z){const s=mkShape(kind,x,z);this.shapes.push(s);burst(V3(x,1,z),SHC[kind],20,3);SFX.pop();return s},
 tick(dt){if(HERO.kickT&&HERO.kickT!==this.lastKick){this.lastKick=HERO.kickT;clearGesture();let best=null,bd=2.1;for(const s of this.shapes){if(!s.alive||s.passed)continue;const d=hd(s.b.position.x,s.b.position.z);if(d<bd){bd=d;best=s}}
   if(best){const p=best.b.position;let dx=p.x-HERO.x,dz=p.z-HERO.z;const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;const a0=Math.atan2(dx,dz);let ba=null,bdiff=.5;
    for(const h of this.holes){if(!h.open||h.full)continue;const a=Math.atan2(h.x-p.x,13.6-p.z);const df=Math.abs(adiff(a,a0));if(df<bdiff){bdiff=df;ba=a}}
    if(ba!=null){dx=Math.sin(ba);dz=Math.cos(ba)}const v=Math.max(9,Math.min(15,Math.hypot(13.6-p.z,0)*1.9+5));best.b.velocity.set(dx*v,2.2,dz*v);best.b.wakeUp();burst(V3(p.x,.6,p.z),0xffffff,12,3,.3)}}
  for(const s of this.shapes){if(!s.alive||s.passed)continue;const b=s.b,p=b.position;const hh=SHH[s.kind];if(p.y<hh){p.y=hh;if(b.velocity.y<0)b.velocity.y=0}
   {const ex=HERO.x-p.x,ez=HERO.z-p.z,ax=SHW[s.kind]+.42,az=.87;if(Math.abs(ex)<ax&&Math.abs(ez)<az){if(ax-Math.abs(ex)<az-Math.abs(ez))HERO.x=p.x+Math.sign(ex||1)*ax;else HERO.z=p.z+Math.sign(ez||1)*az}}
   if(p.x<-9.2){p.x=-9.2;b.velocity.x=Math.abs(b.velocity.x)*.5}if(p.x>9.2){p.x=9.2;b.velocity.x=-Math.abs(b.velocity.x)*.5}if(p.z<-2.5){p.z=-2.5;b.velocity.z=Math.abs(b.velocity.z)*.5}
   if(p.z>13.1){const h=this.holes.find(h=>h.open&&!h.full&&Math.abs(p.x-h.x)<h.tol);
    if(h&&h.accept(s.kind)&&b.velocity.z>0)this.pass(s,h);
    else{p.z=13.1;b.velocity.z=-Math.abs(b.velocity.z)*.55-2.5;b.velocity.x*=.5;SFX.bump();burst(V3(p.x,p.y,13.3),0xffffff,10,2,.25);if(h&&T-(s.wrongT||-9)>1){s.wrongT=T;s.g.position.x+=.1;this.onWrong&&this.onWrong(s,h)}}}}},
 pass(s,h){s.passed=true;PW.removeBody(s.b);const i=SYNC.findIndex(q=>q.b===s.b);if(i>=0)SYNC.splice(i,1);const g=s.g,a=g.position.clone(),t0=T;SFX.whoosh();
  const tz=h.kind==='gate'?17:14;const tx=h.kind==='gate'?h.x+(this.shapes.filter(q=>q.passed&&q!==s).length%2?.8:-.8):h.x;
  TICK.push(()=>{const k=clamp((T-t0)*2.2,0,1);g.position.set(lerp(a.x,tx,k),lerp(a.y,SHH[s.kind],k),lerp(a.z,tz,k));if(k>=1&&!s.done){s.done=true;burst(V3(tx,1,13.5),SHC[s.kind],36,4);SFX.magic();if(h.kind!=='gate'){h.full=true;h.rim.material=M(0x7dff9a,{basic:1})}this.onPass&&this.onPass(s,h)}})},
 async play(){const L=this;
  await cutscene(async()=>{shot(6,4,2,0,1.4,13,2);await say('c4_s')});
  // T1 — треугольник в треугольную дырку
  L.open(L.hT);const sq=L.add('sq',-1.5,8.5),tri=L.add('tri',2.5,8.5);
  newTask('Пни треугольник в треугольную дырку','kick');run(()=>sayAll('c4_t1','u_kick'));
  let res=null;L.onWrong=(s,h)=>{mistake('c4_bad')};L.onPass=(s,h)=>{res=s};
  TASK.help=async()=>{await say('c4_help');await countAloud([V3(-4.8,.02,13.4),V3(-3.2,.02,13.4),V3(-4,1.37,13.4)])};
  botTask(async()=>{const e0=TASK.err;await bKick(L,sq,L.hT.x);await bUntil(()=>TASK.err>e0,5);await bWait(.5);for(let i=0;i<5&&!tri.passed;i++){await bKick(L,tri,L.hT.x);await bWait(1.2)}});
  await until(()=>res&&res.kind==='tri');clearGesture();GOAL='';await good('c4_k1');
  // T2 — квадрат против бруска
  L.open(L.hS);const bar=L.add('rect',3,8);res=null;
  newTask('Найди квадрат: все стороны равные');run(()=>say('c4_t2'));L.onWrong=(s,h)=>{mistake(s.kind==='rect'?'c4_long':'c4_bad')};
  TASK.help=async()=>{await say('c4_help');await countAloud([V3(-.75,.02,13.4),V3(.75,.02,13.4),V3(.75,1.4,13.4),V3(-.75,1.4,13.4)])};
  botTask(async()=>{const e0=TASK.err;for(let i=0;i<4&&TASK.err===e0;i++){await bKick(L,bar,L.hS.x);await bWait(1.2)}await bWait(.5);for(let i=0;i<5&&!sq.passed;i++){await bKick(L,sq,L.hS.x);await bWait(1.2)}});
  await until(()=>res&&res.kind==='sq');GOAL='';await good('c4_k2');
  // T3 — ворота прямоугольников: квадрат тоже прямоугольник
  await cutscene(async()=>{L.open(L.hG);L.sign.visible=true;shot(2,3,6,5.2,1.4,13.5,2.5);await wait(.6);await say('c4_t3')});
  const cube=L.add('sq',-2,8.5),t2=L.add('tri',1.5,7),disc=L.add('disc',-5,7);let nRect=0,saidSq=false;
  if(bar.passed){L.add('rect',6,8)}
  newTask('Пни в ворота все прямоугольники');run(()=>say('c4_t3b'));L.onWrong=(s,h)=>{if(h.kind==='gate')mistake('c4_nope')};
  L.onPass=(s,h)=>{if(h.kind!=='gate')return;nRect++;if(s.kind==='sq'&&!saidSq){saidSq=true;run(()=>sayNext('c4_sq'))}else run(()=>sayNext('g_good'))};
  TASK.help=async()=>{for(const s of L.shapes)if(!s.passed&&(s.kind==='sq'||s.kind==='rect'))burst(V3(s.b.position.x,1.6,s.b.position.z),0xffe066,30,3);await say('c4_t3b')};
  botTask(async()=>{const e0=TASK.err;for(let i=0;i<4&&TASK.err===e0;i++){await bKick(L,t2,L.hG.x);await bWait(1.2)}await bWait(.5);
   for(let k=0;k<12&&nRect<2;k++){const s=L.shapes.find(s=>!s.passed&&(s.kind==='sq'||s.kind==='rect'));if(!s)break;await bKick(L,s,L.hG.x);await bWait(1.2)}});
  await until(()=>nRect>=2&&saidSq);await until(()=>!TALK);GOAL='';await good('c4_k3')}};
// бот: встать за фигурой на линии «фигура → дырка» и пнуть
async function bKick(L,s,hx){if(s.passed)return;const p=s.b.position;let dx=hx-p.x,dz=13.6-p.z;const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;
 const nd=Math.abs(dx)*(SHW[s.kind]+.5)+Math.abs(dz)*.95;const far=[p.x-dx*(nd+1.4),p.z-dz*(nd+1.4)];
 if(hd(hx,13.6)<Math.hypot(hx-p.x,13.6-p.z)+.5||hd(p.x,p.z)<1.5){const side=(HERO.x-p.x)*dz-(HERO.z-p.z)*dx>0?1:-1;await bGo(clamp(p.x+dz*side*2.2,-9,9),clamp(p.z-dx*side*2.2,-2.5,12.5),.8,6)}
 await bGo(clamp(far[0],-9,9),clamp(far[1],-2.5,12.5),.6,8);const q=s.b.position;await bGo(q.x-dx*nd,q.z-dz*nd,.35,4);bSwipe();await bWait(.2)}

// ===================== Глава 5: Пчелиные соты (обеги край, сосчитай углы) =====================
function polyPts(cx,cz,r,n){const a=[];for(let i=0;i<n;i++){const f=-Math.PI/2+i/n*Math.PI*2;a.push({x:cx+Math.cos(f)*r,z:cz+Math.sin(f)*r})}return a}
function segDist(px,pz,a,b){const dx=b.x-a.x,dz=b.z-a.z;const t=clamp(((px-a.x)*dx+(pz-a.z)*dz)/(dx*dx+dz*dz),0,1);return Math.hypot(px-a.x-dx*t,pz-a.z-dz*t)}
LEVELS[4]={cast:{queen:true},build(){groundPlane(TEX.grass,0xd8e890);hills(0x8cc860);treeRing(0,16,22,28,30);flowers&&flowers(60,-14,14,-2,36);BOUNDS=[-13,13,-3,36];
 for(let i=0;i<14;i++){const x=(i%2?-1:1)*rnd(9,13),z=rnd(0,34);const c=new THREE.Group();c.position.set(x,0,z);for(let k=0;k<3;k++)mesh(GEO.hex,M(0xffc93a,{em:0x8a5a00,ei:.3}),0,.15+k*.3,0,c,[.6-k*.08,.28,.6-k*.08]);WORLD.add(c)}
 this.bee=new THREE.Group();mesh(GEO.sph,0xffd23a,0,0,0,this.bee,[.3,.22,.22]);for(const s of [-.1,.08])mesh(GEO.box,0x222222,s,0,0,this.bee,[.06,.23,.23]);for(const s of [-1,1]){const w=mesh(GEO.sph,M(0xffffff,{op:.7}),0,.2,s*.15,this.bee,[.14,.04,.2])}WORLD.add(this.bee);
 TICK.push(()=>{this.bee.position.set(Math.sin(T*.7)*5,2.5+Math.sin(T*3)*.3,14+Math.cos(T*.5)*8);this.bee.rotation.y=T*.7+Math.PI/2});
 heroAt(0,0,0);place(QUEEN,-5,3,.8)},
 mkPlate(cx,cz,r,n,col){const P=polyPts(cx,cz,r,n);const s=new THREE.Shape();P.forEach((p,i)=>i?s.lineTo(p.x-cx,-(p.z-cz)):s.moveTo(p.x-cx,-(p.z-cz)));s.closePath();
  const pl=mesh(new THREE.ExtrudeGeometry(s,{depth:.12,bevelEnabled:false}),M(col),cx,0,cz);pl.rotation.x=-Math.PI/2;pl.position.y=.0;
  const edges=[];for(let i=0;i<n;i++){const a=P[i],b=P[(i+1)%n];edges.push(segMesh(V3(a.x,.16,a.z),V3(b.x,.16,b.z),.09,0,{mat:M(0xfff4c0,{em:0xffd000,ei:.25})}))}
  const lamps=P.map((p,i)=>{const g=new THREE.Group();const ox=(p.x-cx)/r*.55,oz=(p.z-cz)/r*.55;g.position.set(p.x+ox,0,p.z+oz);mesh(GEO.cylL,0x5a3a20,0,.8,0,g,[.07,1.6,.07]);const bulb=mesh(GEO.sph,M(0x9a8a70),0,1.75,0,g,.26);WORLD.add(g);cylBlock(g.position.x,g.position.z,.18,1.9);return{g,bulb,p,lit:false}});
  return{P,cx,cz,r,n,edges,lamps,pl}},
 lightTask(pt,hold){const L=this;return new Promise(res=>{let lit=0,off=false;const tick=dt=>{if(lit>=pt.n){TICK.splice(TICK.indexOf(tick),1);res();return}
   let d=1e9;for(let i=0;i<pt.n;i++)d=Math.min(d,segDist(HERO.x,HERO.z,pt.P[i],pt.P[(i+1)%pt.n]));const on=d<.9;
   for(const e of pt.edges)e.material=M(0xfff4c0,{em:0xffd000,ei:INP.hold&&on?1:.25});
   if(INP.hold&&on){clearGesture();for(const l of pt.lamps){if(l.lit)continue;if(hd(l.p.x,l.p.z)<1.15){l.lit=true;lit++;l.bulb.material=M(0xfff2a0,{em:0xffc000,ei:1});burst(V3(l.g.position.x,1.9,l.g.position.z),0xffe066,20,3,.3);SFX.ding();bigNum(lit);run(()=>say('n'+lit))}}}
   if(INP.hold&&d>1.5&&T-INP.holdT>.6&&!off&&!HERO.lock){off=true;mistake('c5_off')}if(!INP.hold)off=false};TICK.push(tick)})},
 stones(nums,z){return nums.map((n,i)=>{const x=(i-1)*3.2;const g=new THREE.Group();g.position.set(x,-.7,z);mesh(GEO.cyl,M(0xa8a0b8),0,.3,0,g,[.85,.6,.85]);mesh(GEO.cyl,M(0xc8c0d8),0,.62,0,g,[.75,.04,.75]);
  const lb=label3D(String(n),'#ffd84a',1.1,{p:g,num:true,st:'#2a1050'});lb.position.set(0,1.6,0);WORLD.add(g);const b=cylBlock(x,z,.85,.6);b.on=false;const t0=T;TICK.push(()=>{g.position.y=Math.min(0,-.7+(T-t0)*1.5)});setTimeout(()=>b.on=true,500);return{n,g,b,x,z}})},
 jumpTask(st,right){return new Promise(res=>{let busy=false;const tick=dt=>{if(busy)return;for(const s of st){if(HERO.gr&&HERO.y>.45&&hd(s.x,s.z)<1){busy=true;
   if(s.n===right){TICK.splice(TICK.indexOf(tick),1);burst(V3(s.x,1.4,s.z),0xffe066,40,4);SFX.star();res(s);return}
   SFX.bump();mistake('c5_wrong');const a={x:HERO.x,z:HERO.z},b={x:s.x,z:s.z-2.3},t0=T;HERO.lock=true;HERO.vy=6;HERO.gr=false;
   const tk=()=>{const k=clamp((T-t0)/.45,0,1);HERO.x=lerp(a.x,b.x,k);HERO.z=lerp(a.z,b.z,k);if(k>=1&&HERO.gr){TICK.splice(TICK.indexOf(tk),1);HERO.lock=false;busy=false}};TICK.push(tk);return}}};TICK.push(tick)})},
 async play(){const L=this;
  await cutscene(async()=>{shot(5,4,-3,0,.5,10,2);await say('c5_s')});
  const pent=L.mkPlate(0,11,3.6,5,0xffb84a);
  for(const [pt,ask,kOk,nums,sz,right,lineT] of [[pent,'c5_ask','c5_k1',[4,5,6],4.4,5,'c5_t1'],[null,'c5_ask','c5_k2',[5,6,7],20.2,6,'c5_t2']]){
   const P=pt||L.mkPlate(0,27.5,3.8,6,0xffd060);if(!pt){burst(V3(0,1,27.5),0xffe066,40,5);SFX.magic()}
   newTask('Обеги плиту по краю и держи палец','hold');run(()=>say(lineT));
   TASK.help=async()=>{for(const e of P.edges)burst(e.position,0xffe066,8,2);await say('c5_off')};
   botTask(async()=>{const e0=TASK.err;await bGo(P.cx,P.cz,.8);bHold(true);await bUntil(()=>TASK.err>e0,4);bHold(false);await bWait(.3);await bGo(P.P[0].x,P.P[0].z,.4);bHold(true);for(let i=1;i<=P.n;i++)await bGo(P.P[i%P.n].x,P.P[i%P.n].z,.45);bHold(false)});
   await L.lightTask(P);GOAL='';clearGesture();await until(()=>!TALK);
   newTask('Прыгни на камень с числом уголков','jump');const st=L.stones(nums,sz);run(()=>sayAll(ask,'u_jump'));
   TASK.help=async()=>{await say('c5_help');await countAloud(P.lamps.map(l=>V3(l.g.position.x,1.9,l.g.position.z)))};
   const wrong=st.find(s=>s.n!==right),good_=st.find(s=>s.n===right);
   botTask(async()=>{const e0=TASK.err;await bWait(.8);await bJumpOn(wrong.x,wrong.z);await bUntil(()=>TASK.err>e0&&!HERO.lock,5);await bWait(.4);await bJumpOn(good_.x,good_.z)});
   await L.jumpTask(st,right);clearGesture();GOAL='';await good(kOk);
   for(const s of st){s.b.on=false;const t0=T,g=s.g;TICK.push(()=>{g.position.y=Math.max(-1,-(T-t0)*1.2)})}HERO.y=0;HERO.gr=false}
  await cutscene(async()=>{shot(0,6,12,0,0,24,2);place(QUEEN,-4,19,.6);await say('c5_rule')})}};
async function bJumpOn(x,z){const s0=T;await bGo(x,z-1.9,.4);for(let i=0;i<4;i++){BGOAL={x,z,tol:.3};await bWait(.15);bTap();await bUntil(()=>HERO.gr&&HERO.y>.45||TASK.err>0&&HERO.lock,1.2);BGOAL=null;if(HERO.y>.45||HERO.lock)break;await bGo(x,z-1.9,.4)}BGOAL=null;BOT.jx=BOT.jy=0}

// ===================== Глава 6: Колёса (несём колесо, гонка) =====================
function wheelMesh(kind){const g=new THREE.Group();let m;
 if(kind==='sq'){m=mesh(GEO.box,0x3d8fe8,0,0,0,g,[.3,1.1,1.1])}
 else if(kind==='ov'){m=mesh(GEO.cyl,0xff8a3a,0,0,0,g,[.62,.3,.62]);m.rotation.z=Math.PI/2;g.scale.set(1,.62,1.3)}
 else{m=mesh(GEO.cyl,0x3a3a48,0,0,0,g,[.6,.3,.6]);m.rotation.z=Math.PI/2;const hub=mesh(GEO.cyl,0xffd23a,0,0,0,g,[.25,.34,.25]);hub.rotation.z=Math.PI/2}
 WORLD.add(g);return g}
LEVELS[5]={cast:{queen:true,kriv:true},build(){groundPlane(TEX.grass,0xb8e070);hills(0x7cc060);BOUNDS=[-9,9,-3,140];
 const road=mesh(new THREE.PlaneGeometry(9,150),M(0xd8b88a),0,.02,70);road.rotation.x=-Math.PI/2;
 for(let i=0;i<30;i++){const s=i%2?-1:1;tree(s*rnd(7,16),rnd(-2,140),rnd(.9,1.4))}
 // тележка: два правых колеса есть, левых нет
 const c=new THREE.Group();c.position.set(0,0,8);mesh(GEO.box,0xd2483c,0,1.2,0,c,[1.8,.7,2.8]);mesh(GEO.box,0xf5c242,0,1.6,0,c,[1.9,.12,2.9]);mesh(GEO.box,0x8a5a30,0,.75,0,c,[2.4,.1,.1]).position.z=1;mesh(GEO.box,0x8a5a30,0,.75,-1,c,[2.4,.1,.1]);
 this.right=[1,-1].map(z=>{const w=wheelMesh('ci');WORLD.remove(w);c.add(w);w.position.set(1.15,.6,z);return w});WORLD.add(c);this.cart=c;this.cartB=block(0,8,1.0,1.5,1.7);
 this.slots=[{x:-1.15,z:1,w:null},{x:-1.15,z:-1,w:null}];this.slotMk=marker(-2.2,8.6);
 this.wheels=[['sq',-5,3],['ov',-6,7],['ci',-5,11]].map(([k,x,z])=>{const g=wheelMesh(k);g.position.set(x,k==='ov'?.38:.6,z);return{k,g,home:[x,z]}});
 this.rocks=[];heroAt(0,1,0);place(QUEEN,4,4,-.8);KRIV.root.visible=false},
 async play(){const L=this;
  await cutscene(async()=>{shot(6,3.5,1,0,1,9,2);await say('c6_s')});
  newTask('Принеси колесо к тележке','hold');run(()=>say('c6_t1'));
  let carry=null,ok=false,busy=false;
  const G1={on:true};const gr=grabber({hp:()=>{const w=carry||L.near();return w?w.g.position.clone().setY(w.g.position.y+.9):V3(0,-9,0)},
   grab:()=>{carry=L.near();clearGesture()},move:dt=>{if(!carry)return;const tx=HERO.x+Math.sin(HERO.yaw)*1.1,tz=HERO.z+Math.cos(HERO.yaw)*1.1;const p=carry.g.position;p.x=lerp(p.x,tx,.25);p.z=lerp(p.z,tz,.25);p.y=lerp(p.y,1.1,.2);carry.g.rotation.y=HERO.yaw},
   rel:()=>{const w=carry;carry=null;if(!w)return;if(Math.hypot(w.g.position.x+1.6,w.g.position.z-8)<2.6&&!busy)L.fit(w).then(r=>{if(r)ok=true});else{w.g.position.y=w.k==='ov'?.38:.6}}});
  L.near=()=>{let b=null,bd=1.7;for(const w of L.wheels){if(w.used)continue;const d=hd(w.g.position.x,w.g.position.z);if(d<bd){bd=d;b=w}}return b};
  L.fit=async w=>{busy=true;const s=L.slots[0];const c=L.cart;w.g.position.set(c.position.x+s.x,.6,c.position.z+s.z);w.g.rotation.y=0;
   if(w.k==='ci'){w.used=true;s.w=w;SFX.ok();const t0=T;await until(()=>{c.position.z=8+Math.sin((T-t0)*3)*.5;w.g.position.z=c.position.z+s.z;w.g.children[0].rotation.x+= .1;return T-t0>1.05});c.position.z=8;w.g.position.z=8+s.z;busy=false;return true}
   const t0=T;await until(()=>{const k=T-t0;c.rotation.z=(w.k==='sq'?(Math.floor(k*6)%2?.1:-.06):Math.sin(k*9)*.07);c.position.y=w.k==='sq'?Math.abs(Math.sin(k*10))*.15:0;w.g.position.y=.6+c.position.y;return k>1.2});
   c.rotation.z=0;c.position.y=0;SFX.bump();mistake(w.k==='sq'?'c6_sq':'c6_ov');await until(()=>!TALK||TALK.k!=='c6_sq'&&TALK.k!=='c6_ov');const [hx,hz]=w.home;w.g.position.set(hx,w.k==='ov'?.38:.6,hz);burst(V3(hx,1,hz),0xffffff,14,2);busy=false;return false};
  TASK.help=async()=>{const w=L.wheels.find(w=>w.k==='ci');burst(V3(w.g.position.x,1.5,w.g.position.z),0xffe066,40,4);await say('c6_help')};
  botTask(async()=>{const e0=TASK.err;for(const k of ['sq','ci']){const w=L.wheels.find(w=>w.k===k);if(w.used)continue;await bGo(w.g.position.x+1.2,w.g.position.z,.4);bHold(true);await bWait(.4);await bGo(-2.5,8.3,.5);await bWait(.3);bHold(false);if(k==='sq')await bUntil(()=>TASK.err>e0,6);await bWait(1.6)}});
  await until(()=>ok);gr.on=false;L.slotMk.visible=false;GOAL='';await good('c6_ok');
  // второго круглого колеса нет — Кругляш сам становится колесом
  await cutscene(async()=>{shot(-6,2.6,4,-.5,1,8,2.5);heroAt(-3,5,.6);await say('c6_last');KRUG.mode='none';const a=KRUG.root.position.clone(),t0=T;
   await until(()=>{const k=clamp((T-t0)/1,0,1);KRUG.root.position.set(lerp(a.x,-1.35,k),0,lerp(a.z,7,k));KRUG.root.rotation.x+= .2;return k>=1});KRUG.root.rotation.x=0;KRUG.anim='sit';SFX.boing();
   KRIV.root.visible=true;place(KRIV,0,-8,0);L.ball=mesh(GEO.sph,new THREE.MeshLambertMaterial({map:TEX.yarn,color:0xc080ff}),0,2,-5,null,2);shot(3,3,2,0,1.5,-6,2);await say('c6_kv')});
  // гонка: Даня в тележке, рулим, объезжаем камни; Кривуля катит комок сзади
  const rocks=[[-2.5,24],[2.5,36],[0,48],[-3,60],[3,72],[0,86],[-2.5,100],[2.5,112]].map(([x,z])=>{const r=mesh(GEO.sphL,0x8a8a9a,x,.45,z,null,[1.1,.8,1]);return{x,z,r,hit:false,passed:false}});L.rocks=rocks;
  newTask('Рули пальцем и объезжай камни','move');run(()=>say('c6_t2'));
  const sp={v:0};let done=false,lastZ=8;HERO.mode='sled';HERO.x=0;HERO.z=8;DANIA.anim='sit';CAMS.dist=7.5;CAMS.h=3.6;CAMS.snap=true;followCam();
  TASK.help=async()=>{await say('c6_t2')};
  BSTEER=()=>{const nx=rocks.filter(r=>!r.passed).sort((a,b)=>a.z-b.z)[0];if(!nx)return 0;if(TASK.err===0)return nx.x;return nx.x>0?nx.x-2.6:nx.x<0?nx.x+2.6:2.6};
  botTask(async()=>{await bUntil(()=>done,60)});
  const tick=dt=>{if(done)return;sp.v=Math.min(8,sp.v+dt*4);HERO.vx=HERO.vz=0;HERO.z+=sp.v*dt;HERO.x=clamp(HERO.x-INP.jx*6*dt,-3.6,3.6);HERO.y=0;HERO.gr=true;HERO.yaw=-INP.jx*.25;
   const c=L.cart;c.position.set(HERO.x,0,HERO.z);c.rotation.y=HERO.yaw;L.cartB.on=false;DANIA.root.position.set(HERO.x,1.66,HERO.z);DANIA.anim='sit';
   for(const w of L.right.concat(L.slots[0].w?[L.slots[0].w.g]:[]))w.children[0].rotation.x+=sp.v*dt*1.5;if(L.slots[0].w)L.slots[0].w.g.position.set(HERO.x-1.15,.6,HERO.z+1);
   KRUG.root.position.set(HERO.x-1.45,0,HERO.z-1);KRUG.root.rotation.y=HERO.yaw;KRUG.anim='sit';
   L.ball.position.set(Math.sin(T)*.6,2,HERO.z-9);L.ball.rotation.x+=sp.v*dt/2;place(KRIV,Math.sin(T)*.6+1.2,HERO.z-12,0);
   for(const r of rocks){if(r.passed)continue;if(lastZ<r.z-.6&&HERO.z>=r.z-.6){r.passed=true;if(Math.abs(HERO.x-r.x)<1.5){r.hit=true;sp.v=2;SFX.bump();burst(V3(r.x,1,r.z),0xaaaaaa,20,4);r.r.visible=false;mistake('c6_bump')}else SFX.whoosh()}}
   lastZ=HERO.z;if(HERO.z>126)done=true};
  TICK.push(tick);await until(()=>done);TICK.splice(TICK.indexOf(tick),1);BSTEER=null;GOAL='';
  await cutscene(async()=>{shot(HERO.x+5,3,HERO.z-3,HERO.x,1,HERO.z-8,2);const b=L.ball,t0=T;await until(()=>{b.position.y=2-Math.min(2,(T-t0))*.5;b.scale.setScalar(2-(T-t0)*.6);return T-t0>1.2});b.visible=false;burst(b.position,0xc080ff,50,6);SFX.boing();
   await say('c6_k2');KRUG.anim='idle';place(KRUG,HERO.x-2.2,HERO.z,0);faceTo(KRUG,HERO.x,HERO.z);KRUG.cheerT=T;await say('c6_k3')});
  HERO.mode='walk';heroAt(HERO.x-2.6,HERO.z+1.5,0)}};
