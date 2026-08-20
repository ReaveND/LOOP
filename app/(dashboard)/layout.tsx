import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findFirst({
    where: {
      OR: [
        { id: session.user.id },
        ...(session.user.email ? [{ email: session.user.email }] : [])
      ]
    },
    include: {
      workspace: true,
    },
  });

  if (!dbUser) {
    redirect("/login");
  }

  const user = {
    ...session.user,
    id: dbUser.id,
    workspaceId: dbUser.workspaceId,
    role: dbUser.role as any,
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <TopNav user={user} workspaceName={dbUser.workspace.name} />
      <div className="flex-1 flex relative">
        <Sidebar userRole={user.role} workspaceName={dbUser.workspace.name} />
        <main className="flex-1 overflow-auto">
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}