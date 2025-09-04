const MODES = ["ron","lucy","coffee"];
const MODE_KEY = "sparksoil_mode_v1";

export function current(){
  const m = localStorage.getItem(MODE_KEY);
  return MODES.includes(m) ? m : "ron";
}
export function setMode(mode){
  if(!MODES.includes(mode)) return;
  document.documentElement.classList.remove("ron","lucy","coffee");
  document.documentElement.classList.add(mode);
  localStorage.setItem(MODE_KEY, mode);
}
export function initModeRadio(radios, onChange){
  const init = current();
  setMode(init);
  radios.forEach(r=>{
    r.checked = (r.value === init);
    r.addEventListener('change', e => {
      const m = e.target.value;
      setMode(m);
      if(onChange) onChange(m);
    });
  });
  if(onChange) onChange(init);
}
