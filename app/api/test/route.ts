import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    // 1. Raw session (what's baked into the JWT cookie)
    const session = await auth();
    const jwtUserId = session?.user?.id ?? null;
    const jwtEmail = session?.user?.email ?? null;
    const jwtWorkspaceId = (session?.user as any)?.workspaceId ?? null;

    // 2. Fresh DB lookup (same logic as requireAuth)
    const dbUser = jwtEmail
      ? await prisma.user.findFirst({
          where: {
            OR: [
              ...(jwtUserId ? [{ id: jwtUserId }] : []),
              { email: jwtEmail },
            ],
          },
          select: { id: true, email: true, workspaceId: true, role: true },
        })
      : null;

    const dbWorkspaceId = dbUser?.workspaceId ?? null;

    // 3. Feedback counts per workspace in the DB
    const workspaces = await prisma.workspace.findMany({
      select: {
        id: true,
        name: true,
        _count: { select: { feedbacks: true, users: true } },
      },
    });

    // 4. Feedback count for the JWT workspaceId vs DB workspaceId
    const feedbackCountForJwt = jwtWorkspaceId
      ? await prisma.feedback.count({ where: { workspaceId: jwtWorkspaceId } })
      : -1;

    const feedbackCountForDb = dbWorkspaceId
      ? await prisma.feedback.count({ where: { workspaceId: dbWorkspaceId } })
      : -1;

    // 5. DB host (without credentials)
    const dbUrl = process.env.DATABASE_URL ?? "";
    const dbHostMatch = dbUrl.match(/@([^/]+)\//);
    const dbHost = dbHostMatch ? dbHostMatch[1] : "unknown";

    return NextResponse.json({
      dbHost,
      session: {
        jwtUserId,
        jwtEmail,
        jwtWorkspaceId,
      },
      dbUser,
      match: jwtWorkspaceId === dbWorkspaceId,
      feedbackCountForJwtWorkspaceId: feedbackCountForJwt,
      feedbackCountForDbWorkspaceId: feedbackCountForDb,
      allWorkspaces: workspaces,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "unknown error" }, { status: 500 });
  }
}