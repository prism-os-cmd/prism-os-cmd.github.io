/* Main UI: dock, page switching, #hash links */
// ---------- dock + pages ----------
const ui=document.getElementById('ui'), dockBtns=document.querySelectorAll('.dock-btn'), dockIndicator=document.getElementById('dockIndicator');
let currentPage='home', switching=false;
function moveIndicator(){
  const a=document.querySelector('.dock-btn.active'); if(!a) return;
  dockIndicator.style.width=a.offsetWidth+'px'; dockIndicator.style.transform=`translateX(${a.offsetLeft}px)`;
}
function showPage(name){
  const next=document.getElementById('page-'+name); if(!next) return;
  next.classList.add('active'); void next.offsetWidth; next.classList.add('visible');
}
function goTo(name){
  if(name===currentPage||switching) return;
  switching=true;
  try{ location.hash=PAGE_HASH[name]; }catch(e){}
  if(currentPage==='games'&&name!=='games') closeGame();
  dockBtns.forEach(b=>{ const on=b.dataset.page===name; b.classList.toggle('active',on); on?b.setAttribute('aria-current','page'):b.removeAttribute('aria-current'); });
  moveIndicator();
  const old=document.getElementById('page-'+currentPage);
  old.classList.remove('visible');
  setTimeout(()=>{ old.classList.remove('active'); currentPage=name; document.getElementById('pages').scrollTop=0; showPage(name); switching=false; },300);
}
const PAGE_HASH={home:'h',games:'g',proxy:'p',settings:'s',info:'u'};
const HASH_PAGE=Object.fromEntries(Object.entries(PAGE_HASH).map(([k,v])=>[v,k]));
dockBtns.forEach(b=>b.addEventListener('click',()=>goTo(b.dataset.page)));
addEventListener('hashchange',()=>{ const p=HASH_PAGE[location.hash.slice(1)]; if(p) goTo(p); });
addEventListener('resize',moveIndicator);
function showUI(){
  const h=HASH_PAGE[location.hash.slice(1)];
  if(h&&h!==currentPage){
    document.querySelector('.dock-btn.active').classList.remove('active');
    document.querySelector('.dock-btn[data-page="'+h+'"]').classList.add('active');
    document.getElementById('page-'+currentPage).classList.remove('active','visible');
    currentPage=h;
  }
  moveIndicator(); requestAnimationFrame(()=>dockIndicator.classList.add('ready')); ui.classList.add('show'); showPage(currentPage); }
if(document.fonts&&document.fonts.ready) document.fonts.ready.then(moveIndicator);

