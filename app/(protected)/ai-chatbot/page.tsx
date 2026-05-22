import { Metadata } from "next";
import { ChatInterface, type Message } from "@/components/chat/ChatInterface";

export const metadata: Metadata = {
  title: "AI Strategic Advisor",
};

import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth-utils";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AIChatbotPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const userPayload = await verifyAuth(token);

  if (!userPayload) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { id: userPayload.id },
    include: { founder: true }
  });

  if (!user || user.type !== 'FOUNDER' || !user.founder) {
    return <div className="p-8 text-center text-red-500">Access denied. Founders only.</div>;
  }

  // Fetch recent chat history
  const dbHistory = await prisma.aIChatbot.findMany({
    where: { founderId: user.founder.id },
    orderBy: { chatDate: 'asc' },
    take: 50 // Last 50 interaction pairs
  });

  const history: Message[] = [
    {
      id: 0,
      role: "assistant",
      content: "Hello! I'm StartBot, your AI Financial Advisor. How can I help you today? You can ask me about budget planning, financial strategies, market trends, or any business-related questions.",
      timestamp: new Date()
    }
  ];

  /* dbHistory has userMessage and sysResponse. Flattening them into sequential history */
  dbHistory.forEach((record: { id: number; userMessage: string; sysResponse: string; chatDate: Date }) => {
    history.push({
      id: record.id * 2,
      role: "user",
      content: record.userMessage,
      timestamp: record.chatDate
    });
    history.push({
      id: record.id * 2 + 1,
      role: "assistant",
      content: record.sysResponse,
      timestamp: record.chatDate // or chatTime
    });
  });

  return (
    <ChatInterface initialHistory={history} />
  );
}
