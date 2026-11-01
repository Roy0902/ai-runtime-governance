import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '..', '..');
const contract = join(repo, 'contracts', 'native-auth.openapi.json');
const generatedDir = join(repo, '.local-cache', 'generated');
const generated = join(generatedDir, 'native-auth.d.ts');

if (!existsSync(contract)) {
  console.error(`missing contract: ${contract}`);
  process.exit(2);
}
mkdirSync(generatedDir, { recursive: true });

const run = (label, args) => {
  const result = spawnSync(process.execPath, args, { encoding: 'utf8' });
  const out = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim();
  if (out) console.log(out);
  if (result.status !== 0) {
    console.error(`FAIL ${label} (exit ${result.status})`);
    process.exit(result.status ?? 1);
  }
  console.log(`OK ${label}`);
};

run('redocly lint', [join(here, 'node_modules', '@redocly', 'cli', 'bin', 'cli.js'), 'lint', contract]);
run('openapi-typescript', [join(here, 'node_modules', 'openapi-typescript', 'bin', 'cli.js'), contract, '-o', generated]);
console.log(`generated ${statSync(generated).size} bytes -> ${generated}`);
