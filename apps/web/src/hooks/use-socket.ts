import { useEffect } from "react";
import { io, type Socket } from "socket.io-client";
import { useAuthStore } from "@/stores/auth-store";

type Handler = (event: string, payload: unknown) => void;

let socket: Socket | null = null;
let joinedOrg: string | null = null;
const joinedProjects = new Set<string>();
const handlers = new Set<Handler>();

function ensureSocket(): Socket | null {
  const { accessToken } = useAuthStore.getState();
  if (!accessToken) return null;
  if (socket) return socket;
  socket = io("/", {
    auth: { token: accessToken },
    transports: ["websocket", "polling"],
  });
  socket.onAny((event, payload) => {
    for (const h of handlers) h(event, payload);
  });
  socket.on("connect_error", () => {
    // token may have rotated; socket will retry on next auth change
  });
  return socket;
}

/**
 * Connects to the realtime socket, joins the org + project rooms,
 * and invokes every provided callback with each received event.
 */
export function useSocket(
  projectId?: string | null,
  ...callbacks: Array<(event: string, payload: unknown) => void>
) {
  const { accessToken, currentOrgId } = useAuthStore();

  useEffect(() => {
    if (!accessToken) return;
    const s = ensureSocket();

    if (currentOrgId && currentOrgId !== joinedOrg) {
      if (joinedOrg) s?.emit("org:leave", joinedOrg);
      s?.emit("org:join", currentOrgId);
      joinedOrg = currentOrgId;
    }
    if (projectId && !joinedProjects.has(projectId)) {
      s?.emit("project:join", projectId);
      joinedProjects.add(projectId);
    }
  }, [accessToken, currentOrgId, projectId]);

  useEffect(() => {
    if (!accessToken || callbacks.length === 0) return;
    ensureSocket();
    const handler: Handler = (event, payload) => {
      for (const cb of callbacks) cb(event, payload);
    };
    handlers.add(handler);
    return () => {
      handlers.delete(handler);
    };
  }, [accessToken, callbacks.length]);
}
