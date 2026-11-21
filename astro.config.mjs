// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // ডিপ্লয়ের ডোমেইন — canonical ও og:url-এর জন্য দরকার
  site: 'https://ভূমিসেবা.বাংলা',

  vite: {
    plugins: [tailwindcss()],
  },
});