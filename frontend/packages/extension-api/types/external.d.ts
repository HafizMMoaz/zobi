/**
 * Stub for the untyped jed module.
 */
declare module 'jed';

/**
 * CSS side-effect imports from @fontsource packages. These are bundler-only
 * artifacts and carry no type information at runtime; declaring them here
 * silences TS2882 under TypeScript 6.0's stricter module-resolution rules.
 */
declare module '@fontsource/*';
