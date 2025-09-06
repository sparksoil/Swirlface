// ui/ron-face.js
// Ron Face Controller — handles pose switching

/**
 * Set Ron’s current pose.
 * @param {number} n - pose index (1, 2, 3…)
 */
export function setRonPose(n) {
  const el = document.querySelector('.ron-face');
  if (!el) return;
  el.className = `ron-face pose-${n}`;
}

/**
 * Cycle to the next pose in sequence.
 * If you want buttons or auto-rotation, call this.
 */
export function nextPose() {
  const el = document.querySelector('.ron-face');
  if (!el) return;
  const current = el.className.match(/pose-(\d+)/);
  const num = current ? parseInt(current[1], 10) : 1;
  const next = num >= 3 ? 1 : num + 1;
  setRonPose(next);
}

/**
 * Pick a random pose for fun.
 */
export function randomPose() {
  const choice = Math.floor(Math.random() * 3) + 1;
  setRonPose(choice);
}
