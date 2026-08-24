/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#006b58",
        "on-primary": "#ffffff",
        "primary-container": "#64ffda",
        "on-primary-container": "#007560",
        "primary-fixed": "#5ffbd6",
        "primary-fixed-dim": "#38debb",
        "on-primary-fixed": "#002019",
        "on-primary-fixed-variant": "#005142",
        "secondary": "#006b5c",
        "on-secondary": "#ffffff",
        "secondary-container": "#9bf3df",
        "on-secondary-container": "#017162",
        "secondary-fixed": "#9bf3df",
        "secondary-fixed-dim": "#7fd6c3",
        "on-secondary-fixed": "#00201b",
        "on-secondary-fixed-variant": "#005045",
        "tertiary": "#636037",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#eee8b4",
        "on-tertiary-container": "#6c683e",
        "tertiary-fixed": "#eae4b1",
        "tertiary-fixed-dim": "#cdc897",
        "on-tertiary-fixed": "#1e1c00",
        "on-tertiary-fixed-variant": "#4b4822",
        "surface": "#f9f9f9",
        "surface-dim": "#dadada",
        "surface-bright": "#f9f9f9",
        "surface-variant": "#e2e2e2",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f3f3f3",
        "surface-container": "#eeeeee",
        "surface-container-high": "#e8e8e8",
        "surface-container-highest": "#e2e2e2",
        "on-surface": "#1a1c1c",
        "on-surface-variant": "#3c4a45",
        "outline": "#6b7a75",
        "outline-variant": "#bacac3",
        "inverse-surface": "#2f3131",
        "inverse-on-surface": "#f1f1f1",
        "inverse-primary": "#38debb",
        "background": "#f9f9f9",
        "on-background": "#1a1c1c",
        "error": "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a"
      },
      borderRadius: {
        "DEFAULT": "1rem",
        "lg": "2rem",
        "xl": "3rem",
        "full": "9999px"
      },
      spacing: {
        "bubble-margin": "4rem",
        "organic-padding": "1.5rem",
        "float-gap": "2rem",
        "safe-area": "2.5rem"
      },
      fontFamily: {
        "sans": ["DM Sans", "sans-serif"],
        "display": ["Quicksand", "sans-serif"],
        "headline-lg": ["Quicksand", "sans-serif"],
        "headline-md": ["Quicksand", "sans-serif"],
        "body-md": ["DM Sans", "sans-serif"],
        "body-lg": ["DM Sans", "sans-serif"],
        "label-sm": ["DM Sans", "sans-serif"],
        "display-lg": ["Quicksand", "sans-serif"]
      },
      fontSize: {
        "headline-lg": ["32px", { lineHeight: "40px", fontWeight: "600" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "label-sm": ["12px", { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "500" }],
        "display-lg": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "600" }]
      },
      boxShadow: {
        "pearl": "inset 0 2px 10px rgba(255,255,255,0.8), 0 10px 40px -10px rgba(0, 107, 88, 0.1)",
        "pearl-hover": "inset 0 4px 12px rgba(255,255,255,0.9), 0 12px 45px -10px rgba(0, 107, 88, 0.15)",
        "inner-glow": "inset 0 2px 4px rgba(255,255,255,0.8)",
        "bubble": "0 4px 20px -2px rgba(0, 107, 88, 0.05)",
        "soft-float": "0 20px 40px -10px rgba(0, 107, 88, 0.05)"
      }
    },
  },
  plugins: [],
};
