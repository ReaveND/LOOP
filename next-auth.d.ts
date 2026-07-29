import { DefaultSession } from "next-auth";
import { UserRole } from "@/lib/generated/prisma/enums";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: UserRole;
            workspaceId: string;
        } & DefaultSession["user"];
    }
    interface User {
        id: string;
        role: UserRole;
        workspaceId: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: UserRole;
        workspaceId: string;
    }
}

declare module "@auth/core/jwt" {
    interface JWT {
        id: string;
        role: UserRole;
        workspaceId: string;
    }
}

