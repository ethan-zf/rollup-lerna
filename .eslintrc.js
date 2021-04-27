module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  // extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  // parser: '@typescript-eslint/parser',
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
    requireConfigFile: false,
  },
  // plugins: ['@typescript-eslint'],
  rules: {
    indent: ['error', 2, { SwitchCase: 1 }],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
  },
};
