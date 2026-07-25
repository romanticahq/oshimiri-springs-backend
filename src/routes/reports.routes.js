import { Router } from "express";
import { createReport, getReports, updateReport } from "../controllers/reports.controller.js";
import { requireAdminSession } from "../middleware/admin-session.middleware.js";
import { publicWriteLimiter, verifyTurnstile } from "../middleware/security.middleware.js";

const router = Router();
router.post("/", publicWriteLimiter, verifyTurnstile, createReport);
router.get("/", requireAdminSession, getReports);
router.patch("/:id", requireAdminSession, updateReport);
export default router;
