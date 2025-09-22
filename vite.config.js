import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue'
export default defineConfig({
  server: {
    hmr: {
      overlay: true, // Disables the HMR error overlay
    },
  },
  plugins: [vue({})],
  // Other Vite configurations...
});
