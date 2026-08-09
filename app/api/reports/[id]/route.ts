import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/permissions";
import { UserRole } from "@/lib/generated/prisma/client";

// ─── GET /api/reports/[id] ────────────────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole([
      UserRole.ADMIN,
      UserRole.ANALYST,
      UserRole.VIEWER,
    ]);
    const workspaceId = session.user.workspaceId;
    const { id } = await params;

    const report = await prisma.report.findFirst({
      where: { id, workspaceId },
      include: {
        generatedBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json({ data: report });
  } catch (err: any) {
    const status = err?.statusCode ?? 500;
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status }
    );
  }
}

// ─── DELETE /api/reports/[id] ─────────────────────────────────────────────────
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole([UserRole.ADMIN]);
    const workspaceId = session.user.workspaceId;
    const { id } = await params;

    const report = await prisma.report.findFirst({
      where: { id, workspaceId },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    await prisma.report.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    const status = err?.statusCode ?? 500;
    return NextResponse.json(
      { error: err?.message ?? "Internal server error" },
      { status }
    );
  }
}
