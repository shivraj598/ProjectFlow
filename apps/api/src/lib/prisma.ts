import { PrismaClient } from "@prisma/client";

const IS_WORKER = typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers";

async function createPrisma(): Promise<PrismaClient> {
  if (IS_WORKER) {
    const [{ PrismaD1 }, { env }] = await Promise.all([
      import("@prisma/adapter-d1"),
      import("cloudflare:workers"),
    ]);
    return new PrismaClient({ adapter: new PrismaD1(env.DB as never) });
  }
  return new PrismaClient();
}

export const prisma: PrismaClient = await createPrisma();