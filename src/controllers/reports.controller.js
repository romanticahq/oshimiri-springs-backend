import { prisma } from "../config/prisma.js";
import { createReportSchema, updateReportSchema } from "../validators/report.validator.js";
import { createPublicReference } from "../utils/reference.js";
import { recordAudit } from "../services/audit.js";

export async function createReport(req, res, next) {
  try {
    const data = createReportSchema.parse(req.body);
    if (data.website) {
      return res.status(201).json({ message: "Report received", status: "success" });
    }
    const product = data.productSlug
      ? await prisma.product.findUnique({ where: { slug: data.productSlug } })
      : null;
    const seller = data.sellerSlug
      ? await prisma.seller.findUnique({ where: { slug: data.sellerSlug } })
      : null;
    if (data.productSlug && !product) {
      return res.status(400).json({ message: "Product could not be identified", status: "error" });
    }
    if (data.sellerSlug && !seller) {
      return res.status(400).json({ message: "Seller could not be identified", status: "error" });
    }
    const report = await prisma.marketplaceReport.create({
      data: {
        publicReference: createPublicReference("RPT"),
        reportType: data.reportType,
        reason: data.reason,
        details: data.details,
        reporterName: data.reporterName || null,
        reporterEmail: data.reporterEmail || null,
        reporterPhone: data.reporterPhone || null,
        productId: product?.id,
        sellerId: seller?.id || product?.sellerId,
      },
    });
    res.status(201).json({
      message: "Your report has been received by Oshimiri.",
      reference: report.publicReference,
      status: "success",
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ message: error.issues[0]?.message, errors: error.issues, status: "error" });
    }
    next(error);
  }
}

export async function getReports(req, res, next) {
  try {
    const data = await prisma.marketplaceReport.findMany({
      include: { product: { select: { name: true, slug: true, publicReference: true } }, seller: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ count: data.length, data });
  } catch (error) {
    next(error);
  }
}

export async function updateReport(req, res, next) {
  try {
    const data = updateReportSchema.parse(req.body);
    const report = await prisma.marketplaceReport.update({ where: { id: req.params.id }, data });
    await recordAudit(req, "report.update", "MarketplaceReport", report.id, data);
    res.json({ message: "Report updated successfully", data: report });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ message: "Validation failed", errors: error.issues, status: "error" });
    }
    next(error);
  }
}
