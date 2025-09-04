// =========================
// QUOTE ROTATOR (safe + modular)
// =========================
(function(){
  const quotes = [
    "One number at a time is still progress.",
    "You already did more than you think.",
    "Simple done gently > complex left undone."
  ];
  const box = document.getElementById('quoteBox');
  if(!box) return;
  let i = 0;
  function showNext(){
    box.textContent = quotes[i % quotes.length];
    i++;
  }
  showNext();
  setInterval(showNext, 8000);
})();
