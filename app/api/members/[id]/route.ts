import { NextResponse } from "next/server";
import { UserRole } from "@/lib/generated/prisma/client";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { withErrorHandler } from "@/lib/utils/with-error-handler";

// PATCH /api/members/[id] - Update user role
export const PATCH = withErrorHandler(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const session = await requireRole([UserRole.ADMIN]);
    const { id } = await params;
    const body = await req.json();

    const { role } = body;
    const validRoles = [UserRole.ADMIN, UserRole.ANALYST, UserRole.VIEWER];

    if (!role || !validRoles.includes(role)) {
      return NextResponse.json({ message: "Invalid role" }, { status: 400 });
    }

    // Ensure member belongs to admin's workspace
    const member = await prisma.user.findFirst({
      where: {
        id,
        workspaceId: session.user.workspaceId,
      },
    });

    if (!member) {
      return NextResponse.json({ message: "Member not found" }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  }
);

// DELETE /api/members/[id] - Remove member from workspace
export const DELETE = withErrorHandler(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const session = await requireRole([UserRole.ADMIN]);
    const { id } = await params;

    // Prevent admin from deleting themselves
    if (id === session.user.id) {
      return NextResponse.json(
        { message: "You cannot remove yourself from the workspace" },
        { status: 400 }
      );
    }

    const member = await prisma.user.findFirst({
      where: {
        id,
        workspaceId: session.user.workspaceId,
      },
    });

    if (!member) {
      return NextResponse.json({ message: "Member not found" }, { status: 404 });
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Member removed successfully" });
  }
);
