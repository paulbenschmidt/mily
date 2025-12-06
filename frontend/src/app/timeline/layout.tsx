import { AppLayout } from '@/components/AppLayout';

export default function TimelineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Timeline is semi-protected: shows public events for unauthenticated users,
  // friend events for authenticated users with a share
  return <AppLayout>{children}</AppLayout>;
}
