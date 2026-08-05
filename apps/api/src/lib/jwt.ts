import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_SECRET ?? "dev-access-secret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? "dev-refresh-secret";

export interface AccessPayload {
  sub: string;
  email: string;
  name: string;
}

export function signAccessToken(user: { id: string; email: string; name: string }): string {
  return jwt.sign(
    { sub: user.id, email: user.email, name: user.name },
    ACCESS_SECRET,
    { expiresIn: "30m" }
  );
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId }, REFRESH_SECRET, { expiresIn: "30d" });
}

export function verifyAccessToken(token: string): AccessPayload {
  return jwt.verify(token, ACCESS_SECRET) as AccessPayload;
}

export function verifyRefreshToken(token: string): { sub: string } {
  return jwt.verify(token, REFRESH_SECRET) as { sub: string };
}
