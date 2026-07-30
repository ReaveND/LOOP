import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { MembersClient } from './members-client';

export const metadata = {
  title: 'Members | LOOP',
  description: 'Manage your team and permissions',
};

export default async function MembersPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return <MembersClient />;
}
