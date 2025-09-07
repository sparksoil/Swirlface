/* RV Helper — Section E1 (Cards View) */

(function(){
  const KEY='rvhelper.v1.entries';
  const KEY_PEOPLE='rvhelper.v1.people';

  /** entries: {id, person?, note, type?, care?, created_at} */
  let entries=load(KEY,[]);
  /** people: {id, name, stage, last_touch} */
  let people=load(KEY_PEOPLE,[]);

  // MIGRATION: ensure people have stage/last_touch
  const now0 = Date.now();
  let migrated=false;
  people.forEach(p=>{
    if(typeof p.stage!=='number'){ p.stage=0; migrated=true; }
    if(typeof p.last_touch!=='number'){ p.last_touch=now0; migrated=true; }
  });
  if(migrated) save(KEY_PEOPLE,people);

  // DOM
  const personInput=qs('#personInput'), noteInput=qs('#noteInput');
  const saveBtn=qs('#saveBtn'), sprinkleBtn=qs('#sprinkleBtn'), exportBtn=qs('#exportBtn');
  const importFile=qs('#importFile'), entriesList=qs('#entriesList'), devClearBtn=qs('#devClearBtn');
  const filterChips=qsa('.chip'), circlesBox=qs('#peopleCircles');

  const listPanel=qs('#listPanel');
  const cardsGrid=qs('#cardsGrid');
  const btnViewList=qs('#btnViewList'), btnViewCards=qs('#btnViewCards'), btnViewMap=qs('#btnViewMap');

  const detailBox=qs('#personDetail'), detailName=qs('#detailName'), detailEntries=qs('#detailEntries');
  const detailStage=qs('#detailStage'), detailLastTouch=qs('#detailLastTouch');
  const closeDetail=qs('#closeDetail');
  const btnVisit=qs('#btnVisit'), btnAttempt=qs('#btnAttempt'), btnCareOnly=qs('#btnCareOnly'), chkCare=qs('#chkCare');

  let currentFilter='all';
  let activePersonId=null;
  let currentView='list'; // 'list' | 'cards'

  // Boot
  renderList(); renderCircles(); renderCards();
  syncView();

  // Events
  saveBtn?.addEventListener('click',onSave);
  sprinkleBtn?.addEventListener('click',onSprinkle);
  exportBtn?.addEventListener('click',onExport);
  importFile?.addEventListener('change',onImport);
  devClearBtn?.addEventListener('click',onDevClear);
  closeDetail?.addEventListener('click',()=>detailBox.classList.add('hidden'));
  filterChips.forEach(chip=>chip.addEventListener('click',()=>{
    filterChips.forEach(c=>c.classList.remove('is-active'));
    chip.classList.add('is-active');
    currentFilter=chip.dataset.filter;
    renderList();
  }));

  btnVisit?.addEventListener('click',()=>applyGrowth('visit', /*care=*/false));
  btnAttempt?.addEventListener('click',()=>applyGrowth('attempt', !!chkCare?.checked));
  btnCareOnly?.addEventListener('click',()=>applyGrowth('care', true));

  // View switch
  btnViewList?.addEventListener('click',()=>{ setView('list'); });
  btnViewCards?.addEventListener('click',()=>{ setView('cards'); });

  function setView(v){
    currentView=v;
    [btnViewList, btnViewCards].forEach(b=>b?.classList.remove('is-active'));
    (v==='list'?btnViewList:btnViewCards)?.classList.add('is-active');
    syncView();
  }
  function syncView(){
    if(currentView==='list'){
      listPanel?.classList.remove('hidden');
      cardsGrid?.classList.add('hidden');
    }else{
      listPanel?.classList.add('hidden');
      cardsGrid?.classList.remove('hidden');
    }
  }

  // --- Actions ---
  function onSave(){
    const person=personInput.value.trim();
    const note=noteInput.value.trim();
    if(!note){ noteInput.focus(); return; }
    const now=Date.now();

    entries.unshift({ id:nid('e'), person: person||undefined, note, type:'note', created_at: now });
    save(KEY,entries);

    if(person){
      const p = upsertPerson(person);
      p.last_touch = now;           // saving a note counts as a touch
      save(KEY_PEOPLE,people);
    }

    noteInput.value='';
    renderList(); renderCircles(); renderCards();
  }

  function onSprinkle(){
    const pool=(window.RV_VERSES||[]); if(!pool.length) return;
    const pick=pool[Math.floor(Math.random()*pool.length)];
    const block=`✨ ${pick.verse}\n${pick.thought}\n— ${pick.ask}`;
    noteInput.value=(noteInput.value?noteInput.value+"\n\n":"")+block;
    noteInput.focus();
  }

  function applyGrowth(kind, careFlag){
    if(!activePersonId) return;
    const person = people.find(p=>p.id===activePersonId);
    if(!person) return;
    const now = Date.now();

    // Stage math (Visit +1, Attempt+Care +0.5, Care-only +0.5; cap 6)
    let delta = 0;
    if(kind==='visit') delta = 1;
    else if(kind==='attempt' && careFlag) delta = 0.5;
    else if(kind==='care') delta = 0.5;

    person.stage = clampStage((person.stage||0) + delta);
    person.last_touch = now;
    save(KEY_PEOPLE, people);

    // Truthful log line
    const noteMap = {
      visit: 'Visit recorded (+1 stage).',
      attempt: careFlag ? 'Attempt noted (Care checked: +0.5).' : 'Attempt noted (no care).',
      care: 'Care-only recorded (+0.5).'
    };
    entries.unshift({
      id: nid('e'),
      person: person.name,
      note: noteMap[kind],
      type: kind,
      care: !!careFlag,
      created_at: now
    });
    save(KEY, entries);

    openDetail(person.id);
    renderList(); renderCircles(); renderCards();
    if(kind!=='attempt') chkCare.checked = false;
  }

  function onExport(){
    const pack={ type:'rvpack', version:1, exported_at:new Date().toISOString(), entries, people };
    const blob=new Blob([JSON.stringify(pack,null,2)],{type:'application/json'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download=`rv-helper_${tsForFile()}.rvpack.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function onImport(ev){
    const f=ev.target.files?.[0]; if(!f) return;
    const reader=new FileReader();
    reader.onload=()=>{
      try{
        const pack=JSON.parse(String(reader.result||'{}'));
        if(pack?.type!=='rvpack'){ alert('Not an .rvpack.json file.'); return; }
        entries = Array.isArray(pack.entries)?pack.entries:[];
        people  = Array.isArray(pack.people)?pack.people:[];
        const now=Date.now();
        people.forEach(p=>{ if(typeof p.stage!=='number') p.stage=0; if(typeof p.last_touch!=='number') p.last_touch=now; });
        save(KEY,entries); save(KEY_PEOPLE,people);
        renderList(); renderCircles(); renderCards(); alert('Import complete.');
      }catch(err){ alert('Import failed: '+err.message); }
    };
    reader.readAsText(f);
    ev.target.value='';
  }

  function onDevClear(){
    if(confirm('Clear Dev Lab local data?')){
      entries=[]; people=[];
      save(KEY,entries); save(KEY_PEOPLE,people);
      renderList(); renderCircles(); renderCards();
      detailBox.classList.add('hidden');
    }
  }

  // --- Renderers ---
  function renderList(){
    const now=Date.now();
    let list=entries.slice();
    if(currentFilter==='needs'){
      list=list.filter(e=>ageBucket(now-e.created_at)>=2);
    }else if(currentFilter==='person'){
      const name=prompt('Which person?');
      if(name) list=list.filter(e=>(e.person||'').toLowerCase().includes(name.trim().toLowerCase()));
    }
    entriesList.innerHTML =
      list.map(e=>{
        const who=e.person?escapeHtml(e.person):'—';
        const tag = e.type ? ` <em>[${e.type}${e.care?'+care':''}]</em>` : '';
        return `
          <li class="entry ${ageClassName(now-e.created_at)}">
            <div class="row1"><span class="who">${who}${tag}</span><span class="age">${ago(e.created_at)}</span></div>
            <div class="note">${linkify(escapeHtml(e.note||''))}</div>
          </li>
        `;
      }).join('') ||
      `<li class="entry"><div class="note">No entries yet. Drop a crumb and press <b>Save Entry</b>.</div></li>`;
  }

  function renderCircles(){
    const now = Date.now();
    circlesBox.innerHTML = people.map(p=>{
      const age = now - (p.last_touch||now);
      return `<div class="circle ${ageClassName(age)}" data-id="${p.id}" title="${escapeHtml(p.name)}">${escapeHtml(p.name[0]||'?')}</div>`;
    }).join('');
    qsa('.circle',circlesBox).forEach(c=>c.addEventListener('click',()=>openDetail(c.dataset.id)));
  }

  // Cards (E1)
  function renderCards(){
    if(!cardsGrid) return;
    const now = Date.now();
    const rows = people.map(p=>{
      const age = now - (p.last_touch||now);
      const b = ageBucket(age);
      const seasonBadge = ['season-fresh','season-summer','season-fall','season-winter'][b] || 'season-fresh';
      const verse = lastScriptureFor(p.name) || suggestScripture();
      const stage = clampStage(p.stage||0);
      return `
        <article class="card">
          <div class="row-top">
            <div class="stage-icon" aria-hidden="true">${seedSvg(stage)}</div>
            <div>
              <div class="name">${escapeHtml(p.name)}</div>
              <div class="badges">
                <span class="badge ${seasonBadge}">${seasonLabel(b)}</span>
                <span class="badge">Stage ${formatStage(stage)}</span>
                <span class="badge">${ago(p.last_touch||now)}</span>
              </div>
            </div>
          </div>
          <div class="scripture">${escapeHtml(verse)}</div>
          <div class="actions">
            <button data-act="visit" data-id="${p.id}">Visit +1</button>
            <button data-act="care" data-id="${p.id}">Care +0.5</button>
            <button data-act="open" data-id="${p.id}" class="ghost">Open</button>
          </div>
        </article>
      `;
    }).join('') || `<div class="muted">No people yet. Save a note with a name to create a card.</div>`;

    cardsGrid.innerHTML = rows;

    // Wire actions
    qsa('[data-act="visit"]', cardsGrid).forEach(b=>b.addEventListener('click', ()=>{
      activePersonId = b.dataset.id; applyGrowth('visit', false);
    }));
    qsa('[data-act="care"]', cardsGrid).forEach(b=>b.addEventListener('click', ()=>{
      activePersonId = b.dataset.id; applyGrowth('care', true);
    }));
    qsa('[data-act="open"]', cardsGrid).forEach(b=>b.addEventListener('click', ()=>{
      openDetail(b.dataset.id);
    }));
  }

  function openDetail(pid){
    const person=people.find(p=>p.id===pid); if(!person) return;
    activePersonId = pid;
    detailName.textContent=person.name;
    detailStage.textContent = stageLabel(person.stage);
    detailLastTouch.textContent = 'Last touch: ' + ago(person.last_touch||Date.now());
    const list=entries.filter(e=>(e.person||'')===person.name);
    detailEntries.innerHTML=list.map(e=>`<div><b>${ago(e.created_at)}</b>: ${escapeHtml(e.note||'')}</div>`).join('')||"<i>No entries yet.</i>";
    detailBox.classList.remove('hidden');
  }

  // --- Helpers ---
  function qs(s,el=document){return el.querySelector(s);}
  function qsa(s,el=document){return[...el.querySelectorAll(s)];}
  function nid(p){return p+Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-4);}
  function load(k,f){try{const s=localStorage.getItem(k);return s?JSON.parse(s):f;}catch{return f;}}
  function save(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch{}}

  function upsertPerson(name){
    const t=name.trim(); if(!t) return null;
    let person = people.find(p=>p.name.toLowerCase()===t.toLowerCase());
    if(!person){
      person = { id:nid('p'), name:t, stage:0, last_touch:Date.now() };
      people.push(person);
      save(KEY_PEOPLE,people);
    }
    return person;
  }

  function tsForFile(){const d=new Date(),pad=n=>String(n).padStart(2,'0');return`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}`;}
  function ago(ts){const ms=Date.now()-ts,d=Math.floor(ms/86400000);if(d>0)return d===1?'1 day ago':`${d} days ago`;const h=Math.floor(ms/3600000);if(h>0)return h===1?'1 hr ago':`${h} hrs ago`;const m=Math.floor(ms/60000);if(m>0)return m===1?'1 min ago':`${m} mins ago`;return'just now';}

  // Seasonal buckets (your addendum): Fresh ≤14d; Summer 15–44d; Fall 45–104d; Winter ≥105d
  function ageBucket(ms){const d=ms/86400000; if(d<=14)return 0; if(d<=44)return 1; if(d<=104)return 2; return 3;}
  function ageClassName(ms){
    const b=ageBucket(ms);
    const legacy=['age-fresh','age-yellow','age-amber','age-blue'];
    const seasons=['age-fresh','age-summer','age-fall','age-winter'];
    return (seasons[b]||seasons[0])+' '+(legacy[b]||legacy[0]);
  }
  function seasonLabel(b){ return ['Fresh','Summer','Fall','Winter'][b]||'Fresh'; }

  function stageLabel(val){
    const clamped = clampStage(val||0);
    return `Stage ${formatStage(clamped)} / (0 Seed → 6 Budding)`;
  }
  function clampStage(v){ return Math.max(0, Math.min(6, v)); }
  function formatStage(v){ return (Math.round(v*2)/2).toString(); } // 0.5 steps

  // Find most recent "✨ <verse>" in their notes
  function lastScriptureFor(name){
    if(!name) return null;
    for(const e of entries){
      if((e.person||'')===name && typeof e.note==='string'){
        const m = e.note.match(/✨\s*([^\n]+)/);
        if(m) return m[1].trim();
      }
    }
    return null;
  }
  // Suggest one from pool if none found
  function suggestScripture(){
    const pool=(window.RV_VERSES||[]);
    if(!pool.length) return '—';
    const pick=pool[Math.floor(Math.random()*pool.length)];
    return `${pick.verse} — ${pick.thought}`;
  }

  // Minimal seed sprite inline via <use> (requires seed-sprites.svg file)
  function seedSvg(stageNum){
    const s = clampStage(stageNum||0);
    const id = Math.round(s); // 0..6
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><use href="./seed-sprites.svg#seed-${id}"></use></svg>`;
  }
})();

// Boot flag for HTML warning
window.__RV_BOOTED = true;
