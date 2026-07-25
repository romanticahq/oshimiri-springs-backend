import { Router } from "express";
import { requireAdminSession } from "../middleware/admin-session.middleware.js";
import {
  createSeller,
  deleteSeller,
  getAdminSellers,
  getSellerByAccessCode,
  getSellers,
  revokeSellerAccess,
  rotateSellerAccess,
  updateSeller,
} from "../controllers/sellers.controller.js";

const router = Router();

router.get("/", getSellers);
router.get("/admin", requireAdminSession, getAdminSellers);
router.get("/access/:code", getSellerByAccessCode);
router.post("/", requireAdminSession, createSeller);
router.patch("/:id", requireAdminSession, updateSeller);
router.delete("/:id", requireAdminSession, deleteSeller);
router.post("/:id/access/rotate", requireAdminSession, rotateSellerAccess);
router.post("/:id/access/revoke", requireAdminSession, revokeSellerAccess);

export default router;
