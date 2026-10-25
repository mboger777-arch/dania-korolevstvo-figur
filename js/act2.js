'use strict';
// ===== занятия-2: фигурки-человечки с просьбами (принеси фигуру с N углами) и уголок строителя (домик/башня) =====
ACTS[2].npc={x:9.5,z:8.5,id:'tri',want:3,body:'tri',col:0x3fbf63,ask:'n_tri_ask',ok:'n_tri_ok',items:[[-5,-3,'tri'],[4,-3.2,'square'],[10.5,1.5,'circle']]};
ACTS[4].npc={x:10.5,z:15,id:'circ',want:0,body:'circle',col:0xff5a7a,ask:'n_circ_ask',ok:'n_circ_ok',items:[[6.5,10,'circle'],[5.5,21.5,'hex'],[3,-2.5,'tri']]};
ACTS[3].build=[3.8,-2.2];
const CORN={circle:0,tri:3,square:4,pent:5,hex:6,star:10};
STK.push(['npc_tri','tri','Помог Треуголке'],['npc_circ','circle','Помог Колёсику'],['house','house','Домик'],['tower','tower','Башня']);
const ACT2={npc:null,items:[],carry:null,bst:null,bld:null,nearB:null};
// ---- человечек-фигура ----
function bubbleSprite(want){const c=document.createElement('canvas');c.width=256;c.height=200;const q=c.getContext('2d');
 q.fillStyle='#fffaf0';q.strokeStyle='#6a4bb8';q.lineWidth=8;q.beginPath();q.roundRect(10,10,236,140,40);q.fill();q.stroke();q.beginPath();q.moveTo(110,148);q.lineTo(128,190);q.lineTo(146,148);q.fill();
 q.fillStyle='#2a1050';q.font='bold 64px '+NUM;q.textAlign='center';q.textBaseline='middle';q.fillText(String(want),70,80);
 // значок «угол»
 q.strokeStyle='#ff5a7a';q.lineWidth=12;q.lineCap=q.lineJoin='round';q.beginPath();q.moveTo(130,115);q.lineTo(160,45);q.lineTo(215,115);q.stroke();
 q.fillStyle='#ffd23a';q.beginPath();q.arc(160,45,11,0,7);q.fill();
 if(!want){q.strokeStyle='#e03030';q.lineWidth=10;q.beginPath();q.moveTo(125,35);q.lineTo(222,125);q.stroke()}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:true}));s.scale.set(1.5,1.17,1);return s}
function npcMesh(C){const g=new THREE.Group();g.position.set(C.x,groundAt(C.x,C.z),C.z);const body=new THREE.Group();body.position.y=1.25;g.add(body);
 const mt=M(C.col,{em:C.col,ei:.25});let b;
 if(C.body==='tri'){b=mesh(new THREE.CylinderGeometry(.75,.75,.32,3),mt,0,0,0,body);b.rotation.x=Math.PI/2;b.rotation.y=Math.PI/2;b.position.y=.08}
 else{b=mesh(new THREE.CylinderGeometry(.62,.62,.32,40),mt,0,0,0,body);b.rotation.x=Math.PI/2}
 const ey=C.body==='tri'?.05:.12;for(const s of [-1,1]){mesh(GEO.sphL,0xffffff,s*.17,ey,.17,body,.13);mesh(GEO.sphL,0x1a1030,s*.17,ey,.26,body,.06)}
 const sm=mesh(new THREE.TorusGeometry(.11,.025,6,16,Math.PI),M(0x5a1030),0,ey-.17,.17,body);sm.rotation.z=Math.PI;
 for(const s of [-1,1]){const l=mesh(GEO.cylL,0x5a3a7a,s*.2,.45,0,g,[.07,.9,.07]);mesh(GEO.sphL,0x5a3a7a,s*.22,.05,.07,g,[.14,.08,.2]);
  const a=mesh(GEO.cylL,0x5a3a7a,s*.62,1.15,0,g,[.05,.6,.05]);a.rotation.z=s*.9}
 const bub=bubbleSprite(C.want);bub.position.set(0,2.75,0);g.add(bub);WORLD.add(g);return{g,body,bub}}
// ---- уголок строителя (3D) ----
function buildMesh(x,z){const g=new THREE.Group();g.position.set(x,groundAt(x,z),z);mesh(GEO.cyl,0xc89858,0,.1,0,g,[1.4,.2,1.4]);
 mesh(GEO.box,0x3d8fe8,-.45,.45,.1,g,.5);const r=mesh(new THREE.ConeGeometry(.42,.4,4),M(0x3fbf63),-.45,.9,.1,g);r.rotation.y=Math.PI/4;
 mesh(GEO.box,0x3d8fe8,.5,.4,-.2,g,.4);mesh(GEO.box,0x3d8fe8,.5,.8,-.2,g,.4);mesh(GEO.sph,0xff5a7a,.2,.4,.6,g,.25);
 const lb=label3D('Стройка','#fff',.5,{p:g,st:'#2a1050'});lb.position.set(0,2,0);g.userData.lb=lb;WORLD.add(g);return g}
function act2Setup(i){ACT2.npc=null;ACT2.items=[];ACT2.carry=null;ACT2.bst=null;ACT2.bld=null;ACT2.nearB=null;const C=ACTS[i];if(!C||!ACT.on)return;
 const sh=(x,z)=>{let ok=!nogo(x,z);for(const b of BLOCKS)if(b.on&&inBlock(b,x,z,.3))ok=false;for(const c of CYLS)if(c.on&&Math.hypot(x-c.x,z-c.z)<c.r+.3)ok=false;if(!ok)console.warn('act blocked',i,x,z);return ok};
 if(C.npc){const N=C.npc;sh(N.x,N.z);const m=npcMesh(N);ACT2.npc={...N,...m,asked:false,done:false,jumpT:-9,badT:-9};
  for(const [x,z,k] of N.items){sh(x,z);const g=gemMesh(k);g.scale.setScalar(1.7);const y=baseAt(x,z)+.75;g.position.set(x,y,z);const s=gemShadow(x,baseAt(x,z),z,GEMCOL[k]);s.scale.setScalar(1.4);ACT2.items.push({kind:k,hx:x,hz:z,x,z,y,g,s,away:true,given:false})}}
 if(C.build){const [x,z]=C.build;sh(x,z);cylBlock(x,z,1.1,.4);ACT2.bst={x,z,g:buildMesh(x,z),made:{}}}
 TICK.push(act2Tick)}
function dropItem(it,x,z){it.x=x;it.z=z;it.y=baseAt(x,z)+.75;it.g.position.set(x,it.y,z);it.s.visible=true;it.s.position.set(x,baseAt(x,z)+.04,z);it.away=false}
function act2Tick(dt){if(!ACT.on||scene!=='ch')return;const walk=HERO.mode==='walk'&&!HERO.lock&&!CUT;const N=ACT2.npc;
 if(ACT2.bst&&ACT2.bst.g&&ACT2.bst.g.userData.lb){const B=ACT2.bst.g;B.userData.lb.visible=Math.hypot(CAM.position.x-B.position.x,CAM.position.z-B.position.z)>5.5}
 if(N){const dn=Math.hypot(HERO.x-N.x,HERO.z-N.z);{const a=Math.atan2(CAM.position.x-N.x,CAM.position.z-N.z);N.g.rotation.y+=Math.atan2(Math.sin(a-N.g.rotation.y),Math.cos(a-N.g.rotation.y))*Math.min(1,dt*4)}
  const jt=T-N.jumpT;N.body.position.y=1.25+Math.sin(T*3)*.04+(jt<1.2?Math.abs(Math.sin(jt*8))*.5*(1-jt/1.2):0);N.body.rotation.z=T-N.badT<.8?Math.sin((T-N.badT)*20)*.15:0;
  N.bub.visible=!N.done;N.bub.position.y=2.75+Math.sin(T*2)*.06;
  if(!N.asked&&walk&&dn<4.5){N.asked=true;ACT.pend.push(N.ask);aHint('move');alog('npc','ask')}
  for(const it of ACT2.items){if(it===ACT2.carry){it.g.position.set(HERO.x,HERO.y+2.35+Math.sin(T*6)*.05,HERO.z);it.g.rotation.y+=dt*2;continue}
   if(it.given){it.g.rotation.y+=dt;continue}
   it.g.rotation.y+=dt*.8;it.g.position.y=it.y+Math.sin(T*2+it.hx)*.08;const d=Math.hypot(HERO.x-it.x,HERO.z-it.z);if(d>1.6)it.away=true;
   if(walk&&it.away&&d<1.0&&!N.done){const old=ACT2.carry;ACT2.carry=it;it.s.visible=false;SFX.pop();alog('carry',it.kind);aIntro('carry','n_carry');if(old)dropItem(old,it.x,it.z)}}
  const c=ACT2.carry;if(c&&walk&&dn<1.9&&!N.done){
   if(CORN[c.kind]===N.want){N.done=true;c.given=true;ACT2.carry=null;c.g.position.set(N.x,baseAt(N.x,N.z)+2.1,N.z);c.g.scale.setScalar(1.2);N.jumpT=T;SFX.ok();burst(V3(N.x,2,N.z),N.col,40,5);if(DANIA)DANIA.cheerT=T;alog('npc','ok');sticker('npc_'+N.id);ACT.pend.unshift(N.ok)}
   else if(T-N.badT>2){N.badT=T;SFX.bad();ACT2.carry=null;dropItem(c,c.hx,c.hz);c.away=true;alog('npc','bad');if(!ACT.pend.includes('n_bad'))ACT.pend.push('n_bad')}}}
 const B=ACT2.bst;if(B){const d=Math.hypot(HERO.x-B.x,HERO.z-B.z);ACT2.nearB=(!ACT2.bld&&walk&&d<2.4)?B:null;if(ACT2.bld&&(CUT||scene!=='ch'))bldClose()}}
// ---- 2D-стройка с простой физикой ----
function bldOpen(){ACT2.bld={P:[],t0:T,touched:false,ptr:null,said:{}};INPMODE='ui';HERO.lock=true;HERO.vx=HERO.vz=0;JOY=null;RT=null;alog('build','open');if(!SV.seen.build){SV.seen.build=1;save();ACT.pend.unshift('b_intro')}}
function bldClose(){if(!ACT2.bld)return;ACT2.bld=null;if(!CUT){INPMODE='play';HERO.lock=false}alog('build','close')}
function bGeo(){const b=chalkBoard();const U=Math.min(84,b.h/5.2);return{b,U,G:b.y+b.h-22,L:b.x+150,R:b.x+b.w-16,tray:[['square',b.x+72,b.y+90],['tri',b.x+72,b.y+90+U*1.35],['circle',b.x+72,b.y+90+U*2.7]]}}
function bPiece(k,x,y){const {U}=bGeo();const w=k==='tri'?U*1.2:k==='circle'?U*.9:U,h=k==='tri'?U*.9:k==='circle'?U*.9:U;return{k,x,y,w,h,st:'fall',vx:0,vy:0,sup:null,ign:null,rot:0}}
function bAdd(p){const D=ACT2.bld;D.P.push(p);if(D.P.length>12){const j=D.P.findIndex(q=>q.st==='rest'&&!D.P.some(r=>r.sup===q));if(j>=0)D.P.splice(j,1)}}
function bOver(p,q){return Math.abs(p.x-q.x)<(p.w+q.w)/2-6}
function bEvent(r){const D=ACT2.bld;alog('build',r);SFX.bump();if(!D.said[r]){D.said[r]=1;asay(r==='roll'?'b_roll':r==='tip'?'b_tip':'b_edge')}}
function bldStep(dt){const D=ACT2.bld;if(!D)return;const g=bGeo();dt=Math.min(dt,.04);
 const P=D.P.slice().sort((a,b)=>b.y-a.y);
 for(const p of P){if(p.st==='drag')continue;
  if(p.st==='rest'){if(p.sup!=='g'&&(!D.P.includes(p.sup)||p.sup.st!=='rest'||Math.abs((p.sup.y-p.sup.h/2)-(p.y+p.h/2))>3||!bOver(p,p.sup))){p.st='fall';p.vy=0}else continue}
  if(p.ign&&D.P.includes(p.ign)&&p.ign.st==='rest'&&bOver(p,p.ign)){p.x+=p.vx*dt;p.y=p.ign.y-p.ign.h/2-p.h/2;p.vy=0;p.rot+=(p.k==='circle'?p.vx/(p.w/2):Math.sign(p.vx)*2)*dt;if(p.k!=='circle')p.rot=Math.max(-.6,Math.min(.6,p.rot));continue}
  if(p.ign&&!bOver(p,p.ign))p.ign=null;p.vy+=2200*dt;p.x+=p.vx*dt;if(p.k==='circle')p.rot+=p.vx/(p.w/2)*dt;
  if(p.x<g.L+p.w/2){p.x=g.L+p.w/2;p.vx=Math.abs(p.vx)*.4}if(p.x>g.R-p.w/2){p.x=g.R-p.w/2;p.vx=-Math.abs(p.vx)*.4}
  const bot0=p.y+p.h/2;let s=g.G,q0='g';for(const q of D.P){if(q===p||q===p.ign||q.st!=='rest'||!bOver(p,q))continue;const tp=q.y-q.h/2;if(tp>=bot0-2&&tp<s){s=tp;q0=q}}
  p.y+=p.vy*dt;if(p.y+p.h/2<s)continue;
  p.y=s-p.h/2;p.vy=0;
  if(q0==='g'){p.st='rest';p.sup='g';if(p.k!=='circle')p.rot=0;if(Math.abs(p.vx)>20&&p.k==='circle'){p.vx*=.5;p.st='fall';p.y-=.5;continue}p.vx=0;SFX.step();continue}
  const dx=p.x-q0.x;const bad=q0.k!=='square'?'tip':p.k==='circle'?'roll':Math.abs(dx)>q0.w/2?'edge':null;
  if(bad){p.ign=q0;p.vx=(Math.sign(dx)||(Math.random()<.5?-1:1))*(p.k==='circle'?380:260);bEvent(bad);continue}
  p.st='rest';p.sup=q0;p.vx=0;p.rot=0;SFX.step();bldGoals()}}
function bLevel(s){return s.sup==='g'?1:(s.sup&&s.sup.k==='square')?bLevel(s.sup)+1:0}
function bldGoals(){const D=ACT2.bld,B=ACT2.bst;if(!D||!B)return;
 const house=D.P.some(t=>t.k==='tri'&&t.st==='rest'&&t.sup&&t.sup.k==='square'&&t.sup.st==='rest');
 const tower=D.P.some(s=>s.k==='square'&&s.st==='rest'&&bLevel(s)>=3);
 if(house&&!B.made.house){B.made.house=1;alog('build','house');SFX.ok();if(DANIA)DANIA.cheerT=T;sticker('house');ACT.pend.unshift('b_house');spawnBuilt('house')}
 if(tower&&!B.made.tower){B.made.tower=1;alog('build','tower');SFX.ok();if(DANIA)DANIA.cheerT=T;sticker('tower');ACT.pend.unshift('b_tower');spawnBuilt('tower')}}
function spawnBuilt(k){const B=ACT2.bst;const x=B.x+(k==='house'?2:-2),z=B.z+.8,y=baseAt(x,z);
 if(k==='house'){mesh(GEO.box,0x3d8fe8,x,y+.6,z,null,1.2);const r=mesh(new THREE.ConeGeometry(1.05,.9,4),M(0x3fbf63),x,y+1.65,z);r.rotation.y=Math.PI/4;mesh(GEO.box,0xffe9a0,x,y+.45,z+.61,null,[.35,.6,.02])}
 else for(let j=0;j<3;j++)mesh(GEO.box,0x3d8fe8,x,y+.45+j*.9,z,null,.88);
 burst(V3(x,y+1.5,z),0xffe066,40,5)}
function bPick(x,y){const D=ACT2.bld;for(let j=D.P.length-1;j>=0;j--){const p=D.P[j];if(p.st==='drag')continue;if(Math.abs(x-p.x)<p.w/2+6&&Math.abs(y-p.y)<p.h/2+6&&!D.P.some(r=>r.sup===p&&r.st==='rest'))return p}return null}
{const d0=ACTPTR.down,m0=ACTPTR.move,u0=ACTPTR.up;
 ACTPTR.down=function(x,y,id){const D=ACT2.bld;if(!D)return d0(x,y,id);const g=bGeo();let p=null;
  for(const [k,tx,ty] of g.tray)if(Math.hypot(x-tx,y-ty)<g.U*.65){p=bPiece(k,x,y);bAdd(p);break}
  if(!p)p=bPick(x,y);if(p){p.st='drag';p.ign=null;p.vx=p.vy=0;p.rot=0;D.ptr=id;D.drag=p;D.touched=true;SFX.click();INP.last=T}return true};
 ACTPTR.move=function(x,y,id){const D=ACT2.bld;if(!D)return m0(x,y,id);if(D.drag&&D.ptr===id){const g=bGeo();D.drag.x=Math.max(g.L+D.drag.w/2,Math.min(g.R-D.drag.w/2,x));D.drag.y=Math.min(g.G-D.drag.h/2,Math.max(g.b.y+D.drag.h/2,y));INP.last=T}};
 ACTPTR.up=function(id){const D=ACT2.bld;if(!D)return u0(id);if(D.drag&&D.ptr===id){D.drag.st='fall';D.drag.vy=0;D.drag=null;D.ptr=null}}}
function bFreeXf(){const g=bGeo(),D=ACT2.bld;for(const f of [.85,.15,.7,.3,.95,.05]){const x=g.L+(g.R-g.L)*f;if(x-g.U/2<g.L||x+g.U/2>g.R)continue;if(!D.P.some(q=>Math.abs(q.x-x)<(q.w+g.U)/2+4))return f}let bf=.85,bd=-1;for(let f=.1;f<=.9;f+=.05){const x=g.L+(g.R-g.L)*f;if(x-g.U/2<g.L||x+g.U/2>g.R)continue;const d=Math.min(...D.P.map(q=>Math.abs(q.x-x)),1e9);if(d>bd){bd=d;bf=f}}return bf}
function bDrop(k,xf){const g=bGeo();const p=bPiece(k,g.L+(g.R-g.L)*xf,g.b.y+g.U);bAdd(p);ACT2.bld.touched=true;return p}
function drawPiece(p,ghost){X.save();X.translate(p.x,p.y);X.rotate(p.rot||0);X.globalAlpha=ghost?.5:1;X.beginPath();
 if(p.k==='square')X.rect(-p.w/2,-p.h/2,p.w,p.h);else if(p.k==='tri'){X.moveTo(0,-p.h/2);X.lineTo(p.w/2,p.h/2);X.lineTo(-p.w/2,p.h/2);X.closePath()}else X.arc(0,0,p.w/2,0,7);
 X.fillStyle=GEMCSS[p.k];X.fill();X.lineWidth=5;X.strokeStyle='#2a1050';X.stroke();
 if(p.k==='circle'){X.beginPath();X.moveTo(-p.w*.3,0);X.lineTo(p.w*.3,0);X.strokeStyle='rgba(255,255,255,.6)';X.lineWidth=4;X.stroke()}X.restore()}
function drawBuild(){const D=ACT2.bld;if(!D)return;bldStep(DT);const v=vis();X.fillStyle='rgba(20,10,50,.45)';X.fillRect(v.x0,v.y0,v.w,v.h);const g=bGeo(),b=g.b;
 X.save();X.shadowColor='rgba(0,0,0,.4)';X.shadowBlur=16;X.fillStyle='#b07a3a';rr(b.x-16,b.y-16,b.w+32,b.h+32,26);X.fill();X.restore();
 const gr=X.createLinearGradient(0,b.y,0,b.y+b.h);gr.addColorStop(0,'#bfe6ff');gr.addColorStop(1,'#eaf7ff');X.fillStyle=gr;rr(b.x,b.y,b.w,b.h,14);X.fill();
 X.fillStyle='#7cc860';X.fillRect(b.x+130,g.G,b.w-130,b.y+b.h-g.G);X.fillStyle='#f3e2c0';X.fillRect(b.x,b.y,130,b.h);
 txt('Построй домик или башню',b.x+b.w/2+60,b.y+36,36,'#2a1050',{f:FONT,st:'#ffffff',lw:6,id:'bldT',box:[b.x+130,b.y,b.x+b.w,b.y+80]});
 for(const [k,tx,ty] of g.tray)drawPiece({k,x:tx,y:ty,w:k==='tri'?g.U*1.2:k==='circle'?g.U*.9:g.U,h:k==='square'?g.U:g.U*.9,rot:0});
 for(const p of D.P)if(p.st!=='drag')drawPiece(p);for(const p of D.P)if(p.st==='drag')drawPiece(p);
 if(!D.touched){const u=((T-D.t0)%3)/2.4;if(u<1){const k=ease(Math.min(1,u*1.3));const [_,tx,ty]=g.tray[0];const ex=g.L+(g.R-g.L)*.45,ey=g.G-g.U/2;const x=tx+(ex-tx)*k,y=ty+(ey-ty)*k;drawPiece({k:'square',x,y,w:g.U,h:g.U,rot:0},true);drawHandShape(x-8,y-4,true)}}
 const B=ACT2.bst;if(B){if(B.made.house)drawSticker('house',b.x+b.w-60,b.y+60,30,true);if(B.made.tower)drawSticker('tower',b.x+b.w-130,b.y+60,30,true)}
 labelBtn('bldX',b.x+b.w-90,b.y+b.h+2,190,72,'Готово',()=>bldClose(),{size:38})}
{const _ds=drawSticker;drawSticker=function(id,x,y,r,own){const s=STK.find(s=>s[0]===id);if(!s||(s[1]!=='house'&&s[1]!=='tower'))return _ds(id,x,y,r,own);
 X.save();X.translate(x,y);X.beginPath();X.arc(0,0,r,0,7);X.fillStyle=own?'#fff6d8':'rgba(120,110,150,.25)';X.fill();X.lineWidth=r*.09;X.strokeStyle=own?'#ffb52e':'rgba(120,110,150,.5)';X.setLineDash(own?[]:[8,8]);X.stroke();X.setLineDash([]);
 const c1=own?'#3d8fe8':'rgba(120,110,150,.35)',c2=own?'#3fbf63':'rgba(120,110,150,.35)';X.lineWidth=r*.06;X.strokeStyle=own?'#2a1050':'rgba(0,0,0,0)';
 if(s[1]==='house'){X.fillStyle=c1;X.fillRect(-r*.35,-r*.05,r*.7,r*.5);X.strokeRect(-r*.35,-r*.05,r*.7,r*.5);X.fillStyle=c2;X.beginPath();X.moveTo(-r*.48,-r*.05);X.lineTo(0,-r*.5);X.lineTo(r*.48,-r*.05);X.closePath();X.fill();X.stroke()}
 else for(let j=0;j<3;j++){X.fillStyle=c1;X.fillRect(-r*.18,r*.4-(j+1)*r*.3,r*.36,r*.3);X.strokeRect(-r*.18,r*.4-(j+1)*r*.3,r*.36,r*.3)}
 X.restore()}}
{const _s=actSetup;actSetup=function(i){_s(i);act2Setup(i)}}
{const _d=actDraw;actDraw=function(){if(ACT.on){drawBuild();
  if(ACT2.nearB&&!ACT2.bld&&!ACT.draw&&INPMODE==='play'){labelBtn('bldgo',640,safeB()-70,250,76,'🧱 Строить',()=>{if(ACT2.nearB)bldOpen()},{size:34,pulse:true});if(!SV.seen.bldbtn){SV.seen.bldbtn=1;save();aHint('tap')}}}
 _d()}}
// ---- автопилот ----
async function act2Tour(){if(!ACT.on||HERO.mode!=='walk'||HERO.lock||CUT)return;const sx=HERO.x,sz=HERO.z;const TR=[[sx,sz]];let any=false;
 const N=ACT2.npc;if(N&&!N.done&&!ACT.tour.has(N)&&actReach(N.x,N.z-1.6)){ACT.tour.add(N);any=true;alog('tour','npc');await bGo(N.x,N.z-2,.6,8);TR.push([HERO.x,HERO.z]);await bWait(.5);
  const good=ACT2.items.find(it=>CORN[it.kind]===N.want),bad=ACT2.items.find(it=>CORN[it.kind]!==N.want);
  for(const it of [bad,good]){if(!it||!actReach(it.hx,it.hz))continue;await bGo(it.hx,it.hz,.5,16);TR.push([HERO.x,HERO.z]);if(actReach(N.x,N.z))await bGo(N.x,N.z-1.4,.6,16);await bWait(1)}
  for(let j=TR.length-2;j>=1;j--){if(actReachFrom(HERO.x,HERO.z,sx,sz))break;await bGo(TR[j][0],TR[j][1],.8,10)}}
 const B=ACT2.bst;if(B&&!ACT.tour.has(B)&&actReach(B.x,B.z-2)){ACT.tour.add(B);any=true;alog('tour','build');await bGo(B.x,B.z-2,.5,8);await bSoft(()=>ACT2.nearB,4);if(ACT2.nearB)bldOpen();
  if(ACT2.bld){await bWait(1.5);const seq=[['square',-1],['square',-1],['square',-1],['square',.4],['circle',.4],['tri',.4],['circle',.1]];let tx=null;
   for(const [k,xf] of seq){if(xf<0){if(tx===null)tx=bFreeXf();bDrop(k,tx)}else bDrop(k,xf);await bWait(1.3)}await bSoft(()=>actFree(),15);bldClose()}}
 if(any){await bSoft(()=>actFree(),15);await bGo(sx,sz,.8,10)}}
{const _t=actTour;actTour=async function(){await _t();await act2Tour()}}
