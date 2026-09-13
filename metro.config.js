const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver = config.resolver || {};
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  'react-native/asset-registry': require.resolve('react-native/Libraries/Image/AssetRegistry'),
};

module.exports = config;
