import { prisma } from "../lib/db";

async function main() {
  console.log("Seeding database...");

  const workspace = await prisma.workspace.create({
    data: {
      name: "Demo Workspace",
    },
  });

  console.log("✅ Workspace created:", workspace);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });