import { saveCrumb } from './storage.js';

// Swirlface Hub — JS

// ~lines 1-18: helpers + token setup
const tokens = Array.from(document.querySelectorAll('.token'));
const QUICK_PILLARS = ['divine','family','self','rrr','work'];
const QUICK_KEY = 'swirl_quick_pillar';

function readQuickPillar(){
  try{
    const stored = localStorage.getItem(QUICK_KEY);
    if(stored && QUICK_PILLARS.includes(stored)) return stored;
  }catch{}
  return 'self';
}

let quickPillar = readQuickPillar();

function setQuickPillar(pillar){
  if(!pillar || !QUICK_PILLARS.includes(pillar)) return;
  quickPillar = pillar;
  try{ localStorage.setItem(QUICK_KEY, pillar); }catch{}
}

function parseQuickEntry(raw){
  let text = (raw || '').trim();
  let pillar = quickPillar;
  const match = text.match(/^#(divine|family|self|rrr|work)\b/i);
  if(match){
    pillar = match[1].toLowerCase();
    text = text.slice(match[0].length).trim();
  }
  return { text, pillar };
}

function flashSaved(){
  if(!crumbBox) return;
  const original = crumbBox.dataset.placeholder || crumbBox.getAttribute('placeholder') || '';
  crumbBox.dataset.placeholder = original;
  crumbBox.setAttribute('placeholder', 'Saved! Drop another…');
  crumbBox.classList.add('quick-saved');
  setTimeout(()=>{
    const restore = crumbBox.dataset.placeholder || 'Drop a crumb…';
    crumbBox.setAttribute('placeholder', restore);
    crumbBox.classList.remove('quick-saved');
    delete crumbBox.dataset.placeholder;
  }, 1500);
}

function quickSaveCrumb(){
  if(!crumbBox) return;
  const raw = crumbBox.value.trim();
  if(!raw) return;
  const { text, pillar } = parseQuickEntry(raw);
  if(!text) return;
  try{
    saveCrumb({ pillars:[pillar], text });
    setQuickPillar(pillar);
    crumbBox.value = '';
    flashSaved();
  }catch(err){
    console.error('Quick crumb save failed', err);
    alert('Could not save crumb. Try again.');
  }
}

function rand(min, max){ return Math.random() * (max - min) + min; }

tokens.forEach((t, i) => {
  // randomize orbits so each circle feels alive
  const startAngle = rand(0, 360);
  const radius     = rand(150, 260);      // distance from center
  const duration   = rand(26, 46);        // seconds per revolution

  t.style.setProperty('--angle', `${startAngle}deg`);
  t.style.setProperty('--radius', `${radius}px`);
  t.style.animationDuration = `${duration}s`;
});

// ~lines 20-40: click → navigate to pillar feed
tokens.forEach((t) => {
  t.addEventListener('click', () => {
    const pillar = t.dataset.pillar;
    if(pillar){
      setQuickPillar(pillar);
      location.href = `./swirlfeed.html#${pillar}`;
    }
  });
});

// ~lines 80-150: mode toggles (Swirlface ↔ Structured) + crumb capture
const btnSwirl      = document.getElementById('btnSwirl');
const btnStructured = document.getElementById('btnStructured');
const crumbBox      = document.getElementById('crumbBox');

function setMode(mode){
  document.body.classList.toggle('mode-swirl',      mode === 'swirl');
  document.body.classList.toggle('mode-structured', mode === 'structured');
  btnSwirl.classList.toggle('active',      mode === 'swirl');
  btnStructured.classList.toggle('active', mode === 'structured');

  if(mode === 'structured'){
    tokens.forEach((t, i) => {
      const angle = (360 / tokens.length) * i;
      t.style.setProperty('--angle', `${angle}deg`);
      t.style.setProperty('--radius', `210px`);
    });
  }
}

btnSwirl.addEventListener('click',      () => setMode('swirl'));
btnStructured.addEventListener('click', () => setMode('structured'));

if(crumbBox){
  crumbBox.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter' && !e.shiftKey){
      e.preventDefault();
      quickSaveCrumb();
    }
  });
  crumbBox.addEventListener('blur', ()=> quickSaveCrumb());
}

// start in mode based on hash (#structured) or default to Swirlface
const initialMode = location.hash === '#structured' ? 'structured' : 'swirl';
setMode(initialMode);

// draw smooth spiral
function makeSpiralPath({cx=100, cy=100, startR=5, spacing=4, turns=4, steps=360}={}){
  const TAU=Math.PI*2,total=turns*TAU,k=spacing/(2*Math.PI);
  let d="";
  for(let i=0;i<=steps;i++){
    const t=i/steps,th=t*total+0.0001,r=startR+k*th;
    const x=cx+r*Math.cos(th),y=cy+r*Math.sin(th);
    d+= (i?` L ${x.toFixed(2)} ${y.toFixed(2)}`:`M ${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return d;
}
const spiralPath=document.getElementById('spiralPath');
if(spiralPath){ spiralPath.setAttribute('d', makeSpiralPath()); }
