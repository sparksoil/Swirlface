// Swirlface Hub — JS

// ~lines 1-18: helpers + token setup
const tokens = Array.from(document.querySelectorAll('.token'));

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

// ~lines 20-40: click → navigate to pillar feed
tokens.forEach((t) => {
  t.addEventListener('click', () => {
    const pillar = t.dataset.pillar;
    if(pillar){
      location.href = `./swirlfeed.html#${pillar}`;
    }
  });
});

// ~lines 80-150: mode toggles (Swirlface ↔ Structured) + crumb capture
const btnSwirl      = document.getElementById('btnSwirl');
const btnStructured = document.getElementById('btnStructured');

function setMode(mode){
  document.body.classList.toggle('mode-swirl',      mode === 'swirl');
  document.body.classList.toggle('mode-structured', mode === 'structured');
  btnSwirl.classList.toggle('active',      mode === 'swirl');
  btnStructured.classList.toggle('active', mode === 'structured');

  if(mode === 'structured'){
    tokens.forEach((t, i) => {
      const angle = (360 / tokens.length) * i;
      t.style.setProperty('--angle', `${angle}deg`);
      t.style.setProperty('--radius', `210px`);
    });
  }
}

btnSwirl.addEventListener('click',      () => setMode('swirl'));
btnStructured.addEventListener('click', () => setMode('structured'));

// start in Swirlface mode
setMode('swirl');
