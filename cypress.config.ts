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
    pluginVisualRegressionForceDeviceScaleFactor: false,
    pluginVisualRegressionScreenshotConfig: {
      scale: false,
    },
    pluginVisualRegressionMaxDiffThreshold: 0.0,
    pluginVisualRegressionDiffConfig: { 
      threshold: 0.0,
    },
  }
});
