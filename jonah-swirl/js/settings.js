// settings.js — one-page modal for PIN, Shoeday, and Cloud Sync
// Neutral wireframe; depends on storage.js and sync.js

import { settings, setSetting, pinExists, setPin } from './storage.js';
import { initSync, config as syncConfig, setConfig as syncSetConfig, isEnabled as syncIsEnabled } from './sync.js';

(function(){
  initSync(); // start listening (no-ops if sync disabled)

  function open(){
    const s = settings();
    const cfg = syncConfig();

    const host = document.createElement('div');
    host.className = 'settings-backdrop';
    host.innerHTML = `
      <section class="settings-modal">
        <h2>Settings</h2>
        <p class="hint">Manage Shoeday, Parent PIN, and optional Cloud Sync.</p>

        <!-- Shoeday -->
        <div class="settings-section">
          <h3 style="margin:0 0 8px;">Shoeday</h3>
          <div class="row">
            <span class="lab">Enable</span>
            <label class="switch">
              <input id="setShoeday" type="checkbox">
              <span>Collapse UI to “1 crumb + 1 verse.”</span>
            </label>
          </div>
        </div>

        <!-- Parent PIN -->
        <div class="settings-section">
          <h3 style="margin:0 0 8px;">Parent PIN</h3>
          <div class="row">
            <span class="lab">Status</span>
            <div><span id="pinStatus">—</span></div>
          </div>
          <div id="pinSetBlock">
            <div class="row">
              <span class="lab">New PIN</span>
              <input id="pinNew" type="password" inputmode="numeric" autocomplete="new-password" placeholder="Enter new PIN">
            </div>
            <div class="row">
              <span class="lab">Confirm</span>
              <input id="pinNew2" type="password" inputmode="numeric" autocomplete="new-password" placeholder="Repeat new PIN">
            </div>
            <div class="row" id="pinCurRow" style="display:none;">
              <span class="lab">Current</span>
              <input id="pinCurrent" type="password" inputmode="numeric" autocomplete="current-password" placeholder="Current PIN">
            </div>
          </div>
        </div>

        <!-- Cloud Sync (optional) -->
        <div class="settings-section">
          <h3 style="margin:0 0 8px;">Cloud Sync (optional)</h3>
          <div class="row">
            <span class="lab">Enable</span>
            <label class="switch">
              <input id="syncEnabled" type="checkbox">
              <span>Send changes to your endpoint</span>
            </label>
          </div>
          <div class="row">
            <span class="lab">Endpoint URL</span>
            <input id="syncEndpoint" type="text" placeholder="https://example.com">
          </div>
          <div class="row">
            <span class="lab">Bearer Token</span>
            <input id="syncToken" type="password" placeholder="optional">
          </div>
          <p class="hint">POST {endpoint}/api/ingest {events:[…]}, GET {endpoint}/api/snapshot for pulls.</p>
        </div>

        <div class="settings-actions">
          <button id="btnSave" class="btn" type="button">Save</button>
          <button id="btnClose" class="btn btn-ghost" type="button">Close</button>
        </div>
        <p id="msg" class="hint" role="status" aria-live="polite"></p>
      </section>
    `;

    document.body.appendChild(host);

    // Populate values
    document.getElementById('setShoeday').checked = (s.shoeday === '1');
    document.getElementById('pinStatus').textContent = pinExists() ? 'Set' : 'Not set';
    document.getElementById('pinCurRow').style.display = pinExists() ? '' : 'none';

    document.getElementById('syncEnabled').checked = (cfg.syncEnabled === '1') && !!(cfg.syncEndpoint||'').trim();
    document.getElementById('syncEndpoint').value = cfg.syncEndpoint || '';
    document.getElementById('syncToken').value = cfg.syncToken || '';

    // Wire actions
    document.getElementById('btnClose').addEventListener('click', ()=> host.remove());
    document.getElementById('btnSave').addEventListener('click', ()=> onSave(host));
  }

  async function onSave(host){
    const msg = host.querySelector('#msg');

    // Shoeday
    const shoedayOn = host.querySelector('#setShoeday').checked;
    setSetting('shoeday', shoedayOn ? '1' : '0');
    // Keep Jonah landing toggle in sync with old key used by landing.js
    try{ localStorage.setItem('jonah_shoeday', shoedayOn ? '1' : '0'); }catch{}

    // PIN set/change
    const new1 = host.querySelector('#pinNew').value.trim();
    const new2 = host.querySelector('#pinNew2').value.trim();
    const cur  = host.querySelector('#pinCurrent').value.trim();
    if(new1 || new2){
      if(new1 !== new2){ msg.textContent = 'PINs must match.'; return; }
      const res = setPin(new1, cur);
      if(!res.ok){ msg.textContent = 'Current PIN incorrect.'; return; }
    }

    // Sync
    const enabled  = host.querySelector('#syncEnabled').checked;
    const endpoint = host.querySelector('#syncEndpoint').value.trim();
    const token    = host.querySelector('#syncToken').value.trim();
    syncSetConfig({ endpoint, token, enabled });

    msg.textContent = 'Saved.';
    setTimeout(()=>{ host.remove(); }, 400);
  }

  // Attach launcher to window so pages can open the modal
  window.openSettings = open;
})();
