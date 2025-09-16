---

# `jonah-swirl-school/playbooks/DayJournal-Comments.md`

```md
# Playbook — Day Journal (stack + comments)

Goal (why): Let Jonah (and family) add short reflections under a day’s crumbs, building a gentle journaling habit that later feeds Evidence.

Scope: `day.html`, `js/dayview.js`, `js/comments.js`, `css/day.css`. Use existing Storage comments API.

---

## Files to touch
- `day.html` (add comments pane under today’s stack)
- `js/dayview.js` (render today’s crumbs + hook comment thread per crumb OR a single “day thread”)
- `js/comments.js` (light helpers if needed: submit, list, sanitize)
- `css/day.css` (layout + readable thread; keep tokens)

---

## Data contract (existing)
- Add comment: `addComment({ crumbId, text })` → stored with `id`, `tsISO`, `author:'jonah'`.  
- Read: `commentsFor(crumbId)` returns an array.  
- Do not mutate crumbs when adding a comment.

---

## Implementation steps

### 1) Markup (day.html)
- Below today’s stacked list, insert:
  ```html
  <section id="dayReflections" class="card" aria-label="Reflections">
    <h2>Reflections</h2>
    <form id="refForm">
      <label class="sr-only" for="refText">Add a reflection</label>
      <textarea id="refText" rows="3" placeholder="What made me smile or think?"></textarea>
      <button type="submit" class="btn">Add</button>
    </form>
    <ul id="refList" class="thread"></ul>
  </section>
