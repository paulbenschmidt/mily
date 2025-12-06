import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  // Redirect authenticated users away from auth pages if they're already logged in
  if (accessToken) {
    redirect('/app');
  }

  return <>{children}</>;
}
