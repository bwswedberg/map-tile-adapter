import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  use: {
    baseURL: 'http://localhost:3000',
    viewport: { width: 512, height: 512 },
    screenshot: 'only-on-failure'
  },
  testMatch: [
    'src/**/*.e2e.ts'
  ]
};

export default config;