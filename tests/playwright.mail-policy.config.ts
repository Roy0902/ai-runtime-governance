import base from './playwright.config';

const backendPort = Number(process.env.GOVERNANCE_PORT ?? 8080);
const backendOrigin = `http://127.0.0.1:${backendPort}`;

const rawServers = Array.isArray(base.webServer)
  ? base.webServer
  : base.webServer
    ? [base.webServer]
    : [];

let testBackendFound = false;

const servers = rawServers.map((server) => {
  if (server.env?.SPRING_PROFILES_ACTIVE !== 'test') {
    return server;
  }
  testBackendFound = true;
  return {
    ...server,
    env: {
      ...server.env,
      GOVERNANCE_MAIL_IDENTITY_PER_MINUTE: '1',
      GOVERNANCE_MAIL_IDENTITY_PER_HOUR: '5',
    },
  };
});

if (!testBackendFound) {
  throw new Error('mail-policy config could not find the test-profile backend webServer');
}

export default {
  ...base,
  testDir: '.',
  reporter: [
    ['list'],
    ['json', { outputFile: '../.local-cache/mail-policy-report.json' }],
  ],
  projects: [
    {
      name: 'mail-policy',
      testMatch: /supporting[\\/]mail-policy\.spec\.ts/,
      use: {
        baseURL: backendOrigin,
        extraHTTPHeaders: { 'Content-Type': 'application/json' },
      },
    },
  ],
  webServer: servers,
};
