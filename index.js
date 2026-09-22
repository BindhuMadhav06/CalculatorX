import 'react-native-get-random-values';
import * as Crypto from 'expo-crypto';
import { registerRootComponent } from 'expo';
import App from './App';

// Guaranteed global.crypto.getRandomValues polyfill
try {
  if (typeof global !== 'undefined') {
    if (!global.crypto) {
      try {
        global.crypto = {};
      } catch (e) {}
    }
    if (global.crypto && typeof global.crypto.getRandomValues !== 'function') {
      global.crypto.getRandomValues = function getRandomValues(array) {
        const getRandomBytes = Crypto.getRandomBytes(array.length);
        for (let i = 0; i < array.length; i++) {
          array[i] = getRandomBytes[i];
        }
        return array;
      };
    }
  }
} catch (err) {
  console.warn('Crypto polyfill error:', err);
}

registerRootComponent(App);
