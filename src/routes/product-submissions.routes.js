import { Router } from "express";
import { requireAdminApiKey } from "../middleware/admin-auth.middleware.js";
import {
  createProductSubmission,
  getProductSubmissions,
  updateProductSubmission,
} from "../controllers/product-submissions.controller.js";

const router = Router();

router.post("/", createProductSubmission);
router.get("/", requireAdminApiKey, getProductSubmissions);
router.patch("/:id", requireAdminApiKey, updateProductSubmission);

export default router;
