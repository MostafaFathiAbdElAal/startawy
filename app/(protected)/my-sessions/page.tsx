import { Metadata } from "next";
import { getFounderSessions } from "@/app/actions/founder";
import { redirect } from "next/navigation";
import SectionHeader from "@/components/ui/SectionHeader";
import { MySessionsClient } from "@/components/founder/MySessionsClient";

export const metadata: Metadata = {
  title: "My Sessions | Startawy",
  description: "Manage your upcoming and past consultation sessions.",
};

export default async function MySessionsPage() {
  const sessions = await getFounderSessions();

  if (sessions === null) {
    redirect("/login");
  }

  return (
    <div className="p-4 sm:p-8 space-y-8 min-h-screen">
      <SectionHeader 
        title="Consultation Sessions"
        description="Review your active bookings and access past strategy notes from your consultants."
      />

      <MySessionsClient sessions={sessions} />
    </div>
  );
}
