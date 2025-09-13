// Neutral Swirlfeed (filters + search + date groups)
// Uses listCrumbs() from storage.js

import { listCrumbs } from './storage.js';

const feedRoot = document.getElementById('feedRoot');
const chipRow  = document.querySelector('.chips');
const qInput   = document.getElementById('q');

let currentPill = 'all';
let q = '';

const PILL_LABEL = {
  divine: '👑 Divine',
  family: '🏠 Home',
  self:   '🌱 Self',
  rrr:    '📚 Skills',
  work:   '💵 Work'
};

// preselect pillar from URL hash if provided
const hashPill = (location.hash || '').replace('#','').trim();
if(hashPill && PILL_LABEL[hashPill]){
  currentPill = hashPill;
  chipRow.querySelectorAll('.chip').forEach(c => {
    const active = c.dataset.pill === currentPill;
    c.classList.toggle('is-active', active);
    c.setAttribute('aria-selected', active ? 'true' : 'false');
  });
}

function dateOnly(iso){ return (iso||'').slice(0,10); }
function emojiFor(p){ return ({divine:'👑', family:'🏠', self:'🌱', rrr:'📚', work:'💵'})[p] || '•'; }

function normalize(s){ return (s||'').toLowerCase(); }

/** Filter crumbs by pillar + search query */
function filtered(){
  const all = listCrumbs(); // newest first (we sorted in storage API)
  const qn = normalize(q);
  return all.filter(c=>{
    if(currentPill !== 'all' && c.pillar !== currentPill) return false;
    if(!qn) return true;
    const hay = [
      c.text,
      ...(Array.isArray(c.tags) ? c.tags : []),
      ...(Array.isArray(c.skills) ? c.skills : []),
      ...(Array.isArray(c.parts) ? c.parts : [])
    ].join(' ').toLowerCase();
    return hay.includes(qn);
  });
}

/** Group by YYYY-MM-DD */
function groupByDay(rows){
  const map = new Map();
  for(const c of rows){
    const d = dateOnly(c.tsISO);
    if(!map.has(d)) map.set(d, []);
    map.get(d).push(c);
  }
  return [...map.entries()].sort((a,b)=> b[0].localeCompare(a[0])); // newest day first
}

function escapeHtml(s){ return (s||'').replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;', "'":'&#39;' }[m])); }

function makeItem(c){
  const div = document.createElement('div');
  div.className = 'item';
  div.innerHTML = `
    <div class="txt">${emojiFor(c.pillar)} ${escapeHtml(c.text)}</div>
    <div class="pill">${PILL_LABEL[c.pillar]||''}</div>
    <button class="go" type="button" aria-label="Add another ${c.pillar} crumb">Go →</button>
  `;
  const go = div.querySelector('.go');
   go.addEventListener('click', ()=>{ location.href = `./day.html#${c.pillar}`; });
  return div;
}

function render(){
  const rows = filtered();
  const groups = groupByDay(rows);

  feedRoot.innerHTML = '';
  if(!groups.length){
    const p = document.createElement('p');
    p.className = 'hint';
    p.textContent = q || currentPill!=='all'
      ? 'No crumbs match your filters yet.'
      : 'No crumbs yet. Drop one from the Home doors or Day page.';
    feedRoot.appendChild(p);
    return;
  }

  for(const [day, items] of groups){
    const group = document.createElement('div');
    group.className = 'day-group';
    const h = document.createElement('h3');
    h.className = 'day-head';
    h.textContent = day;
    group.appendChild(h);

    items.forEach(c=> group.appendChild(makeItem(c)));
    feedRoot.appendChild(group);
  }
}

// chip interactions
chipRow.addEventListener('click', (e)=>{
  const btn = e.target.closest('.chip');
  if(!btn) return;
  const pill = btn.dataset.pill;
  if(!pill) return;
  currentPill = pill;
  // update active
  chipRow.querySelectorAll('.chip').forEach(c=> c.classList.toggle('is-active', c===btn));
  render();
});

// search interactions (debounced)
let t = null;
qInput.addEventListener('input', ()=>{
  clearTimeout(t);
  t = setTimeout(()=>{ q = qInput.value || ''; render(); }, 150);
});

// initial render
render();
