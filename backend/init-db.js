const { testConnection, initializeDatabase } = require("./src/config/db");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const init = async () => {
  try {
    console.log("🚀 Starting Database Initialization...");

    // Test connection
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error(
        "❌ Could not connect to the database. Please check your .env file.",
      );
      process.exit(1);
    }

    // Run initialization
    const success = await initializeDatabase();

    if (success) {
      console.log("✨ Database initialized successfully!");
      console.log("📋 Default admin user created:");
      console.log("   Email: admin@toffanglass.com");
      console.log("   Password: admin123");
      process.exit(0);
    } else {
      console.error("❌ Database initialization failed.");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Unexpected error during initialization:", error);
    process.exit(1);
  }
};

init();
