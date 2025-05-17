import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

export default <Partial<Config>>{
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        'purple-heart': {
          50: '#F8F0FE',
          100: '#F3E7FE',
          200: '#E1C5FC',
          300: '#D0A3FA',
          400: '#B56EF7',
          500: '#790CDF',
          600: '#6E0BCB',
          700: '#610AB3',
          800: '#4F0891',
          900: '#3A066A',
          950: '#270449',
        },
      },
      gridRow: {
        'span-8': 'span 8 / span 8',
      },
    },
  },
};
