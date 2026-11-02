import { defineConfig, devices } from '@playwright/test';
import { randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(__dirname, '..');
const frontendDir = process.env.GOVERNANCE_FRONTEND_DIR
  ?? resolve(root, '..', 'ai-runtime-governance-frontend');
const backendDir = process.env.GOVERNANCE_BACKEND_DIR
  ?? resolve(root, '..', 'ai-runtime-governance-backend');
const backendPort = Number(process.env.GOVERNANCE_PORT ?? 8080);
const frontendPort = Number(process.env.FRONTEND_PORT ?? 5173);
const mailHttpPort = Number(process.env.MAILPIT_HTTP_PORT ?? 8025);
const mailSmtpPort = Number(process.env.MAILPIT_SMTP_PORT ?? 1025);
const testClockFile = process.env.TEST_CLOCK_FILE
  ?? join(root, 'local-env', 'runtime', 'acceptance', 'clock-now.txt');
const testFaultsFile = process.env.GOVERNANCE_TEST_FAULTS_FILE
  ?? join(root, 'local-env', 'runtime', 'acceptance', 'test-faults.properties');
const dispatchFile = process.env.GOVERNANCE_DISPATCH_FILE
  ?? join(root, 'local-env', 'runtime', 'acceptance', 'dispatch.properties');
const backendOrigin = `http://127.0.0.1:${backendPort}`;
const frontendOrigin = `http://127.0.0.1:${frontendPort}`;
const mailOrigin = `http://127.0.0.1:${mailHttpPort}`;

process.env.TEST_CONTROL_URL ??= `${backendOrigin}/__test`;
process.env.TEST_CLOCK_URL ??= `${backendOrigin}/__test`;
process.env.TEST_CLOCK_TOKEN ??= randomBytes(32).toString('base64url');
process.env.MAILPIT_URL ??= mailOrigin;
process.env.API_BASE_URL ??= backendOrigin;
process.env.GOVERNANCE_BACKEND_URL ??= backendOrigin;
process.env.TEST_CLOCK_FILE ??= testClockFile;
process.env.GOVERNANCE_TEST_FAULTS_FILE ??= testFaultsFile;
process.env.GOVERNANCE_DISPATCH_FILE ??= dispatchFile;

const java = process.env.JAVA_HOME
  ? join(process.env.JAVA_HOME, 'bin', 'java.exe')
  : join(root, '.local-tools', 'jdk-25.0.5+8', 'bin', 'java.exe');
const localNode = join(root, '.local-tools', 'node-v24.22.0-win-x64', 'node.exe');
const node = process.env.NODE_EXE
  ?? (existsSync(localNode) ? localNode : process.execPath);
const jar = join(backendDir, 'target', 'ai-runtime-governance-backend-0.1.0-SNAPSHOT.jar');

export default defineConfig({
  testDir: '.',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [
    ['list'],
    ['json', { outputFile: '../.local-cache/playwright-report.json' }],
  ],
  use: {
    trace: 'off',
    video: 'off',
    screenshot: 'off',
  },
  projects: [
    {
      name: 'browser',
      testMatch: /specs[\\/].*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: frontendOrigin,
      },
    },
    {
      name: 'api',
      testMatch: /api[\\/].*\.spec\.ts/,
      use: {
        baseURL: backendOrigin,
        extraHTTPHeaders: { 'Content-Type': 'application/json' },
      },
    },
    {
      name: 'supporting-api',
      testMatch: /supporting[\\/].*\.spec\.ts/,
      use: {
        baseURL: backendOrigin,
        extraHTTPHeaders: { 'Content-Type': 'application/json' },
      },
    },
  ],
  webServer: [
    {
      command: `"${join(root, '.local-tools', 'mailpit', 'mailpit.exe')}" --listen 127.0.0.1:${mailHttpPort} --smtp 127.0.0.1:${mailSmtpPort} --disable-version-check`,
      cwd: root,
      url: `${mailOrigin}/readyz`,
      reuseExistingServer: false,
      timeout: 60_000,
    },
    {
      command: `"${java}" -jar "${jar}"`,
      cwd: backendDir,
      url: `${backendOrigin}/actuator/health`,
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        GOVERNANCE_PORT: String(backendPort),
        SPRING_PROFILES_ACTIVE: 'test',
        GOVERNANCE_BASE_URL: frontendOrigin,
        GOVERNANCE_DB_URL: process.env.GOVERNANCE_DB_URL
          ?? 'jdbc:postgresql://127.0.0.1:55434/governance',
        GOVERNANCE_DB_USER: process.env.GOVERNANCE_DB_USER ?? 'postgres',
        GOVERNANCE_DB_PASSWORD: process.env.GOVERNANCE_DB_PASSWORD ?? '',
        GOVERNANCE_TEST_TOKEN: process.env.TEST_CLOCK_TOKEN,
        GOVERNANCE_TEST_CLOCK_FILE: testClockFile,
        GOVERNANCE_TRUSTED_PROXIES: '127.0.0.1',
        GOVERNANCE_SEED_KEY_DIRECTORY: process.env.GOVERNANCE_SEED_KEY_DIRECTORY
          ?? join(root, 'local-env', 'runtime', 'acceptance', 'seed-keys'),
        GOVERNANCE_SMTP_HOST: '127.0.0.1',
        GOVERNANCE_SMTP_PORT: String(mailSmtpPort),
        GOVERNANCE_TEST_FAULTS_FILE: testFaultsFile,
        GOVERNANCE_DISPATCH_FILE: dispatchFile,
      },
    },
    {
      command: `"${node}" "${join(frontendDir, 'node_modules', 'vite', 'bin', 'vite.js')}" --host 127.0.0.1 --port ${frontendPort} --strictPort`,
      cwd: frontendDir,
      url: frontendOrigin,
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
});
