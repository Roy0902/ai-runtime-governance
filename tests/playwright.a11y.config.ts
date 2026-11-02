import { devices } from '@playwright/test';
import base from './playwright.config';

const frontendPort = Number(process.env.FRONTEND_PORT ?? 5173);
const frontendOrigin = `http://127.0.0.1:${frontendPort}`;

export default {
  ...base,
  testDir: '.',
  reporter: [
    ['list'],
    ['json', { outputFile: '../.local-cache/a11y-report.json' }],
  ],
  projects: [
    {
      name: 'a11y',
      testMatch: /supporting[\\/]accessibility\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: frontendOrigin,
      },
    },
  ],
};
