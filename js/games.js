/* Games tab: loads games.json, search, player, fullscreen */
// ---------- games ----------
// The list comes from games.json: [{"name":"Game","file":"path/to/game.html","img":"path/to/icon.png"}, ...]
const GAMES=[];
let gamesState='loading';   // loading | ok | failed
const gameGrid=document.getElementById('gameGrid'), gameSearch=document.getElementById('gameSearch');
const gamesList=document.getElementById('gamesList'), gamePlayer=document.getElementById('gamePlayer');
const gameStage=document.getElementById('gameStage'), gameTitle=document.getElementById('gameTitle');
// shine frame animation (still PNG, plays the GIF on hover)
const SHINE_GIF='https://cdn.jsdelivr.net/gh/ToxicBurstXZ/img@main/window-shine-moving-2.gif', SHINE_PAUSE=1000;
const SHINE={blob:null,duration:1500};
function gifDuration(b){
  let p=13,total=0;
  if(b[10]&0x80) p+=3*(1<<((b[10]&7)+1));
  while(p<b.length){
    const t=b[p];
    if(t===0x3B) break;
    if(t===0x21){
      if(b[p+1]===0xF9){ const d=b[p+4]|(b[p+5]<<8); total+=(d<=1?10:d)*10; }
      p+=2; while(b[p]!==0) p+=b[p]+1; p++;
    } else if(t===0x2C){
      const packed=b[p+9]; p+=10;
      if(packed&0x80) p+=3*(1<<((packed&7)+1));
      p++; while(b[p]!==0) p+=b[p]+1; p++;
    } else break;
  }
  return total;
}
try{ fetch(SHINE_GIF).then(r=>r.arrayBuffer()).then(buf=>{ SHINE.duration=gifDuration(new Uint8Array(buf))||1500; SHINE.blob=new Blob([buf],{type:'image/gif'}); }).catch(()=>{}); }catch(e){}
function attachShine(thumb){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let hovering=false,playing=false,timer=null,url=null;
  function play(){
    if(!SHINE.blob) return;
    playing=true;
    if(url) URL.revokeObjectURL(url);
    url=URL.createObjectURL(SHINE.blob);
    thumb.style.setProperty('--shine','url("'+url+'")');
    thumb.classList.add('playing');
    timer=setTimeout(end,SHINE.duration+60);
  }
  function end(){
    playing=false; thumb.classList.remove('playing');
    if(hovering){ timer=setTimeout(()=>{ timer=null; if(hovering) play(); },SHINE_PAUSE); } else timer=null;
  }
  thumb.addEventListener('mouseenter',()=>{ hovering=true; if(!playing&&timer===null) play(); });
  thumb.addEventListener('mouseleave',()=>{ hovering=false; if(!playing&&timer!==null){ clearTimeout(timer); timer=null; } });
}
function renderGames(){
  const q=gameSearch.value.trim().toLowerCase();
  const list=GAMES.filter(g=>g.title.toLowerCase().includes(q));
  gameGrid.innerHTML='';
  list.forEach(g=>{
    const b=document.createElement('button');
    b.type='button'; b.className='game'; b.disabled=!!g.soon;
    const th=document.createElement('div'); th.className='thumb';
    if(g.img){ const im=document.createElement('img'); im.src=g.img; im.alt=g.title; th.appendChild(im); }
    const nm=document.createElement('div'); nm.className='name'; nm.textContent=g.title;
    b.append(th,nm);
    if(!g.soon) b.addEventListener('click',()=>openGame(g));
    gameGrid.appendChild(b);
    attachShine(th);
  });
  const em=document.getElementById('gameEmpty');
  if(gamesState==='failed'){ em.textContent='Error! Something went wrong...'; em.hidden=false; }
  else { em.textContent='No games found.'; em.hidden=gamesState==='loading'||list.length>0; }
}
let openToken=0;
async function openGame(g){
  const token=++openToken;
  gameTitle.textContent=g.title; gameStage.innerHTML='';
  gamesList.hidden=true; gamePlayer.hidden=false;
  let ok=false;
  if(g.src){
    try{ const r=await fetch(g.src); ok=r.ok; }
    catch(e){ try{ await fetch(g.src,{mode:'no-cors'}); ok=true; }catch(e2){ ok=false; } }
  }
  if(token!==openToken||gamePlayer.hidden) return;   // user already went back or opened another game
  if(!ok){ showError(); return; }
  const f=document.createElement('iframe'); f.src=g.src; f.allow='fullscreen'; f.addEventListener('error',showError);
  gameStage.innerHTML=''; gameStage.appendChild(f);
}
function showError(){
  gameStage.innerHTML='';
  const d=document.createElement('div'); d.className='game-error';
  d.textContent='Error! Something went wrong...';
  gameStage.appendChild(d);
}
function closeGame(){
  if(document.fullscreenElement) document.exitFullscreen().catch(()=>{});
  gameStage.innerHTML=''; gamePlayer.hidden=true; gamesList.hidden=false;
}
gameSearch.addEventListener('input',renderGames);
document.getElementById('gameBack').addEventListener('click',closeGame);
document.getElementById('gameFull').addEventListener('click',()=>{
  if(document.fullscreenElement){ document.exitFullscreen().catch(()=>{}); return; }
  const req=gameStage.requestFullscreen||gameStage.webkitRequestFullscreen;
  if(req){ const p=req.call(gameStage); if(p&&p.catch) p.catch(()=>{}); }
});
renderGames();
fetch('games.json').then(r=>r.ok?r.json():Promise.reject()).then(list=>{
  if(!Array.isArray(list)) throw 0;
  list.forEach(g=>GAMES.push({title:g.name||g.title,img:g.img,src:g.file||g.src}));
  gamesState='ok'; renderGames();
}).catch(()=>{
  // games.json missing or broken: still show buttons (no image, no file) so the layout works
  GAMES.length=0;
  for(let i=1;i<=14;i++) GAMES.push({title:'Game '+i});
  gamesState='ok'; renderGames();
});

