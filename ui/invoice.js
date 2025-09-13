(function(){
  function escapeHtml(str){
    return (str||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
  }
  window.makeInvoice = function(entries, client){
    const safeClient = escapeHtml(client);
    if(!entries || !entries.length){ alert('No entries for that client.'); return; }
    const rows = entries.map(e=>{
      const date = e.startDate && e.endDate ? `${escapeHtml(e.startDate)}–${escapeHtml(e.endDate)}` : escapeHtml(e.date||'');
      const service = escapeHtml(e.service||'');
      const amount = Number(e.amount||0).toFixed(2);
      return `<tr><td>${date}</td><td>${service}</td><td class="right">$${amount}</td></tr>`;
    }).join('');
    const total = entries.reduce((sum,e)=> sum + Number(e.amount||0), 0).toFixed(2);
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Invoice - ${safeClient}</title>
<style>
  body{font-family:system-ui, sans-serif; margin:40px; color:#333;}
  h1{text-align:center;}
  table{width:100%; border-collapse:collapse; margin-top:20px;}
  th,td{padding:8px; border-bottom:1px solid #ccc;}
  th{background:#f5f5f5; text-align:left;}
  td.right{text-align:right;}
  .total{text-align:right; margin-top:10px; font-size:1.1em;}
  button{margin-top:20px;}
  @media print{button{display:none;}}
</style>
</head><body>
<h1>Invoice</h1>
<p><strong>Client:</strong> ${safeClient}</p>
<table><thead><tr><th>Date / Range</th><th>Service</th><th class="right">Amount</th></tr></thead><tbody>${rows}</tbody></table>
<div class="total"><strong>Total: $${total}</strong></div>
<button onclick="window.print()">Print</button>
</body></html>`;
    const w = window.open('','invoice');
    if(!w){ alert('Allow popups to view invoice.'); return; }
    w.document.write(html);
    w.document.close();
  };
})();
