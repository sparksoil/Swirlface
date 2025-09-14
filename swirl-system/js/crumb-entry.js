// Phase 1+ : Drop-a-crumb (photo, text, pillar) + starter Parts/Feelings + optional micro-goal prompt
import { load, save } from './storage.js';

const KEY = 'crumbs';

const PILLAR_LABELS = {
  'divine':'👑 Spiritual Routine', 'family':'🏡 Family', 'self':'🌱 Self+Parts', 'rrr':'📚 RRR', 'work':'💵 Earning',
  '👑 Spiritual Routine':'👑 Spiritual Routine','🏡 Family':'🏡 Family','🌱 Self+Parts':'🌱 Self+Parts','📚 RRR':'📚 RRR','💵 Earning':'💵 Earning'
};

const STARTER_PARTS = ["Curious", "Tired", "Brave", "Helper", "Playful"];
const STARTER_FEELINGS = ["Calm","Happy","Frustrated","Anxious","Proud"];
// Goal fields minimal:
const GOAL_FIELDS = ["Skill","Next step","Helper part"];

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
      part: form.elements['part']?.value || '',
      feeling: form.elements['feeling']?.value || ''
    };

    const skill = form.elements['goalSkill']?.value.trim();
    const next  = form.elements['goalNext']?.value.trim();
    const helper = form.elements['goalHelper']?.value.trim();
    if (skill || next || helper){
      crumb.goal = { skill, nextStep: next, helper };
    }

    data.push(crumb);
    save(KEY, data);
    document.dispatchEvent(new Event('crumbsChanged'));
    form.reset();
    renderList();
  });

  renderList();
});
