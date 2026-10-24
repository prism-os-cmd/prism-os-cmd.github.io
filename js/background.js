/* Background: gradient reveal, waves, stars, bubbles, sunset */
const canvas = document.getElementById('waves');
const ctx = canvas.getContext('2d');
const bgGradient = document.getElementById('bgGradient');
const SCALE = 0.5;
let waveRGB = '0,91,255';
let revealStart = null;
const REVEAL_MS = 2500;
function getRise(t){ if(revealStart===null) return 0; const p=Math.min((t-revealStart)/REVEAL_MS,1); return (1-Math.cos(Math.PI*p))/2; }
function revealBackground(){ if(revealStart!==null) return; revealStart=performance.now(); bgGradient.classList.add('show'); }
function resizeCanvas(){ canvas.width=Math.round((innerWidth+48)*SCALE); canvas.height=Math.round((innerHeight+48)*SCALE); }
resizeCanvas(); addEventListener('resize', resizeCanvas);
function drawWave(time){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const rise=getRise(time); if(rise===0) return;
  if(!settings.waves) return;
  const amp=25*SCALE, freq=0.006/SCALE, speed=0.0012;
  const restY=canvas.height*0.7;
  const baseY=restY+(1-rise)*(canvas.height-restY+amp+40);
  ctx.beginPath(); ctx.moveTo(0,canvas.height);
  for(let x=0;x<=canvas.width;x+=2) ctx.lineTo(x, baseY-Math.sin(x*freq+time*speed)*amp);
  ctx.lineTo(canvas.width,canvas.height); ctx.closePath();
  const g=ctx.createLinearGradient(0,baseY-amp,0,canvas.height);
  g.addColorStop(0,`rgba(${waveRGB},0)`); g.addColorStop(0.5,`rgba(${waveRGB},0.6)`); g.addColorStop(1,`rgba(${waveRGB},1)`);
  ctx.fillStyle=g; ctx.fill();
}
const fxCanvas=document.getElementById('fx'), fxCtx=fxCanvas.getContext('2d');
let fxDpr=1;
function resizeFx(){ fxDpr=Math.min(window.devicePixelRatio||1,2); fxCanvas.width=Math.round(innerWidth*fxDpr); fxCanvas.height=Math.round(innerHeight*fxDpr); }
resizeFx(); addEventListener('resize',resizeFx);
let STARS=null;
const makeStars=()=>Array.from({length:70},()=>({x:Math.random(),y:Math.pow(Math.random(),1.5)*0.5,r:0.6+Math.random()*1.6,sp:0.0008+Math.random()*0.002,ph:Math.random()*6.28,ang:Math.random()*6.2832,v:0.000003+Math.random()*0.000009}));
let BUBBLES=null;
const makeBubbles=()=>Array.from({length:22},()=>({x:Math.random(),r:4+Math.random()*14,sp:0.00005+Math.random()*0.00004,off:Math.random(),sw:6+Math.random()*14,ph:Math.random()*6.28}));
function drawFx(time){
  fxCtx.setTransform(1,0,0,1,0,0);
  fxCtx.clearRect(0,0,fxCanvas.width,fxCanvas.height);
  const rise=getRise(time); if(rise===0) return;
  const kind=settings.fx; if(kind!=='stars'&&kind!=='bubbles'&&kind!=='sunset') return;
  const W=innerWidth, H=innerHeight;
  fxCtx.setTransform(fxDpr,0,0,fxDpr,0,0);
  if(kind==='stars'){
    if(!STARS) STARS=makeStars();
    fxCtx.fillStyle='#fff'; fxCtx.strokeStyle='#fff'; fxCtx.lineWidth=1;
    for(const s of STARS){
      const a=0.15+0.85*(0.5+0.5*Math.sin(time*s.sp+s.ph));
      fxCtx.globalAlpha=rise*a;
      const dr=s.v*time*H, R=0.5*H;
      const x=(((s.x*W+Math.cos(s.ang)*dr)%W)+W)%W;
      const y=(((s.y*H+Math.sin(s.ang)*dr)%R)+R)%R;
      fxCtx.beginPath(); fxCtx.arc(x,y,s.r,0,6.2832); fxCtx.fill();
      if(s.r>1.5){ const L=s.r*4*a; fxCtx.beginPath(); fxCtx.moveTo(x-L,y); fxCtx.lineTo(x+L,y); fxCtx.moveTo(x,y-L); fxCtx.lineTo(x,y+L); fxCtx.stroke(); }
    }
  } else if(kind==='bubbles'){
    if(!BUBBLES) BUBBLES=makeBubbles();
    fxCtx.strokeStyle='rgba(170,225,255,0.6)'; fxCtx.lineWidth=1.5;
    fxCtx.globalAlpha=rise;
    for(const b of BUBBLES){
      const p=(time*b.sp+b.off)%1;
      const y=H+b.r-p*(H+b.r*2);
      const x=b.x*W+Math.sin(time*0.001+b.ph)*b.sw;
      fxCtx.beginPath(); fxCtx.arc(x,y,b.r,0,6.2832); fxCtx.stroke();
    }
  } else {
    drawSunset(time,W,H,rise);
  }
  fxCtx.globalAlpha=1;
}
function tri(p){ return Math.abs((((p%1)+1)%1)*2-1); }
function ridge(u){
  return 0.55*tri(u)+0.3*tri(u*2.17+0.37)+0.15*tri(u*4.9+0.11);
}
const MTN=[
  {base:0.70,amp:0.11,f:0.0016,v:4,color:'#8a2f6b'},
  {base:0.79,amp:0.09,f:0.0022,v:9,color:'#5a1c55'},
  {base:0.88,amp:0.07,f:0.0031,v:16,color:'#2a0b3a'}
];
function drawSunset(time,W,H,rise){
  const cx=W*0.5, cy=H*0.56, r=Math.min(W,H)*0.085;
  const pulse=0.92+0.08*Math.sin(time*0.0012);
  fxCtx.save();
  fxCtx.globalCompositeOperation='lighter';
  fxCtx.globalAlpha=rise*pulse;
  let g=fxCtx.createRadialGradient(cx,cy,r*0.5,cx,cy,r*7);
  g.addColorStop(0,'rgba(255,190,90,0.75)'); g.addColorStop(0.35,'rgba(255,120,60,0.3)'); g.addColorStop(1,'rgba(255,90,40,0)');
  fxCtx.fillStyle=g; fxCtx.fillRect(0,0,W,H);
  fxCtx.restore();
  fxCtx.save();
  fxCtx.globalCompositeOperation='lighter';
  fxCtx.globalAlpha=rise;
  g=fxCtx.createRadialGradient(cx,cy,0,cx,cy,r*1.8);
  g.addColorStop(0,'rgba(255,252,235,1)'); g.addColorStop(0.35,'rgba(255,236,160,0.95)'); g.addColorStop(0.6,'rgba(255,190,90,0.45)'); g.addColorStop(1,'rgba(255,150,60,0)');
  fxCtx.fillStyle=g; fxCtx.beginPath(); fxCtx.arc(cx,cy,r*1.8,0,6.2832); fxCtx.fill();
  fxCtx.restore();
  fxCtx.globalAlpha=rise;
  for(const m of MTN){
    const off=time/1000*m.v;
    fxCtx.fillStyle=m.color;
    fxCtx.beginPath(); fxCtx.moveTo(0,H);
    for(let x=0;x<=W+6;x+=6) fxCtx.lineTo(x,H*m.base-H*m.amp*ridge((x+off)*m.f));
    fxCtx.lineTo(W+6,H); fxCtx.closePath(); fxCtx.fill();
  }
}
(function animate(t){ drawWave(t); drawFx(t); requestAnimationFrame(animate); })(0);

