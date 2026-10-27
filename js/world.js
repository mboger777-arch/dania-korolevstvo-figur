'use strict';
// ===== 3D: сцена, земля и препятствия, герой-контроллер, камера, физика, модели героев =====
const GC=document.getElementById('g');
const R3=new THREE.WebGLRenderer({canvas:GC,antialias:true,powerPreference:'high-performance'});
R3.setPixelRatio(Math.min(1.5,window.devicePixelRatio||1));R3.outputColorSpace=THREE.SRGBColorSpace;
const SCENE=new THREE.Scene();const CAM=new THREE.PerspectiveCamera(52,16/9,.1,420);
// адаптивное качество: если телефон не тянет 50 к/с — снижаем плотность пикселей (до 1.0)
let PRMAX=1.5,lowT=0;function adaptPR(dt){if(G.test)return;if(FPS<48&&T>4){lowT+=dt;if(lowT>2.5&&PRMAX>1){PRMAX=Math.max(1,PRMAX-.25);lowT=0;resize3D()}}else lowT=0}
function resize3D(){if(!W||!H)return;R3.setPixelRatio(Math.min(PRMAX,window.devicePixelRatio||1));R3.setSize(W,H,false);CAM.aspect=W/H;CAM.updateProjectionMatrix()}
const HEMI=new THREE.HemisphereLight(0xe8f4ff,0x88b060,1.9);SCENE.add(HEMI);
const SUN=new THREE.DirectionalLight(0xfff0d6,2.2);SUN.position.set(6,12,-4);SCENE.add(SUN);
const V3=(x,y,z)=>new THREE.Vector3(x,y,z);
// небо
const SKY=new THREE.Mesh(new THREE.SphereGeometry(300,24,12),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,uniforms:{a:{value:new THREE.Color(0x5fb4ff)},b:{value:new THREE.Color(0xdff3ff)}},
 vertexShader:'varying float h;void main(){h=normalize(position).y;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform vec3 a,b;varying float h;void main(){gl_FragColor=vec4(mix(b,a,clamp(h*1.6,0.,1.)),1.);}'}));
SCENE.add(SKY);SCENE.fog=new THREE.Fog(0xdff3ff,60,190);
// ---- материалы и геометрия ----
const MC={};function M(c,o){const k=c+'|'+JSON.stringify(o||{});if(!MC[k]){o=o||{};MC[k]=o.basic?new THREE.MeshBasicMaterial({color:c,transparent:!!o.op,opacity:o.op||1,depthWrite:o.op?false:true,fog:o.fog!==false}):new THREE.MeshLambertMaterial({color:c,emissive:o.em||0,emissiveIntensity:o.ei||1,transparent:!!o.op,opacity:o.op||1,flatShading:!!o.flat})}return MC[k]}
const GEO={sph:new THREE.SphereGeometry(1,20,14),sphL:new THREE.SphereGeometry(1,12,8),box:new THREE.BoxGeometry(1,1,1),cyl:new THREE.CylinderGeometry(1,1,1,20),cylL:new THREE.CylinderGeometry(1,1,1,10),cone:new THREE.ConeGeometry(1,1,16),tri:new THREE.CylinderGeometry(1,1,1,3),hex:new THREE.CylinderGeometry(1,1,1,6),pent:new THREE.CylinderGeometry(1,1,1,5)};
function mesh(g,m,x,y,z,p,s){const o=new THREE.Mesh(g,typeof m==='string'||typeof m==='number'?M(m):m);o.position.set(x||0,y||0,z||0);if(s!=null){if(typeof s==='number')o.scale.setScalar(s);else o.scale.set(s[0],s[1],s[2])}(p||WORLD).add(o);return o}
function capsule(r,len,c,p,x,y,z){return mesh(new THREE.CapsuleGeometry(r,len,4,12),c,x,y,z,p)}
function cvTex(w,h,fn,rep){const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep,rep)}t.anisotropy=4;return t}
const TEX={};
TEX.grass=cvTex(256,256,(x,w,h)=>{x.fillStyle='#7cc85a';x.fillRect(0,0,w,h);for(let i=0;i<900;i++){x.fillStyle=`hsla(${95+Math.random()*30},${50+Math.random()*25}%,${40+Math.random()*22}%,.55)`;x.fillRect(Math.random()*w,Math.random()*h,2,5)}},40);
TEX.snow=cvTex(256,256,(x,w,h)=>{x.fillStyle='#f4f8ff';x.fillRect(0,0,w,h);for(let i=0;i<500;i++){x.fillStyle=`rgba(${170+Math.random()*40},${195+Math.random()*30},255,.35)`;x.beginPath();x.arc(Math.random()*w,Math.random()*h,1+Math.random()*3,0,7);x.fill()}},20);
TEX.stone=cvTex(256,256,(x,w,h)=>{x.fillStyle='#d9c7a6';x.fillRect(0,0,w,h);x.strokeStyle='rgba(120,90,60,.35)';x.lineWidth=3;for(let r=0;r<8;r++)for(let c=0;c<4;c++){x.strokeRect(c*64+(r%2)*32,r*32,64,32)}},24);
TEX.blob=cvTex(128,128,(x,w,h)=>{const g=x.createRadialGradient(64,64,4,64,64,62);g.addColorStop(0,'rgba(30,30,60,.55)');g.addColorStop(1,'rgba(30,30,60,0)');x.fillStyle=g;x.fillRect(0,0,w,h)});
TEX.dot=cvTex(64,64,(x,w,h)=>{const g=x.createRadialGradient(32,32,2,32,32,31);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.4,'rgba(255,255,255,.6)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,w,h)});
TEX.yarn=cvTex(128,128,(x,w,h)=>{x.fillStyle='#8a3fd1';x.fillRect(0,0,w,h);x.strokeStyle='#5a1f9a';x.lineWidth=4;for(let i=0;i<14;i++){x.beginPath();x.moveTo(Math.random()*w,Math.random()*h);x.bezierCurveTo(Math.random()*w,Math.random()*h,Math.random()*w,Math.random()*h,Math.random()*w,Math.random()*h);x.stroke()}});
// ---- мир уровня ----
let WORLD=new THREE.Group();SCENE.add(WORLD);
let BLOCKS=[],CYLS=[],NOGO=[],BASEF=null,BOUNDS=null,SURF=[];
function clearWorld(){SCENE.remove(WORLD);WORLD.traverse(o=>{if(o.geometry&&!Object.values(GEO).includes(o.geometry))o.geometry.dispose()});WORLD=new THREE.Group();SCENE.add(WORLD);
 BLOCKS=[];CYLS=[];NOGO=[];SURF=[];BASEF=null;BOUNDS=null;FX.length=0;SYNC.length=0;CHARS.slice().forEach(removeChar);TICK.length=0;physReset();SCENE.fog.near=60;SCENE.fog.far=190;SCENE.fog.color.set(0xdff3ff);SKY.material.uniforms.a.value.set(0x5fb4ff);SKY.material.uniforms.b.value.set(0xdff3ff)}
const TICK=[];// функции обновления уровня (dt)
// препятствие-коробка (повёрнутая): верх y1 — можно встать сверху
function block(cx,cz,hx,hz,y1,ang,o){o=o||{};const b={cx,cz,hx,hz,y0:o.y0||0,y1,ang:ang||0,on:true,tag:o.tag};BLOCKS.push(b);return b}
function cylBlock(x,z,r,y1){const c={x,z,r,y1,on:true};CYLS.push(c);return c}
function inBlock(b,x,z,pad){const dx=x-b.cx,dz=z-b.cz,c=Math.cos(b.ang),s=Math.sin(b.ang);const lx=dx*c-dz*s,lz=dx*s+dz*c;return Math.abs(lx)<=b.hx+(pad||0)&&Math.abs(lz)<=b.hz+(pad||0)?[lx,lz]:null}
function baseAt(x,z){return BASEF?BASEF(x,z):0}
// высшая опора под точкой не выше y+step
function groundAt(x,z,y,step){step=step==null?.5:step;let g=baseAt(x,z);if(y==null)y=1e9;for(const b of BLOCKS){if(!b.on)continue;if(b.y1>g&&b.y1<=y+step&&inBlock(b,x,z,0))g=b.y1}for(const c of CYLS){if(!c.on)continue;if(c.y1>g&&c.y1<=y+step&&Math.hypot(x-c.x,z-c.z)<=c.r)g=c.y1}for(const f of SURF){const v=f(x,z);if(v!=null&&v>g&&v<=y+step)g=v}return g}
// выталкивание круга радиуса r из стен
function collide(p,r,y){y=y||0;for(const b of BLOCKS){if(!b.on||b.y1<=y+.5||b.y0>y+1.6)continue;const l=inBlock(b,p.x,p.z,r);if(!l)continue;const[lx,lz]=l;const px=b.hx+r-Math.abs(lx),pz=b.hz+r-Math.abs(lz);const c=Math.cos(b.ang),s=Math.sin(b.ang);let nx=0,nz=0;
  if(px<pz){nx=Math.sign(lx)*px}else{nz=Math.sign(lz)*pz}// локальный сдвиг -> мировой
  p.x+=nx*c+nz*s;p.z+=-nx*s+nz*c}
 for(const c of CYLS){if(!c.on||c.y1<=y+.5)continue;const dx=p.x-c.x,dz=p.z-c.z,d=Math.hypot(dx,dz);if(d<c.r+r&&d>1e-4){p.x=c.x+dx/d*(c.r+r);p.z=c.z+dz/d*(c.r+r)}}
 if(BOUNDS){p.x=clamp(p.x,BOUNDS[0]+r,BOUNDS[1]-r);p.z=clamp(p.z,BOUNDS[2]+r,BOUNDS[3]-r)}}
function nogo(x,z){for(const f of NOGO)if(f(x,z))return true;return false}
// ---- физика (cannon-es) ----
let PW=null;const SYNC=[];let HB=null;
function physReset(){PW=new CANNON.World({gravity:new CANNON.Vec3(0,-22,0)});PW.defaultContactMaterial.friction=.35;PW.defaultContactMaterial.restitution=.15;PW.allowSleep=true;
 const gp=new CANNON.Body({mass:0,shape:new CANNON.Plane()});gp.quaternion.setFromEuler(-Math.PI/2,0,0);PW.addBody(gp);
 HB=new CANNON.Body({mass:0,type:CANNON.Body.KINEMATIC,shape:new CANNON.Sphere(.45)});PW.addBody(HB);PW.usePhys=false}
function physBody(m,shape,mass,x,y,z,o){o=o||{};const b=new CANNON.Body({mass,shape,linearDamping:o.damp==null?.35:o.damp,angularDamping:.6,fixedRotation:!!o.fixed});b.position.set(x,y,z);PW.addBody(b);SYNC.push({m,b});PW.usePhys=true;return b}
function stepPhys(dt){if(!PW||!PW.usePhys)return;HB.position.set(HERO.x,HERO.y+.5,HERO.z);HB.velocity.set(HERO.vx,0,HERO.vz);for(const b of PW.bodies)if(b.sleepState===2&&b.type===1&&Math.abs(b.position.x-HERO.x)<2.5&&Math.abs(b.position.z-HERO.z)<2.5)b.wakeUp();PW.step(1/60,dt,3);for(const s of SYNC){s.m.position.copy(s.b.interpolatedPosition);s.m.quaternion.copy(s.b.interpolatedQuaternion)}}
// ---- частицы и эффекты ----
const FX=[];
function burst(p,col,n,sp,size){const g=new THREE.BufferGeometry();const N=n||24,pos=new Float32Array(N*3),vel=[];for(let i=0;i<N;i++){pos[i*3]=p.x;pos[i*3+1]=p.y;pos[i*3+2]=p.z;const a=Math.random()*6.28,b=Math.random()*1.4,v=(sp||4)*(.5+Math.random()*.7);vel.push([Math.cos(a)*Math.cos(b)*v,Math.sin(b)*v+2,Math.sin(a)*Math.cos(b)*v])}
 g.setAttribute('position',new THREE.BufferAttribute(pos,3));const m=new THREE.PointsMaterial({color:col||0xffe066,size:size||.35,map:TEX.dot,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});const pts=new THREE.Points(g,m);WORLD.add(pts);FX.push({pts,vel,life:1.1,t:0})}
function stepFX(dt){for(let i=FX.length-1;i>=0;i--){const f=FX[i];f.t+=dt;const a=f.pts.geometry.attributes.position;for(let j=0;j<f.vel.length;j++){const v=f.vel[j];v[1]-=6*dt;a.array[j*3]+=v[0]*dt;a.array[j*3+1]+=v[1]*dt;a.array[j*3+2]+=v[2]*dt}a.needsUpdate=true;f.pts.material.opacity=Math.max(0,1-f.t/f.life);if(f.t>f.life){WORLD.remove(f.pts);f.pts.geometry.dispose();f.pts.material.dispose();FX.splice(i,1)}}}
// светящийся отрезок между точками
function segMesh(a,b,r,col,o){o=o||{};const d=new THREE.Vector3().subVectors(b,a),L=d.length();const m=new THREE.Mesh(GEO.cylL,o.mat||M(col,{basic:1,op:o.op}));m.scale.set(r,Math.max(L,.001),r);m.position.copy(a).addScaledVector(d,.5);m.quaternion.setFromUnitVectors(V3(0,1,0),d.clone().normalize());(o.p||WORLD).add(m);return m}
function setSeg(m,a,b,r){const d=new THREE.Vector3().subVectors(b,a),L=d.length();if(L<1e-4){m.visible=false;return}m.visible=true;m.scale.set(r,L,r);m.position.copy(a).addScaledVector(d,.5);m.quaternion.setFromUnitVectors(V3(0,1,0),d.normalize())}
// надпись-спрайт (всегда к камере)
function label3D(t,col,h,o){o=o||{};const f=o.num?NUM:FONT;const c=document.createElement('canvas');const x=c.getContext('2d');x.font='120px '+f;const w=Math.ceil(x.measureText(t).width)+60;c.width=w;c.height=170;x.font='120px '+f;x.textAlign='center';x.textBaseline='middle';x.lineJoin='round';x.lineWidth=22;x.strokeStyle=o.st||'#2a1050';x.strokeText(t,w/2,90);x.fillStyle=col||'#ffe066';x.fillText(t,w/2,90);
 const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,depthTest:o.depth!==false,transparent:true}));s.scale.set(h*w/170,h,1);s.renderOrder=5;(o.p||WORLD).add(s);return s}
// маркер цели: прыгающая стрелка + кольцо
function marker(x,z,col){const g=new THREE.Group();g.position.set(x,groundAt(x,z),z);const ar=mesh(GEO.cone,M(col||0xffd23a,{em:col||0xffb000,ei:.6}),0,2.6,0,g,[.35,.6,.35]);ar.rotation.x=Math.PI;
 const ring=mesh(new THREE.RingGeometry(.7,.95,28),M(col||0xffd23a,{basic:1,op:.85}),0,.04,0,g);ring.rotation.x=-Math.PI/2;WORLD.add(g);g.userData.t=Math.random()*5;
 TICK.push(dt=>{g.userData.t+=dt;ar.position.y=2.4+Math.sin(g.userData.t*4)*.25;ring.scale.setScalar(1+Math.sin(g.userData.t*4)*.08)});return g}
function blobShadow(p){const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:TEX.blob,transparent:true,depthWrite:false}));m.rotation.x=-Math.PI/2;m.renderOrder=1;(p||SCENE).add(m);return m}
// ---- декор ----
function tree(x,z,s){s=s||1;const g=new THREE.Group();g.position.set(x,baseAt(x,z),z);mesh(GEO.cylL,0x8a5a32,0,.8*s,0,g,[.18*s,1.6*s,.18*s]);mesh(GEO.sphL,0x4fae3c,0,2.1*s,0,g,1.05*s);mesh(GEO.sphL,0x63c24a,.45*s,2.5*s,.2*s,g,.7*s);WORLD.add(g);cylBlock(x,z,.35*s,3);return g}
function pine(x,z,s,snow){s=s||1;const g=new THREE.Group();g.position.set(x,baseAt(x,z),z);mesh(GEO.cylL,0x7a4a2a,0,.4*s,0,g,[.15*s,.8*s,.15*s]);for(let i=0;i<3;i++)mesh(GEO.cone,snow&&i==2?0xf4f8ff:0x2f8a4a,0,(1.1+i*.7)*s,0,g,[(1.1-i*.28)*s,1.1*s,(1.1-i*.28)*s]);WORLD.add(g);cylBlock(x,z,.35*s,3);return g}
const HC=[0xf2683c,0x3d7be0,0xf5c242,0x5cbf6a,0xe05a8a,0x9a6bd8];
function house(x,z,s,ang,ci,solid){s=s||1;ci=ci==null?Math.floor(Math.random()*6):ci;const g=new THREE.Group();g.position.set(x,baseAt(x,z),z);g.rotation.y=ang||0;
 mesh(GEO.box,HC[ci%6],0,s,0,g,2*s);const r=mesh(GEO.tri,HC[(ci+2)%6],0,2*s+.62*s,0,g,[1.45*s,2.1*s,1.45*s]);r.rotation.z=Math.PI/2;r.rotation.y=Math.PI/2;
 mesh(GEO.box,0x7a4a2a,0,.55*s,1.01*s,g,[.6*s,1.1*s,.04]);mesh(GEO.box,0xbfe6ff,.55*s,1.3*s,1.01*s,g,[.4*s,.4*s,.04]);WORLD.add(g);if(solid!==false)block(x,z,1.05*s,1.05*s,4*s,ang||0);return g}
function cloud(x,y,z,s){const g=new THREE.Group();g.position.set(x,y,z);for(let i=0;i<5;i++)mesh(GEO.sphL,M(0xffffff,{em:0xffffff,ei:.35}),(i-2)*1.3*s,Math.sin(i)*.3*s,Math.cos(i*2)*.4*s,g,(1.1+Math.sin(i*1.7)*.4)*s);WORLD.add(g);return g}
function flowers(n,x0,x1,z0,z1){const cols=[0xff6fa8,0xffe14a,0xffffff,0xb07cff,0xff8a3a];for(let i=0;i<n;i++){const x=rnd(x0,x1),z=rnd(z0,z1);mesh(GEO.sphL,cols[i%5],x,baseAt(x,z)+.15,z,WORLD,.13)}}
function groundPlane(tex,col){const m=new THREE.Mesh(new THREE.PlaneGeometry(400,400),new THREE.MeshLambertMaterial({map:tex||TEX.grass,color:col||0xffffff}));m.rotation.x=-Math.PI/2;WORLD.add(m);return m}
function hills(col){for(let i=0;i<14;i++){const a=i/14*6.283,r=rnd(110,150);mesh(GEO.sphL,col||0x6fbf55,Math.cos(a)*r,-8,Math.sin(a)*r,WORLD,[rnd(20,34),rnd(14,26),rnd(20,34)])}}
// ---- лицо: холст-текстура (моргание, взгляд, рот при речи, настроение) ----
function makeFace(kind){const c=document.createElement('canvas');c.width=256;c.height=192;const x=c.getContext('2d');const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
 const F={kind,tex,blink:0,lx:0,ly:0,mouth:0,mood:kind==='kriv'?'angry':'happy',key:'',nb:1+Math.random()*2};
 F.draw=function(){const k=[this.blink>0?1:0,Math.round(this.lx*4),Math.round(this.ly*4),Math.round(this.mouth*4),this.mood].join();if(k===this.key)return;this.key=k;x.clearRect(0,0,256,192);
  const big=kind==='krug'?1.5:kind==='kriv'?1.2:1.12;const ex=kind==='krug'?52:44,ey=kind==='queen'?86:84;const ew=24*big,eh=(kind==='krug'?34:29)*big;
  for(const s of [-1,1]){const cx=128+s*ex,cy=ey;
   if(this.blink>0){x.strokeStyle='#3a2410';x.lineWidth=7;x.lineCap='round';x.beginPath();x.arc(cx,cy-4,ew*.8,.25*Math.PI,.75*Math.PI);x.stroke()}
   else{x.fillStyle='#fff';x.beginPath();x.ellipse(cx,cy,ew,eh,0,0,7);x.fill();x.lineWidth=4;x.strokeStyle='#3a2410';x.stroke();
    const px=cx+this.lx*ew*.4,py=cy+this.ly*eh*.35;x.fillStyle=kind==='kriv'?'#3c0f60':kind==='krug'?'#1c0e06':'#4a2810';x.beginPath();x.arc(px,py,ew*(kind==='krug'?.78:.68),0,7);x.fill();x.fillStyle='#120804';x.beginPath();x.arc(px,py,ew*.34,0,7);x.fill();
    x.fillStyle='#fff';x.beginPath();x.arc(px-ew*.22,py-ew*.25,ew*.2,0,7);x.fill()}
   // брови
   x.strokeStyle=kind==='kriv'?'#3c0f60':kind==='queen'?'#9a9aa6':'#5a3014';x.lineWidth=kind==='krug'?0:7;x.lineCap='round';
   if(x.lineWidth){x.beginPath();if(this.mood==='angry'){x.moveTo(cx-s*ew*1.1,cy-eh-14);x.lineTo(cx+s*ew*.6,cy-eh+2)}else if(this.mood==='sad'){x.moveTo(cx-s*ew,cy-eh-2);x.lineTo(cx+s*ew*.7,cy-eh-14)}else{x.arc(cx,cy-eh+8,ew*1.05,1.15*Math.PI,1.85*Math.PI)}x.stroke()}
   if(kind==='queen'){x.strokeStyle='#a87a12';x.lineWidth=7;x.beginPath();x.arc(cx,cy,ew*1.35,0,7);x.stroke()}}
  if(kind==='queen'){x.strokeStyle='#a87a12';x.lineWidth=7;x.beginPath();x.moveTo(128-ex+ew*1.35,ey);x.lineTo(128+ex-ew*1.35,ey);x.stroke()}
  // щёчки
  if(kind!=='kriv'){x.fillStyle='rgba(255,110,120,.45)';for(const s of [-1,1]){x.beginPath();x.ellipse(128+s*(ex+18),ey+40,17,11,0,0,7);x.fill()}}
  if(kind==='dania'){x.fillStyle='rgba(170,90,50,.5)';for(const s of [-1,1])for(let i=0;i<3;i++){x.beginPath();x.arc(128+s*(ex+8+i*7),ey+30+(i%2)*6,2.4,0,7);x.fill()}}
  // рот
  const my=kind==='krug'?150:142,mw=kind==='krug'?30:24;x.lineCap='round';
  if(this.mouth>.1){x.fillStyle='#8a1f2a';x.beginPath();x.ellipse(128,my,mw*.8,6+this.mouth*14,0,0,7);x.fill();x.fillStyle='#ff7a8a';x.beginPath();x.ellipse(128,my+4+this.mouth*6,mw*.45,3+this.mouth*4,0,0,7);x.fill()}
  else{x.strokeStyle='#5a1a1a';x.lineWidth=6;x.beginPath();if(this.mood==='angry'||this.mood==='sad')x.arc(128,my+16,mw,1.2*Math.PI,1.8*Math.PI);else x.arc(128,my-12,mw,.2*Math.PI,.8*Math.PI);x.stroke()}
  this.tex.needsUpdate=true};
 F.step=function(dt,who){this.nb-=dt;if(this.blink>0){this.blink-=dt;}else if(this.nb<0){this.blink=.13;this.nb=2.2+Math.random()*2.8}
  this.mouth=talking(who)&&TALK.playing!==false?Math.abs(Math.sin((T-TALK.t0)*11))*.9+.1*Math.sin(T*23):Math.max(0,this.mouth-dt*6);this.draw()};
 F.draw();return F}
function faceCap(F,r,p,y,z,w,h){const g=new THREE.SphereGeometry(r*1.012,28,18,Math.PI/2-w/2,w,Math.PI/2-h/2,h);const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({map:F.tex,transparent:true,alphaTest:.25}));m.position.set(0,y||0,z||0);p.add(m);return m}
// ---- персонажи ----
const CHARS=[];
function starGeo(r){const s=new THREE.Shape();for(let i=0;i<10;i++){const a=i/10*6.283+Math.PI/2,rr=i%2?r*.45:r;const px=Math.cos(a)*rr,py=Math.sin(a)*rr;i?s.lineTo(px,py):s.moveTo(px,py)}s.closePath();return new THREE.ExtrudeGeometry(s,{depth:r*.3,bevelEnabled:false})}
// ---- модели героев по refs/lineup.jpg: пропорции арта, одежда, дыхание, моргание, взгляд, бег ----
function grp(p,x,y,z){const g=new THREE.Group();g.position.set(x||0,y||0,z||0);p.add(g);return g}
function ell(c,p,x,y,z,sx,sy,sz){return mesh(GEO.sph,c,x,y,z,p,[sx,sy,sz])}
function capTop(r,th,c,p,x,y,z){return mesh(new THREE.SphereGeometry(r,28,14,0,Math.PI*2,0,th),c,x,y,z,p)}
function spike(p,c,d,r0,len,w){d=d.clone().normalize();const m=mesh(GEO.cone,c,0,0,0,p,[w,len,w]);m.position.copy(d).multiplyScalar(r0+len*.38);m.quaternion.setFromUnitVectors(V3(0,1,0),d);return m}
function sdir(pol,az){return V3(Math.sin(pol)*Math.sin(az),Math.cos(pol),Math.sin(pol)*Math.cos(az))}
function rng(seed){let s=seed||7;return()=>{s=(s*9301+49297)%233280;return s/233280}}
function tanglePts(n,seed,R,cy){const rn=rng(seed);const P=[];for(let i=0;i<n;i++){const a=rn()*6.283,b=(rn()-.5)*2.6;P.push(V3(Math.cos(a)*Math.cos(b)*R,cy+Math.sin(b)*R,Math.sin(a)*Math.cos(b)*R))}return P}
function blobPts(n,seed,c,rx,ry,rz,avoid){const rn=rng(seed);const P=[];while(P.length<n){const a=rn()*6.283,b=(rn()-.5)*3,k=.75+rn()*.3;const v=V3(Math.cos(a)*Math.cos(b)*rx*k,Math.sin(b)*ry*.6*k,Math.sin(a)*Math.cos(b)*rz*k);if(avoid&&avoid(v))continue;P.push(v.add(c))}return P}
function limbPts(a,b,amp,n,seed,curl){const rn=rng(seed);const P=[];for(let i=0;i<=n;i++){const t=i/n;const p=a.clone().lerp(b,t);const e=Math.sin(t*Math.PI)*amp;p.x+=(rn()-.5)*e;p.y+=(rn()-.5)*e*.6;p.z+=(rn()-.5)*e;P.push(p)}
 if(curl){for(let i=1;i<=8;i++){const an=i/8*6.283;P.push(b.clone().add(V3(Math.cos(an)*curl-curl,Math.sin(an)*curl*.25,Math.sin(an)*curl)))}}return P}
function removeChar(ch){if(!ch)return;SCENE.remove(ch.root);if(ch.shadow)SCENE.remove(ch.shadow);const i=CHARS.indexOf(ch);if(i>=0)CHARS.splice(i,1)}
function place(ch,x,z,yaw){ch.root.position.set(x,groundAt(x,z),z);if(yaw!=null)ch.root.rotation.y=yaw}
function faceTo(ch,x,z){ch.root.rotation.y=Math.atan2(x-ch.root.position.x,z-ch.root.position.z)}
// ---- герой ----
const HERO={x:0,y:0,z:0,vx:0,vz:0,vy:0,yaw:0,gr:true,mode:'walk',sp:0,model:null,airT:0,lock:false,speed:6.2,stuck:0};
let DANIA=null,KRUG=null,QUEEN=null,KRIV=null;
function spawnHeroes(o){o=o||{};CHARS.slice().forEach(removeChar);DANIA=makeDania();HERO.model=DANIA;KRUG=o.krug===false?null:makeKrug();QUEEN=o.queen?makeQueen():null;KRIV=o.kriv?makeKriv():null;if(KRUG)KRUG.mode='follow'}
function heroAt(x,z,yaw){HERO.x=x;HERO.z=z;HERO.y=groundAt(x,z);HERO.vy=0;HERO.vx=HERO.vz=0;HERO.gr=true;HERO.yaw=yaw||0;CAMS.yaw=HERO.yaw;CAMS.snap=true;if(KRUG){place(KRUG,x-1.3,z-1.2,HERO.yaw);KRUG.mode='follow'}}
function camYawNow(){return Math.atan2(CAMS.tgt.x-CAMS.pos.x,CAMS.tgt.z-CAMS.pos.z)}
// направление джойстика в мире (относительно камеры) или null
function joyWorld(){const cy=camYawNow();const fx=Math.sin(cy),fz=Math.cos(cy),rx=-Math.cos(cy),rz=Math.sin(cy);const mx=fx*INP.jy+rx*INP.jx,mz=fz*INP.jy+rz*INP.jx;const m=Math.hypot(mx,mz);return m>.3?{x:mx/m,z:mz/m,a:Math.atan2(mx,mz),m}:null}
// ---- контроллер героя: настройки (см. PROGRESS.md «Физика движения») ----
const MOVE={acc:16,dec:22,turnDec:30,airK:.35,turn:13,dead:.12,jumpV:7.6,g:24,gFall:38,maxFall:18,coyote:.1,buffer:.12,step:.5,stepLerp:18,runPerM:2.1};
function heroStep(dt){const h=HERO;const m=h.model;if(!m)return;let jumped=false;
 // fixed timestep для героя: шаги по 1/120 с, рендер получает последнее состояние (без дрожи при скачущем fps)
 h.acc=(h.acc||0)+dt;const H=1/120;let n=0;while(h.acc>=H&&n<12){heroTick(H);h.acc-=H;n++}if(n>=12)h.acc=0;
 h.sp=Math.hypot(h.vx,h.vz);
 m.root.position.set(h.x,h.y,h.z);m.root.rotation.y=h.yaw;m.hold=INP.hold&&(h.mode==='walk'||h.mode==='still');
 if(h.mode==='walk'||h.mode==='still')m.anim=!h.gr?'air':h.sp>.6?'run':'idle';
 if(h.landQ){const v=h.landQ;h.landQ=0;if(m)m.sq=Math.min(.16,.06+v*.012);if(v>4&&typeof burst==='function')burst(V3(h.x,h.y+.1,h.z),0xe8dcc0,10,1.6,.25)}
 if(h.jumpQ){h.jumpQ=0;if(m)m.sq=-.08}
 if(h.mode==='walk'&&!h.lock&&takeSwipe()){m.kickT=T;SFX.kick();h.kickT=T}}
function heroTick(dt){const h=HERO;
 if(h.gr)h.coy=MOVE.coyote;else h.coy=Math.max(0,(h.coy||0)-dt);
 if(INP.tapQ&&T-INP.tapQ<MOVE.buffer+.02&&h.mode==='walk'&&!h.lock){if(h.coy>0&&h.vy<=0){INP.tapQ=0;h.vy=MOVE.jumpV;h.gr=false;h.coy=0;h.jumpQ=1;SFX.jump()}}
 else if(INP.tapQ&&T-INP.tapQ>=MOVE.buffer+.02&&h.mode==='walk')INP.tapQ=0;
 if(h.mode==='walk'&&!h.lock){const cy=camYawNow();const fx=Math.sin(cy),fz=Math.cos(cy),rx=-Math.cos(cy),rz=Math.sin(cy);let mx=fx*INP.jy+rx*INP.jx,mz=fz*INP.jy+rz*INP.jx;let mag=Math.hypot(mx,mz);
  const a=mag<MOVE.dead?0:Math.min(1,(mag-MOVE.dead)/(1-MOVE.dead));// мёртвая зона + аналоговая скорость (шаг/бег)
  const tv=h.speed*a;const tx=a>0?mx/mag*tv:0,tz=a>0?mz/mag*tv:0;
  let dvx=tx-h.vx,dvz=tz-h.vz;const dl=Math.hypot(dvx,dvz);
  const opp=h.vx*tx+h.vz*tz<0;let ac=a>0?(opp?MOVE.turnDec:MOVE.acc):MOVE.dec;if(!h.gr)ac*=MOVE.airK;
  const st=ac*dt*Math.max(1,h.speed*.35);if(dl>st){dvx*=st/dl;dvz*=st/dl}h.vx+=dvx;h.vz+=dvz;
  if(a>0){const ty=Math.atan2(mx,mz);let d=angW(ty-h.yaw);const mt=MOVE.turn*dt;h.yaw+=clamp(d*Math.min(1,dt*16),-mt,mt)}}
 else if(h.lock||h.mode==='still'){const k=Math.exp(-dt*20);h.vx*=k;h.vz*=k;if(Math.hypot(h.vx,h.vz)<.02)h.vx=h.vz=0;INP.tapQ=0}
 // перемещение + скольжение вдоль стен (без залипания)
 const p={x:h.x+h.vx*dt,z:h.z+h.vz*dt};if(nogo(p.x,p.z)){if(!nogo(p.x,h.z)){p.z=h.z;h.vz*=.5}else if(!nogo(h.x,p.z)){p.x=h.x;h.vx*=.5}else{p.x=h.x;p.z=h.z;h.vx=h.vz=0}}
 collide(p,.4,h.y);if(nogo(p.x,p.z)){p.x=h.x;p.z=h.z}
 const g=groundAt(p.x,p.z,h.y,MOVE.step);if(g>h.y+MOVE.step){p.x=h.x;p.z=h.z}
 if(p.x!==h.x||p.z!==h.z){const ddx=p.x-h.x,ddz=p.z-h.z,want=Math.hypot(h.vx,h.vz)*dt;if(want>1e-4){const got=Math.hypot(ddx,ddz);if(got<want*.98){h.vx=ddx/dt;h.vz=ddz/dt}}}
 else if(h.vx||h.vz){h.vx=h.vz=0}
 h.x=p.x;h.z=p.z;
 // вертикаль: подъём на ступеньку плавно, падение быстрее подъёма, предел скорости падения
 const gg=groundAt(h.x,h.z,h.y,MOVE.step);
 if(h.gr&&gg>h.y+.005&&gg<=h.y+MOVE.step){h.y=gg;h.vy=0}// ноги сразу на ступеньке, плавность даёт камера (HERO.cy)
 else if(!h.gr||h.y>gg+.03){if(h.gr&&h.y-gg<.18){h.y=gg}else{h.gr=false;const gv=h.vy>0?MOVE.g:MOVE.gFall;h.vy=Math.max(-MOVE.maxFall,h.vy-gv*dt);h.y+=h.vy*dt;h.airT+=dt;if(h.y<=gg){h.y=gg;if(h.vy<-3)SFX.land();h.landQ=-h.vy;h.vy=0;h.gr=true;h.airT=0}}}
 else{h.y=gg;h.vy=0;h.gr=true;h.airT=0}}
// спутник следует за героем
function krugStep(dt){const k=KRUG;if(!k)return;const r=k.root.position;let sp=0;
 if(k.mode==='follow'){const fx=Math.sin(HERO.yaw),fz=Math.cos(HERO.yaw);const tx=HERO.x-fx*1.5-fz*1.3,tz=HERO.z-fz*1.5+fx*1.3;const dx=tx-r.x,dz=tz-r.z,d=Math.hypot(dx,dz);
  if(d>14){r.x=tx;r.z=tz}else if(d>.4){sp=Math.min(HERO.speed*1.05,d*2.2);const p={x:r.x+dx/d*sp*dt,z:r.z+dz/d*sp*dt};collide(p,.45,r.y);if(!nogo(p.x,p.z)){r.x=p.x;r.z=p.z}k.root.rotation.y=Math.atan2(dx,dz)}
  else{const a=Math.atan2(CAM.position.x-r.x,CAM.position.z-r.z);k.root.rotation.y+=Math.atan2(Math.sin(a-k.root.rotation.y),Math.cos(a-k.root.rotation.y))*.05}
  r.y=groundAt(r.x,r.z,r.y+.3)}
 else if(k.mode==='go'&&k.tgt){const dx=k.tgt.x-r.x,dz=k.tgt.z-r.z,d=Math.hypot(dx,dz);if(d>.15){sp=Math.min(5,d*3);r.x+=dx/d*sp*dt;r.z+=dz/d*sp*dt;k.root.rotation.y=Math.atan2(dx,dz)}r.y=groundAt(r.x,r.z,r.y+.3)}
 k.sp=sp}
// ---- камера ----
const CAMS={yaw:0,dist:5.0,h:2.4,look:1.25,mode:'follow',pos:V3(0,5,-8),tgt:V3(0,1,0),snap:true,k:5,fov:52};
function shot(px,py,pz,lx,ly,lz,k){CAMS.mode='shot';CAMS.sp=V3(px,py,pz);CAMS.sl=V3(lx,ly,lz);CAMS.k=k||3}
// в катсцене говорящий герой — крупным планом лицом к камере (через ~1 с после начала реплики)
const TALKCH={dania:()=>DANIA,krug:()=>KRUG,queen:()=>QUEEN,kriv:()=>KRIV};
function summonQueen(c){const h=HERO;let vx=CAMS.sl.x-CAMS.sp.x,vz=CAMS.sl.z-CAMS.sp.z;const n=Math.hypot(vx,vz)||1;vx/=n;vz/=n;
 const x=h.x+vz*1.9-vx*.4,z=h.z-vx*1.9-vz*.4;place(c,x,z,Math.atan2(h.x-x,h.z-z)-.5);c.root.visible=true;if(typeof burst==='function')burst(V3(x,1.5,z),0xffe080,30);if(typeof SFX!=='undefined'&&SFX.magic)SFX.magic()}
function talkFrame(){if(typeof CUT==='undefined'||!CUT||!TALK||CAMS.wide)return null;const g=TALKCH[TALK.who==='narr'&&scene==='intro'?'dania':TALK.who];const c=g&&g();if(!c||!c.root.parent)return null;
 if(c===QUEEN&&scene==='ch'&&(!c.root.visible||Math.hypot(c.root.position.x-HERO.x,c.root.position.z-HERO.z)>14))summonQueen(c);if(!c.root.visible)return null;
 if(CAMS.tw!==TALK){CAMS.tw=TALK;if(CAMS.twc!==c){CAMS.twc=c;CAMS.snap=true}}
 const p=c.root.position,hh=c.h,D=clamp(hh*2.1,3.6,6.4);let vx=CAMS.sl.x-CAMS.sp.x,vz=CAMS.sl.z-CAMS.sp.z;const n=Math.hypot(vx,vz)||1;vx/=n;vz/=n;
 const fy=c.vyaw!=null?c.vyaw:c.root.rotation.y,fx=Math.sin(fy),fz=Math.cos(fy);if(-(vx*fx+vz*fz)<.35){const a=fy+Math.PI+.35;vx=Math.sin(a);vz=Math.cos(a)}
 return[V3(p.x-vx*D,p.y+hh*.75+.5,p.z-vz*D),V3(p.x+vx*.6,p.y+hh*.62,p.z+vz*.6)]}
function followCam(){CAMS.mode='follow';CAMS.k=5}
// ---- прозрачность препятствий: всё, что между камерой и героем или ближе ~1.5 м к камере, тает (любого размера) ----
const _cf=new THREE.Vector3(),_ob=new THREE.Box3(),_os=new THREE.Sphere(),_oray=new THREE.Ray(),_ohit=new THREE.Vector3(),_otg=new THREE.Vector3();
// единицы прозрачности: маленькие группы целиком, большие группы/меши — по мешам; кеш пересобирается при смене мира
let OCC={w:null,u:[],t:0};
function occBuild(){const U=[];const add=(o)=>{if(o.userData.noFade||!o.visible&&o.isMesh)return;_ob.setFromObject(o);if(_ob.isEmpty())return;_ob.getBoundingSphere(_os);
  if(_os.radius>3.5&&o.children.length){for(const c of o.children)add(c);return}
  if(o.isMesh&&o.geometry&&o.geometry.type==='PlaneGeometry'&&_os.radius>30)return;
  U.push({o,f:1,box:new THREE.Box3(),dyn:true})};
 for(const o of WORLD.children)add(o);OCC={w:WORLD,u:U,t:0,n:WORLD.children.length}}
function occSet(o,u,f){u.f=f;const on=f<.995;o.traverse(m=>{const mt=m.material;if(!mt)return;
 if(on){if(!m.userData.om){m.userData.om=mt;const cl=x=>{const c=x.clone();c.transparent=true;c.userData.bo=x.opacity;return c};m.material=Array.isArray(mt)?mt.map(cl):cl(mt)}
  for(const c of [].concat(m.material)){c.opacity=c.userData.bo*f;c.depthWrite=f>.9}}
 else if(m.userData.om){for(const c of [].concat(m.material))c.dispose();m.material=m.userData.om;m.userData.om=null}})}
function occStep(dt){if(typeof HERO==='undefined'||!WORLD)return;if(OCC.w!==WORLD||OCC.n!==WORLD.children.length)occBuild();const C=CAM.position;
 if(CAMS.mode==='follow'||!CUT)_otg.set(HERO.x,HERO.y+1,HERO.z);else _otg.copy(CAMS.tgt);
 CAM.getWorldDirection(_cf);const L=C.distanceTo(_otg);_oray.origin.copy(C);_oray.direction.copy(_otg).sub(C).normalize();
 for(const u of OCC.u){const o=u.o;if(!o.parent||!o.visible){continue}
  u.box.setFromObject(o);const b=u.box;let want=1;
  const h=b.max.y-b.min.y;if(h>.25&&!b.containsPoint(_otg)){
   const dn=b.distanceToPoint(C);if(dn<1.5)want=.15;else if(dn<2.4){b.getCenter(_ohit);if(_ohit.sub(C).dot(_cf)>0)want=.18}
   if(want===1&&_oray.intersectBox(b,_ohit)&&_ohit.distanceTo(C)<L-.6&&b.max.y>_otg.y-.9)want=.25}
  if(want===1&&u.f>=.995)continue;let f=u.f+(want-u.f)*Math.min(1,dt*8);if(Math.abs(f-want)<.01)f=want;if(f!==u.f)occSet(o,u,f)}
 // персонажи (кроме Дани и говорящего) тают, если оказались у самой камеры или закрывают Даню
 const tk=typeof TALK!=='undefined'&&TALK&&TALKCH[TALK.who]?TALKCH[TALK.who]():null;
 for(const c of CHARS){if(c===DANIA||c===tk||!c.root.visible)continue;const p=c.root.position;let want=1;const dn=Math.hypot(p.x-C.x,p.z-C.z);
  if(dn<2.8)want=.15;else if(!CUT){_ohit.set(p.x,p.y+c.h*.5,p.z);const t=_ohit.clone().sub(C).dot(_oray.direction);if(t>0&&t<L-.8){const q=C.clone().addScaledVector(_oray.direction,t);if(Math.hypot(q.x-p.x,q.z-p.z)<.7)want=.3}}
  const f0=c.mat.opacity;let f=f0+(want-f0)*Math.min(1,dt*8);if(Math.abs(f-want)<.01)f=want;if(f!==f0){c.mat.opacity=f;c.mat.depthWrite=f>.9}}}
function camStep(dt){let P,L;
 if(CAMS.mode==='follow'){const h=HERO;if(h.mode==='walk'&&h.sp>1){let d=h.yaw-CAMS.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));const ad=Math.abs(d);if(ad<1.25)CAMS.yaw+=d*Math.min(1,dt*1.1*(1-ad/1.25))}// бег вбок не крутит камеру по кругу
  if(h.camYaw!=null){let d=h.camYaw-CAMS.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));CAMS.yaw+=d*Math.min(1,dt*3)}
  const fx=Math.sin(CAMS.yaw),fz=Math.cos(CAMS.yaw);if(h.cy==null||Math.abs(h.cy-h.y)>3)h.cy=h.y;h.cy+=(h.y-h.cy)*Math.min(1,dt*(h.y>h.cy?7:12));const hy=h.cy;P=V3(h.x-fx*CAMS.dist,hy+CAMS.h,h.z-fz*CAMS.dist);L=V3(h.x+fx*1.2,hy+CAMS.look,h.z+fz*1.2);
  const gp=groundAt(P.x,P.z)+.6;if(P.y<gp)P.y=gp}
 else{P=CAMS.sp;L=CAMS.sl;const tf=talkFrame();if(tf){P=tf[0];L=tf[1]}}
 const k=CAMS.snap?1:1-Math.exp(-dt*CAMS.k);CAMS.pos.lerp(P,k);CAMS.tgt.lerp(L,k);CAMS.snap=false;CAM.position.copy(CAMS.pos);CAM.lookAt(CAMS.tgt);
 if(Math.abs(CAM.fov-CAMS.fov)>.05){CAM.fov=lerp(CAM.fov,CAMS.fov,.1);CAM.updateProjectionMatrix()}}
// ---- проекция на экран (дизайн-координаты оверлея) ----
const _pv=new THREE.Vector3();function toScreen(x,y,z){_pv.set(x,y,z).project(CAM);const v=vis();return{x:v.x0+(_pv.x*.5+.5)*v.w,y:v.y0+(-_pv.y*.5+.5)*v.h,vis:_pv.z<1&&Math.abs(_pv.x)<1.05&&Math.abs(_pv.y)<1.05}}
// ---- аудит для тестов: ноги на земле, размер героев на экране ----
function audit3D(){return CHARS.filter(c=>c.root.visible&&c.root.parent).map(c=>{const p=c.root.position;const g=groundAt(p.x,p.z,p.y+.05);const air=(c===DANIA&&!HERO.gr)||(c.hop>0.02)||c.fly;
 const a=toScreen(p.x,p.y,p.z),b=toScreen(p.x,p.y+c.h,p.z);return{n:c.n,feet:+p.y.toFixed(3),ground:+g.toFixed(3),gap:+(p.y-g).toFixed(3),air:!!air,airT:+(c===DANIA?HERO.airT:0).toFixed(2),onScreen:a.vis||b.vis,hPx:Math.round(Math.abs(a.y-b.y)*S),sit:c.anim==='sit'}})}
// ---- кадр ----
function frame3D(dt){if(SCN&&SCN.step3D)SCN.step3D(dt);if(SCN&&SCN.world){heroStep(dt);krugStep(dt);stepPhys(dt)}for(const f of TICK)f(dt);stepFX(dt);
 for(const c of CHARS){c.update(dt,c===DANIA?HERO.sp:c.sp||0);if(c.shadow){const p=c.root.position;const g=groundAt(p.x,p.z,p.y+.05);c.shadow.position.set(p.x,g+.03,p.z);const hgt=p.y-g+(c.hop||0);c.shadow.material.opacity=clamp(1-hgt*.4,.25,1);c.shadow.visible=c.root.visible}}
 camStep(dt);occStep(dt);if(typeof gfxStep==='function')gfxStep(dt);R3.render(SCENE,CAM)}
const LEVELS=[];// заполняется levels1/levels2/boss
