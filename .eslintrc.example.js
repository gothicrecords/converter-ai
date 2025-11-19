/**
 * ESLint Configuration Example
 * 
 * Questo file mostra come configurare ESLint per il progetto.
 * Copia questo file come .eslintrc.js nella root del progetto.
 */

module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  rules: {
    // Regole personalizzate per il progetto
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'prefer-const': 'warn',
  },
};

