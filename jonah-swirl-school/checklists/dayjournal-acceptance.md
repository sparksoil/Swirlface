Day Journal — Acceptance Checklist

Layout
	•	Header shows “Today” and current pillar sprite badge.
	•	Body stacks crumb cards, newest first.
	•	Each crumb card has: text, pillar tags, timestamp.
	•	Comment thread renders under correct crumb.
	•	Empty state message appears if no crumbs.

Storage
	•	All reads/writes go through storage.js.
	•	Comments live inside comments: [] array for each crumb.
	•	No extra keys invented outside helpers.

Interactions
	•	Add crumb → appears instantly in stack.
	•	Add comment → shows under correct crumb, persists on reload.
	•	Delete crumb → deletes all its comments too.
	•	Aria-live announces crumb/comment added.

UI & Safety
	•	Calm neutral background (var(--paper)).
	•	Cards have soft corners + subtle shadow.
	•	Comments smaller/indented.
	•	Page respects prefers-reduced-motion.
	•	Text is clear, Mint-safe, non-accusatory.

✅ Pass = Jonah can add crumbs + comments, reload, and all persists with calm layout.
