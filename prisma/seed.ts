import { prisma } from "../lib/db";
import { UserRole } from "../lib/generated/prisma/client";

async function main() {
  console.log("🌱 Seeding database...");

  const workspace = await prisma.workspace.create({
    data: {
      name: "Demo Workspace",

      users: {
        create: {
          name: "Rupak",
          email: "reaverrupak@gmail.com",
          passwordHash: "password123", // We'll hash this later
          role: UserRole.ADMIN,
        },
      },
    },
    include: {
      users: true,
    },
  });

  console.log("✅ Workspace created successfully!");
  console.log(workspace);
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });