import { AppLayout } from '@/components/AppLayout';

export default function TimelineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout requireAuth={false}>{children}</AppLayout>;
}
