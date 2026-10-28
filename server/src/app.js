const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const { Pool } = require("pg");
const path = require("path");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

// Initialize Express
const app = express();

// Environment Configuration
const isProduction = process.env.NODE_ENV === "production";

const PORT = process.env.PORT || 5000;

const clientOrigin =
  process.env.CLIENT_URL || "http://localhost:5173";

const allowedOrigin = new URL(clientOrigin).origin;

// Validate required environment variables
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing from environment variables");
}

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET is missing from environment variables");
}

// Trust one reverse proxy in production (e.g. Render).
// Adjust this setting if your hosting architecture differs.
if (isProduction) {
  app.set("trust proxy", 1);
}

// PostgreSQL Connection Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// HTTP Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// JSON Body Parser
app.use(express.json({ limit: "100kb" }));

// CORS Configuration
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

// ============================================
// CSRF ORIGIN PROTECTION
// ============================================

app.use((req, res, next) => {
  const safeMethods = ["GET", "HEAD", "OPTIONS"];

  if (safeMethods.includes(req.method)) {
    return next();
  }

  const requestOrigin = req.get("Origin");

  const expectedOrigin = isProduction
    ? `${req.protocol}://${req.get("host")}`
    : allowedOrigin;

  if (!requestOrigin || requestOrigin !== expectedOrigin) {
    return res.status(403).json({
      success: false,
      message: "Request origin not allowed",
    });
  }

  next();
});

// ============================================
// SESSION CONFIGURATION
// ============================================

app.use(
  session({
    name: "stockflow.sid",

    store: new pgSession({
      pool,
      createTableIfMissing: true,
    }),

    secret: process.env.SESSION_SECRET,

    resave: false,

    saveUninitialized: false,

    cookie: {
      httpOnly: true,

      secure: isProduction,

      sameSite: "lax",

      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

// ============================================
// AUTHENTICATION RATE LIMITING
// ============================================

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  limit: 20,

  standardHeaders: "draft-8",

  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

// ============================================
// HEALTH CHECK API
// ============================================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "OK",
    application: "StockFlow",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// API ROUTES
// ============================================

// Authentication
app.use("/api/auth", authLimiter, authRoutes);

// Product CRUD
app.use("/api/products", productRoutes);

// Dashboard Statistics
app.use("/api/dashboard", dashboardRoutes);

// Organization Settings
app.use("/api/settings", settingsRoutes);

// ============================================
// REACT PRODUCTION BUILD
// ============================================

if (isProduction) {
  const clientDistPath = path.join(
    __dirname,
    "../../client/dist"
  );

  // Serve compiled React static files
  app.use(express.static(clientDistPath));

  // React Router fallback for frontend routes
  app.get("/{*path}", (req, res, next) => {
    // Return JSON for unknown API endpoints
    if (req.path === "/api" || req.path.startsWith("/api/")) {
      return res.status(404).json({
        success: false,
        message: "API endpoint not found",
      });
    }

    res.sendFile(
      path.join(clientDistPath, "index.html"),
      (error) => {
        if (error) next(error);
      }
    );
  });
}

// ============================================
// GLOBAL ERROR HANDLER
// ============================================

app.use((err, req, res, next) => {
  console.error("StockFlow Error:", err);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

module.exports = app;