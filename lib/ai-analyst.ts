import { GoogleGenerativeAI } from "@google/generative-ai";

export interface AIAnalysisResult {
  fixedCost: number;
  variableCost: number;
  totalBudget: number;
  income: number;
  metrics: {
    incomeGrowth: number;
    expenseGrowth: number;
  };
  recommendations: { title: string; description: string; type: "marketing" | "revenue" | "expense" | "health" }[];
  expenseBreakdown: { category: string; amount: number; percentage: number }[];
  monthlyTrend: { month: string; income: number; expenses: number }[];
}

export class BudgetAIAnalyst {
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async analyzeCSV(csvText: string): Promise<AIAnalysisResult> {
    const prompt = `
      You are a professional financial analyst for startups. Analyze the following business transaction data and provide a comprehensive report in JSON format.
      
      DATA:
      ${csvText}
      
      REQUIRED JSON STRUCTURE:
      {
        "income": number (total monthly income),
        "fixedCost": number,
        "variableCost": number,
        "totalBudget": number (total monthly expenses),
        "metrics": {
          "incomeGrowth": number (percentage growth compared to last available period),
          "expenseGrowth": number (percentage growth compared to last available period)
        },
        "recommendations": [
          { "title": "string", "description": "string", "type": "marketing" | "revenue" | "expense" | "health" }
        ],
        "expenseBreakdown": [
          { "category": "string", "amount": number, "percentage": number }
        ],
        "monthlyTrend": [
          { "month": "string (Short Name, e.g. Jan)", "income": number, "expenses": number }
        ]
      }
      
      NOTE: 
      - Return ONLY the raw JSON object. 
      - Ensure all numbers are calculated accurately from the provided data.
      - Categorize items logically into the breakdown.
      - If only one month of data is present, provide at least that month in monthlyTrend.
    `;

    const modelsToTry = [
      "gemini-3-flash", 
      "gemini-2.5-flash", 
      "gemini-2.5-flash-lite", 
      "gemini-2.0-flash-exp",
      "gemini-1.5-flash", 
      "gemini-1.5-pro"
    ];
    console.log(`[AI_ANALYSIS_START] Models scheduled for attempt (Priority updated from dashboard):`, modelsToTry);
    
    let lastError = null;

    for (let i = 0; i < modelsToTry.length; i++) {
      const modelName = modelsToTry[i];
      try {
        console.log(`[AI_ATTEMPT ${i + 1}/${modelsToTry.length}] Trying model: ${modelName}...`);
        const model = this.genAI.getGenerativeModel({ model: modelName });
        
        const startTime = Date.now();
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const duration = Date.now() - startTime;
        
        console.log(`[AI_SUCCESS] Model ${modelName} responded in ${duration}ms`);

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.error(`[AI_PARSING_ERROR] Model ${modelName} returned non-JSON text:`, text.substring(0, 200));
          throw new Error("AI returned invalid data format (No JSON object found)");
        }

        const jsonStr = jsonMatch[0];
        const parsed = JSON.parse(jsonStr);
        
        // Basic validation and mapping for field names if needed
        return parsed as AIAnalysisResult;
      } catch (error: unknown) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`[AI_MODEL_FAILED] Model: ${modelName} -> ${lastError.message}`);
        
        const apiError = lastError as { status?: number | string; code?: number | string };
        if (apiError.status || apiError.code) {
          console.error(` -> API Status: ${apiError.status || 'N/A'}, Code: ${apiError.code || 'N/A'}`);
        }
        
        const errorMessage = lastError.message.toLowerCase();
        const isTemporary = 
          errorMessage.includes("404") || 
          errorMessage.includes("quota") || 
          errorMessage.includes("429") || 
          errorMessage.includes("503") || 
          errorMessage.includes("500") ||
          errorMessage.includes("unavailable") ||
          errorMessage.includes("high demand") ||
          errorMessage.includes("deadline");

        if (isTemporary && i < modelsToTry.length - 1) {
          continue;
        }
        break; 
      }
    }

    console.error("[AI_ANALYSIS_CRITICAL_FAILURE] All attempts failed.", lastError);
    throw new Error("Failed to analyze financial data via all available AI models.");
  }
}
