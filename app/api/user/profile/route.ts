import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { withErrorHandler } from "@/lib/utils/with-error-handler";
import { z } from "zod";
import bcrypt from "bcryptjs";

const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email address"),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

// GET /api/user/profile
export const GET = withErrorHandler(async () => {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const userEmail = session.user.email;

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        ...(userId ? [{ id: userId }] : []),
        ...(userEmail ? [{ email: userEmail }] : []),
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      workspace: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
});

// PUT /api/user/profile (Update Name & Email)
export const PUT = withErrorHandler(async (req: Request) => {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = updateProfileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid input", errors: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const currentUser = await prisma.user.findFirst({
    where: {
      OR: [
        ...(session.user.id ? [{ id: session.user.id }] : []),
        ...(session.user.email ? [{ email: session.user.email }] : []),
      ],
    },
  });

  if (!currentUser) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  // Check if email is already taken by another user
  if (parsed.data.email !== currentUser.email) {
    const existing = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });
    if (existing && existing.id !== currentUser.id) {
      return NextResponse.json(
        { message: "Email address is already in use" },
        { status: 400 }
      );
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: currentUser.id },
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(updatedUser);
});

// PATCH /api/user/profile (Change Password)
export const PATCH = withErrorHandler(async (req: Request) => {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = changePasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid input", errors: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        ...(session.user.id ? [{ id: session.user.id }] : []),
        ...(session.user.email ? [{ email: session.user.email }] : []),
      ],
    },
  });

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const isValidPassword = await bcrypt.compare(
    parsed.data.currentPassword,
    user.passwordHash
  );

  if (!isValidPassword) {
    return NextResponse.json(
      { message: "Current password is incorrect" },
      { status: 400 }
    );
  }

  const newPasswordHash = await bcrypt.hash(parsed.data.newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newPasswordHash },
  });

  return NextResponse.json({ message: "Password updated successfully" });
});
