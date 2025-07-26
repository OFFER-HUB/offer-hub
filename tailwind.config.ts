import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        inputBackground: "#DEEFE7",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        "light-gray": "#E1E4ED",
        "neutral-800": "#19213D",
        "neutral-500": "#B4B9C9",
        "neutral-400": "#E1E4ED",
        "neutral-300": "#F1F3F7",
        "neutral-600": "#6D758F",
        "custom-red": "#FF0000",
        primary: {
          "50": "#e4f7f7",
          "100": "#c0ebeb",
          "200": "#96dfdf",
          "300": "#6cd3d3",
          "400": "#43c7c7",
          "500": "#159A9C",
          "600": "#118787",
          "700": "#0d6e6e",
          "800": "#095555",
          "900": "#043c3c",
          "950": "#022727",
        },
        secondary: {
          "50": "#e8f1f4",
          "100": "#cddde5",
          "200": "#adc6d4",
          "300": "#8cafd3",
          "400": "#6a98c1",
          "500": "#002333",
          "600": "#001e2b",
          "700": "#001722",
          "800": "#00101a",
          "900": "#000a11",
          "950": "#00060b",
          "1000": "#149A9B"
        },
        success: {
          DEFAULT: '#16a34a',
          foreground: '#ffffff',
        },
        warning: {
          DEFAULT: '#d97706',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        progress: {
          "0%": { transform: "translateX(0) scaleX(0)" },
          "40%": { transform: "translateX(0) scaleX(0.4)" },
          "100%": { transform: "translateX(100%) scaleX(0.5)" },
        },
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        progress: "progress 1s infinite linear",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
