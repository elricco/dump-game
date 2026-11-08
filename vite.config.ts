import { defineConfig } from 'vite'

// Relativer base: dieselbe dist/ laeuft lokal und unter einem GitHub-Pages-Unterpfad.
export default defineConfig({
  base: './',
  // Drei Seiten: Overlay, Config-Seite und Demo (Vorschau der Config-Seite).
  build: {
    rollupOptions: {
      input: { main: 'index.html', config: 'config.html', demo: 'demo.html' },
    },
  },
})
