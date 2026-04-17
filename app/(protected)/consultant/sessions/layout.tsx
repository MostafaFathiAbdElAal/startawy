import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Consultation Sessions",
};

export default function ConsultantSessionsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
