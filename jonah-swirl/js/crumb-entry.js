import { preselectPillarFromHash, saveCrumb, todayCrumbs } from './storage.js';
import { compressFileToDataUrl } from './photos.js';
import { seasonClass } from './season.js';

(function(){
  const form = document.getElementById('crumbForm');
  const pillar = document.getElementById('pillar');
  const text = document.getElementById('text');
  const tags = document.getElementById('tags');
  const photo = document.getElementById('photo');
  const todayUl = document.getElementById('todayUl');

  if (pillar) preselectPillarFromHash(pillar);

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    if(!pillar.value || !text.value.trim()) return;

    let media = [];
    const file = photo?.files?.[0];
    if(file){
      try{
        const { dataUrl, width, height } = await compressFileToDataUrl(file, { max: 1024, quality: .72 });
        media = [{ kind:'image', dataUrl, w: width, h: height }];
      }catch(err){
        console.warn('Photo compression failed, saving without image', err);
      }
    }

    const crumb = saveCrumb({
      pillar: pillar.value,
      text: text.value.trim(),
      tags: tags.value.trim(),
      media
    });

    // Reset text & photo, keep pillar for easy next crumb
    text.value = ''; tags.value = ''; if(photo) photo.value = '';
    addToTodayList(crumb);
  });

  renderToday();

  function renderToday(){
    todayUl.innerHTML = '';
    todayCrumbs().forEach(addToTodayList);
  }

  function addToTodayList(c){
    const li = document.createElement('li');
    li.className = 'crumb-age ' + seasonClass(c.tsISO);
    li.innerHTML = renderCrumbRow(c);
    todayUl.prepend(li);
  }

  function renderCrumbRow(c){
    const emoji = { divine:'👑', family:'🏠', self:'🌱', rrr:'📚', work:'💵' }[c.pillar] || '•';
    const text = escapeHtml(c.text);
    const img = (Array.isArray(c.media) && c.media[0]?.kind==='image')
      ? `<div style="margin-top:6px;"><img alt="" src="${c.media[0].dataUrl}" style="max-width:100%; height:auto; border-radius:10px;"/></div>`
      : '';
    return `${emoji} ${text}${img}`;
  }

  function escapeHtml(s){ return (s||'').replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;', "'":'&#39;' }[m])); }
})();
