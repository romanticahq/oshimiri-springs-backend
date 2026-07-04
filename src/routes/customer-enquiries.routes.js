import { Router } from "express";
import { requireAdminApiKey } from "../middleware/admin-auth.middleware.js";
import {
  createCustomerEnquiry,
  getCustomerEnquiries,
  updateCustomerEnquiry,
} from "../controllers/customer-enquiries.controller.js";

const router = Router();

router.post("/", createCustomerEnquiry);
router.get("/", requireAdminApiKey, getCustomerEnquiries);
router.patch("/:id", requireAdminApiKey, updateCustomerEnquiry);

export default router;
