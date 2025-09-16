**playbooks/3_DayJournal-Comments.md**

Files
	•	day.html
	•	css/day.css
	•	js/day.js
	•	js/storage.js (read/write only through helpers)

Why

Daily is Jonah’s anchor. Needs to feel calm, simple, and “done for the day” without overwhelm.
Start with text crumbs + comments. Photo crumbs can layer in later behind a toggle.

Steps
	1.	Layout
	•	Header = “Today” + sprite badge (dominant pillar).
	•	Body = stacked crumb cards (newest first).
	•	Each card: crumb text, pillar tags, timestamp.
	•	Below = comment thread (plain text, no nesting).
	2.	Storage
	•	Key: swirl_crumbs_jonah (already exists).
	•	Comments nested under comments: [] array per crumb.
	•	All mutations go through storage.js helpers.
	3.	Interactions
	•	Add crumb form (textarea + save).
	•	Add comment button on each crumb → opens inline text field.
	•	Press Enter/save → comment persists via storage helper.
	•	Empty state: “No crumbs yet. Drop one above.”
	4.	UI polish
	•	Calm neutral background (var(--paper)).
	•	Cards soft-cornered (var(--radius)), drop-shadow subtle.
	•	Comments indented, smaller font.
	•	A11y: labels on forms, aria-live="polite" for updates.
	5.	Future stub
	•	Add photo: url field to crumbs, default null.
	•	If exists, render <img> above crumb text.
	•	For now leave unused; comment in code marks stub.

Acceptance
	•	Adding a crumb updates stack instantly.
	•	Adding a comment shows under the right crumb, persists on reload.
	•	Empty state message displays when no crumbs.
	•	Sprite badge shows correct growth state for today’s dominant pillar.
	•	No storage keys invented outside storage.js.
	•	All text is Mint-safe: clear, descriptive, non-accusatory.

Debug checklist
	•	Add crumb, reload, still there.
	•	Add comment, reload, still there.
	•	Delete crumb, comments delete too.
	•	Screen reader announces “Added crumb/comment” via aria-live.
	•	Page respects reduced-motion; no bounce animations.

✅ Done when Jonah can open Day, add crumbs + comments, reload, and see them calm and intact.

⸻

