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
