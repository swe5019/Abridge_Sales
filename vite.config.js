import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' keeps the static build portable — it works from any subpath
// (GitHub Pages, S3, internal nginx) with no server rewrite rules.
export default defineConfig({
  plugins: [react()],
  base: './',
})
