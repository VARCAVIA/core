Set-Location C:\Users\ricca\Documents\core\frontend

@"
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default {
  plugins: [
    tailwindcss,
    autoprefixer
  ]
};
"@ | Set-Content -Encoding UTF8 postcss.config.js
