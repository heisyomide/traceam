/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Avioré Branding
        aviore: {
          black: '#050505',
          dark: '#0A0A0A',
          gray: '#1A1A1A',
          accent: '#00F0FF', // Electric Cyan
          vivid: '#FF0055',  // Sharp Pink for contrast
        },
      },
      backgroundImage: {
        // Perfect for that futuristic 'noise' or 'grid' background
        'noise': "url('/noise.png')", 
        'grid-white': "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255 255 255 / 0.04)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e\")",
      },
      animation: {
        // High-end UI motion
        'scan': 'scan 3s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'reveal': 'reveal 1.5s cubic-bezier(0.77, 0, 0.175, 1)',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        reveal: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      letterSpacing: {
        'ultra-wide': '0.3em',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};