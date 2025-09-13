const STORAGE_KEY = 'swirl_crumbs';

export function loadCrumbs() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveCrumbs(crumbs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(crumbs));
}
