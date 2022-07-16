module.exports = {
  extends: [
    'airbnb-base',
    'airbnb-typescript/base'
  ],
  parserOptions: {
    project: './tsconfig.json'
  },
  rules: {
    'import/prefer-default-export': 'off',
    '@typescript-eslint/indent': 'off',
    'class-methods-use-this': 'off'
  },
  overrides: [
    {
      files: ['test/**/*.spec.ts'],
      rules: {
        'no-unused-expressions': 'off',
        '@typescript-eslint/no-unused-expressions': 'off',
        'prefer-arrow-callback': 'off',
        'func-names': 'off',
        'no-underscore-dangle': ['error', { allow: ['_id'] }]
      }
    }
  ]
};
