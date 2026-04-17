import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth-utils";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
        <h1 className="text-3xl font-bold text-red-600">Access Denied</h1>
        <p className="text-gray-600">You must be an Administrator to view this page.</p>
        <a href="/dashboard" className="text-teal-600 hover:underline">Return to Dashboard</a>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900 overflow-hidden text-gray-900 dark:text-gray-100">
      <Sidebar userRole="ADMIN" userEmail={user?.email} isOwner={isOwner} />
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
