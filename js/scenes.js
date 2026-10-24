'use strict';
// ===== титул, интро, карта, обёртка глав, финал =====
let CUT=false;
async function cutscene(fn){CUT=true;INPMODE='ui';HERO.lock=true;try{await fn()}finally{CUT=false;INPMODE='play';HERO.lock=false;followCam()}}
function buildVillage(){clearWorld();groundPlane();hills();
 [[-7,6,0,0],[-11,1,.4,1],[7,6,-.3,2],[11,0,-.6,3],[-4,12,.1,4],[5,13,-.2,5],[-14,9,.6,2],[14,10,-.5,0]].forEach(([x,z,a,c])=>house(x,z,1,a,c));
 const tw=new THREE.Group();tw.position.set(0,0,18);for(let i=0;i<5;i++){const h=mesh(GEO.hex,M(i%2?0xf5c242:0xffd65a,{em:0x604000,ei:.2}),0,1+i*1.6,0,tw,[1.6-i*.1,1.5,1.6-i*.1])}mesh(GEO.cone,0xf2683c,0,8.9,0,tw,[1.3,1.6,1.3]);WORLD.add(tw);cylBlock(0,18,1.7,9);
 [[-9,-4],[9,-5],[-16,4],[16,3],[-3,24],[8,22],[-12,18]].forEach(([x,z])=>tree(x,z,1+Math.random()*.4));flowers(60,-14,14,-6,14);
 cloud(-30,26,60,3);cloud(25,30,70,3.5);cloud(0,34,90,4);cloud(-50,22,30,3);cloud(50,24,30,3)}
// ---- титул ----
SC.title={hud:false,enter(){buildVillage();spawnHeroes({queen:true,kriv:true});place(DANIA,1.9,0,Math.PI);place(KRUG,.6,-.2,Math.PI);place(QUEEN,-.9,0,Math.PI);place(KRIV,-2.9,.6,Math.PI);KRIV.F.mood='happy';KRUG.mode='idle';
  DANIA.anim='idle';shot(0,1.5,-5.2,-.2,1.15,0,2);CAMS.snap=true;CAMS.pos.set(0,1.5,-5.2);this.t=0},
 step3D(dt){this.t+=dt;CAMS.sp.set(Math.sin(this.t*.15)*.8-.2,1.5,-5.2);if(Math.random()<.004)DANIA.cheerT=T;if(Math.random()<.004)KRUG.cheerT=T},
 draw(){const v=vis();const cx=v.x0+v.w/2;X.save();const k=1+Math.sin(T*2)*.015;X.translate(cx,safeT()+92);X.scale(k,k);txt('Даня и',0,-46,64,'#fff6dc',{f:FONT,st:'#4a1f8a',lw:12,id:'t1'});txt('Королевство Фигур',0,30,92,'#ffd84a',{f:FONT,st:'#4a1f8a',lw:16,id:'t2'});X.restore();
  labelBtn('play',cx,safeB()-70,300,100,'Играть',()=>{ac();SFX.magic();if(!SV.intro)go('intro');else go('map')},{pulse:1,size:54});
  if(SV.medal)txt('★ Мастер фигур ★',cx,safeB()-150,34,'#ffe08a',{f:FONT,st:'#4a1f8a',lw:7,id:'mst'})}};
// ---- интро ----
SC.intro={get cut(){return CUT},skip(){SV.intro=1;save();go('map')},hud:false,enter(){buildVillage();spawnHeroes({queen:true,kriv:true});const vh=house(-2.5,5,1,0,0,false);
  place(DANIA,0,0,Math.PI);place(KRUG,-1.3,.3,Math.PI);place(QUEEN,9,2,0);QUEEN.root.visible=false;place(KRIV,-7,14,0);KRIV.root.visible=false;KRUG.mode='idle';
  run(async()=>{await cutscene(async()=>{shot(0,7,-12,0,2,8,1.5);CAMS.snap=true;CAMS.pos.set(0,9,-16);await say('i1');
   KRIV.root.visible=true;KRIV.F.mood='angry';shot(-1,3,-4,-3,1.6,6,2);for(let i=0;i<40;i++){KRIV.root.position.z=lerp(14,7.6,ease(i/40));KRIV.root.position.x=lerp(-7,-3.6,ease(i/40));KRIV.root.position.y=0;await wait(.025)}faceTo(KRIV,-2.5,5);
   const p=say('i2');SFX.grumble();for(let i=0;i<30;i++){const s=1-ease(i/30)*.85;vh.scale.setScalar(s);vh.rotation.y+=.2;vh.rotation.z=i*.03;await wait(.03)}vh.visible=false;const ball=mesh(new THREE.SphereGeometry(.6,10,8),new THREE.MeshLambertMaterial({map:TEX.yarn}),-2.5,.6,5);burst(V3(-2.5,1,5),0xa060ff,30);await p;
   faceTo(KRIV,0,0);shot(-2.2,1.9,4.2,-3.6,1.7,7.6,3);await say('i3');
   QUEEN.root.visible=true;place(QUEEN,1.6,1.8,Math.PI);burst(V3(1.6,1.5,1.8),0xffe080,40);SFX.magic();KRIV.root.visible=false;burst(V3(-3.6,1.5,7.6),0xa060ff,30);
   shot(.6,1.6,-3.6,.6,1.3,1,3);faceTo(DANIA,1.6,1.8);await say('i4');burst(V3(0,1.2,0),0xffe066,30);SFX.ding();
   faceTo(DANIA,0,-5);DANIA.cheerT=T;await say('i5');KRUG.cheerT=T;await say('i6')});SV.intro=1;save();go('map')})},
 draw(){}};
// ---- карта ----
const CHAP=[{t:'Долина Точек',p:[694,356]},{t:'Ломаная гора',p:[250,190]},{t:'Кузница углов',p:[1050,215]},{t:'Город Отверстий',p:[275,470]},{t:'Пчелиные соты',p:[962,560]},{t:'Гонка колёс',p:[1075,394]},{t:'Замок Кривули',p:[775,100]}];
function chOpen(i){return i===0||SV.done[i-1]||SV.done[i]}
function mapXY(p){const v=vis(),s=Math.max(v.w/1280,v.h/720);return[640-640*s+p[0]*s,v.y0+v.h/2-360*s+p[1]*s]}
SC.map={hud:true,enter(){clearWorld();CHARS.slice().forEach(removeChar);INPMODE='ui';if(!SC.map.said){SC.map.said=1;run(()=>say(SV.done[5]&&!SV.done[6]?'m_boss':'m1'))}else if(SV.done[5]&&!SV.done[6])run(()=>say('m_boss'))},
 draw(){const v=vis(),s=Math.max(v.w/1280,v.h/720);if(okI(IM.map))X.drawImage(IM.map,640-640*s,v.y0+v.h/2-360*s,1280*s,720*s);
  // тропинка-пунктир между открытыми местами
  X.setLineDash([14,16]);X.lineWidth=7;X.strokeStyle='rgba(255,255,255,.85)';X.beginPath();CHAP.forEach((c,i)=>{const[x,y]=mapXY(c.p);i?X.lineTo(x,y):X.moveTo(x,y)});X.stroke();X.setLineDash([]);
  const cur=CHAP.findIndex((c,i)=>chOpen(i)&&!SV.done[i]);
  CHAP.forEach((c,i)=>{const[x,y]=mapXY(c.p);const open=chOpen(i),done=SV.done[i];const r=46*(i===cur?1+Math.sin(T*4)*.06:1);
   X.save();X.shadowColor='rgba(0,0,0,.4)';X.shadowBlur=10;X.beginPath();X.arc(x,y,r,0,7);X.fillStyle=done?'#5cc86a':open?'#ffb52e':'#8a8aa0';X.fill();X.shadowColor='transparent';X.lineWidth=7;X.strokeStyle='#fff';X.stroke();X.restore();
   txt(i===6?'★':String(i+1),x,y+3,i===6?56:60,'#fff',{f:NUM,st:'#3a1a6a',lw:9,id:'node'+i});if(done)txt('✔',x+34,y-34,36,'#fff',{f:NUM,st:'#1a6a2a',lw:7});
   if(!open){X.fillStyle='rgba(40,30,70,.85)';rr(x-14,y+20,28,22,5);X.fill()}
   const lw=Math.max(170,c.t.length*17);panel(x-lw/2,y+52,lw,46,{fill:'rgba(255,250,236,.95)',st:open?'#6a4bb8':'#9a9ab0',lw:4,r:16});txt(c.t,x,y+76,30,open?'#3a1a6a':'#7a7a90',{f:FONT,st:0,id:'nl'+i,box:[x-lw/2,y+52,x+lw/2,y+98]});
   hitBtn('ch'+i,x,y+20,110,130,()=>{if(open){SFX.magic();go('ch',i)}else{SFX.bad();run(()=>sayNext('m_lock'))}})});
  if(SV.medal){drawMedal(safeR()-70,safeT()+70,50)}}};
function drawMedal(x,y,r){X.save();X.translate(x,y);X.fillStyle='#d23a4a';X.beginPath();X.moveTo(-r*.5,-r*1.6);X.lineTo(-r*.1,-r*.6);X.lineTo(r*.1,-r*.6);X.lineTo(r*.5,-r*1.6);X.fill();const g=X.createRadialGradient(-r*.3,-r*.3,r*.1,0,0,r);g.addColorStop(0,'#fff2a0');g.addColorStop(1,'#e0a010');X.fillStyle=g;X.beginPath();X.arc(0,0,r,0,7);X.fill();X.lineWidth=r*.1;X.strokeStyle='#a86a00';X.stroke();
 X.beginPath();for(let i=0;i<6;i++){const a=i/6*6.283-Math.PI/2;X.lineTo(Math.cos(a)*r*.62,Math.sin(a)*r*.62)}X.closePath();X.strokeStyle='#8a5000';X.lineWidth=r*.09;X.stroke();X.beginPath();X.moveTo(-r*.28,r*.22);X.lineTo(0,-r*.3);X.lineTo(r*.28,r*.22);X.closePath();X.fillStyle='#ff7a3a';X.fill();X.restore()}
// ---- обёртка главы ----
// LEVELS объявлен в world.js
let LVDRAW=null;
SC.ch={world:true,get cut(){return CUT},enter(i){this.i=i;LVDRAW=null;TASK.err=0;TASK.bot=null;TASK.help=null;TASK.botN=(TASK.botN||0)+1;ANGCARD=null;CAMS.dist=5.0;CAMS.h=2.4;HERO.mode='walk';HERO.lock=false;const L=LEVELS[i];clearWorld();spawnHeroes(L.cast||{});L.build();INPMODE='play';CAMS.snap=true;
  run(async()=>{await L.play();await chapterWin(i)})},
 draw(){if(LVDRAW)LVDRAW();drawAngCard();if(this.win){const u=T-this.win;const v=vis();X.fillStyle=`rgba(40,20,90,${Math.min(.35,u)})`;X.fillRect(v.x0,v.y0,v.w,v.h);const k=ease(u*2);X.save();X.translate(v.x0+v.w/2,v.y0+v.h*.5);X.scale(k,k);for(let j=0;j<3;j++){txt('★',(j-1)*130,j==1?-30:0,j==1?170:130,'#ffd84a',{f:NUM,st:'#7a4a00',lw:14})}X.restore()}}};
async function chapterWin(i){SFX.star();if(DANIA)DANIA.cheerT=T;if(KRUG)KRUG.cheerT=T;burst(V3(HERO.x,HERO.y+2,HERO.z),0xffe066,50,6);SC.ch.win=T;GOAL='';clearGesture();await say('g_win');await wait(1.2);SC.ch.win=0;SV.done[i]=1;save();go('map')}
const TASK={err:0,help:null,busy:false};
function newTask(goal,g){GOAL=goal;TASK.err=0;TASK.help=null;if(g)needGesture(g)}
// ошибка: просто сказать, что не так; после 2-й — помощь (счёт вслух с подсветкой)
function mistake(k){TASK.err++;SFX.bad();if(DANIA)DANIA.F.mood='sad';setTimeout(()=>{if(DANIA)DANIA.F.mood='happy'},1600);G.mistakes=(G.mistakes||0)+1;
 run(async()=>{await sayNext(k);if(TASK.err>=2&&TASK.help&&!TASK.busy){TASK.busy=true;try{await TASK.help()}finally{TASK.busy=false}}})}
function good(k){SFX.ok();if(DANIA)DANIA.cheerT=T;if(KRUG)KRUG.cheerT=T;return k?say(k):Promise.resolve()}
// счёт вслух с подсветкой: items — массив {x,y,z} или функций подсветки
async function countAloud(items,onEach){for(let i=0;i<items.length;i++){const it=items[i];if(onEach)onEach(i,it);bigNum(i+1);SFX.ding();burst(it.clone?it.clone():V3(it.x,it.y,it.z),0xffe066,14,2.5,.3);await say('n'+(i+1))}}
// ---- запуск ----
function startGame(){document.getElementById('ld').remove();rs();requestAnimationFrame(loop);const ch=QS.get('ch');if(ch!=null)go('ch',+ch);else if(QS.has('map'))go('map');else if(QS.has('intro'))go('intro');else go('title');if(G.test&&typeof botInit==='function')botInit()}
