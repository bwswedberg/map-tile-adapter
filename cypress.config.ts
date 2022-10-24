import { defineConfig } from "cypress";

export default defineConfig({
  viewportHeight: 512,
  viewportWidth: 512,

  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
