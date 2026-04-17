import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customer Support",
};

export default function AdminSupportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
