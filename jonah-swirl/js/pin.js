import { pinExists, verifyPin, setPin } from './storage.js';

/* Lightweight PIN modal injected at runtime.
   Use: pinPrompt({mode:'verify'|'set', onOk(pin){...}})
*/
(function(){
  const tpl = `
  <div class="pin-backdrop" data-pin>
    <div class="pin-modal card">
      <h2 id="pinTitle">Parent PIN</h2>
      <form id="pinForm">
        <div id="pinSetBlock" class="pin-block">
          <label class="row"><span class="lab">New PIN</span><input id="pinNew" type="password" inputmode="numeric" autocomplete="new-password" required></label>
          <label class="row"><span class="lab">Confirm</span><input id="pinNew2" type="password" inputmode="numeric" autocomplete="new-password" required></label>
        </div>
        <div id="pinVerifyBlock" class="pin-block">
          <label class="row"><span class="lab">PIN</span><input id="pinInput" type="password" inputmode="numeric" autocomplete="current-password" required></label>
        </div>
        <div id="pinCurrentBlock" class="pin-block">
          <label class="row"><span class="lab">Current</span><input id="pinCurrent" type="password" inputmode="numeric" autocomplete="current-password"></label>
        </div>
        <div class="pin-actions">
          <button class="btn" type="submit">OK</button>
          <button class="btn btn-ghost" type="button" id="pinCancel">Cancel</button>
        </div>
        <p id="pinMsg" role="alert" style="margin:8px 0 0 0;"></p>
      </form>
    </div>
  </div>`;

  function ensureModal(){
    if(document.querySelector('[data-pin]')) return;
    const div = document.createElement('div');
    div.innerHTML = tpl.trim();
    document.body.appendChild(div.firstElementChild);
    document.getElementById('pinCancel').addEventListener('click', close);
    document.querySelector('[data-pin]').addEventListener('click', e=>{ if(e.target.hasAttribute('data-pin')) close();});
  }

  function close(){ const el = document.querySelector('[data-pin]'); if(el) el.remove(); }

   function show(opts){
    ensureModal();
    const setMode = (opts?.mode === 'set');
    const hasPin = pinExists();

    document.getElementById('pinTitle').textContent = setMode ? 'Set/Change Parent PIN' : 'Parent PIN';
    document.getElementById('pinSetBlock').style.display = setMode ? '' : 'none';
    document.getElementById('pinVerifyBlock').style.display = setMode ? 'none' : '';
    document.getElementById('pinCurrentBlock').style.display = (setMode && hasPin) ? '' : 'none';
    document.getElementById('pinMsg').textContent = '';

    const form = document.getElementById('pinForm');
    form.onsubmit = (e)=>{
      e.preventDefault();
      const msg = document.getElementById('pinMsg');

      if(setMode){
        const new1 = document.getElementById('pinNew').value.trim();
        const new2 = document.getElementById('pinNew2').value.trim();
        const cur  = document.getElementById('pinCurrent').value.trim();
        if(!new1 || new1 !== new2){ msg.textContent = 'Pins must match.'; return; }
        const res = setPin(new1, cur);
        if(!res.ok){ msg.textContent = 'Current PIN incorrect.'; return; }
        close(); opts?.onOk?.(new1); return;
      } else {
        const pin = document.getElementById('pinInput').value.trim();
        if(!verifyPin(pin)){ msg.textContent = 'Wrong PIN.'; return; }
        close(); opts?.onOk?.(pin); return;
      }
    };
  }

  // expose globally
  window.pinPrompt = show;
})();
