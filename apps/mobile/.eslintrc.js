/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ['@opony/eslint-config'],
  env: {
    browser: true,
    node: true,
  },
  rules: {
    'no-console': 'off',
  },
};
