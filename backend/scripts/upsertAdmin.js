const dotenv = require("dotenv");
const connectDB = require("../config/db");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

dotenv.config();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const fullName = process.env.ADMIN_FULL_NAME?.trim() || "Admin User";
  const phone = process.env.ADMIN_PHONE?.trim();

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required.");
  }

  await connectDB();

  const existing = await User.findOne({ email });
  const passwordHash = await bcrypt.hash(password, 10);

  if (existing) {
    existing.full_name = fullName;
    existing.phone = phone || existing.phone;
    existing.password_hash = passwordHash;
    existing.role = "admin";
    existing.status = "active";
    await existing.save();

    console.log(`Updated existing user to admin: ${email}`);
    return;
  }

  if (!phone) {
    throw new Error("ADMIN_PHONE is required when creating a new admin user.");
  }

  await User.create({
    full_name: fullName,
    email,
    phone,
    password_hash: passwordHash,
    role: "admin",
    status: "active"
  });

  console.log(`Created admin user: ${email}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
