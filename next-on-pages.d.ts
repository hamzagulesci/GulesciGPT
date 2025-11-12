declare module '@cloudflare/next-on-pages' {
  // Minimal type shim for Cloudflare Pages runtime helper used in Edge routes
  export function getRequestContext(): { env: Record<string, unknown> }
}
