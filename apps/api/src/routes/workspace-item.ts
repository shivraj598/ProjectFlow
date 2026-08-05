import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { AppError, asyncHandler } from "../lib/errors.js";
import { requireAuth } from "../middleware/auth.js";
import type { AuthedRequest } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth());

router.patch(
  "/:id",
  asyncHandler(async (req: AuthedRequest, res) => {
    const ws = await prisma.workspace.findUnique({ where: { id: req.params.id } });
    if (!ws) throw new AppError(404, "Workspace not found");
    const role = await prisma.organizationMember.findUnique({
      where: { orgId_userId: { orgId: ws.orgId, userId: req.user.id } },
    });
    if (!role) throw new AppError(403, "Not a member");
    if (role.role === "MEMBER") throw new AppError(403, "No permission");

    const { name, description } = z
      .object({ name: z.string().trim().min(2).max(60).optional(), description: z.string().max(200).nullable().optional() })
      .parse(req.body);
    const updated = await prisma.workspace.update({
      where: { id: ws.id },
      data: { name, description },
      include: { _count: { select: { projects: true } } },
    });
    res.json({ workspace: updated });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req: AuthedRequest, res) => {
    const ws = await prisma.workspace.findUnique({ where: { id: req.params.id } });
    if (!ws) throw new AppError(404, "Workspace not found");
    const role = await prisma.organizationMember.findUnique({
      where: { orgId_userId: { orgId: ws.orgId, userId: req.user.id } },
    });
    if (!role || role.role !== "ADMIN") throw new AppError(403, "No permission");

    await prisma.$transaction([
      prisma.task.updateMany({ where: { project: { workspaceId: ws.id } }, data: { columnId: null } }),
      prisma.column.deleteMany({ where: { project: { workspaceId: ws.id } } }),
      prisma.project.deleteMany({ where: { workspaceId: ws.id } }),
      prisma.workspace.delete({ where: { id: ws.id } }),
    ]);
    res.json({ ok: true });
  })
);

export const workspaceItemRouter = router;