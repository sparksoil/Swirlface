# Hub-Cleanup.md — Code Cleanup & Guardrail Tightening (Agent-Safe)

**Purpose**  
Prevent drift in `index.html` and `hub.css` by consolidating styles, enforcing naming consistency, and keeping accessibility/perf rules intact.  

**Files touched**  
- `index.html`  
- `css/hub.css`  

**Pre-checks**  
- Palette tokens already live in `palette.css` — no new hex codes.  
- Verify no inline `<style>` or color attributes remain.  
- Confirm `index.html` structure matches SwirlHub-Home.md playbook.

---

## 1) HTML Cleanup
- Remove unused IDs/classes from `index.html`.  
- Ensure each orb uses:  
  ```html
  <button class="token" data-pillar="self" aria-label="Go to Self">Self</button>
