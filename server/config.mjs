import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const config = {
  rootDir,
  port: Number(process.env.PORT || 8080),
  dbPath: process.env.DB_PATH || path.join(rootDir, "data", "data-arena.sqlite"),
  jwtSecret: process.env.JWT_SECRET || "change-this-secret-before-public-launch",
  adminEmail: process.env.ADMIN_EMAIL || "admin@dataarena.local",
  adminPassword: process.env.ADMIN_PASSWORD || "DataArena@2026!",
  pythonBin: process.env.PYTHON_BIN || "python",
  graderTimeoutMs: Number(process.env.GRADER_TIMEOUT_MS || 5000)
};
