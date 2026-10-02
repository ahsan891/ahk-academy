// Minimal JSON Schema validator (draft 2020-12 subset) — no dependencies.
// Supports: type, properties, required, additionalProperties, items, minItems, maxItems,
// minLength, maxLength, pattern, enum, minimum, maximum, $ref to a relative file, description.
const fs = require('fs');
const path = require('path');

function loadSchema(file) {
  const schema = JSON.parse(fs.readFileSync(file, 'utf8'));
  return inlineRefs(schema, path.dirname(file));
}

// Replace {"$ref": "relative/file.json"} with the file's content (so prompts can show one full schema)
function inlineRefs(node, baseDir) {
  if (Array.isArray(node)) return node.map(n => inlineRefs(n, baseDir));
  if (node && typeof node === 'object') {
    if (typeof node.$ref === 'string' && !node.$ref.startsWith('#')) {
      const file = path.resolve(baseDir, node.$ref);
      const sub = JSON.parse(fs.readFileSync(file, 'utf8'));
      delete sub.$schema;
      return inlineRefs(sub, path.dirname(file));
    }
    const out = {};
    for (const [k, v] of Object.entries(node)) out[k] = inlineRefs(v, baseDir);
    return out;
  }
  return node;
}

function typeOf(v) {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  if (typeof v === 'number') return Number.isInteger(v) ? 'integer' : 'number';
  return typeof v;
}

function validate(schema, value, pathStr = '$', errors = []) {
  const t = typeOf(value);
  if (schema.type) {
    const ok = schema.type === t || (schema.type === 'number' && t === 'integer');
    if (!ok) { errors.push(`${pathStr}: expected ${schema.type}, got ${t}`); return errors; }
  }
  if (schema.enum && !schema.enum.includes(value)) errors.push(`${pathStr}: must be one of ${schema.enum.join(' | ')}`);
  if (t === 'string') {
    const len = [...value].length;
    if (schema.minLength != null && len < schema.minLength) errors.push(`${pathStr}: too short (${len} < ${schema.minLength})`);
    if (schema.maxLength != null && len > schema.maxLength) errors.push(`${pathStr}: too long (${len} > ${schema.maxLength} characters) — shorten it`);
    if (schema.pattern && !new RegExp(schema.pattern, 'u').test(value)) errors.push(`${pathStr}: must match pattern ${schema.pattern}`);
  }
  if (t === 'integer' || t === 'number') {
    if (schema.minimum != null && value < schema.minimum) errors.push(`${pathStr}: must be >= ${schema.minimum}`);
    if (schema.maximum != null && value > schema.maximum) errors.push(`${pathStr}: must be <= ${schema.maximum}`);
  }
  if (t === 'array') {
    if (schema.minItems != null && value.length < schema.minItems) errors.push(`${pathStr}: needs at least ${schema.minItems} items`);
    if (schema.maxItems != null && value.length > schema.maxItems) errors.push(`${pathStr}: at most ${schema.maxItems} items`);
    if (schema.items) value.forEach((v, i) => validate(schema.items, v, `${pathStr}[${i}]`, errors));
  }
  if (t === 'object') {
    for (const k of schema.required || []) if (!(k in value)) errors.push(`${pathStr}.${k}: missing`);
    for (const [k, v] of Object.entries(value)) {
      if (schema.properties && schema.properties[k]) validate(schema.properties[k], v, `${pathStr}.${k}`, errors);
      else if (schema.additionalProperties === false) errors.push(`${pathStr}.${k}: unexpected property`);
    }
  }
  return errors;
}

module.exports = { loadSchema, validate, inlineRefs };
