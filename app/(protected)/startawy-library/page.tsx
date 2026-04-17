import { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Industry Library",
};

import { verifyAuth } from "@/lib/auth-utils";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LibraryClient } from "@/components/library/LibraryClient";

export default async function StartawyLibraryPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const userPayload = await verifyAuth(token);

  if (!userPayload) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: userPayload.id },
    include: { 
      founder: {
        include: {
          payments: {
            orderBy: { transDate: 'desc' },
            take: 1
          }
        }
      } 
    }
  });

  if (!user || user.type !== 'FOUNDER' || !user.founder) {
    redirect('/login');
  }

  // Determine user tier
  const lastPayment = user.founder.payments[0];
  const userPlan = lastPayment?.amount === 299 ? 'Premium' : (lastPayment?.amount === 99 ? 'Basic' : 'Free');
  const userIndustry = user.founder.businessSector || "Startup";

  // Fetch real reports from DB
  const dbReports = await prisma.startawyReport.findMany({
    orderBy: { uploadDate: 'desc' },
  });

  // Transform DB Reports from JSON link to structured object
  const finalReports = dbReports.map(r => {
    let metadata = {
        title: `Report - ${r.industry}`,
        description: "Full research data for this sector.",
        image: "https://images.unsplash.com/photo-1618044733300-9472054094ee",
        pages: 20
    };

    try {
        const parsed = JSON.parse(r.link);
        metadata = { ...metadata, ...parsed };
    } catch (e) {
        // Fallback for non-json links (legacy)
        if (r.link.startsWith('http')) metadata.image = r.link;
    }

    return {
      id: r.id,
      title: metadata.title,
      description: metadata.description,
      image: metadata.image,
      pages: metadata.pages,
      downloads: Math.floor(Math.random() * 500) + 100, // Mock downloads count
      category: r.industry,
      tags: [r.industry, "Market Research"],
    };
  });

  // Derive categories for filtering
  const mappedCategories = Array.from(new Set(finalReports.map(r => r.category)));
  const categories = ["All Reports", ...mappedCategories];

  // Dynamic Featured Report (Take the latest one if available)
  const featuredReport = finalReports.length > 0 ? finalReports[0] : {
    id: 0,
    title: "Startawy Knowledge Base",
    description: "Welcome to the library! Please upload your first report from the Admin panel to see it featured here.",
    date: "Awaiting Data",
    pages: 0,
    category: "System",
    image: "",
    downloads: 0,
    tags: ["Onboarding"]
  };

  return (
    <LibraryClient 
      reports={finalReports} 
      featuredReport={featuredReport as any} 
      categories={categories}
      userPlan={userPlan}
      userIndustry={userIndustry}
    />
  );
}
