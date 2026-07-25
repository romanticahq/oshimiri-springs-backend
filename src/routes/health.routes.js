import { Router } from "express";
import { prisma } from "../config/prisma.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "oshimiri-backend",
    timestamp: new Date().toISOString(),
  });
});

router.get("/ready", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ready", service: "oshimiri-backend" });
  } catch {
    res.status(503).json({ status: "not-ready", service: "oshimiri-backend" });
  }
});

export default router;
