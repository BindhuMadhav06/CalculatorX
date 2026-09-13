module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^expo-secure-store$': '<rootDir>/tests/mocks/keychainMock.js',
    '^react-native-keychain$': '<rootDir>/tests/mocks/keychainMock.js',
  },
};
