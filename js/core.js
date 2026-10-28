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
for(const n of ['parch','glass','wood','btn_o','btn_p','btn_g','ribbon','ribbon_p','rotate','book','medal'])img('u_'+n,'assets/ui/'+n+'.webp');
// ---- нарисованная UI-графика: нарезка (cs/rs — [ширина в исходнике, 1=не тянуть]) ----
const USL={parch:{c:[[220,1],[140,0],[304,1],[140,0],[220,1]],r:[[150,1],[248,0],[150,1]],ex:108,ey:62,c0:'#f3e3bd'},glass:{c:[[240,1],[222,0],[100,1],[222,0],[240,1]],r:[[150,1],[173,0],[150,1]],ex:92,ey:92,c0:'#2a1a7a'},
 wood:{c:[[210,1],[180,0],[244,1],[180,0],[210,1]],r:[[220,1],[60,0],[189,1],[60,0],[220,1]],ex:118,ey:118,c0:'#d8b080'},btn:{c:[[109,1],[142,0],[109,1]],r:[[218,1]]},ribbon:{c:[[235,1],[554,0],[235,1]],r:[[284,1]]}};
function slices(arr,tot,sc){let fs=0,ss=0;for(const[a,f]of arr)f?fs+=a*sc:ss+=a;const k=fs>tot?tot/fs:1,rem=Math.max(0,tot-fs*k);return arr.map(([a,f])=>f?a*sc*k:ss?a/ss*rem:0)}
function sliceDraw(im,sp,x,y,w,h,sc){const cw=slices(sp.c,w,sc),rh=slices(sp.r,h,sc);let sy=0,dy=y;for(let j=0;j<sp.r.length;j++){let sx=0,dx=x;const H=sp.r[j][0];for(let i=0;i<sp.c.length;i++){const W=sp.c[i][0];if(cw[i]>.5&&rh[j]>.5)X.drawImage(im,sx,sy,W,H,dx,dy,cw[i]+.6,rh[j]+.6);sx+=W;dx+=cw[i]}sy+=H;dy+=rh[j]}}
function uiPanel(n,x,y,w,h,shadow){const im=IM['u_'+n];if(!okI(im))return false;const sp=USL[n];const sc=Math.min(.62,h*.44/sp.r[0][0],w*.3/sp.c[0][0]);const ex=sp.ex*sc,ey=sp.ey*sc;
 if(shadow!==false){X.save();X.shadowColor='rgba(20,10,50,.5)';X.shadowBlur=22;X.shadowOffsetY=9;rr(x+6,y+6,w-12,h-12,18);X.fillStyle=sp.c0;X.fill();X.restore()}
 sliceDraw(im,sp,x-ex,y-ey,w+ex*2,h+ey*2,sc);return true}
function popSpark(id,x,y,w,h){const p=POPS.get(id);if(!p)return;const u=T-p.t0;if(u>.9)return;for(let i=0;i<14;i++){const a=i/14*6.283+i*.7,t=u/.9,px=x+w/2+Math.cos(a)*(w/2+10+t*40),py=y+h/2+Math.sin(a)*(h/2+8+t*30);X.save();X.globalAlpha=(1-t)*.95;X.translate(px,py);X.rotate(t*3+i);X.fillStyle=i%3?'#fff3a0':'#ffffff';X.beginPath();for(let k=0;k<8;k++){const r=k%2?2.5:9*(1-t*.5);X.lineTo(Math.cos(k/8*6.283)*r,Math.sin(k/8*6.283)*r)}X.fill();X.restore()}}
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
// ---- сказочные панели: пергамент + золотая рамка + фигурки-самоцветы по углам; тёмная «волшебное стекло» ----
let PARCH=null;function parchPat(){if(PARCH)return PARCH;const c=document.createElement('canvas');c.width=c.height=160;const g=c.getContext('2d');g.fillStyle='#fbf1d8';g.fillRect(0,0,160,160);
 let sd=7;const r=()=>(sd=(sd*16807)%2147483647)/2147483647;for(let i=0;i<900;i++){g.fillStyle=`rgba(${150+r()*60|0},${110+r()*50|0},${60+r()*30|0},${r()*.06})`;g.fillRect(r()*160,r()*160,1+r()*3,1+r()*2)}
 for(let i=0;i<40;i++){g.strokeStyle=`rgba(170,130,70,${.04+r()*.05})`;g.lineWidth=1;g.beginPath();const x=r()*160,y=r()*160;g.moveTo(x,y);g.quadraticCurveTo(x+r()*30,y+r()*10-5,x+20+r()*40,y+r()*14-7);g.stroke()}
 PARCH=X.createPattern(c,'repeat');return PARCH}
function gemShape(k,x,y,r,col){X.save();X.translate(x,y);X.beginPath();if(k===0)X.arc(0,0,r,0,7);else if(k===1){X.moveTo(0,-r*1.1);X.lineTo(r*1.05,r*.75);X.lineTo(-r*1.05,r*.75);X.closePath()}else if(k===2){X.rect(-r*.85,-r*.85,r*1.7,r*1.7)}else{for(let i=0;i<10;i++){const a=i/10*6.283-Math.PI/2,q=i%2?r*.5:r*1.15;X.lineTo(Math.cos(a)*q,Math.sin(a)*q)}X.closePath()}
 const g=X.createRadialGradient(-r*.3,-r*.4,r*.1,0,0,r*1.2);g.addColorStop(0,'#ffffff');g.addColorStop(.35,col);g.addColorStop(1,col);X.fillStyle=g;X.fill();X.lineWidth=Math.max(2,r*.28);X.strokeStyle='#fff6d6';X.stroke();X.restore()}
const GEMC=['#ff5a7a','#3fbf63','#3d8fe8','#ffb52e'];
function panel(x,y,w,h,o){o=o||{};const r=o.r||22,dark=o.fill&&/^rgba\((?:[0-9]{1,2}),/.test(o.fill),st=o.st||'#6a4bb8',fw=Math.max(5,(o.lw||5)*1.15);X.save();
 if(!o.plain&&!o.proc&&w>=90&&h>=44&&uiPanel(dark?'glass':'parch',x,y,w,h)){X.restore();return}
 X.shadowColor='rgba(20,10,50,.45)';X.shadowBlur=18;X.shadowOffsetY=7;rr(x-fw,y-fw,w+fw*2,h+fw*2,r+fw);
 const gg=X.createLinearGradient(0,y-fw,0,y+h+fw);if(dark){gg.addColorStop(0,'#fff0b0');gg.addColorStop(.5,'#e0a63a');gg.addColorStop(1,'#9a5a12')}else{gg.addColorStop(0,'#ffe9a0');gg.addColorStop(.45,'#e2a640');gg.addColorStop(1,'#a8641a')}X.fillStyle=gg;X.fill();X.shadowColor='transparent';
 rr(x,y,w,h,r);if(dark){const g=X.createLinearGradient(0,y,0,y+h);g.addColorStop(0,'#3a2296');g.addColorStop(1,'#1a0c4e');X.fillStyle=g;X.fill();X.save();X.clip();X.fillStyle='rgba(255,255,255,.10)';X.beginPath();X.ellipse(x+w*.5,y-h*.15,w*.62,h*.55,0,0,7);X.fill();
  for(let i=0;i<9;i++){const sx=x+((i*97.3+T*14)%w),sy=y+((i*53.1)%h),a=.25+.25*Math.sin(T*3+i);X.fillStyle=`rgba(255,240,180,${a})`;X.beginPath();X.arc(sx,sy,1.6+(i%3),0,7);X.fill()}X.restore()}
 else{X.fillStyle=parchPat();X.fill();const g=X.createRadialGradient(x+w/2,y+h/2,Math.min(w,h)*.2,x+w/2,y+h/2,Math.max(w,h)*.7);g.addColorStop(0,'rgba(255,255,250,.55)');g.addColorStop(1,'rgba(214,170,100,.28)');X.fillStyle=g;X.fill()}
 rr(x+5,y+5,w-10,h-10,Math.max(4,r-5));X.lineWidth=2.5;X.strokeStyle=dark?'rgba(255,224,138,.55)':st;X.globalAlpha=dark?1:.7;X.setLineDash([10,6]);X.stroke();X.setLineDash([]);X.globalAlpha=1;
 if(!o.plain&&w>150&&h>70){const q=Math.min(13,h*.12);[[x+2,y+2],[x+w-2,y+2],[x+w-2,y+h-2],[x+2,y+h-2]].forEach(([cx,cy],k)=>gemShape(k,cx,cy,q,GEMC[k]))}
 X.restore()}
// ---- ленточка-заголовок, резная рамка доски, лучи, звезда ----
function ribbon(t,cx,cy,w,col,sz){col=col||'#d23a6a';const h=(sz||40)*1.45;{const pu=/^#6a4bb8|^#7a5bd8|^#4a2f9a/i.test(col)||(parseInt(col.slice(1,3),16)<0x90&&parseInt(col.slice(5,7),16)>0x90),im=IM[pu?'u_ribbon_p':'u_ribbon'];if(okI(im)){const H=h*1.55,sc=H/284;X.save();X.shadowColor='rgba(20,10,50,.35)';X.shadowBlur=10;X.shadowOffsetY=5;sliceDraw(im,USL.ribbon,cx-w/2-150*sc,cy-H*.42,w+300*sc,H,sc);X.restore();textIn(t,cx,cy-H*.07,w-20,h-8,sz||40,'#fff',{f:FONT,st:pu?'#2a1260':'#7a1030',lw:6,id:'rb'+t});return}}X.save();X.shadowColor='rgba(20,10,50,.35)';X.shadowBlur=8;X.shadowOffsetY=4;
 const dk=shade(col,-.35);X.fillStyle=dk;[-1,1].forEach(sg=>{X.beginPath();X.moveTo(cx+sg*(w/2-14),cy-h*.3);X.lineTo(cx+sg*(w/2+34),cy-h*.3);X.lineTo(cx+sg*(w/2+18),cy+h*.12);X.lineTo(cx+sg*(w/2+34),cy+h*.55);X.lineTo(cx+sg*(w/2-14),cy+h*.55);X.closePath();X.fill()});
 const g=X.createLinearGradient(0,cy-h/2,0,cy+h/2);g.addColorStop(0,shade(col,.25));g.addColorStop(1,col);X.fillStyle=g;X.beginPath();X.moveTo(cx-w/2,cy-h/2);X.quadraticCurveTo(cx,cy-h/2-10,cx+w/2,cy-h/2);X.lineTo(cx+w/2,cy+h/2);X.quadraticCurveTo(cx,cy+h/2-10,cx-w/2,cy+h/2);X.closePath();X.fill();X.shadowColor='transparent';
 X.lineWidth=2;X.strokeStyle='rgba(255,240,200,.8)';X.setLineDash([6,5]);X.beginPath();X.moveTo(cx-w/2+8,cy-h/2+7);X.quadraticCurveTo(cx,cy-h/2-3,cx+w/2-8,cy-h/2+7);X.moveTo(cx-w/2+8,cy+h/2-7);X.quadraticCurveTo(cx,cy+h/2-17,cx+w/2-8,cy+h/2-7);X.stroke();X.setLineDash([]);X.restore();
 textIn(t,cx,cy-3,w-30,h-12,sz||40,'#fff',{f:FONT,st:dk,lw:6,id:'rb'+t})}
function shade(c,k){const n=parseInt(c.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const f=v=>Math.max(0,Math.min(255,Math.round(k>0?v+(255-v)*k:v*(1+k))));return `rgb(${f(r)},${f(g)},${f(b)})`}
function woodFrame(x,y,w,h){if(uiPanel('wood',x,y,w,h))return;X.save();X.shadowColor='rgba(0,0,0,.45)';X.shadowBlur=18;X.shadowOffsetY=6;rr(x-22,y-22,w+44,h+44,30);const g=X.createLinearGradient(0,y-22,0,y+h+22);g.addColorStop(0,'#c98c48');g.addColorStop(.5,'#9a5e28');g.addColorStop(1,'#6e3c14');X.fillStyle=g;X.fill();X.shadowColor='transparent';
 X.save();X.clip();X.strokeStyle='rgba(60,30,8,.25)';X.lineWidth=1.5;for(let i=0;i<14;i++){X.beginPath();const yy=y-22+i*(h+44)/14;X.moveTo(x-22,yy);X.bezierCurveTo(x+w*.3,yy+6,x+w*.6,yy-6,x+w+22,yy+3);X.stroke()}X.restore();
 rr(x-8,y-8,w+16,h+16,20);X.lineWidth=5;const gg=X.createLinearGradient(0,y,0,y+h);gg.addColorStop(0,'#fff0a8');gg.addColorStop(1,'#c88a2a');X.strokeStyle=gg;X.stroke();
 [[x-11,y-11],[x+w+11,y-11],[x+w+11,y+h+11],[x-11,y+h+11]].forEach(([cx,cy],k)=>gemShape(k,cx,cy,11,GEMC[k]));X.restore()}
function rays(cx,cy,R,col,a){X.save();X.translate(cx,cy);X.rotate(T*.25);X.globalAlpha=a==null?.35:a;const g=X.createRadialGradient(0,0,0,0,0,R);g.addColorStop(0,col||'#fff3b0');g.addColorStop(1,'rgba(255,243,176,0)');X.fillStyle=g;for(let i=0;i<14;i++){X.beginPath();X.moveTo(0,0);X.arc(0,0,R,i/14*6.283,(i+.45)/14*6.283);X.closePath();X.fill()}X.restore()}
function starG(x,y,r,on){X.save();X.translate(x,y);X.beginPath();for(let i=0;i<10;i++){const a=i/10*6.283-Math.PI/2,q=i%2?r*.48:r;X.lineTo(Math.cos(a)*q,Math.sin(a)*q)}X.closePath();X.shadowColor='rgba(120,60,0,.5)';X.shadowBlur=12;
 const g=X.createRadialGradient(-r*.2,-r*.3,r*.05,0,0,r);if(on!==false){g.addColorStop(0,'#fffbe0');g.addColorStop(.45,'#ffd84a');g.addColorStop(1,'#f0a010')}else{g.addColorStop(0,'#eee');g.addColorStop(1,'#a8a0b8')}X.fillStyle=g;X.fill();X.shadowColor='transparent';X.lineJoin='round';X.lineWidth=r*.1;X.strokeStyle=on!==false?'#a85a00':'#6a6080';X.stroke();
 X.fillStyle='rgba(255,255,255,.55)';X.beginPath();X.ellipse(-r*.18,-r*.3,r*.16,r*.09,-.6,0,7);X.fill();X.restore()}
// ---- всплывание окон: popK(ключ) — пружинка 0→1, ключ сбрасывается, если окно не рисовали 0.3 с ----
const POPS=new Map();function popK(id){let p=POPS.get(id);if(!p||T-p.l>.3){p={t0:T,l:T};POPS.set(id,p)}p.l=T;const u=Math.min(1,(T-p.t0)/.38),v=u-1;return .55+.45*(1+2.70158*v*v*v+1.70158*v*v)}
function popAt(id,cx,cy){const k=popK(id);X.translate(cx,cy);X.scale(k,k);X.translate(-cx,-cy);return k}
// ---- кнопки (хит-зона >= 56 css px) ----
let UI=[];let PX=-99,PY=-99;
function hitBtn(id,x,y,w,h,fn,o){o=o||{};UI.push({id,x,y,w:Math.max(w,64/S),h:Math.max(h,64/S),fn,always:o.always})}
function roundBtn(id,x,y,d,icon,fn,o){o=o||{};hitBtn(id,x,y,d,d,fn,o);const k=1+(o.pulse?Math.sin(T*5)*.05:0);X.save();X.translate(x,y);X.scale(k,k);
 const r=d/2,g=X.createRadialGradient(0,-r*.35,r*.1,0,0,r);g.addColorStop(0,o.c1||'#ffd86b');g.addColorStop(1,o.c2||'#f08a1c');X.shadowColor=o.pulse?'rgba(255,230,120,.9)':'rgba(20,10,50,.35)';X.shadowBlur=o.pulse?18+8*Math.sin(T*5):8;X.shadowOffsetY=o.pulse?0:3;X.beginPath();X.arc(0,0,r+d*.06,0,7);X.fillStyle='#c8862a';X.fill();X.shadowColor='transparent';X.fillStyle=g;X.beginPath();X.arc(0,0,r,0,7);X.fill();X.lineWidth=d*.05;X.strokeStyle='#fff8e6';X.stroke();X.fillStyle='rgba(255,255,255,.35)';X.beginPath();X.ellipse(0,-r*.45,r*.62,r*.3,0,0,7);X.fill();
 X.strokeStyle='#5a2a08';X.fillStyle='#5a2a08';X.lineWidth=d*.09;X.lineCap='round';X.lineJoin='round';ICON[icon]&&ICON[icon](r*.55);X.restore()}
const ICON={home(s){X.beginPath();X.moveTo(-s,0);X.lineTo(0,-s);X.lineTo(s,0);X.moveTo(-s*.7,-s*.2);X.lineTo(-s*.7,s*.9);X.lineTo(s*.7,s*.9);X.lineTo(s*.7,-s*.2);X.stroke()},
 snd(s){X.beginPath();X.moveTo(-s,-s*.35);X.lineTo(-s*.45,-s*.35);X.lineTo(s*.1,-s*.85);X.lineTo(s*.1,s*.85);X.lineTo(-s*.45,s*.35);X.lineTo(-s,s*.35);X.closePath();X.fill();
  if(!G.mute){X.beginPath();X.arc(s*.2,0,s*.55,-.8,.8);X.stroke()}else{X.beginPath();X.moveTo(s*.4,-s*.4);X.lineTo(s,s*.4);X.moveTo(s,-s*.4);X.lineTo(s*.4,s*.4);X.stroke()}},
 play(s){X.beginPath();X.moveTo(-s*.5,-s*.9);X.lineTo(s*.9,0);X.lineTo(-s*.5,s*.9);X.closePath();X.fill()},
 next(s){X.beginPath();X.moveTo(-s*.7,-s*.8);X.lineTo(s*.3,0);X.lineTo(-s*.7,s*.8);X.moveTo(s*.1,-s*.8);X.lineTo(s*1,0);X.lineTo(s*.1,s*.8);X.stroke()},
 skip(s){X.beginPath();X.moveTo(-s,-s*.8);X.lineTo(-s*.1,0);X.lineTo(-s,s*.8);X.moveTo(-s*.1,-s*.8);X.lineTo(s*.8,0);X.lineTo(-s*.1,s*.8);X.stroke();X.beginPath();X.moveTo(s,-s*.8);X.lineTo(s,s*.8);X.stroke()},
 ok(s){X.beginPath();X.moveTo(-s*.85,0);X.lineTo(-s*.2,s*.65);X.lineTo(s*.9,-s*.7);X.stroke()},
 jump(s){X.beginPath();X.moveTo(0,s*.9);X.lineTo(0,-s*.7);X.moveTo(-s*.7,0);X.lineTo(0,-s*.8);X.lineTo(s*.7,0);X.stroke()}};
function labelBtn(id,x,y,w,h,label,fn,o){o=o||{};hitBtn(id,x,y,w,h,fn,o);const k=1+(o.pulse?Math.sin(T*4)*.03:0);X.save();X.translate(x,y);X.scale(k,k);
 {const bn=o.green?'btn_g':/6a4bb8|4a2f9a/i.test(o.c2||'')?'btn_p':'btn_o',im=IM['u_'+bn];if(okI(im)){const H=h*1.32,sc=H/218;if(o.pulse){X.shadowColor='rgba(255,230,120,.9)';X.shadowBlur=22+8*Math.sin(T*4)}sliceDraw(im,USL.btn,-w/2-H*.12,-H/2+h*.04,w+H*.24,H,sc);X.shadowColor='transparent';
  const icn=o.icon||{'Дальше':'next','Пропустить':'skip','Готово':'ok'}[label];let tx=0,tw=w*.84;if(icn&&ICON[icn]){const ir=h*.3,ix=-w/2+h*.42;X.save();X.translate(ix,0);X.beginPath();X.arc(0,0,ir,0,7);X.fillStyle='rgba(255,255,255,.92)';X.fill();X.strokeStyle=bn==='btn_p'?'#3a1a7a':'#8a3a00';X.fillStyle=X.strokeStyle;X.lineWidth=ir*.24;X.lineCap='round';X.lineJoin='round';ICON[icn](ir*.55);X.restore();tx=h*.3;tw=w-h*.95}
  X.restore();X.save();X.translate(x,y);X.scale(k,k);textIn(label,tx,1,tw,h*.66,o.size||44,'#fff',{f:FONT,st:bn==='btn_p'?'#2a1060':bn==='btn_g'?'#1a4a10':'#6a2a00',lw:7,id:'btn_'+id,k});X.restore();return}}
 X.shadowColor=o.pulse?'rgba(255,230,120,.85)':'rgba(20,10,50,.4)';X.shadowBlur=o.pulse?20+8*Math.sin(T*4):12;X.shadowOffsetY=o.pulse?0:5;rr(-w/2-5,-h/2-5,w+10,h+10,h*.45+5);const gr=X.createLinearGradient(0,-h/2,0,h/2);gr.addColorStop(0,'#fff0a8');gr.addColorStop(1,'#a8641a');X.fillStyle=gr;X.fill();X.shadowColor='transparent';rr(-w/2,-h/2,w,h,h*.45);const g=X.createLinearGradient(0,-h/2,0,h/2);g.addColorStop(0,o.c1||'#ffcf4d');g.addColorStop(1,o.c2||'#f0771c');X.fillStyle=g;X.fill();X.lineWidth=3;X.strokeStyle='#fff6dc';X.stroke();X.save();X.clip();X.fillStyle='rgba(255,255,255,.28)';X.beginPath();X.ellipse(0,-h*.42,w*.48,h*.32,0,0,7);X.fill();const sx=((T*.45)%2.2-.6)*w;X.fillStyle='rgba(255,255,255,.22)';X.beginPath();X.moveTo(sx-w*.05,-h/2);X.lineTo(sx+w*.05,-h/2);X.lineTo(sx-w*.05,h/2);X.lineTo(sx-w*.15,h/2);X.fill();X.restore();X.restore();
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
 if(typeof ACTPTR!=='undefined'&&ACTPTR.down(x,y,e.pointerId))return;
 if(TALK&&TALK.box){const[bx,by,bw,bh]=TALK.box;if(x>bx&&x<bx+bw&&y>by&&y<by+bh){skipTalk();return}}
 if(SCN&&SCN.tap&&INPMODE==='ui'){SCN.tap(x,y);return}
 if(INPMODE!=='play')return;INP.last=T;
 const mid=vis().x0+vis().w*.45;
 if(x<mid&&!JOY){JOY={id:e.pointerId,x0:x,y0:y,x,y}}
 else if(!RT){RT={id:e.pointerId,x0:x,y0:y,t0:T,moved:false,holding:false}}},{passive:false});
C.addEventListener('pointermove',e=>{const[x,y]=toD(e);PX=x;PY=y;if(typeof ACTPTR!=='undefined')ACTPTR.move(x,y,e.pointerId);if(JOY&&JOY.id===e.pointerId){JOY.x=x;JOY.y=y;INP.last=T}
 if(RT&&RT.id===e.pointerId){const dx=x-RT.x0,dy=y-RT.y0;if(!RT.holding&&!RT.moved&&Math.hypot(dx,dy)>46&&T-RT.t0<.45){RT.moved=true;INP.swipeQ=T;INP.swipeDir=Math.atan2(dx,-dy);INP.used.swipe=1;INP.last=T}}});
const _up=e=>{if(typeof ACTPTR!=='undefined')ACTPTR.up(e.pointerId);if(JOY&&JOY.id===e.pointerId)JOY=null;if(RT&&RT.id===e.pointerId){if(!RT.moved&&!RT.holding&&T-RT.t0<.3){INP.tapQ=T;INP.used.tap=1}RT=null}};
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
const AVC={};// портрет говорящего — круглая вырезка головы из атласа героя
function avatar(who,cx,cy,R,col){const n=who==='narr'?null:who,X2=X;X2.save();X2.shadowColor='rgba(20,10,50,.4)';X2.shadowBlur=10;X2.shadowOffsetY=4;X2.beginPath();X2.arc(cx,cy,R+R*.17,0,7);const g=X2.createLinearGradient(0,cy-R,0,cy+R);g.addColorStop(0,'#fff6c0');g.addColorStop(.45,'#e8b040');g.addColorStop(1,'#9a5a10');X2.fillStyle=g;X2.fill();X2.shadowColor='transparent';X2.shadowOffsetY=0;for(let i=0;i<12;i++){const a=i/12*6.283;X2.beginPath();X2.arc(cx+Math.cos(a)*(R+R*.085),cy+Math.sin(a)*(R+R*.085),R*.035,0,7);X2.fillStyle=i%3?'#fff4b8':'#ff5a7a';X2.fill()}
 X2.beginPath();X2.arc(cx,cy,R,0,7);const bg=X2.createRadialGradient(cx,cy-R*.3,R*.1,cx,cy,R);bg.addColorStop(0,'#ffffff');bg.addColorStop(1,col);X2.fillStyle=bg;X2.fill();
 const im=n&&typeof HTEX!=='undefined'&&HTEX[n]&&HTEX[n].image;if(im&&im.width){const f=HMETA[n].f.st_f;const sq=n==='krug'?Math.max(f[2],f[3])*.92:Math.min(f[2]*1.02,f[3]*.4);const sx=f[0]+f[4]-sq/2,sy=f[1]+(n==='krug'?f[3]*.04:f[3]*.005);
  X2.save();X2.beginPath();X2.arc(cx,cy,R-2,0,7);X2.clip();X2.drawImage(im,sx,sy,sq,sq,cx-R,cy-R*(n==='krug'?1:.92),R*2,R*2);X2.restore()}
 else{X2.translate(cx,cy);const s=R/40;X2.scale(s,s);X2.fillStyle='#fff8e6';X2.strokeStyle='#6a4bb8';X2.lineWidth=3;rr(-26,-18,24,36,4);X2.fill();X2.stroke();rr(2,-18,24,36,4);X2.fill();X2.stroke();X2.fillStyle='#ffc93a';for(let i=0;i<3;i++){const a=T*2+i*2.1;X2.beginPath();X2.arc(Math.cos(a)*30,Math.sin(a)*30-6,3,0,7);X2.fill()}}
 X2.restore();X2.beginPath();X2.arc(cx,cy,R,0,7);X2.lineWidth=4;X2.strokeStyle=col;X2.stroke()}
function drawTalk(){if(!TALK)return;const v=vis();const nm=NAMES[TALK.who];const col=SPKC[TALK.who]||'#6a4bb8';const AV=150;const mx=Math.min(1120,v.w-240);let bw=Math.min(1000,mx),bh=nm?170:158;
 for(let k=0;k<10;k++){const f=fitText(TALK.text,bw-60-AV,bh-(nm?58:30),46,BODY,38);if(f.L.length*f.lh<=bh-(nm?58:30)&&f.L.every(l=>X.measureText(l).width<=bw-60-AV))break;if(bw<mx)bw=Math.min(mx,bw+60);else bh+=20}
 const bx=clamp(640,safeL()+130+bw/2,safeR()-bw/2),top=safeT()+14;const x0=bx-bw/2;X.save();popAt(TALK,bx,top+bh/2);
 panel(x0,top,bw,bh,{st:col,lw:6});
 // хвостик-ленточка с цветом говорящего слева
 X.fillStyle=col;X.globalAlpha=.12;rr(x0+4,top+6,AV,bh-12,22);X.fill();X.globalAlpha=1;
 avatar(TALK.who,x0+4+AV/2,top+bh/2,Math.min(64,bh*.39),col);
 const tx=x0+AV+12,tw=bw-AV-40;
 if(nm){txt(nm,tx+6,top+32,36,'#fff',{f:FONT,al:'left',st:col,lw:8,id:'name',box:[x0,top,x0+bw,top+bh]})}
 textIn(TALK.text,tx+tw/2,top+(nm?bh/2+18:bh/2),tw,bh-(nm?58:30),46,'#2b2440',{f:BODY,st:0,id:'talk',min:38});TALK.box=[x0,top,bw,bh];popSpark(TALK,x0,top,bw,bh);
 if(TALK.a&&TALK.a.duration){const p=clamp(TALK.a.currentTime/TALK.a.duration,0,1);X.fillStyle='rgba(106,75,184,.18)';rr(tx,top+bh-16,tw,7,3.5);X.fill();X.fillStyle=col;rr(tx,top+bh-16,tw*p,7,3.5);X.fill();X.fillStyle='#fff';X.beginPath();X.arc(tx+tw*p,top+bh-12.5,6,0,7);X.fill()}
 X.restore()}
// ---- табличка задания и большие цифры ----
let GOAL='';let BIG=null;// {n,t0,col}
function bigNum(n,col){BIG={n:String(n),t0:T,col:col||'#ffd84a'}}
function drawGoal(){if(!GOAL||TALK)return;const v=vis();const bw=Math.min(1000,v.w-300);const f=fitText(GOAL,bw-110,2*52*1.14,52,NUM,44);const bh=Math.max(86,f.L.length*f.lh+26);const bx=clamp(640,safeL()+118+bw/2,safeR()-118-bw/2),y=safeT()+16;
 X.save();popAt('goal'+GOAL,bx,y+bh/2);panel(bx-bw/2,y,bw,bh,{fill:'rgba(30,14,78,.96)',st:'#ffe08a',lw:6});
 // значок-свиток задания слева
 const ix=bx-bw/2+40,iy=y+bh/2,b=1+.08*Math.sin(T*4);X.save();X.translate(ix,iy);X.scale(b,b);gemShape(3,0,0,20,'#ffc93a');X.restore();
 textIn(GOAL,bx+22,y+bh/2,bw-110,bh-18,52,'#ffffff',{f:NUM,st:'#0e0428',lw:7,id:'goal',min:44});popSpark('goal'+GOAL,bx-bw/2,y,bw,bh);X.restore()}
function drawBig(){if(!BIG)return;const u=T-BIG.t0;if(u>1.4){BIG=null;return}const k=u<.2?ease(u/.2)*1.15:1.15-Math.min(.15,(u-.2));const v=vis();X.save();X.globalAlpha=u>1.1?(1.4-u)/.3:1;let cx=v.x0+v.w/2,cy=v.y0+v.h*.42;if(SCN&&SCN.world&&typeof HERO!=='undefined'){const h=toScreen(HERO.x,HERO.y+1,HERO.z);if(h.vis){cx=h.x<v.x0+v.w/2?v.x0+v.w*.7:v.x0+v.w*.3;cy=v.y0+v.h*.46}}X.translate(cx,cy);X.scale(k,k);txt(BIG.n,0,0,180,BIG.col,{f:NUM,st:'#1a0840',lw:26,id:'big'});X.restore()}
// ---- переход между сценами ----
const SC={};let scene='',SCN=null,fade=1;
function go(n,arg){GEN++;stopTalk();GOAL='';BIG=null;HINT.g=null;JOY=null;RT=null;BOT.hold=false;scene=n;SCN=SC[n];fade=1;INPMODE='ui';if(typeof onScene3D==='function')onScene3D(n);SCN.enter&&SCN.enter(arg)}
// ---- кнопки «Дальше» / «Пропустить» во время разговоров ----
function cutButtons(skipFn){if(!TALK)return;const b=safeB();labelBtn('next',safeR()-120,b-48,210,84,'Дальше',()=>skipTalk(),{always:1});if(skipFn)labelBtn('skip',safeR()-120,b-150,210,70,'Пропустить',skipFn,{c1:'#b9a6ff',c2:'#6a4bb8',size:34})}
function hudButtons(){roundBtn('home',safeL()+46,safeT()+46,84,'home',()=>{if(scene==='map')go('title');else go('map')});roundBtn('snd',safeL()+46,safeT()+140,70,'snd',()=>{G.mute=!G.mute;if(G.mute&&TALK&&TALK.a)TALK.a.muted=true})}
// ---- поворот ----
function drawRotate(){const v=vis();const bg=X.createRadialGradient(v.x0+v.w/2,v.y0+v.h*.4,10,v.x0+v.w/2,v.y0+v.h/2,Math.max(v.w,v.h)*.8);bg.addColorStop(0,'#5a3aa8');bg.addColorStop(1,'#1a0c40');X.fillStyle=bg;X.fillRect(v.x0,v.y0,v.w,v.h);const cx=v.x0+v.w/2,cy=v.y0+v.h/2;
 for(let i=0;i<24;i++){const sx=v.x0+((i*137.5)%v.w),sy=v.y0+((i*71.3)%v.h),a=.3+.3*Math.sin(T*2+i);X.fillStyle=`rgba(255,240,180,${a})`;X.beginPath();X.arc(sx,sy,2+(i%3),0,7);X.fill()}
 if(okI(IM.u_rotate)){T+=DT||.016;const pw=v.w*.94,ph=Math.min(v.h*.82,pw*1.75),ih=Math.min(ph*.6,pw*1.2),iw=ih*386/512;uiPanel('wood',cx-pw/2+40,cy-ph/2+50,pw-80,ph-100);X.save();X.translate(cx,cy-ph*.13);rays(0,0,ih*.55,'#ffe08a',.35);X.rotate(Math.sin(T*2)*.04);X.drawImage(IM.u_rotate,-iw/2,-ih/2,iw,ih);X.restore();
  textIn('Поверни телефон боком!',cx,cy+ph*.3,pw*.74,ph*.2,170,'#ffe08a',{f:FONT,st:'#3a1606',lw:12,id:'rot'});return}
 const pw=Math.min(v.w*.86,560),ph=Math.min(v.h*.8,600);panel(cx-pw/2,cy-ph/2,pw,ph,{fill:'rgba(30,14,78,.96)',lw:6,r:34});
 X.save();X.translate(cx,cy-ph*.12);rays(0,0,150,'#ffe08a',.25);X.rotate(-Math.PI/2*ease(Math.min(1,(T%2.4)/1.2)));X.shadowColor='rgba(0,0,0,.4)';X.shadowBlur=14;const pg=X.createLinearGradient(0,-100,0,100);pg.addColorStop(0,'#ffe9a0');pg.addColorStop(1,'#d8962a');X.fillStyle=pg;rr(-62,-104,124,208,24);X.fill();X.shadowColor='transparent';X.fillStyle='#7ec8ff';rr(-48,-82,96,152,10);X.fill();
 X.fillStyle='#4fbf5a';rr(-48,30,96,40,0);X.fill();X.fillStyle='#ff8a2a';X.beginPath();X.arc(0,8,13,0,7);X.fill();X.fillStyle='#fff';X.beginPath();X.arc(0,86,8,0,7);X.fill();X.restore();
 X.save();X.translate(cx+120,cy-ph*.12);X.strokeStyle='#ffe08a';X.lineWidth=8;X.lineCap='round';X.beginPath();X.arc(-120,0,150,-.5,.1);X.stroke();X.restore();
 textIn('Поверни телефон боком',cx,cy+ph*.3,pw*.85,ph*.3,64,'#ffe08a',{f:FONT,st:'#120830',lw:8,id:'rot'})}
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
