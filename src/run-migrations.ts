import "reflect-metadata";
import { AppDataSource } from "./config/data-source";

async function runMigrations() {
  try {
    await AppDataSource.initialize();

    console.log("Database connected.");
    console.log("Running pending migrations...");

    const migrations = await AppDataSource.runMigrations();

    if (migrations.length === 0) {
      console.log("No pending migrations.");
    } else {
      migrations.forEach((migration) => {
        console.log(`Executed: ${migration.name}`);
      });
    }

    console.log("Migration process completed.");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

runMigrations();