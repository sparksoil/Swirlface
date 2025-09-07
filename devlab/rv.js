/* RV Helper — MVP Logbook (Section A) */

(function(){
  const KEY = 'rvhelper.v1.entries';
  const KEY_PEOPLE = 'rvhelper.v1.people';

  let entries = load(KEY, []);
  let people = load(KEY_PEOPLE, []);

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

  renderList();

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

  function onSave(){
    const person = personInput.value.trim();
    const note   = noteInput.value.trim();
    if(!note){ noteInput.focus(); return; }
    const now = Date.now();
    entries.unshift({ id:nid('e'), person: person || undefined, note, created_at: now });
    save(KEY, entries);
    if(person){ upsertPerson(person); }
    noteInput.value = '';
    renderList();
  }

  function onSprinkle(){
    const pool = (window.RV_VERSES||[]);
    if(!pool.length) return;
    const pick = pool[Math.floor(Math.random()*pool.length)];
    const block = `✨ ${pick.verse}\n${pick.thought}\n— ${pick.ask}`;
    noteInput.value = (noteInput.value ? noteInput.value + "\n\n" : "") + block;
    noteInput.focus();
  }

  function onExport(){
    const pack = { type:'rvpack', version:1, exported_at:new Date().toISOString(), entries, people };
    const blob = new Blob([JSON.stringify(pack, null, 2)], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `rv-helper_${tsForFile()}.rvpack.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function onImport(ev){
    const f = ev.target.files?.[0]; if(!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try{
        const pack = JSON.parse(String(reader.result||'{}'));
        if(pack?.type !== 'rvpack'){ alert('Not an .rvpack.json file.'); return; }
        entries = pack.entries||[];
        people  = Array.isArray(pack.people)?pack.people:[];
        save(KEY, entries); save(KEY_PEOPLE, people);
        renderList(); alert('Import complete.');
      }catch(err){ alert('Import failed: '+err.message); }
    };
    reader.readAsText(f); ev.target.value='';
  }

  function onDevClear(){
    if(confirm('Clear Dev Lab local data?')){
      entries=[]; people=[]; save(KEY,entries); save(KEY_PEOPLE,people); renderList();
    }
  }

  function renderList(){
    const now = Date.now();
    let list = entries.slice();
    if(currentFilter==='needs'){
      list = list.filter(e => ageBucket(now - e.created_at) >= 2);
    }else if(currentFilter==='person'){
      const name=prompt('Show entries for which person?'); if(name){
        list=list.filter(e=>(e.person||'').toLowerCase().includes(name.trim().toLowerCase()));
      }
    }
    entriesList.innerHTML = list.map(e=>{
      const ageMs=now-e.created_at;
      const who=e.person?escapeHtml(e.person):'—';
      return `
        <li class="entry ${ageClassName(ageMs)}">
          <div class="row1"><span class="who">${who}</span><span class="age">${ago(e.created_at)}</span></div>
          <div class="note">${linkify(escapeHtml(e.note))}</div>
        </li>
      `;
    }).join('') || `<li class="entry"><div class="note">No entries yet. Drop a crumb and press <b>Save Entry</b>.</div></li>`;
  }

  function qs(s,el=document){return el.querySelector(s);}
  function qsa(s,el=document){return [...el.querySelectorAll(s)];}
  function nid(p){return p+Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-4);}
  function load(k,f){try{const s=localStorage.getItem(k);return s?JSON.parse(s):f;}catch{return f;}}
  function save(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch{}}
  function upsertPerson(name){const t=name.trim();if(!t)return; if(!people.find(p=>p.name.toLowerCase()===t.toLowerCase())){people.push({id:nid('p'),name:t}); save(KEY_PEOPLE,people);} }
  function tsForFile(){const d=new Date();const pad=n=>String(n).padStart(2,'0');return`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}`;}
  function ago(ts){const ms=Date.now()-ts;const d=Math.floor(ms/86400000);if(d>0)return d===1?'1 day ago':`${d} days ago`;const h=Math.floor(ms/3600000);if(h>0)return h===1?'1 hr ago':`${h} hrs ago`;const m=Math.floor(ms/60000);if(m>0)return m===1?'1 min ago':`${m} mins ago`;return'just now';}

  // Brookie seasons: fresh ≤14d, summer 15–44d, fall 45–104d, winter ≥105d
  function ageBucket(ms){const d=ms/86400000; if(d<=14)return 0; if(d<=44)return 1; if(d<=104)return 2; return 3;}
  function ageClassName(ms){const b=ageBucket(ms);const legacy=['age-fresh','age-yellow','age-amber','age-blue'];const seasons=['age-fresh','age-summer','age-fall','age-winter'];return (seasons[b]||seasons[0])+' '+(legacy[b]||legacy[0]);}

  function escapeHtml(s){return s.replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function linkify(s){return s.replace(/(https?:\/\/[^\s]+)/g,'<a href="$1" target="_blank" rel="noopener">$1</a>');}
})();
