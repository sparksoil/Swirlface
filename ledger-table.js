function fmt(n){ return (Number(n||0)).toFixed(2); }
function escapeHtml(s=''){ return String(s).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c])); }

export function renderTable(tbody, entries, reservePct){
  tbody.innerHTML = entries.map(e=>{
    const reserve = (typeof e.reserve === 'number') ? e.reserve : (Number(e.amount||0) * (reservePct/100));
    const net     = (typeof e.net     === 'number') ? e.net     : (Number(e.amount||0) - reserve);
    const dateCell = e.startDate ? `${e.startDate} – ${e.endDate}` : e.date;
    return `<tr>
      <td>${dateCell}</td>
      <td>${escapeHtml(e.client)}</td>
      <td>${escapeHtml(e.category||'Income')}</td>
      <td>${escapeHtml(e.service||'')}</td>
      <td>${escapeHtml(e.platform||'Direct')}</td>
      <td>${escapeHtml(e.method||'')}</td>
      <td class="right">${fmt(e.amount)}</td>
      <td class="right">${fmt(reserve)}</td>
      <td class="right">${fmt(net)}</td>
      <td>${e.paid ? 'Yes' : 'No'}</td>
      <td>${escapeHtml(e.notes||'')}</td>
    </tr>`;
  }).join('');

  const sum = (list, pick) => list.reduce((s,e)=> s + pick(e), 0);

  const grossAll   = sum(entries, e=> (e.category||'Income')==='Income'  ? Number(e.amount||0) : 0);
  const expAllVal  = sum(entries, e=> (e.category||'Income')==='Expense' ? Number(e.amount||0) : 0);
  const reserveAll = sum(entries, e=> (e.category||'Income')==='Income'  ? (Number(e.amount||0) * (reservePct/100)) : 0);
  const netDisplay = (grossAll - expAllVal) - reserveAll;

  document.getElementById('countAll').textContent = String(entries.length);
  document.getElementById('totalAll').textContent = fmt(grossAll);
  document.getElementById('expAll').textContent   = fmt(expAllVal);
  document.getElementById('reserveAll').textContent = fmt(reserveAll);
  document.getElementById('netAll').textContent   = fmt(netDisplay);

  document.getElementById('totalFoot').textContent        = fmt(grossAll);
  document.getElementById('totalReserveFoot').textContent = fmt(reserveAll);
  document.getElementById('totalNetFoot').textContent     = fmt(netDisplay);

  return {grossAll, expAllVal, reserveAll, netDisplay};
}
