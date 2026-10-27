'use strict';
// ===== Герои: нарисованные 2.5D-персонажи из атласов assets/heroes/*.webp (по refs/lineup.jpg) =====
// все боковые/3-4 кадры в атласах смотрят ВЛЕВО: mir=rt разворачивает вправо
// виды спереди / 3/4 / сбоку / сзади, бег (3 направления × 4 кадра), позы (ура, ой, сидя, колдует, прыжок), моргание, дыхание, взгляд на ребёнка
const HTEX={};
const SPR_READY=Promise.all(Object.keys(HMETA).map(n=>new Promise(res=>{const t=new THREE.TextureLoader().load('assets/heroes/'+n+'.webp',()=>res(),undefined,()=>{console.warn('hero atlas',n);res()});t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;HTEX[n]=t})));
window.SPR_READY=SPR_READY;
const HGEO=new THREE.PlaneGeometry(1,1,1,12);HGEO.translate(0,.5,0);
function heroMat(n){const m=new THREE.MeshBasicMaterial({map:HTEX[n],transparent:true,alphaTest:.04,depthWrite:true,side:THREE.DoubleSide});
 const u={uRect:{value:new THREE.Vector4(0,0,1,1)},uDef:{value:new THREE.Vector4(0,0,0,0)},uNeck:{value:.7},uTilt:{value:0}};m.userData.u=u;
 m.onBeforeCompile=s=>{Object.assign(s.uniforms,u);s.vertexShader='uniform vec4 uRect,uDef;uniform float uNeck,uTilt;\n'+s.vertexShader
  .replace('#include <uv_vertex>','#include <uv_vertex>\n vMapUv=uRect.xy+uv*uRect.zw;')
  .replace('#include <begin_vertex>','vec3 transformed=position;float yy=position.y;float chest=smoothstep(.25,.5,yy)*(1.-smoothstep(.6,.78,yy));\n transformed.x*=1.+uDef.x*chest-uDef.y*.5;transformed.y*=1.+uDef.y;transformed.x+=uDef.z*yy;float hk=max(0.,yy-uNeck);transformed.x+=uTilt*hk;')};
 m.customProgramCacheKey=()=>'hero2';return m}
const HCFG={dania:{h:2.0,sh:1.1,neck:.7,mood:'happy'},krug:{h:1.02,sh:1,neck:2,mood:'happy'},queen:{h:2.6,sh:1.5,neck:.79,mood:'happy'},kriv:{h:2.95,sh:1.8,neck:.62,mood:'angry'}};
function makeHero(n){const cf=HCFG[n];const root=new THREE.Group(),body=new THREE.Group();root.add(body);
 const mat=heroMat(n);mat.userData.u.uNeck.value=cf.neck;const spr=new THREE.Mesh(HGEO,mat);spr.position.z=.14;body.add(spr);
 const F={mood:cf.mood,lx:0,ly:0,bl:0,nb:1+Math.random()*3,step(dt){this.nb-=dt;if(this.nb<0){this.bl=.15;this.nb=2.2+Math.random()*3.4}if(this.bl>0)this.bl-=dt}};
 const ch={n,root,body,spr,mat,F,h:cf.h,anim:'idle',look:null,cheerT:-9,kickT:-9,hold:false,ph:0,vyaw:null,hop:0,sp:0,idleT:0,sq:0,wasAir:false,fr:'',mir:false,tg:{visible:true}};
 ch.update=function(dt,spd){heroUpdate(this,dt,spd||0)};
 CHARS.push(ch);SCENE.add(root);ch.shadow=blobShadow();ch.shadow.scale.setScalar(cf.sh);heroUpdate(ch,0,0);return ch}
function makeDania(){return makeHero('dania')}
function makeKrug(){const c=makeHero('krug');c.mode='follow';return c}
function makeQueen(){return makeHero('queen')}
function makeKriv(){return makeHero('kriv')}
function setFrame(c,name,mir){const A=HMETA[c.n],f=A.f[name]||A.f.st_f;const x=f[0],y=f[1],w=f[2],h=f[3],ax=f[4],hu=f[5];
 c.mat.userData.u.uRect.value.set(x/A.w,1-(y+h)/A.h,w/A.w,h/A.h);const W=w/h*hu;c.spr.scale.set(mir?-W:W,hu,1);c.spr.position.x=(w/2-ax)/w*W*(mir?-1:1);c.fr=name;c.mir=!!mir}
const _hp=new THREE.Vector3();const angW=a=>Math.atan2(Math.sin(a),Math.cos(a));
function heroUpdate(c,dt,sp){c.F.step(dt);c.root.getWorldPosition(_hp);
 const ca=Math.atan2(CAM.position.x-_hp.x,CAM.position.z-_hp.z),ry=c.root.rotation.y;c.body.rotation.y=ca-ry;// плоскость всегда к камере (только вокруг вертикали)
 const cheer=T-c.cheerT<1.6,tk=typeof talking==='function'&&talking(c.n),cut=typeof CUT!=='undefined'&&CUT,sit=c.anim==='sit';
 const oops=(c.n==='dania'||c.n==='krug')&&DANIA&&DANIA.F.mood==='sad';
 let want=ry;
 if(c.n==='dania'){const still=c.anim==='idle'&&!c.hold&&!cut;c.idleT=still?c.idleT+dt:0;if((cheer||oops)&&!sit)want=ca;else if(c.idleT>2.5&&SCN&&SCN.world)want=ca}// заскучал — смотрит на ребёнка
 if(c.n==='krug'&&(cheer||oops)&&!sit&&c.sp<.3)want=ca;
 if(c.vyaw==null||!dt)c.vyaw=want;else c.vyaw+=angW(want-c.vyaw)*Math.min(1,dt*7);
 const rel=angW(c.vyaw-ca),ar=Math.abs(rel)*57.3,rt=Math.sin(rel)>0;// rt: смотрит вправо на экране
 const v=ar<35?'f':ar<70?'q':ar<125?'s':'b';
 let fr=(c.F.bl>0&&v!=='b'?'bl_':'st_')+v,mir=(v==='q'||v==='s')&&rt,yo=0,lean=0,tilt=Math.sin(T*.9+c.h)*.015;
 const br=Math.sin(T*2.2+c.h*3)*.018;
 const air=c.n==='dania'&&c.anim==='air';if(c.wasAir&&!air)c.sq=.13;c.wasAir=air;c.sq=Math.max(0,c.sq-dt*.6);
 if(c.n==='dania'){
  if(sit){fr=ar<100?'sitf':'sitb';mir=ar<100&&ar>20&&rt}
  else if(oops){fr='oops';mir=false;tilt=Math.sin(T*3)*.03}
  else if(cheer){fr='cheer';mir=false;yo=Math.abs(Math.sin((T-c.cheerT)*6))*.22*(1-(T-c.cheerT)/1.6)}
  else if(air){if(ar<55){fr='cheer';mir=false}else if(ar<125){fr='rs1';mir=rt}else{fr='jumpb';mir=false}}
  else if(c.anim==='run'){c.ph+=dt*Math.max(3,sp*(typeof MOVE!=='undefined'?MOVE.runPerM:2.1));const i=Math.floor(c.ph)%4;if(ar<50){fr='rf'+i;mir=false}else if(ar<142){fr='rs'+i;mir=rt}else{fr='rb'+i;mir=false}}
  else if(c.hold&&ar>100){fr='cast';mir=false}
  if(T-c.kickT<.35){const u=(T-c.kickT)/.35;lean=Math.sin(u*Math.PI)*.12*(mir?-1:1);c.sq=Math.max(c.sq,Math.sin(u*Math.PI)*.06)}
  if(tk&&!sit&&c.anim!=='run')tilt=Math.sin(T*5)*.035}
 else if(c.n==='krug'){
  if(sp>.3){c.ph+=dt*Math.max(4,sp*1.9);yo=Math.abs(Math.sin(c.ph))*.2;c.sq=Math.max(c.sq,(Math.abs(Math.sin(c.ph))<.25?.1:0))}
  if(oops&&ar<100){fr='oops';mir=false}
  else if(cheer){fr='joy';mir=false;yo=Math.abs(Math.sin((T-c.cheerT)*7))*.32}
  else if(tk&&ar<100){fr='talk';mir=false;yo=Math.abs(Math.sin(T*6))*.03}
  if(sit)c.sq=.06}
 else if(c.n==='queen'){if(cheer&&ar<110){fr='cheer';mir=false}else if(tk&&ar<100){fr='talk';mir=false;tilt=Math.sin(T*3)*.03}}
 else if(c.n==='kriv'){const md=c.F.mood;if(ar<100){if(md==='happy'){fr='happy';mir=false}else if(md==='sad'){fr='sad';mir=false}else if(tk||cheer){fr='shout';mir=false;yo=Math.abs(Math.sin(T*5))*.05}}
  lean=Math.sin(T*1.5)*.02}
 c.hop=yo;setFrame(c,fr,mir);c.spr.position.y=yo;
 const u=c.mat.userData.u;u.uDef.value.set(br,-c.sq,lean,0);u.uTilt.value=tilt}
