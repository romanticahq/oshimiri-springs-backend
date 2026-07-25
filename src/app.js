import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

import healthRoutes from "./routes/health.routes.js";
import categoryRoutes from "./routes/categories.routes.js";
import productRoutes from "./routes/products.routes.js";
import sellerRoutes from "./routes/sellers.routes.js";
import engineerRoutes from "./routes/engineers.routes.js";
import productSubmissionRoutes from "./routes/product-submissions.routes.js";
import customerEnquiryRoutes from "./routes/customer-enquiries.routes.js";
import adminAuthRoutes from "./routes/admin-auth.routes.js";
import reportRoutes from "./routes/reports.routes.js";
import uploadRoutes from "./routes/uploads.routes.js";
import { notFound } from "./middleware/not-found.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { corsOptions, generalLimiter, loginLimiter } from "./middleware/security.middleware.js";

dotenv.config();

const app = express();
app.set("trust proxy", 1);

app.use(helmet());
app.use(cors(corsOptions));
app.use(generalLimiter);
app.use(express.json({ limit: "256kb" }));
app.use((req, res, next) => {
  const startedAt = Date.now();
  res.on("finish", () => {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - startedAt,
    }));
  });
  next();
});

app.get("/", (req, res) => {
  res.json({
    message: "Oshimiri Auto API",
    status: "running",
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/admin/auth/login", loginLimiter);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/sellers", sellerRoutes);
app.use("/api/engineers", engineerRoutes);
app.use("/api/product-submissions", productSubmissionRoutes);
app.use("/api/customer-enquiries", customerEnquiryRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/uploads", uploadRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
