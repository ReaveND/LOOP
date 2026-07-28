import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { UserRole } from "@/lib/generated/prisma/client";
import { NextRequest } from "next/server";

// export async function GET() {
//   const workspace = await prisma.workspace.findMany({
//   include: {
//     users: {
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         role: true,
//       },
//     },
//   },
// });

//   return NextResponse.json(workspace);
// }

// export async function GET() {
//   const user = await prisma.user.findUnique({
//     where: {
//       email: "reaverrupak@gmail.com",
//     },
//     select: {
//       id: true,
//       name: true,
//       email: true,
//       role: true,
//     },
//   });

//   return NextResponse.json(user);
// }

// export async function GET() {
//   const analysts = await prisma.user.findMany({
//     where: {
//       role: UserRole.ANALYST,
//     },

//     select: {
//       name: true,
//       email: true,
//       role: true,
//     },
//   });

//   return NextResponse.json(analysts);
// }

// export async function GET() {
//   const users = await prisma.user.findMany({
//     where: {
//       OR: [
//         { role: UserRole.ADMIN },
//         { role: UserRole.ANALYST },
//       ],
//     },

//     select: {
//       name: true,
//       email: true,
//       role: true,
//     },

//     orderBy: {
//       name: "asc",
//     },
//   });

//   return NextResponse.json(users);
// }

// export async function GET() {
//   const users = await prisma.user.findMany({
//     where: {
//       name: {
//         contains: "kar",
//         mode: "insensitive",
//       },
//     },

//     select: {
//       name: true,
//       email: true,
//       role: true,
//     },

//     orderBy: {
//       name: "asc",
//     },
//   });

//   return NextResponse.json(users);
// }

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get("search") ?? "";

  const users = await prisma.user.findMany({
    where: {
      name: {
        contains: search,
        mode: "insensitive",
      },
    },
    select: {
      name: true,
      email: true,
      role: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return NextResponse.json(users);
}