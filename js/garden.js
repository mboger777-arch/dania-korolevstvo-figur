'use strict';
// ===================== v6.2 Пролог-сад Королевы (CONCEPT_v2 гл.0): бег, прыжок, удержание — и первая точка мелом =====================
// Индекс 7, чтобы не сдвигать SV.done глав 0..6. Запускается после интро (если сад ещё не пройден); на карте не нужен.
const GARDEN=7;
CHLIGHT[GARDEN]={sun:0xfff2d0,si:2.9,sky:[0x7cc8ff,0xfff2e0],fog:0xf2f6e8,hemi:[0xfff8e8,0x8cc060],ex:1.06};
LEVELS[GARDEN]={cast:{queen:true},build(){groundPlane();hills();BOUNDS=[-9,9,-4,30];
 treeRing(0,13,10,18,26);for(let i=0;i<40;i++){const x=rnd(-8,8),z=rnd(-3,29);if(Math.abs(x)>2.2)mesh(GEO.sphL,M([0xff8ab8,0xffe066,0xffffff,0xb48cff][i%4],{em:0x302010,ei:.2}),x,.15,z,null,.16)}
 // дорожка
 for(let z=-2;z<28;z+=1.1)mesh(GEO.cyl,0xe8d2a8,rnd(-.2,.2),.02,z,null,[.55,.04,.55]);
 // живая изгородь-кустик поперёк дорожки — её надо перепрыгнуть
 this.hz=11;for(let x=-8.5;x<=8.5;x+=.9)mesh(GEO.sphL,M(0x4f9a3a,{em:0x103008,ei:.15}),x,.45,this.hz,null,[.55,.6,.45]);block(0,this.hz,9,.35,.8);
 // первая точка — светящаяся, на постаменте-кувшинке
 this.D={x:0,z:22};this.pad=pad3D(this.D.x,this.D.z,0xffd23a,1.0);this.dot=mesh(GEO.sphL,M(0xffffff,{em:0xffe066,ei:1}),this.D.x,.35,this.D.z,null,.12);
 TICK.push(()=>{if(this.dot)this.dot.scale.setScalar(.12*(1+Math.sin(T*5)*.25))});
 heroAt(0,0,0);place(QUEEN,1.8,25,Math.PI)},
 async play(){const L=this;
  await cutscene(async()=>{shot(2.5,2.2,-3,0,1.2,6,2.5);await say('gd_s')});
  newTask('Беги по дорожке','move');let mk=marker(0,7);run(()=>say('u_move'));
  botTask(async()=>{await bGo(0,7,.5)});await until(()=>hd(0,7)<1.1);mk.visible=false;good('g_good');
  newTask('Перепрыгни кустик','jump');mk=marker(0,14.5);run(()=>sayNext('gd_jump'));
  botTask(async()=>{await bGo(0,L.hz-2.2,.5);BGOAL={x:0,z:15,tol:.5};await bWait(.25);bTap();await bUntil(()=>HERO.z>L.hz+.8,6);BGOAL=null;await bGo(0,14.5,.6)});
  await until(()=>HERO.z>L.hz+.8);mk.visible=false;good('g_good');
  newTask('Встань на точку и держи палец','hold');run(()=>sayNext('gd_dot1'));
  botTask(async()=>{await bGo(L.D.x,L.D.z,.4);bHold(true);await bUntil(()=>L.lit,6);bHold(false)});
  await until(()=>hd(L.D.x,L.D.z)<1&&INP.hold);L.lit=true;SFX.chalk();burst(V3(L.D.x,.5,L.D.z),0xffe066,50,4);L.dot.scale.setScalar(.3);L.dot=null;GOAL='';
  await cutscene(async()=>{shot(L.D.x+2.2,1.6,L.D.z-2.6,L.D.x,.6,L.D.z,2.2);await say('gd_dot2');faceTo(QUEEN,HERO.x,HERO.z);await say('gd_k')});
  await chapterWin(GARDEN)}};
