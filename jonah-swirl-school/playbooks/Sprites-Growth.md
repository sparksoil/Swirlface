awesome — here’s a paste-ready playbook for sprites & growth. Drop it at:

/jonah-swirl-school/playbooks/Sprites-Growth.md

⸻

Playbook: Sprites — Seed → Sprout → Bloom (pillar growth)

Goal (why):
Give Jonah lightweight growth feedback (seed → sprout → leaf → bud → bloom) based on how often each pillar gets touched by crumbs. Keep it sweet, readable, and data-derivable (no new stored fields yet).

Guardrails: use only theme tokens; compute from listCrumbs() (no new persistent keys). A11y: avatars/labels must have accessible names.

⸻

Files (touch only these)
	•	js/sprites.js ← new: tiny sprite bank + helpers (inline SVG; no external font).
	•	js/hub.js     ← show a small growth badge on each home token.
	•	js/swirlfeed.js ← show sprite rings in the Stories row (top of feed).
	•	css/hub.css   ← minimal style hooks for token badges.
	•	css/swirlfeed.css ← minimal style for story avatars.
	•	assets/seed-sprites.svg (optional) ← if you prefer external symbols. If missing, copy devlab/seed-sprites.svg to jonah-swirl-school/assets/.

Do not change storage.js. Growth is computed, not stored.

⸻

Data model (derived only)
	•	Source: listCrumbs() from storage.js (already sorted newest→oldest).
	•	Window: last 14 days (rolling) to keep feedback snappy for a child.
	•	Counts: number of crumbs whose pillars include each pillar.
	•	Stage thresholds (per pillar, using the 14-day count):
	•	0 = 0 touches → seed
	•	1 = 1–2 → sprout
	•	2 = 3–4 → two leaves
	•	3 = 5–7 → bud
	•	4 = 8–11 → small bloom
	•	5 = ≥12 → big bloom

(Adjust numbers later in a single place inside sprites.js.)

⸻

UI surfaces
	1.	Home (index.html / hub.js)
	•	Each floating token gets a tiny corner badge with the current stage.
	•	Badge is decorative-only (aria-hidden) because the token already has a label.
	•	Tooltip title: “Self — Bloom (12 in last 14d)”.
	2.	Swirlfeed (swirlfeed.html)
	•	Stories row shows one avatar per pillar (All, Spiritual, Family, Self, RRR, Work).
	•	The ring glow matches stage. Avatar has aria-label="Self — Sprout".
	3.	Weekly (optional later)
	•	We can map stages to bloom dots you already have; not part of this pass.

⸻

CSS tokens to use
	•	Colors: use existing --accent1, --accent2, --ink, pillar tints from base.css (--p-self-100, etc.).
	•	No hardcoded hex except inside the inline SVG fills for sprite shapes.

⸻

Implementation steps

A) Add js/sprites.js

Create a tiny helper module that:
	•	(1) Computes 14-day counts per pillar from listCrumbs()
	•	(2) Converts counts → stage using thresholds
	•	(3) Exposes two UI helpers:
	•	spriteStage(pillar) -> {count, stage, label}
	•	spriteBadge(pillar, {size=18}) -> HTML (small inline SVG for badges)
	•	spriteAvatar(pillar, {size=56}) -> HTML (circle avatar used in Stories)

Keep the shapes simple (seed/sprout/leaf/bud/bloom). Inline SVG means no network.

Paste:

// jonah-swirl-school/js/sprites.js
import { listCrumbs } from './storage.js';

export const PILLARS = ['divine','family','self','rrr','work'];

const LABEL = {
  divine: 'Spiritual Routine',
  family: 'Home',
  self:   'Self',
  rrr:    'Skills',
  work:   'Work',
  all:    'All'
};

// 14d window
function withinWindow(iso, days=14){
  const t = new Date(iso).getTime();
  return (Date.now() - t) <= days*86400000;
}

function counts14d(){
  const base = { divine:0,family:0,self:0,rrr:0,work:0 };
  for(const c of listCrumbs()){
    if(!withinWindow(c.tsISO)) break; // list is newest→oldest
    (Array.isArray(c.pillars)?c.pillars:[]).forEach(p=>{
      if(p in base) base[p]++;
    });
  }
  return base;
}

// Stage thresholds (derived from count in 14d)
function stageFromCount(n){
  if(n<=0) return 0;     // seed
  if(n<=2) return 1;     // sprout
  if(n<=4) return 2;     // two leaves
  if(n<=7) return 3;     // bud
  if(n<=11) return 4;    // small bloom
  return 5;              // big bloom
}

export function spriteStage(pillar){
  const tally = counts14d();
  if(pillar==='all'){
    const total = Object.values(tally).reduce((a,b)=>a+b,0);
    return { count: total, stage: stageFromCount(total), label: 'All' };
  }
  const n = tally[pillar] || 0;
  return { count: n, stage: stageFromCount(n), label: LABEL[pillar]||pillar };
}

// --- visuals (inline svg) ---
function badgeCore(stage){
  // tiny, high-contrast glyphs for stages 0..5
  const cores = [
    '<circle cx="9" cy="9" r="4" fill="#2f8c77"/>',                 // seed
    '<path d="M9 4c2 2 2 6 0 10C7 10 7 6 9 4Z" fill="#2f8c77"/>',    // sprout
    '<path d="M9 4c2 2 2 6 0 10C7 10 7 6 9 4Z" fill="#2f8c77"/><circle cx="9" cy="9" r="2" fill="#a8e6d1"/>', // leaves
    '<circle cx="9" cy="7" r="3" fill="#f5b6d2"/><rect x="8.5" y="9" width="1" height="4" fill="#2f8c77"/>', // bud
    '<circle cx="9" cy="7" r="3.5" fill="#ffc7de"/><circle cx="9" cy="7" r="1.2" fill="#ff9cc5"/><rect x="8.5" y="9" width="1" height="4" fill="#2f8c77"/>', // bloom
    '<circle cx="9" cy="7" r="4" fill="#ffd1a3"/><circle cx="9" cy="7" r="1.4" fill="#ffad66"/><rect x="8.5" y="9" width="1" height="4" fill="#2f8c77"/>'   // big bloom
  ];
  return cores[Math.max(0, Math.min(stage,5))];
}

export function spriteBadge(pillar, { size=18, title } = {}){
  const { stage, count, label } = spriteStage(pillar);
  const t = title || `${label} — ${['Seed','Sprout','Leaves','Bud','Bloom','Big Bloom'][stage]} (${count} in 14d)`;
  return `<span class="sprite-badge" title="${t}" aria-hidden="true">
    <svg viewBox="0 0 18 18" width="${size}" height="${size}" role="img" aria-label="${t}">
      ${badgeCore(stage)}
    </svg>
  </span>`;
}

function ringColor(stage){
  return [
    'rgba(47,140,119,.35)',
    'rgba(47,140,119,.45)',
    'rgba(168,230,209,.55)',
    'rgba(245,182,210,.55)',
    'rgba(255,199,222,.62)',
    'rgba(255,173,102,.70)'
  ][stage] || 'rgba(0,0,0,.2)';
}

export function spriteAvatar(pillar, { size=56 } = {}){
  const { stage, label } = spriteStage(pillar);
  const ring = ringColor(stage);
  return `
    <div class="story-avatar" style="--ring:${ring}; width:${size}px; height:${size}px" aria-label="${label} — ${['Seed','Sprout','Leaves','Bud','Bloom','Big Bloom'][stage]}">
      <div class="story-inner">
        <svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true">${badgeCore(stage)}</svg>
      </div>
    </div>
  `;
}

B) Home badges (hub.js)
	•	After token buttons are rendered, inject the badge HTML into each token based on its data-pillar.

Patch (concept):

// jonah-swirl-school/js/hub.js
import { spriteBadge } from './sprites.js';

// ...existing code...
tokens.forEach(t=>{
  const p = t.dataset.pillar;
  if(!p) return;
  t.insertAdjacentHTML('beforeend', spriteBadge(p, { size:18 }));
});
// re-run on storage changes so badges live-update
window.addEventListener('swirl:changed', (e)=>{
  if((e.detail?.type||'').startsWith('crumb_')){
    tokens.forEach(t=>{
      const b = t.querySelector('.sprite-badge'); if(b) b.remove();
      const p = t.dataset.pillar; if(p) t.insertAdjacentHTML('beforeend', spriteBadge(p,{size:18}));
    });
  }
});

C) Stories avatars (swirlfeed.js)
	•	Build the top stories row using spriteAvatar('all') then each pillar in order.

Patch (concept):

// jonah-swirl-school/js/swirlfeed.js
import { spriteAvatar, PILLARS } from './sprites.js';

const storyTrack = document.getElementById('storyTrack');
function renderStories(){
  if(!storyTrack) return;
  const items = ['all', ...PILLARS].map(p=>{
    return `<button class="story-chip" data-pill="${p}" aria-label="${p}">
      ${spriteAvatar(p,{size:56})}
      <span class="story-label">${p==='all'?'All':p}</span>
    </button>`;
  }).join('');
  storyTrack.innerHTML = items;
}
renderStories();
window.addEventListener('swirl:changed', (e)=>{
  if((e.detail?.type||'').startsWith('crumb_')) renderStories();
});

D) Minimal CSS hooks

hub.css (badge position)

/* token growth badge */
.token { position: relative; }
.token .sprite-badge{
  position:absolute; right:-6px; top:-6px;
  display:inline-grid; place-items:center;
  border-radius:50%;
  background:#fff; box-shadow:0 2px 8px rgba(0,0,0,.18);
  padding:2px;
}

swirlfeed.css (story avatar ring)

.story-avatar{
  display:grid; place-items:center;
  border-radius:50%;
  background:#fff;
  box-shadow: 0 0 0 3px var(--paper), 0 0 0 0 var(--ring);
  transition: box-shadow .2s ease, transform .2s ease;
}
.story-avatar .story-inner{
  width:82%; height:82%;
  border-radius:50%;
  display:grid; place-items:center;
  background: #fff;
  box-shadow: inset 0 0 0 2px var(--ring);
}
.story-chip{ background:transparent; border:0; cursor:pointer; text-align:center; }
.story-chip:focus-visible .story-avatar,
.story-chip:hover .story-avatar{
  transform: translateY(-1px);
  box-shadow: 0 0 0 3px var(--paper), 0 0 0 4px var(--ring);
}
.story-label{ display:block; font-size:.8rem; margin-top:6px; opacity:.8; text-transform:capitalize; }


⸻

Debug checklist
	•	Counts check:
	•	Temporarily console.log(counts14d()) in sprites.js and add crumbs across pillars. Numbers should increase only for the pillars included in each crumb and only for last 14 days.
	•	Stage boundary check: add crumbs to cross 2→3 and 4→5 thresholds; badge/avatars update on the next swirl:changed event.
	•	A11y: Story chips are buttons with visible focus; avatar has proper aria-label.

⸻

Acceptance (pass when true)
	•	Home tokens show a tiny badge; changing crumbs updates badges without refresh.
	•	Swirlfeed shows story avatars with ring intensity increasing by stage.
	•	No new keys stored; refresh reproduces growth purely from listCrumbs().
	•	All styling respects theme tokens; no console errors.

⸻

Future extensions (don’t do now)
	•	Persist a weekly snapshot for historical graphs.
	•	Add “bloom burst” micro-animation when crossing a stage (respect prefers-reduced-motion).
	•	Subject-specific relic builders (e.g., Colosseum) behind a separate playbook.

⸻

If you want, I can also hand you the exact patch blocks for hub.js and swirlfeed.js based on your current files so you can paste with zero diff-hunting.
