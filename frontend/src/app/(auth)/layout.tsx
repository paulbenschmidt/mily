import { redirect } from 'next/navigation';
import { refreshTokenCheck } from '@/utils/auth';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Redirect authenticated users away from auth pages if they're already logged in
  if (await refreshTokenCheck()) {
    redirect('/app');
  }

  return <>{children}</>;
}
