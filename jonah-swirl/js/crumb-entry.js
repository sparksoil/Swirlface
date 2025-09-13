import { preselectPillarFromHash, saveCrumb, todayCrumbs } from './storage.js';

(function(){
  const form = document.getElementById('crumbForm');
  const pillar = document.getElementById('pillar');
  const text = document.getElementById('text');
  const tags = document.getElementById('tags');
  const todayUl = document.getElementById('todayUl');

  // Preselect pillar from URL hash (e.g., day.html#self)
  if (pillar) preselectPillarFromHash(pillar);

  // Submit handler
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    if(!pillar.value || !text.value.trim()) return;

    const crumb = saveCrumb({
      pillar: pillar.value,
      text: text.value.trim(),
      tags: tags.value.trim()
    });

    // Reset text, keep pillar for easy next crumb
    text.value = ''; tags.value = '';
    // Show in list
    addToTodayList(crumb);
  });

  // Render today on load
  renderToday();

  function renderToday(){
    todayUl.innerHTML = '';
    todayCrumbs().forEach(addToTodayList);
  }

  function addToTodayList(c){
    const li = document.createElement('li');
    li.textContent = displayCrumb(c);
    todayUl.prepend(li);
  }

  function displayCrumb(c){
    const emoji = {
      divine:'👑', family:'🏠', self:'🌱', rrr:'📚', work:'💵'
    }[c.pillar] || '•';
    return `${emoji} ${c.text}`;
  }
})();
