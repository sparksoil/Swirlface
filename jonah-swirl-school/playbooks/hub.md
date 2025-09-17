# SwirlHub-Home.md — Minimal Design Playbook (Agent-Safe)

**Purpose**  
Implement the Hub exactly like the approved mockup: toolbar → banner → spiral SVG centerpiece → five labeled orbs. No extras. Copy must stay Mint-safe (clear, concrete).  

**Files touched**  
- `index.html` (structure only)  
- `css/hub.css` (Hub-specific styles only)  
- `assets/spiral.svg` (centerpiece)

**Pre-checks (do not skip)**  
- Palette tokens are available via `palette.css` (no hex in hub.css).  
- A11y: reduced-motion respected; all interactives have labels/roles.  
- No new globals; JS stays module-scoped if used.

---

## 1) Structure (HTML – minimal)
- **Toolbar** (fixed top): left mini-swirl + “Swirlface”; right **Swirl ⇄ Struct** toggle.  
- **Banner**: Title “Life is Learning”, subtitle “Don’t flatten the swirl.”  
- **Spiral SVG**: single centered SVG element (no wrapper orbs).  
- **Five tokens** (buttons): labels **Spiritual Routine**, **RRR**, **Self**, **Home**, **Business**.  
  - Each token uses `class="token"` and `data-pillar="{pillar}"`.  
  - Each token’s text is inside the orb (not below).

> Guardrails: no extra orbs, doors, captions, or features; keep IDs/classes stable.

---

## 2) Visuals (CSS – reference, don’t restate)
- **Use tokens only** from `palette.css`. Do not define colors in `hub.css`.  
- Background = “Swirl Neutral” from Palette.md; any glow/sparkle uses the public tokens section.  
- If animating, **CSS-only** and **prefers-reduced-motion**-aware. No JS loops.

---

## 3) Pillar mapping (resolve naming drift)

| Pillar (UI)         | `data-pillar` | Palette token (hue) |
|---------------------|---------------|----------------------|
| Spiritual Routine   | `divine`      | `--p-divine`         |
| RRR                 | `rrr`         | `--p-rrr`            |
| Self                | `self`        | `--p-self`           |
| Home                | `home`        | `--p-family` *(reuse hue)* |
| Business            | `work`        | `--p-work`           |

> If you later want to rename `--p-family` → `--p-home`, do it once in `palette.css` and update all references.

---

## 4) Interaction (no scope creep)
- Tap **spiral** → route to `swirlfeed.html` (no orbit UI required).  
- Tap **token** → route `swirlfeed.html#[pillar]`.  
- **Toggle** → switches hub layout mode only (swirl orbit vs fixed grid) when that mode exists; until then, keep it visually present but inert (disabled).  
- Input bar (if present) uses existing crumb wiring; no new storage keys.

---

## 5) Accessibility
- Tokens are `<button role="link" aria-label="Go to [Pillar]">`.  
- Focus visible must be obvious (use existing focus token).  
- Motion: respect `@media (prefers-reduced-motion)`; disable pulses/orbits if set.

---

## 6) Acceptance (done = passes)
1. Page renders with **five** labeled orbs + centered spiral + toolbar; **no extra elements**.  
2. Each orb uses palette hue via token; **no inline colors**.  
3. Clicking the spiral opens Swirlfeed; each orb deep-links to its pillar.  
4. Keyboard: `Tab` reaches toggle, spiral, and all five tokens; `Enter/Space` activates.  
5. Reload: nothing breaks; no console errors.  
6. Reduced-motion ON: animations stop; layout intact.

---

## Tiny fixes before you commit
- **Typo check:** confirm **Self** is the canonical label everywhere.  
- **File name:** rename “Pallet.md” → **Palette.md** so links don’t fork later.  
- **Term tweak:** always call the centerpiece **“Spiral SVG”** (not “sprout”) to stay Mint-safe.
