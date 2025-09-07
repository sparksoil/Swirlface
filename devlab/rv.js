function renderCircles(){
  const now = Date.now();
  circlesBox.innerHTML = people.map(p=>{
    const age = now - (p.last_touch||now);
    return `<div class="circle ${ageClassName(age)}" data-id="${p.id}" title="${escapeHtml(p.name)}">${escapeHtml(p.name[0]||'?')}</div>`;
  }).join('');
  qsa('.circle',circlesBox).forEach(c=>c.addEventListener('click',()=>openDetail(c.dataset.id)));
}
