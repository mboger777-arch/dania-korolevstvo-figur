'use strict';
// ===== общие помощники уровней =====
const hd=(x,z)=>Math.hypot(HERO.x-x,HERO.z-z);
const angTo=(x,z)=>Math.atan2(x-HERO.x,z-HERO.z);
const adiff=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
const yawDir=y=>({x:Math.sin(y),z:Math.cos(y)});
function wandPos(){const f=yawDir(HERO.yaw);return V3(HERO.x+f.x*.45,HERO.y+1.25,HERO.z+f.z*.45)}
function turnHero(dt,rate){const j=joyWorld();if(j){HERO.yaw+=clamp(adiff(j.a,HERO.yaw),-rate*dt,rate*dt)}}
function terrain(w,d,cx,cz,f,mat,seg){const g=new THREE.PlaneGeometry(w,d,seg||40,seg||40);g.rotateX(-Math.PI/2);const p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i)+cx,z=p.getZ(i)+cz;p.setXYZ(i,x,f(x,z),z)}g.computeVertexNormals();const m=new THREE.Mesh(g,mat);WORLD.add(m);return m}
function pad3D(x,z,col,r,lbl){r=r||.95;const g=new THREE.Group();g.position.set(x,groundAt(x,z)+.02,z);mesh(new THREE.CylinderGeometry(r,r*1.05,.1,32),M(col,{em:col,ei:.55}),0,.04,0,g);
 const ring=mesh(new THREE.TorusGeometry(r+.15,.07,8,36),M(0xffffff,{basic:1,op:.85}),0,.1,0,g);ring.rotation.x=Math.PI/2;WORLD.add(g);g.ring=ring;TICK.push(()=>{ring.scale.setScalar(1+Math.sin(T*4)*.07)});
 if(lbl)label3D(lbl,'#fff',.8,{p:g,st:'#2a1050'}).position.set(-1,2.9,0);return g}
function star3D(x,y,z,col,p){const m=mesh(starGeo(.55),M(col||0xffd84a,{em:col||0xffb000,ei:.7}),x,y,z,p);m.geometry.center();TICK.push(dt=>{m.rotation.y+=dt*1.6});return m}
function goldHandle(){const g=new THREE.Group();mesh(GEO.sph,M(0xffd23a,{em:0xc08000,ei:.8}),0,0,0,g,.26);const r=mesh(new THREE.TorusGeometry(.5,.05,6,24),M(0xfff0a0,{basic:1,op:.8}),0,0,0,g);r.rotation.x=Math.PI/2;TICK.push(()=>{r.scale.setScalar(1+Math.sin(T*5)*.15)});WORLD.add(g);return g}
function treeRing(cx,cz,rx,rz,n,snow){for(let i=0;i<n;i++){const a=i/n*6.283;const x=cx+Math.cos(a)*rx*rnd(.95,1.08),z=cz+Math.sin(a)*rz*rnd(.95,1.08);snow?pine(x,z,rnd(1,1.5),true):(i%3?tree(x,z,rnd(1,1.4)):pine(x,z,rnd(1,1.3)))}}
function dotsDecor(n,x0,x1,z0,z1){const cols=[0xffe066,0xff7ab8,0x7fd0ff,0xffffff];for(let i=0;i<n;i++){const x=rnd(x0,x1),z=rnd(z0,z1);mesh(GEO.sphL,M(cols[i%4],{em:cols[i%4],ei:.6}),x,baseAt(x,z)+.12,z,null,.12)}}
// захват золотой ручки удержанием: hp() — позиция ручки, move(), rel()
function grabber(o){const st={on:true,g:false,h:goldHandle(),rope:segMesh(V3(0,0,0),V3(0,1,0),.05,0xfff4c0,{op:.9})};st.rope.visible=false;
 TICK.push(dt=>{const p=o.hp();st.h.position.copy(p);st.h.visible=st.on;if(!st.on){st.rope.visible=false;return}
  if(!st.g&&INP.hold&&!HERO.lock&&hd(p.x,p.z)<1.7){st.g=true;SFX.chalk();o.grab&&o.grab()}
  if(st.g){if(INP.hold){o.move(dt);st.rope.visible=true;setSeg(st.rope,wandPos(),o.hp(),.05)}else{st.g=false;st.rope.visible=false;o.rel()}}});return st}
// дуга угла: центр P, базис u,v, от a1 до a2
function arcMesh(){const N=28;const g=new THREE.BufferGeometry();const pos=new Float32Array((N+1)*6);g.setAttribute('position',new THREE.BufferAttribute(pos,3));const idx=[];for(let i=0;i<N;i++){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2)}g.setIndex(idx);
 const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:0xffd23a,side:THREE.DoubleSide,transparent:true,opacity:.9,depthTest:false}));m.renderOrder=6;m.frustumCulled=false;WORLD.add(m);
 m.set=(P,u,v,a1,a2,r)=>{for(let i=0;i<=N;i++){const a=a1+(a2-a1)*i/N,c=Math.cos(a),s=Math.sin(a);for(let j=0;j<2;j++){const rr=j?r:r*.7,k=(i*2+j)*3;pos[k]=P.x+(u.x*c+v.x*s)*rr;pos[k+1]=P.y+(u.y*c+v.y*s)*rr;pos[k+2]=P.z+(u.z*c+v.z*s)*rr}}g.attributes.position.needsUpdate=true};return m}
const AK={acute:{t:'острый',c:'#5ab8ff',h:0x5ab8ff},right:{t:'прямой',c:'#ffd23a',h:0xffd23a},obtuse:{t:'тупой',c:'#ff8a4a',h:0xff8a4a}};
function angKind(d){return d<84?'acute':d<=96?'right':'obtuse'}
// карточка угла на экране: текущий угол рядом с уголком книжки
let ANGCARD=null;// {deg, pulse}
function drawAngCard(){if(!ANGCARD)return;const d=ANGCARD.deg,k=angKind(d),K=AK[k];const w=230,h=200,x=safeR()-w,y=safeT()+(TALK?160:96);panel(x,y,w,h,{fill:'rgba(255,250,236,.95)',st:K.c,lw:6,r:22});
 const ox=x+46,oy=y+150,L=96;// книжка-эталон (серым), текущий угол (цветом)
 X.save();if(ANGCARD.pulse&&Math.sin(T*8)>0){X.shadowColor='#ffd23a';X.shadowBlur=20}X.fillStyle='rgba(120,110,150,.25)';X.fillRect(ox,oy-L*.8,L*.8,L*.8);X.restore();
 X.lineCap='round';X.lineWidth=10;X.strokeStyle=K.c;X.beginPath();X.moveTo(ox+L*1.4,oy);X.lineTo(ox,oy);const a=-d*Math.PI/180;X.lineTo(ox+Math.cos(a)*L,oy+Math.sin(a)*L);X.stroke();
 X.lineWidth=5;X.beginPath();if(k==='right'){X.rect(ox,oy-26,26,26)}else{X.arc(ox,oy,32,a,0)}X.stroke();X.fillStyle='#2a1050';X.beginPath();X.arc(ox,oy,8,0,7);X.fill();
 txt(K.t,x+w/2,y+30,38,K.c,{f:FONT,st:'#2a1050',lw:7,id:'ang'})}
function rainOn(x,y,z,n){for(let i=0;i<(n||6);i++)setTimeout(()=>burst(V3(x+rnd(-1.5,1.5),y,z+rnd(-1.5,1.5)),0x8fd8ff,14,2,.25),i*160)}
function cloudPuff(x,y,z,s,col){const g=new THREE.Group();g.position.set(x,y,z);for(let i=0;i<7;i++)mesh(GEO.sphL,M(col||0xe8eef6,{op:.92}),rnd(-1.4,1.4)*s,rnd(-.4,.6)*s,rnd(-.6,.6)*s,g,rnd(.8,1.3)*s);WORLD.add(g);return g}
async function heroWalkTo(x,z,yaw){HERO.lock=true;await until(()=>{const d=hd(x,z);if(d<.3)return true;const a=angTo(x,z);HERO.yaw=a;const sp=Math.min(5,d*4);HERO.x+=Math.sin(a)*sp*DT;HERO.z+=Math.cos(a)*sp*DT;HERO.sp=sp;if(DANIA)DANIA.anim='run';return false});if(yaw!=null)HERO.yaw=yaw;HERO.lock=false}
function botTask(fn){TASK.bot=fn;TASK.botN=(TASK.botN||0)+1}

// ===================== Глава 1: Долина Точек =====================
LEVELS[0]={cast:{queen:true},build(){groundPlane();hills();treeRing(0,20,20,26,34);dotsDecor(120,-16,16,-4,44);BOUNDS=[-15,15,-4,44];
 const A={x:0,z:8.5},B={x:4,z:15.5};this.A=A;this.B=B;this.bridge=false;this.fog=true;
 const water=mesh(new THREE.PlaneGeometry(80,3.6),M(0x3fa8f0,{em:0x104080,ei:.3}),0,.04,12);water.rotation.x=-Math.PI/2;
 for(const z of [10.1,13.9]){const bank=mesh(GEO.box,0x9a7a4a,0,.06,z,null,[80,.1,.3])}
 NOGO.push((x,z)=>{if(z<10.2||z>13.8)return false;if(!this.bridge)return true;const t=clamp(((x-A.x)*(B.x-A.x)+(z-A.z)*(B.z-A.z))/65,0,1);return Math.hypot(x-(A.x+(B.x-A.x)*t),z-(A.z+(B.z-A.z)*t))>1.05});
 NOGO.push((x,z)=>this.fog&&z>27.5);
 this.pA=pad3D(A.x,A.z,0xffc02e,.95,'А');const post=mesh(GEO.cyl,0xb08a5a,B.x,.6,B.z,null,[.12,1.2,.12]);this.star=star3D(B.x,1.6,B.z);label3D('Б','#fff',1.1).position.set(B.x,2.8,B.z);
 for(const [x,z] of [[-1.5,9.8],[1.4,9.8],[-1.2,14.2],[2,14.2]])mesh(GEO.box,0x8a6a40,x,.3,z,null,[.25,.6,.25]);
 this.pL=pad3D(0,22,0x7fd0ff,.95);const lh=new THREE.Group();lh.position.set(-2.4,0,22);for(let i=0;i<4;i++)mesh(GEO.cyl,i%2?0xffffff:0xf2683c,0,.5+i,0,lh,[.6-i*.06,1,.6-i*.06]);mesh(GEO.sph,M(0xfff0a0,{em:0xffd000,ei:1}),0,4.4,0,lh,.4);mesh(GEO.cone,0xf2683c,0,5,0,lh,[.5,.5,.5]);WORLD.add(lh);cylBlock(-2.4,22,.7,5);
 this.clouds=[[-8,30],[0,34],[8,30]].map(([x,z])=>{const c=cloudPuff(x,2.2,z,1.5,0xd8dde8);c.hp=.8;c.alive=true;return c});
 this.rails=new THREE.Group();this.rails.position.z=40;for(const s of [-.6,.6])mesh(GEO.box,0x9aa0b0,0,.12,s,this.rails,[600,.12,.12]);for(let x=-300;x<=300;x+=1.4)mesh(GEO.box,0x8a5a30,x,.05,0,this.rails,[.35,.08,1.8]);WORLD.add(this.rails);this.rails.visible=false;
 this.train=new THREE.Group();this.train.position.set(0,0,40);[0xf2683c,0x3d7be0,0xf5c242,0x5cbf6a].forEach((c,i)=>{mesh(GEO.box,c,-i*2.4,.9,0,this.train,[2.1,1.2,1.4]);for(const w of [-.6,.6])for(const s of [-.7,.7]){const wh=mesh(GEO.cyl,0x333344,-i*2.4+w,.35,s,this.train,[.32,.12,.32]);wh.rotation.x=Math.PI/2}});mesh(GEO.cyl,0x333344,.6,1.9,0,this.train,[.22,.6,.22]);WORLD.add(this.train);this.train.visible=false;
 TICK.push(dt=>{if(this.train.visible){this.train.position.x+=dt*9;if(this.train.position.x>60)this.train.position.x=-60}});
 heroAt(0,0,0);QUEEN.root.visible=false;place(QUEEN,3,37,Math.PI)},
 async play(){const L=this,A=L.A,B=L.B;
  await cutscene(async()=>{shot(5,4,1,1,1,12);await say('c1_s')});
  // --- отрезок-мост ---
  newTask('Встань на точку А','move');const mk=marker(A.x,A.z);run(()=>say('u_move'));
  botTask(async()=>{await bGo(A.x,A.z,.4)});
  await until(()=>hd(A.x,A.z)<1);mk.visible=false;
  newTask('Держи палец и целься в звёздочку Б','hold');run(()=>sayNext('c1_t1'));
  const dAB=Math.hypot(B.x-A.x,B.z-A.z);const st={len:0,wait:false,done:false,saidB:false,wide:.17};
  const beam=segMesh(V3(0,0,0),V3(0,1,0),.08,0xffffff,{mat:M(0xffffff,{em:0xffffaa,ei:1})});const glow=segMesh(V3(0,0,0),V3(0,1,0),.2,0xfff080,{op:.35});beam.visible=glow.visible=false;
  let guide=null;
  TASK.help=async()=>{if(!guide){guide=segMesh(V3(A.x,.15,A.z),V3(B.x,.15,B.z),.12,0xffe066,{op:.5});st.wide=.4}await say('c1_help')};
  botTask(async()=>{await bGo(A.x,A.z,.4);const a0=Math.atan2(B.x-A.x,B.z-A.z);const e0=TASK.err;bHold(true);bAimA(a0+.9);await bUntil(()=>TASK.err>e0,12);bHold(false);bAimA(null);await bWait(1);await bGo(A.x,A.z,.3);bHold(true);bAimA(a0);await bUntil(()=>st.len>=dAB-.4,8);await bWait(.3);bHold(false);bAimA(null)});
  const onA=()=>hd(A.x,A.z)<1.2;
  TICK.push(dt=>{if(st.done)return;const O=wandPos();
   if(onA()&&!st.cam){st.cam=1;shot(-2.2,4.4,2.6,2.2,1,13.5,2.5)}else if(!onA()&&st.cam&&!INP.hold){st.cam=0;followCam()}
   if(INP.hold&&onA()&&!st.wait){HERO.mode='still';turnHero(dt,2.2);const aB=Math.atan2(B.x-HERO.x,B.z-HERO.z);const aimed=Math.abs(adiff(HERO.yaw,aB))<st.wide;if(aimed)HERO.yaw+=adiff(aB,HERO.yaw)*.15;
    st.len=aimed?Math.min(dAB-.25,st.len+dt*5):st.len+dt*5;const E=V3(B.x,1.6,B.z);const dir=aimed?E.clone().sub(O).normalize():V3(Math.sin(HERO.yaw),0,Math.cos(HERO.yaw));const end=O.clone().addScaledVector(dir,st.len);
    beam.visible=glow.visible=true;setSeg(beam,O,end,.08);setSeg(glow,O,end,.2);if(Math.random()<.3)SFX.chalk&&0;
    if(aimed&&st.len>=dAB-.3&&!st.saidB){st.saidB=1;run(()=>sayNext('c1_t1b'))}
    if(st.len>dAB+2.5){st.wait=true;st.len=0;beam.visible=glow.visible=false;const ray=segMesh(O,O.clone().addScaledVector(dir,80),.1,0xffffff,{op:.8});let t=0;TICK.push(d=>{t+=d;ray.material.opacity=Math.max(0,.8-t*.7);if(t>1.3)ray.visible=false});SFX.whoosh();mistake('c1_ray')}}
   else{if(st.len>0){const aB=Math.atan2(B.x-HERO.x,B.z-HERO.z);if(st.len>=dAB-.9&&Math.abs(adiff(HERO.yaw,aB))<st.wide+.05&&onA()){st.done=true}else{st.len=0;beam.visible=glow.visible=false}}
    if(!INP.hold)st.wait=false;HERO.mode='walk'}});
  await until(()=>st.done);HERO.mode='walk';followCam();clearGesture();GOAL='';beam.visible=glow.visible=false;if(guide)guide.visible=false;
  // мост: отрезок от А до Б, доски
  const P=V3(A.x,.25,A.z),Q=V3(B.x,.25,B.z);segMesh(V3(A.x,1.1,A.z),V3(B.x,1.6,B.z),.06,0xffffff,{mat:M(0xffffff,{em:0xffffcc,ei:1})});for(const p of [V3(A.x,1.1,A.z),V3(B.x,1.6,B.z)])mesh(GEO.sph,M(0xff5a7a,{em:0xff2050,ei:.6}),p.x,p.y,p.z,null,.16);
  const ang=Math.atan2(B.x-A.x,B.z-A.z);for(let i=0;i<=12;i++){const t=i/12;const pl=mesh(GEO.box,0xb88a50,lerp(P.x,Q.x,t),.18,lerp(P.z,Q.z,t),null,[2,.12,.55]);pl.rotation.y=ang;pl.scale.x=.01;const t0=T+i*.07;TICK.push(()=>{pl.scale.x=clamp((T-t0)*6,0.01,1)*2})}
  L.bridge=true;SFX.magic();burst(V3((A.x+B.x)/2,1,(A.z+B.z)/2),0xffe066,40,5);await good('c1_k1');
  // --- луч-фонарик против тумана ---
  newTask('Встань на точку-фонарик и свети на туман','move');const mk2=marker(0,22);run(()=>sayAll('c1_t2','c1_t2b'));
  const rs={len:0,off:false,left:3,done:false};const rb=segMesh(V3(0,0,0),V3(0,1,0),.1,0xfff4b0,{mat:M(0xfff8c0,{em:0xffee80,ei:1})});const rg=segMesh(V3(0,0,0),V3(0,1,0),.32,0xfff080,{op:.3});rb.visible=rg.visible=false;
  TASK.help=async()=>{mk2.visible=true;await say('u_go')};
  botTask(async()=>{const e0=TASK.err;await bPath([[.6,9.8],[3.2,14.2],[2,16.5]]);await bGo(0,17,.6);bHold(true);await bUntil(()=>TASK.err>e0,6);bHold(false);await bGo(0,22,.3);bHold(true);for(const c of L.clouds){if(!c.alive)continue;bAim(c.position.x,c.position.z);await bUntil(()=>!c.alive,8)}bHold(false);bAimA(null)});
  const onL=()=>hd(0,22)<1.2;
  TICK.push(dt=>{if(rs.done)return;if(onL()){mk2.visible=false;if(!rs.cam){rs.cam=1;shot(0,5.5,13.5,0,2,30,2.5)}}else if(rs.cam&&!INP.hold){rs.cam=0;followCam()}
   if(INP.hold&&onL()){HERO.mode='still';turnHero(dt,1.8);rs.len=Math.min(70,rs.len+dt*45);const O=wandPos();const dir=V3(Math.sin(HERO.yaw),.04,Math.cos(HERO.yaw));const end=O.clone().addScaledVector(dir,rs.len);rb.visible=rg.visible=true;setSeg(rb,O,end,.1);setSeg(rg,O,end,.32);
    for(const c of L.clouds){if(!c.alive)continue;const a=Math.atan2(c.position.x-HERO.x,c.position.z-HERO.z);if(Math.abs(adiff(HERO.yaw,a))<.24&&rs.len>8){c.hp-=dt;c.position.x+=Math.sin(T*40)*.03;c.scale.setScalar(.6+c.hp/2);if(c.hp<=0){c.alive=false;c.visible=false;burst(c.position,0xffffff,40,5,.5);SFX.magic();rs.left--;if(rs.left>0)run(()=>sayNext('c1_fog'));else rs.done=true}}}}
   else{rb.visible=rg.visible=false;rs.len=0;HERO.mode='walk';
    }
   if(INP.hold&&!onL()&&!HERO.lock&&T-INP.holdT>.35&&!rs.off&&HERO.z>14.5){rs.off=true;mistake('c1_off')}if(!INP.hold)rs.off=false});
  await until(()=>rs.done);rb.visible=rg.visible=false;HERO.mode='walk';followCam();clearGesture();GOAL='';L.fog=false;await good('c1_k2');
  // --- прямая-рельсы ---
  await cutscene(async()=>{L.rails.visible=true;L.train.visible=true;L.train.position.x=-30;QUEEN.root.visible=true;burst(V3(3,1.5,37),0xffe080,30);heroAt(1,34,0);shot(-1,3.2,31,3,1.6,37,2.5);await say('c1_t3');
   shot(8,1.5,38,-60,.6,40,1.2);await wait(1.5);shot(-8,1.5,38,60,.6,40,1.2);await say('c1_k3');await wait(.5)})}};

// ===================== Глава 2: Ломаная гора (санки) =====================
const SLOPE=z=>z<0?0:z<88?-.25*z:z<96?-22-(.25*8*((z-88)/8)-.25*8*((z-88)/8)**2/2):-23;
LEVELS[1]={cast:{queen:true},build(){SCENE.fog.color.set(0xe8f2ff);SKY.material.uniforms.b.value.set(0xeaf4ff);BASEF=(x,z)=>SLOPE(z)+(Math.abs(x)>14?(Math.abs(x)-14)*.6:0);
 terrain(80,180,0,50,(x,z)=>(z>96.5&&z<109.5?-32:SLOPE(z))+(Math.abs(x)>14?(Math.abs(x)-14)*.6:0),new THREE.MeshLambertMaterial({map:TEX.snow,color:0xffffff}),60);
 terrain(160,90,0,165,(x,z)=>-23+(Math.abs(x)>16?(Math.abs(x)-16)*.4:0),new THREE.MeshLambertMaterial({color:0xcfe8ff}),20);
 for(let i=0;i<40;i++){const z=rnd(-8,150),s=Math.random()<.5?-1:1;const x=s*rnd(13,24);pine(x,z,rnd(1.2,1.8),true)}
 for(let i=0;i<8;i++){const a=i/8*Math.PI-Math.PI;mesh(GEO.cone,M(0xb8c8e8),Math.cos(a)*110,-14,230+Math.sin(a)*30,null,[22,44,22])}
 BOUNDS=[-11,11,-6,128];this.chasm=true;{const pit=mesh(new THREE.PlaneGeometry(80,13),M(0x1a2650,{basic:1}),0,-31,103);pit.rotation.x=-Math.PI/2}const lb=[[0,95],[3,100],[-3,105],[0,111]];this.lb=lb;
 NOGO.push((x,z)=>{if(z<96||z>110)return false;if(!this.chasm)return false;for(let i=0;i<3;i++){const[a,b]=[lb[i],lb[i+1]];const dx=b[0]-a[0],dz=b[1]-a[1];const t=clamp(((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz),0,1);if(Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t)<1.05&&this.bridge)return false}return true});
 
 this.sled=new THREE.Group();mesh(GEO.box,0xe0303a,0,.22,0,this.sled,[1,.14,1.9]);for(const s of [-.42,.42]){mesh(GEO.box,0x888899,s,.06,0,this.sled,[.08,.08,2]);const t=mesh(GEO.cylL,0x888899,s,.14,1,this.sled,[.05,.25,.05]);t.rotation.x=.6}WORLD.add(this.sled);
 this.flags=[];heroAt(0,-3,0);QUEEN.root.visible=true;place(QUEEN,-3,-1,.6);
 this.trail=[];this.goal=marker(0,118);this.goal.visible=false},
 mkFlags(list){for(const f of this.flags){WORLD.remove(f.g)}this.flags=list.map(([x,z,c])=>{const g=new THREE.Group();g.position.set(x,SLOPE(z),z);mesh(GEO.cylL,0x5a4030,0,1.2,0,g,[.06,2.4,.06]);const fl=mesh(GEO.tri||GEO.box,M(c,{em:c,ei:.4}),.45,2.1,0,g,[.9,.6,.08]);if(!GEO.tri)fl.scale.set(.9,.55,.05);
  const r=mesh(new THREE.RingGeometry(1.1,1.4,24),M(c,{basic:1,op:.6}),0,.06,0,g);r.rotation.x=-Math.PI/2;WORLD.add(g);return{x,z,c,g,hit:false,blue:c!==0xff3030}})},
 async ride(n,flags){// одна поездка: true — без ошибок
  const L=this;L.mkFlags(flags);heroAt(0,0,0);fade=.7;HERO.mode='sled';KRUG.mode='ride';DANIA.anim='sit';const verts=[V3(0,SLOPE(0)+.3,0)];const segs=[];let res=null,lastZ=0;CAMS.dist=7;CAMS.h=3.6;CAMS.snap=true;
  const tick=dt=>{if(res)return;HERO.vx=HERO.vz=0;HERO.z+=9*dt;HERO.x=clamp(HERO.x-INP.jx*7.5*dt,-10,10);HERO.y=SLOPE(HERO.z);HERO.yaw=-INP.jx*.35;HERO.gr=true;HERO.sp=0;DANIA.anim='sit';
   L.sled.position.set(HERO.x,HERO.y,HERO.z);L.sled.rotation.set(Math.atan(.25)*(HERO.z<88?1:0),HERO.yaw,0);DANIA.root.position.y=HERO.y+.18;DANIA.root.rotation.x=L.sled.rotation.x;KRUG.root.position.set(HERO.x+Math.sin(HERO.yaw)*.75,SLOPE(HERO.z+.75)+.2,HERO.z+.75);KRUG.root.rotation.y=HERO.yaw;KRUG.root.rotation.x=L.sled.rotation.x;KRUG.anim='sit';
   for(const f of L.flags){if(f.hit||f.passed)continue;if(lastZ<f.z&&HERO.z>=f.z){f.passed=true;if(Math.abs(HERO.x-f.x)<1.7){f.hit=true;if(!f.blue){res='red';return}SFX.ding();burst(V3(f.x,SLOPE(f.z)+1.5,f.z),0xffe066,24);const v=V3(f.x,SLOPE(f.z)+.3,f.z);const s=segMesh(verts[verts.length-1],v,.12,0xffe066,{mat:M(0xffe066,{em:0xffc000,ei:1})});segs.push(s);verts.push(v);bigNum(segs.length)}
     else if(f.blue&&!f.alt){res='miss';return}}}
   lastZ=HERO.z;if(HERO.z>90)res='ok'};
  TICK.push(tick);await until(()=>res);TICK.splice(TICK.indexOf(tick),1);DANIA.root.rotation.x=0;KRUG.root.rotation.x=0;
  if(res!=='ok'){for(const s of segs)s.visible=false;SFX.bump();HERO.mode='still';return res}KRUG.anim='idle';
  HERO.mode='walk';KRUG.mode='follow';CAMS.dist=6.4;CAMS.h=3.1;L.sled.position.set(-2,SLOPE(92),92);L.sled.rotation.set(0,.4,0);return 'ok'},
 async play(){const L=this;
  await cutscene(async()=>{shot(4,3,-6,0,-6,30,2);await say('c2_s');shot(-1,2.4,-5,-3,1.7,-1,3);await say('c2_r')});
  // поездка 1: четыре флажка = четыре звена
  const run1=[[-5,20,0x3d7be0],[5,38,0x3d7be0],[-5,56,0x3d7be0],[5,74,0x3d7be0]];
  newTask('Проедь через все четыре флажка','move');run(()=>say('c2_t1'));needGesture('move');
  TASK.help=async()=>{await say('c2_help')};
  botTask(async()=>{let first=true;while(true){const e0=TASK.err;await bUntil(()=>HERO.mode==='sled',20);await bSled(L,first?2:-1);if(!first)break;await bUntil(()=>TASK.err>e0||HERO.mode!=='sled',30);first=false}});
  for(;;){const r=await L.ride(1,run1);if(r==='ok')break;mistake('c2_miss');await wait(1.4)}
  clearGesture();GOAL='';await good('c2_k1');
  // поездка 2: три синих, красные объезжать
  const run2=[[6,25,0x3d7be0],[-6,25,0xff3030],[-6,50,0x3d7be0],[6,50,0xff3030],[5,75,0x3d7be0],[-5,75,0xff3030]];
  newTask('Только синие флажки — три звена');await say('c2_t2');
  botTask(async()=>{let first=true;while(true){const e0=TASK.err;await bUntil(()=>HERO.mode==='sled',20);await bSled(L,first?'red':-1);if(!first)break;await bUntil(()=>TASK.err>e0||HERO.mode!=='sled',30);first=false}});
  for(;;){const r=await L.ride(2,run2);if(r==='ok')break;mistake(r==='red'?'c2_red':'c2_miss');await wait(1.4)}
  GOAL='';await good();
  // молния-мост через пропасть
  await cutscene(async()=>{heroAt(0,92,0);shot(7,-18,90,0,-22,104,2);const lb=L.lb;for(let i=0;i<3;i++){const a=V3(lb[i][0],-23.3,lb[i][1]),b=V3(lb[i+1][0],-23.3,lb[i+1][1]);const s=segMesh(a,b,.3,0xffe066,{mat:M(0xffe066,{em:0xffb000,ei:.9})});s.scale.z=s.scale.x=.01;const t0=T;TICK.push(()=>{const k=clamp((T-t0)*3,0.01,1)*.3;s.scale.x=s.scale.z=k});SFX.zap();burst(b,0xffe066,30,4);bigNum(i+1);await wait(.6)}
   L.bridge=true;await say('c2_k2')});
  newTask('Беги по молнии на ту сторону');L.goal.visible=true;run(()=>say('u_go'));
  botTask(async()=>{for(const [x,z] of L.lb)await bGo(x,z,.6);await bGo(0,118,.6)});
  await until(()=>hd(0,118)<1.3);L.goal.visible=false}};

// ===================== Глава 3: Кузница углов =====================
LEVELS[2]={cast:{queen:true},build(){SKY.material.uniforms.a.value.set(0xffa860);SKY.material.uniforms.b.value.set(0xffe2b8);SCENE.fog.color.set(0xffe2b8);
 groundPlane(TEX.stone,0xd8c0a0);hills(0xa07858);BOUNDS=[-12,12,-4,46];
 for(const z of [4,16,28,40])for(const s of [-1,1]){mesh(GEO.box,0x8a6a5a,s*11,1.5,z,null,[1.2,3,1.2]);const f=mesh(GEO.sph,M(0xffa030,{em:0xff6000,ei:1}),s*11,3.4,z,null,.4)}
 mesh(GEO.box,0x6a4a3a,-8,2.5,46,null,[8,5,2]);mesh(GEO.box,0x6a4a3a,8,2.5,46,null,[8,5,2]);
 // станция 1: ворота-книжка, петля H
 this.H={x:-1.6,z:10};this.ps=-(Math.PI-35*Math.PI/180);this.bar=mesh(GEO.box,M(0xb070ff,{op:.45,em:0x8040ff,ei:.6}),.2,1.3,10,null,[3.6,2.6,.12]);this.barB=block(.2,10,1.8,.2,2.6);const fixed=mesh(GEO.box,0x7a5a9a,this.H.x-1.6,1.2,this.H.z,null,[3.2,2.4,.22]);block(this.H.x-1.6,this.H.z,1.6,.15,2.4);
 mesh(GEO.box,0x6a4a3a,-6.5,1.2,10,null,[3.2,2.4,.5]);block(-6.5,10,1.6,.3,2.4);mesh(GEO.box,0x6a4a3a,4.5,1.2,10,null,[5,2.4,.5]);block(4.5,10,2.5,.3,2.4);
 this.door=new THREE.Group();mesh(GEO.box,0xc08a40,1.6,1.2,0,this.door,[3.2,2.4,.2]);for(let i=0;i<3;i++)mesh(GEO.box,0x8a5a20,.5+i*1.1,1.2,.12,this.door,[.12,2.2,.06]);this.door.position.set(this.H.x,0,this.H.z);WORLD.add(this.door);mesh(GEO.cyl,0x444455,this.H.x,1.25,this.H.z,null,[.18,2.6,.18]);
 this.db=block(0,0,1.6,.15,2.4);
 // книжка-эталон
 const bk=new THREE.Group();bk.position.set(-5,0,7);mesh(GEO.box,0x3d7be0,0,.25,0,bk,[2.2,.5,1.6]);mesh(GEO.box,0xfffbe8,.05,.26,0,bk,[2.1,.4,1.5]);const cm=mesh(GEO.box,M(0xffd23a,{em:0xffb000,ei:.8}),-1.05,.52,-.75,bk,[.5,.04,.06]);cm.position.x=-.85;const cm2=mesh(GEO.box,M(0xffd23a,{em:0xffb000,ei:.8}),-1.08,.52,-.55,bk,[.06,.04,.45]);WORLD.add(bk);this.book=bk;block(-5,7,1.1,.8,.5);
 // станция 2: крыша-шалаш на z=22
 this.f=3.3;this.Lb=3.6;this.rz=22;this.boards=[0,1].map(()=>mesh(GEO.box,0xb07a40,0,0,0,null,[.25,this.Lb,3]));this.roofB=block(0,22,3.4,1.6,1.5);
 // станция 3: полка с навесом z 34..40, верх 2.2
 mesh(GEO.box,0x8a6a5a,0,1.1,38,null,[4,2.2,4]);block(0,38,2,2,2.2);mesh(GEO.box,0x9a7a6a,0,2.0,35,null,[4,.4,2]);block(0,35,2,1,2.2,0,{y0:1.85});
 this.d=-1.2;this.ramp=mesh(GEO.box,0xc89a50,0,0,0,null,[1.4,.14,1]);SURF.push((x,z)=>{if(Math.abs(x)>.75)return null;const fz=34-this.d;if(this.d<=.05)return null;if(z<34||z>fz)return null;return 2.2*(fz-z)/(fz-34)});
 this.arc1=arcMesh();this.arc2=arcMesh();this.arc3=arcMesh();this.arc2.visible=this.arc3.visible=false;
 heroAt(0,0,0);place(QUEEN,2.5,5,-.8);this.layout()},
 layout(){const H=this.H,ps=this.ps;this.door.rotation.y=-ps;const tip={x:H.x+Math.cos(ps)*3.2,z:H.z+Math.sin(ps)*3.2};this.tip=tip;const db=this.db;db.cx=H.x+Math.cos(ps)*1.6;db.cz=H.z+Math.sin(ps)*1.6;db.ang=-ps;
  const deg=180-Math.abs(ps)*180/Math.PI;this.deg1=deg;this.arc1.set(V3(H.x,2.5,H.z),V3(-1,0,0),V3(0,0,-1),0,deg*Math.PI/180,1.3);this.arc1.material.color.set(AK[angKind(deg)].h);
  // крыша
  const f=this.f,Lb=this.Lb,h=Math.sqrt(Lb*Lb-f*f),z=this.rz;this.apex=V3(0,h,z);this.alpha=2*Math.asin(f/Lb)*180/Math.PI;const tl=Math.atan2(f,h);this.boards[0].position.set(-f/2,h/2,z);this.boards[0].rotation.set(0,0,-tl);this.boards[1].position.set(f/2,h/2,z);this.boards[1].rotation.set(0,0,tl);
  this.roofB.hx=f+.2;const a2=this.alpha*Math.PI/360;this.arc2.set(V3(0,h,z-1.55),V3(0,-1,0),V3(1,0,0),-a2,a2,.9);this.arc2.material.color.set(AK[angKind(this.alpha)].h);
  // пандус
  const d=this.d,len=Math.hypot(d,2.2);this.beta=Math.acos(-d/len)*180/Math.PI;const fz=34-d;this.ramp.position.set(0,1.1,(34+fz)/2);this.ramp.scale.z=len;this.ramp.rotation.set(Math.atan2(-2.2,-d),0,0);
  {const u=V3(0,0,1),dirR=V3(0,-2.2,-d).normalize();const vv=dirR.clone().sub(u.clone().multiplyScalar(dirR.dot(u))).normalize();this.arc3.set(V3(.8,2.22,34),u,vv,0,this.beta*Math.PI/180,1)}
  this.arc3.material.color.set(AK[angKind(this.beta)].h)},
 async play(){const L=this;
  await cutscene(async()=>{shot(4,3.5,-2,-1,1.5,10,2);await say('c3_s');shot(-2.5,2.4,4.5,-5,.4,7,3);await say('c3_r')});
  // --- ворота: прямой угол ---
  newTask('Открой створку на прямой угол','hold');const m1=marker(L.tip.x,L.tip.z);run(()=>say('c3_t1'));
  const s1={done:false};ANGCARD={deg:L.deg1};
  TASK.help=async()=>{ANGCARD.pulse=1;const m=marker(-5,7);await say('c3_help');m.visible=false};
  const g1=grabber({hp:()=>V3(L.tip.x,1.3,L.tip.z),grab(){m1.visible=false;L.db.on=false},move(){const a=Math.atan2(HERO.z-L.H.z,HERO.x-L.H.x);L.ps=clamp(a,-Math.PI+.35,-.15);L.layout();ANGCARD.deg=L.deg1;if(Math.random()<.05)SFX.creak()},
   rel(){L.db.on=true;const d=L.deg1;if(d>=80&&d<=100){L.ps=-Math.PI/2;L.layout();ANGCARD.deg=90;s1.done=true;L.bar.visible=false;L.barB.on=false;burst(V3(.2,1.3,10),0xb070ff,40,4)}else if(d>100)mistake('c3_wide');else mistake('c3_narrow')}});
  botTask(async()=>{const e0=TASK.err;await bGo(L.tip.x+.3,L.tip.z-.8,.5);bHold(true);await bWait(.3);await bGo(L.H.x+2.72,L.H.z-1.27,.3);bHold(false);await bUntil(()=>TASK.err>e0,4);await bWait(.5);await bGo(L.tip.x+.3,L.tip.z-.8,.5);bHold(true);await bWait(.3);await bGo(L.H.x,L.H.z-3.3,.3);bHold(false)});
  TICK.push(()=>{if(!s1.done&&hd(L.H.x,L.H.z)<6&&!s1.cam){s1.cam=1;shot(L.H.x+1,8.5,L.H.z-8.5,L.H.x-.5,0,L.H.z-1.5,2.5)}});
  await until(()=>s1.done);g1.on=false;SFX.ok();followCam();clearGesture();GOAL='';await good('c3_k1');
  // --- крыша: острый угол ---
  ANGCARD={deg:L.alpha};L.arc1.visible=false;L.arc2.visible=true;newTask('Сделай угол крыши острым','hold');run(()=>say('c3_t2'));const s2={done:false};
  const cl=cloudPuff(0,7.5,22,1.4,0x9aa8c0);cl.visible=false;
  TASK.help=async()=>{const m=marker(1.7,20.3);await say('u_go');await wait(3);m.visible=false};
  const g2=grabber({hp:()=>V3(L.f,.5,20.3),move(){L.f=clamp(HERO.x,.8,3.4);L.layout();ANGCARD.deg=L.alpha;if(Math.random()<.05)SFX.creak()},rel(){if(L.alpha<85)s2.done=true;else mistake('c3_notsharp')}});
  botTask(async()=>{const e0=TASK.err;await bGo(3.3,19.4,.5);bHold(true);await bWait(.3);await bGo(2.9,19.4,.25);bHold(false);await bUntil(()=>TASK.err>e0,4);await bWait(.4);await bGo(3,19.4,.4);bHold(true);await bWait(.3);await bGo(1.6,19.4,.25);bHold(false)});
  TICK.push(()=>{if(!s2.done&&HERO.z>14&&!s2.cam){s2.cam=1;shot(0,3.2,12.5,0,2,22,2.5)}});
  await until(()=>s2.done);g2.on=false;cl.visible=true;rainOn(0,6.5,22,8);SFX.ok();await wait(1.2);clearGesture();GOAL='';await good('c3_k2');cl.visible=false;followCam();
  // --- пандус: тупой угол ---
  ANGCARD={deg:L.beta};L.arc2.visible=false;L.arc3.visible=true;newTask('Сделай пологую горку — тупой угол','hold');run(()=>say('c3_t3'));const s3={done:false};KRUG.mode='go';KRUG.tgt={x:-1.6,z:30};
  TASK.help=async()=>{const m=marker(.9,31.5);await say('u_go');await wait(3);m.visible=false};
  const slide=async()=>{KRUG.mode='none';const fz=34-L.d;const pts=[];for(let i=0;i<=20;i++)pts.push(i/20);KRUG.root.position.set(0,0,fz-.6);for(const t of pts){const z=lerp(fz-.4,lerp(fz,34,.45),t);KRUG.root.position.set(0,groundAt(0,z,9),z);await wait(.03)}SFX.boing();for(const t of pts){const z=lerp(lerp(fz,34,.45),fz-.8,t);KRUG.root.position.set(0,groundAt(0,z,9),z);await wait(.02)}KRUG.mode='go';KRUG.tgt={x:-1.6,z:30}};
  const g3=grabber({hp:()=>V3(.9,.4,34-L.d),move(){L.d=clamp(34-HERO.z,-1.2,4.5);L.layout();ANGCARD.deg=L.beta;if(Math.random()<.05)SFX.creak()},rel(){if(L.beta>=130)s3.done=true;else{TASK.err++;G.mistakes=(G.mistakes||0)+1;SFX.bad();run(async()=>{if(L.d>.3)await slide();else SFX.bump();await sayNext('c3_steep');if(TASK.err>=2&&TASK.help)await TASK.help()})}}});
  botTask(async()=>{const e0=TASK.err;await bPath([[5,19.5],[5,31],[1.4,32.5]]);await bGo(1.4,35.6,.5);bHold(true);await bWait(.3);await bGo(1.4,33.5,.25);bHold(false);await bUntil(()=>TASK.err>e0,8);await bWait(2.5);await bGo(1.4,33.2,.5);bHold(true);await bWait(.3);await bGo(1.4,30.6,.25);bHold(false)});
  TICK.push(()=>{if(!s3.done&&HERO.z>26&&!s3.cam){s3.cam=1;shot(9,3.2,31.5,0,1.4,33.5,2.5)}});
  await until(()=>s3.done);g3.on=false;SFX.ok();clearGesture();GOAL='';HERO.lock=true;
  const fz=34-L.d;KRUG.mode='go';KRUG.tgt={x:0,z:fz-.8};await until(()=>Math.hypot(KRUG.root.position.x,KRUG.root.position.z-fz+.8)<.3,GEN);KRUG.tgt={x:0,z:37};await until(()=>KRUG.root.position.z>36.5);KRUG.cheerT=T;HERO.lock=false;await say('c3_k3');ANGCARD=null}};
