import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth-utils";
import { cookies } from "next/headers";

function getAIResponse(userInput: string): string {
  const input = userInput.toLowerCase();
  
  if (input.includes("budget") || input.includes("expenses")) {
    return "Based on your current financial data, I recommend focusing on optimizing your marketing spend and operational costs. Your revenue is growing well at 15.3%, but expenses increased by 28.2% last month. Consider reviewing vendor contracts and exploring cost-effective alternatives.";
  } else if (input.includes("revenue") || input.includes("income") || input.includes("profit")) {
    return "Your revenue growth is impressive! To maintain this momentum, I suggest: 1) Invest in customer retention programs (5x cheaper than acquisition), 2) Explore upselling opportunities with existing clients, 3) Set aside 20% for emergency reserves and 30% for growth investments.";
  } else if (input.includes("market") || input.includes("competition")) {
    return "Market analysis shows your sector is experiencing 12% YoY growth. Key trends include digital transformation and sustainability initiatives. I recommend accessing our Market Reports library for detailed insights specific to your industry.";
  } else if (input.includes("consultant") || input.includes("advisor")) {
    return "I recommend scheduling a session with one of our expert consultants for personalized advice. Sarah Johnson specializes in budget optimization, while Michael Chen focuses on growth strategies. Both have excellent reviews from startup founders.";
  } else {
    return "That's a great question! For detailed guidance on this topic, I recommend: 1) Reviewing your Budget Analysis dashboard for current metrics, 2) Checking the Market Reports section for industry insights, or 3) Booking a session with one of our expert consultants for personalized advice. Is there anything specific you'd like to know more about?";
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    const userPayload = await verifyAuth(token);

    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userPayload.id },
      include: { founder: true }
    });

    if (!user || user.type !== 'FOUNDER' || !user.founder) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Generate AI response
    // Delaying artificially slightly happens on the client, so API is fast
    const aiResponse = getAIResponse(message);

    // Save strictly to DB
    await prisma.aIChatbot.create({
      data: {
        founderId: user.founder.id,
        userMessage: message,
        sysResponse: aiResponse,
      }
    });

    return NextResponse.json({ reply: aiResponse });
  } catch (error) {
    console.error("AI Chat API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
