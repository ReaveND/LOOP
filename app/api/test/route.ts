import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { requireAuth } from "@/lib/permissions";
import { FeedbackService } from "@/lib/services/feedback.service";

export async function GET() {
  const result: Record<string, any> = {};

  // ── Step 1: Raw auth() ────────────────────────────────────────────────────
  try {
    const session = await auth();
    result.step1_auth = {
      ok: !!session?.user,
      jwtEmail: session?.user?.email ?? null,
      jwtUserId: session?.user?.id ?? null,
      jwtWorkspaceId: (session?.user as any)?.workspaceId ?? null,
      jwtRole: (session?.user as any)?.role ?? null,
    };
  } catch (e: any) {
    result.step1_auth = { error: e?.message };
  }

  // ── Step 2: requireAuth() (the same thing the feedback API uses) ──────────
  try {
    const session = await requireAuth();
    result.step2_requireAuth = {
      ok: true,
      userId: session.user.id,
      email: session.user.email,
      workspaceId: (session.user as any).workspaceId,
      role: (session.user as any).role,
    };
  } catch (e: any) {
    result.step2_requireAuth = { error: e?.message, status: (e as any)?.statusCode };
  }

  // ── Step 3: Direct feedback count using the resolved workspaceId ──────────
  try {
    const session = await auth();
    const email = session?.user?.email;
    const dbUser = email
      ? await prisma.user.findUnique({ where: { email }, select: { workspaceId: true } })
      : null;
    const wsId = dbUser?.workspaceId;
    const count = wsId ? await prisma.feedback.count({ where: { workspaceId: wsId } }) : -1;
    result.step3_directCount = { workspaceId: wsId, feedbackCount: count };
  } catch (e: any) {
    result.step3_directCount = { error: e?.message };
  }

  // ── Step 4: FeedbackService.list with resolved workspaceId ────────────────
  try {
    const session = await auth();
    const email = session?.user?.email;
    const dbUser = email
      ? await prisma.user.findUnique({ where: { email }, select: { workspaceId: true } })
      : null;
    const wsId = dbUser?.workspaceId;
    if (wsId) {
      const list = await FeedbackService.list(wsId, { page: 1, limit: 3 });
      result.step4_feedbackService = {
        total: list.pagination.total,
        firstItemContent: list.data[0]?.content?.slice(0, 60) ?? null,
      };
    } else {
      result.step4_feedbackService = { error: "no workspaceId resolved" };
    }
  } catch (e: any) {
    result.step4_feedbackService = { error: e?.message };
  }

  // ── Step 5: Raw /api/feedback response simulation ─────────────────────────
  // Check what requireAuth returns for role comparison
  try {
    const session = await requireAuth();
    const role = (session.user as any).role;
    const allowedRoles = ["ADMIN", "ANALYST", "VIEWER"];
    result.step5_roleCheck = {
      role,
      roleType: typeof role,
      allowedRoles,
      passes: allowedRoles.includes(role),
    };
  } catch (e: any) {
    result.step5_roleCheck = { error: e?.message };
  }

  return NextResponse.json(result, { status: 200 });
}