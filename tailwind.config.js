/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        quente: '#EF4444',
        morno: '#F59E0B',
        frio: '#9CA3AF',
        sucesso: '#10B981'
      }
    }
  },
  plugins: []
}
