import { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Service Packages",
};

import AdminPackagesClient from "@/components/admin/AdminPackagesClient";

export default async function AdminPackagesPage() {
  const dbPackages = await prisma.package.findMany({
    orderBy: { price: 'asc' }
  });

  // Convert Decimal/Float to number if needed for JS serialization
  const formattedPackages = dbPackages.map(p => ({
    ...p,
    price: Number(p.price)
  }));

  return <AdminPackagesClient initialData={formattedPackages} />;
}
