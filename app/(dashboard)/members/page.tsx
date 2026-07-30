import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { MembersClient } from './members-client';

export const metadata = {
  title: 'Members | LOOP',
  description: 'Manage your team and permissions',
};

export default async function MembersPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/login');
  }

  // Fetch dbUser to ensure correct workspaceId
  const dbUser = await prisma.user.findFirst({
    where: {
      OR: [
        { id: session.user.id },
        ...(session.user.email ? [{ email: session.user.email }] : []),
      ],
    },
  });

  if (!dbUser) {
    redirect('/login');
  }

  if (dbUser.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const initialMembers = await prisma.user.findMany({
    where: {
      workspaceId: dbUser.workspaceId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  const formattedMembers = initialMembers.map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    role: m.role,
    status: 'Active',
    avatar: m.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase(),
  }));

  return <MembersClient initialMembers={formattedMembers} currentUserId={dbUser.id} />;
}

