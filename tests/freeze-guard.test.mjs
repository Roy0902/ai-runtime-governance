import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const guard = fileURLToPath(new URL('../scripts/ai/freeze-guard.mjs', import.meta.url));
const feature = 'cart';
const scenario = 'SCN-cart-001';
const planPath = 'specs/cart.md';
const manifestPath = 'specs/cart.freeze.json';
const uiPath = 'tests/specs/cart.spec.ts';
const apiPath = 'tests/api/cart.spec.ts';
const baselinePath = 'tests/testdata/api/cart/items.baseline.json';
const evidencePath = 'artifacts/cart/execution-evidence.md';
const supportingPath = 'tests/unit/cart.test.mjs';
const plan = `# Cart\n\n${scenario}: the cart feature is enabled.\n`;
const acceptance = `// [${scenario}]\n`;

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'spec-to-test-guard-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));

  function write(relativePath, text) {
    const path = join(root, relativePath);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, text);
  }

  function read(relativePath) {
    return readFileSync(join(root, relativePath), 'utf8');
  }

  function run(command, expectedStatus = 0, target = feature) {
    const args = [guard, command, ...(target ? [target] : []), '--root', root];
    const result = spawnSync(process.execPath, args, { encoding: 'utf8' });
    assert.ifError(result.error);
    assert.equal(result.status, expectedStatus, result.stdout + result.stderr);
    return result;
  }

  write(planPath, plan);
  write(uiPath, acceptance);
  return { root, write, read, run };
}

function lock(f) {
  f.run('freeze');
  f.run('lock-tests');
}

test('freezes, locks, and verifies a feature and all frozen features', (t) => {
  const f = fixture(t);
  f.write(apiPath, acceptance);
  f.write(baselinePath, '{"items":[]}\n');
  lock(f);
  assert.match(f.run('verify').stdout, /cart: OK/);
  assert.match(f.run('verify', 0, null).stdout, /cart: OK/);
  const manifest = JSON.parse(f.read(manifestPath));
  assert.deepEqual(Object.keys(manifest.tests).sort(), [apiPath, uiPath, baselinePath].sort());
});

for (const [name, content, message] of [
  ['unspecified scenario', `${plan}\n@unspecified\n`, /contains @unspecified/],
  ['blocking ambiguity', `${plan}\n| AMB-cart-001 | Missing rule | Yes | Pending |\n`, /blocking open ambiguity/],
  ['missing scenario', '# Empty plan\n', /no SCN-\* scenarios/],
]) {
  test(`refuses freeze with ${name}`, (t) => {
    const f = fixture(t);
    f.write(planPath, content);
    assert.match(f.run('freeze', 1).stderr, message);
  });
}

test('freeze and test locking are one-way and do not rewrite manifests', (t) => {
  const f = fixture(t);
  f.run('freeze');
  const frozen = f.read(manifestPath);
  assert.match(f.run('freeze', 1).stderr, /already frozen/);
  assert.equal(f.read(manifestPath), frozen);
  f.run('lock-tests');
  const locked = f.read(manifestPath);
  assert.match(f.run('lock-tests', 1).stderr, /already locked/);
  assert.equal(f.read(manifestPath), locked);
});

test('detects an edited frozen plan', (t) => {
  const f = fixture(t);
  lock(f);
  f.write(planPath, `${plan}\nChanged expectation\n`);
  assert.match(f.run('verify', 1).stderr, /frozen plan changed/);
});

for (const path of [uiPath, apiPath, baselinePath]) {
  for (const action of ['edit', 'remove']) {
    test(`detects ${action} of protected ${path}`, (t) => {
      const f = fixture(t);
      f.write(apiPath, acceptance);
      f.write(baselinePath, '{"items":[]}\n');
      lock(f);
      if (action === 'edit') f.write(path, `${f.read(path)}\nchanged\n`);
      else rmSync(join(f.root, path));
      const result = f.run('verify', 1);
      assert.match(result.stderr, action === 'edit' ? /locked test file changed/ : /locked test file missing/);
      assert.ok(result.stderr.includes(path), result.stderr);
    });
  }
}

for (const path of [apiPath, baselinePath]) {
  test(`detects newly selected protected file ${path} after lock`, (t) => {
    const f = fixture(t);
    lock(f);
    f.write(path, path === apiPath ? acceptance : '{"items":[]}\n');
    assert.match(f.run('verify', 1).stderr, /test file added after lock/);
  });
}

test('detects newly added UI acceptance file when only API acceptance was locked', (t) => {
  const f = fixture(t);
  rmSync(join(f.root, uiPath));
  f.write(apiPath, acceptance);
  lock(f);
  f.write(uiPath, acceptance);
  assert.match(f.run('verify', 1).stderr, /test file added after lock/);
});

test('refuses locking when a scenario has no designated acceptance coverage', (t) => {
  const f = fixture(t);
  f.write(uiPath, '// No acceptance tags\n');
  f.run('freeze');
  assert.match(f.run('lock-tests', 1).stderr, /scenario SCN-cart-001 has no tagged test/);
});

test('refuses unknown acceptance scenario tags', (t) => {
  const f = fixture(t);
  f.write(uiPath, `${acceptance}// [SCN-cart-999]\n`);
  f.run('freeze');
  assert.match(f.run('lock-tests', 1).stderr, /SCN-cart-999 is not in the frozen plan/);
});

test('supporting tests can be added and revised without changing acceptance protection', (t) => {
  const f = fixture(t);
  lock(f);
  const manifest = f.read(manifestPath);
  f.write(supportingPath, '// Supporting tests, version 1\n');
  f.run('verify');
  f.write(supportingPath, '// Supporting tests, version 2\n');
  f.run('verify');
  assert.equal(f.read(manifestPath), manifest);
  f.write(uiPath, `${acceptance}// Locked setup changed\n`);
  assert.match(f.run('verify', 1).stderr, /locked test file changed/);
});

test('supporting-test tags cannot supply missing acceptance coverage', (t) => {
  const f = fixture(t);
  f.write(uiPath, '// No acceptance tags\n');
  f.write(supportingPath, acceptance);
  f.run('freeze');
  assert.match(f.run('lock-tests', 1).stderr, /scenario SCN-cart-001 has no tagged test/);
});

test('synthetic red-to-green execution uses external evidence and an unchanged oracle', (t) => {
  const f = fixture(t);
  f.write(planPath, `${plan}\nExecution evidence: ${evidencePath}\n`);
  f.write(uiPath, [
    `// [${scenario}]`,
    "const assert = require('node:assert/strict');",
    "const fs = require('node:fs');",
    "assert.equal(fs.readFileSync('src/feature.txt', 'utf8'), 'enabled');",
    '',
  ].join('\n'));
  f.run('freeze');
  const frozenPlan = f.read(planPath);
  const frozenAcceptance = f.read(uiPath);
  const runAcceptance = () => {
    const result = spawnSync(process.execPath, ['--input-type=commonjs'], {
      cwd: f.root,
      input: f.read(uiPath),
      encoding: 'utf8',
    });
    assert.ifError(result.error);
    return result;
  };
  const red = runAcceptance();
  assert.equal(red.status, 1, red.stdout + red.stderr);
  assert.match(red.stderr, /ENOENT/);
  const identity = createHash('sha256').update(frozenAcceptance).digest('hex');
  const redEvidence = [
    '# Synthetic execution evidence',
    `Plan: ${planPath}; acceptance: ${uiPath}; SHA-256: ${identity}`,
    `SCN: ${scenario}; command: node --input-type=commonjs (acceptance source on stdin)`,
    `Working directory: ${f.root}; run: ${new Date().toISOString()}`,
    'RED: ENOENT, feature data is missing before implementation.',
    '',
  ].join('\n');
  f.write(evidencePath, redEvidence);
  f.run('lock-tests');
  const lockedManifest = f.read(manifestPath);
  f.write('src/feature.txt', 'enabled');
  f.write(supportingPath, '// Supporting coverage added during implementation\n');
  const green = runAcceptance();
  assert.equal(green.status, 0, green.stdout + green.stderr);
  f.write(evidencePath, `${redEvidence}\nGREEN: unchanged acceptance probe passes after implementation.\n`);
  f.run('verify');
  assert.equal(f.read(planPath), frozenPlan);
  assert.equal(f.read(uiPath), frozenAcceptance);
  assert.equal(f.read(manifestPath), lockedManifest);
  assert.ok(f.read(evidencePath).includes(redEvidence));
});

test('verifies an existing-format manifest without migration', (t) => {
  const f = fixture(t);
  const digest = (text) => createHash('sha256').update(text.replace(/\r\n/g, '\n')).digest('hex');
  const legacy = {
    feature,
    planSha256: digest(plan),
    frozenAt: '2025-01-01T00:00:00.000Z',
    tests: { [uiPath]: digest(acceptance) },
    testsLockedAt: '2025-01-01T01:00:00.000Z',
  };
  const original = JSON.stringify(legacy, null, 2) + '\n';
  f.write(manifestPath, original);
  f.run('verify');
  f.write(evidencePath, '# Subsequent evidence references preserved legacy history\n');
  f.run('verify');
  assert.equal(f.read(manifestPath), original);
});

test('normalizes CRLF for frozen plan, acceptance files, and baselines', (t) => {
  const f = fixture(t);
  f.write(baselinePath, '{\n  "items": []\n}\n');
  lock(f);
  for (const path of [planPath, uiPath, baselinePath]) {
    f.write(path, f.read(path).replace(/\n/g, '\r\n'));
  }
  f.run('verify');
});
