'use strict';
// ===== v6.2 Книжка правил (CONCEPT_v2 E): правило открывается, когда пройдена его глава; тап — Даня/Королева повторяет правило голосом. Здесь же — повтор пролога =====
const RULES=[
 {ch:GARDEN,t:'Точка',d:'Самая маленькая. С неё всё начинается.',k:'gd_dot2',g:'dot'},
 {ch:0,t:'Отрезок',d:'Есть начало и конец — две точки.',k:'c1_k1',g:'seg'},
 {ch:0,t:'Луч',d:'Начало есть, а конца нет.',k:'c1_t2',g:'ray'},
 {ch:0,t:'Прямая',d:'Ни начала, ни конца.',k:'c1_t3',g:'line'},
 {ch:1,t:'Ломаная',d:'Отрезки, соединённые углом. Кусочек — звено.',k:'c2_r',g:'poly'},
 {ch:2,t:'Углы',d:'Прямой — как уголок книжки. Острый уже, тупой шире.',k:'c3_r',g:'ang'},
 {ch:3,t:'Квадрат',d:'Четыре равные стороны и четыре прямых угла.',k:'c4_k3',g:'sq'},
 {ch:4,t:'Стороны и углы',d:'Сторон столько же, сколько углов.',k:'c5_rule',g:'pent'},
 {ch:5,t:'Круг',d:'У круга нет углов — он катится.',k:'c6_ok',g:'circ'},
 {ch:6,t:'Многоугольник',d:'Замкнутая ломаная.',k:'b_k3',g:'hex'}];
let RBOOK=false,RBPG=0;if(!ICON.back)ICON.back=s=>{X.save();X.scale(-1,1);ICON.next(s);X.restore()};if(!ICON.x)ICON.x=s=>{X.beginPath();X.moveTo(-s*.7,-s*.7);X.lineTo(s*.7,s*.7);X.moveTo(s*.7,-s*.7);X.lineTo(-s*.7,s*.7);X.stroke()};
function ruleGlyph(g,cx,cy,r,on){X.save();X.translate(cx,cy);X.lineCap='round';X.lineJoin='round';X.lineWidth=r*.09;X.strokeStyle=on?'#3d6be0':'#b8ab90';X.fillStyle=on?'#ff7a3a':'#c8bca0';
 const P=(x,y)=>[x*r,y*r],dot=(x,y)=>{X.beginPath();X.arc(x*r,y*r,r*.09,0,7);X.fill()},path=(pts,close)=>{X.beginPath();pts.forEach(([x,y],i)=>i?X.lineTo(x*r,y*r):X.moveTo(x*r,y*r));if(close)X.closePath();X.stroke()},arrow=(x,y,a)=>{X.save();X.translate(x*r,y*r);X.rotate(a);path([[-.18,-.14],[0,0],[-.18,.14]].map(([u,v])=>[u,v]));X.restore()};
 const ng=(n,rot)=>Array.from({length:n},(_,i)=>{const a=rot+i/n*6.283;return[Math.cos(a)*.75,Math.sin(a)*.75]});
 switch(g){case'dot':dot(0,0);break;case'seg':path([[-.8,.3],[.8,-.3]]);dot(-.8,.3);dot(.8,-.3);break;case'ray':path([[-.8,.3],[.9,-.34]]);dot(-.8,.3);arrow(.9,-.34,-.36);break;
  case'line':path([[-.95,.35],[.95,-.35]]);arrow(.95,-.35,-.36);arrow(-.95,.35,Math.PI-.36);break;case'poly':{const p=[[-.85,.5],[-.35,-.4],[.1,.35],[.5,-.5],[.85,.2]];path(p);p.forEach(q=>dot(...q));break}
  case'ang':path([[-.7,-.6],[-.7,.5],[.7,.5]]);X.lineWidth=r*.05;X.strokeRect(-.7*r,.3*r,.2*r,.2*r);break;case'sq':path([[-.6,-.6],[.6,-.6],[.6,.6],[-.6,.6]],true);break;
  case'pent':{const p=ng(5,-Math.PI/2);path(p,true);p.forEach(q=>dot(...q));break}case'circ':X.beginPath();X.arc(0,0,.7*r,0,7);X.stroke();break;case'hex':{const p=ng(6,0);path(p,true);p.forEach(q=>dot(...q));break}}
 X.restore()}
function drawRuleBook(){const v=vis();X.fillStyle='rgba(20,10,50,.6)';X.fillRect(v.x0,v.y0,v.w,v.h);UI.length=0;
 const w=Math.min(1180,v.w-60),h=Math.min(640,v.h-40),x=640-w/2,y=v.y0+v.h/2-h/2;panel(x,y,w,h,{fill:'rgba(255,248,230,.98)',st:'#8a5a2a',lw:8,r:28});
 X.fillStyle='rgba(138,90,42,.25)';X.fillRect(639,y+20,3,h-40);ribbon('Книжка правил',640,y+8,520,'#6a4bb8',40);
 const per=4,pages=Math.ceil(RULES.length/per);RBPG=clamp(RBPG,0,pages-1);
 RULES.slice(RBPG*per,RBPG*per+per).forEach((R,j)=>{const on=!!SV.done[R.ch],col=j<2?0:1,row=j%2,cx=x+w*(col?.75:.25),cy=y+h*(row?.68:.32),r=Math.min(70,h*.11);
  ruleGlyph(R.g,cx-w*.15,cy,r,on);txt(on?R.t:'???',cx+w*.05,cy-r*.55,40,on?'#3a1a08':'#a09070',{f:FONT,st:0,id:'rt'+j});
  if(on)textIn(R.d,cx+w*.05,cy+r*.45,w*.27,r*1.2,30,'#4a3020',{f:BODY,st:0,id:'rd'+j});else textIn('Пройди главу, и правило появится!',cx+w*.05,cy+r*.45,w*.27,r*1.2,28,'#a09070',{f:BODY,st:0});
  if(on)hitBtn('rule'+j,cx,cy,w*.46,h*.32,()=>{SFX.click();say(R.k,{p:3})})});
 if(RBPG>0)roundBtn('rbp',x+50,y+h/2,78,'back',()=>{RBPG--;SFX.click()});if(RBPG<pages-1)roundBtn('rbn',x+w-50,y+h/2,78,'next',()=>{RBPG++;SFX.click()});
 labelBtn('rbpro',640,y+h-46,300,70,'Пролог',()=>{RBOOK=false;go('prologue',{ret:'map'})},{icon:'rep',size:34});
 roundBtn('rbx',x+w-36,y+36,70,'x',()=>{RBOOK=false;SFX.click()})}
{const md=SC.map.draw;SC.map.draw=function(){if(RBOOK){md.call(this);drawRuleBook();return}md.call(this);if(!ALBUM)labelBtn('rbook',safeR()-130,safeB()-150,230,80,'Правила',()=>{if(typeof stopTalk==='function')stopTalk();RBOOK=true;RBPG=0},{size:36})}}
