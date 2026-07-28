import type { Config } from 'tailwindcss';

/**
 * Tokens de design herdados do protótipo da Etapa 3 — conceito
 * "Despertar" (amanhecer/aurora). Ver docs/03-prototipo-telas.html
 * para a referência visual original.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'ink-night': '#1B2036',
        'ink-night-2': '#262C4A',
        'dawn-gold': '#E8A33D',
        ember: '#B8563C',
        paper: '#F6F4EE',
        'paper-2': '#ECE8DE',
        slate: '#2E3244',
        'slate-soft': '#6B6F82',
        sage: '#6B8F71',
        line: '#DDD8CB',
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'serif'],
        body: ['var(--font-work-sans)', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
