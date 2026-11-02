'use strict';
// ===== v6: 3D-Даня в игре (TRELLIS-меш → риг Blender → assets/3d/dania.glb), лицо — канвас-декаль с эмоциями (как proto/hero.html) =====
// Интерфейс как у спрайтового героя: {n,root,body,F,h,anim,cheerT,kickT,hold,sq,hop,mat,update}
const D3={ready:null,g:null,ACT:{},MIX:null,B:{},wand:null,sc:1,ok:false};
{const Q=new URLSearchParams(location.search);D3.off=Q.get('d3')==='0'}
const D3G=(()=>{const v=[132,146,166,196,224,242,252,255];const d=new Uint8Array(v.flatMap(a=>[a,a,a,255]));const t=new THREE.DataTexture(d,8,1);t.minFilter=t.magFilter=THREE.LinearFilter;t.needsUpdate=true;return t})();
function d3rim(m,str){m.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
 float rimF=pow(1.0-clamp(dot(normalize(normal),normalize(vViewPosition)),0.0,1.0),2.6);totalEmissiveRadiance+=vec3(1.0,.86,.62)*rimF*${str.toFixed(2)};`)};return m}
// --- лицо
const D3F={c:document.createElement('canvas'),c2:document.createElement('canvas'),emo:'smile',blink:0,key:'',I:{},n:0};
D3F.c.width=D3F.c.height=D3F.c2.width=D3F.c2.height=512;D3F.T=new THREE.CanvasTexture(D3F.c);D3F.T.colorSpace=THREE.SRGBColorSpace;D3F.T.flipY=false;D3F.T.anisotropy=4;
const D3SKIN='rgb(242,158,98)',D3EYE=[[150,238],[364,238]];
function d3img(n){return new Promise(r=>{const im=new Image();im.onload=()=>{D3F.n++;r()};im.onerror=()=>r();im.src='assets/3d/face_'+n+'.png?v='+window.V;D3F.I[n]=im})}
function d3face(){const emo=D3F.emo,blink=D3F.blink,k=emo+blink.toFixed(2)+D3F.n;if(k===D3F.key)return;D3F.key=k;const x=D3F.c2.getContext('2d');x.clearRect(0,0,512,512);if(D3F.n<3)return;const I=D3F.I,SK=D3SKIN;
 const hap=emo==='happy'||emo==='delight';x.drawImage(I.base,0,0);
 if(hap){for(const cx of[95,418]){const g=x.createRadialGradient(cx,330,0,cx,330,60);g.addColorStop(0,'rgba(240,95,80,.30)');g.addColorStop(1,'rgba(240,95,80,0)');x.fillStyle=g;x.fillRect(cx-62,268,124,124)}}
 let open=1-blink;if(emo==='focus')open*=.62;if(emo==='determined')open*=.8;if(emo==='sad')open*=.75;
 for(const [cx,cy] of D3EYE){const rx=60,ry=50;x.save();x.beginPath();x.ellipse(cx,cy,rx,ry,0,0,7);x.clip();
  if(emo==='delight'){x.fillStyle=SK;x.fillRect(cx-rx,cy-ry,rx*2,ry*2);x.restore();x.strokeStyle='#3a1a08';x.lineWidth=11;x.lineCap='round';x.beginPath();x.moveTo(cx-46,cy+10);x.quadraticCurveTo(cx,cy-34,cx+46,cy+10);x.stroke();continue}
  if(open<.999){const ly=cy-ry+ry*2*(1-open);x.fillStyle=SK;x.beginPath();x.moveTo(cx-rx-2,cy-ry-2);x.lineTo(cx+rx+2,cy-ry-2);x.lineTo(cx+rx+2,ly);x.quadraticCurveTo(cx,ly+10,cx-rx-2,ly);x.closePath();x.fill();
   x.restore();x.strokeStyle='#3a1a08';x.lineWidth=open<.15?9:7;x.lineCap='round';x.beginPath();x.moveTo(cx-rx*.92,ly+(open<.15?-2:4));x.quadraticCurveTo(cx,ly+(open<.15?14:10),cx+rx*.92,ly+(open<.15?-2:4));x.stroke()}
  else if(emo==='happy'){x.fillStyle=SK;x.beginPath();x.moveTo(cx-rx-2,cy+ry+2);x.lineTo(cx-rx-2,cy+ry*.35);x.quadraticCurveTo(cx,cy,cx+rx+2,cy+ry*.35);x.lineTo(cx+rx+2,cy+ry+2);x.fill();x.restore()}
  else x.restore()}
 const BR={smile:[0,0],happy:[-5,0],surprise:[-18,-.04],focus:[8,.16],determined:[6,.22],delight:[-10,0],sad:[-4,-.25],talk:[-3,0]}[emo]||[0,0];
 for(const [s,cx,x0,x1] of [[-1,150,60,256],[1,370,256,460]]){x.save();x.beginPath();x.rect(x0,60,x1-x0,150);x.clip();x.translate(cx,135+BR[0]);x.rotate(-s*BR[1]);x.translate(-cx,-135);x.drawImage(I.brows,0,0);x.restore()}
 x.lineCap='round';x.lineJoin='round';const ML='#7a2c16',MY=372;
 if(hap){const w=emo==='delight'?78:70,d=emo==='delight'?70:50;x.fillStyle='#7c2416';x.beginPath();x.moveTo(256-w,MY-4);x.quadraticCurveTo(256,MY-4+d*1.6,256+w,MY-4);x.quadraticCurveTo(256,MY+10,256-w,MY-4);x.fill();
  x.save();x.clip();x.fillStyle='#fff8f0';x.fillRect(160,MY-12,192,22);x.fillStyle='#e8705c';x.beginPath();x.ellipse(256,MY-4+d*.95,w*.5,d*.32,0,0,7);x.fill();x.restore()}
 else if(emo==='surprise'||emo==='talk'){const o=emo==='talk'?.6:1;x.fillStyle='#7c2416';x.beginPath();x.ellipse(256,MY+10,26*o+8,26*o,0,0,7);x.fill();x.fillStyle='#e8705c';x.beginPath();x.ellipse(256,MY+10+18*o,13,7*o,0,0,7);x.fill()}
 else if(emo==='focus'){x.strokeStyle=ML;x.lineWidth=7;x.beginPath();x.moveTo(206,MY+12);x.quadraticCurveTo(250,MY+22,296,MY+6);x.stroke()}
 else if(emo==='determined'){x.strokeStyle=ML;x.lineWidth=7;x.beginPath();x.moveTo(196,MY+2);x.quadraticCurveTo(256,MY+30,316,MY);x.stroke()}
 else if(emo==='sad'){x.strokeStyle=ML;x.lineWidth=7;x.beginPath();x.moveTo(210,MY+24);x.quadraticCurveTo(256,MY-4,302,MY+24);x.stroke()}
 else x.drawImage(I.mouth,0,0);
 const y=D3F.c.getContext('2d');y.clearRect(0,0,512,512);y.filter='saturate(.66)';y.drawImage(D3F.c2,0,0);y.filter='none';y.globalCompositeOperation='destination-in';y.drawImage(D3MASK,0,0);y.globalCompositeOperation='source-over';D3F.T.needsUpdate=true}
// v6.1: мягкий край декали (без «наклейки» на лбу и щеках)
const D3MASK=(()=>{const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');x.translate(256,270);x.scale(1,1.08);const g=x.createRadialGradient(0,0,150,0,0,250);g.addColorStop(0,'#000');g.addColorStop(.7,'rgba(0,0,0,.9)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(-300,-300,600,600);x.setTransform(1,0,0,1,0,0);x.globalCompositeOperation='destination-in';const v=x.createLinearGradient(0,30,0,120);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'#000');x.fillStyle=v;x.fillRect(0,0,512,512);return c})();
// v6.1: треугольник на груди (как на арте) — канвас на патче chest
function d3chest(){const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.translate(128,128);x.lineJoin='round';
 x.beginPath();x.moveTo(0,-58);x.lineTo(60,46);x.lineTo(-60,46);x.closePath();x.fillStyle='#ffd34a';x.fill();x.lineWidth=14;x.strokeStyle='#fff4d6';x.stroke();
 x.beginPath();x.moveTo(0,-26);x.lineTo(30,28);x.lineTo(-30,28);x.closePath();x.fillStyle='#ffb02e';x.fill();
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
// v6.1: крапинки на волосах — светлые ненасыщенные пятна выше плеч перекрашиваем в каштан (по объектной высоте, до скиннинга)
function d3hair(m,bb){const y0=bb.min.y+(bb.max.y-bb.min.y)*.70;const cb=m.onBeforeCompile;m.onBeforeCompile=sh=>{cb(sh);
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float hy;\nvarying float vHy;').replace('#include <begin_vertex>','#include <begin_vertex>\nvHy=hy;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vHy;').replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
 if(vHy>${y0.toFixed(4)})totalEmissiveRadiance=min(totalEmissiveRadiance,vec3(.008,.0033,.0012));`).replace('#include <map_fragment>',`#include <map_fragment>
 if(vHy>${y0.toFixed(4)}){vec3 c=diffuseColor.rgb;float mx=max(c.r,max(c.g,c.b)),mn=min(c.r,min(c.g,c.b));float sat=(mx-mn)/max(mx,.001);
  diffuseColor.rgb=min(c,vec3(.11,.045,.016)*(.6+.4*mx/max(mx,.11)));}`)};return m}
// --- палочка со звездой
function d3wand(){const w=new THREE.Group(),G=D3G;const OUT=new THREE.MeshBasicMaterial({color:0x3a2416,side:THREE.BackSide});
 const P=(geo,mat,pos,ol)=>{const m=new THREE.Mesh(geo,mat);if(pos)m.position.set(...pos);m.castShadow=true;w.add(m);const o=new THREE.Mesh(geo,OUT);o.scale.setScalar(1+ol);m.add(o);return m};
 const g=new THREE.CylinderGeometry(.0105,.0145,.29,10);g.translate(0,.085,0);P(g,new THREE.MeshToonMaterial({color:0x8a5a2e,gradientMap:G}),null,.08);
 const st=new THREE.Shape();for(let i=0;i<10;i++){const r=i%2?.024:.056,a=i/10*Math.PI*2+Math.PI/2;i?st.lineTo(Math.cos(a)*r,Math.sin(a)*r):st.moveTo(Math.cos(a)*r,Math.sin(a)*r)}
 const sg=new THREE.ExtrudeGeometry(st,{depth:.014,bevelEnabled:true,bevelSize:.007,bevelThickness:.008,bevelSegments:2});sg.center();
 D3.star=P(sg,new THREE.MeshToonMaterial({color:0xffe27a,emissive:0xffc93a,emissiveIntensity:1.1,gradientMap:G}),[0,.272,0],.06);return w}
D3.ready=D3.off?Promise.resolve():Promise.all([d3img('base'),d3img('brows'),d3img('mouth'),new Promise(res=>{
 if(typeof GLTFLoader==='undefined'){console.warn('no GLTFLoader');return res()}
 new GLTFLoader().load('assets/3d/dania.glb?v='+window.V,g=>{const m=g.scene,CH=new THREE.Color('#e6ecf8');
  m.traverse(o=>{if(o.isBone)D3.B[o.name.replace(/[._]/g,'')]=o;if(!o.isMesh)return;o.frustumCulled=false;const nm=o.material.name;
   if(nm==='face'){o.material=d3rim(new THREE.MeshToonMaterial({map:D3F.T,color:CH,gradientMap:D3G,transparent:true,emissive:0xffffff,emissiveMap:D3F.T,emissiveIntensity:.07,polygonOffset:true,polygonOffsetFactor:-8,polygonOffsetUnits:-8,depthWrite:false}),.2);o.renderOrder=2;return}
   if(nm==='chest'){o.visible=false;return;const t=d3chest();o.material=d3rim(new THREE.MeshToonMaterial({map:t,color:CH,gradientMap:D3G,transparent:true,emissive:0xffffff,emissiveMap:t,emissiveIntensity:.1,polygonOffset:true,polygonOffsetFactor:-8,polygonOffsetUnits:-8,depthWrite:false}),.2);o.renderOrder=2;return}
   o.castShadow=true;o.receiveShadow=true;const map=o.material.map;if(map){map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4}
   o.geometry.computeBoundingBox();{const P=o.geometry.attributes.position,a=new Float32Array(P.count);for(let i=0;i<P.count;i++)a[i]=P.getY(i)>1.0||P.getZ(i)<-.01?P.getY(i):0;o.geometry.setAttribute('hy',new THREE.BufferAttribute(a,1))}o.material=d3hair(d3rim(new THREE.MeshToonMaterial({map,color:CH,gradientMap:D3G,emissive:0xffffff,emissiveMap:map,emissiveIntensity:.07}),.24),o.geometry.boundingBox)});
  {const cb=D3.B.chest1||D3.B.chest;if(cb){m.updateMatrixWorld(true);const t=d3chest();const pl=new THREE.Mesh(new THREE.PlaneGeometry(.15,.15),new THREE.MeshToonMaterial({map:t,transparent:true,gradientMap:D3G,emissive:0xffffff,emissiveMap:t,emissiveIntensity:.15,polygonOffset:true,polygonOffsetFactor:-6,depthWrite:false}));pl.renderOrder=2;
  const wp=new THREE.Vector3(0,.60,.13);m.localToWorld(wp);cb.worldToLocal(wp);pl.position.copy(wp);const q=new THREE.Quaternion();cb.getWorldQuaternion(q);pl.quaternion.copy(q.invert());pl.rotateX(-.12);pl.scale.setScalar(1/cb.getWorldScale(new THREE.Vector3()).x);cb.add(pl);D3.tri=pl}}
 for(const n of['hood','laceL','laceR'])if(D3.B[n])D3.B[n].userData.q0=D3.B[n].quaternion.clone();
  m.updateMatrixWorld(true);const bb=new THREE.Box3().setFromObject(m,true);D3.sc=1.9/(bb.max.y-bb.min.y);m.scale.setScalar(D3.sc);
  D3.MIX=new THREE.AnimationMixer(m);for(const c of g.animations){const a=D3.MIX.clipAction(c);a.play();a.setEffectiveWeight(0);a.userData={w:0};D3.ACT[c.name]=a}
  for(const n of['kick','jump_crouch','jump_air','jump_land','cheer'])if(D3.ACT[n]){D3.ACT[n].setLoop(THREE.LoopOnce);D3.ACT[n].clampWhenFinished=true}
  D3.g=m;D3.wand=d3wand();D3.wand.scale.setScalar(D3.sc);D3.ok=true;d3face();res()},undefined,e=>{console.warn('dania.glb',e);res()})})]);
window.SPR_READY=Promise.all([window.SPR_READY,D3.ready]);
// --- свет и тени (v6): солнце с тенью за героем, контровой свет
const D3L={rim:new THREE.DirectionalLight(0xffd9a0,.9)};SCENE.add(D3L.rim,D3L.rim.target);
R3.shadowMap.enabled=true;R3.shadowMap.type=THREE.PCFSoftShadowMap;SUN.castShadow=true;SUN.shadow.mapSize.set(1024,1024);
Object.assign(SUN.shadow.camera,{left:-7,right:7,top:7,bottom:-7,near:1,far:40});SUN.shadow.bias=-.0005;SUN.shadow.normalBias=.03;SCENE.add(SUN.target);
D3.rcv=null;function d3shadowRecv(){if(D3.rcv===WORLD)return;D3.rcv=WORLD;if(WORLD)WORLD.traverse(o=>{if(o.isMesh&&!o.material.transparent)o.receiveShadow=true})}
const _d3a=new THREE.Vector3(),_d3b=new THREE.Vector3(),_d3d=new THREE.Vector3(),_d3w=new THREE.Vector3(),_d3u=new THREE.Vector3(0,1,0),_d3s=new THREE.Vector3(0,1,0),_d3f=new THREE.Vector3();
const _md=makeDania;
makeDania=function(){if(!D3.ok)return _md();const root=new THREE.Group(),body=new THREE.Group();root.add(body);body.add(D3.g);SCENE.add(D3.wand);
 const F={mood:'happy',bl:0,nb:2,step(dt){this.nb-=dt;if(this.nb<0){this.bl=.16;this.nb=1.8+Math.random()*2.6}if(this.bl>0)this.bl-=dt}};
 const mat={opacity:1,depthWrite:true};// совместимость с occStep (Даню не растворяем)
 const ch={n:'dania',d3:true,root,body,F,mat,h:2.0,anim:'idle',look:null,cheerT:-9,kickT:-9,hold:false,ph:0,vyaw:null,hop:0,sp:0,idleT:0,sq:0,wasAir:false,landT:-9,run:0,spr:{h:0,hv:0,l:0,lv:0},tg:{visible:true}};
 ch.update=function(dt,sp){d3update(this,dt,sp||0)};CHARS.push(ch);SCENE.add(root);ch.shadow=blobShadow();ch.shadow.scale.setScalar(.9);ch.shadow.material.opacity=.5;d3update(ch,0,0);return ch};
const _rc=removeChar;removeChar=function(ch){_rc(ch);if(ch&&ch.d3&&D3.wand)SCENE.remove(D3.wand)};
const d3damp=(a,b,l,dt)=>a+(b-a)*(1-Math.exp(-l*dt));
function d3at(n,t){const a=D3.ACT[n];if(!a)return;a.time=Math.min(Math.max(0,t),a.getClip().duration-.001)}
function d3footTab(c){const A=D3.ACT,v=new THREE.Vector3(),N=64,o={n:N};const w0={};for(const k in A)w0[k]=A[k].getEffectiveWeight();
 for(const cl of ['walk','run']){for(const k in A)A[k].setEffectiveWeight(k===cl?1:0);const P=[];
  for(let i=0;i<N;i++){A[cl].time=i/N*A[cl].getClip().duration;D3.MIX.update(0);c.body.updateMatrixWorld(true);const q=[];for(const b of [D3.B.footL,D3.B.footR]){b.getWorldPosition(v);c.body.worldToLocal(v);q.push([v.y,v.z])}P.push(q)}
  const r=[];for(let i=0;i<N;i++){const a=P[(i+N-1)%N],b=P[(i+1)%N],dl=b[0][1]-a[0][1],dr=b[1][1]-a[1][1];r.push(Math.max(0,-Math.min(dl,dr))*N/2)/* опорная = та, что едет назад относительно тела */}
  const m=r.reduce((x,y)=>x+y,0)/N;o[cl]=r.map(x=>Math.min(m*1.8,Math.max(x,m*.6)))}
 for(const k in A)A[k].setEffectiveWeight(w0[k]);D3.FT=o}
function d3update(c,dt,sp){if(!D3.MIX)return;c.F.step(dt);d3shadowRecv();const A=D3.ACT;
 const cut=typeof CUT!=='undefined'&&CUT,tk=typeof talking==='function'&&talking('dania'),sit=c.anim==='sit',air=c.anim==='air',oops=c.F.mood==='sad';
 const ca=Math.atan2(CAM.position.x-c.root.position.x,CAM.position.z-c.root.position.z),ry=c.root.rotation.y;
 const cheer=T-c.cheerT<1.3,kick=T-c.kickT<.55;const still=c.anim==='idle'&&!c.hold&&!cut;c.idleT=still?c.idleT+dt:0;
 let want=ry;if((cheer||oops)&&!sit&&c.anim!=='run')want=ca;else if(c.idleT>2.5&&SCN&&SCN.world)want=ca;
 if(c.vyaw==null||!dt)c.vyaw=want;else c.vyaw+=Math.atan2(Math.sin(want-c.vyaw),Math.cos(want-c.vyaw))*Math.min(1,dt*7);c.body.rotation.y=c.vyaw-ry;
 if(c.wasAir&&!air)c.landT=T;c.wasAir=air;c.run=d3damp(c.run,c.anim==='run'?sp:0,10,dt);
 const S=D3.sc;// игровых единиц на метр прототипа
 const wk=1.3*S,rn=3.4*S;let st='idle';
 if(sit)st='sit';else if(air)st='jump';else if(T-c.landT<.22)st='land';else if(kick)st='kick';else if(cheer)st='cheer';else if(c.hold)st='draw';else if(c.anim==='run'&&c.run>.3)st='run';
 const tg={};for(const n in A)A[n].paused=true;
 if(st==='idle'){tg.idle=1;A.idle.paused=false}
 if(st==='run'){if(!D3.FT)d3footTab(c);const k=Math.min(1,Math.max(0,(c.run-wk*.8)/(rn-wk*.8))),wi=k>0?0:Math.max(0,1-c.run/(wk*.75));tg.walk=(1-k)*(1-wi);tg.run=k;tg.idle=wi;if(wi>0)A.idle.paused=false;
  /* v6.3: фазовая подгонка — скорость фазы = скорость хода / мгновенная скорость опорной стопы в клипе (таблица), на малой скорости смешиваем покой и шаг */
  const N=D3.FT.n,cy0=((c.ph%1)+1)%1,i=Math.floor(cy0*N)%N,sw=D3.FT.walk[i],sr=D3.FT.run[i],sv=Math.max(.25,((1-k)*sw+k*sr)*(1-wi));c.ph+=dt*c.run/(window.D3LOVR!=null?D3LOVR:sv);const cy=((c.ph%1)+1)%1;A.walk.time=cy*A.walk.getClip().duration;A.run.time=cy*A.run.getClip().duration}
 if(st==='jump'){tg.jump_air=1;d3at('jump_air',Math.min(1.4,Math.max(0,1-(typeof HERO!=='undefined'?HERO.vy:0)/7.6))*.25)}
 if(st==='land'){tg.jump_land=1;d3at('jump_land',(T-c.landT)/.22*.4)}
 if(st==='kick'){tg.kick=1;d3at('kick',(T-c.kickT)/.55*.75)}
 if(st==='cheer'){tg.cheer=1;d3at('cheer',(T-c.cheerT)/1.3*1.5)}
 if(st==='draw'){tg.chalk=1;d3at('chalk',.55+Math.sin(T*3)*.08)}
 if(st==='sit'){tg.jump_crouch=1;d3at('jump_crouch',.12)}
 const L=st==='kick'?30:st==='land'?24:12;for(const n in A){const a=A[n];a.userData.w=dt?d3damp(a.userData.w,tg[n]||0,L,dt):(tg[n]||0);a.setEffectiveWeight(a.userData.w)}D3.MIX.update(0);
 /* v6.3: фиксация опорной стопы — смещаем тело так, чтобы стопа, едущая назад, стояла на месте; смещение мягко возвращается (≤6% скорости) */
 {const o=c.foff||(c.foff={x:0,z:0,p:null});c.body.position.set(0,0,0);c.root.updateMatrixWorld(true);const B=D3.B,fp=[0,1].map(j=>{const b=j?B.footR:B.footL;b.getWorldPosition(_d3a);return [_d3a.x,_d3a.z]});
  const lock=st==='run'&&dt>0&&dt<.1,co=Math.cos(ry),si=Math.sin(ry);
  if(lock&&o.p){const d=[0,1].map(j=>[fp[j][0]+o.x-o.p[j][0],fp[j][1]+o.z-o.p[j][1]]),hx=Math.sin(ry),hz=Math.cos(ry),f=(d[0][0]*hx+d[0][1]*hz)<(d[1][0]*hx+d[1][1]*hz)?0:1;o.x-=d[f][0];o.z-=d[f][1]}
  const n=Math.hypot(o.x,o.z),rl=(lock?.06*Math.max(sp,1):1.2)*dt,mx=.22;if(n>0){const k=Math.max(0,Math.min(n-rl,mx))/n;o.x*=k;o.z*=k}
  if(!lock)o.p=null;else o.p=fp.map(q=>[q[0]+o.x,q[1]+o.z]);
  c.body.position.set(o.x*co-o.z*si,0,o.x*si+o.z*co)}
 // лицо
 let e='smile';if(st==='run')e=c.run>2.2*S?'happy':'smile';if(st==='kick')e='determined';if(st==='jump')e='happy';if(st==='draw')e='focus';if(st==='cheer')e='delight';if(st==='land')e='happy';if(oops)e='sad';
 if(tk&&!cheer)e=(Math.sin(T*13)>0)?'talk':'smile';D3F.emo=e;D3F.blink=c.F.bl>0?Math.round(Math.sin((1-c.F.bl/.16)*Math.PI)*4)/4:0;d3face();
 // капюшон и шнурки — пружины
 {const B=D3.B,tgt=Math.min(1,c.run/rn)*.35+(air?-(HERO.vy||0)*.04:0)+(st==='land'?.25:0),tl=-tgt*1.3,P=c.spr,h=Math.min(dt,.05);P.hv+=(60*(tgt-P.h)-7*P.hv)*h;P.h+=P.hv*h;P.lv+=(90*(tl-P.l)-6*P.lv)*h;P.l+=P.lv*h;
  const sw=Math.sin(c.ph*Math.PI*2)*.15*Math.min(1,c.run/rn);if(B.hood){B.hood.quaternion.copy(B.hood.userData.q0);B.hood.rotateX(P.h)}for(const [b,k] of [[B.laceL,1],[B.laceR,-1]])if(b){b.quaternion.copy(b.userData.q0);b.rotateX(P.l);b.rotateZ(sw*k+.04*Math.sin(T*1.7+k))}}
 // палочка в правом кулаке
 {const B=D3.B;c.root.updateMatrixWorld(true);if(B.handR){B.handR.getWorldPosition(_d3a);B.handR.parent.getWorldPosition(_d3b);_d3d.subVectors(_d3a,_d3b).normalize();const yw=c.vyaw;_d3f.set(Math.sin(yw),0,Math.cos(yw));
  const dr=st==='draw'||st==='cheer';_d3w.copy(_d3d).multiplyScalar(dr?.9:.35).addScaledVector(_d3u,dr?.55:1).addScaledVector(_d3f,dr?.5:.4).normalize();_d3s.lerp(_d3w,.5).normalize();
  D3.wand.position.copy(_d3a).addScaledVector(_d3d,.032*D3.sc).addScaledVector(_d3s,-.01*D3.sc);D3.wand.quaternion.setFromUnitVectors(_d3u,_d3s);D3.wand.visible=c.root.visible&&!!c.root.parent}
  D3.star.rotation.y=Math.sin(T*1.6)*.35}
 c.hop=0;
 // солнце-тень следует за Даней
 const p=c.root.position;SUN.target.position.set(p.x,p.y,p.z);SUN.position.set(p.x+6,p.y+12,p.z-4);D3L.rim.position.set(CAM.position.x*-1+2*p.x,p.y+5,CAM.position.z*-1+2*p.z);D3L.rim.target.position.copy(p)}
