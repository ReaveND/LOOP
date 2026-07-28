import { UserRole } from "@/lib/generated/prisma/client";

export type SignupResponse = {
  workspaceId: string;
  workspaceName: string;

  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    workspaceId: string;
  };
};

export type LoginResponse = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  workspaceId: string;
};