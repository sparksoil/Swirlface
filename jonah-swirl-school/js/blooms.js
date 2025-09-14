// Blooms + Weekly summary utilities (neutral wireframe)
// Depends on Storage helpers from storage.js

import { listCrumbs } from './storage.js';

/** ISO week window (Mon 00:00:00 to Sun 23:59:59.999) for a given offset from current week */
export function weekWindow(offset = 0){
  const now = new Date();
  // get Monday of this week
  const day = (now.getDay() + 6) % 7; // 0=Mon ... 6=Sun
  const monday = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() - day));
  // apply offset in weeks
  const start = new Date(monday.getTime() + offset * 7 * 86400000);
  const end   = new Date(start.getTime() + 6 * 86400000);
  // normalize to local midnight boundaries for label/output (we keep ISO date-only in summaries)
  return { start, end };
}

/** Format YYYY-MM-DD */
export function ymd(d){
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0,10);
}

export function isoLabel(d){
  return ymd(d);
}

/** Summarize crumbs in [start,end] inclusive, grouped by pillar and by tag */
export function summarizeWeek(start, end){
  const s = ymd(start), e = ymd(end);
  const crumbs = listCrumbs().filter(c=> {
    const d = (c.tsISO||'').slice(0,10);
    return d >= s && d <= e;
  });

  const pillars = { divine:0, family:0, self:0, rrr:0, work:0 };
  const tagCounts = new Map(); // tag -> count
  const tagPillar = new Map(); // tag -> pillar that co-occurs most often

  // count by pillar + tags
  for(const c of crumbs){
    pillars[c.pillar] = (pillars[c.pillar]||0) + 1;
    const tags = Array.isArray(c.tags) ? c.tags : [];
    for(const t of tags){
      const key = t.toLowerCase();
      tagCounts.set(key, (tagCounts.get(key)||0) + 1);
      // naive pillar association: increment per tag-pillar pair
      const k2 = key+'|'+(c.pillar||'');
      tagPillar.set(k2, (tagPillar.get(k2)||0) + 1);
    }
  }

  // determine dominant pillar per tag
  const tagToPillar = {};
  for(const [tp, cnt] of tagPillar.entries()){
    const [tag, pillar] = tp.split('|');
    if(!tagToPillar[tag] || cnt > tagToPillar[tag].cnt){
      tagToPillar[tag] = { pillar, cnt };
    }
  }

  // produce sorted top tags (limit 24)
  const tags = [...tagCounts.entries()]
    .sort((a,b)=> b[1]-a[1])
    .slice(0,24)
    .map(([name, count])=> ({ name, count, pillar: (tagToPillar[name]?.pillar)||'' }));

  return { range:{start:s, end:e}, total: crumbs.length, pillars, tags };
}

/** Render pillar bars */
export function renderPillarBars(root, pillars){
  root.innerHTML = '';
  const total = Object.values(pillars).reduce((a,b)=>a+b,0) || 1;
  const labels = {
    divine:'👑 Spiritual Routine', family:'🏠 Home', self:'🌱 Self', rrr:'📚 Skills', work:'💵 Work'
  };
  Object.keys(labels).forEach(key=>{
    const c = pillars[key]||0;
    const pct = Math.round(c*100/total);
    const row = document.createElement('div');
    row.className = 'bar';
    row.innerHTML = `
      <div class="label">${labels[key]}</div>
      <div class="track"><div class="fill" style="width:${pct}%"></div></div>
      <div class="val">${c}</div>
    `;
    root.appendChild(row);
  });
}

/** Render tag blooms (dot scales by count) */
export function renderBlooms(root, tags){
  root.innerHTML = '';
  if(!tags.length){
    root.innerHTML = `<p class="hint">No tags yet this week. Try adding a few on the Day page.</p>`;
    return;
  }
  const max = Math.max(...tags.map(t=>t.count));
  for(const t of tags){
    const dot = Math.max(18, Math.round(18 + (t.count/max)*22)); // 18..40px
    const div = document.createElement('div');
    div.className = 'bloom';
    if(t.pillar) div.dataset.pillar = t.pillar;
    div.innerHTML = `
      <div class="dot" style="width:${dot}px;height:${dot}px;"></div>
      <div class="name">${escapeHtml(t.name)}</div>
      <div class="count">${t.count}</div>
    `;
    root.appendChild(div);
  }
}

export function gotoWeek(offset){ /* reserved for external controls */ }

function escapeHtml(s){ return (s||'').replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;', "'":'&#39;' }[m])); }
