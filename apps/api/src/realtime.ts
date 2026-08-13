import { DurableObject } from "cloudflare:workers";
import { verifyAccessToken } from "./lib/jwt.js";

/**
 * One RealtimeRoom Durable Object instance exists per room (`org:<id>` / `project:<id>`).
 * WebSocket clients connect directly to the instance for their room, so no join/leave
 * messages are needed — the room is implicit in the connection URL.
 */
export class RealtimeRoom extends DurableObject {
  constructor(ctx: unknown, env: unknown) {
    super(ctx, env);
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const room = url.searchParams.get("room") ?? "";
    const userId = request.headers.get("x-realtime-user") ?? "";
    if (!room || !userId) return new Response("bad request", { status: 400 });

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair) as [WebSocket, WebSocket];
    this.ctx.acceptWebSocket(server);
    this.ctx.serializeAttachment({ room, userId });
    return new Response(null, { status: 101, webSocket: client } as ResponseInit & { webSocket: WebSocket });
  }

  webSocketMessage() {
    // Clients never send messages; the room is defined by the connection URL.
  }

  webSocketClose() {}

  broadcast(event: string, payload: unknown): number {
    const data = JSON.stringify({ event, payload });
    for (const ws of this.ctx.getWebSockets()) {
      ws.send(data);
    }
    return this.ctx.getWebSockets().length;
  }
}

export async function broadcastToRoom(room: string, event: string, payload: unknown): Promise<void> {
  const { env } = await import("cloudflare:workers");
  const namespace = env.REALTIME as { idFromName(name: string): unknown; get(id: unknown): { broadcast(e: string, p: unknown): Promise<number> } };
  const stub = namespace.get(namespace.idFromName(room));
  await stub.broadcast(event, payload);
}

/**
 * Worker-side handler for `/ws` upgrade requests. Verifies the JWT, then forwards
 * the upgrade to the room's Durable Object.
 */
export async function handleRealtimeUpgrade(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  if (url.pathname !== "/ws") return new Response("not found", { status: 404 });

  const token = url.searchParams.get("token") ?? "";
  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    return new Response("unauthorized", { status: 401 });
  }

  const room = url.searchParams.get("room") ?? "";
  if (!room) return new Response("missing room", { status: 400 });

  const headers = new Headers(request.headers);
  headers.set("x-realtime-user", payload.sub);

  const namespace = env.REALTIME as { idFromName(name: string): unknown; get(id: unknown): { fetch(req: Request): Promise<Response> } };
  const stub = namespace.get(namespace.idFromName(room));
  return stub.fetch(new Request(request.url, { headers }));
}