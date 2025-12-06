import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    redirect('/login');
  }

  return <AppLayout>{children}</AppLayout>;
}
