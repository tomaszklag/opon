/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ['./packages/eslint-config/index.js'],
  ignorePatterns: ['apps/', 'packages/'],
  settings: {
    next: {
      rootDir: ['apps/panel/', 'apps/landing/'],
    },
  },
};
