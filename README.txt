RON LEDGER — Modular Starter (v1)
=================================

Files
-----
- ron-ledger.html   — structure with clear section comments
- ron-style.css     — styles (Ron base + gentle parchment)
- lucy-mode.css     — optional grayscale/soft mode
- quote-rotator.js  — rotating quotes (modular, safe)
- ron-entries.js    — seed entries only (does not auto-overwrite local data)
- ron-logic.js      — add rows, filter, save to browser, export CSV/JSON
- dev-lab.html      — mini sandbox to test components in isolation

How Saving Works
----------------
• Your *working copy* lives in your browser’s localStorage (STORAGE_KEY: ron-ledger-v1).
• The seed file (ron-entries.js) is *never* overwritten by saving; it’s only used when you click “Load Seed.”
• You can export CSV/JSON anytime to make a manual backup.

Common Gotchas + Soft Logic
---------------------------
• “My entries vanished”: Likely you were editing a single big HTML file and re-saved over your own data.
  This kit separates layout (HTML/CSS/JS) from data (localStorage), so layout edits don’t erase entries.
• “Lucy mode disappeared”: Her CSS now lives in lucy-mode.css. The toggle adds .lucy to <html> only.
• “Quotes stopped rotating”: Their logic is isolated in quote-rotator.js and loaded before ron-logic.js.
• “Password protection?”: Static sites can’t truly secure data. This v1 keeps entries local to your device.
  For real protection later, we can add a passphrase-based encryption layer for localStorage or move to
  a small server/database. For now, keep sensitive data local (do not commit your exports publicly).

Next Steps
----------
1) Open dev-lab.html to experiment safely.
2) Use ron-ledger.html for real entries.
3) When confident, we can add: inline row editing UI, totals by month/client, print view, CSV import, etc.
