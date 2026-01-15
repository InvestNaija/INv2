/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        primary: '#222',
        primaryColor: '#005055',
        tertiary: '#A1A1A1',
        secondary: '#49B5BB',
        accent: '#BABABA',
        inputFocus: '#49B5BB'
      }
    },
  },
  plugins: [],
}

