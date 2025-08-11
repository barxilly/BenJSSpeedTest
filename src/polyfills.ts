// Polyfills for Node.js modules in browser environment

// Create a UUID v4 generator function
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Polyfill for crypto.randomUUID
if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = {} as any;
}

if (typeof globalThis.crypto.randomUUID === 'undefined') {
  (globalThis.crypto as any).randomUUID = generateUUID;
}

// Ensure crypto.getRandomValues is available (it should be in modern browsers)
if (typeof globalThis.crypto.getRandomValues === 'undefined') {
  (globalThis.crypto as any).getRandomValues = function(array: any) {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  };
}

// Export for module compatibility
export {};
