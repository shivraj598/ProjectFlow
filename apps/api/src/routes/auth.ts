import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/jwt.js";
import { AppError, asyncHandler } from "../lib/errors.js";
import { requireAuth } from "../middleware/auth.js";
import type { AuthedRequest } from "../middleware/auth.js";

const router = Router();

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
});

async function issueTokens(user: { id: string; email: string; name: string }) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user.id);
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
  return { accessToken, refreshToken };
}

function publicUser(user: { id: string; email: string; name: string; avatarUrl: string | null }) {
  return { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl };
}

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const input = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
    if (existing) throw new AppError(409, "An account with this email already exists");

    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        name: input.name,
        passwordHash: await hashPassword(input.password),
      },
    });

    const tokens = await issueTokens(user);
    res.status(201).json({ user: publicUser(user), ...tokens });
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const input = registerSchema.pick({ email: true, password: true }).parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
    if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
      throw new AppError(401, "Invalid email or password");
    }
    const tokens = await issueTokens(user);
    res.json({ user: publicUser(user), ...tokens });
  })
);

router.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const { refreshToken } = z.object({ refreshToken: z.string() }).parse(req.body);
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError(401, "Invalid refresh token");
    }
    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new AppError(401, "Invalid refresh token");
    }
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new AppError(401, "Account no longer exists");

    // rotate
    await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });
    const tokens = await issueTokens(user);
    res.json({ user: publicUser(user), ...tokens });
  })
);

router.post(
  "/logout",
  asyncHandler(async (req, res) => {
    const { refreshToken } = z.object({ refreshToken: z.string() }).parse(req.body);
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    res.json({ ok: true });
  })
);

router.get(
  "/me",
  requireAuth(),
  asyncHandler(async (req: AuthedRequest, res) => {
    res.json({ user: publicUser(req.user) });
  })
);

router.patch(
  "/me",
  requireAuth(),
  asyncHandler(async (req: AuthedRequest, res) => {
    const input = z
      .object({ name: z.string().trim().min(2).max(60).optional(), avatarUrl: z.string().url().nullable().optional() })
      .parse(req.body);
    const user = await prisma.user.update({ where: { id: req.user.id }, data: input });
    res.json({ user: publicUser(user) });
  })
);

export const authRouter = router;
