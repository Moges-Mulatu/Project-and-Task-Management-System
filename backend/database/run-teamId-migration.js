const mysql = require("mysql2/promise");
require("dotenv").config();

async function runMigration() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "0000",
      database: process.env.DB_NAME || "project_management",
      port: Number(process.env.DB_PORT) || 3306,
    });

    console.log("Connected to database...");

    // Check if column already exists
    const [columns] = await connection.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'tasks' AND COLUMN_NAME = 'teamId'`,
      [process.env.DB_NAME || "project_management"],
    );

    if (columns.length > 0) {
      console.log("✅ teamId column already exists in tasks table");
    } else {
      // Add the column
      await connection.execute(
        "ALTER TABLE tasks ADD COLUMN teamId VARCHAR(36) AFTER assignedBy",
      );
      console.log("✅ teamId column added successfully");

      // Add index for better performance
      await connection.execute(
        "CREATE INDEX idx_tasks_teamId ON tasks(teamId)",
      );
      console.log("✅ Index created on teamId column");
    }

    await connection.end();
    console.log("\n✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

runMigration();
