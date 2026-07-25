import { Router } from "express";
import { requireAdminSession } from "../middleware/admin-session.middleware.js";
import {
  createEngineer,
  deleteEngineer,
  getEngineers,
  updateEngineer,
} from "../controllers/engineers.controller.js";

const router = Router();

router.get("/", getEngineers);
router.post("/", requireAdminSession, createEngineer);
router.patch("/:id", requireAdminSession, updateEngineer);
router.delete("/:id", requireAdminSession, deleteEngineer);

export default router;
