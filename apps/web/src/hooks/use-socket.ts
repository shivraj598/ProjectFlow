import { useEffect } from "react";
import { io, type Socket } from "socket.io-client";
import { useAuthStore } from "@/stores/auth-store";

type Handler = (event: string, payload: unknown) => void;

const IS_DEV = import.meta.env.DEV;

// ---------------------------------------------------------------------------
// Shared event dispatch
// ---------------------------------------------------------------------------
const handlers = new Set<Handler>();

function dispatch(name: string, payload: unknown) {
  for (const h of handlers) h(name, payload);
}

// ---------------------------------------------------------------------------
// Development transport: socket.io (proxied by Vite to the local Express API).
// ---------------------------------------------------------------------------
let devSocket: Socket | null = null;
let devJoinedOrg: string | null = null;
const devJoinedProjects = new Set<string>();

function ensureDevSocket(): Socket | null {
  const { accessToken } = useAuthStore.getState();
  if (!accessToken) return null;
  if (devSocket) return devSocket;
  devSocket = io("/", {
    auth: { token: accessToken },
    transports: ["websocket", "polling"],
  });
  devSocket.onAny((event, payload) => dispatch(event, payload));
  devSocket.on("connect_error", () => {
    // token may have rotated; socket will retry on next auth change
  });
  return devSocket;
}

function devJoinRooms(orgId: string | null, projectId: string | null) {
  const s = ensureDevSocket();
  if (orgId && orgId !== devJoinedOrg) {
    if (devJoinedOrg) s?.emit("org:leave", devJoinedOrg);
    s?.emit("org:join", orgId);
    devJoinedOrg = orgId;
  }
  if (projectId && !devJoinedProjects.has(projectId)) {
    s?.emit("project:join", projectId);
    devJoinedProjects.add(projectId);
  }
}

// ---------------------------------------------------------------------------
// Production transport: one native WebSocket per room, terminated at a
// Durable Object. The room is implicit in the connection URL, so there is no
// join/leave handshake.
// ---------------------------------------------------------------------------
interface RoomConn {
  ws: WebSocket;
  retry: number;
  timer?: ReturnType<typeof setTimeout>;
}

const rooms = new Map<string, RoomConn>();
const desiredRooms = new Set<string>();

function connectRoom(room: string, accessToken: string) {
  desiredRooms.add(room);
  const existing = rooms.get(room);
  if (existing && existing.ws.readyState <= WebSocket.OPEN) return;

  const conn: RoomConn = {
    ws: new WebSocket(`/ws?room=${encodeURIComponent(room)}&token=${encodeURIComponent(accessToken)}`),
    retry: 0,
  };
  rooms.set(room, conn);

  conn.ws.onmessage = (event) => {
    try {
      const { event: name, payload } = JSON.parse(event.data);
      dispatch(name, payload);
    } catch {
      // ignore malformed frames
    }
  };
  conn.ws.onerror = () => conn.ws.close();
  conn.ws.onclose = () => {
    if (rooms.get(room) !== conn) return;
    rooms.delete(room);
    if (!desiredRooms.has(room)) return;
    const delay = Math.min(1000 * 2 ** conn.retry, 15000);
    conn.retry += 1;
    conn.timer = setTimeout(() => connectRoom(room, accessToken), delay);
  };
}

function resetRoomSockets(accessToken: string) {
  for (const room of [...rooms.keys()]) {
    const conn = rooms.get(room);
    if (!conn) continue;
    clearTimeout(conn.timer);
    conn.ws.close();
    rooms.delete(room);
  }
  for (const room of desiredRooms) connectRoom(room, accessToken);
}

// ---------------------------------------------------------------------------
/**
 * Connects to the realtime transport, joins the org + project rooms,
 * and invokes every provided callback with each received event.
 */
export function useSocket(
  projectId?: string | null,
  ...callbacks: Array<(event: string, payload: unknown) => void>
) {
  const { accessToken, currentOrgId } = useAuthStore();
  const project: string | null = projectId ?? null;

  useEffect(() => {
    if (!accessToken) return;
    if (IS_DEV) {
      devJoinRooms(currentOrgId, project);
    } else {
      if (currentOrgId) connectRoom(`org:${currentOrgId}`, accessToken);
      if (project) connectRoom(`project:${project}`, accessToken);
    }
    return () => {
      if (IS_DEV) return;
      if (project) desiredRooms.delete(`project:${project}`);
    };
  }, [accessToken, currentOrgId, project]);

  useEffect(() => {
    if (!accessToken) return;
    if (IS_DEV) ensureDevSocket();
    const handler: Handler = (event, payload) => {
      for (const cb of callbacks) cb(event, payload);
    };
    handlers.add(handler);
    return () => {
      handlers.delete(handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, ...callbacks]);
}

// When the access token rotates, reconnect every room with the new token.
useAuthStore.subscribe((state, prev) => {
  if (IS_DEV) return;
  if (state.accessToken && state.accessToken !== prev.accessToken) {
    resetRoomSockets(state.accessToken);
  }
});