// Раунд 6: детальные домики-фигуры (расписные фасады) + убранство глав
const HTX={},HTM={};
function hHex(c){return '#'+new THREE.Color(c).getHexString()}
function hShape(x,k,cx,cy,r,col){x.fillStyle=col;x.beginPath();if(k===0)x.arc(cx,cy,r,0,7);else if(k===1){x.moveTo(cx,cy-r);x.lineTo(cx+r*.95,cy+r*.7);x.lineTo(cx-r*.95,cy+r*.7)}else if(k===2)x.rect(cx-r*.8,cy-r*.8,r*1.6,r*1.6);else{for(let i=0;i<6;i++){const a=i*Math.PI/3;x.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r)}}x.closePath();x.fill();x.strokeStyle='rgba(90,50,10,.6)';x.lineWidth=3;x.stroke()}
function hWin(x,cx,cy,w,h,sc,fl){
 // ставни
 x.fillStyle=sc;x.fillRect(cx-w/2-w*.42,cy-h/2,w*.4,h);x.fillRect(cx+w/2+w*.02,cy-h/2,w*.4,h);x.strokeStyle='rgba(0,0,0,.25)';x.lineWidth=2;for(const s of[-1,1])for(let i=1;i<4;i++){const sx=cx+s*(w/2+w*.22);x.beginPath();x.moveTo(sx-w*.15,cy-h/2+i*h/4);x.lineTo(sx+w*.15,cy-h/2+i*h/4);x.stroke()}
 x.fillStyle='#fffaf0';x.fillRect(cx-w/2-5,cy-h/2-5,w+10,h+10);
 const g=x.createLinearGradient(0,cy-h/2,0,cy+h/2);g.addColorStop(0,'#fff3b0');g.addColorStop(1,'#ffb84a');x.fillStyle=g;x.fillRect(cx-w/2,cy-h/2,w,h);
 x.fillStyle='rgba(255,255,255,.55)';x.beginPath();x.moveTo(cx-w/2+3,cy-h/2+3);x.lineTo(cx-w/2+w*.35,cy-h/2+3);x.lineTo(cx-w/2+3,cy-h/2+h*.35);x.fill();
 x.fillStyle='#fffaf0';x.fillRect(cx-2.5,cy-h/2,5,h);x.fillRect(cx-w/2,cy-2.5,w,5);
 if(fl){x.fillStyle='#8a5530';x.fillRect(cx-w/2-8,cy+h/2+4,w+16,12);const fc=['#ff5a8a','#ffe14a','#ffffff','#b07cff','#ff8a3a'];for(let i=0;i<6;i++){x.fillStyle='#3f9a3a';x.beginPath();x.arc(cx-w/2-2+i*(w+4)/5,cy+h/2+2,5,0,7);x.fill();x.fillStyle=fc[i%5];x.beginPath();x.arc(cx-w/2-2+i*(w+4)/5,cy+h/2-1,4,0,7);x.fill()}}}
function hFace(ci,kind){const k=ci+'_'+kind;if(HTX[k])return HTX[k];
 const wc=hHex(new THREE.Color(HC[ci%6]).lerp(new THREE.Color(0xfff4e0),.62)),sc=hHex(HC[(ci+2)%6]);
 HTX[k]=cvTex(256,256,(x,w,h)=>{x.fillStyle=wc;x.fillRect(0,0,w,h);
  for(let i=0;i<160;i++){x.fillStyle=`rgba(255,250,235,${.12+Math.random()*.12})`;x.fillRect(Math.random()*w,Math.random()*h,3+Math.random()*6,2+Math.random()*4)}
  // фахверк
  x.fillStyle='#7a5034';x.fillRect(0,0,w,10);x.fillRect(0,0,10,h);x.fillRect(w-10,0,10,h);x.fillRect(0,h-16,w,16);x.fillRect(0,h*.52,w,7);
  x.fillStyle='rgba(0,0,0,.18)';x.fillRect(0,h-22,w,6);
  if(kind==='f'){
   // дверь с аркой
   const dx=w/2,dw=66,dt=h*.5;x.fillStyle='#5a3420';x.beginPath();x.moveTo(dx-dw/2-6,h-16);x.lineTo(dx-dw/2-6,dt+dw/2);x.arc(dx,dt+dw/2,dw/2+6,Math.PI,0);x.lineTo(dx+dw/2+6,h-16);x.fill();
   x.fillStyle='#a8683a';x.beginPath();x.moveTo(dx-dw/2,h-16);x.lineTo(dx-dw/2,dt+dw/2);x.arc(dx,dt+dw/2,dw/2,Math.PI,0);x.lineTo(dx+dw/2,h-16);x.fill();
   x.strokeStyle='rgba(60,30,10,.45)';x.lineWidth=2;for(let i=1;i<4;i++){x.beginPath();x.moveTo(dx-dw/2+i*dw/4,dt+8);x.lineTo(dx-dw/2+i*dw/4,h-16);x.stroke()}
   x.fillStyle='#ffd040';x.beginPath();x.arc(dx+dw*.3,h*.78,5,0,7);x.fill();
   hShape(x,ci%4,dx,dt+dw/2-2,15,'#ffd040');
   hWin(x,46,h*.33,44,46,sc,1);hWin(x,w-46,h*.33,44,46,sc,1);hWin(x,46,h*.74,36,34,sc,0);hWin(x,w-46,h*.74,36,34,sc,0);
  }else{hWin(x,w/2,h*.3,52,52,sc,1);hWin(x,w/2,h*.76,46,40,sc,0)}
 },0);return HTX[k]}
function hMat(tex,c){const k=tex.uuid+'|'+c;if(!HTM[k])HTM[k]=new THREE.MeshLambertMaterial({map:tex,color:c});return HTM[k]}
TEX.roof=cvTex(128,128,(x,w,h)=>{x.fillStyle='#bdbdbd';x.fillRect(0,0,w,h);for(let r=0;r<9;r++)for(let c=-1;c<9;c++){const cx=c*16+(r%2)*8,cy=r*15-4;x.fillStyle=['#ffffff','#e6e6e6','#f2f2f2','#d8d8d8'][(r*3+c+9)%4];x.beginPath();x.moveTo(cx,cy);x.lineTo(cx+16,cy);x.lineTo(cx+16,cy+11);x.arc(cx+8,cy+11,8,0,Math.PI);x.closePath();x.fill();x.strokeStyle='rgba(0,0,0,.28)';x.lineWidth=1.5;x.stroke()}},0);
const ROOFG=(()=>{const sh=new THREE.Shape();sh.moveTo(-1.28,0);sh.lineTo(1.28,0);sh.lineTo(0,1.05);sh.closePath();const g=new THREE.ExtrudeGeometry(sh,{depth:2.36,bevelEnabled:false});g.translate(0,0,-1.18);const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*.45,uv.getY(i)*.45);return g})();
TEX.roof.wrapS=TEX.roof.wrapT=THREE.RepeatWrapping;TEX.roof.repeat.set(2,2);
function house(x,z,s,ang,ci,solid){s=s||1;ci=ci==null?Math.floor(Math.random()*6):ci;const g=new THREE.Group();g.position.set(x,baseAt(x,z),z);g.rotation.y=ang||0;
 const fr=hMat(hFace(ci,'f'),0xffffff),sd=hMat(hFace(ci,'s'),0xffffff),top=M(0x7a5034);
 mesh(GEO.box,0xb4aa9c,0,.12*s,0,g,[2.14*s,.24*s,2.14*s]);
 const b=new THREE.Mesh(GEO.box,[sd,sd,top,top,fr,fr]);b.position.set(0,1.12*s,0);b.scale.set(2*s,1.9*s,2*s);g.add(b);
 const r=mesh(ROOFG,hMat(TEX.roof,HC[(ci+2)%6]),0,2.06*s,0,g,s);r.rotation.y=Math.PI/2;
 mesh(GEO.box,hMat(TEX.brick||TEX.stone,0xffffff),.5*s,3.0*s,-.35*s,g,[.34*s,1.0*s,.34*s]);mesh(GEO.box,0x4a3a36,.5*s,3.52*s,-.35*s,g,[.44*s,.1*s,.44*s]);
 // козырёк над дверью
 for(const zz of[1,-1])mesh(ROOFG,hMat(TEX.roof,HC[(ci+2)%6]),0,1.5*s,zz*1.1*s,g,[.36*s,.3*s,.12*s]);
 WORLD.add(g);if(solid!==false)block(x,z,1.05*s,1.05*s,4*s,ang||0);return g}
// снежная шапка на крыше
function snowCap(g,s){const c=mesh(ROOFG,M(0xfbfdff),0,2.06*s+.4*1.05*s,0,g,[.64*s,.64*s,1.06*s]);c.rotation.y=Math.PI/2;c.userData.decor=1}
// инстансы: камни дорожки, цветы, кусты, сугробы
function inst(geo,mat,list,fn){if(!list.length)return null;const im=new THREE.InstancedMesh(geo,mat,list.length);const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),p=V3(0,0,0),sc=V3(1,1,1),col=new THREE.Color();
 list.forEach((o,i)=>{p.set(o[0],baseAt(o[0],o[2])+o[1],o[2]);e.set(0,o[4]||0,0);q.setFromEuler(e);const s=o[3];if(Array.isArray(s))sc.set(s[0],s[1],s[2]);else sc.setScalar(s);m4.compose(p,q,sc);im.setMatrixAt(i,m4);if(o[5]!=null){col.set(o[5]);im.setColorAt(i,col)}});
 im.userData.decor=1;im.frustumCulled=false;WORLD.add(im);return im}
const FLC=[0xff5a8a,0xffe14a,0xffffff,0xb07cff,0xff8a3a,0x5ad0ff];
// убранство главы по краям BOUNDS: домики, фонари, дорожки, цветы, кусты
function dressCh(o){o=o||{};const B=BOUNDS;if(!B)return;const lowQ=FPS<40,len=B[3]-B[2],step=Math.max(o.step||7,len/(lowQ?6:11)),off=o.off||5;
 let ci=o.ci||0;const st=[],fl=[],bu=[],dr=[];
 for(let z=B[2]+2;z<=B[3]+2;z+=step)for(const sd of[-1,1]){const x=(sd<0?B[0]-off:B[1]+off)+sd*rnd(0,1.2),zz=z+rnd(-1,1)+(sd>0?step/2:0);if(o.skip&&o.skip(x,zz))continue;
  const h=house(x,zz,o.s||rnd(.9,1.15),sd<0?Math.PI/2:-Math.PI/2,(ci++)%6,false);h.traverse(m=>m.userData.decor=1);if(o.snow)snowCap(h,h.children[1].scale.y/1.9);
  if(o.lamps!==false&&!(o.skip&&o.skip(sd<0?B[0]-1.4:B[1]+1.4,z)))lamp(sd<0?B[0]-1.4:B[1]+1.4,z+step*.25,o.lampC);
  for(let k=0;k<3;k++){const bx=x-sd*rnd(1.6,2.4),bz=zz+rnd(-2.6,2.6);if(o.snow)dr.push([bx,0,bz,[rnd(.6,1.2),rnd(.25,.45),rnd(.6,1.1)],rnd(0,3)]);else bu.push([bx,.3,bz,rnd(.45,.75),0,[0x4fa84a,0x3f9a3a,0x5cb85a][k]])}}
 if(o.path!==false)for(const sd of[-1,1])for(let z=B[2];z<=B[3];z+=1.15){const x=(sd<0?B[0]-2.6:B[1]+2.6)+Math.sin(z*.7)*.25;if(o.skip&&o.skip(x,z))continue;st.push([x,.03,z,[rnd(.36,.48),.05,rnd(.28,.36)],rnd(0,3)])}
 if(!o.snow&&o.flowers!==false)for(let i=0;i<(lowQ?120:260);i++){const sd=i%2?1:-1,x=(sd<0?B[0]:B[1])+sd*rnd(-.3,3.2),z=rnd(B[2]-2,B[3]+3);if(o.skip&&o.skip(x,z))continue;fl.push([x,.16,z,rnd(.09,.14),0,FLC[i%6]])}
 inst(GEO.cylL,M(o.stoneC||0xcfc4b0),st);inst(GEO.sphL,M(0xffffff),fl);inst(GEO.sphL,M(0xffffff),bu);inst(GEO.sphL,M(0xf6faff),dr)}
function snowman(x,z,a){const g=dGroup(x,z,a);g.position.y=baseAt(x,z);for(const[y,r]of[[.45,.5],[1.15,.36],[1.68,.26]])dm(GEO.sph,0xfbfdff,0,y,0,g,r);
 dm(GEO.cone,0xff8a2a,0,1.68,.32,g,[.06,.3,.06]).rotation.x=Math.PI/2;for(const s of[-1,1])dm(GEO.sphL,0x2a2a33,s*.1,1.76,.22,g,.04);for(const y of[1.05,1.25])dm(GEO.sphL,0x2a2a33,0,y,.35,g,.045);
 dm(GEO.cylL,0x3a3a48,0,1.98,0,g,[.2,.3,.2]);dm(GEO.cylL,0x3a3a48,0,1.84,0,g,[.3,.04,.3]);dm(GEO.box,0xe05a5a,0,1.42,0,g,[.6,.1,.5]);return g}
function snowfall(B){const n=FPS<40?500:1100,pos=new Float32Array(n*3);for(let i=0;i<n;i++){pos[i*3]=rnd(B[0]-14,B[1]+14);pos[i*3+1]=rnd(0,16);pos[i*3+2]=rnd(B[2]-6,B[3]+10)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));const p=new THREE.Points(g,new THREE.PointsMaterial({map:TEX.dot,size:.16,transparent:true,depthWrite:false,color:0xffffff}));p.userData.decor=1;p.frustumCulled=false;WORLD.add(p);
 let t=0;TICK.push(dt=>{t+=dt;for(let i=0;i<n;i++){let y=pos[i*3+1]-dt*(.8+(i%7)*.08);if(y<0)y+=16;pos[i*3+1]=y;pos[i*3]+=Math.sin(t+i)*dt*.15}g.attributes.position.needsUpdate=true})}
function wrapBuild(i,fn){const b=LEVELS[i].build;LEVELS[i].build=function(){const r=b.apply(this,arguments);try{fn.call(this)}catch(e){console.error(e)}return r}}
wrapBuild(0,()=>dressCh({ci:0}));
wrapBuild(1,()=>{dressCh({ci:1,snow:true,stoneC:0xb8c8dc,flowers:false,lampC:0xbfe4ff});const B=BOUNDS;for(let z=B[2]+8;z<B[3];z+=26)for(const sd of[-1,1])snowman(sd<0?B[0]-2.2:B[1]+2.2,z+(sd>0?13:0),sd<0?Math.PI/2:-Math.PI/2);snowfall(B);
 // фон за местом разговора в начале (камера смотрит на Королеву к -x/-z): заснеженные домики, ёлки, снеговики
 house(-8.5,-13.5,1.1,0,1);house(-1.5,-15,1,0,2);house(-15,-9.5,1,Math.PI/2,3);for(const h of [[-4.5,-10.5,1.3],[-11.8,-11,1.5],[2.5,-11.5,1.1],[-13.2,-6.5,1.2],[-6.5,-16,1.4]])pine(h[0],h[1],h[2],true);snowman(-6.2,-8.6,.3);snowman(.8,-9.2,-.2);snowman(-12,-4,1.3)});
wrapBuild(2,()=>dressCh({ci:2,off:9,lamps:false,path:false,flowers:false}));
wrapBuild(3,()=>dressCh({ci:3,flowers:false}));// каменная площадь — без цветов на плитах
wrapBuild(4,()=>dressCh({ci:4,step:11,off:6.5}));// реже домики
wrapBuild(5,()=>dressCh({ci:5,off:6}));
wrapBuild(6,()=>dressCh({ci:0,off:6}));
// ch4: ульи и пчёлы
function hive(x,z,s){s=s||1;const g=dGroup(x,z);g.position.y=baseAt(x,z);dm(GEO.cylL,0x8a5a32,0,.35*s,0,g,[.9*s,.7*s,.9*s]);dm(GEO.cylL,0x6a4022,0,.72*s,0,g,[1.05*s,.08*s,1.05*s]);
 const R=[1,.98,.92,.82,.68,.5,.3];R.forEach((r,i)=>dm(GEO.sph,i%2?0xf0b030:0xe09a20,0,(.95+i*.3)*s,0,g,[.85*r*s,.2*s,.85*r*s]));
 dm(GEO.sph,0x3a2410,0,1.15*s,.78*s,g,[.18*s,.13*s,.06*s]);dm(GEO.box,0x8a5a32,0,1.0*s,.86*s,g,[.5*s,.05*s,.2*s]);return g}
function bee(){const g=new THREE.Group();dm(GEO.sph,0xffd030,0,0,0,g,[.16,.13,.2]);for(const z of[-.05,.07])dm(GEO.cylL,0x2a2018,0,0,z,g,[.15,.04,.15]).rotation.x=Math.PI/2;
 dm(GEO.sph,0x2a2018,0,.02,.19,g,.08);const wm=M(0xffffff,{op:.6});const w=[];for(const s of[-1,1]){const m=dm(GEO.sph,wm,s*.1,.14,-.02,g,[.12,.03,.07]);w.push(m)}g.userData.w=w;g.userData.decor=1;WORLD.add(g);return g}
function hiveDecor(){const B=BOUNDS,lowQ=FPS<40;const H=[[B[0]-3.2,B[3]-4,1.3],[B[1]+3.2,B[3]-14,1.1],[B[0]-3.4,8,1],[B[1]+3.6,22,1.2]];
 H.forEach(h=>hive(h[0],h[1],h[2]));const bees=[];H.forEach((h,hi)=>{for(let i=0;i<(lowQ?2:4);i++){const b=bee();bees.push({b,h,r:rnd(1.4,2.6),a:rnd(0,6),sp:rnd(.8,1.4)*(i%2?1:-1),y:rnd(1,2.4)*h[2],ph:rnd(0,6)})}});
 let t=0;TICK.push(dt=>{t+=dt;for(const o of bees){o.a+=dt*o.sp;const x=o.h[0]+Math.cos(o.a)*o.r,z=o.h[1]+Math.sin(o.a)*o.r*.8;o.b.position.set(x,baseAt(o.h[0],o.h[1])+o.y+Math.sin(t*3+o.ph)*.25,z);o.b.rotation.y=-o.a+(o.sp>0?Math.PI:0);for(const w of o.b.userData.w)w.rotation.z=Math.sin(t*40+o.ph)*.6}})}
wrapBuild(4,hiveDecor);
// ch5: убранство дороги — разметка, бордюры, забор по краю, знаки-фигуры, тюки сена
TEX.hay=cvTex(64,64,(x,w,h)=>{x.fillStyle='#e8c25a';x.fillRect(0,0,w,h);for(let i=0;i<120;i++){x.strokeStyle=['#c99a35','#f6dc84','#b88a2a'][i%3];x.lineWidth=1.2;const a=rnd(0,w),b=rnd(0,h);x.beginPath();x.moveTo(a,b);x.lineTo(a+rnd(-6,6),b+rnd(4,10));x.stroke()}},0);
function roadSign(x,z,k,a){const g=dGroup(x,z,a);g.position.y=baseAt(x,z);dm(GEO.cylL,0x8a8a96,0,1.1,0,g,[.06,2.2,.06]);
 const cv=document.createElement('canvas');cv.width=cv.height=128;const c=cv.getContext('2d');c.fillStyle='#fff';c.strokeStyle=['#e03a3a','#2a6ad8','#2a9a4a'][k];c.lineWidth=14;c.beginPath();
 if(k===0){c.moveTo(64,10);c.lineTo(120,112);c.lineTo(8,112);c.closePath()}else if(k===1)c.arc(64,64,54,0,7);else c.rect(12,12,104,104);c.fill();c.stroke();
 c.fillStyle='#333';c.font='bold 54px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(['!','→','P'][k],64,k===0?78:66);
 const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.PlaneGeometry(.9,.9),new THREE.MeshLambertMaterial({map:t,transparent:true,side:THREE.DoubleSide,alphaTest:.5}));m.position.set(0,2.2,.05);m.userData.decor=1;g.add(m);return g}
function roadDecor(){const B=BOUNDS,lowQ=FPS<40,dash=[],kerb=[],post=[],rail=[],hay=[];
 for(let z=B[2];z<B[3]+6;z+=3)dash.push([0,.03,z,[.18,.02,1.4]]);
 for(const s of[-1,1])for(let z=B[2]-2;z<B[3]+6;z+=1.1)kerb.push([s*4.6,.06,z,[.25,.12,1.0]]);
 for(const s of[-1,1])for(let z=B[2]-2;z<B[3]+6;z+=2.4){if(((z/2.4)|0)%9===4)continue;post.push([s*8.9,.6,z,[.12,1.2,.12]]);for(const y of[.45,.95])rail.push([s*8.9,y,z+1.2,[.06,.1,2.4]])}
 for(let z=16;z<B[3];z+=lowQ?24:13){const s=((z/13)|0)%2?1:-1;hay.push([s*rnd(6.4,7.6),.45,z,[.55,.9,.55]]);hay.push([s*rnd(6.4,7.6),.45,z+1.25,[.55,.9,.55]])}
 inst(GEO.box,M(0xffffff),dash);inst(GEO.box,M(0xbfb4a0),kerb);inst(GEO.box,M(0x9a6a3a),post);inst(GEO.box,M(0xb07a44),rail);
 const hm=inst(GEO.cyl,new THREE.MeshLambertMaterial({map:TEX.hay}),hay);if(hm){const m4=new THREE.Matrix4(),r=new THREE.Matrix4().makeRotationZ(Math.PI/2);for(let i=0;i<hay.length;i++){hm.getMatrixAt(i,m4);m4.multiply(r);hm.setMatrixAt(i,m4)}hm.instanceMatrix.needsUpdate=true}
 for(let z=20,k=0;z<B[3];z+=lowQ?40:22,k++)roadSign(k%2?5.6:-5.6,z,k%3,k%2?-.3:.3)}
wrapBuild(5,roadDecor);
