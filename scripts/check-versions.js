#!/usr/bin/env node
import { readFileSync, existsSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(readFileSync(join(root, '.version-bump.json'), 'utf8'));

const results = [];
for (const { path: filePath, field } of config.files) {
  const full = join(root, filePath);
  if (!existsSync(full)) {
    console.error(`  MISSING: ${filePath}`);
    process.exit(1);
  }
  let obj = JSON.parse(readFileSync(full, 'utf8'));
  for (const key of field.split('.')) {
    obj = /^\d+$/.test(key) ? obj[parseInt(key)] : obj[key];
  }
  results.push({ file: filePath, field, version: obj });
  console.log(`  ${filePath} (${field}): ${obj}`);
}

const versions = new Set(results.map(r => r.version));
if (versions.size > 1) {
  console.error('\nVersion drift detected!');
  process.exit(1);
}
console.log(`\nAll ${results.length} files in sync: ${results[0].version}`);
