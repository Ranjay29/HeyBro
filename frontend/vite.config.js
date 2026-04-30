import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // Tells Vite to build into the 'dist' folder
    emptyOutDir: true, // Cleans the folder before each build
  },
  base: '/HeyBro/', 
})