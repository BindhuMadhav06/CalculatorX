const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Alias asset-registry to react-native/Libraries/Image/AssetRegistry for Metro image asset loader
config.resolver = config.resolver || {};
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'react-native/asset-registry': require.resolve('react-native/Libraries/Image/AssetRegistry'),
};

module.exports = config;
