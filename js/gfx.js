'use strict';
// ===== Графика раунда 5: небо с облаками, тон-маппинг, трава-кустики (инстансы, качаются), цветы, бабочки, птицы, пыльца =====
R3.toneMapping=THREE.ACESFilmicToneMapping;R3.toneMappingExposure=1.05;HEMI.intensity=2.2;SUN.intensity=2.8;
// небо: градиент + солнечное сияние + мягкие облака (fbm) — uniforms a/b по-прежнему задают цвета уровня
SKY.material.uniforms.t={value:0};SKY.material.uniforms.sd={value:new THREE.Vector3(.35,.45,-.8).normalize()};
SKY.material.vertexShader='varying vec3 vp;void main(){vp=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}';
SKY.material.fragmentShader=`uniform vec3 a,b,sd;uniform float t;varying vec3 vp;
float h2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h2(i),h2(i+vec2(1,0)),f.x),mix(h2(i+vec2(0,1)),h2(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,k=.5;for(int i=0;i<5;i++){v+=k*n2(p);p*=2.03;k*=.5;}return v;}
void main(){float h=vp.y;vec3 c=mix(b,a,clamp(h*1.6,0.,1.));
 float s=max(dot(vp,sd),0.);c+=vec3(1.,.93,.75)*(pow(s,8.)*.35+pow(s,200.)*.8);
 if(h>0.){vec2 uv=vp.xz/(h+.18)*1.6+vec2(t*.006,0.);float cl=smoothstep(.5,.78,fbm(uv));float sh=fbm(uv+vec2(.07,.05));
  vec3 cc=mix(vec3(1.),mix(b,vec3(.78,.8,.92),.5),smoothstep(.45,.8,sh)*.55);c=mix(c,cc,cl*smoothstep(0.,.25,h)*.85);}
 gl_FragColor=vec4(c,1.);
}`;SKY.material.toneMapped=false;SKY.material.needsUpdate=true;
// трава богаче: пятна тона + травинки + клевер
{const c=TEX.grass.image,x=c.getContext('2d');const w=c.width,h=c.height;
 for(let i=0;i<40;i++){const g=x.createRadialGradient(0,0,0,0,0,1);const px=Math.random()*w,py=Math.random()*h,r=20+Math.random()*50;x.save();x.translate(px,py);x.scale(r,r);g.addColorStop(0,Math.random()<.5?'rgba(160,220,90,.25)':'rgba(70,140,60,.22)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.beginPath();x.arc(0,0,1,0,7);x.fill();x.restore()}
 for(let i=0;i<700;i++){const px=Math.random()*w,py=Math.random()*h;x.strokeStyle=`hsla(${90+Math.random()*35},${55+Math.random()*25}%,${30+Math.random()*30}%,.6)`;x.lineWidth=1.2;x.beginPath();x.moveTo(px,py);x.lineTo(px+Math.random()*3-1.5,py-3-Math.random()*5);x.stroke()}
 for(let i=0;i<14;i++){x.fillStyle=['#ffffff','#ffe14a','#ff9ac0'][i%3];x.globalAlpha=.7;x.beginPath();x.arc(Math.random()*w,Math.random()*h,1.4,0,7);x.fill()}x.globalAlpha=1;TEX.grass.needsUpdate=true}
// ---- декор уровня ----
const GFX={w:null,grass:null,fl:null,bf:[],birds:[],pol:null,mats:[]};
const GFXU={time:{value:0}};
function swayMat(col,o){const m=new THREE.MeshLambertMaterial(Object.assign({color:col,side:THREE.DoubleSide},o||{}));
 m.onBeforeCompile=s=>{s.uniforms.uT=GFXU.time;s.vertexShader='uniform float uT;\n'+s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
  #ifdef USE_INSTANCING
  vec3 ip=vec3(instanceMatrix[3][0],instanceMatrix[3][1],instanceMatrix[3][2]);
  #else
  vec3 ip=vec3(0.);
  #endif
  float sw=sin(uT*1.8+ip.x*.45+ip.z*.3)*.5+sin(uT*3.1+ip.x*1.3)*.2;transformed.x+=sw*.12*position.y*position.y*3.;transformed.z+=sw*.05*position.y;`)};return m}
function tuftGeo(){const g=new THREE.BufferGeometry();const P=[],C=[],N=[];const blades=7;for(let i=0;i<blades;i++){const a=i/blades*Math.PI+Math.random()*.4,r=.05+Math.random()*.06,h=.22+Math.random()*.2,w=.035;
  const cx=Math.cos(a*2)*r,cz=Math.sin(a*2)*r,dx=Math.cos(a)*w,dz=Math.sin(a)*w,lean=(Math.random()-.5)*.12;
  P.push(cx-dx,0,cz-dz, cx+dx,0,cz+dz, cx+lean,h,cz+lean*.5);for(let k=0;k<3;k++){N.push(0,1,0)}C.push(.16,.36,.1, .16,.36,.1, .42,.62,.2)}
 g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));return g}
function flowerGeo(){const g=new THREE.BufferGeometry();const P=[],N=[],C=[];const h=.26;P.push(-.01,0,0,.01,0,0,0,h,0);N.push(0,1,0,0,1,0,0,1,0);C.push(.3,.6,.25,.3,.6,.25,.3,.6,.25);
 for(let i=0;i<5;i++){const a=i/5*6.283,a2=a+.6;P.push(0,h,0,Math.cos(a)*.07,h+.01,Math.sin(a)*.07,Math.cos(a2)*.07,h+.01,Math.sin(a2)*.07);N.push(0,1,0,0,1,0,0,1,0);C.push(1,.95,.5,.85,.85,.85,.85,.85,.85)}
 g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));return g}
const _gr=new THREE.Raycaster(),_gd=new THREE.Vector3(0,-1,0),_gm=new THREE.Matrix4(),_gq=new THREE.Quaternion(),_gs=new THREE.Vector3(),_gp=new THREE.Vector3(),_ge=new THREE.Euler();
function gfxFree(x,z){for(const b of BLOCKS)if(b.on&&inBlock(b,x,z,.25))return false;for(const c of CYLS)if(c.on&&Math.hypot(x-c.x,z-c.z)<c.r+.25)return false;for(const n of NOGO){try{if(typeof n==='function'&&(n(x,z)||n(x+.3,z)||n(x,z+.3)||n(x-.3,z)||n(x,z-.3)))return false}catch(e){}}return true}
function gfxDecor(){GFX.w=WORLD;const gp=WORLD.children.find(o=>o.isMesh&&o.material&&o.material.map===TEX.grass&&o.geometry.type==='PlaneGeometry');GFX.bf=[];GFX.birds=[];
 if(!gp)return;const lowQ=FPS<40;const B=BOUNDS||[-14,14,-6,30];const x0=B[0]-5,x1=B[1]+5,z0=B[2]-4,z1=B[3]+6;const area=(x1-x0)*(z1-z0);
 const nT=Math.min(lowQ?700:1400,Math.round(area*1.1)),nF=Math.min(260,Math.round(area*.18));
 const others=[];WORLD.traverse(o=>{if(o.isMesh&&o!==gp&&o.visible)others.push(o)});
 const ok=(x,z)=>{if(!gfxFree(x,z))return false;const y=baseAt(x,z);_gr.set(_gp.set(x,y+3,z),_gd);_gr.far=3.2;const hit=_gr.intersectObjects(others,false)[0];return !hit||hit.point.y<y+.02};
 const tg=new THREE.InstancedMesh(tuftGeo(),swayMat(0xffffff,{vertexColors:true}),nT),fg=new THREE.InstancedMesh(flowerGeo(),swayMat(0xffffff,{vertexColors:true}),nF);
 const FC=[0xff6fa8,0xffe14a,0xffffff,0xb07cff,0xff8a3a,0x7ec8ff].map(c=>new THREE.Color(c));let i=0,j=0,tries=0;
 while((i<nT||j<nF)&&tries<(nT+nF)*3){tries++;const x=x0+Math.random()*(x1-x0),z=z0+Math.random()*(z1-z0);if(!ok(x,z))continue;const y=baseAt(x,z);_ge.set(0,Math.random()*6.28,0);_gq.setFromEuler(_ge);
  if(i<nT&&(j>=nF||Math.random()<.85)){_gs.set(.7+Math.random()*.5,.55+Math.random()*.6,.7+Math.random()*.5);_gm.compose(_gp.set(x,y,z),_gq,_gs);tg.setMatrixAt(i++,_gm)}else if(j<nF){_gs.setScalar(.8+Math.random()*.6);_gm.compose(_gp.set(x,y,z),_gq,_gs);fg.setMatrixAt(j,_gm);fg.setColorAt(j++,FC[(Math.random()*FC.length)|0])}}
 tg.count=i;fg.count=j;tg.frustumCulled=fg.frustumCulled=false;tg.userData.decor=fg.userData.decor=1;WORLD.add(tg);WORLD.add(fg);GFX.grass=tg;GFX.fl=fg;try{gfxProps(ok,x0,x1,z0,z1,lowQ)}catch(e){console.error(e)}
 // бабочки
 const wc=['#ff7ab0','#ffd23a','#8ad0ff','#c08aff'];for(let k=0;k<(lowQ?3:6);k++){const t=cvTex(64,64,(x,w,h)=>{x.fillStyle=wc[k%4];x.beginPath();x.ellipse(36,24,24,18,-.4,0,7);x.fill();x.beginPath();x.ellipse(32,46,16,12,.3,0,7);x.fill();x.fillStyle='rgba(255,255,255,.7)';x.beginPath();x.arc(40,22,6,0,7);x.fill();x.strokeStyle='#40204a';x.lineWidth=3;x.beginPath();x.ellipse(36,24,24,18,-.4,0,7);x.stroke()});
  const m=new THREE.MeshBasicMaterial({map:t,transparent:true,side:THREE.DoubleSide,depthWrite:false,alphaTest:.1});const g=new THREE.Group();
  [-1,1].forEach(s=>{const p=new THREE.Mesh(new THREE.PlaneGeometry(.22,.22),m);p.geometry.translate(.11,0,0);p.scale.x=s;const piv=new THREE.Group();piv.add(p);piv.rotation.x=-Math.PI/2;piv.userData.s=s;g.add(piv)});
  g.userData={c:new THREE.Vector3(rnd(x0+4,x1-4),0,rnd(z0+4,z1-4)),ph:Math.random()*10,sp:.6+Math.random()*.5};g.userData.decor=1;WORLD.add(g);GFX.bf.push(g)}
 // птицы-галочки далеко в небе
 const bm=new THREE.MeshBasicMaterial({color:0x40405a,side:THREE.DoubleSide,fog:false});for(let k=0;k<(lowQ?3:5);k++){const g=new THREE.Group();[-1,1].forEach(s=>{const p=new THREE.Mesh(new THREE.PlaneGeometry(.9,.18),bm);p.geometry.translate(.45,0,0);const piv=new THREE.Group();piv.add(p);piv.scale.x=s;g.add(piv)});g.userData={r:60+k*9,a:Math.random()*6.28,y:28+k*3,sp:.04+Math.random()*.03,ph:k};WORLD.add(g);GFX.birds.push(g)}
 // пыльца в лучах солнца
 const n=lowQ?60:140,pp=new Float32Array(n*3);for(let k=0;k<n;k++){pp[k*3]=rnd(-12,12);pp[k*3+1]=rnd(.2,5);pp[k*3+2]=rnd(-12,12)}const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pp,3));
 GFX.pol=new THREE.Points(pg,new THREE.PointsMaterial({map:TEX.dot,size:.09,color:0xfff3c0,transparent:true,opacity:.75,depthWrite:false,blending:THREE.AdditiveBlending}));GFX.pol.frustumCulled=false;WORLD.add(GFX.pol)}
function gfxStep(dt){GFXU.time.value+=dt;SKY.material.uniforms.t.value+=dt;SKY.position.copy(CAM.position);
 if(GFX.w!==WORLD&&WORLD.children.length>2)gfxDecor();
 const hx=typeof HERO!=='undefined'?HERO.x:0,hz=typeof HERO!=='undefined'?HERO.z:0,T0=GFXU.time.value;
 for(const g of GFX.bf){const u=g.userData,t=T0*u.sp+u.ph;const c=u.c;if(Math.hypot(c.x-hx,c.z-hz)>14){c.set(hx+rnd(-7,7),0,hz+rnd(2,9))}
  const x=c.x+Math.sin(t*.9)*2.2+Math.sin(t*2.3)*.4,z=c.z+Math.cos(t*.7)*1.8,y=baseAt(x,z)+.6+Math.sin(t*1.7)*.35+.25;const dx=x-g.position.x,dz=z-g.position.z;g.position.set(x,y,z);if(dx*dx+dz*dz>1e-6)g.rotation.y=Math.atan2(dx,dz);
  const f=Math.sin(T0*22+u.ph)*1.1;g.children.forEach(p=>{p.rotation.z=f*p.userData.s})}
 for(const g of GFX.birds){const u=g.userData;u.a+=dt*u.sp;g.position.set(hx+Math.cos(u.a)*u.r,u.y+Math.sin(T0*.5+u.ph)*2,hz+20+Math.sin(u.a)*u.r*.5);g.rotation.y=-u.a;const f=Math.sin(T0*6+u.ph)*.5;g.children[0].rotation.z=f;g.children[1].rotation.z=f}
 if(GFX.pol){const p=GFX.pol.geometry.attributes.position,a=p.array,cx=CAM.position.x,cz=CAM.position.z;for(let k=0;k<a.length;k+=3){a[k]+=Math.sin(T0*.7+k)*dt*.12;a[k+1]+=dt*(.05+.04*Math.sin(k));a[k+2]+=Math.cos(T0*.6+k)*dt*.12;
  if(a[k+1]>5.5)a[k+1]=.2;if(a[k]-cx>12)a[k]-=24;else if(a[k]-cx<-12)a[k]+=24;if(a[k+2]-cz>12)a[k+2]-=24;else if(a[k+2]-cz<-12)a[k+2]+=24}p.needsUpdate=true}}
// ---- скруглённые коробки: GEO.box с масштабом-массивом получает фаску ~6 см (гладкие нормали), радиусы считаются в мировых единицах ----
const RBC={};
function roundBoxGeo(sx,sy,sz){const r=Math.min(.07,.2*Math.min(sx,sy,sz));const k=[sx,sy,sz].map(v=>v.toFixed(2)).join(',')+r.toFixed(3);if(RBC[k])return RBC[k];
 const g=new THREE.BoxGeometry(1,1,1,3,3,3);const ra=[r/sx,r/sy,r/sz],p=g.attributes.position,n=g.attributes.normal,v=[0,0,0],inn=[0,0,0],d=[0,0,0];
 for(let i=0;i<p.count;i++){v[0]=p.getX(i);v[1]=p.getY(i);v[2]=p.getZ(i);
  for(let a=0;a<3;a++){const s=Math.sign(v[a])||1;if(Math.abs(v[a])<.3)v[a]=s*(.5-ra[a]);inn[a]=Math.max(-(.5-ra[a]),Math.min(.5-ra[a],v[a]));d[a]=(v[a]-inn[a])/ra[a]}
  let l=Math.hypot(d[0],d[1],d[2]);if(l<1e-6){d[0]=n.getX(i);d[1]=n.getY(i);d[2]=n.getZ(i);l=1}
  p.setXYZ(i,inn[0]+d[0]/l*ra[0],inn[1]+d[1]/l*ra[1],inn[2]+d[2]/l*ra[2]);const nx=d[0]/l/ra[0],ny=d[1]/l/ra[1],nz=d[2]/l/ra[2],nl=Math.hypot(nx,ny,nz);n.setXYZ(i,nx/nl,ny/nl,nz/nl)}
 // нормаль в «единичном» пространстве; three сам применит normalMatrix масштаба
 RBC[k]=g;return g}
{const _mesh=mesh;mesh=function(g,m,x,y,z,p,s){if(g===GEO.box&&Array.isArray(s)&&s[0]>0&&s[1]>0&&s[2]>0&&Math.max(s[0],s[1],s[2])<60)g=roundBoxGeo(s[0],s[1],s[2]);return _mesh(g,m,x,y,z,p,s)}}
// ---- камни и забор по краю площадки ----
function rockGeo(){const g=new THREE.IcosahedronGeometry(1,2);const p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);const f=1+.18*Math.sin(x*3.1+z*2.3)+.12*Math.sin(y*4.7+x*1.9);p.setXYZ(i,x*f,Math.max(-.2,y*f*.7),z*f)}g.computeVertexNormals();return g}
function gfxProps(ok,x0,x1,z0,z1,lowQ){const B=BOUNDS||[-14,14,-6,30];
 const nR=lowQ?24:50,rm=new THREE.InstancedMesh(rockGeo(),new THREE.MeshStandardMaterial({color:0xffffff,roughness:.95,metalness:0}),nR);const RC=[0x9a9aa6,0x8c8478,0xb0aca0,0x7d8590].map(c=>new THREE.Color(c));let i=0,t=0;
 while(i<nR&&t<nR*20){t++;const x=x0+Math.random()*(x1-x0),z=z0+Math.random()*(z1-z0);const edge=Math.min(Math.abs(x-B[0]),Math.abs(x-B[1]),Math.abs(z-B[2]),Math.abs(z-B[3]));if(edge>3.5&&Math.random()<.8)continue;if(z<B[2]+.5)continue;// не за задним краем: там камераif(!ok(x,z))continue;
  const s=.12+Math.random()*Math.random()*.45;_ge.set(rnd(-.3,.3),Math.random()*6.28,rnd(-.3,.3));_gq.setFromEuler(_ge);_gs.set(s*rnd(.8,1.4),s,s*rnd(.8,1.3));_gm.compose(_gp.set(x,baseAt(x,z)+s*.15,z),_gq,_gs);rm.setMatrixAt(i,_gm);rm.setColorAt(i++,RC[(Math.random()*4)|0])}
 rm.count=i;rm.userData.decor=1;rm.frustumCulled=false;WORLD.add(rm);
 // заборчик из кольев с двумя жердями, только там, где свободно
 const posts=[],rails=[];const wood=new THREE.MeshStandardMaterial({color:0xb07a46,roughness:.85});const fx0=B[0]-1.2,fx1=B[1]+1.2,fz0=B[2]-1.2,fz1=B[3]+1.2;
 const side=(ax,az,bx,bz)=>{const L=Math.hypot(bx-ax,bz-az),n=Math.max(2,Math.round(L/1.6));let prev=null;for(let k=0;k<=n;k++){const x=ax+(bx-ax)*k/n,z=az+(bz-az)*k/n;const f=ok(x,z);if(f)posts.push([x,z]);if(f&&prev)rails.push([prev[0],prev[1],x,z]);prev=f?[x,z]:null}};
 side(fx1,fz0+2.5,fx1,fz1);side(fx1,fz1,fx0,fz1);side(fx0,fz1,fx0,fz0+2.5);// без задней стороны: там камера
 const pg=new THREE.CylinderGeometry(.06,.07,.9,7);pg.translate(0,.45,0);const cap=new THREE.ConeGeometry(.085,.14,7);cap.translate(0,.97,0);
 const pm=new THREE.InstancedMesh(pg,wood,posts.length),cm=new THREE.InstancedMesh(cap,wood,posts.length);posts.forEach(([x,z],k)=>{_gm.makeTranslation(x,baseAt(x,z),z);pm.setMatrixAt(k,_gm);cm.setMatrixAt(k,_gm)});
 const rg=roundBoxGeo(1,.07,.05),rl=new THREE.InstancedMesh(rg,wood,rails.length*2);rails.forEach(([ax,az,bx,bz],k)=>{const L=Math.hypot(bx-ax,bz-az);_ge.set(0,-Math.atan2(bz-az,bx-ax),0);_gq.setFromEuler(_ge);for(const h of [0,1]){_gs.set(L,.07,.05);_gm.compose(_gp.set((ax+bx)/2,baseAt(ax,az)+.35+h*.32,(az+bz)/2),_gq,_gs);rl.setMatrixAt(k*2+h,_gm)}});
 for(const o of [pm,cm,rl]){o.userData.decor=1;o.frustumCulled=false;WORLD.add(o)}}
