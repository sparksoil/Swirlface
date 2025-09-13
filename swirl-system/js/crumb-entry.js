import { loadCrumbs, saveCrumbs } from './storage.js';

const PILLAR_LABELS = {
  divine: '👑 Divine Education',
  family: '🏡 Family & Home',
  self: '🌱 Self + Parts',
  rrr: '📚 RRR',
  work: '💵 Employment & Future',
};

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('crumb-form');
  const list = document.getElementById('crumb-list');
  let crumbs = loadCrumbs();
  crumbs.forEach(renderCrumb);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('photo');
    const caption = document.getElementById('caption').value.trim();
    const pillarSelect = document.getElementById('pillar');
    const pillar = pillarSelect.value;
    const part = document.getElementById('part').value.trim();
    const newCrumb = { id: Date.now(), caption, pillar, part };
    const file = fileInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        newCrumb.image = reader.result;
        crumbs.push(newCrumb);
        saveCrumbs(crumbs);
        renderCrumb(newCrumb);
        form.reset();
      };
      reader.readAsDataURL(file);
    } else {
      crumbs.push(newCrumb);
      saveCrumbs(crumbs);
      renderCrumb(newCrumb);
      form.reset();
    }
  });

  function renderCrumb(crumb) {
    const li = document.createElement('li');
    if (crumb.image) {
      const img = document.createElement('img');
      img.src = crumb.image;
      img.alt = crumb.caption || '';
      li.appendChild(img);
    }
    const text = document.createElement('p');
    const partText = crumb.part ? ` (${crumb.part})` : '';
    const pillarLabel = PILLAR_LABELS[crumb.pillar] || crumb.pillar;
    text.textContent = `${pillarLabel}: ${crumb.caption}${partText}`;
    li.appendChild(text);
    list.appendChild(li);
  }
});
