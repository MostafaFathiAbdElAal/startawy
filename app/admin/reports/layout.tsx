import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Industry Reports",
};

export default function AdminReportsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
