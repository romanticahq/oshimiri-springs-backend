import { z } from "zod";

const imageUrl = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => !value || /^https:\/\//i.test(value), "images must use an approved HTTPS URL");

export const createProductSubmissionSchema = z.object({
  name: z.string().trim().min(2, "product name is required"),
  categorySlug: z.string().trim().min(2, "category is required"),
  price: z.coerce.number().int().positive("price must be greater than 0").optional().nullable(),
  priceLabel: z.string().trim().optional().nullable(),
  condition: z.string().trim().min(2, "condition is required"),
  location: z.string().trim().min(2, "location is required"),
  coverageArea: z.string().trim().optional(),
  imageUrl: imageUrl.optional(),
  imageUrls: z.array(imageUrl).max(10).optional(),
  sellerName: z.string().trim().min(2, "seller name is required"),
  sellerWhatsapp: z.string().trim().min(7, "seller WhatsApp is required"),
  sellerAccessToken: z.string().trim().min(32, "a valid seller access link is required"),
  vehicleMakeModel: z.string().trim().optional(),
  yearRange: z.string().trim().optional(),
  position: z.string().trim().optional(),
  brand: z.string().trim().optional(),
  batterySize: z.string().trim().optional(),
  description: z.string().trim().optional(),
});

export const updateProductSubmissionSchema = z.object({
  status: z.enum(["pending", "reviewing", "approved", "rejected"]).optional(),
  adminNote: z.string().trim().optional().nullable(),
});
