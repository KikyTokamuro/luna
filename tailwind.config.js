/** 
 * @type {import('tailwindcss').Config} 
 */
export default {
  content: ['./index.html', './app.js', './components/**/*.js', './views/**/*.js', './lib/**/*.js'],
  theme: {
    extend: {
      fontFamily: { sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'] }
    }
  },
  plugins: []
};
