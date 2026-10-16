import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/agora-agent-uikit/dist/**/*.{js,mjs}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        overlay: 'var(--overlay)',
        'destructive-surface': 'var(--destructive-surface)',
        // Keep agent-ui's complete color values and Tailwind 3 opacity modifiers.
        background: 'color-mix(in oklch, var(--background) calc(<alpha-value> * 100%), transparent)',
        foreground: 'color-mix(in oklch, var(--foreground) calc(<alpha-value> * 100%), transparent)',
        card: {
          DEFAULT: 'color-mix(in oklch, var(--card) calc(<alpha-value> * 100%), transparent)',
          foreground: 'color-mix(in oklch, var(--card-foreground) calc(<alpha-value> * 100%), transparent)'
        },
        popover: {
          DEFAULT: 'color-mix(in oklch, var(--popover) calc(<alpha-value> * 100%), transparent)',
          foreground: 'color-mix(in oklch, var(--popover-foreground) calc(<alpha-value> * 100%), transparent)'
        },
        primary: {
          DEFAULT: 'color-mix(in oklch, var(--primary) calc(<alpha-value> * 100%), transparent)',
          foreground: 'color-mix(in oklch, var(--primary-foreground) calc(<alpha-value> * 100%), transparent)'
        },
        secondary: {
          DEFAULT: 'color-mix(in oklch, var(--secondary) calc(<alpha-value> * 100%), transparent)',
          foreground: 'color-mix(in oklch, var(--secondary-foreground) calc(<alpha-value> * 100%), transparent)'
        },
        muted: {
          DEFAULT: 'color-mix(in oklch, var(--muted) calc(<alpha-value> * 100%), transparent)',
          foreground: 'color-mix(in oklch, var(--muted-foreground) calc(<alpha-value> * 100%), transparent)'
        },
        accent: {
          DEFAULT: 'color-mix(in oklch, var(--accent) calc(<alpha-value> * 100%), transparent)',
          foreground: 'color-mix(in oklch, var(--accent-foreground) calc(<alpha-value> * 100%), transparent)'
        },
        destructive: {
          DEFAULT: 'color-mix(in oklch, var(--destructive) calc(<alpha-value> * 100%), transparent)',
          foreground: 'color-mix(in oklch, var(--destructive-foreground) calc(<alpha-value> * 100%), transparent)'
        },
        border: 'color-mix(in oklch, var(--border) calc(<alpha-value> * 100%), transparent)',
        input: 'color-mix(in oklch, var(--input) calc(<alpha-value> * 100%), transparent)',
        ring: 'color-mix(in oklch, var(--ring) calc(<alpha-value> * 100%), transparent)',
        chart: {
          '1': 'color-mix(in oklch, var(--chart-1) calc(<alpha-value> * 100%), transparent)',
          '2': 'color-mix(in oklch, var(--chart-2) calc(<alpha-value> * 100%), transparent)',
          '3': 'color-mix(in oklch, var(--chart-3) calc(<alpha-value> * 100%), transparent)',
          '4': 'color-mix(in oklch, var(--chart-4) calc(<alpha-value> * 100%), transparent)',
          '5': 'color-mix(in oklch, var(--chart-5) calc(<alpha-value> * 100%), transparent)'
        },
        sidebar: {
          DEFAULT: 'color-mix(in oklch, var(--sidebar-background) calc(<alpha-value> * 100%), transparent)',
          foreground: 'color-mix(in oklch, var(--sidebar-foreground) calc(<alpha-value> * 100%), transparent)',
          primary: 'color-mix(in oklch, var(--sidebar-primary) calc(<alpha-value> * 100%), transparent)',
          'primary-foreground': 'color-mix(in oklch, var(--sidebar-primary-foreground) calc(<alpha-value> * 100%), transparent)',
          accent: 'color-mix(in oklch, var(--sidebar-accent) calc(<alpha-value> * 100%), transparent)',
          'accent-foreground': 'color-mix(in oklch, var(--sidebar-accent-foreground) calc(<alpha-value> * 100%), transparent)',
          border: 'color-mix(in oklch, var(--sidebar-border) calc(<alpha-value> * 100%), transparent)',
          ring: 'color-mix(in oklch, var(--sidebar-ring) calc(<alpha-value> * 100%), transparent)'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0'
          },
          to: {
            height: 'var(--radix-accordion-content-height)'
          }
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)'
          },
          to: {
            height: '0'
          }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
