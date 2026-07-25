import { prisma } from "../config/prisma.js";
import { createSellerSchema, updateSellerSchema } from "../validators/seller.validator.js";
import { createOpaqueToken, hashToken } from "../utils/security.js";
import { recordAudit } from "../services/audit.js";

const SELLER_ACCESS_DAYS = Number(process.env.SELLER_ACCESS_DAYS || 30);

function issueSellerAccess() {
  const token = createOpaqueToken();
  return {
    token,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + SELLER_ACCESS_DAYS * 86400000),
  };
}

function publicSeller(seller) {
  const { accessCode, accessTokenHash, accessTokenExpiresAt, accessRevokedAt, ...safeSeller } = seller;
  return safeSeller;
}

function adminSeller(seller) {
  const { accessCode, accessTokenHash, ...safeSeller } = seller;
  return safeSeller;
}

export async function getSellers(req, res, next) {
  try {
    const sellers = await prisma.seller.findMany({
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    res.json({
      count: sellers.length,
      data: sellers.map(publicSeller),
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminSellers(req, res, next) {
  try {
    const sellers = await prisma.seller.findMany({
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    res.json({
      count: sellers.length,
      data: sellers.map(adminSeller),
    });
  } catch (error) {
    next(error);
  }
}

export async function getSellerByAccessCode(req, res, next) {
  try {
    const seller = await prisma.seller.findUnique({
      where: { accessTokenHash: hashToken(req.params.code) },
    });

    if (
      !seller ||
      !seller.verified ||
      seller.suspendedAt ||
      seller.accessRevokedAt ||
      !seller.accessTokenExpiresAt ||
      seller.accessTokenExpiresAt <= new Date()
    ) {
      return res.status(404).json({
        message: "Seller access link is invalid, expired, or unavailable",
        status: "error",
      });
    }

    res.json({
      data: publicSeller(seller),
    });
  } catch (error) {
    next(error);
  }
}

export async function createSeller(req, res, next) {
  try {
    const data = createSellerSchema.parse(req.body);
    const access = issueSellerAccess();
    const seller = await prisma.seller.create({
      data: {
        ...data,
        accessCode: null,
        accessTokenHash: access.tokenHash,
        accessTokenExpiresAt: access.expiresAt,
        verifiedAt: data.verified ? new Date() : null,
        verified: data.verified ?? false,
      },
    });
    await recordAudit(req, "seller.create", "Seller", seller.id);

    res.status(201).json({
      message: "Seller created successfully",
      data: { ...publicSeller(seller), accessToken: access.token },
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.issues,
        status: "error",
      });
    }

    if (error.code === "P2002") {
      return res.status(409).json({
        message: "A seller with this slug already exists",
        status: "error",
      });
    }

    next(error);
  }
}

export async function updateSeller(req, res, next) {
  try {
    const data = updateSellerSchema.parse(req.body);
    const seller = await prisma.seller.update({
      where: {
        slug: req.params.id,
      },
      data,
    });
    await recordAudit(req, "seller.update", "Seller", seller.id, data);

    res.json({
      message: "Seller updated successfully",
      data: publicSeller(seller),
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.issues,
        status: "error",
      });
    }

    if (error.code === "P2025") {
      return res.status(404).json({
        message: "Seller not found",
        status: "error",
      });
    }

    if (error.code === "P2002") {
      return res.status(409).json({
        message: "A seller with this slug already exists",
        status: "error",
      });
    }

    next(error);
  }
}

export async function deleteSeller(req, res, next) {
  try {
    await prisma.seller.delete({
      where: {
        slug: req.params.id,
      },
    });
    await recordAudit(req, "seller.delete", "Seller", req.params.id);

    res.json({
      message: "Seller deleted successfully",
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        message: "Seller not found",
        status: "error",
      });
    }

    next(error);
  }
}

export async function rotateSellerAccess(req, res, next) {
  try {
    const access = issueSellerAccess();
    const seller = await prisma.seller.update({
      where: { slug: req.params.id },
      data: {
        accessTokenHash: access.tokenHash,
        accessTokenExpiresAt: access.expiresAt,
        accessRevokedAt: null,
      },
    });
    await recordAudit(req, "seller.access.rotate", "Seller", seller.id);
    res.json({
      message: "A new seller access link has been issued. The previous link no longer works.",
      data: { accessToken: access.token, expiresAt: access.expiresAt },
    });
  } catch (error) {
    next(error);
  }
}

export async function revokeSellerAccess(req, res, next) {
  try {
    const seller = await prisma.seller.update({
      where: { slug: req.params.id },
      data: { accessRevokedAt: new Date() },
    });
    await recordAudit(req, "seller.access.revoke", "Seller", seller.id);
    res.json({ message: "Seller access has been revoked" });
  } catch (error) {
    next(error);
  }
}
