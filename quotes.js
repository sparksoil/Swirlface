const QUOTES = {
  ron: [
    "Stack the logs. That’s it.",
    "One number at a time is still progress.",
    "Quiet work counts.",
    "I logged it. I didn’t forget."
  ],
  lucy: [
    "Soft time still counts.",
    "Even rivers rest before the sea.",
    "We can be gentle and still arrive.",
    "One pebble is still a path."
  ],
  coffee: [
    "Fine. Keep track.",
    "Pie Chart of Pretending: 80% performance, 20% pages.",
    "DNF is self-care with paperwork.",
    "Read 3 pages, felt 5 emotions. Counts."
  ]
};
export function showOnce(mode="ron"){
  const pool = QUOTES[mode] || QUOTES.ron;
  const line = pool[Math.floor(Math.random()*pool.length)];
  const main = document.getElementById('quoteMain');
  const boardMain = document.getElementById('ronQuoteMain');
  const boardSub  = document.getElementById('ronQuoteSub');
  if(main) main.textContent = line;
  if(boardMain) boardMain.textContent = line;
  if(boardSub)  boardSub.textContent = "";
}
