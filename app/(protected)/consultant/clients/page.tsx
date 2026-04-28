import { getConsultantClients } from "@/app/actions/consultant";
import { redirect } from "next/navigation";
import ClientsClient from "./ClientsClient";

export default async function ConsultantClientsPage() {
  const clients = await getConsultantClients();

  if (!clients) {
    redirect('/login');
  }

  return <ClientsClient initialClients={clients} />;
}
