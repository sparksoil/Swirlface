// Simple local storage layer for Jonah (Phase 1: local-first)
// Keys are namespaced so Mom's hub won't clash.
const KEYS = {
  crumbs: 'swirl_crumbs_jonah',
  comments: 'swirl_comments_jonah',
  settings: 'swirl_settings_jonah',
  audit: 'swirl_audit_jonah'
};

const Storage = {
  _load(key){ try{ return JSON.parse(localStorage.getItem(key) || '[]'); }catch{ return []; } },
  _save(key, val){ localStorage.setItem(key, JSON.stringify(val)); },

  getCrumbs(){ return this._load(KEYS.crumbs); },
  addCrumb(crumb){
    const list = this.getCrumbs();
    list.push(crumb);
    this._save(KEYS.crumbs, list);
    this.audit('create','crumb', crumb.id, {pillar:crumb.pillar, text:crumb.text.slice(0,80)});
    return crumb;
  },

  getComments(){ return this._load(KEYS.comments); },
  addComment(c){
    const list = this.getComments(); list.push(c);
    this._save(KEYS.comments, list);
    this.audit('create','comment', c.id, {crumbId:c.crumbId});
  },

  settings(){
    try{
      return JSON.parse(localStorage.getItem(KEYS.settings) || '{"shoeday":"0","pin":""}');
    }catch{
      return { shoeday:'0', pin:'' };
    }
  },
  setSetting(name, value){
    const s = this.settings(); s[name] = value;
    localStorage.setItem(KEYS.settings, JSON.stringify(s));
  },

  audit(action, targetType, targetId, diff){
    const a = this._load(KEYS.audit);
    a.push({ tsISO:new Date().toISOString(), actor:'jonah', action, targetType, targetId, diff });
    this._save(KEYS.audit, a);
  }
};

// Helpers used by day page
export function preselectPillarFromHash(selectEl){
  const h = (location.hash || '').replace('#','').trim();
  if(!h) return;
  const opt = [...selectEl.options].find(o=>o.value===h);
  if(opt) selectEl.value = h;
}

export function saveCrumb({pillar, text, tags}){
  const id = 'c_' + Math.random().toString(36).slice(2,9);
  const crumb = {
    id, tsISO: new Date().toISOString(),
    pillar, text,
    parts: [], skills: [],
    media: [], tags: (tags||'').split(',').map(s=>s.trim()).filter(Boolean),
    privacy:'private', status:'pending_review'
  };
  return Storage.addCrumb(crumb);
}

export function todayCrumbs(){
  const today = new Date().toISOString().slice(0,10);
  return Storage.getCrumbs().filter(c=> (c.tsISO||'').slice(0,10) === today);
}

export function listCrumbs(){
  return Storage.getCrumbs().slice().sort((a,b)=> (b.tsISO||'').localeCompare(a.tsISO||''));
}

export function settings(){ return Storage.settings(); }
export function setSetting(name, value){ return Storage.setSetting(name,value); }
