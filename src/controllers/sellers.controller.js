import { prisma } from "../config/prisma.js";
import { createSellerSchema, updateSellerSchema } from "../validators/seller.validator.js";

function createAccessCode(name = "seller") {
  const prefix = name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 14) || "SELLER";
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function publicSeller(seller) {
  const { accessCode, ...safeSeller } = seller;
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
      data: sellers,
    });
  } catch (error) {
    next(error);
  }
}

export async function getSellerByAccessCode(req, res, next) {
  try {
    const seller = await prisma.seller.findUnique({
      where: {
        accessCode: req.params.code,
      },
    });

    if (!seller || !seller.verified) {
      return res.status(404).json({
        message: "Seller access code is invalid or not approved yet",
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
    const seller = await prisma.seller.create({
      data: {
        ...data,
        accessCode: data.accessCode || createAccessCode(data.name),
        verified: data.verified ?? false,
      },
    });

    res.status(201).json({
      message: "Seller created successfully",
      data: seller,
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

    res.json({
      message: "Seller updated successfully",
      data: seller,
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
