import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { AppError, asyncHandler } from "../lib/errors.js";
import { requireAuth } from "../middleware/auth.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { logActivity } from "../lib/activity.js";
import { emitToOrg, emitToProject } from "../socket.js";

const router = Router();
router.use(requireAuth());

async function assertProjectAccess(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new AppError(404, "Project not found");
  const role = await prisma.organizationMember.findUnique({
    where: { orgId_userId: { orgId: project.orgId, userId } },
  });
  if (!role) throw new AppError(403, "Not a member of this organization");
  return { project, role };
}

// ---------- Board payload ----------

router.get(
  "/:projectId",
  asyncHandler(async (req: AuthedRequest, res) => {
    const project = await prisma.project.findUnique({
      where: { id: req.params.projectId },
      include: {
        workspace: { select: { id: true, name: true } },
        lead: { select: { id: true, name: true } },
        columns: {
          orderBy: { position: "asc" },
          include: {
            tasks: {
              orderBy: { position: "asc" },
              include: {
                assignee: { select: { id: true, name: true, avatarUrl: true } },
                reporter: { select: { id: true, name: true, avatarUrl: true } },
                _count: { select: { comments: true } },
              },
            },
          },
        },
      },
    });
    if (!project) throw new AppError(404, "Project not found");

    const role = await prisma.organizationMember.findUnique({
      where: { orgId_userId: { orgId: project.orgId, userId: req.user.id } },
    });
    if (!role) throw new AppError(403, "Not a member of this organization");

    const members = await prisma.organizationMember.findMany({
      where: { orgId: project.orgId },
      include: { user: { select: { id: true, name: true, avatarUrl: true, email: true } } },
    });

    res.json({ project, members, myRole: role.role });
  })
);

router.patch(
  "/:projectId",
  asyncHandler(async (req: AuthedRequest, res) => {
    const project = await prisma.project.findUnique({ where: { id: req.params.projectId } });
    if (!project) throw new AppError(404, "Project not found");
    const role = await prisma.organizationMember.findUnique({
      where: { orgId_userId: { orgId: project.orgId, userId: req.user.id } },
    });
    if (!role) throw new AppError(403, "Not a member");
    if (role.role === "MEMBER") throw new AppError(403, "No permission");

    const input = z
      .object({
        name: z.string().trim().min(2).max(80).optional(),
        description: z.string().max(400).nullable().optional(),
        color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
        status: z.enum(["PLANNED", "ACTIVE", "ON_HOLD", "COMPLETED", "ARCHIVED"]).optional(),
      })
      .parse(req.body);

    const updated = await prisma.project.update({ where: { id: project.id }, data: input });
    emitToProject(project.id, "project:updated", updated);
    emitToOrg(project.orgId, "project:updated", updated);
    res.json({ project: updated });
  })
);

router.delete(
  "/:projectId",
  asyncHandler(async (req: AuthedRequest, res) => {
    const project = await prisma.project.findUnique({ where: { id: req.params.projectId } });
    if (!project) throw new AppError(404, "Project not found");
    const role = await prisma.organizationMember.findUnique({
      where: { orgId_userId: { orgId: project.orgId, userId: req.user.id } },
    });
    if (!role || !["ADMIN", "MANAGER"].includes(role.role)) throw new AppError(403, "No permission");

    await prisma.$transaction([
      prisma.activity.deleteMany({ where: { projectId: project.id } }),
      prisma.project.delete({ where: { id: project.id } }),
    ]);
    emitToOrg(project.orgId, "project:deleted", { id: project.id });
    res.json({ ok: true });
  })
);

// ---------- Columns ----------

router.post(
  "/:projectId/columns",
  asyncHandler(async (req: AuthedRequest, res) => {
    const { project } = await assertProjectAccess(req.params.projectId, req.user.id);
    if (req.orgRole === "MEMBER") throw new AppError(403, "Members cannot modify columns");

    const { name } = z.object({ name: z.string().trim().min(1).max(40) }).parse(req.body);
    const last = await prisma.column.findFirst({
      where: { projectId: project.id },
      orderBy: { position: "desc" },
    });
    const column = await prisma.column.create({
      data: { projectId: project.id, name, position: (last?.position ?? -1) + 1 },
    });
    await logActivity({
      orgId: project.orgId,
      projectId: project.id,
      actorId: req.user.id,
      type: "column.created",
      message: `${req.user.name} added column ${name}`,
    });
    emitToProject(project.id, "column:created", column);
    res.status(201).json({ column });
  })
);

router.patch(
  "/columns/:id",
  asyncHandler(async (req: AuthedRequest, res) => {
    const column = await prisma.column.findUnique({ where: { id: req.params.id }, include: { project: true } });
    if (!column) throw new AppError(404, "Column not found");
    const { project } = await assertProjectAccess(column.projectId, req.user.id);
    if (req.orgRole === "MEMBER") throw new AppError(403, "Members cannot modify columns");

    const { name, wipLimit } = z
      .object({ name: z.string().trim().min(1).max(40).optional(), wipLimit: z.number().int().min(1).max(50).nullable().optional() })
      .parse(req.body);
    const updated = await prisma.column.update({ where: { id: column.id }, data: { name, wipLimit } });
    if (name && name !== column.name) {
      await logActivity({
        orgId: project.orgId,
        projectId: project.id,
        actorId: req.user.id,
        type: "column.renamed",
        message: `${req.user.name} renamed column to ${name}`,
      });
    }
    emitToProject(project.id, "column:updated", updated);
    res.json({ column: updated });
  })
);

router.delete(
  "/columns/:id",
  asyncHandler(async (req: AuthedRequest, res) => {
    const column = await prisma.column.findUnique({ where: { id: req.params.id }, include: { project: true } });
    if (!column) throw new AppError(404, "Column not found");
    const { project } = await assertProjectAccess(column.projectId, req.user.id);
    if (req.orgRole === "MEMBER") throw new AppError(403, "Members cannot modify columns");

    const fallback = await prisma.column.findFirst({
      where: { projectId: project.id, id: { not: column.id } },
      orderBy: { position: "asc" },
    });

    await prisma.$transaction(async (tx) => {
      await tx.task.updateMany({
        where: { columnId: column.id },
        data: { columnId: fallback?.id ?? null, position: 0 },
      });
      await tx.column.delete({ where: { id: column.id } });
    });

    await logActivity({
      orgId: project.orgId,
      projectId: project.id,
      actorId: req.user.id,
      type: "column.deleted",
      message: `${req.user.name} deleted column ${column.name}`,
    });
    emitToProject(project.id, "column:deleted", { id: column.id, fallbackColumnId: fallback?.id ?? null });
    res.json({ ok: true });
  })
);

// ---------- Task creation + reorder ----------

router.post(
  "/:projectId/tasks",
  asyncHandler(async (req: AuthedRequest, res) => {
    const { project } = await assertProjectAccess(req.params.projectId, req.user.id);
    const input = z
      .object({
        title: z.string().trim().min(1).max(200),
        columnId: z.string().nullable().optional(),
        type: z.enum(["EPIC", "STORY", "TASK", "BUG", "SUBTASK"]).default("TASK"),
        priority: z.enum(["URGENT", "HIGH", "MEDIUM", "LOW", "NONE"]).default("NONE"),
        assigneeId: z.string().nullable().optional(),
        dueDate: z.string().datetime().nullable().optional(),
        storyPoints: z.number().int().min(0).max(100).nullable().optional(),
        labels: z.array(z.string().min(1).max(30)).default([]),
      })
      .parse(req.body);

    const count = await prisma.task.count({ where: { columnId: input.columnId ?? undefined } });
    const task = await prisma.task.create({
      data: {
        projectId: project.id,
        columnId: input.columnId ?? null,
        title: input.title,
        type: input.type,
        priority: input.priority,
        assigneeId: input.assigneeId ?? null,
        reporterId: req.user.id,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        storyPoints: input.storyPoints ?? null,
        labels: JSON.stringify(input.labels ?? []),
        position: count,
      },
      include: {
        assignee: { select: { id: true, name: true, avatarUrl: true } },
        reporter: { select: { id: true, name: true } },
        _count: { select: { comments: true } },
      },
    });

    await logActivity({
      orgId: project.orgId,
      projectId: project.id,
      taskId: task.id,
      actorId: req.user.id,
      type: "task.created",
      message: `${req.user.name} created ${task.title}`,
    });
    emitToProject(project.id, "task:created", task);
    res.status(201).json({ task });
  })
);

// Full order submission per column (called after drag-and-drop)
router.post(
  "/:projectId/reorder",
  asyncHandler(async (req: AuthedRequest, res) => {
    const { project } = await assertProjectAccess(req.params.projectId, req.user.id);
    const { orders } = z
      .object({ orders: z.array(z.object({ columnId: z.string().nullable(), taskIds: z.array(z.string()) })) })
      .parse(req.body);

    const columnIds = orders.map((o) => o.columnId).filter(Boolean) as string[];
    const cols = columnIds.length
      ? await prisma.column.findMany({ where: { projectId: project.id, id: { in: columnIds } } })
      : [];
    if (cols.length !== new Set(columnIds).size) throw new AppError(400, "Invalid column in reorder");
    const doneColumnIds = new Set(cols.filter((c) => c.name.toLowerCase() === "done").map((c) => c.id));
    const now = new Date();

    await prisma.$transaction(
      orders.flatMap((o) =>
        o.taskIds.map((taskId, index) =>
          prisma.task.update({
            where: { id: taskId },
            data: {
              columnId: o.columnId,
              position: index,
              completedAt: o.columnId && doneColumnIds.has(o.columnId) ? now : null,
            },
          })
        )
      )
    );

    emitToProject(project.id, "board:reordered", { orders });
    res.json({ ok: true });
  })
);

export const projectItemRouter = router;