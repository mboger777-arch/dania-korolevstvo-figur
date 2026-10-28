// ===== Раунд 6: богатое оформление глав (кузница углов и др.) =====
TEX.ftile=cvTex(256,256,(x,w,h)=>{const C=['#d9a070','#cf9264','#e0ad7c','#c98a5a','#dba878'];for(let r=0;r<4;r++)for(let c=0;c<4;c++){x.fillStyle=C[(r*7+c*3)%5];x.fillRect(c*64,r*64,64,64);
  const g=x.createLinearGradient(c*64,r*64,c*64+64,r*64+64);g.addColorStop(0,'rgba(255,240,210,.25)');g.addColorStop(1,'rgba(90,40,20,.18)');x.fillStyle=g;x.fillRect(c*64,r*64,64,64);
  for(let i=0;i<30;i++){x.fillStyle=`rgba(${100+Math.random()*60},${60+Math.random()*40},30,.12)`;x.beginPath();x.arc(c*64+Math.random()*64,r*64+Math.random()*64,1+Math.random()*3,0,7);x.fill()}}
 x.strokeStyle='#7a4a2a';x.lineWidth=4;for(let i=0;i<=4;i++){x.beginPath();x.moveTo(i*64,0);x.lineTo(i*64,h);x.stroke();x.beginPath();x.moveTo(0,i*64);x.lineTo(w,i*64);x.stroke()}
 x.strokeStyle='rgba(255,230,190,.35)';x.lineWidth=1.5;for(let i=0;i<4;i++)for(let j=0;j<4;j++){x.strokeRect(i*64+4,j*64+4,56,56)}},70);
TEX.carpet=cvTex(128,256,(x,w,h)=>{x.fillStyle='#b8283a';x.fillRect(0,0,w,h);x.fillStyle='#e8b040';x.fillRect(0,0,14,h);x.fillRect(w-14,0,14,h);x.fillStyle='#7a1424';x.fillRect(14,0,6,h);x.fillRect(w-20,0,6,h);
 for(let y=16;y<h;y+=64){x.fillStyle='#ffd25a';x.beginPath();x.moveTo(w/2,y);x.lineTo(w/2+22,y+22);x.lineTo(w/2,y+44);x.lineTo(w/2-22,y+22);x.closePath();x.fill();x.fillStyle='#b8283a';x.beginPath();x.arc(w/2,y+22,8,0,7);x.fill()}});
TEX.carpet.wrapT=THREE.RepeatWrapping;TEX.carpet.repeat.set(1,12);
TEX.brick=cvTex(128,128,(x,w,h)=>{x.fillStyle='#5a3a2e';x.fillRect(0,0,w,h);for(let r=0;r<8;r++)for(let c=-1;c<4;c++){const bx=c*32+(r%2)*16,by=r*16;x.fillStyle=['#9a5a3a','#8a4a32','#a8683e','#7a4430'][(r+c+8)%4];x.fillRect(bx+1.5,by+1.5,29,13)}},0);
TEX.brick.wrapS=TEX.brick.wrapT=THREE.RepeatWrapping;
const DEC={};
function dm(g,c,x,y,z,p,s,o){const m=mesh(g,typeof c==='number'?M(c,o):c,x,y,z,p,s);m.userData.decor=1;return m}
function dGroup(x,z,ang){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=ang||0;WORLD.add(g);return g}
// печь с аркой, огнём и трубой с дымом
function furnace(x,z,ang){const g=dGroup(x,z,ang);const bm=new THREE.MeshLambertMaterial({map:TEX.brick,color:0xffffff});
 const body=mesh(GEO.box,bm,0,1.6,0,g,[3.2,3.2,2.6]);mesh(GEO.box,0x6a4636,0,3.3,0,g,[3.5,.25,2.9]);
 const ch=mesh(GEO.cylL,bm,.8,5.2,.2,g,[.45,4,.45]);mesh(GEO.cylL,0x4a3026,.8,7.25,.2,g,[.58,.3,.58]);
 const fire=mesh(GEO.box,M(0xff8020,{em:0xff5000,ei:1.6}),0,1.05,1.31,g,[1.5,1.4,.05]);mesh(GEO.cyl,M(0xff8020,{em:0xff5000,ei:1.6}),0,1.75,1.31,g,[.75,.05,.75]).rotation.x=Math.PI/2;
 mesh(GEO.box,0x3a2620,0,.2,1.45,g,[2.2,.4,.4]);for(const s of[-1,1])mesh(GEO.box,0xe8b040,s*.95,1.3,1.33,g,[.12,1.9,.08]);
 const glow=mesh(GEO.sph,M(0xffa040,{basic:1,op:.35}),0,1.2,1.7,g,[1.3,1,.4]);
 const puffs=[];for(let i=0;i<4;i++){const p=mesh(GEO.sphL,M(0xd8d0c8,{op:.55}),.8,7.4,.2,g,.4);p.userData.decor=1;puffs.push(p)}
 let t=Math.random()*5;TICK.push(dt=>{t+=dt;const f=1+Math.sin(t*9)*.08+Math.sin(t*23)*.05;fire.scale.y=1.4*f;glow.material.opacity=.28+.12*Math.sin(t*7);
  puffs.forEach((p,i)=>{const u=(t*.35+i/4)%1;p.position.set(.8+Math.sin(u*5+i)*.3,7.4+u*3.2,.2);p.scale.setScalar(.35+u*.9);p.material.opacity=.5*(1-u)})});
 return g}
// наковальня + молот + искры
function anvil(x,z,ang){const g=dGroup(x,z,ang);const st=0x4a4e5a;mesh(GEO.cylL,0x7a5030,0,.4,0,g,[.55,.8,.55]);mesh(GEO.box,st,0,.9,0,g,[.7,.25,.45]);mesh(GEO.box,st,0,1.12,0,g,[1.1,.22,.5]);
 const hn=mesh(GEO.cone,st,.8,1.12,0,g,[.2,.6,.2]);hn.rotation.z=-Math.PI/2;
 const hm=new THREE.Group();hm.position.set(-.2,1.25,0);g.add(hm);mesh(GEO.cylL,0x8a5a2a,0,.45,0,hm,[.06,.9,.06]);mesh(GEO.box,0x5a5e6a,0,.92,0,hm,[.42,.2,.2]);hm.rotation.z=.5;
 mesh(GEO.box,0x5a5e6a,-.2,1.24,.1,g,[.3,.04,.12]).material=M(0xff7020,{em:0xff4000,ei:1.3});
 const N=26,pos=new Float32Array(N*3),vel=[];for(let i=0;i<N;i++)vel.push([0,0,0,99]);const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
 const sp=new THREE.Points(geo,new THREE.PointsMaterial({color:0xffc040,size:.09,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));sp.userData.decor=1;sp.frustumCulled=false;g.add(sp);
 let t=Math.random()*3,hit=0;TICK.push(dt=>{t+=dt;const ph=(t%1.6)/1.6;hm.rotation.z=ph<.75?.5+ph*1.3:1.5-(ph-.75)*4;if(ph>=.95&&!hit){hit=1;for(let i=0;i<N;i++){const v=vel[i];v[0]=(Math.random()-.5)*3;v[1]=1.5+Math.random()*2.5;v[2]=(Math.random()-.5)*3;v[3]=0;pos[i*3]=-.2;pos[i*3+1]=1.28;pos[i*3+2]=.1}}if(ph<.9)hit=0;
  for(let i=0;i<N;i++){const v=vel[i];v[3]+=dt;if(v[3]>1){pos[i*3+1]=-9;continue}v[1]-=6*dt;pos[i*3]+=v[0]*dt;pos[i*3+1]+=v[1]*dt;pos[i*3+2]+=v[2]*dt}geo.attributes.position.needsUpdate=true});return g}
// знамя на шесте
const BANC=[[0xd83a4a,'circle'],[0x3a6ad8,'tri'],[0x3aa860,'square'],[0x8a4ad0,'pent'],[0xf0a020,'hex']];
function banner(x,z,ci,ang,h){h=h||3.6;const g=dGroup(x,z,ang);dm(GEO.cylL,0x6a4a2a,0,h/2,0,g,[.07,h,.07]);dm(GEO.sph,0xe8b040,0,h+.08,0,g,.13);dm(GEO.cylL,0xe8b040,0,h-.15,0,g,[.04,1.1,.04]).rotation.z=Math.PI/2;
 const [c,sh]=BANC[ci%BANC.length];const fl=new THREE.Group();fl.position.set(0,h-.2,0);g.add(fl);dm(GEO.box,c,0,-.75,.02,fl,[1,1.5,.04]);dm(GEO.box,0xe8b040,0,-.03,.02,fl,[1.04,.08,.06]);
 const tip=new THREE.Mesh(GEO.tri,M(c));tip.scale.set(.58,.04,.58);tip.rotation.x=Math.PI/2;tip.rotation.y=Math.PI/2;tip.position.set(0,-1.6,.02);fl.add(tip);
 const em=sh==='circle'?GEO.cyl:sh==='tri'?GEO.tri:sh==='square'?GEO.box:sh==='pent'?GEO.pent:GEO.hex;const e=dm(em,M(0xffe08a,{em:0x806010,ei:.4}),0,-.7,.06,fl,sh==='square'?[.4,.4,.04]:[.25,.04,.25]);if(sh!=='square')e.rotation.x=Math.PI/2;
 let t=Math.random()*6;TICK.push(dt=>{t+=dt;fl.rotation.x=Math.sin(t*1.7)*.06;fl.rotation.z=Math.sin(t*1.3)*.04});return g}
// фонарь
function lamp(x,z,c){const g=dGroup(x,z);dm(GEO.cylL,0x3a3a48,0,1.2,0,g,[.07,2.4,.07]);dm(GEO.cylL,0x3a3a48,0,.05,0,g,[.2,.1,.2]);dm(GEO.box,0x3a3a48,0,2.45,0,g,[.36,.06,.36]);
 dm(GEO.box,M(c||0xffd27a,{em:c||0xffb040,ei:1.2}),0,2.66,0,g,[.28,.36,.28]);dm(GEO.cone,0x3a3a48,0,3.0,0,g,[.28,.3,.28]);return g}
// бочки, мешки, угли, стойка молотов
function barrel(x,z,s){const g=dGroup(x,z);s=s||1;dm(GEO.cylL,0x9a6a3a,0,.5*s,0,g,[.42*s,1*s,.42*s]);for(const y of[.18,.82])dm(GEO.cylL,0x4a4a52,0,y*s,0,g,[.44*s,.06*s,.44*s]);return g}
function coal(x,z){const g=dGroup(x,z);for(let i=0;i<9;i++)dm(GEO.sphL,i%3?0x2a2428:M(0xff6020,{em:0xff3000,ei:.8}),rnd(-.5,.5),.12,rnd(-.4,.4),g,rnd(.12,.25));return g}
function hammerRack(x,z,ang){const g=dGroup(x,z,ang);for(const s of[-1,1])dm(GEO.box,0x7a5030,s*.9,.8,0,g,[.12,1.6,.12]);dm(GEO.box,0x7a5030,0,1.5,0,g,[2,.1,.12]);
 for(let i=0;i<4;i++){const hx=-.6+i*.4;dm(GEO.cylL,0x9a6a3a,hx,1,.1,g,[.035,1,.035]);dm(GEO.box,i%2?0x6a6e7a:0x8a8e9a,hx,.45,.1,g,[.26,.14,.14])}return g}
// книжные ворота с золотыми уголками
function bookGate(x,z,w,h,c){const g=dGroup(x,z);dm(GEO.box,c,0,h/2,0,g,[w,h,.5]);dm(GEO.box,0xfff3d6,0,h/2,.05,g,[w-.25,h-.25,.48]);dm(GEO.box,c,0,h/2,.3,g,[w,h,.08]);
 for(const sx of[-1,1])for(const sy of[0,1]){const k=dm(GEO.tri,M(0xffd040,{em:0x806000,ei:.35}),sx*(w/2-.25),sy?h-.25:.25,.36,g,[.42,.06,.42]);k.rotation.x=Math.PI/2;k.rotation.y=sx*sy?Math.PI/6:-Math.PI/6}
 dm(GEO.box,0xffd040,0,h/2,.35,g,[.12,h*.9,.04]);dm(GEO.cyl,M(0xffd040,{em:0x806000,ei:.35}),0,h/2,.36,g,[.4,.05,.4]).rotation.x=Math.PI/2;return g}
function forgeDecor(){const gp=WORLD.children.find(o=>o.isMesh&&o.geometry.type==='PlaneGeometry'&&o.material.map===TEX.stone);if(gp){gp.material=new THREE.MeshLambertMaterial({map:TEX.ftile,color:0xffffff})}
 const cp=new THREE.Mesh(new THREE.PlaneGeometry(3,54),new THREE.MeshLambertMaterial({map:TEX.carpet,transparent:false}));cp.rotation.x=-Math.PI/2;cp.position.set(0,.015,21);cp.userData.decor=1;WORLD.add(cp);
 const lowQ=FPS<40;
 [[-15,3],[15,9],[-15,21],[15,27],[-15,37],[15,43]].forEach(([x,z],i)=>furnace(x,z,x<0?Math.PI/2:-Math.PI/2));
 [[-9.3,6.5],[9.3,18.5],[-9.3,30.5],[9.3,37]].forEach(([x,z],i)=>{if(!lowQ||i<2)anvil(x,z,x<0?.4:-.4)});
 for(const z of [4,16,28,40])for(const s of[-1,1])banner(s*11,z+.9,(z/4+s+5)|0,0,3.4);
 for(const z of [-2,8,14,20,26,32,38,44])for(const s of[-1,1])lamp(s*12.6,z,z%12?0xffd27a:0xffb0d0);
 [[-10.5,1],[10.6,12.5],[-10.4,24],[10.5,33],[-10.6,42]].forEach(([x,z],i)=>{barrel(x,z,1);barrel(x+(x<0?.6:-.6),z+.7,.8);coal(x,z+2)});
 [[-13.2,13],[13.2,22],[-13.2,33]].forEach(([x,z])=>hammerRack(x,z,x<0?Math.PI/2:-Math.PI/2));
 // ворота-книги в конце и у стен станции 1
 bookGate(-8,46.9,7.6,5.4,0x3a5ac8);bookGate(8,46.9,7.6,5.4,0xc83a4a);
 const arch=new THREE.Mesh(new THREE.TorusGeometry(4.2,.35,10,24,Math.PI),M(0xe8b040,{em:0x806000,ei:.3}));arch.position.set(0,5,46.6);arch.userData.decor=1;WORLD.add(arch);
 WORLD.children.forEach(o=>{if(o.isMesh&&Math.abs(o.position.z-10)<.01&&Math.abs(o.scale.y-2.4)<.01&&Math.abs(o.scale.z-.5)<.01&&o.material.color&&o.material.color.getHex()===0x6a4a3a){o.material=M(o.position.x<0?0x2e4aa8:0xa83040);const w=o.scale.x;
  for(const sx of[-1,1])for(const sy of[0,1])for(const sz of[-1,1]){dm(GEO.box,M(0xffd040,{em:0x806000,ei:.35}),o.position.x+sx*(w/2-.15),sy?2.25:.15,10+sz*.26,null,[.34,.3,.04])}
  dm(GEO.box,0xfff3d6,o.position.x,1.2,10,null,[w-.3,2.1,.52])}});
 // пол: тёплые отблески у печей
}
{const b2=LEVELS[2].build;LEVELS[2].build=function(){const r=b2.apply(this,arguments);try{forgeDecor()}catch(e){console.error(e)}return r}}
