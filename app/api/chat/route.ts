import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth-utils";
import { cookies } from "next/headers";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Mapping fixed messages to their responses as per old logic
const FIXED_RESPONSES: Record<string, string> = {
  "Optimize budget": "Based on your current financial data, I recommend focusing on optimizing your marketing spend and operational costs. Your revenue is growing well, but expenses need careful monitoring. Consider reviewing vendor contracts and exploring cost-effective alternatives.",
  "Market trends": "Market analysis shows your sector is experiencing steady growth. Key trends include digital transformation and sustainability initiatives. I recommend accessing our Market Reports library for detailed insights specific to your industry.",
  "Increase revenue": "Your revenue growth potential is high! To maintain momentum, I suggest: 1) Invest in customer retention programs, 2) Explore upselling opportunities with existing clients, 3) Set aside 20% for emergency reserves and 30% for growth investments.",
  "Get consultant advice": "I recommend scheduling a session with one of our expert consultants for personalized advice. Sarah Johnson specializes in budget optimization, while Michael Chen focuses on growth strategies. Both have excellent reviews from startup founders."
};

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
      include: { 
        founder: {
          include: {
            budgetAnalyses: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        } 
      }
    });

    if (!user || user.type !== 'FOUNDER' || !user.founder) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // --- PLAN LIMIT CHECK (Chapter 3 Compliance) ---
    // Fetch last payment to determine plan
    const lastPayment = await prisma.payment.findFirst({
      where: { founderId: user.founder.id },
      orderBy: { transDate: 'desc' },
      include: { subscription: true }
    });

    const isPaidPlan = lastPayment && lastPayment.subscription && lastPayment.amount >= 99;
    
    if (!isPaidPlan) {
      // Count messages for free trial
      const messageCount = await prisma.aIChatbot.count({
        where: { founderId: user.founder.id }
      });

      const FREE_LIMIT = 10;
      if (messageCount >= FREE_LIMIT) {
        return NextResponse.json({ 
          error: "Plan Limit Reached", 
          message: "You've reached the free limit of 10 AI interactions. Please upgrade to a Basic or Premium plan for unlimited financial advisory.",
          limitReached: true
        }, { status: 403 });
      }
    }
    // -----------------------------------------------

    const { message, isSuggestion } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // 1. Check for Fixed Responses if it's a suggestion or exact match
    if (isSuggestion || FIXED_RESPONSES[message]) {
        const reply = FIXED_RESPONSES[message] || FIXED_RESPONSES["Optimize budget"];
        
        // Save to DB even for fixed responses
        await prisma.aIChatbot.create({
          data: {
            founderId: user.founder.id,
            userMessage: message,
            sysResponse: reply,
          }
        });
        
        return NextResponse.json({ reply });
    }

    // 2. Perform Real AI Analysis (Gemini)
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const modelsToTry = [
        "gemini-3-flash", 
        "gemini-2.5-flash", 
        "gemini-2.5-flash-lite", 
        "gemini-1.5-flash", 
        "gemini-1.5-pro"
    ];

    const recentHistory = await prisma.aIChatbot.findMany({
      where: { founderId: user.founder.id },
      orderBy: { chatDate: 'desc' },
      take: 6
    });

    const chatHistory = recentHistory.reverse().map(chat => ([
      { role: "user", parts: [{ text: chat.userMessage }] },
      { role: "model", parts: [{ text: chat.sysResponse }] }
    ])).flat();

    const latestAnalysis = user.founder.budgetAnalyses[0];
    let analysisContext = "No budget analysis data available.";
    if (latestAnalysis) {
      const data = latestAnalysis.analysisData as Record<string, unknown>;
      analysisContext = `LATEST BUDGET: Total:${latestAnalysis.totalBudget}, Fixed:${latestAnalysis.fixedCost}, Variable:${latestAnalysis.variableCost}. Income:${data?.income || "N/A"}`;
    }

    const systemPrompt = `You are StartBot for "${user.founder.businessName}". Respond in English only. Provide professional financial advice. CONTEXT: ${analysisContext}`;
    const promptWithContext = `INSTRUCTIONS: ${systemPrompt}\n\nUSER: ${message}`;

    let aiResponse = "";
    let lastError = null;

    for (const modelName of modelsToTry) {
        try {
            console.log(`[CHAT_AI] Trying ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const chat = model.startChat({ history: chatHistory });
            const result = await chat.sendMessage(promptWithContext);
            aiResponse = (await result.response).text();
            if (aiResponse) break;
        } catch (err) {
            lastError = err;
            console.error(`[CHAT_AI_FAIL] ${modelName}:`, err);
        }
    }

    if (!aiResponse) {
        throw lastError || new Error("All AI models failed to respond");
    }

    // Save to DB
    await prisma.aIChatbot.create({
      data: {
        founderId: user.founder.id,
        userMessage: message,
        sysResponse: aiResponse,
      }
    });

    return NextResponse.json({ reply: aiResponse });
  } catch (error) {
    const err = error as Error;
    console.error("AI Chat API Error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
