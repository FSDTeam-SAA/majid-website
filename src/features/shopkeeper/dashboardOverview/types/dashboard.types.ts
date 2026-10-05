export type DashboardFilter = "daily" | "monthly" | "yearly";

export interface BusinessHealthScore {
  overall: number;
  rating: "Excellent" | "Good" | "Fair" | "Needs Improvement" | "Critical";
  benchmark: number;
  message: string;
}

export interface DashboardMetric {
  score: number;
  status: string;
}

export interface DashboardStatsResponse {
  totalSales: number;
  totalProfit: number;
  totalOrders: number;
  avgOrderValue: number;
  salesGrowth: number;
  profitGrowth: number;
  ordersGrowth: number;
  avgOrderGrowth: number;
  businessHealthScore: BusinessHealthScore;
  metrics: {
    salesGrowth: DashboardMetric;
    profitMargin: DashboardMetric;
    stockManagement: DashboardMetric;
    customerSatisfaction: DashboardMetric;
    outstandingPayments: DashboardMetric;
  };
  insights: string[];
}

export interface CashManagementResponse {
  _id?: string;
  shopkeeperId:
    | string
    | {
        _id: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        phone?: string;
      };
  startingDayCash: number;
  banked: number;
  cashInDrawer: number;
  cashManagementScore: number;
  aiInsight?: string;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CashManagementInput {
  shopkeeperId: string;
  startingDayCash: number;
  banked?: number;
  cashInDrawer?: number;
}

export interface PeriodCashMetrics {
  cashSales: number;
  cashExpenses: number;
  netCash: number;
  invoiceCount: number;
  expenseCount: number;
}

export interface CashExpenseItem {
  id: string;
  invoiceNumber?: string;
  date: string | Date;
  amount: number;
  description: string;
  sellerName?: string;
  pdfUrl?: string;
  paymentMethod: string;
}

export interface CashDrawerMetricsResponse {
  startingDayCash: number;
  banked: number;
  cashScore: number;
  aiInsight: string;
  availableCashToday: number;
  previousSalesTotal: number;
  todayMetrics: PeriodCashMetrics;
  yesterdayMetrics: PeriodCashMetrics;
  lastWeekMetrics: PeriodCashMetrics;
  lastMonthMetrics: PeriodCashMetrics;
  allTimeMetrics: PeriodCashMetrics;
  cashExpensesList: CashExpenseItem[];
}
