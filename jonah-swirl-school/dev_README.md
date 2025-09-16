🌀 Swirl School (Jonah) — Developer README

Identity: Swirlhub is a translator.
Jonah lives in Soft Time (moments, noticing, intersections).
When needed, the hub narrates those moments into Clock Time (subjects, hours, reports) — without losing soul.

⸻

A) Mission (one line)

Translate lived moments into learning.
Drop crumbs → grow sprites/relics → reflect → auto-map to subjects → evidence → seed next week.

⸻

B) Repo Map (keep these)

jonah-swirl-school/
├─ index.html              # Home / hub swirl
├─ day.html                # Drop a Crumb (today)
├─ swirlfeed.html          # Cozy feed timeline
├─ weekly.html             # Week blooms/bars + exports
├─ evidence.html           # “Proof of school” dashboard
├─ grandma.html            # Planner landing (Soft ↔ Clock)
├─ grandma-plan.html       # Weekly/monthly grid plan
│
├─ js/
│  ├─ hub.js               # home swirl, tokens
│  ├─ crumb-entry.js       # form + save
│  ├─ dayview.js           # stacked day + comments
│  ├─ comments.js          # reflection thread
│  ├─ season.js            # week math / date helpers
│  ├─ blooms.js            # weekly blooms/bars compute
│  ├─ export.js            # CSV/JSON/PDF exports
│  ├─ planner.js           # seed plan + update
│  ├─ photos.js            # camera/file helpers
│  ├─ landing.js           # landing logic
│  ├─ settings.js          # UI toggles, Shoeday
│  ├─ pin.js               # quick pins
│  ├─ storage.js           # ← new: local-first spine
│  ├─ relic-growth.js      # ← new: sprites/relic/statue
│  └─ translator.js        # ← new: Soft → Clock mapping
│
├─ data/
│  ├─ crumbs.json
│  ├─ comments.json
│  ├─ honeycomb.json
│  ├─ verses.json
│  ├─ settings.json
│  └─ audit.log
│
└─ css/
   ├─ base.css             # (or theme-sparksoil.css)
   ├─ hub.css, day.css, dayview.css, swirlfeed.css,
   ├─ weekly.css, evidence.css, grandma.css, grandma-plan.css,
   └─ settings.css, blooms.css, landing.css

Otter-take: structure is already right. We refactor behavior, not folders.

⸻

C) System Diagram (text, printable)

                ┌───────────────────────────┐
                │   📝 Drop a Crumb         │
                │   (day.html)              │
                │   text • photo • tags     │
                └──────────┬────────────────┘
                           │
                           ▼
                ┌───────────────────────────┐
                │   💾 Store in Spine       │
                │   (storage.js)            │
                └──────────┬────────────────┘
                           │
                           ▼
        ┌────────────────────────────────────────────────┐
        │   🌱 Growth Layer                              │
        │   - Sprite grows in MULTIPLE pillars           │
        │   - Relic Builders (Colosseum, Lion Gate)      │
        │   - Statue Layers (Daniel 2)                   │
        └──────────┬─────────────────────────────────────┘
                   │
   ┌───────────────┼─────────────────────────────┬───────────────┐
   ▼               ▼                             ▼               ▼
┌──────────┐  ┌──────────┐                 ┌───────────┐   ┌───────────┐
│ 👑 Spirit│  │ 🏡 Family│                 │ 🌱 Self   │   │ 📚 RRR    │
│ Routine  │  │          │                 │           │   │ Read/Math │
└──────────┘  └──────────┘                 └───────────┘   └───────────┘
                                  │
                                  ▼
                            ┌───────────┐
                            │ 💵 Work   │
                            │ /Earning  │
                            └───────────┘

                           ▼
                ┌───────────────────────────┐
                │ 🌙 Evening Reflection     │
                │ Jonah answers gently:     │
                │  - “What made me smile?”  │
                │  - “Where have I seen this
                │     before?”              │
                │  - “Could it count twice?”│
                │ Parent/Grandma tags swirls│
                └──────────┬────────────────┘
                           │
                           ▼
                ┌───────────────────────────┐
                │ 🔀 Translator Engine      │
                │ Maps crumbs → Subjects    │
                │ LA, Math, Science, SS,    │
                │ Art, PE/Health, Bible     │
                └──────────┬────────────────┘
                           │
                           ▼
                ┌───────────────────────────┐
                │ 📦 Evidence Pack          │
                │ Subject logs + hours      │
                │ “Clock Time proof”        │
                └──────────┬────────────────┘
                           │
                           ▼
                ┌───────────────────────────┐
                │ 📅 Planning Mode          │
                │ Seed from last week →     │
                │ next week nudges          │
                └──────────┬────────────────┘
                           │
                           ▼
                  (loop back to Drop a Crumb)


⸻

D) Data Model (small, surgical upgrades)

1) Crumb (Soft Time)

{
  "id": "uuid",
  "tsISO": "2025-09-15T16:04:00Z",
  "text": "Walked dogs with Mom; counted steps on hills",
  "photo": null,
  "pillars": ["family","self"],          // 👈 allow MULTIPLE
  "parts": ["Curious","Helper"],
  "feelings": ["Proud","Calm"],
  "needs": ["Movement","Connection"],
  "tags": ["dogs","hills"],
  "packet": "world-powers/rome",         // optional: relic-builder
  "minutes": 30                          // optional override
}

2) Translator hints (Clock Time)

{
  "subjects": [
    "language_arts","math","science",
    "social_studies","art","pe_health","bible"
  ],
  "pillarToSubjectHints": {
    "spiritual":"bible",
    "family":"social_studies",
    "self":"pe_health",
    "rrr":"language_arts",
    "work":"social_studies"
  },
  "keywordHints": {
    "count|measure|estimate":"math",
    "build|tinker|experiment|observe":"science",
    "draw|paint|craft|compose":"art",
    "read|write|speak|retell":"language_arts",
    "walk|dance|yoga|run":"pe_health",
    "meeting|verse|service|bible":"bible",
    "map|history|community|kingdoms":"social_studies"
  }
}

3) Plan item

{
  "date": "2025-09-16",
  "slots": [
    {"label":"Quiet Pillar","pillar":"spiritual","minutes":10},
    {"label":"Project Work","pillar":"work","minutes":20}
  ]
}


⸻

E) New Thin Modules (paste-in helpers)

js/storage.js (spine)

export const K = {
  CRUMBS: 'swirl_crumbs_jonah',
  COMMENTS: 'swirl_comments_jonah',
  PLAN: 'swirl_plan_jonah',
  SETTINGS: 'swirl_settings_jonah'
};

const seed = async (key, fallback=[]) => {
  const raw = localStorage.getItem(key);
  if (raw) return JSON.parse(raw);
  // seed from /data if available (optional fetch)
  return fallback;
};

export async function getCrumbs(){ return seed(K.CRUMBS, []); }
export function saveCrumb(c){
  const list = JSON.parse(localStorage.getItem(K.CRUMBS) || '[]');
  list.push(c);
  localStorage.setItem(K.CRUMBS, JSON.stringify(list));
  return c;
}
export async function getPlan(){ return seed(K.PLAN, {date:null, slots:[]}); }
export function setPlan(p){ localStorage.setItem(K.PLAN, JSON.stringify(p)); }

js/relic-growth.js (sprites/relic/statue)

let progress = { pillars:{}, packets:{} };

export function applyGrowth(crumb){
  (crumb.pillars||[]).forEach(p=>{
    progress.pillars[p] = (progress.pillars[p]||0)+1;
  });
  if (crumb.packet){
    progress.packets[crumb.packet] = (progress.packets[crumb.packet]||0)+1;
    // optional: map packet → statue layer increments here
  }
}

export function getProgress(){ return progress; }

js/translator.js (Soft → Clock)

const HINTS = window.TRANSLATOR_HINTS || {}; // load from settings.json if you like

function matchKeywords(text){
  const out = new Set();
  const t = (text||'').toLowerCase();
  Object.entries(HINTS.keywordHints||{}).forEach(([regex,subj])=>{
    if (new RegExp(regex).test(t)) out.add(subj);
  });
  return [...out];
}

export function toSubjects(crumb, reflection){
  const mins = crumb.minutes ?? 30; // fallback guess
  const base = new Set((crumb.pillars||[]).map(p=>HINTS.pillarToSubjectHints?.[p]).filter(Boolean));
  matchKeywords(crumb.text).forEach(s=>base.add(s));
  matchKeywords(reflection?.text).forEach(s=>base.add(s));
  return [...base].map(s=>({subject:s, minutes:mins, evidence:crumb.id}));
}

export function summarizeWeek(crumbs, reflections){
  const byId = Object.fromEntries((reflections||[]).map(r=>[r.crumbId, r]));
  const totals = {};
  crumbs.forEach(c=>{
    toSubjects(c, byId[c.id]).forEach(({subject,minutes})=>{
      totals[subject] = (totals[subject]||0)+minutes;
    });
  });
  return totals; // {math: 60, language_arts: 45, ...}
}


⸻

F) Development Phases (file-by-file)

Phase 0 — Health check (no edits)
Open index.html → day.html → swirlfeed.html → weekly.html → grandma.html → evidence.html.
Confirm no console errors; note empty states say “All clear, nothing here yet 🌱”.

Phase 1 — Multi-tag crumbs
	•	js/crumb-entry.js: allow multiple pillars → pillars: [].
	•	js/dayview.js: render multi chips.
	•	js/blooms.js: count across pillars[].
	•	CSS chips: css/day.css, css/dayview.css.

Phase 2 — Growth layer
	•	Add js/relic-growth.js; call applyGrowth(crumb) on save/load.
	•	js/hub.js: show pillar sprite rings + overall progress.
	•	weekly.html + js/blooms.js: per-pillar growth + optional Relic section (when packet present).

Phase 3 — Evening Reflection (inputs)
	•	js/comments.js: “Evening Reflection” quick form; save to comments.json keyed by date or crumb id.
	•	day.html: bedtime card with 2–3 prompt buttons.

Fake answers (gray) to reduce confusion
	•	Where have I seen this before? → “The lion in Daniel + the lion in the show.”
	•	Could this count twice? → “Dog walk was PE and Responsibility.”
	•	What felt like a win? → “I gave a comment even though nervous.”
 Good instinct, Brookie 🌱 — the Egg Log deserves a clear place in the plan, because it’s both:
	•	🪞 A translation amplifier (it captures what the child may not articulate, and reframes it in adult language)
	•	📦 A legal/IEP safeguard (it shows caregiver oversight + evidence of “instructional” time)

⸻

🔎 Where it fits in the existing plan

In your current development roadmap:
	•	Day View → Jonah drops crumbs (Soft Time)
	•	Evening Reflection → Jonah reflects gently (not pressured)
	•	Translator Engine → turns crumbs/reflections into subjects
	•	Evidence Pack → shows “school proof”

👉 The Egg Log sits parallel to Evening Reflection — but written by caregiver(s). It adds a layer of adult framing to the same day’s record.

⸻

✨ Amendment to Development Plan

Add a Phase 3.5 step after “Evening Reflection” in the roadmap:

⸻

Phase 3.5 — Caregiver Egg Log (Optional Adult Reflection)
	•	New file: data/egglog.json
	•	Purpose: Caregiver (Egg Mommy / Grandma) can add short entries to frame what happened in adult terms.
	•	UI:
	•	Simple text box on day.html labeled “Egg Log (Adult Reflection)”
	•	Tag picker (emotional_regulation, entrepreneurship, civic_engagement, etc.)
	•	Integration:
	•	Evidence Pack pulls Egg Log notes under a “Caregiver Commentary” section
	•	Grandma Plan can seed next week’s nudges from both Jonah’s reflections and Egg Log entries

⸻

📜 Example Update to Project Flow Diagram

   Drop a Crumb → Growth Layer → Evening Reflection
                                  │
                                  ▼
                          🥚 Egg Log (Adult)
                                  │
                                  ▼
                           Translator Engine
                                  │
                                  ▼
                           Evidence Pack


⸻

So:
❌ You don’t have it explicitly in the current plan yet.
✅ It’s easy to add as a small amendment (Phase 3.5 + one new JSON file + small UI card).

⸻

Want me to update your full dev plan .md with this Egg Log amendment, so it’s permanently in the master doc?

Phase 4 — Translator engine
	•	Add js/translator.js (see stub).
	•	evidence.html + js/export.js: totals per subject using summarizeWeek; one-click CSV/PDF.
	•	grandma.html: Soft/Clock toggle; Clock shows subject minutes/day.

Phase 5 — Continuity bridge (planning)
	•	js/planner.js: “Seed from last week” → use translator totals to add 2–4 gentle nudges into grandma-plan.html.
	•	grandma-plan.html: button “Promote to Today” → show minimal schedule on day.html.

Phase 6 — Evidence polish
	•	evidence.html: “Latest Moments (10)” sorted newest-first; include “connection proof” (crumbs that mapped to >1 subject).
	•	Footer line (Mint-safe): Clarity checked. Emotion grounded. Scripture-supported.

Phase 7 — Theme + a11y
	•	css/base.css (or theme-sparksoil.css): tokens --paper --ink --mint --pink --gold.
	•	Add <label class="sr-only"> where inputs lack labels.

⸻

G) View Responsibilities (quick)
	•	index.html + js/hub.js — home swirl + quick stats; optional intersections web.
	•	day.html + crumb-entry.js + dayview.js — Drop a Crumb; stacked day; reflections.
	•	swirlfeed.html — cozy timeline (multi-pillar chips visible).
	•	weekly.html + blooms.js — week counts, relic/statue progress; exports.
	•	evidence.html + translator.js + export.js — subject totals/hours + connection proof.
	•	grandma.html / grandma-plan.html + planner.js — planning overlay; Soft ↔ Clock translator.

⸻

H) Acceptance (Lucy-calm)
	1.	Multi-pillar crumbs show correctly everywhere.
	2.	One crumb with two pillars grows two sprites; relic/statue increments if packet present.
	3.	Reflections nudge translator (e.g., “counted steps” → Math).
	4.	Evidence totals export clean CSV/PDF.
	5.	Grandma Plan seeds from last week and promotes to Today (no blank days).
	6.	Soft/Clock toggles view language only (data unchanged).
	7.	Theme consistent; no console errors.

⸻

I) Issue Queue (copy to GitHub)
	•	P1: Multi-pillar crumbs (crumb-entry.js, blooms.js, chips CSS)
	•	P1: Add storage.js wrapper; migrate reads/writes
	•	P1: Minimal translator.js (pillar + keyword hints)
	•	P1: Evidence uses translator; “Latest 10” sorted desc
	•	P2: relic-growth.js + simple SVGs (Colosseum, Lion Gate, Statue layers)
	•	P2: Evening Reflection micro-UI (day.html, comments.js)
	•	P2: Grandma Soft/Clock toggle + seeded plan (planner.js)
	•	P3: Hub intersections web (optional) + a11y labels
	•	P3: Theme token pass in css/base.css

⸻

J) Guardrails (Ron + Mint + Lucy)
	•	Ron: Translator rules live in js/translator.js, readable + testable. Scripture tie-ins come from data/verses.json only.
	•	Mint: Use “Faith-Safe Language Guide – Sparksoil (Mint Edition)” for all copy. Avoid sniffy terms.
	•	Lucy: All empty states speak plainly: “All clear, nothing here yet 🌱.” Zero mystery.

⸻

K) Evening Reflection (README-ready snippet)

Gentle open

“What do you remember about today that made you smile, think, or try?”

Spark questions (choose 2–3)
	•	Where have I seen this before?
“The lion in Daniel reminds me of the lion in the show.”
	•	What else does this remind me of?
“Dog walking felt like when we read about shepherds.”
	•	Could this count in more than one place?
“Toilet tinkering was Work and Science.”
	•	What did I learn about Jehovah / myself / others?
“Jehovah cares when I try, even if it’s small.”
	•	What part was hardest?
“Finishing the math page without stopping.”
	•	What felt like a win?
“I gave a comment even though I was nervous.”

Output
	•	Soft View: grows sprites/relics & shows intersections.
	•	Clock View: subject log (“3h Language Arts, 1h Science…”).

⸻

L) Notes on “saving” older ideas

Nothing is trashed. If you had proto “subject pages,” move them to dev-notes/archive/. Translator + multi-tagging now carry that weight in-
