# AGENTS — Jonah Swirl School

Purpose: give agents crisp, unambiguous instructions to safely evolve this app.  
Style: minimal checklists + 1–2 sentence context. Copy must stay Mint-safe (clear, grounded, kind).

---

## Mission & Voice
Translate lived moments (“crumbs”) into understandable views (Feed, Day, Weekly, Evidence) **without** losing warmth.  
Use plain, gentle copy per Mint guide (no snark; assume good intent).

---

## Guardrails
1. **Data spine:** Read/write crumbs/comments ONLY through `js/storage.js`. Do not invent new keys without a playbook step.  
2. **Theme tokens:** Use CSS variables from `css/base.css` (paper/ink/accent/season). No hardcoded colors except where a playbook specifies.  
3. **A11y:** Every interactive element has a label/role; focus-visible states must remain visible.  
4. **No new globals:** New JS is ES module-scoped; import what you use.  
5. **Local-first:** No network calls, trackers, or external fonts.  
6. **Perf:** Keep bundle-less; DOM-only. Avoid reflow thrash (batch DOM writes), and debounce inputs.  
7. **Copy safety:** Follow Mint-Safe language (clear, concrete, non-accusatory).

---

## Repo Doors
- `index.html` → Hub swirl (entry + quick drop)  
- `day.html` → Today’s stacked entries + comments  
- `swirlfeed.html` → Scrollable feed (Instagram-style)  
- `weekly.html` → Bars/blooms overview  
- `evidence.html` → Subject log + exports  
- `grandma.html`, `grandma-plan.html` → Planning

---

## Task Taxonomy

### Build
- Create new feature views or modules.  
- Example: **Playbook: Day Journal (stack + comments)**  

### Polish
- Improve visuals and micro-interactions.  
- Example: **Playbook: SwirlFeed IG-style**  
- **Hub Layout:** Remove the central “door” on `index.html` and replace with the spiral SVG design. Keep temporary instruction overlay but style it as an unobtrusive guide.  

### Extend
- Add optional features behind clear toggles.  
- Example: pin-guard, lightbox gallery, hash routing.  

### Test
- Run checklists before/after any change.  
- Example: `/checklists/bring-up.md` (smoke), `/checklists/ig-feed-acceptance.md` (feed polish).

---

## Bring-up Checklist (always run after changes)

1. Load `index.html` → click each pillar token → confirm it routes to `swirlfeed.html#<pillar>`.  
2. In `day.html`, drop a quick crumb → confirm it appears in today’s stack.  
3. Open `swirlfeed.html` → see new crumb under today; filters work; no console errors.  
4. Search box responds with debounce; empty states read plainly.  
5. Keyboard: `Tab` reaches all controls; `Enter/Space` activates; focus outline visible.  
6. Refresh → state persists (crumbs/comments/likes where implemented).
