import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  test: {
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/e2e/**']
  },
  build: {
    outDir: 'dist/site',
    target: 'es2022',
    assetsInlineLimit: 2048,
    sourcemap: true,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/app-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => assetInfo.name?.endsWith('.css') ? 'assets/app-[hash].css' : 'assets/[name]-[hash][extname]'
      }
    }
  }
});
