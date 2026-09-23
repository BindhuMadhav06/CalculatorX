import * as Crypto from 'expo-crypto';
import { registerRootComponent } from 'expo';
import App from './App';

// Guaranteed global.crypto.getRandomValues polyfill using expo-crypto
try {
  if (typeof global !== 'undefined') {
    if (!global.crypto) {
      try {
        global.crypto = {};
      } catch (e) {}
    }
    if (global.crypto && typeof global.crypto.getRandomValues !== 'function') {
      global.crypto.getRandomValues = function getRandomValues(array) {
        if (!array) return array;
        try {
          const bytes = Crypto.getRandomBytes(array.length);
          for (let i = 0; i < array.length; i++) {
            array[i] = bytes[i];
          }
        } catch (e) {
          for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
          }
        }
        return array;
      };
    }
  }
} catch (err) {
  console.warn('Crypto polyfill error:', err);
}

registerRootComponent(App);
