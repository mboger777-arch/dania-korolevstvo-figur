// v6.2 Иллюстрированный пролог: 6 картин (Ken Burns), крупный текст + голос; пропуск кнопкой/двойным тапом. Повтор — из книжки правил.
// Герои на картинах — текущие; при замене героев (HEROSET) достаточно перегенерировать assets/prologue/p*.webp.
const PRO=[{k:'pr1',z:[1.0,1.12],p:[[.5,.5],[.45,.42]]},{k:'pr2',z:[1.12,1.0],p:[[.3,.5],[.45,.5]]},{k:'pr3',z:[1.0,1.15],p:[[.5,.55],[.4,.35]]},
 {k:'pr4',z:[1.15,1.02],p:[[.65,.5],[.45,.5]]},{k:'pr5',z:[1.0,1.14],p:[[.5,.5],[.42,.45]]},{k:'pr6',z:[1.1,1.0],p:[[.45,.4],[.5,.5]]}];
const PROIMG=PRO.map((o,i)=>{const im=new Image();im.src=`assets/prologue/p${i+1}.webp?${V}`;return im});
SC.prologue={hud:false,enter(o){this.i=0;this.t0=T;this.a=0;this.ret=o&&o.ret;this.lt=-9;const me=this,g=GEN;
  run(async()=>{for(let i=0;i<PRO.length;i++){me.i=i;me.t0=T;await Promise.all([say(PRO[i].k,{p:3}),wait(QS.has('fast')?.8:3.2)]);await wait(.5)}me.done()})},
 done(){SV.pro=1;save();if(this.ret)go(this.ret);else if(!SV.intro)go('intro');else go('map')},
 tap(){if(T-this.lt<.35)this.done();this.lt=T},
 draw(){const v=vis(),o=PRO[this.i],im=PROIMG[this.i],u=Math.min(1,(T-this.t0)/7),e=u*u*(3-2*u);X.fillStyle='#fff6e4';X.fillRect(v.x0,v.y0,v.w,v.h);
  if(im.complete&&im.naturalWidth){const z=lerp(o.z[0],o.z[1],e),px=lerp(o.p[0][0],o.p[1][0],e),py=lerp(o.p[0][1],o.p[1][1],e);
   const s=Math.max(v.w/im.naturalWidth,v.h/im.naturalHeight)*z,w=im.naturalWidth*s,h=im.naturalHeight*s;const a=Math.min(1,(T-this.t0)*2.5);X.globalAlpha=a;
   X.drawImage(im,v.x0+v.w/2-w*px-(w*.5-w*px)*0,v.y0+v.h/2-h*py,w,h);X.globalAlpha=1}
  // крупный текст + аватар говорящего рисует общий drawTalk() (46px, тап по плашке — следующая картинка)
  for(let j=0;j<PRO.length;j++){X.beginPath();X.arc(v.x0+v.w/2+(j-2.5)*30,safeB()-24,j===this.i?9:6,0,7);X.fillStyle=j===this.i?'#ffb400':'rgba(255,255,255,.8)';X.fill()}
  labelBtn('skip',safeR()-120,safeB()-50,210,70,'Пропустить',()=>this.done(),{c1:'#b9a6ff',c2:'#6a4bd0'})}};
