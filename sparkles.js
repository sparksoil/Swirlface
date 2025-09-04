export function burst(x, y, mode='ron'){
  const sparkles = document.getElementById('sparkles');
  if(!sparkles) return;
  const palette = mode==='lucy'
    ? ['#c8bfff','#b8e0ff','#e6e6ff','#bcd7ff','#cfd2ff']
    : ['#f6d365','#fda085','#ffd166','#f4a261','#e9c46a'];
  for(let i=0;i<18;i++){
    const s = document.createElement('div');
    s.className='sparkle show';
    s.style.left = x+'px'; s.style.top = y+'px';
    s.style.background = palette[i%palette.length];
    const dx = (Math.random()*160-80)+'px';
    const dy = (Math.random()*120-60)+'px';
    s.style.setProperty('--dx', dx); s.style.setProperty('--dy', dy);
    sparkles.appendChild(s);
    setTimeout(()=> s.remove(), 900);
  }
}
