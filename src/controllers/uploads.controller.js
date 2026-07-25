import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createOpaqueToken } from "../utils/security.js";
import { hashToken } from "../utils/security.js";
import { prisma } from "../config/prisma.js";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function createUploadUrl(req, res, next) {
  try {
    const { contentType, size, extension } = req.body || {};
    const numericSize = Number(size);
    if (!allowedTypes.has(contentType) || !Number.isFinite(numericSize) || numericSize > 5_000_000) {
      return res.status(400).json({
        message: "Only JPG, PNG, or WebP images up to 5 MB are allowed",
        status: "error",
      });
    }
    if (!process.env.S3_BUCKET || !process.env.AWS_REGION || !process.env.IMAGE_PUBLIC_BASE_URL) {
      return res.status(503).json({ message: "Image storage is not configured", status: "error" });
    }
    const safeExtension = String(extension || contentType.split("/")[1]).toLowerCase().replace(/[^a-z0-9]/g, "");
    const key = `products/${new Date().toISOString().slice(0, 10)}/${createOpaqueToken(18)}.${safeExtension}`;
    const client = new S3Client({ region: process.env.AWS_REGION });
    const uploadUrl = await getSignedUrl(
      client,
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
        ContentType: contentType,
        ContentLength: numericSize,
        CacheControl: "public,max-age=31536000,immutable",
      }),
      { expiresIn: 300 },
    );
    res.json({
      data: {
        uploadUrl,
        publicUrl: `${process.env.IMAGE_PUBLIC_BASE_URL.replace(/\/$/, "")}/${key}`,
        expiresIn: 300,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function createSellerUploadUrl(req, res, next) {
  try {
    const token = String(req.body?.sellerAccessToken || "");
    const seller = token
      ? await prisma.seller.findUnique({ where: { accessTokenHash: hashToken(token) } })
      : null;
    if (!seller || !seller.verified || seller.suspendedAt || seller.accessRevokedAt ||
        !seller.accessTokenExpiresAt || seller.accessTokenExpiresAt <= new Date()) {
      return res.status(403).json({ message: "Valid seller access is required", status: "error" });
    }
    return createUploadUrl(req, res, next);
  } catch (error) {
    next(error);
  }
}
