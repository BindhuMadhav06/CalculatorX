declare module 'tweetnacl-util' {
  export function encodeBase64(arr: Uint8Array): string;
  export function decodeBase64(s: string): Uint8Array;
  export function encodeUTF8(s: string): Uint8Array;
  export function decodeUTF8(arr: Uint8Array): string;
}
