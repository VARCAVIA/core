import eslintPluginPrettier from 'eslint-plugin-prettier'
import reactPlugin from 'eslint-plugin-react'

export default [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    ignores: ['node_modules', 'dist', 'frontend/dist'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parser: '@babel/eslint-parser',
      parserOptions: {
        requireConfigFile: false,
        babelOptions: { presets: ['@babel/preset-react'] },
      },
    },
    plugins: { prettier: eslintPluginPrettier, react: reactPlugin },
    rules: {
      'prettier/prettier': 'error',
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
    },
    settings: { react: { version: 'detect' } },
  },
]
