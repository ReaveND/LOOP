import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  const email = session?.user?.email ?? null;

  const dbUser = email
    ? await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, workspaceId: true, role: true },
      })
    : null;

  const feedbackCount = dbUser?.workspaceId
    ? await prisma.feedback.count({ where: { workspaceId: dbUser.workspaceId } })
    : -1;

  return NextResponse.json({
    email,
    dbUser,
    feedbackCount,
  });
}