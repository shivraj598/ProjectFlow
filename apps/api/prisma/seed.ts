import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("demo1234", 10);

  const existing = await prisma.user.findUnique({ where: { email: "demo@projectflow.dev" } });
  if (existing) {
    console.log("Seed already present, skipping.");
    return;
  }

  // ---- Users ----
  const demo = await prisma.user.create({
    data: { email: "demo@projectflow.dev", name: "Ava Chen", passwordHash },
  });
  const maya = await prisma.user.create({
    data: { email: "maya@nimbus.dev", name: "Maya Okafor", passwordHash },
  });
  const leo = await prisma.user.create({
    data: { email: "leo@nimbus.dev", name: "Leo Martens", passwordHash },
  });
  const ines = await prisma.user.create({
    data: { email: "ines@nimbus.dev", name: "Ines Ribeiro", passwordHash },
  });
  const ravi = await prisma.user.create({
    data: { email: "ravi@nimbus.dev", name: "Ravi Patel", passwordHash },
  });

  // ---- Organization ----
  const org = await prisma.organization.create({
    data: { name: "Nimbus Labs", slug: "nimbus-labs", ownerId: demo.id },
  });
  await prisma.organizationMember.createMany({
    data: [
      { orgId: org.id, userId: demo.id, role: "ADMIN" },
      { orgId: org.id, userId: maya.id, role: "MANAGER" },
      { orgId: org.id, userId: leo.id, role: "MANAGER" },
      { orgId: org.id, userId: ines.id, role: "MEMBER" },
      { orgId: org.id, userId: ravi.id, role: "MEMBER" },
    ],
  });

  const engineering = await prisma.workspace.create({
    data: { orgId: org.id, name: "Engineering", description: "Product engineering and platform work" },
  });
  await prisma.workspace.create({
    data: { orgId: org.id, name: "Design", description: "Design systems and product design" },
  });
  const marketing = await prisma.workspace.create({
    data: { orgId: org.id, name: "Marketing", description: "Growth, brand and content" },
  });

  // ---- Projects ----
  const mobile = await prisma.project.create({
    data: {
      orgId: org.id,
      workspaceId: engineering.id,
      name: "Mobile App",
      key: "MOB",
      color: "#5b8cff",
      description: "Cross-platform mobile client for the Nimbus platform",
      leadId: leo.id,
      status: "ACTIVE",
    },
  });
  const web = await prisma.project.create({
    data: {
      orgId: org.id,
      workspaceId: engineering.id,
      name: "Website Redesign",
      key: "WEB",
      color: "#22c55e",
      description: "Replatform the marketing site onto the new design system",
      leadId: maya.id,
      status: "ACTIVE",
    },
  });
  const api = await prisma.project.create({
    data: {
      orgId: org.id,
      workspaceId: engineering.id,
      name: "Platform API",
      key: "API",
      color: "#f59e0b",
      description: "Public API, rate limiting and developer experience",
      leadId: demo.id,
      status: "PLANNED",
    },
  });
  await prisma.project.create({
    data: {
      orgId: org.id,
      workspaceId: marketing.id,
      name: "Launch Campaign",
      key: "LAUNCH",
      color: "#ec4899",
      description: "Go-to-market for the Q3 platform release",
      leadId: ines.id,
      status: "ON_HOLD",
    },
  });

  const columnData: Record<string, string[]> = {
    [mobile.id]: ["Backlog", "To Do", "In Progress", "In Review", "Done"],
    [web.id]: ["Backlog", "To Do", "In Progress", "In Review", "Done"],
    [api.id]: ["Backlog", "To Do", "In Progress", "In Review", "Done"],
  };

  const columns: Record<string, string> = {};
  for (const [projectId, names] of Object.entries(columnData)) {
    for (let i = 0; i < names.length; i++) {
      const col = await prisma.column.create({
        data: { projectId, name: names[i], position: i },
      });
      columns[`${projectId}:${names[i]}`] = col.id;
    }
  }

  // ---- Tasks ----
  type SeedTask = {
    title: string;
    project: typeof mobile | typeof web | typeof api;
    column: string;
    type: "EPIC" | "STORY" | "TASK" | "BUG" | "SUBTASK";
    priority: "URGENT" | "HIGH" | "MEDIUM" | "LOW" | "NONE";
    assignee?: typeof demo;
    labels?: string[];
    points?: number;
    dueInDays?: number;
    description?: string;
  };

  const now = Date.now();
  const d = (days: number) => new Date(now + days * 24 * 60 * 60 * 1000);

  const seeds: SeedTask[] = [
    { title: "Build the onboarding flow", project: mobile, column: "In Progress", type: "STORY", priority: "URGENT", assignee: maya, labels: ["onboarding", "ux"], points: 5, dueInDays: 3, description: "First-run experience with workspace selection and project templates." },
    { title: "Push notifications for mentions", project: mobile, column: "To Do", type: "STORY", priority: "HIGH", assignee: leo, labels: ["notifications", "p0"], points: 8, dueInDays: 9 },
    { title: "Dark mode flickers on launch", project: mobile, column: "In Progress", type: "BUG", priority: "HIGH", assignee: ravi, labels: ["bug"], points: 3, dueInDays: 2, description: "Theme resolves after paint, causing a white flash for dark-mode users." },
    { title: "Offline queue for task edits", project: mobile, column: "Backlog", type: "TASK", priority: "MEDIUM", assignee: ines, labels: ["offline"], points: 13 },
    { title: "Add haptic feedback to drag interactions", project: mobile, column: "Backlog", type: "TASK", priority: "LOW", labels: ["polish"], points: 2 },
    { title: "Deep link to task detail", project: mobile, column: "In Review", type: "STORY", priority: "MEDIUM", assignee: leo, labels: ["navigation"], points: 3, dueInDays: 5 },

    { title: "Redesign the pricing page", project: web, column: "In Progress", type: "STORY", priority: "URGENT", assignee: ines, labels: ["pricing", "design"], points: 5, dueInDays: 4, description: "Four tiers, annual toggle, comparison table rebuilt from the new tokens." },
    { title: "Migrate the blog to the new CMS", project: web, column: "To Do", type: "TASK", priority: "MEDIUM", assignee: ravi, labels: ["cms"], points: 8, dueInDays: 12 },
    { title: "Hero section feels heavy on mobile", project: web, column: "In Progress", type: "BUG", priority: "HIGH", assignee: maya, labels: ["bug", "mobile"], points: 2, dueInDays: 2, description: "Animation bundle pushes LCP past 3s on mid-range Android." },
    { title: "Add changelog page", project: web, column: "Backlog", type: "TASK", priority: "LOW", labels: ["content"], points: 3 },
    { title: "SEO metadata across all templates", project: web, column: "Done", type: "TASK", priority: "HIGH", assignee: ines, labels: ["seo"], points: 3 },
    { title: "Set up analytics events for signups", project: web, column: "Done", type: "TASK", priority: "MEDIUM", assignee: ravi, labels: ["analytics"], points: 5 },
    { title: "Case study: engineering teams", project: web, column: "In Review", type: "STORY", priority: "MEDIUM", assignee: maya, labels: ["content"], points: 5, dueInDays: 7 },

    { title: "Design the public API key rotation", project: api, column: "Backlog", type: "STORY", priority: "HIGH", assignee: demo, labels: ["api", "security"], points: 8, dueInDays: 14 },
    { title: "Rate limit headers are inconsistent", project: api, column: "Backlog", type: "BUG", priority: "MEDIUM", labels: ["bug", "api"], points: 5 },
    { title: "Draft the API reference docs", project: api, column: "To Do", type: "TASK", priority: "MEDIUM", assignee: ines, labels: ["docs"], points: 8 },
  ];

  for (const s of seeds) {
    const colId = columns[`${s.project.id}:${s.column}`];
    await prisma.task.create({
      data: {
        projectId: s.project.id,
        columnId: colId,
        title: s.title,
        description: s.description ?? null,
        type: s.type,
        priority: s.priority,
        assigneeId: s.assignee?.id ?? null,
        reporterId: demo.id,
        dueDate: s.dueInDays ? d(s.dueInDays) : null,
        storyPoints: s.points ?? null,
        labels: JSON.stringify(s.labels ?? []),
        completedAt: s.column === "Done" ? d(-1) : null,
      },
    });
  }

  const firstTask = await prisma.task.findFirst({ where: { projectId: web.id } });
  if (firstTask) {
    await prisma.comment.create({
      data: {
        taskId: firstTask.id,
        authorId: maya.id,
        body: "Pulled this into the current cycle. The new hero illustration ships with it.",
      },
    });
    await prisma.comment.create({
      data: {
        taskId: firstTask.id,
        authorId: demo.id,
        body: "Looks good. Keep an eye on the fold on smaller screens.",
      },
    });
  }

  await prisma.activity.createMany({
    data: [
      { orgId: org.id, projectId: web.id, actorId: maya.id, type: "project.started", message: "Maya Okafor started the Website Redesign sprint" },
      { orgId: org.id, projectId: mobile.id, actorId: leo.id, type: "task.moved", message: "Leo Martens moved Deep link to task detail to In Review" },
      { orgId: org.id, projectId: mobile.id, actorId: ravi.id, type: "task.priority", message: "Ravi Patel set priority to high on Dark mode flickers on launch" },
      { orgId: org.id, projectId: web.id, actorId: ines.id, type: "task.title", message: "Ines Ribeiro renamed task to Redesign the pricing page" },
    ],
  });

  console.log("Seeded Nimbus Labs demo workspace.");
  console.log("  Login: demo@projectflow.dev / demo1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
