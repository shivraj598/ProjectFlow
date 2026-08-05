import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { AppError, asyncHandler } from "../lib/errors.js";
import { requireAuth, requireOrgMember, requireOrgRole } from "../middleware/auth.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { logActivity } from "../lib/activity.js";
import { emitToOrg } from "../socket.js";

const router = Router();

function slugify(name: string): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return `${base}-${Math.random().toString(36).slice(2, 7)}`;
}

router.use(requireAuth());

router.get(
  "/",
  asyncHandler(async (req: AuthedRequest, res) => {
    const memberships = await prisma.organizationMember.findMany({
      where: { userId: req.user.id },
      include: {
        org: {
          include: {
            workspaces: { select: { id: true, name: true } },
            _count: { select: { members: true, projects: true } },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });
    res.json({
      orgs: memberships.map((m) => ({
        ...m.org,
        role: m.role,
      })),
    });
  })
);

router.post(
  "/",
  asyncHandler(async (req: AuthedRequest, res) => {
    const { name } = z.object({ name: z.string().trim().min(2).max(60) }).parse(req.body);

    const org = await prisma.$transaction(async (tx) => {
      const created = await tx.organization.create({
        data: { name, slug: slugify(name), ownerId: req.user.id },
      });
      await tx.organizationMember.create({
        data: { orgId: created.id, userId: req.user.id, role: "ADMIN" },
      });
      // default workspace so new projects have a home
      await tx.workspace.create({ data: { orgId: created.id, name: "General" } });
      return created;
    });

    await logActivity({
      orgId: org.id,
      actorId: req.user.id,
      type: "org.created",
      message: `${req.user.name} created ${org.name}`,
    });

    const full = await prisma.organization.findUnique({
      where: { id: org.id },
      include: {
        workspaces: { select: { id: true, name: true } },
        _count: { select: { members: true, projects: true } },
      },
    });
    res.status(201).json({ org: { ...full, role: "ADMIN" as const } });
  })
);

router.get(
  "/:orgId",
  requireOrgMember(),
  asyncHandler(async (req: AuthedRequest, res) => {
    const org = await prisma.organization.findUnique({
      where: { id: req.params.orgId },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } } },
        workspaces: {
          include: { projects: { select: { id: true, name: true, key: true, color: true, status: true } } },
          orderBy: { createdAt: "asc" },
        },
        _count: { select: { projects: true } },
      },
    });
    if (!org) throw new AppError(404, "Organization not found");
    res.json({ org });
  })
);

router.patch(
  "/:orgId",
  requireOrgMember(),
  requireOrgRole(["ADMIN"]),
  asyncHandler(async (req: AuthedRequest, res) => {
    const { name } = z.object({ name: z.string().trim().min(2).max(60) }).parse(req.body);
    const org = await prisma.organization.update({
      where: { id: req.params.orgId },
      data: { name },
    });
    emitToOrg(org.id, "org:updated", org);
    res.json({ org });
  })
);

router.get(
  "/:orgId/members",
  requireOrgMember(),
  asyncHandler(async (req: AuthedRequest, res) => {
    const members = await prisma.organizationMember.findMany({
      where: { orgId: req.params.orgId },
      include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
      orderBy: { createdAt: "asc" },
    });
    res.json({
      members: members.map((m) => ({ id: m.id, role: m.role, createdAt: m.createdAt, user: m.user })),
    });
  })
);

router.post(
  "/:orgId/invites",
  requireOrgMember(),
  requireOrgRole(["ADMIN", "MANAGER"]),
  asyncHandler(async (req: AuthedRequest, res) => {
    const { email, role } = z
      .object({ email: z.string().trim().email(), role: z.enum(["ADMIN", "MANAGER", "MEMBER"]).default("MEMBER") })
      .parse(req.body);
    const orgId = req.params.orgId;

    const existingMember = await prisma.organizationMember.findUnique({
      where: { orgId_userId: { orgId, userId: req.user.id } },
    });

    const target = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    let member;
    if (target) {
      const dup = await prisma.organizationMember.findUnique({
        where: { orgId_userId: { orgId, userId: target.id } },
      });
      if (dup) throw new AppError(409, "That user is already a member");
      member = await prisma.organizationMember.create({
        data: { orgId, userId: target.id, role },
        include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
      });
    } else {
      const invite = await prisma.invite.create({
        data: { orgId, email: email.toLowerCase(), role, token: `inv_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}` },
      });
      void existingMember;
      return res.status(201).json({ invite: { id: invite.id, email: invite.email, role, status: invite.status } });
    }

    await logActivity({
      orgId,
      actorId: req.user.id,
      type: "member.added",
      message: `${req.user.name} invited ${target.name} as ${role.toLowerCase()}`,
    });
    emitToOrg(orgId, "member:added", member);
    res.status(201).json({ member });
  })
);

router.delete(
  "/:orgId/members/:memberId",
  requireOrgMember(),
  requireOrgRole(["ADMIN"]),
  asyncHandler(async (req: AuthedRequest, res) => {
    const orgId = req.params.orgId;
    const member = await prisma.organizationMember.findUnique({ where: { id: req.params.memberId } });
    if (!member || member.orgId !== orgId) throw new AppError(404, "Member not found");
    if (member.userId === req.user.id) throw new AppError(400, "You cannot remove yourself");

    await prisma.$transaction([
      prisma.organizationMember.delete({ where: { id: member.id } }),
      prisma.task.updateMany({ where: { assigneeId: member.userId }, data: { assigneeId: null } }),
    ]);
    await logActivity({
      orgId,
      actorId: req.user.id,
      type: "member.removed",
      message: `${req.user.name} removed a member`,
    });
    emitToOrg(orgId, "member:removed", { memberId: member.id });
    res.json({ ok: true });
  })
);

export const orgsRouter = router;