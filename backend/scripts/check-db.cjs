const mongoose = require("mongoose");
require("dotenv/config");

const uri = process.env.MONGODB_URI || "";

function redact(input) {
  if (typeof input !== "string") return input;
  return input
    .replace(/\/\/([^:@/]+):([^@/]+)@/g, "//$1:*****@")
    .replace(/([?&]password=)[^&\s]+/gi, "$1*****");
}

(async () => {
  if (!uri) {
    console.error("MONGODB_URI is not set. Add it to backend/.env");
    process.exit(1);
  }

  console.log("Checking MongoDB connection...");
  console.log("URI (redacted):", redact(uri));

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15_000,
      connectTimeoutMS: 10_000,
    });

    console.log(`SUCCESS: connected to MongoDB (database: ${mongoose.connection.name})`);
    await mongoose.disconnect();
  } catch (error) {
    console.error(`FAILED: ${redact(error.message || String(error))}`);
    console.error("");
    console.error("Most likely causes and fixes:");
    console.error("  1. IP not whitelisted  -> Atlas UI > Network Access > Add IP");
    console.error("     (or 'Allow access from anywhere' with 0.0.0.0/0 for dev).");
    console.error("  2. Bad credentials      -> Atlas UI > Database Access > Edit user");
    console.error("     (verify the database user & password in MONGODB_URI).");
    console.error("  3. Wrong cluster URI    -> copy it fresh from");
    console.error("     Atlas UI > Database > Connect > Drivers.");
    process.exit(1);
  }
})();