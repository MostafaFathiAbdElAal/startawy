import { getHomePageData } from "@/app/actions/home";
import HomePageClient from "@/components/home/HomePageClient";
import { verifyAuth } from "@/lib/auth-utils";
import { cookies } from "next/headers";

export default async function HomePage() {
  const { reviews, stats } = await getHomePageData();
  
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const userPayload = await verifyAuth(token);
  const isAuthenticated = !!userPayload;

  return (
    <HomePageClient 
      initialReviews={reviews as any} 
      initialStats={stats} 
      serverIsAuthenticated={isAuthenticated}
    />
  );
}
