import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Platform Administrators",
};

export default function AdminManageAdminsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
