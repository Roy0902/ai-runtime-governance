#!/usr/bin/env node
// Freeze guard for the spec-to-test pipeline. No dependencies.
//
//   node scripts/ai/freeze-guard.mjs freeze <feature>      Phase 7: freeze the plan (one-way)
//   node scripts/ai/freeze-guard.mjs lock-tests <feature>  Phase 8: lock the red tests
//   node scripts/ai/freeze-guard.mjs verify [feature]      Pre-commit / CI: check everything
//
// Option: --root <dir> to run against another folder (default: current directory).

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

const argv = process.argv.slice(2);
const rootFlag = argv.indexOf('--root');
const root = resolve(rootFlag >= 0 ? argv[rootFlag + 1] : '.');
const args = rootFlag >= 0 ? argv.filter((_, i) => i !== rootFlag && i !== rootFlag + 1) : argv;
const [command, feature] = args;

const problems = [];
const notes = [];

const SCN = /SCN-[A-Za-z0-9-]+?-\d{3}/g;
const TAG = /\[(SCN-[A-Za-z0-9-]+?-\d{3})\]/g;

const abs = (rel) => join(root, ...rel.split('/'));
const posix = (p) => relative(root, p).split(sep).join('/');
const hash = (file) =>
  createHash('sha256').update(readFileSync(file, 'utf8').replace(/\r\n/g, '\n')).digest('hex');
const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
const planPath = (f) => join(root, 'specs', `${f}.md`);
const manifestPath = (f) => join(root, 'specs', `${f}.freeze.json`);

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function protectedTests(f) {
  const files = [
    join(root, 'tests', 'specs', `${f}.spec.ts`),
    join(root, 'tests', 'api', `${f}.spec.ts`),
    ...walk(join(root, 'tests', 'testdata', 'api', f)),
  ];
  return files.filter(existsSync).map(posix).sort();
}

function traceability(planText, testFiles) {
  const planIds = new Set(planText.match(SCN) ?? []);
  const tagIds = new Set();
  for (const rel of testFiles) {
    for (const m of readFileSync(abs(rel), 'utf8').matchAll(TAG)) tagIds.add(m[1]);
  }
  return {
    missing: [...planIds].filter((id) => !tagIds.has(id)),
    unknown: [...tagIds].filter((id) => !planIds.has(id)),
  };
}

function planChecks(text) {
  if (!(text.match(SCN) ?? []).length) problems.push('plan has no SCN-* scenarios');
  if (/@unspecified/.test(text)) problems.push('plan contains @unspecified; resolve it before freezing');
  text
    .split('\n')
    .filter((line) => /AMB-/.test(line) && /\|\s*Yes\s*\|/.test(line) && /Pending/i.test(line))
    .forEach((line) => problems.push(`blocking open ambiguity: ${line.trim().slice(0, 120)}`));
}

function freeze(f) {
  const plan = planPath(f);
  if (!existsSync(plan)) return problems.push(`${f}: missing ${posix(plan)}`);
  if (existsSync(manifestPath(f))) return problems.push(`${f}: already frozen; the freeze is one-way`);
  const text = readFileSync(plan, 'utf8');
  planChecks(text);
  if (problems.length) return;
  const manifest = {
    feature: f,
    planSha256: hash(plan),
    frozenAt: new Date().toISOString(),
    tests: null,
  };
  writeFileSync(manifestPath(f), JSON.stringify(manifest, null, 2) + '\n');
  notes.push(`${f}: frozen (${posix(plan)})`);
}

function lockTests(f) {
  if (!existsSync(manifestPath(f))) return problems.push(`${f}: not frozen; run freeze first`);
  const manifest = readJson(manifestPath(f));
  if (manifest.tests) return problems.push(`${f}: tests are already locked`);
  const files = protectedTests(f);
  if (!files.length) return problems.push(`${f}: no test files found`);
  const { missing, unknown } = traceability(readFileSync(planPath(f), 'utf8'), files);
  missing.forEach((id) => problems.push(`${f}: scenario ${id} has no tagged test`));
  unknown.forEach((id) => problems.push(`${f}: test tag ${id} is not in the frozen plan`));
  if (problems.length) return;
  manifest.tests = Object.fromEntries(files.map((rel) => [rel, hash(abs(rel))]));
  manifest.testsLockedAt = new Date().toISOString();
  writeFileSync(manifestPath(f), JSON.stringify(manifest, null, 2) + '\n');
  notes.push(`${f}: locked ${files.length} test file(s)`);
}

function verify(f) {
  if (!existsSync(manifestPath(f))) return problems.push(`${f}: no freeze manifest`);
  const manifest = readJson(manifestPath(f));
  const plan = planPath(f);
  if (!existsSync(plan)) return problems.push(`${f}: frozen plan is missing`);
  if (hash(plan) !== manifest.planSha256) problems.push(`${f}: frozen plan changed after freeze`);

  const current = protectedTests(f);
  if (manifest.tests) {
    for (const [rel, expected] of Object.entries(manifest.tests)) {
      if (!existsSync(abs(rel))) problems.push(`${f}: locked test file missing: ${rel}`);
      else if (hash(abs(rel)) !== expected) problems.push(`${f}: locked test file changed: ${rel}`);
    }
    current
      .filter((rel) => !(rel in manifest.tests))
      .forEach((rel) => problems.push(`${f}: test file added after lock: ${rel}`));
  }

  const { missing, unknown } = traceability(readFileSync(plan, 'utf8'), current);
  unknown.forEach((id) => problems.push(`${f}: test tag ${id} is not in the frozen plan`));
  if (manifest.tests) {
    missing.forEach((id) => problems.push(`${f}: scenario ${id} has no tagged test`));
  } else if (missing.length) {
    notes.push(`${f}: tests not locked yet; ${missing.length} scenario(s) without tests`);
  }
  if (!problems.some((p) => p.startsWith(`${f}:`))) notes.push(`${f}: OK`);
}

function frozenFeatures() {
  const specs = join(root, 'specs');
  if (!existsSync(specs)) return [];
  return readdirSync(specs)
    .filter((name) => name.endsWith('.freeze.json'))
    .map((name) => name.slice(0, -'.freeze.json'.length));
}

function usage() {
  console.error('usage: freeze-guard.mjs <freeze|lock-tests> <feature> | verify [feature]');
  process.exitCode = 2;
}

switch (command) {
  case 'freeze':
    if (!feature) usage();
    else freeze(feature);
    break;
  case 'lock-tests':
    if (!feature) usage();
    else lockTests(feature);
    break;
  case 'verify': {
    const targets = feature ? [feature] : frozenFeatures();
    if (!targets.length) notes.push('no frozen features');
    targets.forEach(verify);
    break;
  }
  default:
    usage();
}

notes.forEach((n) => console.log(n));
problems.forEach((p) => console.error(`FAIL ${p}`));
if (problems.length) process.exitCode = 1;
