# 🌀 Jonah’s Swirl School (Translator Framework)

**Identity:**  
Not a “school app.”  
Not a “planner.”  
Swirl School is a **Translator**:  
✨ Soft-Time lived moments → Clock-Time subject logs  
Without losing their glimmer.

Every crumb Jonah drops is:  
- A **moment** (Soft view)  
- A **connection** (Intersections view)  
- A **skill/subject proof** (Clock view)  

---

## 📂 Repo Structure (with Purpose)

### Root HTML Views
- **index.html** → Home hub, animated swirl.  
- **day.html** → Drop/view crumbs (heartbeat).  
- **swirlfeed.html** → Scrollable feed (IG-style).  
- **weekly.html** → Bars + blooms for weekly patterns.  
- **evidence.html** → Clock-Time subject log + “proof of school.”  
- **grandma.html** → Planning mode (light grid).  
- **grandma-plan.html** → Next-week plan seeded from crumbs.

✅ **KEEP** all of these. They are the framework’s doors.

---

### JS Modules (logic brains)
- **crumb-entry.js** → Logs crumbs {id, date, text, photo?, tags[]}.  
- **dayview.js** → Groups + comments for daily review.  
- **hub.js** → Draws swirl hub, handles glow + navigation.  
- **planner.js** → Seeds next week’s nudges from past crumbs.  
- **weekly.js** (inside weekly.html) → Computes weekly counts/blooms.  
- **export.js** → Download JSON/CSV for backup.  
- **blooms.js** → Growth animations (sprite/relic progress).  
- **comments.js** → Threaded notes per crumb.  
- **photos.js** → Handles photo crumbs.  
- **settings.js** → Toggles (Shoeday collapse, reduced motion).  
- **season.js** → Optional seasonal theming.  
- **pin.js** → Pin/star a crumb for highlight.

🔄 **SHIFT PURPOSE**:
- Add **translator.js**: maps crumbs → subjects.  
- Add **relic-growth.js**: builds relics/statue layers per prophecy/history packet.

---

### Data Store (/data)
- **crumbs.json** → all logged moments.  
- **comments.json** → reflections per crumb.  
- **honeycomb.json** → enrichment sparks/prompts.  
- **verses.json** → scripture tie-ins.  
- **settings.json** → user prefs (Shoeday, colors, etc.).  
- **audit.log** → debug/tracking.

✅ **KEEP.**  
Schema update: allow `tags[]` (multi-pillar) + `subjects[]` (translator output).

---

### CSS (/css)
- **base.css** → global tokens (paper, ink, mint, pink, gold).  
- **day.css, weekly.css, grandma.css, evidence.css, etc.** → per-view layouts.  
- **hub.css** → swirl animations + glow.

✅ **KEEP.**  
Add `theme-sparksoil.css` for palette control across all views.

---

## 🔑 Core Flows

### 1. Drop a Crumb (Soft View)
- Jonah logs text/photo + tags.  
- Stored in crumbs.json.  
- Feeds sprite/relic growth.

### 2. Growth (Intersections View)
- Each tag increments multiple swirls if >1 pillar.  
- Relics (e.g., Colosseum) rebuild as subject-packets progress.  
- Statue layers (Daniel 2) unlock as world powers are logged.

### 3. Reflection
- Evening prompts:  
  - “Where have I seen this before?”  
  - “What else does it remind me of?”  
  - “Could this count in more than one place?”  

### 4. Translator Layer (Clock View)
- Crumbs mapped into school subjects:  
  - Reading/Writing, Math, Science, Social Studies, PE/Health, Art, Bible.  
- Stored in `subjects[]` array per crumb.  
- Evidence Pack generates reports.

### 5. Planning Layer
- Grandma Plan seeds from recent crumbs → Next-week goals.  
- Shows both Soft (swirl prompts) + Clock (subject coverage) modes.

---

## ✅ What to Keep
- All existing HTML/JS/CSS structure.  
- Data folder with crumbs, prompts, verses.  
- Grandma Plan + Evidence Pack.

## 🔄 What to Shift
- Sprites → Relic builders/statue layers.  
- Goals → Weekly nudges from past crumbs.  
- Honeycomb prompts → Prophecy/history sparks.

## ❌ What to Archive
- Any rigid “subject page” ideas (Math.html, History.html).  
- Overly heavy dashboards beyond Evidence Pack.

---

## 🧭 Next Build Pebbles
1. Add `translator.js` (crumb → subjects).  
2. Add `relic-growth.js` (prophecy/history builds).  
3. Update crumbs.json schema for `tags[]` + `subjects[]`.  
4. Style palette globally in `theme-sparksoil.css`.  
5. Write soft/clock toggle into Grandma Plan + Evidence.  

---

✨ Guiding Truth:  
**Swirl School is not a school.  
It’s a translator.  
Soft-Time is already learning.  
Clock-Time is just the printout.**  

# 🌀 Swirl School: Translator Framework README

Welcome to **Swirl School**, a gentle, glimmer-rooted learning system designed to honor *Soft Time* while translating it into *Clock Time* when needed.

At its heart, Swirl School is a **translator** — not just a planner or tracker.

It helps neurodivergent and faith-centered learners:
- Live naturally in nonlinear, curiosity-led learning.
- Reflect gently with evening prompts.
- Generate valid educational records (proof of learning) without leaving the swirl.

---

## 🧭 Core Flow (Soft to Clock)

```text
                ┌───────────────────────────┐
                │   📝 Drop a Crumb         │
                │   (Day page)              │
                │   text • photo • tags     │
                └──────────┬────────────────┘
                           │
                           ▼
                ┌───────────────────────────┐
                │   💾 Store in Spine       │
                │   (storage.js local keys) │
                └──────────┬────────────────┘
                           │
                           ▼
        ┌────────────────────────────────────────────────┐
        │   🌱 Growth Layer                              │
        │   - Sprite grows in multiple pillars           │
        │   - Relic Builders (Colosseum, Lion Gate, etc.)│
        │   - Statue Layers (Daniel 2)                   │
        └──────────┬─────────────────────────────────────┘
                   │
   ┌───────────────┼─────────────────────────────┬───────────────┐
   ▼               ▼                             ▼               ▼
┌───────┐     ┌──────────┐                 ┌───────────┐    ┌───────────┐
│ 👑    │     │ 🏡       │                 │ 🌱 Self   │    │ 📚 RRR    │
│Spiritual│  │Family    │                 │           │    │Reading/   │
│Routine │  │           │                 │           │    │Math/Tech │
└───────┘     └──────────┘                 └───────────┘    └───────────┘
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
                │  - “Where have I seen this│
                │     before?”              │
                │  - “Could it count twice?”│
                │ Parent/Grandma tags swirls│
                └──────────┬────────────────┘
                           │
                           ▼
                ┌───────────────────────────┐
                │ 🔀 Translator Engine      │
                │ Maps crumbs → Subjects    │
                │  - Language Arts          │
                │  - Math                   │
                │  - Science                │
                │  - Social Studies         │
                │  - Art                    │
                │  - PE/Health              │
                │  - Bible                  │
                └──────────┬────────────────┘
                           │
                           ▼
                ┌───────────────────────────┐
                │ 📦 Evidence Pack          │
                │ Auto-generates subject    │
                │ logs + hours for “school” │
                │ (Clock Time proof)        │
                └──────────┬────────────────┘
                           │
                           ▼
                ┌───────────────────────────┐
                │ 📅 Planning Mode          │
                │ Seeds last week’s crumbs  │
                │ into next week’s plan     │
                └──────────┬────────────────┘
                           │
                           ▼
                  (loop back to Drop a Crumb)
```

---

🪞 This framework honors presence and curiosity *first*, while ensuring structure, growth, and documentation *follow gently behind*.
