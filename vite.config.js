import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        controls: resolve(__dirname, 'controls.html')
      },
      output: {
        chunkFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'main')
            return 'assets/script.js';
        },
        assetFileNames: (assetInfo) => {
          const name = assetInfo.names?.[0] ?? '';

          if (name.includes('main.css')) {
            return 'assets/styles.css'
          }
          return 'assets/[name].[ext]'
        }
      }
    }
  }
})