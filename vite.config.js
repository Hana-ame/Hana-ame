import { defineConfig } from 'vite';

export default defineConfig({
  base: '/webrtc/',
  server: {
    host: true,
    port: 5173,
    allowedHosts: ['wsl-5173.moonchan.xyz'],
  },
  build: {
    target: 'es2020',
    rollupOptions: {
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
