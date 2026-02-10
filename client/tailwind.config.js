/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#6C63FF', // Example primary color
                secondary: '#2F2E41',
                glass: 'rgba(255, 255, 255, 0.1)',
                darkGlass: 'rgba(0, 0, 0, 0.3)',
            },
            backdropBlur: {
                xs: '2px',
            }
        },
    },
    plugins: [],
}
