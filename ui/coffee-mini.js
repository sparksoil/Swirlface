// ui/coffee-mini.js
// 10-minute reading timer with resume after reload + sticky note.

export function wireCoffeeMini(box){
  if(!box) return;

  const startBtn = box.querySelector('#start10');
  const note     = box.querySelector('#coffeeNote');

  // Keys
  const NOTE_KEY = 'coffee_note_v1';
  const END_TS_KEY = 'coffee_timer_end_ts_v1';

  // Restore note
  note.value = localStorage.getItem(NOTE_KEY) || '';
  note.addEventListener('input', ()=> localStorage.setItem(NOTE_KEY, note.value));

  // If a timer was in progress (page reloaded), resume it
  const pendingEnd = Number(localStorage.getItem(END_TS_KEY) || '0');
  if (pendingEnd > Date.now()) {
    runCountdown(pendingEnd);
  } else {
    clearTimer();
  }

  startBtn.addEventListener('click', ()=>{
    // Start a fresh 10-min window
    const end = Date.now() + 10*60*1000;
    localStorage.setItem(END_TS_KEY, String(end));
    runCountdown(end);
  });

  // ---- helpers ----
  function runCountdown(endTs){
    startBtn.disabled = true;
    const t = setInterval(()=>{
      const left = Math.max(0, endTs - Date.now());
      if (left === 0){
        clearInterval(t);
        clearTimer();
        alert('Done. That counts.');
        return;
      }
      startBtn.textContent = fmt(left); // show live mm:ss
    }, 250);
  }

  function clearTimer(){
    localStorage.removeItem(END_TS_KEY);
    startBtn.disabled = false;
    startBtn.textContent = '10 min';
  }

  function fmt(ms){
    const s  = Math.ceil(ms/1000);
    const mm = Math.floor(s/60);
    const ss = String(s % 60).padStart(2,'0');
    return `${mm}:${ss}`;
  }
}
