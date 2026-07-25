import { z } from "zod";

export const createReportSchema = z.object({
  reportType: z.enum(["listing", "seller", "suspected-fraud"]),
  reason: z.enum([
    "misleading-information",
    "wrong-part",
    "suspected-fraud",
    "seller-unreachable",
    "prohibited-item",
    "other",
  ]),
  details: z.string().trim().min(20).max(3000),
  reporterName: z.string().trim().max(100).optional().or(z.literal("")),
  reporterEmail: z.string().trim().email().max(160).optional().or(z.literal("")),
  reporterPhone: z.string().trim().max(30).optional().or(z.literal("")),
  productSlug: z.string().trim().optional(),
  sellerSlug: z.string().trim().optional(),
  website: z.string().max(200).optional().or(z.literal("")),
});

export const updateReportSchema = z.object({
  status: z.enum(["new", "investigating", "awaiting-response", "resolved", "closed"]).optional(),
  adminNote: z.string().trim().max(3000).optional().nullable(),
});
