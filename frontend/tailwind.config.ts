import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        wk: {
          bg: '#080810',
          card: '#12121e',
          border: '#1e1e30',
          accent: '#6b21a8',
          blue: '#3b82f6',
          green: '#22c55e',
          text: '#ffffff',
          muted: '#9ca3af',
        },
      },
    },
  },
  plugins: [],
};

export default config;
