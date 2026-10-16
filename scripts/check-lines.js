#!/usr/bin/env node
/* eslint-disable no-console */
/* Prints line counts for source files and fails if any exceed 200 (generated types exempt). */
const fs = require('fs');
const path = require('path');

const MAX = 200;
const ROOTS = ['src', 'app.config.js'];
const EXEMPT = new Set(['src/lib/api-types.gen.ts']);
const files = [];

function walk(p) {
  const stat = fs.statSync(p);
  if (stat.isDirectory()) fs.readdirSync(p).forEach((f) => walk(path.join(p, f)));
  else if (/\.(ts|tsx|js)$/.test(p)) files.push(p);
}
ROOTS.forEach(walk);

const rows = files
  .filter((f) => !EXEMPT.has(f))
  .map((f) => [f, fs.readFileSync(f, 'utf8').split('\n').length - 1])
  .sort((a, b) => b[1] - a[1]);
const over = rows.filter(([, n]) => n > MAX);

if (process.argv.includes('--table')) {
  rows.forEach(([f, n]) => console.log(`${String(n).padStart(4)}  ${f}`));
  console.log(`\n${rows.length} files, max ${rows[0]?.[1] ?? 0} lines`);
}
if (over.length) {
  console.error(`Files over ${MAX} lines:\n${over.map(([f, n]) => `  ${f} (${n})`).join('\n')}`);
  process.exit(1);
}
