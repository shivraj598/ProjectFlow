import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { Role, User } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { verifyAccessToken } from "../lib/jwt.js";
import { AppError } from "../lib/errors.js";

export interface AuthedRequest extends Request {
  user: User;
  orgRole?: Role;
}

export function loadUser(req: AuthedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw new AppError(401, "Authentication required");

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw new AppError(401, "Session expired, please sign in again");
  }

  prisma.user
    .findUnique({ where: { id: payload.sub } })
    .then((user) => {
      if (!user) throw new AppError(401, "Account no longer exists");
      req.user = user;
      next();
    })
    .catch(next);
}

export function requireAuth(): RequestHandler {
  return loadUser as RequestHandler;
}

export async function getOrgRole(userId: string, orgId: string): Promise<Role | null> {
  const membership = await prisma.organizationMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
  });
  return membership?.role ?? null;
}

export function requireOrgMember(orgIdParam = "orgId"): RequestHandler {
  return async (req: AuthedRequest, _res, next) => {
    const orgId = req.params[orgIdParam];
    if (!orgId) throw new AppError(400, "Organization id is required");
    const role = await getOrgRole(req.user.id, orgId);
    if (!role) throw new AppError(403, "You are not a member of this organization");
    req.orgRole = role;
    next();
  };
}

export function requireOrgRole(roles: Role[]): RequestHandler {
  return (req: AuthedRequest, _res, next) => {
    if (!req.orgRole || !roles.includes(req.orgRole)) {
      throw new AppError(403, "You do not have permission to perform this action");
    }
    next();
  };
}