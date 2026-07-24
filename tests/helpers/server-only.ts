/**
 * Test stub for the `server-only` package.
 *
 * `server-only` throws on import outside a server bundle, which is exactly what
 * we want in the app and exactly what breaks a plain Node test runner. Vitest
 * aliases the import here (see vitest.config.ts) so server modules that carry
 * the `import 'server-only'` marker can still be unit-tested.
 */
export {};
