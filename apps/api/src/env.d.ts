/**
 * Ambient declarations for Cloudflare runtime modules. Importing
 * `@cloudflare/workers-types` would pull its global DOM types into the Node
 * build and clash with @types/node, so these minimal declarations keep both
 * `tsc` builds green. The Worker bundle itself is produced by esbuild (via
 * wrangler), which does not typecheck.
 *
 * This file is a script (no imports/exports), so everything declared here is
 * global.
 */

declare module "cloudflare:workers" {
  export class DurableObject {
    constructor(ctx: unknown, env: unknown);
    protected ctx: DurableObjectCtx;
  }
  export const env: Env;
}

declare module "cloudflare:node" {
  export function httpServerHandler(options: { port?: number }): {
    fetch(request: Request, env: unknown, ctx: unknown): Promise<Response>;
  };
}

interface DurableObjectCtx {
  acceptWebSocket(ws: unknown): void;
  getWebSockets(): WebSocket[];
  serializeAttachment(value: unknown): void;
}

interface Env {
  DB: unknown;
  REALTIME: unknown;
  CLIENT_ORIGIN?: string;
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

declare const WebSocketPair: {
  new (): { 0: WebSocket; 1: WebSocket };
};