(function(){
  const todayDate = document.getElementById('todayDate');
  const locInput = document.getElementById('locationInput');
  const gemInput = document.getElementById('gemInput');
  const sprinkleBox = document.getElementById('sprinklePreview');

  // Show today's date
  const now = new Date();
  todayDate.textContent = now.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Sprinkle preview (reuse verses.js pool if present)
  if (window.RV_VERSES && window.RV_VERSES.length){
    const pick = RV_VERSES[Math.floor(Math.random()*RV_VERSES.length)];
    sprinkleBox.textContent = `✨ ${pick.verse} — ${pick.thought}`;
  }

  // Buttons
  document.getElementById('readyBtn').addEventListener('click', ()=>{
    const currentDay = {
      dateISO: now.toISOString().slice(0,10),
      startTime: now.toISOString(),
      location: { label: locInput.value.trim() || null },
      gemText: gemInput.value.trim()
    };
    try{
      localStorage.setItem('rvhelper.v1.currentDay', JSON.stringify(currentDay));
    }catch(e){ console.warn("Save failed", e); }

    window.location.href = 'rv-helper.html#today';
  });

  document.getElementById('mapBtn').addEventListener('click', ()=>{
    window.location.href = 'rv-map.html';
  });

  document.getElementById('laterBtn').addEventListener('click', ()=>{
    window.location.href = 'rv-helper.html';
  });
})();
