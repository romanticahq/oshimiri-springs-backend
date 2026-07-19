import { prisma } from "../config/prisma.js";
import {
  createCustomerEnquirySchema,
  updateCustomerEnquirySchema,
} from "../validators/customer-enquiry.validator.js";

const recentSubmissions = new Map();
const SUBMISSION_WINDOW_MS = 60_000;

async function sendNotification(enquiry) {
  if (!process.env.RESEND_API_KEY) return;

  const destination =
    process.env.ENQUIRY_NOTIFICATION_EMAIL ||
    process.env.CONTACT_NOTIFICATION_EMAIL ||
    "admin@oshimiriauto.com";
  const sender =
    process.env.ENQUIRY_FROM_EMAIL ||
    process.env.CONTACT_FROM_EMAIL ||
    "Oshimiri Website <enquiries@oshimiriauto.com>";
  const details = [
    `Name: ${enquiry.name}`,
    `Email: ${enquiry.email}`,
    `Phone: ${enquiry.phone}`,
    `WhatsApp: ${enquiry.whatsapp || "Not provided"}`,
    `Preferred contact: ${enquiry.preferredContact}`,
    `Type: ${enquiry.enquiryType}`,
    `Part/service: ${enquiry.partName || "Not provided"}`,
    `Vehicle: ${enquiry.vehicleDetails || "Not provided"}`,
    `Location: ${enquiry.location || "Not provided"}`,
    "",
    enquiry.message,
  ].join("\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: sender,
      to: [destination],
      reply_to: enquiry.email,
      subject: `Oshimiri ${enquiry.enquiryType}: ${enquiry.partName || enquiry.name}`,
      text: details,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Could not send enquiry notification", response.status, errorBody);
  }
}

export async function createCustomerEnquiry(req, res, next) {
  try {
    const data = createCustomerEnquirySchema.parse(req.body);

    if (data.website) {
      return res.status(201).json({ message: "Your message has been received.", status: "success" });
    }

    const key = req.ip || req.socket?.remoteAddress || "unknown";
    const lastSubmission = recentSubmissions.get(key) || 0;
    if (Date.now() - lastSubmission < SUBMISSION_WINDOW_MS) {
      return res.status(429).json({
        message: "Please wait a minute before sending another message.",
        status: "error",
      });
    }

    const { consent: _consent, website: _website, ...enquiryData } = data;
    const enquiry = await prisma.customerEnquiry.create({
      data: {
        ...enquiryData,
        whatsapp: enquiryData.whatsapp || null,
        partName: enquiryData.partName || null,
        vehicleDetails: enquiryData.vehicleDetails || null,
        location: enquiryData.location || null,
      },
    });
    recentSubmissions.set(key, Date.now());

    sendNotification(enquiry).catch((error) => {
      console.error("Enquiry notification failed", error.message);
    });

    res.status(201).json({
      message: "Thank you. Your message has been sent to Oshimiri.",
      reference: enquiry.id,
      status: "success",
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        message: error.issues?.[0]?.message || "Please check the form.",
        errors: error.issues,
        status: "error",
      });
    }
    next(error);
  }
}

export async function getCustomerEnquiries(req, res, next) {
  try {
    const enquiries = await prisma.customerEnquiry.findMany({ orderBy: { createdAt: "desc" } });
    res.json({ count: enquiries.length, data: enquiries });
  } catch (error) {
    next(error);
  }
}

export async function updateCustomerEnquiry(req, res, next) {
  try {
    const data = updateCustomerEnquirySchema.parse(req.body);
    const enquiry = await prisma.customerEnquiry.update({
      where: { id: req.params.id },
      data,
    });
    res.json({ message: "Message updated successfully", data: enquiry });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ message: "Validation failed", errors: error.issues, status: "error" });
    }
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Message not found", status: "error" });
    }
    next(error);
  }
}
