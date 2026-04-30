import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'docs', // Tells Vite to build into the 'docs' folder
    emptyOutDir: true, // Cleans the folder before each build
  },
  // If your site is at username.github.io/HeyBro/, add this:
  base: '/HeyBro/', 
})