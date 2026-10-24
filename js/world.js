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
function physReset(){PW=new CANNON.World({gravity:new CANNON.Vec3(0,-22,0)});PW.defaultContactMaterial.friction=.35;PW.defaultContactMaterial.restitution=.15;
 const gp=new CANNON.Body({mass:0,shape:new CANNON.Plane()});gp.quaternion.setFromEuler(-Math.PI/2,0,0);PW.addBody(gp);
 HB=new CANNON.Body({mass:0,type:CANNON.Body.KINEMATIC,shape:new CANNON.Sphere(.45)});PW.addBody(HB);PW.usePhys=false}
function physBody(m,shape,mass,x,y,z,o){o=o||{};const b=new CANNON.Body({mass,shape,linearDamping:o.damp==null?.35:o.damp,angularDamping:.6,fixedRotation:!!o.fixed});b.position.set(x,y,z);PW.addBody(b);SYNC.push({m,b});PW.usePhys=true;return b}
function stepPhys(dt){if(!PW||!PW.usePhys)return;HB.position.set(HERO.x,HERO.y+.5,HERO.z);HB.velocity.set(HERO.vx,0,HERO.vz);PW.step(1/60,dt,3);for(const s of SYNC){s.m.position.copy(s.b.position);s.m.quaternion.copy(s.b.quaternion)}}
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
function makeDania(){const root=new THREE.Group(),body=new THREE.Group();root.add(body);const skin=0xffcfa8,hoodie=0xf57a1a,hoodD=0xd9600c,blue=0x3768b8,shoe=0x3a72c4;
 const legs=[],arms=[];
 for(const s of [-1,1]){const hip=grp(body,s*.12,.6,0);capsule(.066,.24,skin,hip,0,-.3,0);mesh(GEO.cyl,blue,0,-.08,0,hip,[.155,.26,.165]);
  mesh(GEO.cyl,0xffffff,0,-.46,0,hip,[.074,.11,.074]);mesh(GEO.cyl,0xf2c84a,0,-.425,0,hip,[.077,.018,.077]);
  const sh=grp(hip,0,-.53,.05);mesh(GEO.box,0xf6f3ec,0,-.04,0,sh,[.17,.05,.33]);ell(shoe,sh,0,.01,.01,.1,.075,.165);ell(shoe,sh,0,.045,-.08,.085,.075,.08);
  for(let i=0;i<3;i++)mesh(GEO.box,0xffffff,0,.07-i*.012,.04+i*.035,sh,[.075,.014,.014]);legs.push(hip)}
 const torso=grp(body,0,.95,0);mesh(new THREE.CapsuleGeometry(.25,.2,6,16),hoodie,0,0,0,torso,[1.08,1,.84]);mesh(GEO.cyl,hoodD,0,-.27,0,torso,[.265,.07,.22]);
 ell(hoodD,torso,0,-.13,.165,.17,.075,.05);
 const tri=new THREE.Mesh(new THREE.RingGeometry(.06,.095,3),M(0xffdc3a,{em:0x6a5000,ei:.35}));tri.rotation.z=Math.PI/2;tri.position.set(0,.06,.214);torso.add(tri);
 for(const s of [-1,1]){const st=mesh(GEO.cylL,0xffffff,s*.055,.17,.2,torso,[.013,.14,.013]);st.rotation.x=-.25;mesh(GEO.sphL,0xffffff,s*.055,.1,.215,torso,.022)}
 const hood=mesh(new THREE.TorusGeometry(.17,.075,8,18),hoodie,0,.27,-.05,torso);hood.rotation.x=Math.PI/2.3;ell(hoodie,torso,0,.15,-.19,.2,.18,.1);
 mesh(GEO.cyl,skin,0,.36,0,torso,[.075,.1,.075]);
 for(const s of [-1,1]){const sh=grp(torso,s*.3,.17,0);capsule(.074,.24,hoodie,sh,0,-.17,0);mesh(GEO.cyl,hoodD,0,-.33,0,sh,[.078,.05,.078]);ell(skin,sh,0,-.4,0,.075,.08,.075);arms.push(sh)}
 const wand=grp(arms[1],0,-.4,0);wand.rotation.x=-1.05;const st=mesh(GEO.cylL,0xd4a020,0,0,.2,wand,[.022,.42,.022]);st.rotation.x=Math.PI/2;
 const star=new THREE.Mesh(starGeo(.13),M(0xffd83a,{em:0xffb000,ei:.5}));star.position.set(0,0,.44);star.rotation.x=1.05;wand.add(star);const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:TEX.dot,color:0xfff2a0,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));glow.position.copy(star.position);glow.scale.setScalar(.5);wand.add(glow);
 const head=grp(body,0,1.52,0);mesh(GEO.sph,skin,0,0,0,head,.4);const F=makeFace('dania');faceCap(F,.4,head,0,0,1.9,1.5);
 for(const s of [-1,1])ell(skin,head,s*.39,-.03,0,.07,.1,.07);ell(0xffbf98,head,0,-.07,.395,.045,.04,.04);
 const hc=0x7a3d18,hd=0x5c2a0e;const cap=capTop(.43,1.6,hc,head,0,.01,-.01);cap.rotation.x=-.55;for(const s of [-1,1]){spike(head,hd,V3(s*1,.25,-.1),.34,.2,.1);spike(head,hc,V3(s*1,.05,-.35),.34,.18,.1)}
 for(let i=0;i<8;i++)spike(head,i%2?hd:hc,sdir(.42,i/8*6.283+.3),.33,.24,.1);
 for(let i=0;i<11;i++){const az=Math.PI*.42+i/11*Math.PI*1.16;spike(head,i%2?hc:hd,sdir(1.0+(i%3)*.12,az),.33,.22,.1)}
 spike(head,hc,V3(.05,1,.1),.36,.3,.11);
 [[-.55,.95,.22],[-.2,.85,.24],[.15,.82,.24],[.5,.9,.22],[.85,1.1,.2]].forEach(([az,pol,l],i)=>{const d=sdir(pol,az);d.x+=.35;spike(head,i%2?hd:hc,d,.34,l,.095)});
 const ch={n:'dania',root,body,legs,arms,head,torso,wand,star,glow,F,h:2.0,ph:0,kickT:-9,anim:'idle',look:null,air:0,sit:0,cheerT:-9};
 ch.update=function(dt,sp){this.F.step(dt,'dania');const a=this.anim;this.ph+=dt*(4+sp*2.2);const run=a==='run'?Math.min(1,sp/4):0;
  const sw=Math.sin(this.ph)*.85*run,br=Math.sin(T*2.3);let hl=sw,hr=-sw,al=-sw*.8,ar=sw*.8,by=Math.abs(Math.sin(this.ph))*.08*run+br*.008,tilt=run*.14;
  if(a==='air'){hl=-.5;hr=.3;al=-2.4;ar=-2.2;by=0}
  if(a==='sit'){hl=hr=-1.45;al=ar=-.5;by=-.46}
  if(T-this.kickT<.35){const u=(T-this.kickT)/.35;hr=-Math.sin(u*Math.PI)*1.6;al=-.6;}
  if(this.hold){ar=-1.45;this.glow.scale.setScalar(.7+Math.sin(T*12)*.12)}else this.glow.scale.setScalar(.45);
  if(T-this.cheerT<1.6){al=-2.7+Math.sin(T*14)*.25;ar=-2.7-Math.sin(T*14)*.25;by+=Math.abs(Math.sin((T-this.cheerT)*6))*.12}
  if(talking('dania')&&a!=='run'){al=-.3+Math.sin(T*3)*.2}
  if(a==='idle'&&!this.hold&&T-this.cheerT>1.6&&!talking('dania')){al=.06+br*.04;ar=-.25+br*.04}
  this.legs[0].rotation.x=lerp(this.legs[0].rotation.x,hl,.4);this.legs[1].rotation.x=lerp(this.legs[1].rotation.x,hr,.4);this.arms[0].rotation.x=lerp(this.arms[0].rotation.x,al,.35);this.arms[1].rotation.x=lerp(this.arms[1].rotation.x,ar,.35);
  this.arms[0].rotation.z=-.14-run*.1;this.arms[1].rotation.z=.14+run*.1;this.body.position.y=by;this.body.rotation.x=tilt;this.body.rotation.y=Math.sin(this.ph)*.12*run;
  this.torso.scale.set(1+br*.012,1+br*.02,1+br*.012);this.head.position.y=1.52+br*.012+Math.abs(Math.sin(this.ph))*.02*run;this.head.rotation.z=a==='idle'?Math.sin(T*.9)*.06:0;lookHead(this,1.4)};
 CHARS.push(ch);SCENE.add(root);ch.shadow=blobShadow();ch.shadow.scale.setScalar(1.1);return ch}
// голова поворачивается к камере (или к цели), глаза тоже
function lookHead(ch,lim){const hp=new THREE.Vector3();ch.head.getWorldPosition(hp);const tg=ch.look||CAM.position;const dx=tg.x-hp.x,dz=tg.z-hp.z,dy=tg.y-hp.y;let ya=Math.atan2(dx,dz)-ch.root.rotation.y-(ch.body.rotation.y||0);ya=Math.atan2(Math.sin(ya),Math.cos(ya));
 const back=Math.abs(ya)>lim+.6;const t=back?0:clamp(ya,-lim*.6,lim*.6);ch.head.rotation.y=lerp(ch.head.rotation.y,t,.12);ch.F.lx=back?0:clamp((ya-t)*1.5,-1,1);ch.F.ly=clamp(-Math.atan2(dy,Math.hypot(dx,dz))*1.2,-1,1)}
function makeKrug(){const root=new THREE.Group(),body=new THREE.Group();root.add(body);const col=0xffbf2a;
 const skinT=cvTex(256,128,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#ffd75a');g.addColorStop(1,'#f5a81e');x.fillStyle=g;x.fillRect(0,0,w,h);x.strokeStyle='rgba(255,240,180,.5)';x.lineWidth=2;const r=rng(5);for(let i=0;i<9;i++){x.beginPath();x.moveTo(0,r()*h);x.bezierCurveTo(w*.3,r()*h,w*.7,r()*h,w,r()*h);x.stroke()}});
 const ball=grp(body,0,.56,0);mesh(GEO.sph,new THREE.MeshLambertMaterial({map:skinT,emissive:0x6a3000,emissiveIntensity:.12}),0,0,0,ball,.46);const F=makeFace('krug');faceCap(F,.46,ball,0,0,1.7,1.45);
 const shine=ell(M(0xffffff,{basic:1,op:.35}),ball,-.18,.26,.3,.1,.06,.03);shine.rotation.z=.6;
 const feet=[],hands=[];for(const s of [-1,1]){const f=grp(body,s*.16,0,.05);ell(0xf09a12,f,0,.06,.04,.12,.065,.17);ell(0xf09a12,f,0,.13,-.02,.06,.07,.06);feet.push(f);
  const h=grp(ball,s*.44,-.04,.02);const fl=ell(col,h,s*.06,-.04,0,.06,.13,.075);fl.rotation.z=s*.7;hands.push(h)}
 const ch={n:'krug',root,body,ball,head:ball,F,feet,hands,h:1.02,ph:0,anim:'idle',look:null,hop:0,roll:0,cheerT:-9};
 ch.update=function(dt,sp){this.F.step(dt,'krug');this.ph+=dt*(sp>0.3?9:0);let hop=sp>.3?Math.abs(Math.sin(this.ph))*.22:0;
  if(T-this.cheerT<1.6)hop=Math.abs(Math.sin((T-this.cheerT)*7))*.35;this.hop=hop;this.body.position.y=hop;const br=Math.sin(T*2.6);
  this.ball.scale.set(1+br*.018,1-br*.018,1+br*.018);const ch2=T-this.cheerT<1.6,tk=talking('krug');
  this.hands[0].rotation.z=ch2?-1.9+Math.sin(T*14)*.3:tk?-.4-Math.sin(T*8)*.35:Math.sin(T*1.6)*.12;this.hands[1].rotation.z=ch2?1.9-Math.sin(T*14)*.3:tk?.4+Math.sin(T*8)*.35:-Math.sin(T*1.6)*.12;
  const fs=sp>.3?Math.sin(this.ph)*.5:0;this.feet[0].rotation.x=fs;this.feet[1].rotation.x=-fs;
  this.ball.rotation.z=Math.sin(T*1.7)*.05;lookHead(this,1.2)};
 CHARS.push(ch);SCENE.add(root);ch.shadow=blobShadow();ch.shadow.scale.setScalar(1);return ch}
function makeQueen(){const root=new THREE.Group(),body=new THREE.Group();root.add(body);const robe=0xefe6cf,skin=0xffd6bc,gold=M(0xe8b22a,{em:0x7a5000,ei:.35}),hair=0xdedde6;
 const pat=cvTex(256,256,(x,w,h)=>{x.fillStyle='#f1e8d0';x.fillRect(0,0,w,h);x.strokeStyle='#d9a93a';x.lineWidth=4;for(let r=0;r<=4;r++){x.beginPath();x.moveTo(0,r*64);x.lineTo(w,r*64);x.stroke()}const cs=['#6fa4dc','#d9a93a','#2f5fa8'];for(let r=0;r<4;r++)for(let c=0;c<4;c++){x.fillStyle=cs[(r+c)%3];x.beginPath();const cx=c*64+32+(r%2)*32,cy=r*64+34;x.moveTo(cx,cy-20);x.lineTo(cx+19,cy+16);x.lineTo(cx-19,cy+16);x.fill()}});pat.wrapS=pat.wrapT=THREE.RepeatWrapping;pat.repeat.set(4,2);
 const pm=new THREE.MeshLambertMaterial({map:pat});
 const pts=[];for(let i=0;i<=14;i++){const u=i/14;pts.push(new THREE.Vector2(.66-.42*Math.pow(u,.75)+.03*Math.sin(u*3),u*1.32))}body.add(new THREE.Mesh(new THREE.LatheGeometry(pts,28),pm));
 mesh(new THREE.TorusGeometry(.64,.035,8,32),gold,0,.03,0,body).rotation.x=Math.PI/2;
 const panel=cvTex(64,256,(x,w,h)=>{x.fillStyle='#8a5cc8';x.fillRect(0,0,w,h);x.fillStyle='#e8c050';for(let i=0;i<6;i++){const cy=20+i*42;x.beginPath();x.moveTo(32,cy-12);x.lineTo(44,cy);x.lineTo(32,cy+12);x.lineTo(20,cy);x.fill()}x.fillStyle='#d9a93a';x.fillRect(0,0,6,h);x.fillRect(w-6,0,6,h)});
 const fp=mesh(new THREE.CylinderGeometry(.215,.44,1.25,14,1,true,-.42,.84),new THREE.MeshLambertMaterial({map:panel,side:THREE.DoubleSide}),0,.66,.07,body);
 const torso=grp(body,0,1.42,0);mesh(new THREE.CapsuleGeometry(.21,.2,6,14),pm,0,0,0,torso);mesh(new THREE.CylinderGeometry(.12,.2,.36,12,1,true),M(0x8a5cc8),0,0,.06,torso,[1,1,.9]).material.side=THREE.DoubleSide;
 const col=mesh(new THREE.CylinderGeometry(.34,.2,.36,20,1,true,Math.PI*.3,Math.PI*1.4),new THREE.MeshLambertMaterial({map:pat,side:THREE.DoubleSide}),0,.3,-.02,torso);
 mesh(new THREE.TorusGeometry(.2,.035,8,18),gold,0,.16,0,torso).rotation.x=Math.PI/2;
 const arms=[];for(const s of [-1,1]){const sh=grp(torso,s*.26,.14,0);capsule(.075,.24,robe,sh,0,-.15,0);mesh(new THREE.CylinderGeometry(.08,.17,.3,14,1,true),pm,0,-.32,0,sh).material.side=THREE.DoubleSide;ell(skin,sh,0,-.49,0,.07,.075,.07);arms.push(sh)}
 const sc=grp(arms[1],0,-.49,.03);for(const s of [-1,1]){const l=mesh(GEO.cylL,gold,s*.08,.15,0,sc,[.032,1.3,.032]);l.rotation.z=-s*.12}
 mesh(GEO.cyl,gold,0,.82,0,sc,[.07,.05,.07]).rotation.x=Math.PI/2;mesh(GEO.cylL,gold,0,.93,0,sc,[.03,.16,.03]);mesh(GEO.sph,gold,0,1.03,0,sc,.05);
 mesh(GEO.cone,0x555566,.155,-.56,0,sc,[.02,.12,.02]).rotation.x=Math.PI;mesh(GEO.cone,0x3a5fb0,-.155,-.56,0,sc,[.03,.12,.03]).rotation.x=Math.PI;
 const head=grp(body,0,1.9,0);mesh(GEO.sph,skin,0,0,0,head,.31);const F=makeFace('queen');faceCap(F,.31,head,0,0,1.9,1.5);ell(0xffc4a8,head,0,-.05,.305,.04,.035,.035);
 const hc=capTop(.33,1.25,hair,head,0,.01,-.02);hc.rotation.x=-.5;ell(hair,head,0,.3,-.18,.17,.15,.17);for(const s of [-1,1])ell(hair,head,s*.27,-.02,-.08,.08,.14,.12);
 const cr=grp(head,0,.27,.02);cr.rotation.x=-.12;mesh(new THREE.CylinderGeometry(.22,.2,.1,20),gold,0,0,0,cr);const blue=M(0x6fa8e0,{em:0x1a3a70,ei:.4});
 for(let i=0;i<5;i++){const a=i/5*6.283;const x=Math.sin(a)*.17,z=Math.cos(a)*.17;mesh(GEO.cone,i%2?blue:gold,x,.2,z,cr,[.06,.32,.06]);mesh(GEO.sph,gold,x,.37,z,cr,.035)}
 mesh(GEO.cone,blue,0,.26,0,cr,[.1,.42,.1]);mesh(GEO.sph,M(0xff5a7a,{em:0x801020,ei:.4}),0,0,.205,cr,.045);
 const ch={n:'queen',root,body,head,torso,arms,F,h:2.6,anim:'idle',look:null,cheerT:-9};
 ch.update=function(dt){this.F.step(dt,'queen');const br=Math.sin(T*1.8);this.torso.position.y=1.42+br*.012;this.torso.scale.set(1+br*.01,1+br*.015,1+br*.01);this.head.position.y=1.9+br*.014;const tk=talking('queen');this.arms[1].rotation.x=lerp(this.arms[1].rotation.x,tk?-.7+Math.sin(T*3)*.12:-.22,.1);this.arms[0].rotation.x=lerp(this.arms[0].rotation.x,tk?-.4+Math.sin(T*2.5)*.2:0,.1);
  this.arms[0].rotation.z=-.2;this.arms[1].rotation.z=.18;this.body.rotation.z=Math.sin(T*1.1)*.015;this.head.rotation.z=Math.sin(T*.8)*.04;lookHead(this,1.2)};
 CHARS.push(ch);SCENE.add(root);ch.shadow=blobShadow();ch.shadow.scale.setScalar(1.5);return ch}
// Кривуля: клубок тонких фиолетовых линий — голова, тело, длинные спутанные руки и ноги, глаза и корона
function tanglePts(n,seed,R,cy){const rn=rng(seed);const P=[];for(let i=0;i<n;i++){const a=rn()*6.283,b=(rn()-.5)*2.6;P.push(V3(Math.cos(a)*Math.cos(b)*R,cy+Math.sin(b)*R,Math.sin(a)*Math.cos(b)*R))}return P}
function blobPts(n,seed,c,rx,ry,rz,avoid){const rn=rng(seed);const P=[];while(P.length<n){const a=rn()*6.283,b=(rn()-.5)*3,k=.75+rn()*.3;const v=V3(Math.cos(a)*Math.cos(b)*rx*k,Math.sin(b)*ry*.6*k,Math.sin(a)*Math.cos(b)*rz*k);if(avoid&&avoid(v))continue;P.push(v.add(c))}return P}
function limbPts(a,b,amp,n,seed,curl){const rn=rng(seed);const P=[];for(let i=0;i<=n;i++){const t=i/n;const p=a.clone().lerp(b,t);const e=Math.sin(t*Math.PI)*amp;p.x+=(rn()-.5)*e;p.y+=(rn()-.5)*e*.6;p.z+=(rn()-.5)*e;P.push(p)}
 if(curl){for(let i=1;i<=8;i++){const an=i/8*6.283;P.push(b.clone().add(V3(Math.cos(an)*curl-curl,Math.sin(an)*curl*.25,Math.sin(an)*curl)))}}return P}
function makeKriv(){const root=new THREE.Group(),body=new THREE.Group();root.add(body);const mat=new THREE.MeshLambertMaterial({color:0x9a4fe0,emissive:0x2a0050,emissiveIntensity:.5}),mat2=new THREE.MeshLambertMaterial({color:0x6a2aa8,emissive:0x1a0030,emissiveIntensity:.4});
 const tube=(P,r,m,p,closed)=>{const t=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(P,!!closed),P.length*10,r,6,!!closed),m);p.add(t);return t};
 const tg=grp(body,0,0,0);const tb=tube(blobPts(34,11,V3(0,1.2,0),.42,.7,.32),.045,mat,tg,true);tube(blobPts(24,23,V3(0,1.15,0),.36,.6,.28),.03,mat2,tg,true);
 const head=grp(body,0,1.95,.05);mesh(GEO.sph,new THREE.MeshLambertMaterial({map:TEX.yarn,color:0xc090ff,emissive:0x200040,emissiveIntensity:.4}),0,0,0,head,.46);const F=makeFace('kriv');faceCap(F,.46,head,0,0,1.6,1.3);
 const front=v=>v.z>.12&&Math.abs(v.x)<.42&&v.y<.32&&v.y>-.36;tube(blobPts(36,37,V3(0,0,0),.6,1.05,.58,front),.04,mat,head,true);tube(blobPts(26,41,V3(0,.05,-.05),.56,1,.54,front),.03,mat2,head,true);
 const arms=[],legs=[];for(const s of [-1,1]){const ar=grp(body,s*.3,1.45,0);tube(limbPts(V3(0,0,0),V3(s*.7,-.55,.15),.22,9,s>0?51:57,.09),.035,mat,ar);tube(limbPts(V3(0,-.05,0),V3(s*.66,-.5,.1),.18,8,s>0?61:67),.022,mat2,ar);arms.push(ar);
  const lg=grp(body,s*.17,.72,0);tube(limbPts(V3(-s*.05,.18,0),V3(s*.1,-.64,.06),.16,8,s>0?71:77),.04,mat,lg);tube(limbPts(V3(0,0,0),V3(s*.08,-.62,.0),.14,7,s>0?81:87),.025,mat2,lg);
  const ft=mesh(new THREE.TorusGeometry(.11,.03,6,16),mat,s*.12,-.66,.08,lg);ft.rotation.x=Math.PI/2;ft.scale.set(1,1.4,1);legs.push(lg)}
 const gold=M(0xf0be30,{em:0x7a5000,ei:.4});const cr=grp(head,.04,.52,0);cr.rotation.z=-.18;mesh(GEO.cyl,gold,0,0,0,cr,[.28,.13,.28]);for(let i=0;i<5;i++){const a=i/5*6.283;mesh(GEO.cone,gold,Math.sin(a)*.23,.16,Math.cos(a)*.23,cr,[.07,.22,.07]);mesh(GEO.sph,gold,Math.sin(a)*.23,.28,Math.cos(a)*.23,cr,.035)}
 mesh(GEO.sph,M(0x5ad06a,{em:0x105020,ei:.4}),0,0,.28,cr,.05);
 const ch={n:'kriv',root,body,head,tg,tube:tb,F,cr,arms,legs,h:2.95,anim:'idle',look:null,cheerT:-9};
 ch.update=function(dt){this.F.step(dt,'kriv');const tk=talking('kriv'),br=Math.sin(T*2.2);this.tg.rotation.y=Math.sin(T*.7)*.25;this.tg.scale.set(1+br*.03,1+br*.02,1+br*.03);this.head.position.y=1.95+br*.035;
  this.arms[0].rotation.z=-.15+Math.sin(T*(tk?5:1.8))*(tk?.35:.12);this.arms[1].rotation.z=.15-Math.sin(T*(tk?5:1.8)+1)*(tk?.35:.12);this.arms[0].rotation.x=Math.sin(T*1.3)*.15;this.arms[1].rotation.x=-Math.sin(T*1.3)*.15;
  this.legs[0].rotation.z=Math.sin(T*1.6)*.04;this.legs[1].rotation.z=-Math.sin(T*1.6)*.04;this.body.rotation.z=Math.sin(T*1.5)*.035;lookHead(this,1.3)};
 CHARS.push(ch);SCENE.add(root);ch.shadow=blobShadow();ch.shadow.scale.setScalar(1.8);return ch}
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
function heroStep(dt){const h=HERO;const m=h.model;if(!m)return;
 if(h.mode==='walk'&&!h.lock){const cy=camYawNow();const fx=Math.sin(cy),fz=Math.cos(cy),rx=-Math.cos(cy),rz=Math.sin(cy);let mx=fx*INP.jy+rx*INP.jx,mz=fz*INP.jy+rz*INP.jx;const mag=Math.hypot(mx,mz);
  const tv=h.speed*Math.min(1,mag);const tx=mag>.05?mx/mag*tv:0,tz=mag>.05?mz/mag*tv:0;const k=1-Math.exp(-dt*(h.gr?12:4));h.vx=lerp(h.vx,tx,k);h.vz=lerp(h.vz,tz,k);
  if(mag>.1){const ty=Math.atan2(mx,mz);let d=ty-h.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));h.yaw+=d*Math.min(1,dt*12)}
  if(takeTap()&&h.gr){h.vy=7.6;h.gr=false;SFX.jump()}}
 else if(h.lock||h.mode==='still'){h.vx=lerp(h.vx,0,.3);h.vz=lerp(h.vz,0,.3);takeTap()}
 // перемещение + стены
 const p={x:h.x+h.vx*dt,z:h.z+h.vz*dt};if(nogo(p.x,p.z)){if(!nogo(p.x,h.z))p.z=h.z;else if(!nogo(h.x,p.z))p.x=h.x;else{p.x=h.x;p.z=h.z}}
 collide(p,.4,h.y);if(nogo(p.x,p.z)){p.x=h.x;p.z=h.z}
 const g=groundAt(p.x,p.z,h.y);if(g>h.y+.5){p.x=h.x;p.z=h.z}// слишком высоко — стоп
 h.x=p.x;h.z=p.z;
 // вертикаль: прыжок всегда приземляется на опору
 const gg=groundAt(h.x,h.z,h.y);if(!h.gr||h.y>gg+.02){h.gr=false;h.vy-=24*dt;h.y+=h.vy*dt;h.airT+=dt;if(h.y<=gg){h.y=gg;if(h.vy<-3)SFX.land();h.vy=0;h.gr=true;h.airT=0}}else{h.y=gg;h.vy=0;h.gr=true;h.airT=0}
 h.sp=Math.hypot(h.vx,h.vz);
 m.root.position.set(h.x,h.y,h.z);m.root.rotation.y=h.yaw;m.hold=INP.hold&&(h.mode==='walk'||h.mode==='still');
 if(h.mode==='walk'||h.mode==='still')m.anim=!h.gr?'air':h.sp>.6?'run':'idle';
 if(h.mode==='walk'&&!h.lock&&takeSwipe()){m.kickT=T;SFX.kick();h.kickT=T}}
// спутник следует за героем
function krugStep(dt){const k=KRUG;if(!k)return;const r=k.root.position;let sp=0;
 if(k.mode==='follow'){const fx=Math.sin(HERO.yaw),fz=Math.cos(HERO.yaw);const tx=HERO.x-fx*1.5-fz*1.3,tz=HERO.z-fz*1.5+fx*1.3;const dx=tx-r.x,dz=tz-r.z,d=Math.hypot(dx,dz);
  if(d>14){r.x=tx;r.z=tz}else if(d>.4){sp=Math.min(HERO.speed*1.05,d*2.2);const p={x:r.x+dx/d*sp*dt,z:r.z+dz/d*sp*dt};collide(p,.45,r.y);if(!nogo(p.x,p.z)){r.x=p.x;r.z=p.z}k.root.rotation.y=Math.atan2(dx,dz)}
  else{const a=Math.atan2(CAM.position.x-r.x,CAM.position.z-r.z);k.root.rotation.y+=Math.atan2(Math.sin(a-k.root.rotation.y),Math.cos(a-k.root.rotation.y))*.05}
  r.y=groundAt(r.x,r.z,r.y+.3)}
 else if(k.mode==='go'&&k.tgt){const dx=k.tgt.x-r.x,dz=k.tgt.z-r.z,d=Math.hypot(dx,dz);if(d>.15){sp=Math.min(5,d*3);r.x+=dx/d*sp*dt;r.z+=dz/d*sp*dt;k.root.rotation.y=Math.atan2(dx,dz)}r.y=groundAt(r.x,r.z,r.y+.3)}
 k.sp=sp}
// ---- камера ----
const CAMS={yaw:0,dist:6.4,h:3.1,look:1.35,mode:'follow',pos:V3(0,5,-8),tgt:V3(0,1,0),snap:true,k:5,fov:52};
function shot(px,py,pz,lx,ly,lz,k){CAMS.mode='shot';CAMS.sp=V3(px,py,pz);CAMS.sl=V3(lx,ly,lz);CAMS.k=k||3}
function followCam(){CAMS.mode='follow';CAMS.k=5}
function camStep(dt){let P,L;
 if(CAMS.mode==='follow'){const h=HERO;if(h.mode==='walk'&&h.sp>1){let d=h.yaw-CAMS.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));if(Math.abs(d)<2.3)CAMS.yaw+=d*Math.min(1,dt*1.3)}
  if(h.camYaw!=null){let d=h.camYaw-CAMS.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));CAMS.yaw+=d*Math.min(1,dt*3)}
  const fx=Math.sin(CAMS.yaw),fz=Math.cos(CAMS.yaw);P=V3(h.x-fx*CAMS.dist,h.y+CAMS.h,h.z-fz*CAMS.dist);L=V3(h.x+fx*1.2,h.y+CAMS.look,h.z+fz*1.2);
  const gp=groundAt(P.x,P.z)+.6;if(P.y<gp)P.y=gp}
 else{P=CAMS.sp;L=CAMS.sl}
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
 camStep(dt);R3.render(SCENE,CAM)}
const LEVELS=[];// заполняется levels1/levels2/boss
