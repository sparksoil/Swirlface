// Simple local storage layer for Jonah (Phase 1: local-first)
// Namespaced keys so Mom's hub won't clash.
const KEYS = {
  crumbs: 'swirl_crumbs_jonah',
  comments: 'swirl_comments_jonah',
  settings: 'swirl_settings_jonah',
  audit: 'swirl_audit_jonah'
};

const Storage = {
  _load(key, fallback = '[]'){ try{ return JSON.parse(localStorage.getItem(key) || fallback); }catch{ return JSON.parse(fallback); } },
  _save(key, val){ localStorage.setItem(key, JSON.stringify(val)); },

  // --- Crumbs ---
  getCrumbs(){ return this._load(KEYS.crumbs); },
  addCrumb(crumb){
    const list = this.getCrumbs(); list.push(crumb);
    this._save(KEYS.crumbs, list);
    this.audit('create','crumb', crumb.id, {pillar:crumb.pillar, text:crumb.text.slice(0,80)});
    return crumb;
  },
  deleteCrumbById(id){
    const list = this.getCrumbs();
    const idx = list.findIndex(c=>c.id===id);
    if(idx>=0){
      const removed = list.splice(idx,1)[0];
      this._save(KEYS.crumbs, list);
      this.audit('delete','crumb', id, {pillar:removed?.pillar});
      return true;
    }
    return false;
  },

  // --- Comments ---
  getComments(){ return this._load(KEYS.comments); },
  getCommentsFor(crumbId){ return this.getComments().filter(c=>c.crumbId===crumbId); },
  addComment(c){
    const list = this.getComments(); list.push(c);
    this._save(KEYS.comments, list);
    this.audit('create','comment', c.id, {crumbId:c.crumbId, author:c.author});
    return c;
  },

  // --- Settings (PIN + Shoeday) ---
  settings(){
    return this._load(KEYS.settings, '{"shoeday":"0","pin":""}');
  },
  setSetting(name, value){
    const s = this.settings(); s[name] = value;
    localStorage.setItem(KEYS.settings, JSON.stringify(s));
  },
  pinExists(){ return !!(this.settings().pin || '').trim(); },
  verifyPin(input){
    const set = (this.settings().pin || '').trim();
    const ok = set === (input || '').trim();
    this.audit(ok?'pin_ok':'pin_fail','pin','settings',{});
    return ok;
  },
  setPin(newPin, currentPin = ''){
    const s = this.settings();
    // If a PIN exists, require the current one to match
    if ((s.pin || '').trim()){
      if ((s.pin || '').trim() !== (currentPin || '').trim()){
        this.audit('pin_fail','pin','settings',{reason:'bad_current'});
        return {ok:false, reason:'bad_current'};
      }
    }
    s.pin = (newPin || '').trim();
    localStorage.setItem(KEYS.settings, JSON.stringify(s));
    this.audit('pin_set','pin','settings',{});
    return {ok:true};
  },

  // --- Audit ---
  audit(action, targetType, targetId, diff){
    const a = this._load(KEYS.audit);
    a.push({ tsISO:new Date().toISOString(), actor:'jonah', action, targetType, targetId, diff });
    this._save(KEYS.audit, a);
  }
};

// Helpers used by pages
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

export function listCrumbs(){ return Storage.getCrumbs().slice().sort((a,b)=> (b.tsISO||'').localeCompare(a.tsISO||'')); }
export function deleteCrumb(id){ return Storage.deleteCrumbById(id); }

export function addComment({crumbId, text}){
  const id = 'm_' + Math.random().toString(36).slice(2,9);
  return Storage.addComment({ id, tsISO:new Date().toISOString(), crumbId, author:'jonah', text: text.trim() });
}
export function commentsFor(crumbId){ return Storage.getCommentsFor(crumbId); }

export function settings(){ return Storage.settings(); }
export function setSetting(name, value){ return Storage.setSetting(name,value); }
export function pinExists(){ return Storage.pinExists(); }
export function verifyPin(input){ return Storage.verifyPin(input); }
export function setPin(newPin, currentPin){ return Storage.setPin(newPin, currentPin); }
