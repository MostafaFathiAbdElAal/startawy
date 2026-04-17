import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Share Feedback",
};

export default function FounderFeedbackLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
