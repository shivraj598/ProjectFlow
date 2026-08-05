import { prisma } from "./prisma.js";

interface ActivityInput {
  orgId?: string | null;
  projectId?: string | null;
  taskId?: string | null;
  actorId?: string | null;
  type: string;
  message: string;
  data?: Record<string, unknown>;
}

export async function logActivity(input: ActivityInput) {
  return prisma.activity.create({
    data: {
      orgId: input.orgId ?? null,
      projectId: input.projectId ?? null,
      taskId: input.taskId ?? null,
      actorId: input.actorId ?? null,
      type: input.type,
      message: input.message,
      data: input.data ? JSON.stringify(input.data) : null,
    },
  });
}
