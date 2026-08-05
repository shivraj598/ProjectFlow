import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../lib/errors.js";
import { requireAuth, requireOrgMember, requireOrgRole } from "../middleware/auth.js";
import type { AuthedRequest } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth());

router.get(
  "/:orgId/workspaces",
  requireOrgMember(),
  asyncHandler(async (req: AuthedRequest, res) => {
    const workspaces = await prisma.workspace.findMany({
      where: { orgId: req.params.orgId },
      include: { _count: { select: { projects: true } } },
      orderBy: { createdAt: "asc" },
    });
    res.json({ workspaces });
  })
);

router.post(
  "/:orgId/workspaces",
  requireOrgMember(),
  requireOrgRole(["ADMIN", "MANAGER"]),
  asyncHandler(async (req: AuthedRequest, res) => {
    const { name, description } = z
      .object({ name: z.string().trim().min(2).max(60), description: z.string().max(200).optional() })
      .parse(req.body);
    const ws = await prisma.workspace.create({
      data: { orgId: req.params.orgId, name, description },
      include: { _count: { select: { projects: true } } },
    });
    res.status(201).json({ workspace: ws });
  })
);

export const workspacesRouter = router;