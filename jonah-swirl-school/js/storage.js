// storage.js — local-first store + tiny event bus for sync
// Namespaced keys so Mom's hub won't clash.

const KEYS = {
  crumbs:   'swirl_crumbs_jonah',
  comments: 'swirl_comments_jonah',
  settings: 'swirl_settings_jonah',
  audit:    'swirl_audit_jonah'
};

function uniqueList(listLike){
  const arr = Array.isArray(listLike) ? listLike : (listLike ? [listLike] : []);
  const seen = new Set();
  const out = [];
  for(const item of arr){
    const v = (item ?? '').toString().trim();
    if(!v || seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

function cleanTags(tags){
  if(Array.isArray(tags)){
    return tags.map(t=> (t ?? '').toString().trim()).filter(Boolean);
  }
  if(typeof tags === 'string'){
    return tags.split(',').map(t=> t.trim()).filter(Boolean);
  }
  return [];
}

function arraysEqual(a = [], b = []){
  if(a.length !== b.length) return false;
  for(let i=0;i<a.length;i++){
    if(a[i] !== b[i]) return false;
  }
  return true;
}

function normalizeCrumb(raw = {}){
  const crumb = { ...raw };
  let dirty = false;

  // Ensure an id exists (used for ordering + audit trails)
  const existingId = (raw.id ?? '').toString().trim();
  if(existingId){
    crumb.id = existingId;
  }else{
    crumb.id = 'c_' + Math.random().toString(36).slice(2,9);
    dirty = true;
  }

  // Normalize timestamp; fallback to "now" if invalid/missing
  let ts = (raw.tsISO ?? raw.ts ?? '').toString().trim();
  if(ts && Number.isNaN(Date.parse(ts))) ts = '';
  if(ts){
    crumb.tsISO = ts;
  }else{
    crumb.tsISO = new Date().toISOString();
    dirty = true;
  }

  // Trim text content to avoid storing stray whitespace
  const trimmedText = (raw.text ?? '').toString().trim();
  if(trimmedText !== (raw.text ?? '')) dirty = true;
  crumb.text = trimmedText;

  const sanitizedPillars = uniqueList(raw.pillars ?? raw.pillar);
  const originalPillars = Array.isArray(raw.pillars)
    ? raw.pillars.map(p=> (p ?? '').toString().trim()).filter(Boolean)
    : [];
  if(!arraysEqual(originalPillars, sanitizedPillars)) dirty = true;
  crumb.pillars = sanitizedPillars;

  const primary = sanitizedPillars[0] || '';
  if((raw.pillar || '') !== primary){
    dirty = true;
    crumb.pillar = primary;
  } else {
    crumb.pillar = raw.pillar || primary;
  }

  const sanitizedTags = cleanTags(raw.tags);
  const originalTags = Array.isArray(raw.tags)
    ? raw.tags.map(t=> (t ?? '').toString().trim()).filter(Boolean)
    : cleanTags(raw.tags);
  if(typeof raw.tags === 'string') dirty = true;
  if(!arraysEqual(originalTags, sanitizedTags)) dirty = true;
  crumb.tags = sanitizedTags;

  if(Array.isArray(raw.parts)){
    crumb.parts = raw.parts;
  }else{
    if(raw.parts !== undefined) dirty = true;
    crumb.parts = [];
  }
  if(Array.isArray(raw.skills)){
    crumb.skills = raw.skills;
  }else{
    if(raw.skills !== undefined) dirty = true;
    crumb.skills = [];
  }
  if(Array.isArray(raw.feelings)){
    crumb.feelings = raw.feelings;
  }else{
    if(raw.feelings !== undefined) dirty = true;
    crumb.feelings = [];
  }
  if(Array.isArray(raw.needs)){
    crumb.needs = raw.needs;
  }else{
    if(raw.needs !== undefined) dirty = true;
    crumb.needs = [];
  }
  if(Array.isArray(raw.media)){
    crumb.media = raw.media;
  }else{
    if(raw.media !== undefined) dirty = true;
    crumb.media = [];
  }

  const status = raw.status || 'pending_review';
  if(status !== raw.status) dirty = true;
  crumb.status = status;

  const privacy = raw.privacy || 'private';
  if(privacy !== raw.privacy) dirty = true;
  crumb.privacy = privacy;

  return { crumb, dirty };
}

function sortCrumbsDesc(list){
  return list.sort((a,b)=>{
    const tsCompare = String(b.tsISO||'').localeCompare(String(a.tsISO||''));
    if(tsCompare !== 0) return tsCompare;
    return String(b.id||'').localeCompare(String(a.id||''));
  });
}

function orderSignature(arr){
  return arr.map(item=>`${item.id||''}#${item.tsISO||''}`).join('|');
}

// Emit helper (so sync.js can listen)
function emit(type, payload){
  try{ window.dispatchEvent(new CustomEvent('swirl:changed', { detail: { type, ...payload } })); }
  catch(e){ /* ignore */ }
}

const Storage = {
  _load(key, fallback = '[]'){ try{ return JSON.parse(localStorage.getItem(key) || fallback); }catch{ return JSON.parse(fallback); } },
  _save(key, val){ localStorage.setItem(key, JSON.stringify(val)); },

  // --- Crumbs ---
  getCrumbs(){
    const raw = this._load(KEYS.crumbs);
    let dirty = false;
    const normalized = raw.map(item => {
      const { crumb, dirty: changed } = normalizeCrumb(item || {});
      if(changed) dirty = true;
      return crumb;
    });
    const sorted = sortCrumbsDesc(normalized.slice());
    if(orderSignature(normalized) !== orderSignature(sorted)) dirty = true;
    if(dirty) this._save(KEYS.crumbs, sorted);
    return sorted;
  },
  addCrumb(crumb){
    const { crumb: normalized } = normalizeCrumb(crumb || {});
    const list = sortCrumbsDesc([...this.getCrumbs(), normalized]);
    this._save(KEYS.crumbs, list);
    this.audit('create','crumb', normalized.id, {pillars: normalized.pillars, text: normalized.text.slice(0,80)});
    emit('crumb_create', { id: normalized.id, crumb: normalized });
    return normalized;
  },
  deleteCrumbById(id){
    const list = this.getCrumbs();
    const idx = list.findIndex(c=>c.id===id);
    if(idx>=0){
      const removed = list.splice(idx,1)[0];
      this._save(KEYS.crumbs, list);
      this.audit('delete','crumb', id, {pillars:removed?.pillars});
      emit('crumb_delete', { id });
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
    emit('comment_create', { id: c.id, comment: c });
    return c;
  },

  // --- Settings (PIN + Shoeday + Sync) ---
  settings(){
    return this._load(KEYS.settings, '{"shoeday":"0","pin":"","syncEnabled":"0","syncEndpoint":"","syncToken":""}');
  },
  setSetting(name, value){
    const s = this.settings(); s[name] = value;
    localStorage.setItem(KEYS.settings, JSON.stringify(s));
    emit('settings_change', { name, value });
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
    if ((s.pin || '').trim()){
      if ((s.pin || '').trim() !== (currentPin || '').trim()){
        this.audit('pin_fail','pin','settings',{reason:'bad_current'});
        return {ok:false, reason:'bad_current'};
      }
    }
    s.pin = (newPin || '').trim();
    localStorage.setItem(KEYS.settings, JSON.stringify(s));
    this.audit('pin_set','pin','settings',{});
    emit('pin_set', {});
    return {ok:true};
  },

  // --- Audit ---
  audit(action, targetType, targetId, diff){
    const a = this._load(KEYS.audit);
    a.push({ tsISO:new Date().toISOString(), actor:'jonah', action, targetType, targetId, diff });
    this._save(KEYS.audit, a);
  }
};

// Public API
export function preselectPillarFromHash(target){
  const h = (location.hash || '').replace('#','').trim();
  if(!h || !target) return;
  if(typeof HTMLSelectElement !== 'undefined' && target instanceof HTMLSelectElement){
    const opt = [...target.options].find(o=>o.value===h);
    if(opt) target.value = h;
    return;
  }
  const list = Array.isArray(target)
    ? target
    : (typeof target.length === 'number' ? Array.from(target) : null);
  if(list){
    list.forEach(input=>{
      if(input && 'value' in input && input.value === h){
        input.checked = true;
      }
    });
  }
}

export function saveCrumb({ pillars, text, tags, media, packet, minutes, parts, skills, feelings, needs }){
  const id = 'c_' + Math.random().toString(36).slice(2,9);
  const crumb = {
    id,
    tsISO: new Date().toISOString(),
    text: (text || '').trim(),
    pillars: Array.isArray(pillars) ? pillars : uniqueList(pillars),
    tags: Array.isArray(tags) ? tags : cleanTags(tags),
    media: Array.isArray(media) ? media : [],
    parts: Array.isArray(parts) ? parts : [],
    skills: Array.isArray(skills) ? skills : [],
    feelings: Array.isArray(feelings) ? feelings : [],
    needs: Array.isArray(needs) ? needs : [],
    packet: packet || undefined,
    minutes: typeof minutes === 'number' ? minutes : undefined,
    privacy:'private',
    status:'pending_review'
  };
  const { crumb: normalized } = normalizeCrumb(crumb);
  return Storage.addCrumb(normalized);
}

export function todayCrumbs(day){
  let target = '';
  if(day instanceof Date){
    target = day.toISOString().slice(0,10);
  }else if(typeof day === 'string' && day.trim()){
    target = day.trim().slice(0,10);
  }else{
    target = new Date().toISOString().slice(0,10);
  }
  return listCrumbs().filter(c=> (c.tsISO||'').slice(0,10) === target);
}
export function listCrumbs(){ return Storage.getCrumbs().slice(); }
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

const REACT_KEY = 'swirl_reacts_like_jonah';
function _likes(){
  try{
    return new Set(JSON.parse(localStorage.getItem(REACT_KEY) || '[]'));
  }catch{
    return new Set();
  }
}
function _saveLikes(set){
  localStorage.setItem(REACT_KEY, JSON.stringify([...set]));
}
export function isLiked(crumbId){
  return _likes().has(crumbId);
}
export function toggleLike(crumbId){
  const s = _likes();
  if(s.has(crumbId)) s.delete(crumbId);
  else s.add(crumbId);
  _saveLikes(s);
  try{
    window.dispatchEvent(new CustomEvent('swirl:changed', { detail:{ type:'like_toggle', crumbId } }));
  }catch{}
  return s.has(crumbId);
}

// Extra getters useful for full snapshot export/import later:
export function _all(){
  return {
    crumbs: Storage.getCrumbs(),
    comments: Storage.getComments(),
    settings: Storage.settings()
  };
}
