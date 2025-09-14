// planner.js — Upcoming Week/Month planner for Grandma
// Local-first. Stores plans & goals separately from crumbs.
// Suggest button uses last 4 weeks to surface light prompts for quiet pillars.

import { listCrumbs } from './storage.js';
const _safeListCrumbs = typeof listCrumbs === 'function' ? listCrumbs : () => [];

const KEYS = {
  plan:  'swirl_plan_jonah',
  goals: 'swirl_goals_jonah'
};

const EMOJI = { divine:'👑', family:'🏠', self:'🌱', rrr:'📚', work:'💵' };
const PILLARS = ['divine','family','self','rrr','work'];
const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

export function initPlanner(){
  const weekStart = document.getElementById('weekStart');
  const monthStart = document.getElementById('monthStart');
  const planGrid = document.getElementById('planGrid');
  const btnSuggest = document.getElementById('btnSuggest');
  const btnExportPlan = document.getElementById('btnExportPlan');
  const btnPrint = document.getElementById('btnPrint');
  const anchorEl = document.getElementById('anchorText');

  // Goals UI
  const gForm = document.getElementById('goalForm');
  const gList = document.getElementById('goalList');
  const gPillar = document.getElementById('gPillar');
  const gTitle = document.getElementById('gTitle');
  const gDate = document.getElementById('gDate');

  // Default week start -> next Monday
  weekStart.value = nextMondayISO();
  monthStart.value = weekStart.value.slice(0,7);

  // Render grid
  renderGrid(planGrid);

  // Load existing plan if any
  let plan = readPlan();

  // NEW: Apply seed (from recap) once, then clear it
  try{
    const seedRaw = localStorage.getItem('swirl_plan_seed');
    if(seedRaw){
      const seed = JSON.parse(seedRaw);
      plan = {
        weekStartISO: seed.weekStartISO || plan.weekStartISO || weekStart.value,
        monthISO: seed.monthISO || plan.monthISO || monthStart.value,
        anchor: seed.anchor || plan.anchor || '',
        cells: { ...(plan.cells||{}), ...(seed.cells||{}) }
      };
      if(Array.isArray(seed.goalsCarry) && seed.goalsCarry.length){
        const all = readJSON(KEYS.goals, '[]');
        const keyOf = g=>`${g.title}|${g.date}|${g.pillar}`;
        const known = new Set(all.map(keyOf));
        seed.goalsCarry.forEach(g=>{
          const k = keyOf(g);
          if(!known.has(k)) all.unshift({...g, id:'g_'+Math.random().toString(36).slice(2,9)});
        });
        writeJSON(KEYS.goals, all);
      }
      localStorage.removeItem('swirl_plan_seed');
      writeJSON(KEYS.plan, plan);
    }
  }catch{}

  if(plan.weekStartISO){ weekStart.value = plan.weekStartISO; }
  if(plan.monthISO){ monthStart.value = plan.monthISO; }
  anchorEl.value = plan.anchor || '';
  hydrateCells(planGrid, plan.cells || {});

  // Wire inputs
  weekStart.addEventListener('change', saveAll);
  monthStart.addEventListener('change', saveAll);
  anchorEl.addEventListener('input', debounce(saveAll, 250));
  planGrid.addEventListener('input', debounce(saveAll, 200));

  btnSuggest.onclick = suggestFromHistory;
  btnExportPlan.onclick = exportPlanJSON;
  btnPrint.onclick = ()=> window.print();

  // Goals
  renderGoals();
  gForm.addEventListener('submit', e=>{
    e.preventDefault();
    const item = {
      id: 'g_'+Math.random().toString(36).slice(2,9),
      pillar: gPillar.value,
      title: gTitle.value.trim(),
      date: gDate.value,
      createdAt: new Date().toISOString(),
      status: 'open'
    };
    if(!item.title || !item.date) return;
    const all = readJSON(KEYS.goals, '[]');
    all.unshift(item);
    writeJSON(KEYS.goals, all);
    gTitle.value = '';
    renderGoals();
  });

  gList.addEventListener('click', e=>{
    const btn = e.target.closest('[data-action]');
    if(!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;
    const all = readJSON(KEYS.goals, '[]');
    const ix = all.findIndex(x=>x.id===id);
    if(ix<0) return;
    if(action==='done'){ all[ix].status = (all[ix].status==='done'?'open':'done'); }
    if(action==='del'){ all.splice(ix,1); }
    writeJSON(KEYS.goals, all);
    renderGoals();
  });
}

function renderGrid(root){
  root.innerHTML = '';
  root.appendChild(cell('hdr','Pillar/Day'));
  DAYS.forEach(d=> root.appendChild(cell('hdr', d)));
  PILLARS.forEach(p=>{
    const rowHdr = cell('phdr', `${EMOJI[p]} ${nameOf(p)}`);
    rowHdr.dataset.pillar = p;
    root.appendChild(rowHdr);
    DAYS.forEach(d=>{
      const c = document.createElement('div');
      c.className = 'cell';
      c.dataset.pillar = p;
      c.dataset.day = d;
      const ta = document.createElement('textarea');
      ta.placeholder = '1 tiny line…';
      ta.maxLength = 140;
      c.appendChild(ta);
      root.appendChild(c);
    });
  });
}

function hydrateCells(root, saved){
  root.querySelectorAll('.cell textarea').forEach(ta=>{
    const key = cellKey(ta.parentElement);
    if(saved[key]) ta.value = saved[key];
  });
}

function collectCells(root){
  const out = {};
  root.querySelectorAll('.cell textarea').forEach(ta=>{
    const key = cellKey(ta.parentElement);
    const v = ta.value.trim();
    if(v) out[key] = v;
  });
  return out;
}

function saveAll(){
  const plan = {
    weekStartISO: document.getElementById('weekStart').value,
    monthISO: document.getElementById('monthStart').value,
    anchor: document.getElementById('anchorText').value.trim(),
    cells: collectCells(document.getElementById('planGrid'))
  };
  writeJSON(KEYS.plan, plan);
}

function suggestFromHistory(){
  const daysAgo = 28;
  const since = new Date(Date.now() - daysAgo*24*3600*1000).toISOString().slice(0,10);
  const crumbs = _safeListCrumbs();
  const counts = { divine:0,family:0,self:0,rrr:0,work:0 };
  crumbs.forEach(c=>{
    const ymd = (c.tsISO||'').slice(0,10);
    if(ymd >= since) counts[c.pillar] = (counts[c.pillar]||0)+1;
  });

  const order = Object.entries(counts).sort((a,b)=>a[1]-b[1]).map(([k])=>k).slice(0,2);
  const suggestions = {
    divine: 'Read a verse together + 1 sentence prayer',
    family: 'Do one tiny home kindness (5 minutes)',
    self:   'Nature notice: 2 leaves, 1 cloud',
    rrr:    'One page read-aloud or math game',
    work:   'Earn-and-save moment (help + coin jar)'
  };

  const grid = document.getElementById('planGrid');
  grid.querySelectorAll('.cell').forEach(cell=>{
    if(cell.dataset.day!=='Mon') return;
    const ta = cell.querySelector('textarea');
    const p = cell.dataset.pillar;
    if(!ta.value && order.includes(p)) ta.value = suggestions[p];
  });

  saveAll();
}

function exportPlanJSON(){
  const blob = new Blob([JSON.stringify(readPlan(), null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `jonah_plan_${(readPlan().weekStartISO||'week')}.json`;
  document.body.appendChild(a);
  a.click();
  setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 0);
}

function renderGoals(){
  const list = document.getElementById('goalList');
  const all = readJSON(KEYS.goals, '[]');
  list.innerHTML = '';
  all.forEach(g=>{
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="goal-pill">${EMOJI[g.pillar]||'•'}</div>
      <div class="goal-date">${g.date||''}</div>
      <div class="goal-title">${escapeHtml(g.title||'')}</div>
      <div class="spacer"></div>
      <button class="btn btn-ghost" data-action="done" data-id="${g.id}" aria-label="Toggle done">${g.status==='done'?'✓ Done':'Mark'}</button>
      <button class="btn btn-ghost" data-action="del" data-id="${g.id}" aria-label="Delete">Delete</button>
    `;
    list.appendChild(li);
  });
}

function readPlan(){ return readJSON(KEYS.plan, '{"weekStartISO":"","monthISO":"","anchor":"","cells":{}}'); }
function readJSON(key, fallback){ try{ return JSON.parse(localStorage.getItem(key)||fallback); }catch{ return JSON.parse(fallback); } }
function writeJSON(key, val){ localStorage.setItem(key, JSON.stringify(val)); }

function nameOf(p){ return ({divine:'Spiritual Routine',family:'Home',self:'Self',rrr:'Skills',work:'Work'})[p] || p; }
function cellKey(cell){ return `${cell.dataset.pillar}_${cell.dataset.day}`; }
function cellFromKey(key){ const [pillar, day] = key.split('_'); return {pillar, day}; }
function nextMondayISO(){
  const now = new Date();
  const d = (now.getDay() + 6) % 7;
  const mon = new Date(now); mon.setDate(now.getDate() - d + 7);
  return mon.toISOString().slice(0,10);
}
function escapeHtml(s){
  return (s||'').replace(/[&<>"']/g, m=>({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    "'":'&#39;'
  }[m]));
}
function debounce(fn, ms){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),ms); }; }
