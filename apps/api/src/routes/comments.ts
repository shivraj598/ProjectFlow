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

router.get(
  "/:taskId/comments",
  asyncHandler(async (req: AuthedRequest, res) => {
    const task = await prisma.task.findUnique({
      where: { id: req.params.taskId },
      include: { project: { select: { id: true, orgId: true } } },
    });
    if (!task) throw new AppError(404, "Task not found");
    const membership = await prisma.organizationMember.findUnique({
      where: { orgId_userId: { orgId: task.project.orgId, userId: req.user.id } },
    });
    if (!membership) throw new AppError(403, "Not a member");

    const comments = await prisma.comment.findMany({
      where: { taskId: task.id },
      include: { author: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: "asc" },
    });
    res.json({ comments });
  })
);

router.post(
  "/:taskId/comments",
  asyncHandler(async (req: AuthedRequest, res) => {
    const task = await prisma.task.findUnique({
      where: { id: req.params.taskId },
      include: { project: { select: { id: true, orgId: true } } },
    });
    if (!task) throw new AppError(404, "Task not found");
    const membership = await prisma.organizationMember.findUnique({
      where: { orgId_userId: { orgId: task.project.orgId, userId: req.user.id } },
    });
    if (!membership) throw new AppError(403, "Not a member");

    const { body } = z.object({ body: z.string().trim().min(1).max(4000) }).parse(req.body);
    const comment = await prisma.comment.create({
      data: { taskId: task.id, authorId: req.user.id, body },
      include: { author: { select: { id: true, name: true, avatarUrl: true } } },
    });
    await logActivity({
      orgId: task.project.orgId,
      projectId: task.projectId,
      taskId: task.id,
      actorId: req.user.id,
      type: "comment.added",
      message: `${req.user.name} commented on ${task.title}`,
    });
    emitToProject(task.projectId, "comment:added", comment);
    res.status(201).json({ comment });
  })
);

router.patch(
  "/:id",
  asyncHandler(async (req: AuthedRequest, res) => {
    const comment = await prisma.comment.findUnique({ where: { id: req.params.id } });
    if (!comment) throw new AppError(404, "Comment not found");
    if (comment.authorId !== req.user.id) throw new AppError(403, "You can only edit your own comments");

    const { body } = z.object({ body: z.string().trim().min(1).max(4000) }).parse(req.body);
    const updated = await prisma.comment.update({
      where: { id: comment.id },
      data: { body },
      include: { author: { select: { id: true, name: true, avatarUrl: true } } },
    });
    const task = await prisma.task.findUnique({ where: { id: updated.taskId }, select: { projectId: true } });
    if (task) emitToProject(task.projectId, "comment:updated", updated);
    res.json({ comment: updated });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req: AuthedRequest, res) => {
    const comment = await prisma.comment.findUnique({ where: { id: req.params.id } });
    if (!comment) throw new AppError(404, "Comment not found");
    if (comment.authorId !== req.user.id) throw new AppError(403, "You can only delete your own comments");
    await prisma.comment.delete({ where: { id: comment.id } });
    const task = await prisma.task.findUnique({ where: { id: comment.taskId }, select: { projectId: true } });
    if (task) emitToProject(task.projectId, "comment:deleted", { id: comment.id });
    res.json({ ok: true });
  })
);

export const commentsRouter = router;