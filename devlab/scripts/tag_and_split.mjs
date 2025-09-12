import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const cfgPath = path.join(__dirname, 'pelican.config.json');
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));

const inputPath = process.argv[2];
if (!inputPath) {
  console.error("Usage: node scripts/tag_and_split.mjs raw-drops/YourDoc.txt");
  process.exit(1);
}

function slugify(s, max=cfg.filenameSlugMax || 70){
  return (s || '').toLowerCase()
    .replace(/[^a-z0-9]+/g,'-')
    .replace(/^-+|-+$/g,'')
    .slice(0, max) || 'untitled';
}
function ensureDir(d){ fs.mkdirSync(d, { recursive: true }); }
function normalizeNewlines(s){ return s.replace(/\r\n?/g, '\n'); }

function tagSpeakers(text, speakers){
  if (!speakers?.length) return text;
  const re = new RegExp(`^\\s*(${speakers.join('|')}):\\s*`,'gm');
  return text.replace(re, (_m, who) => `[${who}] `);
}

function detectBlocks(text){
  const lines = text.split('\n');
  const blocks = [];
  let cur = null;

  const known = new Map((cfg.sections||[]).map(s=>[s.match.toLowerCase(), s]));

  for (let i=0; i<lines.length; i++){
    const line = lines[i];
    const hdr = line.match(/^##\s+(.+?)\s*$/);
    if (hdr){
      const title = hdr[1].trim();
      let key = null;
      for (const [k] of known){ if (title.toLowerCase().includes(k)) { key = k; break; } }
      const sectCfg = key ? known.get(key) : null;
      if (cur) blocks.push(cur);
      cur = { title, dir: sectCfg ? sectCfg.dir : (cfg.defaultSection?.dir || 'stories/accidentally-real'), body: [] };
    } else {
      if (!cur){
        cur = { title: (cfg.defaultSection?.title || 'Story Bits – Kitty & Otter'),
                dir: (cfg.defaultSection?.dir   || 'stories/accidentally-real'),
                body: [] };
      }
      cur.body.push(line);
    }
  }
  if (cur) blocks.push(cur);
  return blocks;
}

function pickDir(title, body){
  const t = (title||'').toLowerCase();
  const b = (body||'').toLowerCase();
  if (t.includes('tech notes') || /\b(app|dashboard|github|repo|toggle|integrity compass|feathered archive)\b/.test(b)) return 'dev-notes/rv-helper';
  if (t.includes('health log') || /\b(cycle day|cd\s*\d+|period|luteal|flare|histamine|sinus|crohn)\b/.test(b)) return 'pelican-logs/health';
  return 'stories/accidentally-real';
}

function writeBlocks(blocks){
  const written = [];
  for (const b of blocks){
    const body = b.body.join('\n').trim();
    if (!body) continue;
    const dir = pickDir(b.title, body);
    ensureDir(dir);
    const first = (body.match(/[A-Za-z0-9\[\(\"\“\w].{0,80}/) || [''])[0].trim();
    const base = slugify(`${b.title}-${first}`) || slugify(b.title);
    const file = path.join(dir, `${base}.md`);
    const content = `# ${b.title}\n\n${body}\n`;
    fs.writeFileSync(file, content, 'utf8');
    written.push(file);
  }
  return written;
}

function updateIndex(written){
  ensureDir('.pelican');
  const idxPath = path.join('.pelican','INDEX.md');
  if (!fs.existsSync(idxPath)){
    fs.writeFileSync(idxPath, `# Swirl Index\n\n- Story Bits (Kitty & Coffee) → _pending_\n- Tech (RV Helper) → _pending_\n- Health Logs → _pending_\n\n> “Jehovah is near to all those calling on him.” — Psalm 145:18\n`, 'utf8');
  }
  const before = fs.readFileSync(idxPath,'utf8');
  let add = '\n';
  for (const f of written){
    add += `- ${path.basename(path.dirname(f))} → ${f}\n`;
  }
  fs.writeFileSync(idxPath, before + add, 'utf8');
  return idxPath;
}

// Pipeline
let raw = fs.readFileSync(inputPath, 'utf8');
raw = normalizeNewlines(raw);
raw = tagSpeakers(raw, cfg.speakers);

// If no headers exist, add a default
if (!/^##\s/m.test(raw)) raw = `## ${cfg.defaultSection?.title || 'Story Bits – Kitty & Otter'}\n` + raw;

const blocks  = detectBlocks(raw);
const written = writeBlocks(blocks);
const idx     = updateIndex(written);

console.log('Pelican wrote:');
written.forEach(f => console.log(' -', f));
console.log('Index updated:', idx);
