import { GoogleGenerativeAI } from "@google/generative-ai";

export interface AIAnalysisResult {
  fixedCost: number;
  variableCost: number;
  totalBudget: number;
  income: number;
  expenseBreakdown: { category: string; amount: number; percentage: number }[];
  monthlyTrend: { month: string; income: number; expenses: number }[];
  recommendations: { title: string; description: string; type: "marketing" | "revenue" | "expense" | "health" }[];
}

export class BudgetAIAnalyst {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });
  }

  async analyzeCSV(csvText: string): Promise<AIAnalysisResult> {
    const prompt = `
      You are a professional financial analyst. I will provide you with a CSV text containing financial transactions or budget data.
      
      TASK:
      1. Parse the financial data.
      2. Categorize all expenses into high-level categories (e.g., Marketing, Payroll, Operations, Tech, Rent).
      3. Identify which costs are Fixed (recurring, stable) and which are Variable (fluctuate with activity).
      4. Calculate the Total Income and Total Expenses.
      5. Generate 4 strategic recommendations for the startup based on the specific ratios and spending identified in this data.
      6. Generate a JSON response with the following structure:
      {
        "fixedCost": number,
        "variableCost": number,
        "totalBudget": number,
        "income": number,
        "expenseBreakdown": [
          { "category": string, "amount": number, "percentage": number }
        ],
        "monthlyTrend": [
            { "month": string, "income": number, "expenses": number }
        ],
        "recommendations": [
            { "title": string, "description": string, "type": "marketing" | "revenue" | "expense" | "health" }
        ]
      }

      RULES:
      - ONLY return the JSON object. No markdown, no explanations.
      - Ensure all numbers are positive.
      - Recommendations must be based on the provided data. For example, if marketing spend is high, suggest optimization.

      CSV DATA:
      ${csvText}
    `;

    // Try multiple models in sequence to find a working one
    const modelsToTry = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-1.5-flash-8b", "gemini-2.0-flash", "gemini-1.5-pro"];
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`[AI_TRYING_MODEL] ${modelName}`);
        const model = this.genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        
        console.log(`[AI_SUCCESS_WITH] ${modelName}`);
        console.log("[AI_RAW_DEBUG]", text);

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("AI returned invalid data format (No JSON object found)");
        }

        const jsonStr = jsonMatch[0];
        return JSON.parse(jsonStr) as AIAnalysisResult;
      } catch (error: any) {
        lastError = error;
        console.warn(`[AI_MODEL_FAILED] ${modelName}:`, error.message);
        // Continue to next model if it's a 404 or Quota issue
        if (error.message.includes("404") || error.message.includes("quota") || error.message.includes("429")) {
          continue;
        }
        break; // If it's a critical error (like Auth), stop early
      }
    }

    console.error("[AI_ANALYST_CRITICAL_FAILURE]", lastError);
    throw new Error("Failed to analyze financial data via all available AI models. Please check your API quota.");
  }
}
