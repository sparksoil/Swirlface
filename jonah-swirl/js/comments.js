import { addComment, commentsFor, deleteCrumb, listCrumbs } from './storage.js';

/* Minimal comment wiring for the Day page.
   - Assumes each crumb row has data-id and containers:
     .c-actions (buttons), .c-comments (list), .c-add (form)
*/
export function renderCommentsFor(container, crumbId){
  const list = commentsFor(crumbId);
  container.innerHTML = '';
  list.sort((a,b)=>(a.tsISO||'').localeCompare(b.tsISO||'')).forEach(m=>{
    const li = document.createElement('li');
    li.textContent = m.text;
    container.appendChild(li);
  });
}

export function mountCommentForm(formEl, crumbId, onAdded){
  const input = formEl.querySelector('input');
  formEl.addEventListener('submit', (e)=>{
    e.preventDefault();
    const t = (input.value||'').trim();
    if(!t) return;
    addComment({crumbId, text:t});
    input.value = '';
    onAdded?.();
  });
}

export function handleDelete(btnEl, crumbId, refresh){
  btnEl.addEventListener('click', ()=>{
    // Require PIN first
    if(typeof window.pinPrompt !== 'function'){ alert('PIN module missing'); return; }
    window.pinPrompt({mode:'verify', onOk(){
      deleteCrumb(crumbId);
      refresh?.();
    }});
  });
}

// Utility to re-render a generic crumb list when deletions happen
export function refreshList(listRoot, makeRow){
  listRoot.innerHTML = '';
  listCrumbs().forEach(c=> listRoot.appendChild(makeRow(c)));
}
