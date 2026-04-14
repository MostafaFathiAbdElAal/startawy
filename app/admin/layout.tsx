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
    where: { id: parseInt(userPayload.id as string) }
  });

  const isOwner = user?.email === process.env.NEXT_PUBLIC_OWNER_EMAIL;

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
      <Sidebar userRole="ADMIN" userEmail={user?.email} />
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <TopBar 
          userRole="ADMIN" 
          userName={user?.name} 
          userEmail={user?.email} 
          isVerified={user?.isEmailVerified}
        />
        <main className="flex-1 overflow-y-auto w-full transition-all duration-300 relative">
          <div className="absolute inset-0 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
