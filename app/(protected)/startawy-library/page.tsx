import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth-utils";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LibraryClient } from "@/components/library/LibraryClient";

export default async function StartawyLibraryPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const userPayload = await verifyAuth(token);

  if (!userPayload) redirect('/login');

  // Fetch real reports from DB if available
  const dbReports = await prisma.startawyReport.findMany({
    orderBy: { uploadDate: 'desc' },
  });

  // Base mock reports for presentation if DB is small/empty
  const baseReports = [
    {
      id: 9002,
      title: "SaaS Industry Trends Q1 2026",
      description: "Comprehensive analysis of SaaS market trends, pricing strategies, and growth insights.",
      image: "https://images.unsplash.com/photo-1618044733300-9472054094ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      pages: 38,
      downloads: 2614,
      category: "SaaS",
      tags: ["SaaS", "Technology"],
    },
    {
      id: 9003,
      title: "Fintech Market Analysis 2026",
      description: "In-depth research on fintech innovations, regulatory changes, and investment trends.",
      image: "https://images.unsplash.com/photo-1618044733300-9472054094ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      pages: 48,
      downloads: 1897,
      category: "Fintech",
      tags: ["Fintech", "Investment"],
    },
    {
      id: 9004,
      title: "E-Commerce Growth Strategies",
      description: "Explore strategies for scaling e-commerce businesses globally.",
      image: "https://images.unsplash.com/photo-1763739527737-e3626d731072?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      pages: 38,
      downloads: 1673,
      category: "E-Commerce",
      tags: ["E-Commerce", "Retail"],
    },
  ];

  // Merge DB Reports with Base Reports
  const finalReports = dbReports.length > 0 
    ? dbReports.map(r => ({
        id: r.id,
        title: `Startawy Global Report - ${r.industry}`,
        description: `Full detailed global report covering standard metrics and analysis for the ${r.industry} sector.`,
        image: "https://images.unsplash.com/photo-1618044733300-9472054094ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        pages: 25,
        downloads: 100,
        category: r.industry,
        tags: [r.industry],
      })).concat(baseReports)
    : baseReports;

  // Derive categories
  const mappedCategories = Array.from(new Set(finalReports.map(r => r.category)));
  const categories = ["All Reports", ...mappedCategories];

  const featuredReport = {
    id: 9001,
    title: "Q1 2026 Tech & Fintech Mega Analysis",
    description: "The most comprehensive analysis of digital payments, blockchain technology, neobanking trends, and regulatory insights.",
    date: "March 1, 2026",
    pages: 68,
    category: "Fintech",
    image: "",
    downloads: 5000,
    tags: ["Fintech"]
  };

  return (
    <LibraryClient 
      reports={finalReports} 
      featuredReport={featuredReport} 
      categories={categories} 
    />
  );
}
