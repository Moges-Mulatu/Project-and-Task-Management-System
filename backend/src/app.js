import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";
import teamRoutes from "./routes/team.routes.js";
import reportRoutes from "./routes/report.routes.js";
import { sendError } from "./utils/response.util.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import { getDBConnection } from "./config/db.config.js";
import { protect } from "./middlewares/auth.middleware.js";

const app = express();

// 1. Security Middleware
app.use(helmet());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:5176",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
      "http://127.0.0.1:5175",
      "http://127.0.0.1:5176",
      "http://10.0.2.2:5000",
    ],
    credentials: true,
  }),
);

// 2. Body Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Helper function to redact sensitive fields
function redactSensitiveFields(obj) {
  const sensitive = [
    "password",
    "token",
    "accessToken",
    "refreshToken",
    "secret",
    "jwt",
  ];
  if (typeof obj !== "object" || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(redactSensitiveFields);

  const redacted = {};
  for (const [key, value] of Object.entries(obj)) {
    const keyLower = key.toLowerCase();
    if (sensitive.some((s) => keyLower.includes(s))) {
      redacted[key] = "[REDACTED]";
    } else if (typeof value === "object") {
      redacted[key] = redactSensitiveFields(value);
    } else {
      redacted[key] = value;
    }
  }
  return redacted;
}

// 3. Logging Middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  app.use((req, res, next) => {
    const oldSend = res.send;
    res.send = function (data) {
      if (process.env.NODE_ENV === "development") {
        let safeData = data;
        try {
          const parsed = typeof data === "string" ? JSON.parse(data) : data;
          if (parsed && typeof parsed === "object") {
            safeData = JSON.stringify(redactSensitiveFields(parsed), null, 2);
          }
        } catch (e) {
          // Not JSON, log as-is but truncate
          safeData = data.length > 500 ? "Large Content" : data;
        }
        console.log(`📤 OUTGOING [${req.method} ${req.url}]:`, safeData);
      }
      oldSend.apply(res, arguments);
    };
    next();
  });
}

// 4. Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/teams", teamRoutes);
app.use("/api/v1/reports", reportRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

app.get("/api/v1/system-stats", protect, async (req, res) => {
  const connection = getDBConnection();
  const [u] = await connection.execute("SELECT count(*) as count FROM users");
  const [p] = await connection.execute(
    "SELECT count(*) as count FROM projects",
  );
  const [t] = await connection.execute("SELECT count(*) as count FROM tasks");
  res.json({ users: u[0].count, projects: p[0].count, tasks: t[0].count });
});

// 5. 404 Error Handling
app.use((req, res, next) => {
  return sendError(res, `Route ${req.originalUrl} not found`, 404);
});

// 6. Global Error Handling Middleware
app.use(errorMiddleware);

export default app;
