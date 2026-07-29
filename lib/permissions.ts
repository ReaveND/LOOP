import { auth } from "@/lib/auth";
import { UserRole } from "@/lib/generated/prisma/enums";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors";

/**
 * Returns the authenticated session.
 * Throws 401 if the user is not logged in.
 */
export async function requireAuth() {
  const session = await auth();

  if (!session) {
    throw new UnauthorizedError("Authentication required.");
  }

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