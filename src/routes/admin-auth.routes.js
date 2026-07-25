import { Router } from "express";
import { getAdminSession, loginAdmin, logoutAdmin } from "../controllers/admin-auth.controller.js";
import { requireAdminSession } from "../middleware/admin-session.middleware.js";

const router = Router();
router.post("/login", loginAdmin);
router.get("/me", requireAdminSession, getAdminSession);
router.post("/logout", requireAdminSession, logoutAdmin);
export default router;
