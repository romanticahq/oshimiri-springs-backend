import { prisma } from "../config/prisma.js";
import { hashToken } from "../utils/security.js";

const COOKIE_NAME = "oshimiri_admin_session";

function readCookie(req, name) {
  const cookies = String(req.headers.cookie || "").split(";");
  for (const cookie of cookies) {
    const [key, ...value] = cookie.trim().split("=");
    if (key === name) return decodeURIComponent(value.join("="));
  }
  return "";
}

export function adminCookieName() {
  return COOKIE_NAME;
}

export async function requireAdminSession(req, res, next) {
  try {
    const rawToken = readCookie(req, COOKIE_NAME);
    if (!rawToken) {
      return res.status(401).json({ message: "Administrator sign-in required", status: "error" });
    }

    const session = await prisma.adminSession.findUnique({
      where: { tokenHash: hashToken(rawToken) },
      include: { admin: true },
    });

    if (!session || session.expiresAt <= new Date() || !session.admin.active) {
      if (session) await prisma.adminSession.delete({ where: { id: session.id } }).catch(() => {});
      return res.status(401).json({ message: "Administrator session expired", status: "error" });
    }

    req.admin = session.admin;
    req.adminSession = session;
    next();
  } catch (error) {
    next(error);
  }
}
