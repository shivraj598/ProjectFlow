import type { Server as HttpServer } from "http";
import type { Server as SocketIOServer, Socket } from "socket.io";
import { verifyAccessToken } from "./lib/jwt.js";

const IS_WORKER = typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers";

let io: SocketIOServer | null = null;

export async function initSocket(httpServer: HttpServer, origin: string) {
  const { Server } = await import("socket.io");
  io = new Server(httpServer, {
    cors: { origin, credentials: true },
  });

  io.use((socket: Socket, next) => {
    try {
      const token = (socket.handshake.auth && socket.handshake.auth.token) as string | undefined;
      if (!token) return next(new Error("unauthorized"));
      const payload = verifyAccessToken(token);
      socket.data.userId = payload.sub;
      socket.data.orgIds = new Set<string>();
      next();
    } catch {
      next(new Error("unauthorized"));
    }
  });

  io.on("connection", (socket: Socket) => {
    socket.on("org:join", (orgId: string) => {
      socket.data.orgIds.add(orgId);
      socket.join(`org:${orgId}`);
    });
    socket.on("org:leave", (orgId: string) => {
      socket.data.orgIds.delete(orgId);
      socket.leave(`org:${orgId}`);
    });
    socket.on("project:join", (projectId: string) => {
      socket.join(`project:${projectId}`);
    });
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) throw new Error("Socket not initialized");
  return io;
}

function emitToRoom(room: string, event: string, payload: unknown) {
  if (IS_WORKER) {
    void import("./realtime.js")
      .then((m) => m.broadcastToRoom(room, event, payload))
      .catch((err) => console.error("realtime broadcast failed", err));
    return;
  }
  io?.to(room).emit(event, payload);
}

export function emitToOrg(orgId: string, event: string, payload: unknown) {
  emitToRoom(`org:${orgId}`, event, payload);
}

export function emitToProject(projectId: string, event: string, payload: unknown) {
  emitToRoom(`project:${projectId}`, event, payload);
}