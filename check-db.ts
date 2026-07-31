import { prisma } from './lib/db';

async function main() {
  const workspaces = await prisma.workspace.findMany({
    include: {
      _count: {
        select: { feedbacks: true }
      }
    }
  });
  console.log("Workspaces:", workspaces.map(w => ({ id: w.id, name: w.name, feedbacks: w._count.feedbacks })));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
