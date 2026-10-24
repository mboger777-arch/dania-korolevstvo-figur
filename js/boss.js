'use strict';
// ===================== Босс: Кривуля → шестиугольник; финал: домик из квадрата и треугольника =====================
function wavyTube(a,b,amp,col){const pts=[];const dx=b.x-a.x,dz=b.z-a.z,l=Math.hypot(dx,dz)||1,nx=-dz/l,nz=dx/l;for(let i=0;i<=24;i++){const k=i/24,w=Math.sin(k*Math.PI*4)*amp*Math.sin(k*Math.PI);pts.push(V3(a.x+dx*k+nx*w,.16+Math.abs(Math.sin(k*Math.PI*6))*.12,a.z+dz*k+nz*w))}
 return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),60,.11,6,false),new THREE.MeshLambertMaterial({color:col||0x8e44d8,emissive:0x2a0050,emissiveIntensity:.5}),0,0,0)}
LEVELS[6]={cast:{queen:true,kriv:true},build(){groundPlane(TEX.grass,0xc8e888);hills(0x9bc86a);BOUNDS=[-10.5,10.5,-3,21.5];
 // двор замка: стены по кругу, башни с флажками
 const wm=new THREE.MeshLambertMaterial({map:TEX.stone,color:0xe8dcc6});
 for(const [x,z,w,d] of [[0,23.5,24,1],[-12,10,1,28],[12,10,1,28]]){const m=mesh(GEO.box,0xe8dcc6,x,1.7,z,null,[w,3.4,d]);m.material=wm}
 for(const [x,z] of [[-12,23.5],[12,23.5],[-12,-4],[12,-4]]){mesh(GEO.cyl,0xd8cbb2,x,2.6,z,null,[1.5,5.2,1.5]);mesh(GEO.cone,0x7a4ad8,x,6.1,z,null,[1.8,1.9,1.8]);mesh(GEO.box,[0xff5a6a,0xffd23a,0x3d8fe8,0x3fbf63][(x>0)+(z>0)*2],x+.45,7.3,z,null,[.8,.5,.04])}
 for(let i=0;i<14;i++)mesh(GEO.box,0xd8cbb2,-11.5+i*1.77,3.75,23.5,null,[.9,.7,1.1]);
 flowers(40,-10,10,-2,21);
 this.hits=0;heroAt(0,2,0);place(QUEEN,7,2.5,-.9);place(KRIV,0,11,Math.PI);this.kb=cylBlock(0,11,1.1,3)},
 async play(){const L=this,KV=KRIV;
  await cutscene(async()=>{shot(3.5,2.6,5,0,1.8,11,2.2);KV.F.mood='angry';await say('b_s');followCam()});
  // ---- фаза 1: отбивай клубки ----
  newTask('Отбей комок обратно — проведи пальцем','kick');run(()=>say('b_t1'));
  const ball=mesh(GEO.sph,new THREE.MeshLambertMaterial({map:TEX.yarn,color:0xc080ff}),0,-5,0,null,.5);
  const B={st:'wait',t:T+2.5,lk:HERO.kickT||0};let hits=0;
  TASK.help=async()=>{await say('b_t1')};
  const tk=dt=>{const hp=V3(HERO.x,1.0,HERO.z),p=ball.position;ball.rotation.x+=dt*6;
   if(B.st==='wait'){if(hits<3&&T>B.t&&!CUT){B.st='in';p.set(KV.root.position.x,2.2,KV.root.position.z-.8);SFX.whoosh();KV.cheerT=T}return}
   const kicked=(HERO.kickT||0)!==B.lk;B.lk=HERO.kickT||0;
   if(B.st==='in'){const d=p.distanceTo(hp);if(kicked&&d<3.4){B.st='out';SFX.kick();burst(p,0xffffff,14,3,.3);clearGesture();return}
    const sp=(TASK.err>=2?3.2:5.2)*(d<3.6?.45:1);const v=hp.clone().sub(p).normalize().multiplyScalar(sp*dt);p.add(v);p.y=Math.max(.5,p.y);
    if(d<.75){B.st='wait';B.t=T+2.6;burst(p,0xc080ff,24,3);p.y=-5;SFX.bump();if(DANIA)DANIA.cheerT=-9;mistake('b_dodge')}}
   else if(B.st==='out'){const kp=V3(KV.root.position.x,1.6,KV.root.position.z);const d=p.distanceTo(kp);p.add(kp.clone().sub(p).normalize().multiplyScalar(14*dt));
    if(d<.9){hits++;B.st='wait';B.t=T+2.4;burst(kp,0xffe066,30,4);p.y=-5;SFX.boing();KV.root.rotation.z=.3;setTimeout(()=>{if(KV)KV.root.rotation.z=0},300);bigNum(hits);run(()=>sayNext(hits===3?'b_hit2':hits===2?'g_good':'b_hit'))}}};
  TICK.push(tk);
  botTask(async()=>{const e0=TASK.err;await bUntil(()=>TASK.err>e0,20);for(let i=0;i<12&&hits<3;i++){await bUntil(()=>hits>=3||(B.st==='in'&&ball.position.distanceTo(V3(HERO.x,1,HERO.z))<2.2),15);if(hits>=3)break;bSwipe();await bWait(.6)}});
  await until(()=>hits>=3);TICK.splice(TICK.indexOf(tk),1);ball.visible=false;GOAL='';await until(()=>!TALK);
  // ---- Кривуля рассыпается в спутанную ломаную ----
  const C=V3(0,0,12),R=5,V=[];for(let i=0;i<6;i++){const a=Math.PI+i*Math.PI/3;V.push(V3(C.x+Math.sin(a)*R,0,C.z+Math.cos(a)*R))}
  const E=V3(2.1,0,5.1);const ends=()=>[0,1,2,3,4,5].map(i=>[V[i],i<5?V[i+1]:E]);
  const edges=[],loops=[];let order=0;
  await cutscene(async()=>{shot(0,9,0,0,0,11,2);KV.F.mood='sad';const t0=T;await until(()=>{KV.root.rotation.y+=.35;return T-t0>1});burst(V3(0,1.5,11),0x8e44d8,60,6);SFX.magic();L.kb.on=false;
   KV.tg.visible=false;KV.anim='sit';
   for(const [a,b] of ends()){edges.push(wavyTube(a,b,.55));const m=V3((a.x+b.x)/2,1.15,(a.z+b.z)/2);const lp=mesh(new THREE.TorusGeometry(1.05,.11,8,28),new THREE.MeshLambertMaterial({color:0x8e44d8,emissive:0x2a0050,emissiveIntensity:.5}),m.x,m.y,m.z);lp.rotation.y=Math.atan2(b.x-a.x,b.z-a.z);loops.push({m,lp,done:false,inside:false,n:loops.length})}
   L.headAt(E);await wait(.4);await say('b_t2')});
  L.tick2=dt=>{L.headAt(E)};TICK.push(L.tick2);
  // ---- фаза 2: пробеги через петли по порядку ----
  newTask('Пробеги через петлю, которая светится','move');
  const glow=()=>{for(const o of loops){o.lp.material.emissive.set(o.done?0x000000:o.n===order?0xffc000:0x2a0050);o.lp.material.emissiveIntensity=o.n===order?.6+Math.sin(T*8)*.35:.5}};
  TASK.help=async()=>{const o=loops[order];if(o)burst(V3(o.m.x,2,o.m.z),0xffe066,40,4);await say('b_ord')};
  const tk2=dt=>{glow();for(const o of loops){if(o.done)continue;const inn=hd(o.m.x,o.m.z)<1.0;if(inn&&!o.inside){if(o.n===order){o.done=true;order++;bigNum(order);SFX.ding();burst(o.m,0xffe066,26,3);
     const [a,b]=ends()[o.n];WORLD.remove(edges[o.n]);edges[o.n]=segMesh(V3(a.x,.16,a.z),V3(b.x,.16,b.z),.12,0xa060f0);const lp=o.lp,t0=T;TICK.push(()=>{const k=clamp(1-(T-t0)*2.5,0,1);lp.scale.setScalar(k);lp.visible=k>0});run(()=>sayNext('n'+order))}
     else mistake('b_ord')}o.inside=inn}};
  TICK.push(tk2);
  botTask(async()=>{await bPath([[6.5,6],[6.5,15.75]]);await bGo(2.17,15.75,.5);await bWait(.8);await bGo(4,17.5,.6);
   for(let i=0;i<6;i++){const o=loops[i];await bGo(o.m.x,o.m.z,.5);await bWait(.25)}});
  await until(()=>order>=6);TICK.splice(TICK.indexOf(tk2),1);GOAL='';await until(()=>!TALK);await good('b_k2');
  // ---- фаза 3: замкни ломаную — неси конец к началу ----
  const mk=mesh(GEO.sph,M(0xffe066,{em:0xffb000,ei:.9}),V[0].x,.4,V[0].z,null,.42);TICK.push(()=>{mk.scale.setScalar(.42*(1+Math.sin(T*6)*.25))});
  await say('b_t3');newTask('Возьми конец и принеси к светящейся точке','hold');
  let carry=false,closed=false;
  const gr=grabber({hp:()=>V3(E.x,.9,E.z),grab:()=>{carry=true;clearGesture()},
   move:dt=>{const tx=HERO.x+Math.sin(HERO.yaw)*1.1,tz=HERO.z+Math.cos(HERO.yaw)*1.1;E.x=lerp(E.x,tx,.25);E.z=lerp(E.z,tz,.25);setSeg(edges[5],V3(V[5].x,.16,V[5].z),V3(E.x,.16,E.z),.12)},
   rel:()=>{carry=false;if(Math.hypot(E.x-V[0].x,E.z-V[0].z)<1.8){closed=true;E.copy(V[0]);setSeg(edges[5],V3(V[5].x,.16,V[5].z),V3(E.x,.16,E.z),.12)}else mistake('b_far')}});
  TASK.help=async()=>{burst(V3(V[0].x,1.2,V[0].z),0xffe066,40,4);await say('b_far')};
  botTask(async()=>{await bGo(E.x,E.z,1.0);bHold(true);await bWait(.4);await bGo(6,3,.7);bHold(false);await bWait(1.5);
   await bGo(E.x,E.z,1.0);bHold(true);await bWait(.4);await bGo(V[0].x-.3,V[0].z-.3,1.2);await bWait(.2);bHold(false)});
  await until(()=>closed);gr.on=false;mk.visible=false;GOAL='';SFX.magic();
  await cutscene(async()=>{shot(0,12,1,0,0,11.5,2);for(const e of edges)e.material=M(0xffd23a,{em:0xffa000,ei:.7});burst(V3(0,1,12),0xffe066,60,6);await say('b_k3');await say('b_cnt');
   const mids=ends().map(([a,b])=>V3((a.x+b.x)/2,.4,(a.z+b.z)/2));await countAloud(mids);await say('b_six');
   // превращение: шестиугольник поднимается и становится телом Кривули
   TICK.splice(TICK.indexOf(L.tick2),1);const t0=T;const grp=new THREE.Group();for(const e of edges){WORLD.remove(e);grp.add(e)}grp.position.set(0,0,0);WORLD.add(grp);
   await until(()=>{const k=clamp((T-t0)/1.4,0,1);const s=1-k*.86;grp.scale.set(s,s,s);grp.position.set(-C.x*(s-1)*0,0,C.z*(1-s));return k>=1});WORLD.remove(grp);
   const hex=mesh(new THREE.TorusGeometry(.72,.14,6,6),M(0xffd23a,{em:0xffa000,ei:.45}),0,.86,-.08,KV.body);hex.rotation.z=Math.PI/6;KV.hex=hex;
   KV.root.position.set(0,0,12);KV.root.rotation.set(0,Math.PI,0);KV.anim='idle';KV.F.mood='happy';burst(V3(0,1.5,12),0xffe066,60,6);SFX.star();
   shot(2.5,2.2,7.5,0,1.3,12,2.4);await say('b_v1');await say('b_v2')});
  // ---- финал: домик — квадрат и треугольник ----
  const hx=4,hz=12.5;const cube=mesh(GEO.box,0x3d8fe8,hx,1.1,hz,null,2.2);mesh(GEO.box,0x7a4a2a,hx,.6,hz-1.11,null,[.7,1.2,.04]);mesh(GEO.box,0xbfe6ff,hx+.6,1.4,hz-1.11,null,[.45,.45,.04]);const cb=block(hx,hz,1.1,1.1,2.2);
  const rs=new THREE.Shape();rs.moveTo(-1.35,0);rs.lineTo(1.35,0);rs.lineTo(0,1.35);rs.closePath();const rg=new THREE.ExtrudeGeometry(rs,{depth:2.3,bevelEnabled:false});rg.translate(0,0,-1.15);
  const roof=mesh(rg,M(0xff5a6a),-3.5,0,5);place(KV,-2,15,Math.PI*.8);
  await say('f_t');newTask('Принеси крышу-треугольник на квадрат','hold');
  let rc=false,built=false;
  const gr2=grabber({hp:()=>V3(roof.position.x,roof.position.y+1.6,roof.position.z),grab:()=>{rc=true;clearGesture()},
   move:dt=>{const p=roof.position;p.x=lerp(p.x,HERO.x+Math.sin(HERO.yaw)*1.3,.25);p.z=lerp(p.z,HERO.z+Math.cos(HERO.yaw)*1.3,.25);p.y=lerp(p.y,2.5,.2)},
   rel:()=>{rc=false;const p=roof.position;if(Math.hypot(p.x-hx,p.z-hz)<3.0){built=true;const a=p.clone(),t0=T;TICK.push(()=>{const k=clamp((T-t0)*2.5,0,1);roof.position.set(lerp(a.x,hx,k),lerp(a.y,2.2,k),lerp(a.z,hz,k));roof.rotation.y=0})}else{const t0=T,y0=p.y;TICK.push(()=>{const k=clamp((T-t0)*3,0,1);if(!rc&&!built)roof.position.y=lerp(y0,0,k)});mistake('f_far')}}});
  TASK.help=async()=>{burst(V3(hx,2.6,hz),0xffe066,40,4);await say('f_far')};
  botTask(async()=>{await bGo(roof.position.x,roof.position.z,1.2);bHold(true);await bWait(.4);await bGo(-1,1,.6);bHold(false);await bWait(1.6);
   await bGo(roof.position.x,roof.position.z,1.2);bHold(true);await bWait(.4);await bGo(hx-.3,hz-1.6,2.6);await bWait(.3);bHold(false)});
  await until(()=>built);gr2.on=false;const cx=hx-6.5,cz=hz-10.5;GOAL='';await wait(.5);
  await cutscene(async()=>{burst(V3(hx,3,hz),0xffe066,60,6);SFX.star();shot(cx,3.4,cz,hx-2,1.5,hz-2,2.4);const fc=(x,z)=>Math.atan2(cx-x,cz-z);heroAt(hx-2,hz-3.4,fc(hx-2,hz-3.4));KRUG.mode='none';place(KRUG,hx-3.4,hz-3.0,fc(hx-3.4,hz-3));place(QUEEN,hx+.2,hz-3.6,fc(hx+.2,hz-3.6));place(KV,hx-4.9,hz-1.9,fc(hx-4.9,hz-1.9));
   await say('f_k');await say('f_1');SV.medal=1;save();const m0=T;
   LVDRAW=()=>{const v=vis(),k=ease(Math.min(1,(T-m0)*1.6));X.fillStyle=`rgba(40,20,90,${.45*k})`;X.fillRect(v.x0,v.y0,v.w,v.h);X.save();X.translate(v.x0+v.w/2,v.y0+v.h*.48);X.scale(k,k);drawMedal(0,0,90);X.restore();
    txt('Мастер фигур',v.x0+v.w/2,v.y0+v.h*.48+150,60,'#ffe08a',{f:FONT,st:'#4a1f8a',lw:10,id:'mf'})};
   if(DANIA)DANIA.cheerT=T;if(KRUG)KRUG.cheerT=T;SFX.star();await say('f_2');await wait(.6);LVDRAW=null;await say('f_3')});HERO.lock=true;shot(cx,3.4,cz,hx-2,1.5,hz-2,2.4)}};
LEVELS[6].headAt=function(E){if(!KRIV)return;KRIV.root.position.set(E.x,-.9,E.z-.42);KRIV.root.rotation.set(0,0,0)};
