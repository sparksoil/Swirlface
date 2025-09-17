import { saveCrumb } from './storage.js';

// Swirlface Hub — JS

// ~lines 1-18: helpers + token setup
const tokens = Array.from(document.querySelectorAll('.token'));
const QUICK_PILLARS = ['divine','family','self','rrr','work'];
const QUICK_KEY = 'swirl_quick_pillar';
const INTRO_KEY = 'swirl.intro.dismissed';

const crumbBox      = document.getElementById('crumbBox');
const btnSwirl      = document.getElementById('btnSwirl');
const btnStructured = document.getElementById('btnStructured');
const enterDay      = document.getElementById('enterDay');
const introCard     = document.getElementById('introCard');
const introDismiss  = document.getElementById('introDismiss');

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
    crumbBox.classList.remove('is-pulsing');
    flashSaved();
  }catch(err){
    console.error('Quick crumb save failed', err);
    alert('Could not save crumb. Try again.');
  }
}

function pulseCrumbBox(){
  if(!crumbBox) return;
  crumbBox.classList.remove('is-pulsing');
  void crumbBox.offsetWidth; // restart animation
  crumbBox.classList.add('is-pulsing');
  setTimeout(()=> crumbBox.classList.remove('is-pulsing'), 800);
}

function rand(min, max){ return Math.random() * (max - min) + min; }

tokens.forEach((t, i) => {
  // randomize orbits so each circle feels alive while remaining evenly spaced
  const slice      = 360 / tokens.length;
  const offset     = rand(-18, 18);
  const startAngle = (slice * i + offset + 360) % 360;
  const radius     = rand(170, 240);      // distance from center
  const duration   = rand(26, 46);        // seconds per revolution

  t.style.setProperty('--angle', `${startAngle}deg`);
  t.style.setProperty('--radius', `${radius}px`);
  t.style.animationDuration = `${duration}s`;
  t.dataset.swirlAngle = startAngle.toFixed(2);
  t.dataset.swirlRadius = radius.toFixed(2);
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

enterDay?.addEventListener('click', (event) => {
  event.preventDefault();
  if(crumbBox){
    crumbBox.focus();
    pulseCrumbBox();
  }
});

if(introCard){
  try{
    if(localStorage.getItem(INTRO_KEY) === '1'){
      introCard.setAttribute('hidden','');
    }
  }catch{}
  introDismiss?.addEventListener('click', () => {
    introCard.setAttribute('hidden','');
    try{ localStorage.setItem(INTRO_KEY, '1'); }catch{}
  });
}

// ~lines 80-150: mode toggles (Swirlface ↔ Structured) + crumb capture
function setMode(mode){
  const isSwirl = mode !== 'structured';
  document.body.classList.toggle('mode-swirl', isSwirl);
  if(btnSwirl){
    btnSwirl.classList.toggle('active', isSwirl);
    btnSwirl.setAttribute('aria-pressed', isSwirl ? 'true' : 'false');
  }
  if(btnStructured){
    btnStructured.classList.toggle('active', !isSwirl);
    btnStructured.setAttribute('aria-pressed', !isSwirl ? 'true' : 'false');
  }

  if(!isSwirl){
    tokens.forEach((t, i) => {
      const angle = (360 / tokens.length) * i;
      t.style.setProperty('--angle', `${angle}deg`);
      t.style.setProperty('--radius', `210px`);
    });
  }else{
    tokens.forEach((t) => {
      const angle  = t.dataset.swirlAngle;
      const radius = t.dataset.swirlRadius;
      if(angle)  t.style.setProperty('--angle', `${angle}deg`);
      if(radius) t.style.setProperty('--radius', `${radius}px`);
    });
  }
}

btnSwirl?.addEventListener('click',      () => setMode('swirl'));
btnStructured?.addEventListener('click', () => setMode('structured'));

if(crumbBox){
  crumbBox.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter' && !e.shiftKey){
      e.preventDefault();
      quickSaveCrumb();
    }
  });
}

// start in mode based on hash (#structured) or default to Swirlface
const initialMode = location.hash === '#structured' ? 'structured' : 'swirl';
setMode(initialMode);
