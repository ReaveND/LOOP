import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const workspace = await prisma.workspace.findMany({
  include: {
    users: {
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    },
  },
});

  return NextResponse.json(workspace);
}