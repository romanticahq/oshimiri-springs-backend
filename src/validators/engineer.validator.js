import { z } from "zod";

export const createEngineerSchema = z.object({
  name: z.string().trim().min(2, "name is required"),
  slug: z
    .string()
    .trim()
    .min(2, "slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be URL friendly"),
  whatsapp: z.string().trim().min(7, "whatsapp is required"),
  phone: z.string().trim().optional(),
  location: z.string().trim().min(2, "location is required"),
  coverageArea: z.string().trim().optional(),
  specialty: z.string().trim().min(2, "specialty is required"),
  experience: z.string().trim().optional(),
  description: z.string().trim().optional(),
  verified: z.boolean().optional(),
  rating: z.string().trim().optional(),
  imageUrl: z.string().trim().optional(),
});

export const updateEngineerSchema = createEngineerSchema.partial();
