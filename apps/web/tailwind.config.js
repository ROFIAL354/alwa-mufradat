/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "outline": "#86948a",
        "surface-bright": "#343b36",
        "on-tertiary-fixed-variant": "#842225",
        "surface-container-highest": "#2f3632",
        "on-error-container": "#ffdad6",
        "error": "#ffb4ab",
        "inverse-on-surface": "#2b322d",
        "on-primary-fixed-variant": "#005236",
        "on-primary-container": "#00422b",
        "tertiary": "#ffb3af",
        "on-secondary-fixed-variant": "#653e00",
        "surface-dim": "#0e1511",
        "on-surface": "#dde4dd",
        "surface-container-lowest": "#09100c",
        "surface-container-low": "#161d19",
        "primary-fixed-dim": "#4edea3",
        "on-error": "#690005",
        "background": "#0e1511",
        "error-container": "#93000a",
        "secondary-fixed-dim": "#ffb95f",
        "tertiary-fixed": "#ffdad7",
        "secondary-fixed": "#ffddb8",
        "inverse-surface": "#dde4dd",
        "surface": "#0e1511",
        "secondary-container": "#ee9800",
        "outline-variant": "#3c4a42",
        "inverse-primary": "#006c49",
        "on-tertiary": "#650911",
        "primary": "#4edea3",
        "surface-tint": "#4edea3",
        "on-secondary-fixed": "#2a1700",
        "on-primary": "#003824",
        "on-surface-variant": "#bbcabf",
        "tertiary-container": "#fc7c78",
        "on-primary-fixed": "#002113",
        "on-secondary-container": "#5b3800",
        "surface-container-high": "#242c27",
        "secondary": "#ffb95f",
        "on-tertiary-fixed": "#410005",
        "tertiary-fixed-dim": "#ffb3af",
        "on-secondary": "#472a00",
        "on-background": "#dde4dd",
        "on-tertiary-container": "#711419",
        "primary-container": "#10b981",
        "primary-fixed": "#6ffbbe",
        "surface-container": "#1a211d",
        "surface-variant": "#2f3632"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "md": "16px",
        "gutter": "16px",
        "margin": "20px",
        "sm": "8px",
        "lg": "24px",
        "xl": "48px",
        "xs": "4px"
      },
      fontFamily: {
        "headline-display": ["Inter", "sans-serif"],
        "body-sm": ["Inter", "sans-serif"],
        "arabic-sentence": ["Amiri", "serif"],
        "arabic-word-lg": ["Amiri", "serif"],
        "body-main": ["Inter", "sans-serif"],
        "label-caps": ["Inter", "sans-serif"]
      },
      fontSize: {
        "headline-display": [
          "30px",
          {
            "lineHeight": "36px",
            "fontWeight": "700"
          }
        ],
        "body-sm": [
          "14px",
          {
            "lineHeight": "20px",
            "fontWeight": "400"
          }
        ],
        "arabic-sentence": [
          "24px",
          {
            "lineHeight": "1.8",
            "fontWeight": "400"
          }
        ],
        "arabic-word-lg": [
          "32px",
          {
            "lineHeight": "1.5",
            "fontWeight": "700"
          }
        ],
        "body-main": [
          "16px",
          {
            "lineHeight": "24px",
            "fontWeight": "400"
          }
        ],
        "label-caps": [
          "12px",
          {
            "lineHeight": "16px",
            "letterSpacing": "0.05em",
            "fontWeight": "600"
          }
        ]
      }
    }
  },
  plugins: []
};
