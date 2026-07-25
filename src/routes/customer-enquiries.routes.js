import { Router } from "express";
import { requireAdminSession } from "../middleware/admin-session.middleware.js";
import { publicWriteLimiter, verifyTurnstile } from "../middleware/security.middleware.js";
import {
  createCustomerEnquiry,
  getCustomerEnquiries,
  updateCustomerEnquiry,
} from "../controllers/customer-enquiries.controller.js";

const router = Router();

router.post("/", publicWriteLimiter, verifyTurnstile, createCustomerEnquiry);
router.get("/", requireAdminSession, getCustomerEnquiries);
router.patch("/:id", requireAdminSession, updateCustomerEnquiry);

export default router;
