import { z } from "zod";

const optionalText = (max) => z.string().trim().max(max).optional().or(z.literal(""));

export const createCustomerEnquirySchema = z.object({
  name: z.string().trim().min(2, "name is required").max(100),
  email: z.string().trim().email("enter a valid email address").max(160),
  phone: z.string().trim().min(7, "phone number is required").max(30),
  whatsapp: optionalText(30),
  preferredContact: z.enum(["email", "phone", "whatsapp"]),
  enquiryType: z.enum(["part", "repair", "seller", "complaint", "general"]),
  partName: optionalText(160),
  vehicleDetails: optionalText(240),
  location: optionalText(120),
  message: z.string().trim().min(10, "please provide a little more detail").max(2000),
  consent: z.literal(true, { error: "consent is required before submitting" }),
  website: optionalText(200),
});

export const updateCustomerEnquirySchema = z.object({
  status: z.enum(["new", "contacted", "resolved", "spam"]).optional(),
  adminNote: z.string().trim().max(2000).optional().nullable(),
});
