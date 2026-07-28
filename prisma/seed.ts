import { prisma } from "../lib/db";
import { UserRole } from "../lib/generated/prisma/client";

async function main() {
  console.log("🌱 Seeding database...");

  const workspace = await prisma.workspace.create({
    data: {
      name: "Demo Workspace",

      users: {
        create: [
          {
            name: "Rupak Sarkar",
            email: "reaverrupak@gmail.com",
            passwordHash: "password123", // We'll hash this later
            role: UserRole.ADMIN,
          },
          {
            name: "Srabani Kar",
            email: "srabanikar02@gmail.com",
            passwordHash: "password123",
            role: UserRole.ANALYST,
          },
          {
            name: "Bidusha Halder",
            email: "bidushak098@gmail.com",
            passwordHash: "password123",
            role: UserRole.VIEWER,
          },
        ],
      },
    },

    include: {
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  console.log("✅ Workspace and users created successfully!");
  console.dir(workspace, { depth: null });
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });