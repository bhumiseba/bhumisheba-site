// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import { fileURLToPath } from 'node:url';

/** @param {string} rel */
const p = (rel) => fileURLToPath(new URL(rel, import.meta.url));

// https://astro.build/config
export default defineConfig({
  // ডিপ্লয়ের ডোমেইন — canonical ও og:url-এর জন্য দরকার
  site: 'https://ভূমিসেবা.বাংলা',

  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@calculation-core': p('./packages/calculation-core/src'),
        '@land-domain': p('./packages/land-domain/src'),
        '@shared': p('./packages/shared/src'),
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-dom/client', 'lucide-react'],
    },
  },
});