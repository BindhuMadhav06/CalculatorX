import * as Crypto from 'expo-crypto';

// Cryptographically secure RNG polyfill using native expo-crypto
if (typeof global.crypto !== 'object') {
  (global as any).crypto = {};
}

if (typeof (global as any).crypto.getRandomValues !== 'function') {
  (global as any).crypto.getRandomValues = function getRandomValues<T extends ArrayBufferView | null>(array: T): T {
    if (!array) return array;
    const byteLength = array.byteLength;
    const bytes = Crypto.getRandomBytes(byteLength);
    const uint8Array = new Uint8Array(array.buffer, array.byteOffset, byteLength);
    uint8Array.set(bytes);
    return array;
  };
}
