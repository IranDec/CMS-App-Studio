
import type { Config } from "tailwindcss";

// Generate safe list for margins (mt-0 to mt-20, mb-0 to mb-20)
const marginSafeList = Array.from({ length: 21 }, (_, i) => [`mt-${i}`, `mb-${i}`]).flat();
// Generate safe list for heights (h-1 to h-40) used by Spacer
const heightSafeList = Array.from({ length: 40 }, (_, i) => `h-${i + 1}`);
// Generate safe list for grid columns (grid-cols-1 to grid-cols-4) used by Grid
const gridColsSafeList = ['grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4'];
// Generate safe list for gaps (gap-0 to gap-10) used by Grid
const gapSafeList = Array.from({ length: 11 }, (_, i) => `gap-${i}`);
// Generate safe list for text colors
const textColorSafeList = ['text-primary', 'text-secondary-foreground', 'text-accent', 'text-muted-foreground', 'text-foreground'];
// Generate safe list for aspect ratios
const aspectRatioSafeList = ['aspect-video', 'aspect-[4/3]', 'aspect-square', 'aspect-[9/16]', 'aspect-[21/9]', 'aspect-[3/4]'];


export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    safelist: [ // Add safe list here
        ...marginSafeList,
        ...heightSafeList,
        ...gridColsSafeList,
        ...gapSafeList,
        ...textColorSafeList,
        ...aspectRatioSafeList,
        // Safelist font sizes just in case
        'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl',
        // Safelist object fit
        'object-cover', 'object-contain',
    ],
    theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
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
} satisfies Config;
