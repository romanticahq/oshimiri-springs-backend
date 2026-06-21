import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().trim().min(2, "name must be at least 2 characters"),
  slug: z
    .string()
    .trim()
    .min(2, "slug must be at least 2 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be URL friendly"),
  description: z.string().trim().optional(),
  price: z.coerce.number().int().positive("price must be greater than 0").optional().nullable(),
  priceLabel: z.string().trim().optional().nullable(),
  currency: z.string().trim().default("NGN"),
  condition: z.string().trim().min(2, "condition is required"),
  location: z.string().trim().min(2, "location is required"),
  imageUrl: z.string().trim().optional(),
  imageUrls: z.array(z.string().trim().min(1)).optional(),
  sellerName: z.string().trim().min(2, "sellerName must be at least 2 characters").optional(),
  sellerWhatsapp: z.string().trim().min(7, "sellerWhatsapp must be at least 7 characters").optional(),
  sellerSlug: z.string().trim().optional(),
  vehicleMakeModel: z.string().trim().optional(),
  yearRange: z.string().trim().optional(),
  position: z.string().trim().optional(),
  brand: z.string().trim().optional(),
  batterySize: z.string().trim().optional(),
  inStock: z.boolean().optional(),
  categorySlug: z.string().trim().min(2, "categorySlug is required"),
});

export const updateProductSchema = createProductSchema.partial();
