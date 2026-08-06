import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { AppError, asyncHandler } from "../lib/errors.js";
import { requireAuth, requireOrgMember } from "../middleware/auth.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { logActivity } from "../lib/activity.js";
import { emitToProject, emitToOrg } from "../socket.js";

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

const sprintCreateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  goal: z.string().max(500).optional().nullable(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  status: z.enum(["PLANNED", "ACTIVE"]).optional(),
});

const sprintUpdateSchema = sprintCreateSchema.partial().extend({
  status: z.enum(["PLANNED", "ACTIVE", "COMPLETED", "CANCELLED"]).optional(),
});

router.get(
  "/:projectId/sprints",
  requireOrgMember(),
  asyncHandler(async (req: AuthedRequest, res) => {
    const { project } = await assertProjectAccess(req.params.projectId, req.user.id);

    const sprints = await prisma.sprint.findMany({
      where: { projectId: project.id },
      include: {
        members: { include: { user: { select: { id: true, name: true, avatarUrl: true, email: true } } } },
        _count: { select: { tasks: true } },
        tasks: {
          select: {
            id: true,
            storyPoints: true,
            completedAt: true,
            column: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const sprintsWithStats = sprints.map((s) => {
      const totalPoints = s.tasks.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);
      const completedPoints = s.tasks
        .filter((t) => t.completedAt)
        .reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);
      return {
        ...s,
        totalStoryPoints: totalPoints,
        completedStoryPoints: completedPoints,
      };
    });

    res.json({ sprints: sprintsWithStats });
  })
);

router.post(
  "/:projectId/sprints",
  requireOrgMember(),
  asyncHandler(async (req: AuthedRequest, res) => {
    const { project, role } = await assertProjectAccess(req.params.projectId, req.user.id);
    if (role.role === "MEMBER") throw new AppError(403, "Members cannot create sprints");

    const input = sprintCreateSchema.parse(req.body);

    const activeSprint = await prisma.sprint.findFirst({
      where: { projectId: project.id, status: "ACTIVE" },
    });
    if (activeSprint && (input.status === "ACTIVE" || !input.status)) {
      throw new AppError(400, "An active sprint already exists. Complete or cancel it first.");
    }

    const sprint = await prisma.sprint.create({
      data: {
        projectId: project.id,
        name: input.name,
        goal: input.goal ?? null,
        startDate: input.startDate ? new Date(input.startDate) : null,
        endDate: input.endDate ? new Date(input.endDate) : null,
        status: input.status ?? "PLANNED",
      },
      include: {
        members: { include: { user: { select: { id: true, name: true, avatarUrl: true, email: true } } } },
        _count: { select: { tasks: true } },
      },
    });

    await logActivity({
      orgId: project.orgId,
      projectId: project.id,
      actorId: req.user.id,
      type: "sprint.created",
      message: `${req.user.name} created sprint ${sprint.name}`,
    });
    emitToProject(project.id, "sprint:created", sprint);
    res.status(201).json({ sprint });
  })
);

router.patch(
  "/:projectId/sprints/:sprintId",
  requireOrgMember(),
  asyncHandler(async (req: AuthedRequest, res) => {
    const { project, role } = await assertProjectAccess(req.params.projectId, req.user.id);
    if (role.role === "MEMBER") throw new AppError(403, "Members cannot update sprints");

    const sprint = await prisma.sprint.findUnique({ where: { id: req.params.sprintId } });
    if (!sprint || sprint.projectId !== project.id) throw new AppError(404, "Sprint not found");

    const input = sprintUpdateSchema.parse(req.body);

    if (input.status === "ACTIVE" && sprint.status !== "ACTIVE") {
      const otherActive = await prisma.sprint.findFirst({
        where: { projectId: project.id, status: "ACTIVE", id: { not: sprint.id } },
      });
      if (otherActive) throw new AppError(400, "Another sprint is already active");
    }

    const data: Record<string, unknown> = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.goal !== undefined) data.goal = input.goal;
    if (input.startDate !== undefined) data.startDate = input.startDate ? new Date(input.startDate) : null;
    if (input.endDate !== undefined) data.endDate = input.endDate ? new Date(input.endDate) : null;
    if (input.status !== undefined) data.status = input.status;

    if (input.status === "COMPLETED" && sprint.status !== "COMPLETED") {
      data.completedAt = new Date();
    }
    if (input.status === "ACTIVE" && sprint.status !== "ACTIVE") {
      data.startDate = data.startDate ?? new Date();
    }

    const updated = await prisma.sprint.update({
      where: { id: sprint.id },
      data,
      include: {
        members: { include: { user: { select: { id: true, name: true, avatarUrl: true, email: true } } } },
        _count: { select: { tasks: true } },
        tasks: {
          select: {
            id: true,
            storyPoints: true,
            completedAt: true,
            column: { select: { name: true } },
          },
        },
      },
    });

    const totalPoints = updated.tasks.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);
    const completedPoints = updated.tasks
      .filter((t) => t.completedAt)
      .reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);

    if (input.status && input.status !== sprint.status) {
      await logActivity({
        orgId: project.orgId,
        projectId: project.id,
        actorId: req.user.id,
        type: `sprint.${input.status.toLowerCase()}`,
        message: `${req.user.name} ${input.status === "ACTIVE" ? "started" : input.status === "COMPLETED" ? "completed" : "cancelled"} sprint ${sprint.name}`,
      });
      emitToProject(project.id, `sprint:${input.status.toLowerCase()}`, updated);
    }

    emitToProject(project.id, "sprint:updated", { ...updated, totalStoryPoints: totalPoints, completedStoryPoints: completedPoints });
    emitToOrg(project.orgId, "sprint:updated", { ...updated, totalStoryPoints: totalPoints, completedStoryPoints: completedPoints });

    res.json({ sprint: { ...updated, totalStoryPoints: totalPoints, completedStoryPoints: completedPoints } });
  })
);

router.delete(
  "/:projectId/sprints/:sprintId",
  requireOrgMember(),
  asyncHandler(async (req: AuthedRequest, res) => {
    const { project, role } = await assertProjectAccess(req.params.projectId, req.user.id);
    if (role.role === "MEMBER") throw new AppError(403, "Members cannot delete sprints");

    const sprint = await prisma.sprint.findUnique({ where: { id: req.params.sprintId } });
    if (!sprint || sprint.projectId !== project.id) throw new AppError(404, "Sprint not found");
    if (sprint.status === "ACTIVE") throw new AppError(400, "Cannot delete an active sprint. Complete or cancel it first.");

    await prisma.$transaction([
      prisma.sprintMember.deleteMany({ where: { sprintId: sprint.id } }),
      prisma.task.updateMany({ where: { sprintId: sprint.id }, data: { sprintId: null } }),
      prisma.sprint.delete({ where: { id: sprint.id } }),
    ]);

    await logActivity({
      orgId: project.orgId,
      projectId: project.id,
      actorId: req.user.id,
      type: "sprint.deleted",
      message: `${req.user.name} deleted sprint ${sprint.name}`,
    });
    emitToProject(project.id, "sprint:deleted", { id: sprint.id });
    emitToOrg(project.orgId, "sprint:deleted", { id: sprint.id });
    res.json({ ok: true });
  })
);

router.post(
  "/:projectId/sprints/:sprintId/tasks",
  requireOrgMember(),
  asyncHandler(async (req: AuthedRequest, res) => {
    const { project, role } = await assertProjectAccess(req.params.projectId, req.user.id);
    if (role.role === "MEMBER") throw new AppError(403, "Members cannot modify sprint tasks");

    const sprint = await prisma.sprint.findUnique({ where: { id: req.params.sprintId } });
    if (!sprint || sprint.projectId !== project.id) throw new AppError(404, "Sprint not found");

    const { taskIds } = z.object({ taskIds: z.array(z.string()).min(1) }).parse(req.body);

    const tasks = await prisma.task.findMany({
      where: { id: { in: taskIds }, projectId: project.id },
    });
    if (tasks.length !== taskIds.length) throw new AppError(400, "Some tasks not found or not in this project");

    await prisma.task.updateMany({
      where: { id: { in: taskIds } },
      data: { sprintId: sprint.id },
    });

    await logActivity({
      orgId: project.orgId,
      projectId: project.id,
      actorId: req.user.id,
      type: "sprint.tasks_added",
      message: `${req.user.name} added ${taskIds.length} task(s) to sprint ${sprint.name}`,
    });
    emitToProject(project.id, "sprint:tasks_added", { sprintId: sprint.id, taskIds });
    res.json({ ok: true });
  })
);

router.delete(
  "/:projectId/sprints/:sprintId/tasks/:taskId",
  requireOrgMember(),
  asyncHandler(async (req: AuthedRequest, res) => {
    const { project, role } = await assertProjectAccess(req.params.projectId, req.user.id);
    if (role.role === "MEMBER") throw new AppError(403, "Members cannot modify sprint tasks");

    const sprint = await prisma.sprint.findUnique({ where: { id: req.params.sprintId } });
    if (!sprint || sprint.projectId !== project.id) throw new AppError(404, "Sprint not found");

    const task = await prisma.task.findUnique({ where: { id: req.params.taskId } });
    if (!task || task.projectId !== project.id || task.sprintId !== sprint.id) {
      throw new AppError(404, "Task not found in this sprint");
    }

    await prisma.task.update({
      where: { id: task.id },
      data: { sprintId: null },
    });

    await logActivity({
      orgId: project.orgId,
      projectId: project.id,
      actorId: req.user.id,
      type: "sprint.task_removed",
      message: `${req.user.name} removed task from sprint ${sprint.name}`,
    });
    emitToProject(project.id, "sprint:task_removed", { sprintId: sprint.id, taskId: task.id });
    res.json({ ok: true });
  })
);

router.post(
  "/:projectId/sprints/:sprintId/members",
  requireOrgMember(),
  asyncHandler(async (req: AuthedRequest, res) => {
    const { project, role } = await assertProjectAccess(req.params.projectId, req.user.id);
    if (role.role === "MEMBER") throw new AppError(403, "Members cannot manage sprint members");

    const sprint = await prisma.sprint.findUnique({ where: { id: req.params.sprintId } });
    if (!sprint || sprint.projectId !== project.id) throw new AppError(404, "Sprint not found");

    const { userIds } = z.object({ userIds: z.array(z.string()).min(1) }).parse(req.body);

    const orgMembers = await prisma.organizationMember.findMany({
      where: { orgId: project.orgId, userId: { in: userIds } },
      select: { userId: true },
    });
    const validUserIds = orgMembers.map((m) => m.userId);

    const existing = await prisma.sprintMember.findMany({
      where: { sprintId: sprint.id, userId: { in: validUserIds } },
      select: { userId: true },
    });
    const existingSet = new Set(existing.map((e) => e.userId));
    const toAdd = validUserIds.filter((userId) => !existingSet.has(userId));

    if (toAdd.length > 0) {
      await prisma.sprintMember.createMany({
        data: toAdd.map((userId) => ({ sprintId: sprint.id, userId })),
      });
    }

    const members = await prisma.sprintMember.findMany({
      where: { sprintId: sprint.id },
      include: { user: { select: { id: true, name: true, avatarUrl: true, email: true } } },
    });

    emitToProject(project.id, "sprint:members_updated", { sprintId: sprint.id, members });
    res.json({ members });
  })
);

router.delete(
  "/:projectId/sprints/:sprintId/members/:userId",
  requireOrgMember(),
  asyncHandler(async (req: AuthedRequest, res) => {
    const { project, role } = await assertProjectAccess(req.params.projectId, req.user.id);
    if (role.role === "MEMBER") throw new AppError(403, "Members cannot manage sprint members");

    const sprint = await prisma.sprint.findUnique({ where: { id: req.params.sprintId } });
    if (!sprint || sprint.projectId !== project.id) throw new AppError(404, "Sprint not found");

    await prisma.sprintMember.deleteMany({
      where: { sprintId: sprint.id, userId: req.params.userId },
    });

    const members = await prisma.sprintMember.findMany({
      where: { sprintId: sprint.id },
      include: { user: { select: { id: true, name: true, avatarUrl: true, email: true } } },
    });

    emitToProject(project.id, "sprint:members_updated", { sprintId: sprint.id, members });
    res.json({ members });
  })
);

router.get(
  "/:projectId/sprints/:sprintId/burndown",
  requireOrgMember(),
  asyncHandler(async (req: AuthedRequest, res) => {
    const { project } = await assertProjectAccess(req.params.projectId, req.user.id);

    const sprint = await prisma.sprint.findUnique({
      where: { id: req.params.sprintId },
      include: {
        tasks: {
          select: {
            id: true,
            storyPoints: true,
            completedAt: true,
            createdAt: true,
            column: { select: { name: true } },
          },
        },
      },
    });
    if (!sprint || sprint.projectId !== project.id) throw new AppError(404, "Sprint not found");

    const totalPoints = sprint.tasks.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);
    const start = sprint.startDate ? new Date(sprint.startDate) : new Date(sprint.createdAt);
    const end = sprint.endDate ? new Date(sprint.endDate) : new Date(start.getTime() + 14 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const effectiveEnd = sprint.status === "COMPLETED" ? end : (now < end ? now : end);

    const dayMs = 24 * 60 * 60 * 1000;
    const days = Math.max(1, Math.ceil((effectiveEnd.getTime() - start.getTime()) / dayMs));
    const idealStep = days > 0 ? totalPoints / days : totalPoints;

    const burndown: { date: string; ideal: number; actual: number }[] = [];
    for (let i = 0; i <= days; i++) {
      const dayStart = new Date(start.getTime() + i * dayMs);
      const dayEnd = new Date(dayStart.getTime() + dayMs);
      const completedByDay = sprint.tasks
        .filter((t) => t.completedAt && t.completedAt < dayEnd)
        .reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);
      burndown.push({
        date: dayStart.toISOString().slice(0, 10),
        ideal: Math.max(0, Math.round(totalPoints - idealStep * i)),
        actual: totalPoints - completedByDay,
      });
    }

    res.json({ burndown, totalPoints, sprintStart: start.toISOString().slice(0, 10), sprintEnd: end.toISOString().slice(0, 10) });
  })
);

export const sprintsRouter = router;