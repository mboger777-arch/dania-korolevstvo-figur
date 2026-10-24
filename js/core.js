'use strict';
// ===== Даня и Королевство Фигур — 2D-оверлей (дизайн 1280x720, масштаб по высоте) поверх 3D (canvas#g) =====
const C=document.getElementById('c'),X=C.getContext('2d');
let W=0,H=0,S=1,OX=0,OY=0,DPR=1,T=0,DT=0.016;
const QS=new URLSearchParams(location.search);
const G={fast:QS.has('fast'),mute:QS.has('mute'),test:QS.has('test'),music:true};
const SAFE={l:0,t:0,r:0,b:0};let VVX=0,VVY=0;
const _sp=document.createElement('div');_sp.style.cssText='position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';document.documentElement.appendChild(_sp);
function vpWH(){const v=window.visualViewport;let w=innerWidth,h=innerHeight;VVX=0;VVY=0;if(v&&v.width>0){w=Math.round(v.width);h=Math.round(v.height);VVX=v.offsetLeft||0;VVY=v.offsetTop||0}const e=document.documentElement;return[w||e.clientWidth,h||e.clientHeight]}
function rs(){DPR=Math.min(2,window.devicePixelRatio||1);if(window.scrollX||window.scrollY)window.scrollTo(0,0);[W,H]=vpWH();
 for(const c of [C,document.getElementById('g')]){c.style.left=VVX+'px';c.style.top=VVY+'px';c.style.width=W+'px';c.style.height=H+'px'}
 C.width=Math.round(W*DPR);C.height=Math.round(H*DPR);
 const cs=getComputedStyle(_sp);SAFE.t=parseFloat(cs.paddingTop)||0;SAFE.r=parseFloat(cs.paddingRight)||0;SAFE.b=parseFloat(cs.paddingBottom)||0;SAFE.l=parseFloat(cs.paddingLeft)||0;
 S=H/720;if(W/H<1280/720)S=W/1280;OX=(W-1280*S)/2;OY=(H-720*S)/2;if(typeof resize3D==='function')resize3D()}
const FS_OK=!!(document.documentElement.requestFullscreen||document.documentElement.webkitRequestFullscreen);const isFS=()=>!!(document.fullscreenElement||document.webkitFullscreenElement);
function goFS(){if(!FS_OK||isFS())return;const e=document.documentElement;try{const p=(e.requestFullscreen||e.webkitRequestFullscreen).call(e,{navigationUI:'hide'});const lk=()=>{try{screen.orientation&&screen.orientation.lock&&screen.orientation.lock('landscape').catch(()=>{})}catch(_){}};if(p&&p.then)p.then(lk).catch(()=>{});else lk()}catch(_){}}
const TOUCH=(('ontouchstart' in window)||navigator.maxTouchPoints>0)&&matchMedia('(pointer:coarse)').matches;
const PORTRAIT=()=>TOUCH&&H>W*1.05;
addEventListener('pointerdown',()=>{if(TOUCH&&!PORTRAIT())goFS()},true);
let _lw=-1,_lh=-1;function relayout(){rs();_lw=W;_lh=H}
function onOrient(){relayout();[100,300,700].forEach(t=>setTimeout(relayout,t))}
['resize','orientationchange','pageshow'].forEach(e=>addEventListener(e,onOrient));document.addEventListener('fullscreenchange',onOrient);document.addEventListener('webkitfullscreenchange',onOrient);
document.addEventListener('visibilitychange',()=>{if(!document.hidden){onOrient();if(AC&&AC.state==='suspended')AC.resume().catch(()=>{})}});
if(window.visualViewport){visualViewport.addEventListener('resize',onOrient);visualViewport.addEventListener('scroll',onOrient)}
setInterval(()=>{const[w,h]=vpWH();if(w!==_lw||h!==_lh)relayout()},500);
// ---- утилиты ----
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),rnd=(a,b)=>a+Math.random()*(b-a),lerp=(a,b,t)=>a+(b-a)*t,ease=t=>t<0?0:t>1?1:1-Math.pow(1-t,3);
const FONT='FairyLogo, Georgia, serif',BODY='Pangolin, "Comic Sans MS", sans-serif',NUM='NunitoLogo, "Arial Black", sans-serif';
const IM={};function img(n,src){const i=new Image();i.src=src;IM[n]=i;return i}
const okI=i=>!!i&&(i.tagName==='CANVAS'||(i.complete&&i.naturalWidth>0));
img('map','assets/bg/map.webp');img('title','assets/bg/title.webp');
// ---- сохранение ----
let SV;try{SV=JSON.parse(localStorage.getItem('figur59'))}catch(e){}
if(!SV||!SV.done)SV={done:[0,0,0,0,0,0,0],intro:0,medal:0};
function save(){try{localStorage.setItem('figur59',JSON.stringify(SV))}catch(e){}}
// ---- звук ----
var AC=null;function ac(){if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(AC&&AC.state==='suspended')AC.resume().catch(()=>{});return AC}
function tone(f,d,type,v,when,slide){const a=ac();if(!a||G.mute)return;const t=a.currentTime+(when||0),o=a.createOscillator(),g=a.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+d);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v||.1,t+.01);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g).connect(a.destination);o.start(t);o.stop(t+d+.05)}
function noise(d,v,fq,when){const a=ac();if(!a||G.mute)return;const b=a.createBuffer(1,Math.floor(a.sampleRate*d),a.sampleRate),ch=b.getChannelData(0);for(let i=0;i<ch.length;i++)ch[i]=(Math.random()*2-1)*(1-i/ch.length);const s=a.createBufferSource();s.buffer=b;const f=a.createBiquadFilter();f.type='bandpass';f.frequency.value=fq;const g=a.createGain();g.gain.value=v;s.connect(f).connect(g).connect(a.destination);s.start(a.currentTime+(when||0))}
const SFX={ok(){[1046,1318,1568,2093].forEach((f,i)=>tone(f,.5,'sine',.08,i*.07))},bad(){tone(300,.22,'triangle',.08,0,220);tone(240,.25,'triangle',.06,.1,180)},
 click(){tone(1300,.05,'square',.03)},pop(){tone(600,.12,'sine',.1,0,1200)},jump(){tone(420,.18,'sine',.07,0,820)},land(){noise(.08,.15,250)},
 kick(){noise(.12,.35,500);tone(160,.12,'square',.05,0,90)},whoosh(){noise(.4,.18,800)},star(){[1568,2093,2637,3136].forEach((f,i)=>tone(f,.6,'sine',.07,i*.12))},
 chalk(){noise(.06,.06,3000)},ding(){tone(1568,.7,'sine',.08);tone(2350,.5,'sine',.04,.01)},bump(){noise(.2,.4,300);tone(110,.2,'square',.06,0,60)},
 zap(){tone(900,.25,'sawtooth',.04,0,1800)},magic(){[784,988,1175,1568,1976].forEach((f,i)=>tone(f,.4,'triangle',.05,i*.06))},boing(){tone(220,.3,'sine',.12,0,520)},
 grumble(){tone(140,.4,'sawtooth',.05,0,90)},step(){noise(.04,.05,900)},creak(){tone(180,.15,'sawtooth',.025,0,150)}};
// ---- музыка: тихая сказочная мелодия, приглушается во время речи ----
const MUS={g:null,next:0,i:0};
function musTick(){const a=AC;if(!a||G.mute||!G.music||G.fast)return;if(!MUS.g){MUS.g=a.createGain();MUS.g.gain.value=.05;MUS.g.connect(a.destination);MUS.next=a.currentTime+.2}
 MUS.g.gain.setTargetAtTime(TALK?.018:.05,a.currentTime,.3);
 const sc=[0,2,4,7,9,12,14],prog=[0,5,3,4];while(MUS.next<a.currentTime+.6){const bar=Math.floor(MUS.i/8)%4,st=MUS.i%8;const root=48+[0,5,-3,-5][bar];
  const n=st%2?root+12+sc[(st*3+bar)%sc.length]:root+12+sc[(st+bar*2)%5];const t=MUS.next;const o=a.createOscillator(),g=a.createGain();o.type='triangle';o.frequency.value=440*Math.pow(2,(n-57)/12);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.5,t+.02);g.gain.exponentialRampToValueAtTime(.01,t+.42);o.connect(g).connect(MUS.g);o.start(t);o.stop(t+.5);
  if(st===0){const b=a.createOscillator(),bg=a.createGain();b.type='sine';b.frequency.value=440*Math.pow(2,(root-57-12)/12);bg.gain.setValueAtTime(.6,t);bg.gain.exponentialRampToValueAtTime(.01,t+1.5);b.connect(bg).connect(MUS.g);b.start(t);b.stop(t+1.6)}
  MUS.next+=.27;MUS.i++}}
// ---- корутины: всё, что начато в сцене, отменяется при смене сцены ----
let GEN=0;const STALE={stale:1};const WQ=[];
function wait(s){const g=GEN,t0=T;return until(()=>T-t0>=s,g)}
function until(f,g){g=g==null?GEN:g;return new Promise((res,rej)=>{WQ.push({f,res,rej,g})})}
function stepWQ(){const L=WQ.splice(0);for(const w of L){if(w.g!==GEN){w.rej(STALE);continue}let ok=false;try{ok=w.f()}catch(e){console.error(e);ok=true}if(ok)w.res();else WQ.push(w)}}
async function run(fn){try{await fn()}catch(e){if(e!==STALE)console.error(e)}}
// ---- голос: очередь, реплика никогда не обрывается сама; «Дальше» пропускает только текущую ----
let TALK=null;const SQ=[];const NAMES={dania:'Даня',krug:'Кругляш',queen:'Королева Циркуль',kriv:'Кривуля',narr:''};
const SPKC={dania:'#ff8a1e',krug:'#f5b400',queen:'#9a6bd8',kriv:'#7a3bb0',narr:'#3a6fd0'};
let VLOG=[];// для теста голоса
function say(k){return new Promise((res,rej)=>{if(!LINES[k]){console.warn('no line',k);res();return}SQ.push({k,res,rej,g:GEN});pump()})}
// подсказка после ошибки: убирает ещё не начатые реплики и звучит сразу после текущей
function sayNext(k){while(SQ.length)SQ.shift().res();return say(k)}
async function sayAll(...ks){for(const k of ks)await say(k)}
function pump(){if(TALK||!SQ.length)return;const q=SQ.shift();if(q.g!==GEN){q.rej(STALE);pump();return}startTalk(q)}
function startTalk(q){const l=LINES[q.k],v=typeof VOICE!=='undefined'&&VOICE[q.k];const est=v?v[1]:Math.max(1.6,l.t.length*.065);
 const t={k:q.k,who:l.who,text:l.t,t0:T,q,a:null,end:0,playing:false};TALK=t;VLOG.push({k:q.k,t0:performance.now(),dur:v?v[1]:0});
 if(G.fast){t.end=T+.25;return}
 if(v&&!G.mute){const a=new Audio('assets/voice/'+v[0]);t.a=a;a.onended=()=>{if(TALK===t)t.end=T+.25};a.onerror=()=>{if(TALK===t)t.end=T+est};
  a.onplaying=()=>{t.playing=true};const p=a.play();if(p&&p.catch)p.catch(()=>{if(TALK===t&&!t.playing)t.end=T+est+.3});t.end=T+est+6}
 else t.end=T+est+.3}
function stepTalk(){if(TALK&&T>=TALK.end)finishTalk()}
function finishTalk(){const t=TALK;if(!t)return;TALK=null;if(t.a){try{t.a.pause()}catch(e){}}const L=VLOG[VLOG.length-1];if(L&&L.k===t.k)L.t1=performance.now();if(t.q.g===GEN)t.q.res();else t.q.rej(STALE);pump()}
function skipTalk(){if(TALK){SFX.click();finishTalk()}}
function stopTalk(){while(SQ.length){const q=SQ.shift();q.rej(STALE)}if(TALK){const t=TALK;TALK=null;if(t.a){try{t.a.pause()}catch(e){}}t.q.rej(STALE)}}
const talking=w=>!!(TALK&&TALK.who===w);
// ---- видимая область ----
function vis(){return{x0:-OX/S,y0:-OY/S,w:W/S,h:H/S}}
function safeL(){return vis().x0+SAFE.l/S+14}function safeR(){const v=vis();return v.x0+v.w-SAFE.r/S-14}
function safeT(){return vis().y0+SAFE.t/S+8}function safeB(){const v=vis();return v.y0+v.h-SAFE.b/S-8}
// ---- текст ----
function wrap(t,maxW){const ws=String(t).split(' '),out=[];let cur='';for(const w of ws){const s=cur?cur+' '+w:w;if(X.measureText(s).width>maxW&&cur){out.push(cur);cur=w}else cur=s}if(cur)out.push(cur);return out}
function fitText(t,w,h,maxS,font,minS){minS=minS||16;for(let s=maxS;s>=minS;s-=2){X.font=s+'px '+font;const L=wrap(t,w);const lh=s*1.14;if(L.length*lh<=h&&L.every(l=>X.measureText(l).width<=w))return{s,L,lh}}X.font=minS+'px '+font;return{s:minS,L:wrap(t,w),lh:minS*1.14}}
let AUD=null;// аудит: каждая надпись регистрирует прямоугольник, рамку и размер в css px
function txt(t,x,y,size,col,o){o=o||{};X.font=size+'px '+(o.f||FONT);X.textAlign=o.al||'center';X.textBaseline='middle';
 if(o.st!==0){X.lineJoin='round';X.lineWidth=o.lw||Math.max(3,size*.16);X.strokeStyle=o.st||'rgba(30,14,60,.95)';X.strokeText(t,x,y)}X.fillStyle=col||'#fff';X.fillText(t,x,y);
 if(AUD){const w=X.measureText(t).width;const x0=o.al==='left'?x:o.al==='right'?x-w:x-w/2;AUD.t.push({id:o.id||'',t:String(t),b:[x0,y-size*.55,x0+w,y+size*.55],box:o.box||null,css:size*S*(o.k||1)})}}
function textIn(t,x,y,w,h,maxS,col,o){o=o||{};const f=fitText(t,w,h,maxS,o.f||BODY,o.min);const y0=y-(f.L.length-1)*f.lh/2;
 f.L.forEach((l,i)=>txt(l,x,y0+i*f.lh,f.s,col,Object.assign({},o,{box:[x-w/2,y-h/2,x+w/2,y+h/2]})));return f}
function rr(x,y,w,h,r){X.beginPath();X.moveTo(x+r,y);X.arcTo(x+w,y,x+w,y+h,r);X.arcTo(x+w,y+h,x,y+h,r);X.arcTo(x,y+h,x,y,r);X.arcTo(x,y,x+w,y,r);X.closePath()}
function panel(x,y,w,h,o){o=o||{};X.save();X.shadowColor='rgba(20,10,50,.35)';X.shadowBlur=14;X.shadowOffsetY=5;rr(x,y,w,h,o.r||22);X.fillStyle=o.fill||'rgba(255,250,236,.96)';X.fill();X.shadowColor='transparent';X.lineWidth=o.lw||5;X.strokeStyle=o.st||'#6a4bb8';X.stroke();X.restore()}
// ---- кнопки (хит-зона >= 56 css px) ----
let UI=[];let PX=-99,PY=-99;
function hitBtn(id,x,y,w,h,fn,o){o=o||{};UI.push({id,x,y,w:Math.max(w,64/S),h:Math.max(h,64/S),fn,always:o.always})}
function roundBtn(id,x,y,d,icon,fn,o){o=o||{};hitBtn(id,x,y,d,d,fn,o);const k=1+(o.pulse?Math.sin(T*5)*.05:0);X.save();X.translate(x,y);X.scale(k,k);
 const r=d/2,g=X.createRadialGradient(0,-r*.35,r*.1,0,0,r);g.addColorStop(0,o.c1||'#ffd86b');g.addColorStop(1,o.c2||'#f08a1c');X.fillStyle=g;X.beginPath();X.arc(0,0,r,0,7);X.fill();X.lineWidth=d*.07;X.strokeStyle='#fff8e6';X.stroke();
 X.strokeStyle='#5a2a08';X.fillStyle='#5a2a08';X.lineWidth=d*.09;X.lineCap='round';X.lineJoin='round';ICON[icon]&&ICON[icon](r*.55);X.restore()}
const ICON={home(s){X.beginPath();X.moveTo(-s,0);X.lineTo(0,-s);X.lineTo(s,0);X.moveTo(-s*.7,-s*.2);X.lineTo(-s*.7,s*.9);X.lineTo(s*.7,s*.9);X.lineTo(s*.7,-s*.2);X.stroke()},
 snd(s){X.beginPath();X.moveTo(-s,-s*.35);X.lineTo(-s*.45,-s*.35);X.lineTo(s*.1,-s*.85);X.lineTo(s*.1,s*.85);X.lineTo(-s*.45,s*.35);X.lineTo(-s,s*.35);X.closePath();X.fill();
  if(!G.mute){X.beginPath();X.arc(s*.2,0,s*.55,-.8,.8);X.stroke()}else{X.beginPath();X.moveTo(s*.4,-s*.4);X.lineTo(s,s*.4);X.moveTo(s,-s*.4);X.lineTo(s*.4,s*.4);X.stroke()}},
 play(s){X.beginPath();X.moveTo(-s*.5,-s*.9);X.lineTo(s*.9,0);X.lineTo(-s*.5,s*.9);X.closePath();X.fill()},
 next(s){X.beginPath();X.moveTo(-s*.7,-s*.8);X.lineTo(s*.3,0);X.lineTo(-s*.7,s*.8);X.moveTo(s*.1,-s*.8);X.lineTo(s*1,0);X.lineTo(s*.1,s*.8);X.stroke()},
 jump(s){X.beginPath();X.moveTo(0,s*.9);X.lineTo(0,-s*.7);X.moveTo(-s*.7,0);X.lineTo(0,-s*.8);X.lineTo(s*.7,0);X.stroke()}};
function labelBtn(id,x,y,w,h,label,fn,o){o=o||{};hitBtn(id,x,y,w,h,fn,o);const k=1+(o.pulse?Math.sin(T*4)*.03:0);X.save();X.translate(x,y);X.scale(k,k);
 X.shadowColor='rgba(20,10,50,.4)';X.shadowBlur=12;X.shadowOffsetY=5;rr(-w/2,-h/2,w,h,h*.45);const g=X.createLinearGradient(0,-h/2,0,h/2);g.addColorStop(0,o.c1||'#ffcf4d');g.addColorStop(1,o.c2||'#f0771c');X.fillStyle=g;X.fill();X.shadowColor='transparent';X.lineWidth=5;X.strokeStyle='#fff6dc';X.stroke();X.restore();
 X.save();X.translate(x,y);X.scale(k,k);textIn(label,0,2,w*.84,h*.72,o.size||44,'#fff',{f:FONT,st:'#6a2a00',lw:7,id:'btn_'+id,k});X.restore()}
// ---- ввод: левая половина — джойстик, правая — тап (прыжок), держать (жезл), свайп (пинок) ----
const INP={jx:0,jy:0,hold:false,holdT:0,tapQ:0,swipeQ:0,swipeDir:0,last:0,used:{}};
const PTR=new Map();let JOY=null;// {id,x0,y0,x,y}
let RT=null;// {id,x0,y0,t0,moved,holding}
let INPMODE='ui';// 'ui' — только кнопки; 'play' — джойстик и жесты
function toD(e){return[(e.clientX-VVX-OX)/S,(e.clientY-VVY-OY)/S]}
C.addEventListener('pointerdown',e=>{if(PORTRAIT())return;e.preventDefault();ac();const[x,y]=toD(e);PX=x;PY=y;
 let best=null,bd=1e9;for(let i=UI.length-1;i>=0;i--){const b=UI[i];const dx=Math.abs(x-b.x),dy=Math.abs(y-b.y);if(dx<b.w/2+6&&dy<b.h/2+6){const d=Math.hypot(dx,dy);if(d<bd){bd=d;best=b}}}
 if(best){SFX.click();best.fn();return}
 if(TALK&&TALK.box){const[bx,by,bw,bh]=TALK.box;if(x>bx&&x<bx+bw&&y>by&&y<by+bh){skipTalk();return}}
 if(SCN&&SCN.tap&&INPMODE==='ui'){SCN.tap(x,y);return}
 if(INPMODE!=='play')return;INP.last=T;
 const mid=vis().x0+vis().w*.45;
 if(x<mid&&!JOY){JOY={id:e.pointerId,x0:x,y0:y,x,y}}
 else if(!RT){RT={id:e.pointerId,x0:x,y0:y,t0:T,moved:false,holding:false}}},{passive:false});
C.addEventListener('pointermove',e=>{const[x,y]=toD(e);PX=x;PY=y;if(JOY&&JOY.id===e.pointerId){JOY.x=x;JOY.y=y;INP.last=T}
 if(RT&&RT.id===e.pointerId){const dx=x-RT.x0,dy=y-RT.y0;if(!RT.holding&&!RT.moved&&Math.hypot(dx,dy)>46&&T-RT.t0<.45){RT.moved=true;INP.swipeQ=T;INP.swipeDir=Math.atan2(dx,-dy);INP.used.swipe=1;INP.last=T}}});
const _up=e=>{if(JOY&&JOY.id===e.pointerId)JOY=null;if(RT&&RT.id===e.pointerId){if(!RT.moved&&!RT.holding&&T-RT.t0<.3){INP.tapQ=T;INP.used.tap=1}RT=null}};
C.addEventListener('pointerup',_up);C.addEventListener('pointercancel',_up);
['dblclick','contextmenu','gesturestart','gesturechange'].forEach(ev=>document.addEventListener(ev,e=>e.preventDefault(),{passive:false}));
document.addEventListener('touchmove',e=>e.preventDefault(),{passive:false});
const KEYS={};addEventListener('keydown',e=>{if(!KEYS[e.code]){if(e.code==='Space'){INP.tapQ=T;INP.used.tap=1}if(e.code==='KeyF'||e.code==='Enter'){INP.swipeQ=T;INP.used.swipe=1}}KEYS[e.code]=1;INP.last=T});addEventListener('keyup',e=>{KEYS[e.code]=0});
const BOT={on:false,jx:0,jy:0,hold:false};// автопилот теста пишет сюда
function stepInput(){let jx=0,jy=0;
 if(JOY){const dx=JOY.x-JOY.x0,dy=JOY.y-JOY.y0,R=90,d=Math.hypot(dx,dy);if(d>R){JOY.x0=JOY.x-dx/d*R;JOY.y0=JOY.y-dy/d*R}const k=Math.min(d,R)/R;if(d>8){jx=dx/d*k;jy=-dy/d*k}}
 if(KEYS.KeyA||KEYS.ArrowLeft)jx-=1;if(KEYS.KeyD||KEYS.ArrowRight)jx+=1;if(KEYS.KeyW||KEYS.ArrowUp)jy+=1;if(KEYS.KeyS||KEYS.ArrowDown)jy-=1;
 if(BOT.on){jx=BOT.jx;jy=BOT.jy}
 const m=Math.hypot(jx,jy);if(m>1){jx/=m;jy/=m}INP.jx=jx;INP.jy=jy;if(m>.1){INP.used.move=1;INP.last=T}
 if(RT&&!RT.moved&&!RT.holding&&T-RT.t0>.28)RT.holding=true;
 const h=!!(RT&&RT.holding)||!!KEYS.KeyE||!!KEYS.ShiftLeft||(BOT.on&&BOT.hold);if(h&&!INP.hold)INP.holdT=T;if(h){INP.used.hold=1;INP.last=T}INP.hold=h;
 if(INPMODE!=='play'){INP.jx=INP.jy=0;INP.hold=false}}
function takeTap(){if(INP.tapQ&&T-INP.tapQ<.25){INP.tapQ=0;return true}return false}
function takeSwipe(){if(INP.swipeQ&&T-INP.swipeQ<.3){INP.swipeQ=0;return true}return false}
// ---- рука-подсказка: показывает жест при первом использовании и снова после 5 с простоя ----
const HINT={g:null,shownT:-99,t0:0};
function needGesture(g){HINT.g=g;HINT.t0=T;HINT.shownT=T;INP.last=T}
function clearGesture(){HINT.g=null}
// джойстик: под пальцем — круг и ручка; без пальца — бледная подсказка слева внизу
function drawJoy(){if(INPMODE!=='play'||!(SCN&&SCN.world))return;X.save();
 let bx,by,kx,ky,a;if(JOY){bx=JOY.x0;by=JOY.y0;const dx=JOY.x-bx,dy=JOY.y-by,d=Math.hypot(dx,dy),k=Math.min(d,90)/(d||1);kx=bx+dx*k;ky=by+dy*k;a=.55}else{bx=safeL()+110;by=safeB()-100;kx=bx+(BOT.on?INP.jx*60:0);ky=by-(BOT.on?INP.jy*60:0);a=.28}
 X.globalAlpha=a;X.fillStyle='#ffffff';X.beginPath();X.arc(bx,by,92,0,7);X.fill();X.lineWidth=6;X.strokeStyle='#4a1f8a';X.stroke();
 X.globalAlpha=Math.min(1,a+.3);X.fillStyle='#ffd23a';X.beginPath();X.arc(kx,ky,40,0,7);X.fill();X.lineWidth=5;X.strokeStyle='#7a4a00';X.stroke();X.restore()}
function drawHand(){if(!HINT.g||INPMODE!=='play')return;const idle=T-INP.last;let ph=-1;
 if(T-HINT.shownT<3.2)ph=(T-HINT.shownT);else if(idle>5){ph=(idle-5)%4.5;if(ph>3.2)ph=-1}
 if(ph<0)return;const v=vis();const g=HINT.g;const lx=safeL()+190,ly=safeB()-150,rx=safeR()-210,ry=safeB()-170;
 let hx,hy,press=false,a=Math.min(1,ph*3,(3.2-ph)*3);X.save();X.globalAlpha=a;
 if(g==='move'){const u=ph*2.2;hx=lx+Math.sin(u)*70;hy=ly-Math.abs(Math.cos(u))*60;press=true;ring(lx,ly,95,'rgba(255,255,255,.35)');}
 else if(g==='tap'){hx=rx;hy=ry;press=(ph%1)<.25;if(press)ring(rx,ry,40+((ph%1)*200),'rgba(255,240,120,.8)')}
 else if(g==='hold'){hx=rx;hy=ry;press=ph>.4;if(press){const k=Math.min(1,(ph-.4)/1.2);X.lineWidth=10;X.strokeStyle='rgba(255,220,60,.95)';X.beginPath();X.arc(rx,ry,62,-Math.PI/2,-Math.PI/2+k*6.283);X.stroke()}}
 else if(g==='swipe'){const u=(ph%1.1)/1.1;hx=rx-90+u*200;hy=ry+30-u*90;press=u<.7;X.strokeStyle='rgba(255,255,255,.75)';X.lineWidth=12;X.lineCap='round';X.beginPath();X.moveTo(rx-90,ry+30);X.lineTo(hx,hy);X.stroke()}
 drawHandShape(hx,hy,press);X.restore()}
function ring(x,y,r,c){X.strokeStyle=c;X.lineWidth=8;X.beginPath();X.arc(x,y,r,0,7);X.stroke()}
function drawHandShape(x,y,press){X.save();X.translate(x,y+(press?8:0));X.scale(1.25,1.25);X.lineJoin='round';X.lineWidth=6;X.strokeStyle='#3a2410';X.fillStyle='#ffe3c6';
 X.beginPath();rr(-12,-2,24,60,12);X.fill();X.stroke();// палец
 X.beginPath();rr(-26,36,62,60,22);X.fill();X.stroke();X.beginPath();rr(10,32,18,30,9);X.fill();X.stroke();X.beginPath();rr(24,40,18,30,9);X.fill();X.stroke();
 X.fillStyle='rgba(255,255,255,.7)';X.beginPath();X.ellipse(-4,8,4,8,0,0,7);X.fill();X.restore()}
// ---- облачко речи (субтитр) ----
function drawTalk(){if(!TALK)return;const v=vis();const nm=NAMES[TALK.who];const mx=Math.min(1100,v.w-240);let bw=Math.min(960,mx),bh=nm?166:140;
 for(let k=0;k<10;k++){const f=fitText(TALK.text,bw-60,bh-(nm?58:30),46,BODY,38);if(f.L.length*f.lh<=bh-(nm?58:30)&&f.L.every(l=>X.measureText(l).width<=bw-60))break;if(bw<mx)bw=Math.min(mx,bw+60);else bh+=20}
 const bx=clamp(640,safeL()+130+bw/2,safeR()-bw/2),top=safeT()+(SCN&&SCN.cut?0:0);const x0=bx-bw/2;
 panel(x0,top,bw,bh,{st:SPKC[TALK.who]||'#6a4bb8',lw:6});
 if(nm){txt(nm,x0+28,top+30,38,'#fff',{f:FONT,al:'left',st:SPKC[TALK.who],lw:8,id:'name',box:[x0,top,x0+bw,top+bh]})}
 textIn(TALK.text,bx,top+(nm?bh/2+18:bh/2),bw-60,bh-(nm?58:30),46,'#2b2440',{f:BODY,st:0,id:'talk',min:38});TALK.box=[x0,top,bw,bh];
 // полоска: реплика ещё звучит
 if(TALK.a&&TALK.a.duration){const p=clamp(TALK.a.currentTime/TALK.a.duration,0,1);X.fillStyle='rgba(106,75,184,.25)';rr(x0+20,top+bh-12,bw-40,6,3);X.fill();X.fillStyle=SPKC[TALK.who];rr(x0+20,top+bh-12,(bw-40)*p,6,3);X.fill()}}
// ---- табличка задания и большие цифры ----
let GOAL='';let BIG=null;// {n,t0,col}
function bigNum(n,col){BIG={n:String(n),t0:T,col:col||'#ffd84a'}}
function drawGoal(){if(!GOAL||TALK)return;const v=vis();const bw=Math.min(1000,v.w-300);const f=fitText(GOAL,bw-50,2*52*1.14,52,NUM,44);const bh=Math.max(86,f.L.length*f.lh+26);const bx=clamp(640,safeL()+118+bw/2,safeR()-118-bw/2);panel(bx-bw/2,safeT(),bw,bh,{fill:'rgba(30,14,78,.96)',st:'#ffe08a',lw:6});
 textIn(GOAL,bx,safeT()+bh/2,bw-50,bh-18,52,'#ffffff',{f:NUM,st:'#0e0428',lw:7,id:'goal',min:44})}
function drawBig(){if(!BIG)return;const u=T-BIG.t0;if(u>1.4){BIG=null;return}const k=u<.2?ease(u/.2)*1.15:1.15-Math.min(.15,(u-.2));const v=vis();X.save();X.globalAlpha=u>1.1?(1.4-u)/.3:1;let cx=v.x0+v.w/2,cy=v.y0+v.h*.42;if(SCN&&SCN.world&&typeof HERO!=='undefined'){const h=toScreen(HERO.x,HERO.y+1,HERO.z);if(h.vis){cx=h.x<v.x0+v.w/2?v.x0+v.w*.7:v.x0+v.w*.3;cy=v.y0+v.h*.46}}X.translate(cx,cy);X.scale(k,k);txt(BIG.n,0,0,180,BIG.col,{f:NUM,st:'#1a0840',lw:26,id:'big'});X.restore()}
// ---- переход между сценами ----
const SC={};let scene='',SCN=null,fade=1;
function go(n,arg){GEN++;stopTalk();GOAL='';BIG=null;HINT.g=null;JOY=null;RT=null;BOT.hold=false;scene=n;SCN=SC[n];fade=1;INPMODE='ui';if(typeof onScene3D==='function')onScene3D(n);SCN.enter&&SCN.enter(arg)}
// ---- кнопки «Дальше» / «Пропустить» во время разговоров ----
function cutButtons(skipFn){if(!TALK)return;const b=safeB();labelBtn('next',safeR()-120,b-48,210,84,'Дальше',()=>skipTalk(),{always:1});if(skipFn)labelBtn('skip',safeR()-120,b-150,210,70,'Пропустить',skipFn,{c1:'#b9a6ff',c2:'#6a4bb8',size:34})}
function hudButtons(){roundBtn('home',safeL()+46,safeT()+46,84,'home',()=>{if(scene==='map')go('title');else go('map')});roundBtn('snd',safeL()+46,safeT()+140,70,'snd',()=>{G.mute=!G.mute;if(G.mute&&TALK&&TALK.a)TALK.a.muted=true})}
// ---- поворот ----
function drawRotate(){const v=vis();X.fillStyle='#2a1a5a';X.fillRect(v.x0,v.y0,v.w,v.h);const cx=v.x0+v.w/2,cy=v.y0+v.h/2;X.save();X.translate(cx,cy-60);X.rotate(-Math.PI/2*ease((T%2.4)/1.2));X.fillStyle='#fff';rr(-60,-100,120,200,20);X.fill();X.fillStyle='#2a1a5a';rr(-48,-80,96,150,8);X.fill();X.restore();
 textIn('Поверни телефон боком',cx,cy+130,v.w*.9,140,64,'#ffe08a',{f:FONT,st:'#120830',lw:8,id:'rot'})}
// ---- главный цикл ----
let last=performance.now(),FPS=60,fpsLog=[];
function loop(now){requestAnimationFrame(loop);DT=clamp((now-last)/1000,0,.05);last=now;if(PORTRAIT()){X.setTransform(DPR,0,0,DPR,0,0);X.clearRect(0,0,W,H);X.setTransform(DPR*S,0,0,DPR*S,DPR*OX,DPR*OY);drawRotate();return}
 T+=DT;FPS=FPS*.95+(1/Math.max(DT,.001))*.05;fpsLog.push(DT);if(fpsLog.length>600)fpsLog.shift();if(typeof adaptPR==='function')adaptPR(DT);
 if(typeof botFrame==='function')botFrame();stepInput();stepTalk();stepWQ();musTick();
 if(typeof frame3D==='function'){try{frame3D(DT)}catch(e){console.error(e)}}
 X.setTransform(DPR,0,0,DPR,0,0);X.clearRect(0,0,W,H);X.setTransform(DPR*S,0,0,DPR*S,DPR*OX,DPR*OY);UI=[];if(G.auditReq){G.auditReq=0;AUD={t:[],scene}}else AUD=null;
 if(SCN&&SCN.draw)SCN.draw();
 if(SCN&&SCN.hud!==false&&scene!=='title')hudButtons();
 drawJoy();drawGoal();drawBig();drawTalk();drawHand();
 if(SCN&&SCN.cut)cutButtons(SCN.skip);
 if(fade>0){fade=Math.max(0,fade-DT*2.5);const v=vis();X.fillStyle=`rgba(20,10,50,${fade})`;X.fillRect(v.x0,v.y0,v.w,v.h)}
 if(AUD)G.lastAudit=AUD}
