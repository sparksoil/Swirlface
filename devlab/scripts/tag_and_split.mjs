import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Determine file and directory names.
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Read Pelican configuration.
const cfgPath = path.join(__dirname, 'pelican.config.json');
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));

// CLI argument: path to the raw input document.
const inputPath = process.argv[2];
if (!inputPath) {
  console.error("Usage: node scripts/tag_and_split.mjs raw-drops/YourDoc.txt");
  process.exit(1);
}

// Helper to slugify filenames.
function slugify(s, max = cfg.filenameSlugMax || 70) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, max) || 'untitled';
}

// Ensure directory exists.
function ensureDir(d) {
  fs.mkdirSync(d, { recursive: true });
}

// Automatically wrap lines starting with "Speaker:" with [Speaker] tags.
function tagSpeakers(text, speakers) {
  if (!speakers || !speakers.length) return text;
  const re = new RegExp(`^\\s*(${speakers.join('|')}):\\s*`, 'gm');
  return text.replace(re, (_m, who) => `[${who}] `);
}

// Normalize newline characters.
function normalizeNewlines(s) {
  return s.replace(/\r\n?/g, '\n');
}

// Detect and split document into blocks based on headers.
function detectBlocks(text) {
  // Blocks begin at lines starting with "## " matching our section titles.
  // If none found, we'll create one default block.
  const lines = text.split('\n');
  const blocks = [];
  let cur = null;

  // Map known section keywords to configuration.
  const known = new Map(cfg.sections.map((s) => [s.match.toLowerCase(), s]));

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const hdr = line.match(/^##\s+(.+?)\s*$/);
    if (hdr) {
      const title = hdr[1].trim();
      // Find matching section mapping.
      let mapKey = null;
      for (const [k] of known) {
        if (title.toLowerCase().includes(k)) {
          mapKey = k;
          break;
        }
      }
      const sectCfg = mapKey ? known.get(mapKey) : null;
      // Push previous block.
      if (cur) blocks.push(cur);
      cur = {
        title,
        dir: sectCfg ? sectCfg.dir : cfg.defaultSection?.dir || 'stories/accidentally-real',
        body: [],
      };
    } else {
      // Use default section until first header appears.
      if (!cur) {
        cur = {
          title: cfg.defaultSection?.title || 'Story Bits – Kitty & Otter',
          dir: cfg.defaultSection?.dir || 'stories/accidentally-real',
          body: [],
        };
      }
      cur.body.push(line);
    }
  }
  if (cur) blocks.push(cur);
  return blocks;
}

// Write each block to its respective file and return list of written files.
function writeBlocks(blocks) {
  const written = [];
  for (const b of blocks) {
    ensureDir(b.dir);
    const firstMeaningful =
      (b.body.join('\n').match(/[A-Za-z0-9\[\(\"\“\w].{0,80}/) || [''])[0].trim();
    const base = slugify(`${b.title}-${firstMeaningful}`) || slugify(b.title);
    const file = path.join(b.dir, `${base}.md`);
    const content = `# ${b.title}\n\n${b.body.join('\n').trim()}\n`;
    fs.writeFileSync(file, content, 'utf8');
    written.push(file);
  }
  return written;
}

// Update the .pelican/INDEX.md file with new entries.
function updateIndex(written) {
  const idxPath = path.join(process.cwd(), '.pelican', 'INDEX.md');
  const before = fs.existsSync(idxPath)
    ? fs.readFileSync(idxPath, 'utf8')
    : '# Swirl Index\n\n';
  let add = '\n';
  for (const f of written) {
    const rel = f.replace(process.cwd() + path.sep, '');
    add += `- ${path.basename(path.dirname(rel))} → ${rel}\n`;
  }
  const after = before + add;
  fs.writeFileSync(idxPath, after, 'utf8');
  return idxPath;
}

// Read raw file, normalize newlines, and tag speakers.
let raw = fs.readFileSync(inputPath, 'utf8');
raw = normalizeNewlines(raw);
raw = tagSpeakers(raw, cfg.speakers);

// If the document lacks "##" headers, heuristically insert them.
// Use single backslashes in regex literals (e.g. \s for whitespace, \b for word boundary).
if (!/^##\s/m.test(raw)) {
  const patterns = [
    { re: /^\s*story\b.*$/gim, head: '## Story Bits – Kitty & Otter' },
    { re: /^\s*tech\b.*$/gim,  head: '## Tech Notes – RV Helper' },
    { re: /^\s*health\b.*$/gim, head: '## Health Log' },
  ];
  let marked = raw;
  let any = false;
  for (const p of patterns) {
    if (p.re.test(marked)) {
      any = true;
      marked = marked.replace(p.re, (m) => `${p.head}\n${m}`);
    }
  }
  raw = any
    ? marked
    : `## ${cfg.defaultSection?.title || 'Story Bits – Kitty & Otter'}\n` + raw;
}

// Split into blocks, write them, update index, and report.
const blocks = detectBlocks(raw);
const written = writeBlocks(blocks);
const idx = updateIndex(written);

console.log('Pelican: wrote files:');
written.forEach((f) => console.log('  -', f));
console.log('Index updated:', idx);