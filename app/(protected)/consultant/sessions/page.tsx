import { getConsultantSessions } from "@/app/actions/consultant";
import { redirect } from "next/navigation";
import SessionsClient from "./SessionsClient";

export default async function ConsultantSessionsPage() {
  const sessions = await getConsultantSessions();

  if (!sessions) {
    redirect('/login');
  }

  return <SessionsClient initialSessions={sessions} />;
}
