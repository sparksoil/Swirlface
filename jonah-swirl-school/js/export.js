// Weekly export (JSON + CSV) from the summary produced in blooms.js
// No mutation; just creates a downloadable file via Blob.

function fmtDate(d){
  // d is Date
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const dd= String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${dd}`;
}

export function downloadJson(summary, start, end){
  const data = {
    title: `Jonah Weekly Glow ${fmtDate(start)} to ${fmtDate(end)}`,
    generatedAt: new Date().toISOString(),
    range: summary.range,
    counts: { pillars: summary.pillars, total: summary.total },
    tags: summary.tags
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  trigger(blob, `jonah_week_${fmtDate(start)}_${fmtDate(end)}.json`);
}

export function downloadCsv(summary, start, end){
  const rows = [];
  rows.push(['week_start','week_end','total'].join(','));
  rows.push([fmtDate(start), fmtDate(end), summary.total].join(','));
  rows.push('');
  rows.push(['pillar','count'].join(','));
  Object.entries(summary.pillars).forEach(([k,v])=> rows.push([k,v].join(',')));
  rows.push('');
  rows.push(['tag','count','pillar'].join(','));
   summary.tags.forEach(t=> rows.push([csv(t.name), t.count, t.pillar||''].join(',')));

  const blob = new Blob([rows.join('\n')], {type:'text/csv'});
  trigger(blob, `jonah_week_${fmtDate(start)}_${fmtDate(end)}.csv`);
}

function csv(s){
  const v = (s||'').replaceAll('"','""');
  return /[",\n]/.test(v) ? `"${v}"` : v;
}

function trigger(blob, filename){
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 0);
}
