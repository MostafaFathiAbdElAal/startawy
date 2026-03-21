import { GuestGuard } from '@/components/auth/Guards';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <GuestGuard>
      {children}
    </GuestGuard>
  );
}
