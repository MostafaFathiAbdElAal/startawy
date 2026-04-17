import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Portfolio",
};

export default function ConsultantClientsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
