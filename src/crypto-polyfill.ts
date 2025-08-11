// Browser polyfill for Node.js crypto module

// Generate UUID v4
export function randomUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Polyfill for getRandomValues
export function getRandomValues(array: Uint8Array | Uint16Array | Uint32Array): typeof array {
  if (typeof globalThis.crypto?.getRandomValues === 'function') {
    return globalThis.crypto.getRandomValues(array);
  }
  
  // Fallback implementation
  for (let i = 0; i < array.length; i++) {
    array[i] = Math.floor(Math.random() * 256);
  }
  return array;
}

// Default export for compatibility
export default {
  randomUUID,
  getRandomValues
};
