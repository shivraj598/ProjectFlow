import { httpServerHandler } from "cloudflare:node";
import { createApiApp } from "./app.js";
import { handleRealtimeUpgrade } from "./realtime.js";

const app = createApiApp();
app.listen(3000);
const handler = httpServerHandler({ port: 3000 });

export { RealtimeRoom } from "./realtime.js";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    if (request.headers.get("upgrade")?.toLowerCase() === "websocket") {
      return handleRealtimeUpgrade(request, env);
    }
    return handler.fetch(request, env, ctx);
  },
};