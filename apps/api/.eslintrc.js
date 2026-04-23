/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['@opony/eslint-config'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: ['dist/', 'prisma/seed.d.ts'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
};
