/* Jonah Landing
   - Draw Archimedean spiral for each door
   - Mint -> pink -> gold gradient stroke
   - Open/close on click or Enter/Space
   - Shoeday toggle remembered
   - Verse peek (placeholder; Step 2 will load /data/verses.json)
*/
(function(){
  function makeSpiralPath({cx=110, cy=110, startR=7, spacing=5.8, turns=3.0, steps=560}={}){
    const TAU = Math.PI*2, total = turns*TAU, k = spacing/(2*Math.PI);
    let d = "";
    for(let i=0;i<=steps;i++){
      const t=i/steps, th=t*total+0.0001, r=startR+k*th;
      const x=cx+r*Math.cos(th), y=cy+r*Math.sin(th);
      d += (i?` L ${x.toFixed(2)} ${y.toFixed(2)}`:`M ${x.toFixed(2)} ${y.toFixed(2)}`);
    }
    return d;
  }

  function cssVar(name){
    const v = getComputedStyle(document.documentElement).getPropertyValue(name);
    return v && v.trim() ? v.trim() : '#000';
  }

  function gradientFor(svg, id){
    let defs = svg.querySelector('defs');
    if(!defs){ defs = document.createElementNS('http://www.w3.org/2000/svg','defs'); svg.prepend(defs); }
    let g = svg.querySelector('#'+id); if(g) g.remove();
    g = document.createElementNS('http://www.w3.org/2000/svg','linearGradient');
    g.id = id; g.setAttribute('x1','0%'); g.setAttribute('y1','0%'); g.setAttribute('x2','100%'); g.setAttribute('y2','100%');
    [['0%','--accent1'],['55%','--accent2'],['100%','--accent3']].forEach(([off, varName])=>{
      const s = document.createElementNS('http://www.w3.org/2000/svg','stop');
      s.setAttribute('offset', off); s.setAttribute('stop-color', cssVar(varName));
      g.appendChild(s);
    });
    defs.appendChild(g);
    return `url(#${id})`;
  }

  // draw spirals with gradients
  document.querySelectorAll('.door').forEach((door, i)=>{
    const path = door.querySelector('.spiral-path');
    const svg  = door.querySelector('svg.spiral');
    path.setAttribute('d', makeSpiralPath({turns: 3, spacing: 9 - i*0.6}));
    path.setAttribute('stroke', gradientFor(svg, `grad${i}`));
    path.setAttribute('stroke-width', '8'); // kid friendly
  });

  // open/close
  const doors = Array.from(document.querySelectorAll('.door'));
  const closeAll = ()=> doors.forEach(d=>d.classList.remove('open'));
  doors.forEach(btn=>{
    btn.addEventListener('click', ()=>{ const open = btn.classList.contains('open'); closeAll(); if(!open) btn.classList.add('open'); });
    btn.addEventListener('keydown', (e)=>{
      if(e.key==='Enter'||e.key===' '){ e.preventDefault(); btn.click(); }
      if(e.key==='Escape'){ closeAll(); }
    });
  });
  document.addEventListener('click', e=>{ if(!e.target.closest('.door')) closeAll(); });

  // Shoeday
  const sh = document.getElementById('shoedayToggle');
  if (sh){
    const saved = localStorage.getItem('jonah_shoeday');
    if (saved === '1'){ sh.checked = true; document.body.dataset.shoeday = '1'; }
    sh.addEventListener('change', ()=>{
      document.body.dataset.shoeday = sh.checked ? '1' : '0';
      localStorage.setItem('jonah_shoeday', sh.checked ? '1' : '0');
    });
  }

  // Verse peek (placeholder – Step 2)
  const verseBtn = document.getElementById('versePeek');
  if (verseBtn){
    verseBtn.addEventListener('click', ()=>{ alert('Verse peek coming soon 💛'); });
  }
})();
