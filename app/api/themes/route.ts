import { NextResponse } from "next/server";
import { UserRole } from "@/lib/generated/prisma/client";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { withErrorHandler } from "@/lib/utils/with-error-handler";

// GET /api/themes — list all themes for the workspace (for filter dropdown)
export const GET = withErrorHandler(async () => {
  const session = await requireRole([
    UserRole.ADMIN,
    UserRole.ANALYST,
    UserRole.VIEWER,
  ]);

  const themes = await prisma.theme.findMany({
    where: { workspaceId: session.user.workspaceId },
    select: { id: true, name: true, color: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(themes);
});
