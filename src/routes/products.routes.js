import { Router } from "express";
import { requireAdminApiKey } from "../middleware/admin-auth.middleware.js";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from "../controllers/products.controller.js";

const router = Router();

router.get("/", getProducts);
router.post("/", requireAdminApiKey, createProduct);
router.get("/:id", getProductById);
router.patch("/:id", requireAdminApiKey, updateProduct);
router.delete("/:id", requireAdminApiKey, deleteProduct);

export default router;
