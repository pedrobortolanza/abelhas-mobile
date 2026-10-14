import { defineConfig } from 'vite';

// base relativa: o mesmo build serve o site na Vercel e o app do Capacitor (arquivos locais)
export default defineConfig({
  base: './',
  build: { outDir: 'dist', assetsInlineLimit: 0 },
});
