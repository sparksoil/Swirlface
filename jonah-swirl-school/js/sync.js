// sync.js — optional cloud sync (OFF by default)
// Reads/writes settings in localStorage via storage.js helpers.
// Endpoints (defaults, override in UI):
//   POST  {endpoint}/api/ingest   with JSON {events:[...]}
//   GET   {endpoint}/api/snapshot returns {crumbs:[], comments:[], settings:{}}

import { settings, setSetting } from './storage.js';

const EVT = 'swirl:changed'; // emitted by storage.js after mutations
let queue = [];       // buffered change events
let flushing = false; // prevent concurrent flushes

export function initSync(){
  window.addEventListener(EVT, (e)=>{
    queue.push(e.detail || {});
    tryFlush();
  });
}

export function isEnabled(){
  const s = settings();
  return (s.syncEnabled === '1') && !!(s.syncEndpoint||'').trim();
}

export function config(){ return settings(); }

export function setConfig({ endpoint, token, enabled }){
  if (typeof endpoint === 'string') setSetting('syncEndpoint', endpoint.trim());
  if (typeof token === 'string') setSetting('syncToken', token.trim());
  if (typeof enabled !== 'undefined') setSetting('syncEnabled', enabled ? '1' : '0');
}

export async function tryFlush(){
  if(!isEnabled()) { queue = []; return; }
  if(flushing || queue.length===0) return;
  flushing = true;

  const events = queue.splice(0, queue.length);
  try{
    await postJson(url('/api/ingest'), { events });
  }catch(err){
    // Put events back so we don't lose them; try later
    queue.unshift(...events);
    console.warn('Sync failed, will retry later', err);
  }finally{
    flushing = false;
  }
}

export async function pullSnapshot({ replace = true } = {}){
  const snap = await getJson(url('/api/snapshot'));
  if(!snap || typeof snap !== 'object') throw new Error('Bad snapshot');
  // In Phase 1 we don't auto-merge; we just return it to caller to decide.
  return snap;
}

// Small helper to compose endpoint URL
function url(path){
  const s = settings();
  const root = (s.syncEndpoint||'').replace(/\/+$/,'');
  return root + path;
}

async function postJson(u, body){
  const { syncToken } = settings();
  const res = await fetch(u, {
    method:'POST',
    headers: {
      'Content-Type':'application/json',
      ...(syncToken ? { 'Authorization': `Bearer ${syncToken}` } : {})
    },
    body: JSON.stringify(body)
  });
  if(!res.ok) throw new Error(`POST ${u} -> ${res.status}`);
  return res.json().catch(()=> ({}));
}

async function getJson(u){
  const { syncToken } = settings();
  const res = await fetch(u, {
    headers: {
      ...(syncToken ? { 'Authorization': `Bearer ${syncToken}` } : {})
    }
  });
  if(!res.ok) throw new Error(`GET ${u} -> ${res.status}`);
  return res.json();
}
