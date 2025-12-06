import { redirect } from 'next/navigation';
import { refreshTokenCheck } from '@/utils/auth';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Redirect authenticated users to app if they're already logged in
  if (await refreshTokenCheck()) {
    redirect('/app');
  }

  return <>{children}</>;
}
