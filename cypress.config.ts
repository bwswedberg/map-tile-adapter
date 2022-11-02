import { defineConfig } from 'cypress';
import { initPlugin as initVisualRegressionPlugin } from '@frsource/cypress-plugin-visual-regression-diff/dist/plugins';

export default defineConfig({
  viewportHeight: 512,
  viewportWidth: 512,
  video: false,
  e2e: {
    setupNodeEvents(on, config) {
      initVisualRegressionPlugin(on, config);
    },
    baseUrl: 'http://localhost:3000'
  },
  env: {
    // pluginVisualRegressionUpdateImages: true,
    pluginVisualRegressionDiffConfig: { threshold: 0 }
  }
});
