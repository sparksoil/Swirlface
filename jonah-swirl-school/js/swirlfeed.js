import { listCrumbs, toggleLike, isLiked } from './storage.js';
import { seasonClass } from './season.js';

const feedRoot = document.getElementById('feedRoot');
const chipRow = document.querySelector('.chips');
const storyTrack = document.getElementById('storyTrack');
const qInput = document.getElementById('q');

if(!feedRoot){
  console.warn('Swirlfeed: root element missing');
}

let currentPill = 'all';
let q = '';

const PILL_META = {
  divine: { label: 'Spiritual Routine', emoji: '👑', ring: 'var(--pillar-spiritual)' },
  family: { label: 'Home', emoji: '🏠', ring: 'var(--pillar-family)' },
  self:   { label: 'Self', emoji: '🌱', ring: 'var(--pillar-self)' },
  rrr:    { label: 'Skills', emoji: '📚', ring: 'var(--pillar-rrr)' },
  work:   { label: 'Work', emoji: '💵', ring: 'var(--pillar-work)' }
};
const ORDERED_PILLARS = ['divine','family','self','rrr','work'];
const STORY_ORDER = ['all', ...ORDERED_PILLARS];

const hashPill = (location.hash || '').replace('#','').trim();
if(hashPill && (hashPill === 'all' || ORDERED_PILLARS.includes(hashPill))){
  currentPill = hashPill;
}

function ensurePillars(crumb){
  if(Array.isArray(crumb?.pillars) && crumb.pillars.length) return crumb.pillars;
  if(crumb?.pillar) return [crumb.pillar];
  return [];
}

function emojiFor(pillar){
  return PILL_META[pillar]?.emoji || '🌀';
}

function normalize(str){
  return (str || '').toLowerCase().trim();
}

function filtered(){
  const all = listCrumbs();
  const qn = normalize(q);
  return all.filter(crumb => {
    if(currentPill !== 'all' && !ensurePillars(crumb).includes(currentPill)) return false;
    if(!qn) return true;
    const haystack = [
      crumb.text,
      ...(Array.isArray(crumb.tags) ? crumb.tags : []),
      ...(Array.isArray(crumb.skills) ? crumb.skills : []),
      ...(Array.isArray(crumb.parts) ? crumb.parts : []),
      ...ensurePillars(crumb).map(p => PILL_META[p]?.label || p)
    ].join(' ').toLowerCase();
    return haystack.includes(qn);
  });
}

function groupByDay(rows){
  const map = new Map();
  for(const crumb of rows){
    const day = (crumb.tsISO || '').slice(0,10);
    if(!map.has(day)) map.set(day, []);
    map.get(day).push(crumb);
  }
  return [...map.entries()].sort((a,b) => b[0].localeCompare(a[0]));
}

function parseDay(day){
  const [y,m,d] = (day || '').split('-').map(Number);
  if([y,m,d].some(n => Number.isNaN(n))) return null;
  return new Date(y, m - 1, d);
}

function formatDayLabel(day){
  const dt = parseDay(day);
  if(!dt) return day;
  return new Intl.DateTimeFormat(undefined, { weekday:'long', month:'short', day:'numeric' }).format(dt);
}

function relativeDayLabel(day){
  const dt = parseDay(day);
  if(!dt) return '';
  const today = new Date();
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startTarget = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
  const diff = Math.round((startToday - startTarget) / 86400000);
  if(diff === 0) return 'Today';
  if(diff === 1) return 'Yesterday';
  if(diff > 1 && diff < 7) return `${diff} days ago`;
  return '';
}

function formatTimeLabel(ts){
  if(!ts) return '';
  const dt = new Date(ts);
  if(Number.isNaN(dt.getTime())) return '';
  return new Intl.DateTimeFormat(undefined, { hour:'numeric', minute:'2-digit' }).format(dt);
}

function crumbCountLabel(n){
  if(!n) return '';
  return `${n} ${n === 1 ? 'crumb' : 'crumbs'}`;
}

function heroMedia(crumb){
  if(!crumb || !Array.isArray(crumb.media)) return null;
  return crumb.media.find(m => {
    if(!m) return false;
    if(m.kind === 'image') return true;
    if(m.kind === 'photo') return true;
    if(typeof m.type === 'string' && m.type.startsWith('image/')) return true;
    return false;
  }) || null;
}

function uniquePillars(items){
  const set = new Set();
  for(const crumb of items){
    ensurePillars(crumb).forEach(p => set.add(p));
  }
  return STORY_ORDER.filter(p => p !== 'all' && set.has(p));
}

function summaryText(items){
  const rest = items.slice(1).map(c => c.text || '').filter(Boolean).join(' ');
  if(!rest) return '';
  const trimmed = rest.trim();
  if(trimmed.length <= 320) return trimmed;
  return trimmed.slice(0, 320).trimEnd() + '…';
}

function buildPillarChips(pillars, extraClass = ''){
  if(!pillars.length) return null;
  const wrap = document.createElement('div');
  wrap.className = extraClass ? `pillar-chips ${extraClass}` : 'pillar-chips';
  pillars.forEach(p => {
    const span = document.createElement('span');
    span.className = 'pillar-chip';
    span.dataset.pillar = p;
    span.textContent = `${emojiFor(p)} ${PILL_META[p]?.label || p}`;
    wrap.appendChild(span);
  });
  return wrap;
}

function buildThread(day, items){
  const section = document.createElement('section');
  section.className = 'post-thread';
  section.hidden = true;
  const slug = (day || '').replace(/[^0-9a-z]/gi, '');
  section.id = slug ? `thread-${slug}` : `thread-${Math.random().toString(36).slice(2,8)}`;

  const list = document.createElement('ul');
  list.className = 'thread-list';
  items.forEach(crumb => {
    const li = document.createElement('li');
    li.className = 'thread-item crumb-age ' + seasonClass(crumb.tsISO);

    const top = document.createElement('div');
    top.className = 'thread-top';
    const time = document.createElement('span');
    time.className = 'thread-time';
    time.textContent = formatTimeLabel(crumb.tsISO);
    top.appendChild(time);
    li.appendChild(top);

    const pillars = ensurePillars(crumb);
    const text = document.createElement('div');
    text.className = 'thread-text';
    const emoji = pillars.length ? emojiFor(pillars[0]) : '•';
    text.textContent = `${emoji} ${crumb.text || ''}`.trim();
    li.appendChild(text);

    const chips = buildPillarChips(pillars, 'thread-pillars');
    if(chips) li.appendChild(chips);

    const media = heroMedia(crumb);
    if(media){
      const mediaWrap = document.createElement('div');
      mediaWrap.className = 'thread-media';
      const img = document.createElement('img');
      img.src = media.dataUrl || media.url || '';
      img.alt = media.alt || 'Crumb photo';
      mediaWrap.appendChild(img);
      li.appendChild(mediaWrap);
    }

    list.appendChild(li);
  });
  section.appendChild(list);

  const openBtn = document.createElement('button');
  openBtn.className = 'thread-open';
  openBtn.type = 'button';
  openBtn.textContent = 'Open day journal';
  openBtn.dataset.day = day;
  section.appendChild(openBtn);

  return section;
}

function smoothScrollIntoView(el){
  if(!el || typeof el.scrollIntoView !== 'function') return;
  const prefersReduce = typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ block: 'nearest', behavior: prefersReduce ? 'auto' : 'smooth' });
}

function updateLikeButton(btn, liked){
  btn.dataset.liked = liked ? 'true' : 'false';
  btn.setAttribute('aria-pressed', liked ? 'true' : 'false');
  btn.setAttribute('aria-label', liked ? 'Unlike this crumb' : 'Like this crumb');
  btn.innerHTML = liked ? '❤️ <span>Liked</span>' : '🤍 <span>Like</span>';
}

function showFeedback(el, text){
  if(!el) return;
  el.textContent = text;
  if(el._timer) clearTimeout(el._timer);
  el._timer = setTimeout(() => {
    el.textContent = '';
  }, 4000);
}

async function shareDayLink(day, feedback){
  try{
    const url = new URL('./day.html', location.href);
    url.search = `?d=${day}`;
    const shareUrl = url.toString();
    if(navigator.share){
      await navigator.share({ title: `Jonah · ${day}`, url: shareUrl });
      showFeedback(feedback, 'Shared');
      return;
    }
    if(navigator.clipboard && navigator.clipboard.writeText){
      await navigator.clipboard.writeText(shareUrl);
      showFeedback(feedback, 'Link copied');
      return;
    }
    const a = document.createElement('a');
    a.href = shareUrl;
    a.target = '_blank';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
    showFeedback(feedback, 'Opened day view');
  }catch(err){
    console.error('Share failed', err);
    showFeedback(feedback, 'Link ready in address bar');
  }
}

function makePost(day, items){
  const primary = items[0];
  const article = document.createElement('article');
  article.className = 'feed-post crumb-age ' + seasonClass(primary?.tsISO);

  const header = document.createElement('header');
  header.className = 'post-head';
  article.appendChild(header);

  const ident = document.createElement('div');
  ident.className = 'post-ident';
  header.appendChild(ident);

  const avatar = document.createElement('div');
  avatar.className = 'post-avatar';
  avatar.textContent = emojiFor(ensurePillars(primary)[0]) || '🌀';
  ident.appendChild(avatar);

  const meta = document.createElement('div');
  meta.className = 'post-meta';
  ident.appendChild(meta);

  const dayLabel = document.createElement('span');
  dayLabel.className = 'post-day';
  dayLabel.textContent = formatDayLabel(day);
  meta.appendChild(dayLabel);

  const info = document.createElement('span');
  info.className = 'post-time';
  const rel = relativeDayLabel(day);
  const timeLabel = formatTimeLabel(primary?.tsISO);
  const countLabel = crumbCountLabel(items.length);
  info.textContent = [rel || timeLabel, countLabel].filter(Boolean).join(' · ');
  meta.appendChild(info);

  const hero = heroMedia(primary);
  if(hero){
    const figure = document.createElement('figure');
    figure.className = 'post-media';
    const img = document.createElement('img');
    img.src = hero.dataUrl || hero.url || '';
    img.alt = hero.alt || 'Crumb photo';
    figure.appendChild(img);
    article.appendChild(figure);
  }

  const body = document.createElement('div');
  body.className = 'post-body';
  article.appendChild(body);

  const caption = document.createElement('p');
  caption.className = 'post-caption';
  const mainEmoji = emojiFor(ensurePillars(primary)[0]);
  caption.textContent = primary ? `${mainEmoji} ${primary.text || ''}`.trim() : 'No crumbs logged yet.';
  body.appendChild(caption);

  const summary = summaryText(items);
  if(summary){
    const summaryEl = document.createElement('p');
    summaryEl.className = 'post-summary';
    summaryEl.textContent = summary;
    body.appendChild(summaryEl);
  }

  const extraCount = items.length - 1;
  if(extraCount > 0){
    const more = document.createElement('p');
    more.className = 'post-more';
    more.textContent = `+${extraCount} more ${extraCount === 1 ? 'moment' : 'moments'} in this day`;
    body.appendChild(more);
  }

  const dayPillars = uniquePillars(items);
  const chips = buildPillarChips(dayPillars, 'post-pillars');
  if(chips) body.appendChild(chips);

  const actions = document.createElement('div');
  actions.className = 'post-actions';
  article.appendChild(actions);

  const likeBtn = document.createElement('button');
  likeBtn.className = 'action-like';
  likeBtn.type = 'button';
  likeBtn.setAttribute('aria-pressed', 'false');
  actions.appendChild(likeBtn);

  const commentBtn = document.createElement('button');
  commentBtn.className = 'action-comment';
  commentBtn.type = 'button';
  commentBtn.innerHTML = '💬 <span>View crumbs</span>';
  commentBtn.setAttribute('aria-expanded', 'false');
  actions.appendChild(commentBtn);

  const shareBtn = document.createElement('button');
  shareBtn.className = 'action-share';
  shareBtn.type = 'button';
  shareBtn.innerHTML = '↗︎ <span>Share</span>';
  shareBtn.setAttribute('aria-label', 'Share day link');
  actions.appendChild(shareBtn);

  const feedback = document.createElement('div');
  feedback.className = 'action-feedback';
  feedback.setAttribute('aria-live', 'polite');
  actions.appendChild(feedback);

  const thread = buildThread(day, items);
  article.appendChild(thread);

  commentBtn.setAttribute('aria-controls', thread.id);
  commentBtn.addEventListener('click', () => {
    const expanded = commentBtn.getAttribute('aria-expanded') === 'true';
    const next = !expanded;
    commentBtn.setAttribute('aria-expanded', next ? 'true' : 'false');
    commentBtn.querySelector('span').textContent = next ? 'Hide crumbs' : 'View crumbs';
    thread.hidden = !next;
    if(next){
      smoothScrollIntoView(thread);
    }
  });

  if(primary){
    updateLikeButton(likeBtn, isLiked(primary.id));
    likeBtn.addEventListener('click', () => {
      const liked = toggleLike(primary.id);
      updateLikeButton(likeBtn, liked);
    });
  }else{
    likeBtn.disabled = true;
    updateLikeButton(likeBtn, false);
  }

  shareBtn.addEventListener('click', () => {
    shareDayLink(day, feedback);
  });

  const openBtn = thread.querySelector('.thread-open');
  openBtn?.addEventListener('click', () => {
    location.href = `./day.html?d=${day}`;
  });

  return article;
}

function updateChipRow(){
  if(!chipRow) return;
  chipRow.querySelectorAll('.chip').forEach(btn => {
    const active = btn.dataset.pill === currentPill;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-selected', active ? 'true' : 'false');
  });
}

function pillarCounts(){
  const counts = { divine:0, family:0, self:0, rrr:0, work:0 };
  for(const crumb of listCrumbs()){
    ensurePillars(crumb).forEach(p => {
      if(p in counts) counts[p] += 1;
    });
  }
  return counts;
}

function storyMeta(id, counts){
  if(id === 'all'){
    const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
    return {
      emoji: '🌀',
      ring: 'var(--accent1)',
      label: 'All pillars',
      short: 'All',
      aria: `All pillars — ${total} ${total === 1 ? 'crumb' : 'crumbs'}`
    };
  }
  const meta = PILL_META[id];
  const count = counts[id] || 0;
  return {
    emoji: meta.emoji,
    ring: meta.ring,
    label: meta.label,
    short: meta.label.split(' ')[0],
    aria: `${meta.label} — ${count} ${count === 1 ? 'crumb' : 'crumbs'}`
  };
}

function renderStories(){
  if(!storyTrack) return;
  const counts = pillarCounts();
  storyTrack.innerHTML = STORY_ORDER.map(id => {
    const meta = storyMeta(id, counts);
    const active = currentPill === id;
    return `<button class="story-chip${active ? ' is-active' : ''}" data-pill="${id}" aria-label="${meta.aria}">
      <span class="story-avatar" style="--ring:${meta.ring};">
        <span class="story-emoji" aria-hidden="true">${meta.emoji}</span>
      </span>
      <span class="story-label">${meta.short}</span>
    </button>`;
  }).join('');
}

function render(){
  if(!feedRoot) return;
  updateChipRow();
  renderStories();

  const rows = filtered();
  const groups = groupByDay(rows);

  feedRoot.innerHTML = '';
  if(!groups.length){
    const empty = document.createElement('p');
    empty.className = 'hint';
    empty.textContent = q || currentPill !== 'all'
      ? 'No crumbs match your filters yet.'
      : 'No crumbs yet. Drop one from the Home doors or Day page.';
    feedRoot.appendChild(empty);
    return;
  }

  for(const [day, items] of groups){
    feedRoot.appendChild(makePost(day, items));
  }
}

function setActivePill(pill){
  const next = pill || 'all';
  if(currentPill === next){
    render();
    return;
  }
  currentPill = next;
  render();
}

if(chipRow){
  chipRow.addEventListener('click', event => {
    const btn = event.target.closest('.chip');
    if(!btn) return;
    const pill = btn.dataset.pill;
    if(!pill) return;
    setActivePill(pill);
  });
}

if(storyTrack){
  storyTrack.addEventListener('click', event => {
    const btn = event.target.closest('.story-chip');
    if(!btn) return;
    const pill = btn.dataset.pill;
    if(!pill) return;
    setActivePill(pill);
  });
}

let debounceId = null;
if(qInput){
  qInput.addEventListener('input', () => {
    clearTimeout(debounceId);
    debounceId = setTimeout(() => {
      q = qInput.value || '';
      render();
    }, 150);
  });
}

if(typeof window !== 'undefined'){
  window.addEventListener('swirl:changed', evt => {
    const type = evt.detail?.type || '';
    if(type.startsWith('crumb_') || type === 'like_toggle'){
      render();
    }
  });
}

render();
