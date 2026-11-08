import { defineConfig } from 'vitest/config'

// Default 'node' (schnell); DOM-Tests per Datei-Pragma /* @vitest-environment jsdom */.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
