// ui/coffee-faces.js
// Coffee mug sprite controller (2 cols x 4 rows) + mood-tied quotes.
// NOTE: your index.html currently has only #quoteMain (no quoteSub), so we only set that.

export const MOOD_FACE = {
  classic_grump:         1, // row1 L
  worried:               5, // row1 R
  cautiously_optimistic: 2, // row2 L
  existentially_tired:   6, // row2 R
  avoiding_eye_contact:  3, // row3 L
  snoring:               7, // row3 R
  unimpressed:           4, // row4 L
  yawning:               8  // row4 R
};

const COFFEE_LINES = [
  { text: "Fine. Keep track.",                     mood: "classic_grump" },
  { text: "Is this… going to matter? Probably.",   mood: "worried" },
  { text: "Okay, maybe this helps. Maybe.",        mood: "cautiously_optimistic" },
  { text: "I’m tired.",       mood: "existentially_tired" },
  { text: "Don’t look at me; I’m logging it.",     mood: "avoiding_eye_contact" },
  { text: "…zzz… (it still counts).",              mood: "snoring" },
  { text: "Impressive. In a technical sense.",     mood: "unimpressed" },
  { text: "*yawn* Done. Heroic.",                  mood: "yawning" }
];

const faceEl = () => document.querySelector('.coffee-face');
const qMain  = () => document.getElementById('quoteMain');

export function setCoffeeFace(i){
  const el = faceEl();
  if (!el) return;
  el.className = 'coffee-face right-of-title expression-' + (i || 1);
}

export function showCoffeeQuote(){
  const main = qMain();
  if (!main) return;
  const idx  = Math.floor(Math.random() * COFFEE_LINES.length);
  const line = COFFEE_LINES[idx];
  main.textContent = line.text;
  setCoffeeFace(MOOD_FACE[line.mood] || 1);
}

/** Call this on mode change */
export function applyCoffeeOnMode(newMode){
  if (newMode !== 'coffee') return;
  // default face when switching in
  setCoffeeFace(MOOD_FACE.classic_grump);
  // show a fresh coffee line + sync face
  showCoffeeQuote();
}

// Dev sanity test (run in console):
// [1,5,2,6,3,7,4,8].forEach((f,i)=>setTimeout(()=>setCoffeeFace(f), i*400));
