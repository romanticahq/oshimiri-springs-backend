import { prisma } from "../config/prisma.js";
import {
  createProductSubmissionSchema,
  updateProductSubmissionSchema,
} from "../validators/product-submission.validator.js";

export async function createProductSubmission(req, res, next) {
  try {
    const data = createProductSubmissionSchema.parse(req.body);

    const submission = await prisma.productSubmission.create({
      data: {
        ...data,
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
