import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Availability Schedule",
};

export default function ConsultantAvailabilityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
