/**
 * Main entry point for @elizaos/core
 *
 * This is the default export that includes all modules.
 * The build system creates separate bundles for Node.js and browser environments.
 * Package.json conditional exports handle the routing to the correct build.
 */

// Export everything from types
export * from './types';

// Export utils first to avoid circular dependency issues
export * from './utils';

// Export schemas
export * from './schemas/character';

// Export environment utilities
export * from './utils/environment';

// Export buffer utilities
export * from './utils/buffer';

// Then all other exports
export * from './actions';
export * from './database';
export * from './entities';
export * from './logger';
export * from './prompts';
export * from './roles';
export * from './runtime';
export * from './settings';
export * from './services';
export * from './search';


// Environment detection utilities
export const isBrowser =
  typeof globalThis !== 'undefined' &&
  typeof (globalThis as any).window !== 'undefined' &&
  typeof (globalThis as any).document !== 'undefined';
export const isNode =
  typeof process !== 'undefined' &&
  typeof process.versions !== 'undefined' &&
  typeof process.versions.node !== 'undefined';

// Re-export server health with a conditional stub for browser environments
export * from './utils/server-health';
