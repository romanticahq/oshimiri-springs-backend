import { prisma } from "../config/prisma.js";
import { createSellerSchema, updateSellerSchema } from "../validators/seller.validator.js";

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
      data: sellers,
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
