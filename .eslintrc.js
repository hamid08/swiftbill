module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'prettier'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
    browser: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/no-wrapper-object-types': 'warn', // Change from 'error' to 'warn'
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'prettier/prettier': ['warn', { endOfLine: 'auto' }],
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-duplicate-enum-values': 'off',

    '@typescript-eslint/naming-convention': [
      'warn', // Set the error level (error or warn)
      {
        selector: 'interface',
        format: ['PascalCase'],
        custom: {
          regex: '^I[A-Z]', // Ensure interfaces start with 'I'
          match: true,
        },
      },
      {
        selector: 'class',
        format: ['PascalCase'], // Classes must be PascalCase
      },
      {
        selector: 'variableLike',
        format: ['camelCase'], // Variable-like names must be camelCase
      },
      {
        selector: 'enum',
        format: ['PascalCase'], // Enums should be PascalCase
      },
    ],
  },
};
