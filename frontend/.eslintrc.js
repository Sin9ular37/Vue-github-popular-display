module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-prettier',
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vue/multi-word-component-names': 'off',
    'vue/no-unused-vars': 'warn',
    'no-unused-vars': 'warn',
    'prefer-const': 'warn',
    'no-var': 'error',
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: ['plugin:@typescript-eslint/recommended'],
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
      },
      rules: {
        '@typescript-eslint/no-unused-vars': 'warn',
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
    {
      files: ['**/*.vue'],
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
      rules: {
        'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      },
    },
  ],
}
