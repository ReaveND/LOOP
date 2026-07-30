import { auth } from "@/lib/auth";
import { UserRole } from "@/lib/generated/prisma/client";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors";
import { prisma } from "@/lib/db";

/**
 * Returns the authenticated session.
 * Throws 401 if the user is not logged in.
 * Validates and syncs workspaceId from database in case database was re-seeded.
 */
export async function requireAuth() {
  const session = await auth();

  if (!session || !session.user) {
    throw new UnauthorizedError("Authentication required.");
  }

  // Look up user in DB by ID or Email to handle stale JWT workspaceId after seeding
  const dbUser = await prisma.user.findFirst({
    where: {
      OR: [
        { id: session.user.id },
        ...(session.user.email ? [{ email: session.user.email }] : [])
      ]
    }
  });

  if (!dbUser) {
    throw new UnauthorizedError("User no longer exists in database.");
  }

  // Sync session user attributes with DB record
  session.user.id = dbUser.id;
  session.user.workspaceId = dbUser.workspaceId;
  session.user.role = dbUser.role as any;

  return session;
}

/**
 * Ensures the authenticated user has one of the allowed roles.
 * Throws 403 if the role is not permitted.
 */
export async function requireRole(
  allowedRoles: UserRole[]
) {
  const session = await requireAuth();

  if (!allowedRoles.includes(session.user.role)) {
    throw new ForbiddenError(
      "You do not have permission to perform this action."
    );
  }

  return session;
}