import 'react-native-get-random-values';
import * as Crypto from 'expo-crypto';
import { registerRootComponent } from 'expo';
import App from './App';

// Guaranteed global.crypto.getRandomValues polyfill
if (typeof global.crypto !== 'object' || global.crypto === null) {
  global.crypto = {};
}
if (typeof global.crypto.getRandomValues !== 'function') {
  global.crypto.getRandomValues = function getRandomValues(array) {
    const getRandomBytes = Crypto.getRandomBytes(array.length);
    for (let i = 0; i < array.length; i++) {
      array[i] = getRandomBytes[i];
    }
    return array;
  };
}

registerRootComponent(App);
