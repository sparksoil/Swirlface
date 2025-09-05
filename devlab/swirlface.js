// Swirlface Dev Lab — JS

// ~lines 1-18: helpers + token setup
const tokens = Array.from(document.querySelectorAll('.token'));
const pond   = document.getElementById('pond');

function rand(min, max){ return Math.random() * (max - min) + min; }

tokens.forEach((t, i) => {
  // randomize orbits so each circle feels alive
  const startAngle = rand(0, 360);
  const radius     = rand(150, 260);      // distance from center
  const duration   = rand(26, 46);        // seconds per revolution

  t.style.setProperty('--angle', `${startAngle}deg`);
  t.style.setProperty('--radius', `${radius}px`);
  t.style.animationDuration = `${duration}s`;
});

// ~lines 20-78: click → door + portal
const portal = document.getElementById('portal');
const portalTitle = document.getElementById('portalTitle');
const closePortal = document.getElementById('closePortal');

tokens.forEach((t) => {
  t.addEventListener('click', (e) => {
    const alreadyDoor = t.classList.contains('door');
    // clear doors on others
    tokens.forEach(x => { if(x !== t) x.classList.remove('door'); });

    if(!alreadyDoor){
      t.classList.add('door');
      t.focus({preventScroll:true});
      // emit free-floating glimmers
      for(let i=0; i<3; i++){
        const g = document.createElement('div');
        g.className = 'free-glimmer';
        g.style.left = (e.clientX + rand(-8,8)) + 'px';
        g.style.top  = (e.clientY + rand(-8,8)) + 'px';
        pond.appendChild(g);
        setTimeout(()=> g.remove(), 2400);
      }
      // ripple from click point with door color
      const hue = t.style.getPropertyValue('--hue').trim() || '0';
      const sat = t.style.getPropertyValue('--sat').trim() || '0%';
      const lit = t.style.getPropertyValue('--lit').trim() || '60%';
      const r = document.createElement('div');
      r.className = 'ripple-layer';
      r.style.setProperty('--x', e.clientX);
      r.style.setProperty('--y', e.clientY);
      r.style.setProperty('--rip-h', hue);
      r.style.setProperty('--rip-s', sat);
      r.style.setProperty('--rip-l', lit);
      document.body.appendChild(r);
      setTimeout(()=> r.remove(), 1800);

      // small pause then open portal
      setTimeout(() => {
        portalTitle.textContent = `Opening ${t.dataset.app}…`;
        portal.showModal();
      }, 220);
    }else{
      portalTitle.textContent = `Opening ${t.dataset.app}…`;
      portal.showModal();
    }
  });
});

closePortal.addEventListener('click', () => portal.close());

// close modal on Esc
document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape' && portal.open) portal.close();
});

// ~lines 80-132: mode toggles (Lucy ↔ Avlock)
const btnLucy   = document.getElementById('btnLucy');
const btnAvlock = document.getElementById('btnAvlock');

function setMode(mode){
  document.body.classList.toggle('mode-lucy',   mode === 'lucy');
  document.body.classList.toggle('mode-avlock', mode === 'avlock');
  btnLucy.classList.toggle('active',   mode === 'lucy');
  btnAvlock.classList.toggle('active', mode === 'avlock');

  if(mode === 'avlock'){
    tokens.forEach((t, i) => {
      const angle = (360 / tokens.length) * i;
      t.style.setProperty('--angle', `${angle}deg`);
      t.style.setProperty('--radius', `210px`);
    });
  }
}

btnLucy.addEventListener('click',   () => setMode('lucy'));
btnAvlock.addEventListener('click', () => setMode('avlock'));

// start in Lucy mode
setMode('lucy');
