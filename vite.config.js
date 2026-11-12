import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' makes the build work on any static host (Vercel, Netlify, GitHub Pages subpath).
export default defineConfig({
  base: './',
  plugins: [react()],
});
