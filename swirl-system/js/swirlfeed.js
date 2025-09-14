import { load } from './storage.js';

const KEY = 'crumbs';

const PILLAR_ICON = {
  '👑 Spiritual Routine':'👑 Spiritual Routine',
  '🏡 Family':'🏡 Family',
  '🌱 Self+Parts':'🌱 Self+Parts',
  '📚 RRR':'📚 RRR',
  '💵 Earning':'💵 Earning',
  // also support old internal codes if any
  'divine':'👑 Spiritual Routine','family':'🏡 Family','self':'🌱 Self+Parts','rrr':'📚 RRR','work':'💵 Earning'
};

const feed = document.getElementById('swirl-feed') || document.getElementById('feed');
const tpl  = document.getElementById('postTpl');

function byNewest(a,b){ return new Date(b.date) - new Date(a.date); }

function ymd(dateStr){
  const d = new Date(dateStr);
  const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,'0'), da = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${da}`;
}

function render(){
  if(!feed || !tpl) return;
  const data = load(KEY, []);
  const posts = [...data].sort(byNewest);
  feed.innerHTML = '';
  posts.forEach(c=>{
    const node = tpl.content.cloneNode(true);
    node.querySelector('.pillar').textContent = PILLAR_ICON[c.pillar] || c.pillar || '🌀';
    node.querySelector('.date').textContent   = new Date(c.date).toLocaleString();
    node.querySelector('.text').textContent   = c.text || '';
    node.querySelector('.parts').textContent  = (c.parts?.length ? `Parts: ${c.parts.join(', ')}` : '');

    const media = node.querySelector('.media');
    if (c.photo){
      const img = document.createElement('img');
      img.src = c.photo;
      img.alt = 'crumb photo';
      media.appendChild(img);
    }

    node.querySelector('.save').addEventListener('click',()=>{
      location.href = `./day.html?d=${encodeURIComponent(ymd(c.date))}`;
    });

    node.querySelector('.like').addEventListener('click', (e)=>{
      e.currentTarget.classList.toggle('faved');
    });

    feed.appendChild(node);
  });
}

document.addEventListener('crumbsChanged', render);
render();
