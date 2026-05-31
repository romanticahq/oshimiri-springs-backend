export function requireAdminApiKey(req, res, next) {
  const apiKey = req.header("x-admin-api-key");

  if (!process.env.ADMIN_API_KEY) {
    return res.status(500).json({
      message: "Admin API key is not configured",
      status: "error",
    });
  }

  if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({
      message: "Unauthorized",
      status: "error",
    });
  }

  next();
}
