import express from "express";
import cors from "cors";
import { errorHandler, notFoundHandler } from "./lib/errors.js";
import { authRouter } from "./routes/auth.js";
import { orgsRouter } from "./routes/orgs.js";
import { workspacesRouter } from "./routes/workspaces.js";
import { workspaceItemRouter } from "./routes/workspace-item.js";
import { projectsRouter } from "./routes/projects.js";
import { projectItemRouter } from "./routes/project-item.js";
import { taskItemRouter } from "./routes/tasks.js";
import { commentsRouter } from "./routes/comments.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { sprintsRouter } from "./routes/sprints.js";

export function createApiApp(): express.Express {
  const app = express();
  const origin = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";

  app.use(cors({ origin, credentials: true }));
  app.use(express.json({ limit: "2mb" }));

  app.get("/api/health", (_req, res) => res.json({ ok: true, service: "projectflow-api" }));

  app.use("/api/auth", authRouter);
  app.use("/api/orgs", orgsRouter);
  app.use("/api/orgs", workspacesRouter); // /api/orgs/:orgId/workspaces
  app.use("/api/workspaces", workspaceItemRouter); // /api/workspaces/:id
  app.use("/api/orgs", projectsRouter); // /api/orgs/:orgId/projects
  app.use("/api/projects", projectItemRouter); // /api/projects/:projectId + columns + tasks + reorder
  app.use("/api/projects", sprintsRouter); // /api/projects/:projectId/sprints
  app.use("/api/tasks", taskItemRouter); // /api/tasks/:id
  app.use("/api/tasks", commentsRouter); // /api/tasks/:taskId/comments, /api/tasks/comments/:id
  app.use("/api/orgs", dashboardRouter); // /api/orgs/:orgId/dashboard

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}