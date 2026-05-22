import { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Feedback",
};

export default function AdminFeedbackLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
