import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Professional Earnings",
};

export default function ConsultantEarningsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
