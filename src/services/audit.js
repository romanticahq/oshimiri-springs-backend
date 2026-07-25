import { prisma } from "../config/prisma.js";

export async function recordAudit(req, action, entityType, entityId, metadata) {
  await prisma.auditLog.create({
    data: {
      action,
      entityType,
      entityId: entityId || null,
      metadata: metadata || undefined,
      ipAddress: req.ip || null,
      adminId: req.admin?.id || null,
    },
  });
}
