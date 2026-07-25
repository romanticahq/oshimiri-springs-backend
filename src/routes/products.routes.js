import { Router } from "express";
import { requireAdminSession } from "../middleware/admin-session.middleware.js";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from "../controllers/products.controller.js";

const router = Router();

router.get("/", getProducts);
router.post("/", requireAdminSession, createProduct);
router.get("/:id", getProductById);
router.patch("/:id", requireAdminSession, updateProduct);
router.delete("/:id", requireAdminSession, deleteProduct);

export default router;
