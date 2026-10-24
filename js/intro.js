/* Intro: bobbing triangle, orbiting lines, start sequence */
// ---------- bobbing triangle ----------
const triangleFrame=document.querySelector('.triangle-frame');
const titleWrap=document.getElementById('titleWrap');
const btnEl=document.getElementById('startBtn');
let bobbing=true;
function bob(time){
  if(!bobbing) return;
  triangleFrame.style.transform=`translateY(${Math.sin(time/4200*2*Math.PI)*10}px)`;
  const r=btnEl.getBoundingClientRect();
  titleWrap.style.left=(r.left+180)+'px'; titleWrap.style.top=(r.top+105.26)+'px';
  requestAnimationFrame(bob);
}
requestAnimationFrame(bob);

// ---------- orbiting lines ----------
const button=btnEl, title=document.getElementById('title'), wrap=document.getElementById('wrap');
let loading=false;
const TURNS=3, EXPAND_MS=700, SPIN_MS=3000, COLLAPSE_MS=700, POINTS=40;
const OUTER={paths:document.querySelectorAll('.orbit-line'),dist:null,gap:18,halfLen:140,radius:240,halfArc:0.61,dir:1};
const INNER={paths:document.querySelectorAll('.inner-line'),dist:71,gap:0,halfLen:60,radius:58,halfArc:0.7,dir:-1};
const VERTS=[[0,0],[360,0],[180,320]], CENTER=[180,105.26];
const baseSides=VERTS.map((a,i)=>{
  const b=VERTS[(i+1)%3], mx=(a[0]+b[0])/2, my=(a[1]+b[1])/2, dx=b[0]-a[0], dy=b[1]-a[1], len=Math.hypot(dx,dy);
  let nx=dy/len, ny=-dx/len;
  const dot=nx*(mx-CENTER[0])+ny*(my-CENTER[1]);
  if(dot<0){nx=-nx;ny=-ny;}
  return {angle:Math.atan2(ny,nx), sideDist:Math.abs(dot)};
});
[OUTER,INNER].forEach(set=>{ set.sides=baseSides.map(s=>({angle:s.angle,dist:set.dist!==null?set.dist:s.sideDist+set.gap})); });
function renderSet(set,t,spin){
  spin*=set.dir;
  set.sides.forEach((s,i)=>{
    const a0=s.angle+spin, nx=Math.cos(a0), ny=Math.sin(a0), tx=-ny, ty=nx;
    let d='';
    for(let k=0;k<=POINTS;k++){
      const u=(k/POINTS)*2-1;
      const lx=CENTER[0]+s.dist*nx+u*set.halfLen*tx, ly=CENTER[1]+s.dist*ny+u*set.halfLen*ty;
      const ang=a0+u*set.halfArc, ax=CENTER[0]+set.radius*Math.cos(ang), ay=CENTER[1]+set.radius*Math.sin(ang);
      d+=(k===0?'M':'L')+(lx+(ax-lx)*t).toFixed(2)+' '+(ly+(ay-ly)*t).toFixed(2)+' ';
    }
    set.paths[i].setAttribute('d',d);
  });
}
function render(t,spin){ renderSet(OUTER,t,spin); renderSet(INNER,t,spin); }
const easeInOut=x=>(1-Math.cos(Math.PI*x))/2;
function runLoader(onDone){
  let start;
  function frame(now){
    if(start===undefined) start=now;
    const e=now-start; let t=1, spin=0;
    if(e<EXPAND_MS) t=easeInOut(e/EXPAND_MS);
    else if(e<EXPAND_MS+SPIN_MS) spin=Math.PI*2*TURNS*easeInOut((e-EXPAND_MS)/SPIN_MS);
    else if(e<EXPAND_MS+SPIN_MS+COLLAPSE_MS){ t=1-easeInOut((e-EXPAND_MS-SPIN_MS)/COLLAPSE_MS); spin=Math.PI*2*TURNS; }
    else { render(0,0); onDone(); return; }
    render(t,spin); requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
render(0,0);
renderSet(Object.assign({},OUTER,{paths:document.querySelectorAll('.logo-orbit')}),0,0);
renderSet(Object.assign({},INNER,{paths:document.querySelectorAll('.logo-inner')}),0,0);


button.addEventListener('click',()=>{
  if(loading) return; loading=true;
  title.classList.remove('loaded'); title.textContent='Loading'; title.classList.add('loading');
  runLoader(()=>{
    setTimeout(revealBackground,10);
    title.classList.remove('loading'); title.textContent='Loaded'; title.classList.add('loaded');
    setTimeout(()=>{
      bobbing=false; wrap.classList.add('expanding');
      title.classList.remove('loaded'); title.classList.add('gone');
      setTimeout(()=>{ wrap.remove(); titleWrap.remove(); setTimeout(showUI,800); },1300);
    },200);
  });
});

