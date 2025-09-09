/* RV Helper — Today's Ministry Day (threshold screen) */
/* v1.0 — routes Open Map -> rv-helper.html#map, stamps currentDay, safe defaults */

(function(){
  // ------- DOM -------
  const todayDate   = document.getElementById('todayDate');
  const locInput    = document.getElementById('locationInput');
  const gemInput    = document.getElementById('gemInput');
  const sprinkleBox = document.getElementById('sprinklePreview');
  const readyBtn    = document.getElementById('readyBtn');
  const mapBtn      = document.getElementById('mapBtn');
  const laterBtn    = document.getElementById('laterBtn');

  // ------- Today (friendly) -------
  const now = new Date();
  try {
    todayDate.textContent = now.toLocaleDateString(undefined, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  } catch { todayDate.textContent = now.toDateString(); }

  // ------- Sprinkle preview (optional, if verses.js present) -------
  try {
    if (Array.isArray(window.RV_VERSES) && window.RV_VERSES.length){
      const pick = RV_VERSES[Math.floor(Math.random()*RV_VERSES.length)];
      sprinkleBox.textContent = `✨ ${pick.verse} — ${pick.thought}`;
    } else {
      sprinkleBox.textContent = '✨ Sprinkle preview will appear here';
    }
  } catch {
    // No verses.js — keep quiet, show muted box text
  }

  // ------- Helpers -------
  function saveCurrentDay(){
    const payload = {
      dateISO: now.toISOString().slice(0,10),
      startTime: now.toISOString(),
      location: { label: (locInput.value || '').trim() || null },
      // If empty, default to your requested sample text:
      gemText: (gemInput.value || '1 + Jehovah is always the majority.').trim()
    };
    try{
      localStorage.setItem('rvhelper.v1.currentDay', JSON.stringify(payload));
    }catch(e){
      console.warn('[rv-day] Failed to save currentDay:', e);
    }
  }

  // ------- Actions -------
  readyBtn?.addEventListener('click', ()=>{
    saveCurrentDay();
    // go to Logbook header ribbon view
    window.location.href = 'rv-helper.html#today';
  });

  // 🔗 Open Map → helper in MAP mode (no separate rv-map.html exists)
  mapBtn?.addEventListener('click', ()=>{
    window.location.href = 'rv-helper.html#map';
  });

  // Just log later → regular helper (default list unless hash changes it)
  laterBtn?.addEventListener('click', ()=>{
    window.location.href = 'rv-helper.html';
  });
})();
