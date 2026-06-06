const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

if (process.env.TRUST_PROXY === "true") {
  app.set("trust proxy", 1);
}

function normalizeOrigin(origin = "") {
  return origin.trim().replace(/\/+$/, "");
}

const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => normalizeOrigin(origin))
  .filter(Boolean);

const requestCounts = new Map();
const rateLimitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
const rateLimitMax = Number(process.env.RATE_LIMIT_MAX || 300);

function securityHeaders(req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "0");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
}

function rateLimiter(req, res, next) {
  const now = Date.now();
  const key = req.ip || req.socket.remoteAddress || "unknown";
  const current = requestCounts.get(key) || { count: 0, resetAt: now + rateLimitWindowMs };

  if (current.resetAt <= now) {
    current.count = 0;
    current.resetAt = now + rateLimitWindowMs;
  }

  current.count += 1;
  requestCounts.set(key, current);

  if (current.count > rateLimitMax) {
    return res.status(429).json({ message: "Too many requests. Please try again later." });
  }

  next();
}

app.use(securityHeaders);
app.use(rateLimiter);
app.use(express.json({ limit: process.env.JSON_LIMIT || "100kb" }));
app.use(cors({
  origin(origin, callback) {
    const normalizedOrigin = normalizeOrigin(origin || "");
    if (!normalizedOrigin || allowedOrigins.length === 0 || allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }
    return callback(new Error("Origin not allowed by CORS"));
  },
  credentials: true
}));

// Routes
app.use("/api/auth",        require("./routes/authRoutes"));
app.use("/api/users",       require("./routes/userRoutes"));
app.use("/api/suppliers",   require("./routes/supplierRoutes"));
app.use("/api/products",    require("./routes/productRoutes"));
app.use("/api/categories",  require("./routes/categoryRoutes"));
app.use("/api/customers",   require("./routes/customerRoutes"));
app.use("/api/orders",      require("./routes/orderRoutes"));
app.use("/api/payments",    require("./routes/paymentRoutes"));
app.use("/api/deliveries",  require("./routes/deliveryRoutes"));
app.use("/api/agents",      require("./routes/agentRoutes"));
app.use("/api/reviews",     require("./routes/reviewRoutes"));
app.use("/api/banners",     require("./routes/bannerRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/analytics",   require("./routes/analyticsRoutes"));
app.use("/api/superadmin",  require("./routes/superAdminRoutes"));

app.get("/", (req, res) => res.json({ message: "FMCG Platform API Running" }));

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((error, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  if (process.env.NODE_ENV !== "production") {
    console.error(error);
  }
  res.status(statusCode).json({
    message: process.env.NODE_ENV === "production" && statusCode === 500 ? "Server error" : error.message
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
