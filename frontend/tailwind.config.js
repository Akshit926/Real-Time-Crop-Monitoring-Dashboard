export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 30px 80px rgba(15, 23, 42, 0.18)',
      },
      backgroundImage: {
        'dashboard-gradient': 'radial-gradient(circle at top left, rgba(16, 185, 129, 0.18), transparent 34%), radial-gradient(circle at bottom right, rgba(59, 130, 246, 0.14), transparent 30%)',
      },
    },
  },
  plugins: [],
};
