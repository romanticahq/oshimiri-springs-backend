import { Router } from "express";
import { requireAdminApiKey } from "../middleware/admin-auth.middleware.js";
import {
  createSeller,
  deleteSeller,
  getSellers,
  updateSeller,
} from "../controllers/sellers.controller.js";

const router = Router();

router.get("/", getSellers);
router.post("/", requireAdminApiKey, createSeller);
router.patch("/:id", requireAdminApiKey, updateSeller);
router.delete("/:id", requireAdminApiKey, deleteSeller);

export default router;
