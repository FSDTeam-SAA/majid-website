"use client";

import React, { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  BadgeDollarSign,
  Package,
  Wallet,
  TrendingUp,
  Star,
  FileText,
  Loader2,
  Users,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useDashboardOverview } from "../hooks/useDashboardOverview";
import { useShop } from "@/features/shopkeeper/shop/store/shop.store";
import { useCurrency } from "@/hooks/useCurrency";
import { useMyProfile } from "@/features/shopkeeper/settings/hooks/useSettings";
import type {
  DashboardFilter,
  DashboardMetric,
} from "../types/dashboard.types";

const metricStyles = {
  salesGrowth: {
    name: "Sales Growth",
    icon: TrendingUp,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-50 dark:bg-emerald-950/20",
    color: "#10B981",
  },
  profitMargin: {
    name: "Profit Margin",
    icon: Wallet,
    iconColor: "text-violet-600 dark:text-violet-400",
    iconBg: "bg-violet-50 dark:bg-violet-950/20",
    color: "#8B5CF6",
  },
  stockManagement: {
    name: "Stock Management",
    icon: Package,
    iconColor: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-50 dark:bg-blue-950/20",
    color: "#3B82F6",
  },
  customerSatisfaction: {
    name: "Customer Satisfaction",
    icon: Star,
    iconColor: "text-amber-500 dark:text-amber-400",
    iconBg: "bg-amber-50 dark:bg-amber-950/20",
    color: "#F59E0B",
  },
  outstandingPayments: {
    name: "Outstanding Payments",
    icon: FileText,
    iconColor: "text-rose-600 dark:text-rose-400",
    iconBg: "bg-rose-50 dark:bg-rose-950/20",
    color: "#F43F5E",
  },
};

const formatNumber = (value = 0) =>
  new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 }).format(value);

const formatGrowth = (value = 0) =>
  `${value >= 0 ? "↗" : "↘"} ${Math.abs(value).toFixed(1)}%`;

const getGrowthClass = (value = 0) =>
  value >= 0 ? "text-emerald-500" : "text-rose-500";

const previousFromGrowth = (current: number, growth: number) => {
  if (!current || growth <= -100) return 0;
  return current / (1 + growth / 100);
};

const periodLabel: Record<DashboardFilter, string> = {
  daily: "Day",
  monthly: "Month",
  yearly: "Year",
};

export default function DashboardOverview() {
  const [period, setPeriod] = useState<DashboardFilter>("monthly");
  const [startingCash, setStartingCash] = useState("");
  const { formatCurrency, convertAmount } = useCurrency();
  const { data: session, status } = useSession();
  const shopkeeperId = (session?.user as { id?: string })?.id;
  const { activeShopId } = useShop();

  const { data: profileData } = useMyProfile({
    enabled: status === "authenticated",
  });

  const sessionUser = session?.user as
    { name?: string | null; firstName?: string | null } | undefined;
  const firstName =
    profileData?.data?.firstName || sessionUser?.name?.split(" ")[0] || "User";

  const {
    stats,
    cashManagement,
    isLoading,
    isFetching,
    error,
    saveCashManagement,
    isSavingCashManagement,
  } = useDashboardOverview(shopkeeperId, period, activeShopId);

  const handleStartingCashSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const cashValue = Number(startingCash);

    if (!shopkeeperId) {
      toast.error("Session not found");
      return;
    }

    if (!startingCash || Number.isNaN(cashValue) || cashValue < 0) {
      toast.error("Enter a valid starting cash amount");
      return;
    }

    try {
      await saveCashManagement({
        shopkeeperId,
        startingDayCash: cashValue,
        banked: cashManagement?.banked || 0,
        cashInDrawer: cashManagement?.cashInDrawer || 0,
      });
      setStartingCash("");
      toast.success("Starting day cash updated");
    } catch (err: unknown) {
      const errorObj = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const message =
        errorObj.response?.data?.message ||
        errorObj.message ||
        "Failed to update cash management";
      toast.error(message);
    }
  };

  const pageIsLoading = status === "loading" || isLoading;
  const errorObj = error as {
    response?: { data?: { message?: string } };
    message?: string;
  } | null;
  const errorMessage =
    errorObj?.response?.data?.message || errorObj?.message || "";

  // Data mapping for charts
  const salesData = useMemo(() => {
    const currentSales = stats?.totalSales || 0;
    const previousSales = previousFromGrowth(
      currentSales,
      stats?.salesGrowth || 0,
    );
    const currentOrders = stats?.totalOrders || 0;
    const previousOrders = previousFromGrowth(
      currentOrders,
      stats?.ordersGrowth || 0,
    );

    return [
      {
        name: `Prev ${periodLabel[period]}`,
        current: convertAmount(previousSales),
        orders: previousOrders,
      },
      {
        name: `This ${periodLabel[period]}`,
        current: convertAmount(currentSales),
        orders: currentOrders,
      },
    ];
  }, [stats, period, convertAmount]);

  const pieData = useMemo(() => {
    if (!stats?.metrics) return [];
    return Object.entries(stats.metrics).map(([key, metric]) => ({
      name: metricStyles[key as keyof typeof metricStyles].name,
      value: Math.max(1, metric.score),
      color: metricStyles[key as keyof typeof metricStyles].color,
    }));
  }, [stats]);

  const metricsEntries = stats?.metrics
    ? (Object.entries(stats.metrics) as Array<
        [keyof typeof metricStyles, DashboardMetric]
      >)
    : [];

  return (
    <div className="dashboard-page text-slate-800 transition-colors duration-300 dark:text-slate-100 bg-[#F8FAFC] dark:bg-[#0F172A] min-h-screen p-4 md:p-8 font-sans">
      <div className="dashboard-container max-w-7xl mx-auto">
        {!shopkeeperId && status !== "loading" ? (
          <div className="mt-8 rounded-3xl border border-slate-100 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
              Session not found
            </p>
          </div>
        ) : pageIsLoading ? (
          <div className="mt-8 rounded-3xl border border-slate-100 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-violet-600 mb-4" />
            <p className="text-sm font-semibold text-slate-500">
              Loading dashboard data...
            </p>
          </div>
        ) : errorMessage ? (
          <div className="mt-8 rounded-3xl border border-slate-100 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-bold text-rose-500">{errorMessage}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Left Column: Sales Overview */}
            <div className="xl:col-span-4 flex flex-col gap-6">
              <div className="mb-2">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Welcome, {firstName}{" "}
                  <span className="text-2xl" role="img" aria-label="party">
                    🎉
                  </span>
                </h1>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                  Here&apos;s what happening in your store.
                  {isFetching && (
                    <Loader2 className="h-3 w-3 animate-spin text-slate-400" />
                  )}
                </p>
              </div>

              <div className="bg-slate-100/50 dark:bg-slate-800/20 rounded-[32px] p-4 flex flex-col gap-4">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white ml-2 mt-2">
                  Sales Overview
                </h2>

                {/* Card 1: Total Revenue */}
                <div className="bg-[#FFF4E6] dark:bg-orange-950/40 rounded-3xl p-6 shadow-sm border border-orange-100/50 dark:border-orange-900/30">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/60 flex items-center justify-center text-orange-500">
                      <BadgeDollarSign className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        {formatCurrency(stats?.totalSales || 0)}
                      </h3>
                      <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                        Total Revenue
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[13px] font-bold mt-4">
                    <span className={getGrowthClass(stats?.salesGrowth || 0)}>
                      {formatGrowth(stats?.salesGrowth || 0)}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500 font-medium">
                      From Last {periodLabel[period]}
                    </span>
                  </div>
                </div>

                {/* Card 2: Total Orders */}
                <div className="bg-[#F3F0FF] dark:bg-violet-950/40 rounded-3xl p-6 shadow-sm border border-violet-100/50 dark:border-violet-900/30">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900/60 flex items-center justify-center text-violet-500">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        {formatNumber(stats?.totalOrders || 0)}
                      </h3>
                      <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                        Total Orders
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[13px] font-bold mt-4">
                    <span className={getGrowthClass(stats?.ordersGrowth || 0)}>
                      {formatGrowth(stats?.ordersGrowth || 0)}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500 font-medium">
                      From Last {periodLabel[period]}
                    </span>
                  </div>
                </div>

                {/* Card 3: Total Profit */}
                <div className="bg-[#E6FAFA] dark:bg-cyan-950/40 rounded-3xl p-6 shadow-sm border border-cyan-100/50 dark:border-cyan-900/30">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-900/60 flex items-center justify-center text-cyan-500">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        {formatCurrency(stats?.totalProfit || 0)}
                      </h3>
                      <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                        Total Profit
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[13px] font-bold mt-4">
                    <span className={getGrowthClass(stats?.profitGrowth || 0)}>
                      {formatGrowth(stats?.profitGrowth || 0)}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500 font-medium">
                      From Last {periodLabel[period]}
                    </span>
                  </div>
                </div>

                {/* Card 4: Cash Management (replacing Sales in design) */}
                <div className="bg-white dark:bg-slate-900/80 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-5">
                    Cash Management
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col gap-1">
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                        In Drawer
                      </p>
                      <p className="text-[17px] font-black text-slate-800 dark:text-white">
                        {formatCurrency(cashManagement?.cashInDrawer || 0)}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                        Banked
                      </p>
                      <p className="text-[17px] font-black text-slate-800 dark:text-white">
                        {formatCurrency(cashManagement?.banked || 0)}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                        Starting
                      </p>
                      <p className="text-[17px] font-black text-slate-800 dark:text-white">
                        {formatCurrency(cashManagement?.startingDayCash || 0)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[13px] font-bold mt-5">
                    <span className="text-emerald-500 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4" /> Score{" "}
                      {cashManagement?.cashManagementScore || 0}/100
                    </span>
                  </div>

                  <form
                    onSubmit={handleStartingCashSubmit}
                    className="mt-5 flex gap-2"
                  >
                    <input
                      type="number"
                      min="0"
                      value={startingCash}
                      onChange={(e) => setStartingCash(e.target.value)}
                      placeholder="Add starting cash..."
                      className="w-full text-[13px] font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all placeholder:text-slate-400"
                    />
                    <button
                      type="submit"
                      disabled={isSavingCashManagement}
                      className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 text-[13px] font-bold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      Save
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="xl:col-span-8 flex flex-col gap-6">
              {/* Filter */}
              <div className="flex justify-end pt-2">
                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 rounded-full p-1 shadow-sm border border-slate-100 dark:border-slate-800">
                  {(["daily", "monthly", "yearly"] as DashboardFilter[]).map(
                    (p) => (
                      <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={`px-5 py-2 rounded-full text-[13px] font-bold capitalize transition-all duration-200 ${
                          period === p
                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md"
                            : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                        }`}
                      >
                        {p}
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* Orders Overview Chart */}
              <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Orders Overview
                  </h2>
                  <div className="flex items-center gap-5 text-[13px] font-bold">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FBBF24]" />
                      <span className="text-slate-500 dark:text-slate-400">
                        Sales
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />
                      <span className="text-slate-500 dark:text-slate-400">
                        Orders
                      </span>
                    </div>
                  </div>
                </div>

                <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={salesData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#E2E8F0"
                        className="dark:stroke-slate-800"
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "#94A3B8",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                        dy={15}
                      />
                      <YAxis
                        yAxisId="left"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "#94A3B8",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                        dx={-10}
                        tickFormatter={(value) =>
                          value >= 1000
                            ? `${(value / 1000).toFixed(0)}k`
                            : value
                        }
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "#94A3B8",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                        dx={10}
                        tickFormatter={(value) =>
                          value >= 1000
                            ? `${(value / 1000).toFixed(0)}k`
                            : value
                        }
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "16px",
                          border: "none",
                          boxShadow:
                            "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                          padding: "12px 16px",
                          fontWeight: 600,
                        }}
                        itemStyle={{ fontSize: "13px" }}
                      />
                      <Line
                        yAxisId="right"
                        name="Orders"
                        type="monotone"
                        dataKey="orders"
                        stroke="#8B5CF6"
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 6, fill: "#8B5CF6", strokeWidth: 0 }}
                      />
                      <Line
                        yAxisId="left"
                        name="Sales"
                        type="monotone"
                        dataKey="current"
                        stroke="#FBBF24"
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 6, fill: "#FBBF24", strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sale Analytics (Pie Chart) */}
                <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                    Sale Analytics
                  </h2>
                  <div className="flex-1 relative flex items-center justify-center min-h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={95}
                          paddingAngle={6}
                          dataKey="value"
                          stroke="none"
                          cornerRadius={12}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: "12px",
                            border: "none",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                            fontWeight: 600,
                            fontSize: "12px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-4xl font-black text-slate-900 dark:text-white">
                        {stats?.businessHealthScore?.overall || 0}%
                      </span>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                        Completed
                      </span>
                    </div>
                  </div>
                </div>

                {/* Top Metrics */}
                <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      Top Metrics
                    </h2>
                    <span className="text-[13px] font-bold text-slate-400">
                      Score
                    </span>
                  </div>

                  <div className="space-y-6">
                    {metricsEntries.length > 0 ? (
                      metricsEntries.map(([key, metric]) => {
                        const style = metricStyles[key];
                        const Icon = style.icon;
                        return (
                          <div
                            key={key}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={`w-10 h-10 rounded-2xl ${style.iconBg} ${style.iconColor} flex items-center justify-center`}
                              >
                                <Icon className="w-5 h-5" />
                              </div>
                              <div>
                                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 block">
                                  {style.name}
                                </span>
                                <span className="text-[12px] font-semibold text-slate-400 mt-0.5 block">
                                  {metric.status || "Good"}
                                </span>
                              </div>
                            </div>
                            <span className="text-lg font-black text-slate-900 dark:text-white">
                              {Math.round(metric.score)}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-[13px] font-semibold text-slate-400 text-center py-10">
                        No metrics available yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
