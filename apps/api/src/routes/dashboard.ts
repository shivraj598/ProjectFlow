import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../lib/errors.js";
import { requireAuth, requireOrgMember } from "../middleware/auth.js";
import type { AuthedRequest } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth());

router.get(
  "/:orgId/dashboard",
  requireOrgMember(),
  asyncHandler(async (req: AuthedRequest, res) => {
    const orgId = req.params.orgId;

    const [projects, tasks, members, activities, columns] = await Promise.all([
      prisma.project.findMany({
        where: { orgId },
        include: { _count: { select: { tasks: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.task.findMany({
        where: { project: { orgId } },
        include: { assignee: { select: { id: true, name: true, avatarUrl: true } } },
      }),
      prisma.organizationMember.count({ where: { orgId } }),
      prisma.activity.findMany({
        where: { orgId },
        include: {
          actor: { select: { id: true, name: true, avatarUrl: true } },
          task: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      prisma.column.findMany({
        where: { project: { orgId } },
        select: { id: true, name: true },
      }),
    ]);

    const now = new Date();
    const dayMs = 24 * 60 * 60 * 1000;
    const columnName = new Map(columns.map((c) => [c.id, c.name]));

    const completed = tasks.filter((t) => t.completedAt).length;
    const overdue = tasks.filter((t) => t.dueDate && !t.completedAt && t.dueDate < now).length;
    const dueSoon = tasks.filter((t) => t.dueDate && !t.completedAt && t.dueDate >= now && t.dueDate < new Date(now.getTime() + 3 * dayMs)).length;
    const inProgress = tasks.filter((t) => !t.completedAt && t.columnId && !["backlog", "to do", "todo", "done"].includes((columnName.get(t.columnId) ?? "").toLowerCase())).length;

    const byStatus = new Map<string, number>();
    const byPriority = new Map<string, number>();
    const byAssignee = new Map<string, { user: (typeof tasks)[number]["assignee"]; count: number }>();

    for (const t of tasks) {
      const status = t.columnId ? (columnName.get(t.columnId) ?? "Open") : "Open";
      byStatus.set(status, (byStatus.get(status) ?? 0) + 1);
      byPriority.set(t.priority, (byPriority.get(t.priority) ?? 0) + 1);
      if (t.assignee) {
        const cur = byAssignee.get(t.assigneeId!) ?? { user: t.assignee, count: 0 };
        cur.count += 1;
        byAssignee.set(t.assigneeId!, cur);
      }
    }

    // 14 day completion trend
    const trend: { date: string; created: number; completed: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayEnd = new Date(dayStart.getTime() + dayMs);
      trend.push({
        date: dayStart.toISOString().slice(0, 10),
        created: tasks.filter((t) => t.createdAt >= dayStart && t.createdAt < dayEnd).length,
        completed: tasks.filter((t) => t.completedAt && t.completedAt >= dayStart && t.completedAt < dayEnd).length,
      });
    }

    res.json({
      totals: {
        projects: projects.length,
        tasks: tasks.length,
        completed,
        overdue,
        dueSoon,
        inProgress,
        members,
        completionRate: tasks.length ? Math.round((completed / tasks.length) * 100) : 0,
      },
      byStatus: [...byStatus.entries()].map(([status, count]) => ({ status, count })),
      byPriority: [...byPriority.entries()].map(([priority, count]) => ({ priority, count })),
      byAssignee: [...byAssignee.entries()]
        .map(([, v]) => ({ user: v.user, count: v.count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8),
      trend,
      recentActivity: activities.map((a) => ({
        id: a.id,
        type: a.type,
        message: a.message,
        createdAt: a.createdAt,
        actor: a.actor,
        task: a.task,
      })),
      activeProjects: projects.slice(0, 6).map((p) => ({ id: p.id, name: p.name, key: p.key, color: p.color, status: p.status, taskCount: p._count.tasks })),
    });
  })
);

export const dashboardRouter = router;