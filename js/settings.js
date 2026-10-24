/* Settings: themes, tab title and icon, volume */
// ---------- settings ----------
const THEMES=[
  {name:'Prism',top:'#550673',mid:'#050b2e',wave:'#005bff',fx:'stars',waves:true},
  {name:'Ocean',top:'#03396c',mid:'#011f4b',wave:'#00c2ff',fx:'bubbles',waves:false},
  {name:'Sunset',top:'#d9482f',mid:'#5b1a4f',wave:'#ff6a3d',fx:'sunset',waves:false}
];
const DEFAULT_SETTINGS={...THEMES[0],title:document.title,emoji:'',icon:'',volume:100};
let settings={...DEFAULT_SETTINGS};
try{ const saved=JSON.parse(localStorage.getItem('prismSettings')); if(saved) Object.assign(settings,saved); }catch(e){}
{ const th=THEMES.find(t=>t.top===settings.top&&t.mid===settings.mid&&t.wave===settings.wave); settings.fx=th?th.fx:'none'; settings.waves=th?th.waves:true; }
function saveSettings(){ try{ localStorage.setItem('prismSettings',JSON.stringify(settings)); }catch(e){} }
const hexToRgb=h=>{ const n=parseInt(h.slice(1),16); return [(n>>16)&255,(n>>8)&255,n&255].join(','); };
const setVol=document.getElementById('setVol');
const setTitle=document.getElementById('setTitle'), setFile=document.getElementById('setFile'), iconPreview=document.getElementById('setIconPreview');
function applyStyle(){
  document.documentElement.style.setProperty('--bg-top',settings.top);
  document.documentElement.style.setProperty('--bg-mid',settings.mid);
  waveRGB=hexToRgb(settings.wave);
}
function applyTab(){
  document.title=settings.title||DEFAULT_SETTINGS.title;
  let link=document.querySelector('link[rel="icon"]');
  if(!link){ link=document.createElement('link'); link.rel='icon'; document.head.appendChild(link); }
  if(settings.icon){ link.href=settings.icon; iconPreview.src=settings.icon; iconPreview.hidden=false; }
  else { link.removeAttribute('href'); iconPreview.hidden=true; }
  setTitle.value=settings.title;
}
let themeTimer=null;
function switchTheme(t){
  if(settings.top===t.top&&settings.mid===t.mid&&settings.wave===t.wave) return;
  const fade=document.getElementById('themeFade');
  fade.style.opacity='1';                 // darken
  clearTimeout(themeTimer);
  themeTimer=setTimeout(()=>{              // swap while dark, then fade back in
    Object.assign(settings,{top:t.top,mid:t.mid,wave:t.wave,fx:t.fx,waves:t.waves});
    applyStyle(); saveSettings();
    fade.style.opacity='0';
  },500);
}
const swatchBox=document.getElementById('setSwatches');
THEMES.forEach(t=>{
  const b=document.createElement('button');
  b.type='button'; b.className='swatch'; b.textContent=t.name;
  b.style.backgroundImage=`linear-gradient(180deg,${t.top},${t.mid} 60%,${t.wave})`;
  b.addEventListener('click',()=>switchTheme(t));
  swatchBox.appendChild(b);
});
// volume: when music is added, set audio.volume = window.siteVolume (and call applyVolume after creating it)
function applyVolume(){
  const v=Math.max(0,Math.min(100,Number(settings.volume)));
  window.siteVolume=v/100; window.siteMuted=v===0;
  document.querySelectorAll('audio,video').forEach(m=>{ m.volume=window.siteVolume; m.muted=window.siteMuted; });
  setVol.value=v; setVol.style.setProperty('--fill',v+'%');
  document.getElementById('setVolLabel').textContent=v===0?'Muted':v+'%';
}
setVol.addEventListener('input',()=>{ settings.volume=Number(setVol.value); applyVolume(); saveSettings(); });
setTitle.addEventListener('input',()=>{ settings.title=setTitle.value; applyTab(); saveSettings(); });

document.getElementById('setUploadBtn').addEventListener('click',()=>setFile.click());
document.getElementById('setIconRemove').addEventListener('click',()=>{ settings.icon=''; applyTab(); saveSettings(); });
setFile.addEventListener('change',()=>{
  const file=setFile.files[0]; if(!file) return;
  const url=URL.createObjectURL(file), img=new Image();
  img.onload=()=>{
    const c=document.createElement('canvas'); c.width=c.height=64;
    const iw=img.naturalWidth||64, ih=img.naturalHeight||64, sq=Math.min(iw,ih);
    c.getContext('2d').drawImage(img,(iw-sq)/2,(ih-sq)/2,sq,sq,0,0,64,64);
    settings.icon=c.toDataURL('image/png');
    URL.revokeObjectURL(url); applyTab(); saveSettings();
  };
  img.src=url; setFile.value='';
});
document.getElementById('setReset').addEventListener('click',()=>{ settings={...DEFAULT_SETTINGS}; applyStyle(); applyTab(); applyVolume(); saveSettings(); });
applyStyle(); applyTab(); applyVolume();
