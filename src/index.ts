import "reflect-metadata";
import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import { AppDataSource } from "./config/data-source";
import { userRoutes } from "./routes/userRoutes";
import { taskRoutes } from "./routes/taskRoutes";
import { authRoutes } from "./routes/authRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request Logging Middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();

  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);

  next();
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});


// Version 1 API Routes
app.use("/api/v1", taskRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", authRoutes);

// Legacy API Routes - Return HTTP 410 Gone
app.use("/api", (req, res, next) => {
  // Allow unmatched version 1 routes to reach the 404 handler
  if (req.path === "/v1" || req.path.startsWith("/v1/")) {
    return next();
  }

  const newEndpoint = req.originalUrl.replace(
    /^\/api(?=\/|$)/,
    "/api/v1"
  );

  return res.status(410).json({
    success: false,
    error: {
      code: "API_VERSION_DEPRECATED",
      message: "This API endpoint has moved to version 1.",
      newEndpoint,
    },
  });
});


// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "ROUTE_NOT_FOUND",
      message: `Route ${req.method} ${req.originalUrl} not found`,
    },
  });
});

// HTTP server reference
let server: ReturnType<typeof app.listen>;

// Prevent multiple shutdown executions
let isShuttingDown = false;

// Graceful shutdown function
async function gracefulShutdown(signal: string) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  console.log(`\n${signal} received. Starting graceful shutdown...`);

  try {
    // Stop accepting new requests and wait for active requests
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });

    console.log("✅ HTTP server closed successfully.");

    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log("✅ Database connection closed successfully.");
    }

    console.log("👋 Graceful shutdown completed.");
  } catch (error) {
    console.error("❌ Error during graceful shutdown:", error);
    process.exitCode = 1;
  }
}

// Initialize database connection
AppDataSource.initialize()
  .then(() => {
    console.log("✅ Database connected successfully!");

    server = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`👥 Users API: http://localhost:${PORT}/api/users`);
      console.log(
        `📋 Tasks API: http://localhost:${PORT}/api/users/:userId/tasks`,
      );

      // Listen for shutdown signals
      process.on("SIGINT", () => {
        void gracefulShutdown("SIGINT");
      });

      process.on("SIGTERM", () => {
        void gracefulShutdown("SIGTERM");
      });
    });
  })
  .catch((error) => {
    console.error("❌ Database connection failed:", error);
    process.exitCode = 1;
  });