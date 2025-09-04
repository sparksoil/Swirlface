const KEY='sparksoil_income_entries_v1';
const SETTINGS_KEY='sparksoil_income_settings_v1';

export function loadEntries(){
  try{ return JSON.parse(localStorage.getItem(KEY)) || []; }catch{ return []; }
}
export function saveEntries(arr){
  localStorage.setItem(KEY, JSON.stringify(arr));
}
export function loadSettings(){
  const def = {reservePct:25};
  try{ return { ...def, ...(JSON.parse(localStorage.getItem(SETTINGS_KEY))||{}) }; }catch{ return def; }
}
export function saveSettings(s){
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}
