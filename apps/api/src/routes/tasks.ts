import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { AppError, asyncHandler } from "../lib/errors.js";
import { requireAuth } from "../middleware/auth.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { logActivity } from "../lib/activity.js";
import { emitToProject } from "../socket.js";

const router = Router();
router.use(requireAuth());

const taskInclude = {
  assignee: { select: { id: true, name: true, avatarUrl: true } },
  reporter: { select: { id: true, name: true, avatarUrl: true } },
  _count: { select: { comments: true } },
} as const;

async function assertProjectAccess(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new AppError(404, "Project not found");
  const role = await prisma.organizationMember.findUnique({
    where: { orgId_userId: { orgId: project.orgId, userId } },
  });
  if (!role) throw new AppError(403, "Not a member of this organization");
  return { project, role };
}

const taskPatchSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().max(4000).nullable().optional(),
  type: z.enum(["EPIC", "STORY", "TASK", "BUG", "SUBTASK"]).optional(),
  priority: z.enum(["URGENT", "HIGH", "MEDIUM", "LOW", "NONE"]).optional(),
  assigneeId: z.string().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  storyPoints: z.number().int().min(0).max(100).nullable().optional(),
  labels: z.array(z.string().min(1).max(30)).optional(),
});

router.get(
  "/:id",
  asyncHandler(async (req: AuthedRequest, res) => {
    const task = await prisma.task.findUnique({ where: { id: req.params.id }, include: taskInclude });
    if (!task) throw new AppError(404, "Task not found");
    const project = await prisma.project.findUnique({ where: { id: task.projectId } });
    const membership = await prisma.organizationMember.findUnique({
      where: { orgId_userId: { orgId: project!.orgId, userId: req.user.id } },
    });
    if (!membership) throw new AppError(403, "Not a member");
    res.json({ task });
  })
);

// GET /api/tasks/:id/activity — task activity timeline
router.get(
  "/:id/activity",
  asyncHandler(async (req: AuthedRequest, res) => {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: { project: { select: { orgId: true } } },
    });
    if (!task) throw new AppError(404, "Task not found");
    const membership = await prisma.organizationMember.findUnique({
      where: { orgId_userId: { orgId: task.project.orgId, userId: req.user.id } },
    });
    if (!membership) throw new AppError(403, "Not a member");

    const activities = await prisma.activity.findMany({
      where: { taskId: task.id },
      include: { actor: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    res.json({
      activities: activities.map((a) => ({
        id: a.id,
        type: a.type,
        message: a.message,
        createdAt: a.createdAt,
        actor: a.actor,
      })),
    });
  })
);

router.patch(
  "/:id",
  asyncHandler(async (req: AuthedRequest, res) => {
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!task) throw new AppError(404, "Task not found");
    const { project } = await assertProjectAccess(task.projectId, req.user.id);
    if (req.orgRole === "MEMBER" && task.assigneeId !== req.user.id && task.reporterId !== req.user.id) {
      if (req.body.title || req.body.assigneeId || req.body.priority) {
        throw new AppError(403, "Members can only edit tasks assigned to them");
      }
    }

    const input = taskPatchSchema.parse(req.body);
    const data: Record<string, unknown> = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description === "" ? null : input.description;
    if (input.type !== undefined) data.type = input.type;
    if (input.priority !== undefined) data.priority = input.priority;
    if (input.assigneeId !== undefined) data.assigneeId = input.assigneeId;
    if (input.dueDate !== undefined) data.dueDate = input.dueDate ? new Date(input.dueDate) : null;
    if (input.storyPoints !== undefined) data.storyPoints = input.storyPoints;
    if (input.labels !== undefined) data.labels = JSON.stringify(input.labels);

    const updated = await prisma.task.update({
      where: { id: task.id },
      data,
      include: taskInclude,
    });

    const events: Array<() => Promise<unknown>> = [];
    if (input.title !== undefined && input.title !== task.title)
      events.push(() =>
        logActivity({ orgId: project.orgId, projectId: project.id, taskId: task.id, actorId: req.user.id, type: "task.title", message: `${req.user.name} renamed task to "${input.title}"` })
      );
    if (input.priority !== undefined && input.priority !== task.priority)
      events.push(() =>
        logActivity({ orgId: project.orgId, projectId: project.id, taskId: task.id, actorId: req.user.id, type: "task.priority", message: `${req.user.name} set priority to ${input.priority!.toLowerCase()}` })
      );
    if (input.assigneeId !== undefined && input.assigneeId !== task.assigneeId) {
      if (input.assigneeId) {
        const a = await prisma.user.findUnique({ where: { id: input.assigneeId } });
        events.push(() =>
          logActivity({ orgId: project.orgId, projectId: project.id, taskId: task.id, actorId: req.user.id, type: "task.assignee", message: `${req.user.name} assigned task to ${a?.name ?? "someone"}` })
        );
      } else {
        events.push(() =>
          logActivity({ orgId: project.orgId, projectId: project.id, taskId: task.id, actorId: req.user.id, type: "task.assignee", message: `${req.user.name} unassigned the task` })
        );
      }
    }
    if (input.dueDate !== undefined && (input.dueDate ? task.dueDate?.toISOString() : null) !== (input.dueDate ?? null))
      events.push(() =>
        logActivity({ orgId: project.orgId, projectId: project.id, taskId: task.id, actorId: req.user.id, type: "task.due", message: `${req.user.name} updated the due date` })
      );

    await Promise.all(events);
    emitToProject(project.id, "task:updated", updated);
    res.json({ task: updated });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req: AuthedRequest, res) => {
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!task) throw new AppError(404, "Task not found");
    const { project } = await assertProjectAccess(task.projectId, req.user.id);
    if (req.orgRole === "MEMBER" && task.assigneeId !== req.user.id)
      throw new AppError(403, "Members can only delete tasks assigned to them");

    await prisma.$transaction([
      prisma.comment.deleteMany({ where: { taskId: task.id } }),
      prisma.activity.deleteMany({ where: { taskId: task.id } }),
      prisma.task.delete({ where: { id: task.id } }),
    ]);
    await logActivity({
      orgId: project.orgId,
      projectId: project.id,
      actorId: req.user.id,
      type: "task.deleted",
      message: `${req.user.name} deleted ${task.title}`,
    });
    emitToProject(project.id, "task:deleted", { id: task.id });
    res.json({ ok: true });
  })
);

export const taskItemRouter = router;