export function wireCoffeeMini(box){
  if(!box) return;
  const start = box.querySelector('#start10');
  const note  = box.querySelector('#coffeeNote');
  const KEY = "coffee_note_v1";

  note.value = localStorage.getItem(KEY) || "";
  note.addEventListener('change', ()=> localStorage.setItem(KEY, note.value));

  start.addEventListener('click', ()=>{
    start.disabled = true; start.textContent = "…counting";
    const end = Date.now() + 10*60*1000;
    const t = setInterval(()=>{
      const left = Math.max(0, end - Date.now());
      if(left===0){ clearInterval(t); start.disabled=false; start.textContent="10 min"; alert("Done. That counts."); }
    }, 500);
  });
}
