import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // ถ้าใช้ React

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'
  }
})
