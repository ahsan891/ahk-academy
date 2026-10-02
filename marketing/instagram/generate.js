#!/usr/bin/env node
/*
  AHK Akademi — daily content generator
  --------------------------------------
  node generate.js --template r01-turkish-mistake [--topic "since vs for"]
  node generate.js --today                 # picks today's template from calendar.json
  node generate.js --day 7                 # calendar day 7 (1–30)
  node generate.js --template p05-word-card --dry-run   # no API key needed: uses sample.json
  node generate.js --template r15-before-after --input real-student.json   # templates about real people need real facts
  Options: --provider gemini|groq|anthropic  --no-render  --out <dir>  --retries 3

  Flow: build prompt (common rules + template prompt + schema + example) → call a cheap LLM →
        parse JSON → validate against the schema → retry with the error list → save → render.
  API keys come only from env vars: GEMINI_API_KEY, GROQ_API_KEY, ANTHROPIC_API_KEY.
*/
const fs = require('fs');
const path = require('path');
const { loadSchema, validate } = require('./lib/validate');
const { PROVIDERS, pickProvider, extractJSON } = require('./lib/llm');

const ROOT = __dirname;
const TEMPLATES = JSON.parse(fs.readFileSync(path.join(ROOT, 'templates.json'), 'utf8'));
const CALENDAR = JSON.parse(fs.readFileSync(path.join(ROOT, 'calendar.json'), 'utf8'));

function parseArgs(argv) {
  const a = { retries: 3, render: true, dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const v = argv[i];
    if (v === '--template' || v === '-t') a.template = argv[++i];
    else if (v === '--topic') a.topic = argv[++i];
    else if (v === '--input') a.input = argv[++i];
    else if (v === '--today') a.day = dayOfCycle();
    else if (v === '--day') a.day = +argv[++i];
    else if (v === '--provider') a.provider = argv[++i];
    else if (v === '--dry-run' || v === '--sample') a.dryRun = true;
    else if (v === '--no-render') a.render = false;
    else if (v === '--out') a.out = argv[++i];
    else if (v === '--retries') a.retries = +argv[++i];
    else if (v === '--help' || v === '-h') { console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0].split('/*')[1]); process.exit(0); }
  }
  return a;
}

// Day 1 of the 30-day cycle is calendar.start_date; cycles repeat forever.
function dayOfCycle(date = new Date()) {
  const start = new Date(CALENDAR.start_date + 'T00:00:00');
  const diff = Math.floor((date - start) / 86400000);
  return ((diff % 30) + 30) % 30 + 1;
}

function buildPrompt(tpl, schema, sample, topic, realInput) {
  const common = fs.readFileSync(path.join(ROOT, 'prompts', '_common.md'), 'utf8');
  const specific = fs.readFileSync(path.join(ROOT, 'templates', tpl.id, 'prompt.md'), 'utf8');
  const system = `${common}\n\n---\n\n## Template: ${tpl.id} (${tpl.format}) — ${tpl.title}\n${tpl.mechanic}. ${tpl.description}\n\n${specific}\n\n## JSON Schema (obey every constraint)\n${JSON.stringify(schema, null, 1)}\n\n## Example output (same shape, DIFFERENT content — never copy it)\n${JSON.stringify(sample, null, 1)}`;
  let user = topic ? `Topic for this post: ${topic}\nReturn the JSON now.` : 'Pick a fresh, high-engagement topic yourself (not the example). Return the JSON now.';
  if (realInput) user = `REAL FACTS provided by the academy owner — use them exactly, do not change names, numbers or quotes, do not add invented details:\n${JSON.stringify(realInput, null, 1)}\n\n${user}`;
  return { system, user };
}

async function generateData(tpl, opts, log) {
  const dir = path.join(ROOT, 'templates', tpl.id);
  const schema = loadSchema(path.join(dir, 'schema.json'));
  const sample = JSON.parse(fs.readFileSync(path.join(dir, 'sample.json'), 'utf8'));
  const sampleErrors = validate(schema, sample);
  if (sampleErrors.length) log(`  ⚠ sample.json does not match its own schema: ${sampleErrors.join('; ')}`);
  if (opts.dryRun) { log('  dry-run: using sample.json' + (tpl.requires_real_input ? ' (FICTIONAL placeholder — never publish)' : '')); return { data: sample, provider: 'sample' }; }
  let realInput = null;
  if (tpl.requires_real_input) {
    if (!opts.input) throw new Error(`${tpl.id} is about a real person/result. The AI is not allowed to invent it.\n  Create a small JSON file with the real facts (e.g. {"name":"Elif, 24","before":5.5,"after":7.5,"unit":"IELTS","goal":"...","quote":"..."}) and run again with --input that-file.json`);
    realInput = JSON.parse(fs.readFileSync(opts.input, 'utf8'));
  } else if (opts.input) realInput = JSON.parse(fs.readFileSync(opts.input, 'utf8'));

  const provider = pickProvider(opts.provider);
  if (!provider) throw new Error('No API key found. Set GEMINI_API_KEY (or GROQ_API_KEY / ANTHROPIC_API_KEY), or use --dry-run.');
  log(`  provider: ${provider}`);
  const { system, user } = buildPrompt(tpl, schema, sample, opts.topic, realInput);
  let userMsg = user;
  for (let attempt = 1; attempt <= opts.retries; attempt++) {
    let raw;
    try { raw = await PROVIDERS[provider].complete(system, userMsg); }
    catch (e) { log(`  attempt ${attempt}: API error: ${e.message}`); continue; }
    let data;
    try { data = extractJSON(raw); }
    catch (e) { log(`  attempt ${attempt}: invalid JSON (${e.message})`); userMsg = `${user}\n\nYour previous reply was not valid JSON. Reply with ONLY the JSON object.`; continue; }
    const errors = validate(schema, data);
    if (realInput && tpl.requires_real_input) for (const [k, v] of Object.entries(realInput)) if (k in data && String(data[k]) !== String(v)) errors.push(`$.${k}: must be exactly ${JSON.stringify(v)} (real fact)`);
    if (!errors.length) return { data, provider };
    log(`  attempt ${attempt}: ${errors.length} schema error(s): ${errors.slice(0, 5).join('; ')}`);
    userMsg = `${user}\n\nYour previous JSON had these problems — fix ALL of them and return the full corrected JSON:\n- ${errors.join('\n- ')}\n\nPrevious JSON:\n${JSON.stringify(data)}`;
  }
  throw new Error(`could not get valid JSON after ${opts.retries} attempts`);
}

function captionText(data, tpl) {
  const m = data.meta || {};
  return `${m.caption || ''}\n\n${(m.hashtags || []).join(' ')}\n\n---\nTemplate: ${tpl.id} (${tpl.format})\nAudio mood: ${m.audio_mood || '-'}\n`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  let tplId = args.template, topic = args.topic;
  if (!tplId && args.day) {
    const entry = CALENDAR.days.find(d => d.day === args.day);
    if (!entry) throw new Error(`no calendar entry for day ${args.day}`);
    tplId = entry.template; topic = topic || entry.topic_hint;
    console.log(`Calendar day ${args.day}: ${tplId}${entry.topic_hint ? ` — hint: ${entry.topic_hint}` : ''}`);
  }
  if (!tplId) { console.log('usage: node generate.js --template <id> [--topic "..."] | --today | --day N   [--dry-run] [--no-render]'); process.exit(1); }
  const tpl = TEMPLATES.find(t => t.id === tplId);
  if (!tpl) throw new Error(`unknown template ${tplId}. Known: ${TEMPLATES.map(t => t.id).join(', ')}`);

  const stamp = new Date().toISOString().slice(0, 10);
  const outDir = args.out || path.join(ROOT, 'out', `${stamp}_${tpl.id}`);
  fs.mkdirSync(outDir, { recursive: true });
  console.log(`▶ ${tpl.id} — ${tpl.title}`);
  const { data, provider } = await generateData(tpl, args, console.log);
  if (tpl.requires_real_input && provider === 'sample') console.log('  ⚠ This output uses FICTIONAL placeholder data. Do not publish it — re-run with --input real-student.json');
  fs.writeFileSync(path.join(outDir, 'data.json'), JSON.stringify(data, null, 2));
  fs.writeFileSync(path.join(outDir, 'caption.txt'), captionText(data, tpl));
  console.log(`  ✔ data.json + caption.txt → ${path.relative(ROOT, outDir)}  (${provider})`);

  if (args.render) {
    const { renderOne, withBrowser } = require('./render');
    await withBrowser((browser, port) => renderOne(browser, port, tpl.id, { data, outDir, preview: true, previewDir: outDir }));
    console.log(`\nDone. Upload the ${tpl.format === 'reel' ? 'reel.mp4' : 'PNG(s)'} from ${path.relative(ROOT, outDir)} and paste caption.txt.`);
  }
}

main().catch(e => { console.error('✖', e.message); process.exit(1); });
