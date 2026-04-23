import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth-utils";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AccessDenied } from "@/components/ui/AccessDenied";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const userPayload = await verifyAuth(token);

  if (!userPayload) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: userPayload.id } // Use standardized numeric ID
  });

  const isOwner = !!userPayload.isOwner;

  if (!user || (user.type !== 'ADMIN' && !isOwner)) {
    return <AccessDenied message="You must be an Administrator to view this page." />;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900 overflow-hidden text-gray-900 dark:text-gray-100">
      <Sidebar userRole="ADMIN" isOwner={isOwner} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar 
          userRole="ADMIN" 
          userName={user?.name} 
          userEmail={user?.email} 
          isVerified={user?.isEmailVerified}
          isOwner={isOwner}
        />
        <main className="flex-1 overflow-y-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
