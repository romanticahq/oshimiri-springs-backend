import { prisma } from "../config/prisma.js";
import {
  createCustomerEnquirySchema,
  updateCustomerEnquirySchema,
} from "../validators/customer-enquiry.validator.js";

const recentSubmissions = new Map();
const SUBMISSION_WINDOW_MS = 60_000;

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatOptional(value) {
  return value || "Not provided";
}

function normalizePhoneForWhatsApp(value) {
  if (!value) return "";
  return String(value).replace(/[^\d]/g, "");
}

function buildNotificationText(enquiry) {
  return [
    `New Oshimiri ${enquiry.enquiryType} message`,
    "",
    `Name: ${enquiry.name}`,
    `Email: ${enquiry.email}`,
    `Phone: ${enquiry.phone}`,
    `WhatsApp: ${formatOptional(enquiry.whatsapp)}`,
    `Preferred contact: ${enquiry.preferredContact}`,
    `Part/service: ${formatOptional(enquiry.partName)}`,
    `Vehicle: ${formatOptional(enquiry.vehicleDetails)}`,
    `Location: ${formatOptional(enquiry.location)}`,
    `Submitted: ${enquiry.createdAt.toISOString()}`,
    "",
    "Message:",
    enquiry.message,
  ].join("\n");
}

function buildNotificationHtml(enquiry) {
  const whatsappNumber = normalizePhoneForWhatsApp(enquiry.whatsapp || enquiry.phone);
  const whatsappHref = whatsappNumber ? `https://wa.me/${whatsappNumber}` : "";
  const rows = [
    ["Name", enquiry.name],
    ["Email", enquiry.email],
    ["Phone", enquiry.phone],
    ["WhatsApp", formatOptional(enquiry.whatsapp)],
    ["Preferred contact", enquiry.preferredContact],
    ["Type", enquiry.enquiryType],
    ["Part/service", formatOptional(enquiry.partName)],
    ["Vehicle", formatOptional(enquiry.vehicleDetails)],
    ["Location", formatOptional(enquiry.location)],
    ["Submitted", enquiry.createdAt.toLocaleString("en-GB", { timeZone: "Africa/Lagos" })],
  ];

  const detailRows = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:10px 12px;color:#64748b;font-size:13px;border-bottom:1px solid #e5e7eb;width:36%;">${escapeHtml(label)}</td>
          <td style="padding:10px 12px;color:#0f172a;font-size:14px;font-weight:700;border-bottom:1px solid #e5e7eb;">${escapeHtml(value)}</td>
        </tr>`,
    )
    .join("");

  return `
    <!doctype html>
    <html>
      <body style="margin:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f6f8;padding:24px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
                <tr>
                  <td style="background:#070b13;padding:24px;">
                    <div style="color:#ef233c;font-size:13px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;">Oshimiri Automotive Marketplace</div>
                    <h1 style="margin:10px 0 0;color:#ffffff;font-size:26px;line-height:1.2;">New ${escapeHtml(enquiry.enquiryType)} enquiry</h1>
                    <p style="margin:8px 0 0;color:#cbd5e1;font-size:15px;">A customer submitted a message from oshimiriauto.com.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:22px 24px;">
                    <h2 style="margin:0 0 12px;font-size:18px;">Customer details</h2>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e5e7eb;border-radius:10px;border-collapse:separate;border-spacing:0;overflow:hidden;">
                      ${detailRows}
                    </table>

                    <h2 style="margin:24px 0 10px;font-size:18px;">Message</h2>
                    <div style="background:#fff7f7;border:1px solid #fecdd3;border-radius:10px;padding:16px;color:#111827;font-size:15px;line-height:1.55;white-space:pre-wrap;">${escapeHtml(enquiry.message)}</div>

                    <table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:22px;">
                      <tr>
                        <td>
                          <a href="mailto:${escapeHtml(enquiry.email)}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;font-weight:800;padding:12px 16px;border-radius:8px;margin-right:8px;">Reply by email</a>
                        </td>
                        ${
                          whatsappHref
                            ? `<td><a href="${escapeHtml(whatsappHref)}" style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;font-weight:800;padding:12px 16px;border-radius:8px;">Open WhatsApp</a></td>`
                            : ""
                        }
                      </tr>
                    </table>

                    <p style="margin:22px 0 0;color:#64748b;font-size:13px;line-height:1.5;">
                      This message is also saved in the Oshimiri admin dashboard.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>`;
}

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
      html: buildNotificationHtml(enquiry),
      text: buildNotificationText(enquiry),
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
