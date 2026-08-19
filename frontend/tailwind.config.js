/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  // The existing landing page (About section) uses hand-written CSS.
  // Preflight is disabled so Tailwind's base reset doesn't alter the
  // existing look of buttons, headings, links, etc. on that page.
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        background: "#F8F4ED",
        primary: {
          DEFAULT: "#1B2343",
          light: "#2a3560",
        },
        accent: {
          DEFAULT: "#F4B23A",
          dark: "#d99a1f",
        },
      },
      fontFamily: {
        display: ["Space Grotesk", "Segoe UI", "sans-serif"],
        body: ["Inter", "Segoe UI", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
