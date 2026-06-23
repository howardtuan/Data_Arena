import { config } from "./config.mjs";
import { resetDatabaseFile } from "./db.mjs";

resetDatabaseFile();
console.log(`DataArena database reset and seeded at ${config.dbPath}`);
console.log(`Admin email: ${config.adminEmail}`);
