/// <reference types="vite/client" />

/**
 * Vite raw CSS import declarations
 * Enables `?inline` suffix for importing CSS as strings
 */
declare module '*.css?inline' {
  const content: string;
  export default content;
}

declare module '*.css?raw' {
  const content: string;
  export default content;
}
