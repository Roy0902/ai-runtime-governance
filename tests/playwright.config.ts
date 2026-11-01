import { defineConfig, devices } from '@playwright/test';

process.env.TEST_CONTROL_URL ??= 'http://127.0.0.1:8080/__test';
process.env.TEST_CLOCK_URL ??= 'http://127.0.0.1:8080/__test';
process.env.TEST_CLOCK_TOKEN ??= 'test-token';
process.env.MAILPIT_URL ??= 'http://127.0.0.1:8025';

const java = '..\\.local-tools\\jdk-25.0.5+8\\bin\\java.exe';
const jar = 'target\\ai-runtime-governance-backend-0.1.0-SNAPSHOT.jar';

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
    ['./support/reset-reporter.ts'],
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
        baseURL: 'http://127.0.0.1:5173',
      },
    },
    {
      name: 'api',
      testMatch: /api[\\/].*\.spec\.ts/,
      use: {
        baseURL: 'http://127.0.0.1:8080',
        extraHTTPHeaders: { 'Content-Type': 'application/json' },
      },
    },
  ],
  webServer: [
    {
      command: `"${java}" -jar "${jar}"`,
      cwd: '../backend',
      url: 'http://127.0.0.1:8080/actuator/health',
      reuseExistingServer: true,
      timeout: 120_000,
      env: {
        GOVERNANCE_PORT: '8080',
        SPRING_PROFILES_ACTIVE: 'test',
        GOVERNANCE_DB_URL: 'jdbc:postgresql://127.0.0.1:55434/governance',
        GOVERNANCE_DB_USER: 'postgres',
        GOVERNANCE_DB_PASSWORD: '',
        GOVERNANCE_TEST_TOKEN: 'test-token',
        GOVERNANCE_TRUSTED_PROXIES: '127.0.0.1',
        GOVERNANCE_SEED_KEY_DIRECTORY: '..\\.local-cache\\seed-keys',
        GOVERNANCE_SMTP_HOST: '127.0.0.1',
        GOVERNANCE_SMTP_PORT: '1025',
        GOVERNANCE_TEST_FAULTS_FILE: `${process.cwd()}\\.local-cache\\test-faults.properties`,
        GOVERNANCE_DISPATCH_FILE: `${process.cwd()}\\.local-cache\\dispatch.properties`,
      },
    },
    {
      command: '"..\\.local-tools\\mailpit\\mailpit.exe" --listen 127.0.0.1:8025 --smtp 127.0.0.1:1025',
      cwd: '..',
      url: 'http://127.0.0.1:8025/api/v1/messages',
      reuseExistingServer: true,
      timeout: 60_000,
    },
    {
      command: 'npm run dev',
      cwd: '../frontend',
      url: 'http://127.0.0.1:5173',
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
});
