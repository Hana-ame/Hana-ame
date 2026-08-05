import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  server: {
    host: true,
    port: 5173,
    allowedHosts: ['wsl-5173.moonchan.xyz'],
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        test: fileURLToPath(new URL('./test/index.html', import.meta.url)),
        ahrs: fileURLToPath(new URL('./ahrs/index.html', import.meta.url)),
      },
      output: {
        manualChunks: {
          three: ['three'],
          physics: ['cannon-es'],
          net: ['peerjs', 'mqtt'],
        },
      },
    },
  },
});
