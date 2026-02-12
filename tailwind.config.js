module.exports = {
  content: [
    './src/**/*.{html,js,ts,jsx,tsx}',
  ],
  // theme: {
  //   extend: {
  //     typography: {
  //       DEFAULT: {
  //         css: {
  //           p: {
  //             margin: '0.25rem 0', // my-1
  //           },
  //           li: {
  //             margin: '0.25rem 0', // my-1
  //           },
  //           h1: { margin: '1rem 0 0.5rem 0' },
  //           h2: { margin: '0.75rem 0 0.5rem 0' },
  //           h3: { margin: '0.5rem 0 0.25rem 0' },
  //         }
  //       }
  //     }
  //   }
  // },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
