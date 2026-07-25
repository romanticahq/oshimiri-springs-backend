import { z } from "zod";

const imageUrl = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => !value || /^https:\/\//i.test(value), "images must use an approved HTTPS URL");

const productFields = {
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
  coverageArea: z.string().trim().optional(),
  imageUrl: imageUrl.optional(),
  imageUrls: z.array(imageUrl).max(10).optional(),
  sellerName: z.string().trim().min(2, "sellerName must be at least 2 characters").optional(),
  sellerWhatsapp: z.string().trim().min(7, "sellerWhatsapp must be at least 7 characters").optional(),
  sellerSlug: z.string().trim().optional(),
  vehicleMakeModel: z.string().trim().optional(),
  yearRange: z.string().trim().optional(),
  position: z.string().trim().optional(),
  brand: z.string().trim().optional(),
  batterySize: z.string().trim().optional(),
  inStock: z.boolean().optional(),
  vehicleMake: z.string().trim().max(80).optional(),
  vehicleModel: z.string().trim().max(80).optional(),
  yearFrom: z.coerce.number().int().min(1950).max(2100).optional().nullable(),
  yearTo: z.coerce.number().int().min(1950).max(2100).optional().nullable(),
  engineCode: z.string().trim().max(80).optional(),
  oemPartNumber: z.string().trim().max(120).optional(),
  partNumber: z.string().trim().max(120).optional(),
  side: z.enum(["left", "right", "both", "not-applicable"]).optional(),
  bodyType: z.string().trim().max(100).optional(),
  warranty: z.string().trim().max(200).optional(),
  availabilityStatus: z.enum(["available", "reserved", "unavailable", "archived"]).optional(),
  lastConfirmedAt: z.coerce.date().optional().nullable(),
  categorySlug: z.string().trim().min(2, "categorySlug is required"),
};

const validYearRange = (data) => !data.yearFrom || !data.yearTo || data.yearFrom <= data.yearTo;

export const createProductSchema = z.object(productFields).refine(validYearRange, {
  message: "yearFrom cannot be later than yearTo",
  path: ["yearTo"],
});

export const updateProductSchema = z.object(productFields).partial().refine(validYearRange, {
  message: "yearFrom cannot be later than yearTo",
  path: ["yearTo"],
});
