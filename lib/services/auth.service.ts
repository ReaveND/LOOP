import bcrypt from "bcryptjs";

import { prisma } from "@/lib/db";
import { ConflictError } from "@/lib/errors";
import { UserRole } from "@/lib/generated/prisma/client";
import { SignupInput } from "@/lib/validations/auth";
import { SignupResponse } from "@/lib/types/auth";

export class AuthService {
  static async signup(data: SignupInput): Promise<SignupResponse> {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (existingUser) {
      throw new ConflictError(
        "An account with this email already exists."
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const workspace = await prisma.workspace.create({
      data: {
        name: data.workspaceName,

        users: {
          create: {
            name: data.name,
            email: data.email,
            passwordHash: hashedPassword,
            role: UserRole.ADMIN,
          },
        },
      },

      select: {
        id: true,
        name: true,

        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            workspaceId: true,
          },
        },
      },
    });

    return {
      workspaceId: workspace.id,
      workspaceName: workspace.name,
      user: workspace.users[0],
    };
  }
}