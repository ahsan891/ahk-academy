#!/usr/bin/env node
// Validates every template's sample.json against its schema.json and checks the folder is complete.
const fs = require('fs'), path = require('path');
const { loadSchema, validate } = require('./lib/validate');
const tpls = JSON.parse(fs.readFileSync(path.join(__dirname, 'templates.json'), 'utf8'));
let bad = 0;
for (const t of tpls) {
  const dir = path.join(__dirname, 'templates', t.id);
  const missing = ['template.html', 'schema.json', 'sample.json', 'prompt.md'].filter(f => !fs.existsSync(path.join(dir, f)));
  if (missing.length) { console.log(`✖ ${t.id}: missing ${missing.join(', ')}`); bad++; continue; }
  const errors = validate(loadSchema(path.join(dir, 'schema.json')), JSON.parse(fs.readFileSync(path.join(dir, 'sample.json'), 'utf8')));
  if (errors.length) { console.log(`✖ ${t.id}:\n   ${errors.join('\n   ')}`); bad++; } else console.log(`✔ ${t.id}`);
}
console.log(bad ? `\n${bad} template(s) with problems` : `\nAll ${tpls.length} templates OK`);
process.exit(bad ? 1 : 0);
