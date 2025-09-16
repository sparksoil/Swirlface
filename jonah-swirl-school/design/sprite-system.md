Sprite system (now) vs. Relic builders (later)

A) Pillar Sprites (lightweight, everywhere now)

Purpose: quick, cozy sense of progress for each pillar.

States: seed → sprout → stem → bud → bloom
How they level: each crumb gives +1 to every tagged pillar (multi-tag = multi-gain). Tiny anti-spam guard: max +3 per pillar per day so one mega-crumb doesn’t over-inflate.  ￼

Where they show:
	•	Home (index): inside each spiral “door” as a small corner badge.
	•	Swirlfeed (top bar): 5 mini sprites (one per pillar) as status chips.
	•	Day page header: the pillar you’re currently filtering shows its sprite inline with the title.

Assets: one compact SVG per state per pillar (monoline, neutral fill so CSS can tint).
Example names:
/assets/sprites/{pillar}-{state}.svg → family-seed.svg, self-bud.svg, etc.

Tinting (alive palette):
	•	Family → warm gold
	•	Self → meadow green
	•	Spiritual → soft violet
	•	RRR → sky blue
	•	Work → coral

Storage & math:
	•	Counters: growth_{pillar}_{YYYY-WW} (weekly buckets) and growth_{pillar}_lifetime.
	•	Level thresholds (lifetime): seed(0), sprout(5), stem(12), bud(24), bloom(40).
(Adjustable token in storage.js so we can tune without touching UI.)

Acceptance (what “done” looks like):
	1.	Drop a crumb tagged Family+Work → both Family and Work sprites animate +1.
	2.	Home “door” badges reflect state changes immediately.
	3.	Swirlfeed chips show the same levels; no duplicate math drift across pages.
	4.	Weekly reset only affects the weekly meters; sprite level stays (it’s lifetime-based).

⸻

B) Subject Relic Builders (rich, inside specific spaces later)

Purpose: deep, thematic builds (e.g., Rome → Colosseum reconstructs) that unlock reflection prompts.

Where they live (later):
	•	Inside subject/packet spaces (e.g., “World Powers” view), not on the global pages.
	•	Optional “peek” card in Swirlfeed that links into the module when a threshold is crossed.

Progress rule: crumbs that carry a packet tag (e.g., worldpowers:rome) advance the relic’s steps (e.g., 1→5). Multi-tag still allowed, but only packet-matching crumbs move the relic.

Assets: small stepwise SVG set: rome-1-rubble.svg … rome-5-whole.svg.
Unlocks: at completion, show 1 reflection card + printable artifact.

Why separate: pillar sprites = gentle daily heartbeat; relics = project-scale, story-rich builds. Keeps the hub calm and the learning spaces exciting.  ￼

⸻

C) Tiny UI spec so it plugs right in

CSS tokens: --sprite-size-sm, --sprite-size-md; color via existing pillar hue tokens.
HTML hooks:
	•	Home doors: <img class="sprite-badge" data-pillar="family" src="/assets/sprites/family-bud.svg" alt="Family sprite: bud">
	•	Swirlfeed chips: <button class="chip" data-pillar="work"><img class="sprite" …></button>
	•	Day header: <h1>Today <img class="sprite-inline" …></h1>

JS contract:

// read
getGrowth(pillar) -> { lifetime: number, week: number, level: 'seed'|'sprout'|'stem'|'bud'|'bloom' }
// write
applyCrumbGrowth({ pillars: ['family','work'], ts: '2025-09-16T…' })

Internals stay in storage.js so UI remains dumb/display-only.

⸻

D) What I’ll slot into playbooks
	•	Playbook: Sprites (Pillar) — Build & Wire
	•	Files touched: storage.js, index.html, swirlfeed.html, day.html, css/base.css, css/landing.css.
	•	Steps: counters → thresholds → renderers → ARIA labels → anti-spam cap → acceptance test.
	•	Playbook: Relic Builder — World Powers: Rome (Later)
	•	Files: modules/worldpowers/rome.html, rome-relic.js, assets/relics/rome-*.svg.
	•	Steps: tag schema → progression → unlocks → printable.

