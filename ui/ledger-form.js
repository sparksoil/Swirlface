// Emits normalized entries via onSubmit callback
export function wireForm(form, {onSubmit}){
  const date = form.querySelector('input[name="date"]');
  const todayISO = () => new Date().toISOString().slice(0,10);
  date.value = todayISO();

  const multiToggle = document.getElementById('multiToggle');
  const multiFields = document.getElementById('multiFields');
  const multiChoice = document.getElementById('multiChoice');

  multiToggle.addEventListener('change', ()=>{
    const on = multiToggle.checked;
    multiFields.style.display = on ? '' : 'none';
    multiChoice.style.display = on ? '' : 'none';
  });

  form.addEventListener('submit', (ev)=>{
    ev.preventDefault();
    const fd = new FormData(form);
    const base = {
      id: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())+Math.random()),
      date: fd.get('date') || todayISO(),
      client: (fd.get('client')||'').trim(),
      category: 'Income', platform: 'Direct',
      service: (fd.get('service')||'').trim(),
      amount: Number(fd.get('amount')||0),
      method: fd.get('method') || 'Other',
      paid: !!fd.get('paid'),
      notes: (fd.get('notes')||'').trim()
    };
    if(!base.client){ alert('Name the client so the log can stand.'); return; }

    const multiday = !!fd.get('multiday');
    if(!multiday){
      onSubmit && onSubmit(base, {multiday:{mode:'none'}});
      return;
    }

    const startDate = fd.get('startDate'), endDate = fd.get('endDate');
    const split = (fd.get('splitEvenly')||'yes')==='yes';
    const mode = (fd.get('expandMode')||'summary');
    if(!startDate || !endDate){ alert('Start and End are needed.'); return; }

    const d0 = new Date(startDate), d1 = new Date(endDate);
    const days = Math.floor((d1 - d0)/86400000) + 1;
    if(days<=0){ alert('End date must be same or after start.'); return; }

    if(mode==='summary'){
      onSubmit && onSubmit({...base, startDate, endDate, days, isRange:true}, {multiday:{mode}});
    }else{
      const cents = Math.round(Number(base.amount)*100);
      const baseC = Math.floor(cents / days); let rem = cents - baseC*days;
      const expanded = [];
      for(let i=0;i<days;i++){
        const dISO = new Date(d0.getTime() + i*86400000).toISOString().slice(0,10);
        const amtC = (split ? baseC + (i<rem?1:0) : (i===0?cents:0));
        expanded.push({...base, id:(crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random()), date:dISO, amount:Number((amtC/100).toFixed(2)), startDate, endDate, days, isExpandedChild:true});
      }
      onSubmit && onSubmit(base, {multiday:{mode, expanded}});
    }
  });
}
