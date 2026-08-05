import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { AppError, asyncHandler } from "../lib/errors.js";
import { requireAuth, requireOrgMember, requireOrgRole } from "../middleware/auth.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { logActivity } from "../lib/activity.js";
import { emitToOrg } from "../socket.js";

const router = Router();
router.use(requireAuth());

const DEFAULT_COLUMNS = ["Backlog", "To Do", "In Progress", "In Review", "Done"];

const projectSchema = z.object({
  workspaceId: z.string(),
  name: z.string().trim().min(2).max(80),
  key: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{2,8}$/, "Key must be 2-8 letters or numbers"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#5b8cff"),
  description: z.string().max(400).optional(),
  leadId: z.string().nullable().optional(),
});

// List projects in an organization
router.get(
  "/:orgId/projects",
  requireOrgMember(),
  asyncHandler(async (req: AuthedRequest, res) => {
    const projects = await prisma.project.findMany({
      where: { orgId: req.params.orgId },
      include: {
        workspace: { select: { id: true, name: true } },
        lead: { select: { id: true, name: true } },
        _count: { select: { tasks: true, columns: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ projects });
  })
);

// Create a project (with default workflow columns)
router.post(
  "/:orgId/projects",
  requireOrgMember(),
  requireOrgRole(["ADMIN", "MANAGER"]),
  asyncHandler(async (req: AuthedRequest, res) => {
    const input = projectSchema.parse(req.body);
    const orgId = req.params.orgId;

    const ws = await prisma.workspace.findFirst({ where: { id: input.workspaceId, orgId } });
    if (!ws) throw new AppError(400, "Workspace not found in this organization");

    const existing = await prisma.project.findFirst({ where: { orgId, key: input.key } });
    if (existing) throw new AppError(409, "A project with that key already exists");

    const project = await prisma.$transaction(async (tx) => {
      const created = await tx.project.create({
        data: {
          orgId,
          workspaceId: input.workspaceId,
          name: input.name,
          key: input.key,
          color: input.color,
          description: input.description,
          leadId: input.leadId ?? null,
          status: "PLANNED",
        },
      });
      await tx.column.createMany({
        data: DEFAULT_COLUMNS.map((name, i) => ({ projectId: created.id, name, position: i })),
      });
      return created;
    });

    await logActivity({
      orgId,
      projectId: project.id,
      actorId: req.user.id,
      type: "project.created",
      message: `${req.user.name} created project ${project.name}`,
    });
    emitToOrg(orgId, "project:created", project);
    res.status(201).json({ project });
  })
);

export const projectsRouter = router;