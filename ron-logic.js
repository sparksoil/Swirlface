// =========================
// RON LOGIC — local, modular, spoon-safe
// =========================

(function(){
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  const STORAGE_KEY = "ron-ledger-v1";

  /** State */
  let entries = [];   // live in memory

// Fallback for randomUUID
if(!('crypto' in window) || !crypto.randomUUID){
  window.crypto = window.crypto || {};
  crypto.randomUUID = function(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c){
      const r = Math.random()*16|0, v = c==='x'?r:(r&0x3|0x8); return v.toString(16);
    });
  };
}
  let filters = { client:"", month:"", paid:"" };

  /** Elements */
  const form = $("#entryForm");
  const body = $("#ledgerBody");
  const subtotalCell = $("#subtotalCell");

  const filterClient = $("#filterClient");
  const filterMonth  = $("#filterMonth");
  const filterPaid   = $("#filterPaid");

  $("#applyFilters").addEventListener("click", applyFilters);
  $("#resetFilters").addEventListener("click", resetFilters);

  $("#loadSeed").addEventListener("click", loadSeed);
  $("#saveLocal").addEventListener("click", saveLocal);
  $("#clearLocal").addEventListener("click", clearLocal);
  $("#exportCSV").addEventListener("click", exportCSV);
  $("#exportJSON").addEventListener("click", exportJSON);

  $("#clearForm").addEventListener("click", () => form.reset());

  // Lucy toggle (adds/removes .lucy on <html>)
  $("#lucyToggle").addEventListener("change", (e)=>{
    document.documentElement.classList.toggle("lucy", e.target.checked);
  });

  // Business mode toggle
  const bizToggle = document.getElementById("bizToggle");
  if(bizToggle){
    bizToggle.addEventListener("change", (e)=>{
      document.documentElement.classList.toggle("business", e.target.checked);
    });
  }

  // Initialize
  loadLocal();
  render();

  // =============== Form handling ===============
  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    const data = new FormData(form);
    const entry = {
      id: crypto.randomUUID(),
      client: (data.get("client")||"").trim(),
      date: data.get("date"),
      service: data.get("service"),
      amount: Number(data.get("amount")) || 0,
      paid: data.get("paid") || "No",
      notes: (data.get("notes")||"").trim()
    };
    entries.push(entry);
    form.reset();
    render();
  });

  // =============== Filters ===============
  function applyFilters(){
    filters.client = (filterClient.value||"").trim().toLowerCase();
    filters.month  = filterMonth.value;
    filters.paid   = filterPaid.value;
    render();
  }
  function resetFilters(){
    filters = { client:"", month:"", paid:"" };
    filterClient.value = "";
    filterMonth.value  = "";
    filterPaid.value   = "";
    render();
  }

  // =============== Seed / Local ===============
  function loadSeed(){
    if(Array.isArray(window.RON_SEED)){
      // only add seed items that aren't present (by id)
      const have = new Set(entries.map(e=>e.id));
      const added = [];
      for(const row of window.RON_SEED){
        if(!have.has(row.id)){
          entries.push({...row});
          added.push(row.id);
        }
      }
      if(added.length === 0){
        alert("Seed already loaded.");
      }else{
        alert(`Loaded ${added.length} seed row(s).`);
      }
      render();
    }else{
      alert("No seed found.");
    }
  }

  function saveLocal(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    alert("Saved to this browser.");
  }
  function loadLocal(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if(raw){
        const arr = JSON.parse(raw);
        if(Array.isArray(arr)) entries = arr;
      }else{
        // start empty; on first run, auto-seed if available
        entries = [];
        try{
          if(Array.isArray(window.RON_SEED) && window.RON_SEED.length){
            entries = window.RON_SEED.map(x=>({...x}));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); // save immediately
          }
        }catch(_e){}
      }
    }catch(err){
      console.error(err);
      entries = [];
    }
  }
  function clearLocal(){
    if(confirm("Clear the browser copy of your ledger? (Your ron-entries.js stays the same.)")){
      localStorage.removeItem(STORAGE_KEY);
      entries = [];
      render();
    }
  }

  // =============== Export ===============
  function exportCSV(){
    const rows = [["date","client","service","amount","paid","notes"]];
    for(const e of visibleEntries()){
      rows.push([e.date, e.client, e.service, String(e.amount), e.paid, e.notes]);
    }
    const csv = rows.map(r=>r.map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(",")).join("\n");
    downloadFile("ron-ledger.csv", "text/csv", csv);
  }
  function exportJSON(){
    const json = JSON.stringify(visibleEntries(), null, 2);
    downloadFile("ron-ledger.json", "application/json", json);
  }
  function downloadFile(filename, type, data){
    const blob = new Blob([data], {type});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=>URL.revokeObjectURL(url), 1000);
  }

  // =============== Render ===============
  function visibleEntries(){
    return entries.filter(e => {
      if(filters.client && !e.client.toLowerCase().includes(filters.client)) return false;
      if(filters.paid && e.paid !== filters.paid) return false;
      if(filters.month){
        // filters.month is YYYY-MM; compare prefix of e.date
        if(!String(e.date||"").startsWith(filters.month)) return false;
      }
      return true;
    }).sort((a,b)=> String(a.date).localeCompare(String(b.date)));
  }

  function render(){
    body.innerHTML = "";
    const list = visibleEntries();
    let subtotal = 0;

    for(const e of list){
      subtotal += Number(e.amount)||0;
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${escapeHTML(e.date||"")}</td>
        <td>${escapeHTML(e.client||"")}</td>
        <td>${escapeHTML(e.service||"")}</td>
        <td class="num">$${Number(e.amount||0).toFixed(2)}</td>
        <td>${escapeHTML(e.paid||"")}</td>
        <td>${escapeHTML(e.notes||"")}</td>
        <td class="num">
          <button class="btn ghost" data-id="${e.id}" data-act="edit">Edit</button>
          <button class="btn danger" data-id="${e.id}" data-act="del">Delete</button>
        </td>
      `;
      body.appendChild(tr);
    }

    subtotalCell.textContent = `$${subtotal.toFixed(2)}`;

    // wire row buttons
    body.querySelectorAll("button").forEach(btn=>{
      btn.addEventListener("click", onRowAction);
    });
  }

  function onRowAction(e){
    const btn = e.currentTarget;
    const id = btn.getAttribute("data-id");
    const act = btn.getAttribute("data-act");
    const idx = entries.findIndex(x=>x.id===id);
    if(idx<0) return;

    if(act==="del"){
      if(confirm("Delete this row?")){
        entries.splice(idx,1);
        render();
      }
    }else if(act==="edit"){
      const item = entries[idx];
      // quick edit via prompts (simple for v1; can replace later with inline editor)
      const client = prompt("Client:", item.client); if(client===null) return;
      const date   = prompt("Date (YYYY-MM-DD):", item.date); if(date===null) return;
      const service= prompt("Service:", item.service); if(service===null) return;
      const amount = prompt("Amount:", String(item.amount)); if(amount===null) return;
      const paid   = prompt("Paid (Yes/No):", item.paid); if(paid===null) return;
      const notes  = prompt("Notes:", item.notes); if(notes===null) return;

      Object.assign(item, {
        client: client.trim(), date, service, amount: Number(amount)||0, paid, notes: notes.trim()
      });
      render();
    }
  }

  // helpers
  function escapeHTML(s){
    return String(s).replace(/[&<>"']/g, c => ({
      "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
    }[c]));
  }

})();