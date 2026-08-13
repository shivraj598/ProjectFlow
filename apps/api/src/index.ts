import "dotenv/config";
import http from "http";
import { createApiApp } from "./app.js";
import { initSocket } from "./socket.js";

export const app = createApiApp();

const port = Number(process.env.PORT ?? 4000);
const origin = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";

const server = http.createServer(app);
initSocket(server, origin);

server.listen(port, () => {
  console.log(`ProjectFlow API listening on http://localhost:${port}`);
});
