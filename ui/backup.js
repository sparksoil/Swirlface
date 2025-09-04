// ui/backup.js
// Drop-in backups for Ron Ledger (CSV/JSON export + optional JSON import).
// Works with your existing window.entries array and localStorage keys.

// ---------- BACKUP / EXPORT ----------
(function backupInit(){
  // Versioned keys (future-proof). Falls back to v1 if v2 not present yet.
  const KEY_V1 = 'sparksoil_income_entries_v1';
  const KEY_V2 = 'sparksoil_income_entries_v2';
  const STORAGE_KEY = localStorage.getItem(KEY_V2) ? KEY_V2 : KEY_V1;

  // UI handles
  const byId = s => document.getElementById(s);
  const exportCsvBtn  = byId('exportCsvBtn');
  const exportJsonBtn = byId('exportJsonBtn');
  const importJsonBtn = byId('importJsonBtn');
  const importJsonInp = byId('importJsonInput');

  // Read current entries (prefer in-memory if your page keeps it there)
  function loadEntries(){
    try {
      if (Array.isArray(window.entries) && window.entries.length >= 0) return window.entries;
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  // Save merged entries back to storage + refresh page state if present
  function saveEntries(list){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    if (Array.isArray(window.entries)) window.entries = list;
    if (typeof window.render === 'function') window.render(); // your page exposes render()
  }

  // Utilities
  function downloadBlob(filename, mime, data){
    const blob = new Blob([data], {type: mime});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); }, 0);
  }

  function toCsv(rows){
    // Columns reflect your entry schema—add/remove if you later change fields.
    const cols = [
      'id','date','startDate','endDate','days','isRange','isExpandedChild',
      'client','category','service','platform','method',
      'amount','reserve','net','paid','notes','reservePct'
    ];
    const escape = v => {
      const s = (v===undefined||v===null) ? '' : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s;
    };
    const header = cols.join(',');
    const lines = rows.map(e => cols.map(c => escape(e[c])).join(','));
    return [header, ...lines].join('\n');
  }

  function timestamp(){
    const d = new Date();
    const pad = n => String(n).padStart(2,'0');
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())}_${pad(d.getUTCHours())}-${pad(d.getUTCMinutes())}`;
  }

  // --- Wire buttons ---

  // Export CSV
  exportCsvBtn?.addEventListener('click', ()=>{
    const rows = loadEntries();
    const csv = toCsv(rows);
    downloadBlob(`ron-ledger_${timestamp()}.csv`, 'text/csv;charset=utf-8', csv);
  });

  // Export JSON
  exportJsonBtn?.addEventListener('click', ()=>{
    const rows = loadEntries();
    const json = JSON.stringify(rows, null, 2);
    downloadBlob(`ron-ledger_${timestamp()}.json`, 'application/json', json);
  });

  // Import JSON (optional)
  importJsonBtn?.addEventListener('click', ()=> importJsonInp?.click());
  importJsonInp?.addEventListener('change', ()=>{
    const file = importJsonInp.files && importJsonInp.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try{
        const incoming = JSON.parse(reader.result || '[]');
        if(!Array.isArray(incoming)) throw new Error('Not an array');

        // Merge by id: if same id exists, imported wins; if no id, create one.
        const current = loadEntries();
        const map = new Map(current.map(e=>[e.id, e]));
        for(const e of incoming){
          const id = e.id || crypto.randomUUID();
          map.set(id, {...e, id});
        }
        const merged = Array.from(map.values());
        saveEntries(merged);

        alert('Imported. Ron stacked them on the shelf.');
      }catch(err){
        alert('Import failed. JSON didn’t look like a ledger list.');
      }
      importJsonInp.value = '';
    };
    reader.readAsText(file);
  });
})();

// ---------- (Optional) gentle nudge after 20 logs ----------
(function backupNudge(){
  const NUDGE_KEY = 'sparksoil_backup_nudge_count_v1';
  try{
    const last = Number(localStorage.getItem(NUDGE_KEY) || '0');
    const count = (Array.isArray(window.entries) ? window.entries.length : 0);
    if (count - last >= 20){
      const mark = ()=> localStorage.setItem(NUDGE_KEY, String(count));
      document.getElementById('exportCsvBtn')?.addEventListener('click', mark);
      document.getElementById('exportJsonBtn')?.addEventListener('click', mark);
      console.log('🪵 Nudge: It’s been a bit. Export CSV/JSON to keep Ron happy.');
    }
  }catch{}
})();
