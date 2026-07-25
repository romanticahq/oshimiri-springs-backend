import { rateLimit } from "express-rate-limit";

const configuredOrigins = String(
  process.env.ALLOWED_ORIGINS || "https://oshimiriauto.com,https://www.oshimiriauto.com",
)
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

if (process.env.NODE_ENV !== "production") {
  configuredOrigins.push("http://localhost:5173", "http://127.0.0.1:5173");
}

export const corsOptions = {
  origin(origin, callback) {
    if (!origin || configuredOrigins.includes(origin)) return callback(null, true);
    const error = new Error("Origin is not allowed");
    error.statusCode = 403;
    return callback(error);
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "X-Turnstile-Token"],
  maxAge: 86400,
};

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

export const publicWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later.", status: "error" },
});

export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many upload requests. Please try again later.", status: "error" },
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { message: "Too many sign-in attempts. Try again later.", status: "error" },
});

export async function verifyTurnstile(req, res, next) {
  try {
    if (!process.env.TURNSTILE_SECRET_KEY) {
      if (process.env.NODE_ENV === "production") {
        return res.status(503).json({ message: "Form protection is unavailable", status: "error" });
      }
      return next();
    }

    const token = req.header("x-turnstile-token") || req.body?.turnstileToken;
    if (!token) {
      return res.status(400).json({ message: "Please complete the security check", status: "error" });
    }

    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: req.ip || "",
      }),
    });
    const result = await response.json();
    if (!result.success) {
      return res.status(400).json({ message: "Security check failed. Please try again.", status: "error" });
    }
    next();
  } catch (error) {
    next(error);
  }
}
