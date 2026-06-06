require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  const email = "superadmin@danaba.com";
  const exists = await User.findOne({ email });

  if (!exists) {
    await User.create({
      full_name: "Super Admin",
      email,
      phone: "0700000000",
      password_hash: "Admin@12345",
      role: "superadmin",
      status: "active"
    });
    console.log("Superadmin created: superadmin@danaba.com / Admin@12345");
  } else {
    exists.full_name = "Super Admin";
    exists.phone = "0700000000";
    exists.password_hash = "Admin@12345";
    exists.role = "superadmin";
    exists.status = "active";
    exists.blocked = false;
    await exists.save();
    console.log("Superadmin repaired: superadmin@danaba.com / Admin@12345");
  }

  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
