# Playbook — SwirlFeed (Instagram-style)

Goal (why): Make `swirlfeed.html` feel like a real social feed: stories row at top, card posts per day, like/comment/share row, open-day details. Familiar layout reduces friction and invites reflection.

Scope: HTML/CSS/JS only inside `jonah-swirl-school/`. No external libs, no network.

---

## Files to touch
- `swirlfeed.html` (markup shell)
- `css/swirlfeed.css` (IG-like layout + tokens)
- `js/swirlfeed.js` (data → UI: stories, posts, actions)
- `js/storage.js` (add tiny reactions helper — local storage list keyed by crumb id; non-breaking)

---

## Data contract (do not break)
- Crumbs come from `listCrumbs()` (newest first). Each crumb: `{ id, tsISO, text, pillars[], media[]? }`.
- Comments remain in `comments.json` via Storage (no change here).
- Reactions (new): store per-crumb “like” as a local set `<string[]>` of crumb ids for the current device only.

Add to `storage.js` (non-destructive):
```js
// Near bottom before export _all()
const REACT_KEY = 'swirl_reacts_like_jonah';
function _likes(){ try{ return new Set(JSON.parse(localStorage.getItem(REACT_KEY)||'[]')); }catch{ return new Set(); } }
function _saveLikes(set){ localStorage.setItem(REACT_KEY, JSON.stringify([...set])); }
export function isLiked(crumbId){ return _likes().has(crumbId); }
export function toggleLike(crumbId){
  const s=_likes();
  if(s.has(crumbId)) s.delete(crumbId); else s.add(crumbId);
  _saveLikes(s);
  try{ window.dispatchEvent(new CustomEvent('swirl:changed', { detail:{ type:'like_toggle', crumbId }})); }catch{}
  return s.has(crumbId);
}
