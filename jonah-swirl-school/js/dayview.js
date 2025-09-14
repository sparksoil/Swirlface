import { load, save } from './storage.js';

const CRUMBS = 'crumbs';
const COMMENTS = 'comments'; // keyed by YYYY-MM-DD

function q(k){ return document.querySelector(k); }
function ymdFromQuery(){
  const p = new URLSearchParams(location.search);
  return p.get('d') || (new Date().toISOString().slice(0,10));
}

function sameDay(a,b){
  const A = new Date(a), B = new Date(b);
  return A.getFullYear()===B.getFullYear() && A.getMonth()===B.getMonth() && A.getDate()===B.getDate();
}

function groupForDay(day){
  const data = load(CRUMBS, []);
  return data.filter(c=>sameDay(c.date, day)).sort((a,b)=>new Date(a.date)-new Date(b.date));
}

function renderEntries(day){
  const entries = q('#entries');
  entries.innerHTML = '';
  const items = groupForDay(day);
  if (!items.length){
    entries.innerHTML = `<p class="empty">No crumbs yet today. Add one from the entry page or drop a thought below.</p>`;
    return;
  }
  items.forEach(c=>{
    const card = document.createElement('article');
    card.className = 'day-card';
    card.innerHTML = `
      <header>
        <span class="pill">${c.pillar || '🌀'}</span>
        <time>${new Date(c.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</time>
      </header>
      ${c.photo ? `<div class="pic"><img src="${c.photo}" alt="crumb photo"></div>` : ''}
      <p class="txt">${c.text || ''}</p>
      ${c.parts?.length ? `<p class="parts">Parts: ${c.parts.join(', ')}</p>` : ''}
    `;
    entries.appendChild(card);
  });
}

function renderComments(day){
  const list = q('#commentList');
  const map  = load(COMMENTS, {});
  const arr  = map[day] || [];
  list.innerHTML = arr.map(c=>`<li><span class="when">${new Date(c.at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span> ${c.part?`<b>${c.part}</b>: `:''}${c.text}</li>`).join('');
}

function setupCommentForm(day){
  const form = q('#commentForm');
  form.addEventListener('submit', e=>{
    e.preventDefault();
    const text = q('#commentText').value.trim();
    const part = q('#commentPart').value.trim();
    if(!text) return;
    const map = load(COMMENTS, {});
    map[day] ??= [];
    map[day].push({ id: crypto.randomUUID(), at: new Date().toISOString(), text, part });
    save(COMMENTS, map);
    form.reset();
    renderComments(day);
  });
}

const day = ymdFromQuery();
q('#dayTitle').textContent = `Day Journal — ${day}`;
renderEntries(day);
renderComments(day);
setupCommentForm(day);
