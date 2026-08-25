import "dotenv/config";
import mongoose from "mongoose";

const dryRun = process.argv.includes("--dry-run");
const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/pg_finder";

async function migrate() {
  await mongoose.connect(uri);
  const properties = mongoose.connection.collection("properties");

  const activeFilter = { status: "Active" };
  const pendingFilter = { status: "Pending Verification" };
  const activeCount = await properties.countDocuments(activeFilter);
  const pendingCount = await properties.countDocuments(pendingFilter);

  console.log(`[migration] ${dryRun ? "dry run: " : ""}${activeCount} active and ${pendingCount} pending legacy properties found.`);

  if (!dryRun) {
    if (activeCount) {
      await properties.updateMany(activeFilter, {
        $set: { status: "active", verificationStatus: "verified" },
      });
    }
    if (pendingCount) {
      await properties.updateMany(pendingFilter, {
        $set: { status: "inactive", verificationStatus: "pending" },
      });
    }
    console.log("[migration] property statuses normalized. No properties were deleted.");
  }
}

migrate()
  .catch((error) => {
    console.error("[migration] failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });