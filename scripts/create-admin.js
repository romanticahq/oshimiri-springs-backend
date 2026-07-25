import "dotenv/config";
import { prisma } from "../src/config/prisma.js";
import { hashPassword } from "../src/utils/security.js";

const username = String(process.env.ADMIN_BOOTSTRAP_USERNAME || "").trim().toLowerCase();
const password = String(process.env.ADMIN_BOOTSTRAP_PASSWORD || "");

if (!username || password.length < 16) {
  throw new Error("Set ADMIN_BOOTSTRAP_USERNAME and an ADMIN_BOOTSTRAP_PASSWORD of at least 16 characters");
}

await prisma.adminUser.upsert({
  where: { username },
  update: { passwordHash: await hashPassword(password), active: true },
  create: { username, passwordHash: await hashPassword(password) },
});

console.log(`Administrator ${username} is ready.`);
await prisma.$disconnect();
