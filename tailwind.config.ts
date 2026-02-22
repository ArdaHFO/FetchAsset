import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ── FetchAsset Hand-Drawn Design System ────────────────────────────
      colors: {
        // Core palette
        paper:    '#fdfbf7',   // Warm Paper background
        ink:      '#2d2d2d',   // Soft Pencil Black (never pure black)
        muted:    '#e5e0d8',   // Old Paper / Erased Pencil
        accent:   '#ff4d4d',   // Red Correction Marker
        blue:     '#2d5da1',   // Blue Ballpoint Pen
        postit:   '#fff9c4',   // Post-it Yellow

        // Semantic aliases (used in CSS variables)
        background: 'var(--color-background)',
        foreground:  'var(--color-foreground)',
        border:      'var(--color-border)',
      },

      // ── Handwritten Fonts ────────────────────────────────────────────
      fontFamily: {
        // Uses CSS variables injected by next/font/google in layout.tsx
        heading: ['var(--font-kalam)', 'cursive'],
        body:    ['var(--font-patrick-hand)', 'cursive'],
        sans:    ['var(--font-patrick-hand)', 'cursive'], // Override default sans
      },

      // ── Hand-Drawn Border Radii ──────────────────────────────────────
      // Use these custom border-radius presets in inline styles or component
      // utilities. Values produce irregular, wobbly elliptical corners.
      borderRadius: {
        none:      '0',
        sm:        '4px',
        DEFAULT:   '6px',
        md:        '8px',
        lg:        '12px',
        xl:        '16px',
        '2xl':     '24px',
        full:      '9999px',
        // ↓ Wobbly hand-drawn radii - use via CSS vars / inline styles
        wobbly:   'var(--radius-wobbly)',
        wobblyMd: 'var(--radius-wobbly-md)',
        wobblyLg: 'var(--radius-wobbly-lg)',
        wobblyBtn:'var(--radius-wobbly-btn)',
      },

      // ── Hard-Offset Box Shadows (no blur) ───────────────────────────
      boxShadow: {
        // Standard hard offset - main cards and buttons
        hard:    '4px 4px 0px 0px #2d2d2d',
        hardSm:  '2px 2px 0px 0px #2d2d2d',
        hardLg:  '8px 8px 0px 0px #2d2d2d',
        hardXl:  '12px 12px 0px 0px #2d2d2d',

        // Accent (red) shadow
        hardRed: '4px 4px 0px 0px #ff4d4d',
        hardBlu: '4px 4px 0px 0px #2d5da1',

        // Slightly soft for depth (still very minimal blur)
        card:    '3px 3px 0px 0px rgba(45,45,45,0.15)',

        none:    'none',
      },

      // ── Spacing extras ───────────────────────────────────────────────
      spacing: {
        '18':  '4.5rem',
        '22':  '5.5rem',
        '30':  '7.5rem',
        '100': '25rem',
        '120': '30rem',
      },

      // ── Animation ────────────────────────────────────────────────────
      keyframes: {
        // Gentle bounce for decorative elements
        bounce: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-12px)' },
        },
        // Subtle jiggle for interactive elements
        jiggle: {
          '0%, 100%': { transform: 'rotate(-1deg)' },
          '50%':       { transform: 'rotate(1.5deg)' },
        },
        // Slow spin for decorative SVGs
        spinSlow: {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
        // Fade slide up for toasts / notifications
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '25%':       { transform: 'rotate(2deg)' },
          '75%':       { transform: 'rotate(-1deg)' },
        },
      },
      animation: {
        bounce:   'bounce 3s ease-in-out infinite',
        jiggle:   'jiggle 0.5s ease-in-out infinite',
        spinSlow: 'spinSlow 20s linear infinite',
        slideUp:  'slideUp 0.25s ease-out',
        wiggle:   'wiggle 4s ease-in-out infinite',
      },

      // ── Scale & Rotate helpers ───────────────────────────────────────
      rotate: {
        '0.5':  '0.5deg',
        '1':    '1deg',
        '1.5':  '1.5deg',
        '2':    '2deg',
        '-0.5': '-0.5deg',
        '-1':   '-1deg',
        '-1.5': '-1.5deg',
        '-2':   '-2deg',
      },

      // ── Max-widths ───────────────────────────────────────────────────
      maxWidth: {
        'sketchbook': '64rem', // ~1024px — the "sketchbook" width
      },

      // ── Z-Index ──────────────────────────────────────────────────────
      zIndex: {
        '-1': '-1',
        '1':  '1',
        '2':  '2',
        '60': '60',
        '70': '70',
        '80': '80',
      },
    },
  },
  plugins: [],
}

export default config
