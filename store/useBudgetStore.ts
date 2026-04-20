import { create } from "zustand";

interface ExpenseData {
  category: string;
  amount: number;
  percentage: number;
}

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
}

interface Recommendation {
  title: string;
  description: string;
  type: "marketing" | "revenue" | "expense" | "health";
}

interface BudgetState {
  uploadedFile: string | null;
  expenseData: ExpenseData[];
  monthlyData: MonthlyData[];
  recommendations: Recommendation[];
  metrics: {
    income: number;
    expenses: number;
    profit: number;
    incomeChange?: string;
    expensesChange?: string;
    profitStatus?: string;
  } | null;
  isLoading: boolean;
  hasData: boolean;

  setUploadedFile: (filename: string | null) => void;
  fetchBudgetData: () => Promise<void>;
  setData: (data: {
    expenseData?: ExpenseData[];
    monthlyData?: MonthlyData[];
    recommendations?: Recommendation[];
    metrics?: BudgetState['metrics'];
  } | null) => void;
}

export const useBudgetStore = create<BudgetState>((set) => ({
  uploadedFile: null,
  expenseData: [],
  monthlyData: [],
  recommendations: [],
  metrics: null,
  isLoading: false,
  hasData: false,

  setUploadedFile: (filename) => set({ uploadedFile: filename }),
  
  setData: (data) => set({
      expenseData: data?.expenseData || [],
      monthlyData: data?.monthlyData || [],
      recommendations: data?.recommendations || [],
      metrics: data?.metrics || null,
      hasData: !!data?.metrics,
      isLoading: false
  }),

  fetchBudgetData: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch("/api/budget");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      
      set({ 
        expenseData: data?.expenseData || [],
        monthlyData: data?.monthlyData || [],
        recommendations: data?.recommendations || [],
        metrics: data?.metrics || null,
        hasData: data?.hasData || false,
        isLoading: false 
      });
    } catch (error) {
      console.error("Failed to fetch budget data:", error);
      set({ isLoading: false });
    }
  },
}));
