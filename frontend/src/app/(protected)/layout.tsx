import { redirect } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { refreshTokenCheck } from '@/utils/auth';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Redirect unauthenticated users to login if they're not logged in
  if (!(await refreshTokenCheck())) {
    redirect('/login');
  }

  return <AppLayout>{children}</AppLayout>;
}
