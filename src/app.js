import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

import healthRoutes from "./routes/health.routes.js";
import categoryRoutes from "./routes/categories.routes.js";
import productRoutes from "./routes/products.routes.js";
import sellerRoutes from "./routes/sellers.routes.js";
import engineerRoutes from "./routes/engineers.routes.js";
import { notFound } from "./middleware/not-found.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "12mb" }));
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({
    message: "Oshimiri Auto API",
    status: "running",
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/sellers", sellerRoutes);
app.use("/api/engineers", engineerRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
