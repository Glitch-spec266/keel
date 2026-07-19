// Learn more: https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// framer-motion (pulled in by moti on web) imports `tslib`. With SDK 54's
// package-exports resolution, `tslib` resolves to its ESM shim (modules/index.js),
// whose CJS interop leaves the helpers undefined -> "Cannot destructure property
// '__extends' of 'tslib.default'". Force the CommonJS entry, which exports the
// helpers correctly. Native is unaffected (moti uses reanimated there).
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'tslib') {
    return context.resolveRequest(context, 'tslib/tslib.js', platform);
  }
  return originalResolveRequest
    ? originalResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
