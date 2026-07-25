import { prisma } from "../config/prisma.js";
import {
  createProductSubmissionSchema,
  updateProductSubmissionSchema,
} from "../validators/product-submission.validator.js";
import { hashToken } from "../utils/security.js";

export async function createProductSubmission(req, res, next) {
  try {
    const data = createProductSubmissionSchema.parse(req.body);
    const seller = await prisma.seller.findUnique({
      where: { accessTokenHash: hashToken(data.sellerAccessToken) },
    });

    if (
      !seller ||
      !seller.verified ||
      seller.suspendedAt ||
      seller.accessRevokedAt ||
      !seller.accessTokenExpiresAt ||
      seller.accessTokenExpiresAt <= new Date()
    ) {
      return res.status(403).json({
        message: "Seller access link is invalid, expired, or unavailable",
        status: "error",
      });
    }

    const { sellerAccessToken: _sellerAccessToken, ...submissionData } = data;
    const submission = await prisma.productSubmission.create({
      data: {
        ...submissionData,
        sellerAccessCode: null,
        sellerId: seller.id,
        sellerName: seller.name,
        sellerWhatsapp: seller.whatsapp,
        imageUrls: data.imageUrls ?? [],
        status: "pending",
      },
    });

    res.status(201).json({
      message: "Product submitted successfully. Oshimiri will review it before listing.",
      data: submission,
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.issues,
        status: "error",
      });
    }

    next(error);
  }
}

export async function getProductSubmissions(req, res, next) {
  try {
    const submissions = await prisma.productSubmission.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProductSubmission(req, res, next) {
  try {
    const data = updateProductSubmissionSchema.parse(req.body);
    const submission = await prisma.productSubmission.update({
      where: {
        id: req.params.id,
      },
      data,
    });

    res.json({
      message: "Product submission updated successfully",
      data: submission,
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
        message: "Product submission not found",
        status: "error",
      });
    }

    next(error);
  }
}
