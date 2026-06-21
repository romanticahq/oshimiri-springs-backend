import { Router } from "express";
import { requireAdminApiKey } from "../middleware/admin-auth.middleware.js";
import {
  createEngineer,
  deleteEngineer,
  getEngineers,
  updateEngineer,
} from "../controllers/engineers.controller.js";

const router = Router();

router.get("/", getEngineers);
router.post("/", requireAdminApiKey, createEngineer);
router.patch("/:id", requireAdminApiKey, updateEngineer);
router.delete("/:id", requireAdminApiKey, deleteEngineer);

export default router;
