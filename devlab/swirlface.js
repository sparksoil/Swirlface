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
  t.addEventListener('click', () => {
    // morph into a door if it isn't already
    const alreadyDoor = t.classList.contains('door');
    // first, clear doors on others (only one "selected" at a time)
    tokens.forEach(x => { if(x !== t) x.classList.remove('door'); });
    if(!alreadyDoor){
      t.classList.add('door');
      // gently focus for keyboard users
      t.focus({preventScroll:true});
      // after a small pause, open the portal dialog
      setTimeout(() => {
        portalTitle.textContent = `Opening ${t.dataset.app}…`;
        portal.showModal();
      }, 220);
    }else{
      // if clicked again while it's a door, just open portal
      portalTitle.textContent = `Opening ${t.dataset.app}…`;
      portal.showModal();
    }
  });
});

closePortal.addEventListener('click', () => portal.close());

// close modal on Esc click anywhere
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

  // when switching to Avlock, snap tokens into an organized ring
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
