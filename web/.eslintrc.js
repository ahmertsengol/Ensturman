module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['react', 'react-hooks'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // Turn off the rule for jsx-runtime
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    // Allow unused vars that start with _ or are all caps
    'no-unused-vars': ['warn', { 
      varsIgnorePattern: '^_|^[A-Z0-9_]+$',
      argsIgnorePattern: '^_',
    }],
    // Ignore motion import to fix the linting issue
    'no-undef': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
  globals: {
    React: 'writable',
  },
}; 