import { prisma } from "../config/prisma.js";
import { adminCookieName } from "../middleware/admin-session.middleware.js";
import { createOpaqueToken, hashToken, verifyPassword } from "../utils/security.js";
import { recordAudit } from "../services/audit.js";

const SESSION_HOURS = Number(process.env.ADMIN_SESSION_HOURS || 8);

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_HOURS * 60 * 60 * 1000,
    path: "/api",
  };
}

export async function loginAdmin(req, res, next) {
  try {
    const username = String(req.body?.username || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    if (!username || password.length < 12) {
      return res.status(400).json({ message: "Valid credentials are required", status: "error" });
    }

    const admin = await prisma.adminUser.findUnique({ where: { username } });
    if (!admin || !admin.active || !(await verifyPassword(password, admin.passwordHash))) {
      return res.status(401).json({ message: "Invalid administrator credentials", status: "error" });
    }

    const token = createOpaqueToken();
    const expiresAt = new Date(Date.now() + SESSION_HOURS * 60 * 60 * 1000);
    await prisma.$transaction([
      prisma.adminSession.create({
        data: {
          tokenHash: hashToken(token),
          expiresAt,
          userAgent: String(req.headers["user-agent"] || "").slice(0, 500),
          ipAddress: req.ip || null,
          adminId: admin.id,
        },
      }),
      prisma.adminUser.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } }),
    ]);

    req.admin = admin;
    await recordAudit(req, "admin.login", "AdminUser", admin.id);
    res.cookie(adminCookieName(), token, cookieOptions());
    res.json({ data: { username: admin.username, role: admin.role, expiresAt } });
  } catch (error) {
    next(error);
  }
}

export async function logoutAdmin(req, res, next) {
  try {
    await prisma.adminSession.delete({ where: { id: req.adminSession.id } }).catch(() => {});
    await recordAudit(req, "admin.logout", "AdminUser", req.admin.id);
    res.clearCookie(adminCookieName(), { ...cookieOptions(), maxAge: undefined });
    res.json({ message: "Signed out successfully" });
  } catch (error) {
    next(error);
  }
}

export function getAdminSession(req, res) {
  res.json({ data: { username: req.admin.username, role: req.admin.role } });
}
