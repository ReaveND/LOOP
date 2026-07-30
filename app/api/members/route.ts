import { NextResponse } from "next/server";
import { UserRole } from "@/lib/generated/prisma/client";
import { requireRole } from "@/lib/permissions";
import { prisma } from "@/lib/db";
import { withErrorHandler } from "@/lib/utils/with-error-handler";
import bcrypt from "bcryptjs";

// GET /api/members - Fetch workspace members
export const GET = withErrorHandler(async () => {
  const session = await requireRole([
    UserRole.ADMIN,
    UserRole.ANALYST,
    UserRole.VIEWER,
  ]);

  const members = await prisma.user.findMany({
    where: {
      workspaceId: session.user.workspaceId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return NextResponse.json(members);
});

// POST /api/members - Invite a new member
export const POST = withErrorHandler(async (req: Request) => {
  const session = await requireRole([UserRole.ADMIN]);
  const body = await req.json();

  const { email, role, name } = body;

  if (!email || typeof email !== "string") {
    return NextResponse.json({ message: "Email is required" }, { status: 400 });
  }

  const validRoles = [UserRole.ADMIN, UserRole.ANALYST, UserRole.VIEWER];
  const userRole = validRoles.includes(role) ? role : UserRole.VIEWER;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return NextResponse.json(
      { message: "A user with this email already exists" },
      { status: 400 }
    );
  }

  // Default initial password for invited user
  const hashedPassword = await bcrypt.hash("password123", 12);
  const memberName = name || email.split("@")[0];

  const newUser = await prisma.user.create({
    data: {
      name: memberName,
      email,
      passwordHash: hashedPassword,
      role: userRole,
      workspaceId: session.user.workspaceId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return NextResponse.json(newUser, { status: 201 });
});
