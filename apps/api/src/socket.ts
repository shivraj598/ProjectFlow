import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import { verifyAccessToken } from "./lib/jwt.js";

let io: Server | null = null;

export function initSocket(httpServer: HttpServer, origin: string) {
  io = new Server(httpServer, {
    cors: { origin, credentials: true },
  });

  io.use((socket, next) => {
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

  io.on("connection", (socket) => {
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

export function getIO(): Server {
  if (!io) throw new Error("Socket not initialized");
  return io;
}

export function emitToOrg(orgId: string, event: string, payload: unknown) {
  getIO().to(`org:${orgId}`).emit(event, payload);
}

export function emitToProject(projectId: string, event: string, payload: unknown) {
  getIO().to(`project:${projectId}`).emit(event, payload);
}