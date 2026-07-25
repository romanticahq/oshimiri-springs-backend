import { Router } from "express";
import { requireAdminSession } from "../middleware/admin-session.middleware.js";
import { publicWriteLimiter, verifyTurnstile } from "../middleware/security.middleware.js";
import {
  createProductSubmission,
  getProductSubmissions,
  updateProductSubmission,
} from "../controllers/product-submissions.controller.js";

const router = Router();

router.post("/", publicWriteLimiter, verifyTurnstile, createProductSubmission);
router.get("/", requireAdminSession, getProductSubmissions);
router.patch("/:id", requireAdminSession, updateProductSubmission);

export default router;
