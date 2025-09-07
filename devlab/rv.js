/* RV Helper — MVP Logbook (Section A)
   Features: textarea + Save, Sprinkle, list render, local-first storage, export/import.
   Based on Phase A/B file layout from Dev Checklist + Full Plan.  [oai_citation:3‡Swirlface_Dev_Checklist.pdf](file-service://file-UNWdh4Za6QQEZCNBec57BN)  [oai_citation:4‡RV_Helper_Full_Plan.pdf](file-service://file-Wiw2BiFhXoQTt45Y6zNzJS)
*/

(function(){
  const KEY = 'rvhelper.v1.entries';        // entries array
  const KEY_PEOPLE = 'rvhelper.v1.people';   // people list (lightweight, for filters later)

  /** @type {Array<{id:string, person?:string, note:string, verse_used?:string, created_at:number}>} */
  let entries = load(KEY, []);
  /** @type {Array<{id:string, name:string}>} */
  let people = load(KEY_PEOPLE, []);

  // DOM
  const personInput = qs('#personInput');
  const noteInput   = qs('#noteInput');
  const saveBtn     = qs('#saveBtn');
  const sprinkleBtn = qs('#sprinkleBtn');
  const exportBtn   = qs('#exportBtn');
  const importFile  = qs('#importFile');
  const entriesList = qs('#entriesList');
  const devClearBtn = qs('#devClearBtn');
  const filterChips = qsa('.chip');

  let currentFilter = 'all';

  // Init
  renderList();

  // Events
  saveBtn.addEventListener('click', onSave);
  sprinkleBtn.addEventListener('click', onSprinkle);
  exportBtn.addEventListener('click', onExport);
  importFile.addEventListener('change', onImport);
  devClearBtn.addEventListener('click', onDevClear);
  filterChips.forEach(chip=>{
    chip.addEventListener('click', ()=>{
      filterChips.forEach(c=>c.classList.remove('is-active'));
      chip.classList.add('is-active');
      currentFilter = chip.dataset.filter;
      renderList();
    });
  });

  // Save entry
  function onSave(){
    const person = personInput.value.trim();
    const note   = noteInput.value.trim();
    if(!note){
      noteInput.focus();
      return;
    }

    const now = Date.now();
    entries.unshift({
      id: nid('e'), person: person || undefined,
      note, created_at: now
    });
    save(KEY, entries);

    if(person){
      upsertPerson(person);
    }

    // Clear textarea only (keep person for multiple notes)
    noteInput.value = '';
    renderList();
  }

  // Sprinkle: insert a verse thought + question directly into the textarea
  function onSprinkle(){
    const pool = (window.RV_VERSES||[]);
    if(!pool.length) return;
    const pick = pool[Math.floor(Math.random()*pool.length)];
    const block = `✨ ${pick.verse}\n${pick.thought}\n— ${pick.ask}`;
    // append with a spacing line if needed
    noteInput.value = (noteInput.value ? noteInput.value + "\n\n" : "") + block;
    noteInput.focus();
  }

  // Export: .rvpack.json blob of both entries + people
  function onExport(){
    const pack = {
      type: 'rvpack',
      version: 1,
      exported_at: new Date().toISOString(),
      entries,
      people
    };
    const blob = new Blob([JSON.stringify(pack, null, 2)], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `rv-helper_${tsForFile()}.rvpack.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // Import
  function onImport(ev){
    const f = ev.target.files?.[0];
    if(!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try{
        const pack = JSON.parse(String(reader.result||'{}'));
        if(pack?.type !== 'rvpack'){ alert('Not an .rvpack.json file.'); return; }
        if(!Array.isArray(pack.entries)){ alert('Missing entries.'); return; }
        entries = pack.entries;
        people  = Array.isArray(pack.people) ? pack.people : [];
        save(KEY, entries);
        save(KEY_PEOPLE, people);
        renderList();
        alert('Import complete.');
      }catch(err){
        alert('Import failed: ' + err.message);
      }
    };
    reader.readAsText(f);
    // reset input so same file can be picked again if needed
    ev.target.value = '';
  }

  // Dev Lab clear (safety-confirm)
  function onDevClear(){
    if(confirm('Clear Dev Lab local data? This only affects this browser.')){
      entries = [];
      people  = [];
      save(KEY, entries);
      save(KEY_PEOPLE, people);
      renderList();
    }
  }

  // Render
  function renderList(){
    // Filter logic (stub for Section A): “needs water” means older than 22 days; by-person prompts for a name
    const now = Date.now();
    let list = entries.slice(); // newest first

    if(currentFilter === 'needs'){
      list = list.filter(e => ageBucket(now - e.created_at) >= 2); // amber or older
    }else if(currentFilter === 'person'){
      const name = prompt('Show entries for which person name? (case-insensitive)');
      if(name){
        const n = name.trim().toLowerCase();
        list = list.filter(e => (e.person||'').toLowerCase().includes(n));
      }
    }

    entriesList.innerHTML = list.map(e => {
      const ageMs = now - e.created_at;
      const ageClass = ageClassName(ageMs);
      const who = e.person ? escapeHtml(e.person) : '—';
      return `
        <li class="entry ${ageClass}">
          <div class="row1">
            <span class="who">${who}</span>
            <span class="age">${ago(e.created_at)}</span>
          </div>
          <div class="note">${linkify(escapeHtml(e.note))}</div>
        </li>
      `;
    }).join('') || `<li class="entry"><div class="note">No entries yet. Drop a crumb and press <b>Save Entry</b>.</div></li>`;
  }

  // --- Helpers ---
  function qs(s, el=document){ return el.querySelector(s); }
  function qsa(s, el=document){ return [...el.querySelectorAll(s)]; }

  function nid(p){ return p + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4); }

  function load(key, fallback){
    try{
      const s = localStorage.getItem(key);
      return s ? JSON.parse(s) : fallback;
    }catch{ return fallback; }
  }
  function save(key, value){
    try{
      localStorage.setItem(key, JSON.stringify(value));
    }catch(e){
      console.warn('Local save failed', e);
    }
  }

  function upsertPerson(name){
    const trimmed = name.trim();
    if(!trimmed) return;
    const exists = people.find(p => p.name.toLowerCase() === trimmed.toLowerCase());
    if(!exists){
      people.push({ id:nid('p'), name: trimmed });
      save(KEY_PEOPLE, people);
    }
  }

  function tsForFile(){
    const d = new Date();
    const pad = n => String(n).padStart(2,'0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}`;
  }

  function ago(ts){
    const ms = Date.now() - ts;
    const d = Math.floor(ms/86400000);
    if(d > 0) return d===1?'1 day ago':`${d} days ago`;
    const h = Math.floor(ms/3600000);
    if(h > 0) return h===1?'1 hr ago':`${h} hrs ago`;
    const m = Math.floor(ms/60000);
    if(m > 0) return m===1?'1 min ago':`${m} mins ago`;
    return 'just now';
  }

  function ageBucket(ms){
    const days = ms/86400000;
    // Plan thresholds: 0–7, 8–21, 22–45, >45.  [oai_citation:5‡RV_Helper_Full_Plan.pdf](file-service://file-Wiw2BiFhXoQTt45Y6zNzJS)
    if(days <= 7) return 0;        // fresh/green
    if(days <= 21) return 1;       // yellow
    if(days <= 45) return 2;       // amber (Needs water)
    return 3;                       // blue-gray (gentle nudge)
  }
  function ageClassName(ms){
    const b = ageBucket(ms);
    return ['age-fresh','age-yellow','age-amber','age-blue'][b] || 'age-fresh';
  }

  function escapeHtml(s){
    return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }
  function linkify(s){
    return s.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
  }
})();
