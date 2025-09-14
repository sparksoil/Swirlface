// Phase 1+ : Drop-a-crumb (photo, text, pillar) + starter Parts/Feelings/Needs + optional micro-goal prompt
import { load, save } from './storage.js';

const KEY = 'crumbs';

const PILLAR_LABELS = {
  'divine':'👑 Divine', 'family':'🏡 Family', 'self':'🌱 Self+Parts', 'rrr':'📚 RRR', 'work':'💵 Earning',
  '👑 Divine':'👑 Divine','🏡 Family':'🏡 Family','🌱 Self+Parts':'🌱 Self+Parts','📚 RRR':'📚 RRR','💵 Earning':'💵 Earning'
};

const feelings = ['Happy','Sad','Tired','Calm','Excited'];
const needs    = ['Rest','Play','Help','Comfort','Space'];
const parts    = ['Otter','Ron','Lucy','Glimmer'];

function qs(id){ return document.getElementById(id); }
function renderList(){
  const list = qs('crumbList');
  if(!list) return;
  const data = load(KEY, []);
  list.innerHTML = data.slice().reverse().map(c => {
    const when = new Date(c.date).toLocaleString();
    const pill = PILLAR_LABELS[c.pillar] || c.pillar || '🌀';
    const img  = c.photo ? `<img class="thumb" src="${c.photo}" alt="">` : '';
    const meta = [
      c.part ? `Part: ${c.part}` : '',
      c.feeling ? `Feeling: ${c.feeling}` : '',
      c.need ? `Need: ${c.need}` : '',
      c.goal?.skill ? `Goal: ${c.goal.skill} → ${c.goal.nextStep}` : ''
    ].filter(Boolean).join(' · ');
    return `<li class="crumb">
      <div class="head"><span class="pill">${pill}</span><span class="when">${when}</span></div>
      ${img}
      <p>${c.text||''}</p>
      ${meta ? `<p class="meta">${meta}</p>` : ''}
    </li>`;
  }).join('');
}

function readFileAsDataURL(file){
  return new Promise(res=>{
    if(!file) return res(null);
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.readAsDataURL(file);
  });
}

window.addEventListener('DOMContentLoaded', ()=>{
  const form = qs('crumbForm');
  const pillarEl = qs('pillar');
  const textEl = qs('text');
  const photoEl = qs('photo');

  // Inject starter selects if not present
  const extras = qs('extras');
  if (extras && !qs('feeling')){
    extras.innerHTML = `
      <label>Feeling (optional)
        <select id="feeling"><option value="">—</option>${feelings.map(x=>`<option>${x}</option>`).join('')}</select>
      </label>
      <label>Need (optional)
        <select id="need"><option value="">—</option>${needs.map(x=>`<option>${x}</option>`).join('')}</select>
      </label>
      <label>Part (optional)
        <select id="part"><option value="">—</option>${parts.map(x=>`<option>${x}</option>`).join('')}</select>
      </label>
      <label>Real-life tag (optional)
        <select id="reallife"><option value="">—</option><option>🐾 Pet Call</option><option>🧻 Toilet Time</option></select>
      </label>
      <div id="goalWrap" class="goal hidden">
        <h3>Micro Goal</h3>
        <label>Skill <input id="goalSkill" placeholder="e.g., Responsibility"/></label>
        <label>Next step <input id="goalNext" placeholder="e.g., Carry wipes & count pets"/></label>
        <label>Helper part
          <select id="goalPart"><option value="">—</option>${parts.map(x=>`<option>${x}</option>`).join('')}</select>
        </label>
      </div>
    `;
  }

  // Show/hide micro-goal when a real-life tag is chosen
  qs('reallife')?.addEventListener('change', e=>{
    qs('goalWrap')?.classList.toggle('hidden', !e.target.value);
  });

  form?.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const text   = textEl.value.trim();
    const pillar = PILLAR_LABELS[pillarEl.value] || pillarEl.value;
    if(!text) return;

    const photo = await readFileAsDataURL(photoEl.files?.[0]);
    const data  = load(KEY, []);
    const crumb = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      pillar,
      text,
      photo: photo || null,
      feeling: qs('feeling')?.value || '',
      need: qs('need')?.value || '',
      part: qs('part')?.value || '',
    };

    // attach micro-goal if visible
    if (!qs('goalWrap')?.classList.contains('hidden')){
      const skill = qs('goalSkill').value.trim();
      const next  = qs('goalNext').value.trim();
      const gpart = qs('goalPart').value.trim();
      if (skill || next || gpart){
        crumb.goal = { skill, nextStep: next, part: gpart };
      }
    }

      data.push(crumb);
      save(KEY, data);
      document.dispatchEvent(new Event('crumbsChanged'));
      form.reset();
      // hide goal wrap again
      qs('goalWrap')?.classList.add('hidden');
      renderList();
    });

  renderList();
});
