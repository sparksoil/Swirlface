function fmt(n){ return (Number(n||0)).toFixed(2); }

function entryMonthKey(e){
  const iso = e.isExpandedChild ? e.date : (e.startDate || e.date);
  if(!iso || iso.length < 7) return '';
  const d = new Date(iso + "T00:00:00");
  const m = d.getUTCMonth()+1, y = d.getUTCFullYear();
  return `${y}-${String(m).padStart(2,'0')}`;
}
function currentMonthKey(){
  const d = new Date();
  const m = d.getUTCMonth()+1, y = d.getUTCFullYear();
  return `${y}-${String(m).padStart(2,'0')}`;
}

export function renderSummaries(entries, reservePct, totals){
  const monthKey = currentMonthKey();
  const monthEntries = entries.filter(e=> entryMonthKey(e) === monthKey);

  const sum = (list, pick) => list.reduce((s,e)=> s + pick(e), 0);
  const grossM   = sum(monthEntries, e=> (e.category||'Income')==='Income'  ? Number(e.amount||0) : 0);
  const expM     = sum(monthEntries, e=> (e.category||'Income')==='Expense' ? Number(e.amount||0) : 0);
  const reserveM = sum(monthEntries, e=> (e.category||'Income')==='Income'  ? (Number(e.amount||0) * (reservePct/100)) : 0);
  const netM     = (grossM - expM) - reserveM;

  document.getElementById('monthLabel').textContent = new Date().toLocaleString(undefined,{month:'long', year:'numeric'});
  document.getElementById('countMonth').textContent = String(monthEntries.length);
  document.getElementById('grossMonth').textContent = fmt(grossM);
  document.getElementById('expMonth').textContent   = fmt(expM);
  document.getElementById('reserveMonth').textContent = fmt(reserveM);
  document.getElementById('netMonth').textContent   = fmt(netM);
}
