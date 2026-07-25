import { Router } from "express";
import { createSellerUploadUrl, createUploadUrl } from "../controllers/uploads.controller.js";
import { requireAdminSession } from "../middleware/admin-session.middleware.js";
import { uploadLimiter } from "../middleware/security.middleware.js";

const router = Router();
router.post("/presign", uploadLimiter, requireAdminSession, createUploadUrl);
router.post("/seller-presign", uploadLimiter, createSellerUploadUrl);
export default router;
