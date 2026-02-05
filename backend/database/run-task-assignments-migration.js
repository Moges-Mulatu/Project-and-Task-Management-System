import mysql from "mysql2/promise";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  let connection;

  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "debo_task_mgmt",
      port: process.env.DB_PORT || 3306,
    });

    console.log("✅ Connected to database");

    // Read SQL file
    const sqlFile = join(__dirname, "add-task-assignments-table.sql");
    const sql = readFileSync(sqlFile, "utf8");

    // Execute SQL
    console.log("📝 Creating task_assignments table...");
    const statements = sql.split(";").filter((stmt) => stmt.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement);
      }
    }

    console.log("✅ Migration completed successfully!");
    console.log("📋 Summary:");
    console.log("  - Created task_assignments table");
    console.log("  - Added foreign key constraints");
    console.log("  - Added indexes for performance");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log("🔌 Database connection closed");
    }
  }
}

runMigration();
