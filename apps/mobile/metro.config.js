const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Force react/react-dom/react-native to resolve from mobile's local node_modules.
// Without this, pnpm's peer-dep virtual store for packages/design-system-native
// resolves react-native to 0.74.5 instead of 0.81.5, causing PlatformConstants crash.
// Only exact top-level names are deduplicated — sub-path imports (react-native/Libraries/…)
// are left to Metro's default resolver so platform-specific extensions work correctly.
const DEDUPE = new Set([
  'react',
  'react-dom',
  'react/jsx-runtime',
  'react/jsx-dev-runtime',
  'react-native',
]);
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    DEDUPE.has(moduleName) ||
    moduleName.startsWith('react/') ||
    moduleName.startsWith('react-dom/')
  ) {
    const filePath = require.resolve(moduleName, { paths: [projectRoot] });
    return { filePath, type: 'sourceFile' };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
