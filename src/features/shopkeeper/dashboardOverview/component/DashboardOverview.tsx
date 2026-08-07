"use client";

import React, { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  BadgeDollarSign,
  Banknote,
  ChevronDown,
  ChevronLeft,
  FileText,
  Info,
  Loader2,
  Package,
  Percent,
  ShoppingBag,
  Star,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDashboardOverview } from "../hooks/useDashboardOverview";
import { useShop } from "@/features/shopkeeper/shop/store/shop.store";
import { useCurrency } from "@/hooks/useCurrency";
import type {
  CashManagementResponse,
  DashboardFilter,
  DashboardMetric,
  DashboardStatsResponse,
} from "../types/dashboard.types";

interface SalesTrendPoint {
  name: string;
  date: string;
  current: number;
  previous: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: SalesTrendPoint;
  }>;
}

const metricStyles = {
  salesGrowth: {
    name: "Sales Growth",
    icon: TrendingUp,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-50 dark:bg-emerald-950/20",
  },
  profitMargin: {
    name: "Profit Margin",
    icon: Wallet,
    iconColor: "text-violet-600 dark:text-violet-400",
    iconBg: "bg-violet-50 dark:bg-violet-950/20",
  },
  stockManagement: {
    name: "Stock Management",
    icon: Package,
    iconColor: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-50 dark:bg-blue-950/20",
  },
  customerSatisfaction: {
    name: "Customer Satisfaction",
    icon: Star,
    iconColor: "text-amber-500 dark:text-amber-400",
    iconBg: "bg-amber-50 dark:bg-amber-950/20",
  },
  outstandingPayments: {
    name: "Outstanding Payments",
    icon: FileText,
    iconColor: "text-rose-600 dark:text-rose-400",
    iconBg: "bg-rose-50 dark:bg-rose-950/20",
  },
};

const formatNumber = (value = 0) =>
  new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 }).format(value);

const formatGrowth = (value = 0) =>
  `${value >= 0 ? "↑" : "↓"} ${Math.abs(value).toFixed(0)}%`;

const getGrowthClass = (value = 0) =>
  value >= 0
    ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20"
    : "text-rose-600 bg-rose-50 dark:bg-rose-950/20";

const scoreBarColor = (score = 0) => {
  if (score >= 85) return "bg-emerald-500";
  if (score >= 70) return "bg-lime-500";
  if (score >= 55) return "bg-amber-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-rose-500";
};

const previousFromGrowth = (current: number, growth: number) => {
  if (!current || growth <= -100) return 0;
  return current / (1 + growth / 100);
};

const periodLabel: Record<DashboardFilter, string> = {
  daily: "Daily",
  monthly: "Monthly",
  yearly: "Yearly",
};

export default function DashboardOverview() {
  const [period, setPeriod] = useState<DashboardFilter>("monthly");
  const [startingCash, setStartingCash] = useState("");
  const { formatCurrency } = useCurrency();
  const { data: session, status } = useSession();
  const shopkeeperId = (session?.user as { id?: string })?.id;
  const { activeShopId } = useShop();

  const {
    stats,
    cashManagement,
    isLoading,
    isFetching,
    error,
    saveCashManagement,
    isSavingCashManagement,
  } = useDashboardOverview(shopkeeperId, period, activeShopId);

  const statCards = useMemo(
    () => [
      {
        label: "Total Sales",
        value: formatCurrency(stats?.totalSales || 0),
        trend: formatGrowth(stats?.salesGrowth || 0),
        trendValue: stats?.salesGrowth || 0,
        icon: TrendingUp,
        color:
          "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400",
      },
      {
        label: "Total Profit",
        value: formatCurrency(stats?.totalProfit || 0),
        trend: formatGrowth(stats?.profitGrowth || 0),
        trendValue: stats?.profitGrowth || 0,
        icon: Wallet,
        color:
          "bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400",
      },
      {
        label: "Total Orders",
        value: formatNumber(stats?.totalOrders || 0),
        trend: formatGrowth(stats?.ordersGrowth || 0),
        trendValue: stats?.ordersGrowth || 0,
        icon: ShoppingBag,
        color:
          "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400",
      },
      {
        label: "Avg Order Value",
        value: formatCurrency(stats?.avgOrderValue || 0),
        trend: formatGrowth(stats?.avgOrderGrowth || 0),
        trendValue: stats?.avgOrderGrowth || 0,
        icon: Percent,
        color:
          "bg-amber-50 dark:bg-amber-950/20 text-amber-500 dark:text-amber-400",
      },
      {
        label: "Cash in Drawer",
        value: formatCurrency(cashManagement?.cashInDrawer || 0),
        trend: cashManagement ? "Live" : "No record",
        trendValue: cashManagement ? 1 : -1,
        icon: BadgeDollarSign,
        color:
          "bg-cyan-50 dark:bg-cyan-950/20 text-cyan-600 dark:text-cyan-400",
      },
      {
        label: "Banked",
        value: formatCurrency(cashManagement?.banked || 0),
        trend: cashManagement ? "Live" : "No record",
        trendValue: cashManagement ? 1 : -1,
        icon: Banknote,
        color: "bg-sky-50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400",
      },
    ],
    [cashManagement, stats],
  );

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
      const message =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        ).response?.data?.message ||
        (err as { message?: string }).message ||
        "Failed to update cash management";
      toast.error(message);
    }
  };

  const pageIsLoading = status === "loading" || isLoading;
  const errorMessage =
    (error as { response?: { data?: { message?: string } }; message?: string })
      ?.response?.data?.message ||
    (error as { message?: string })?.message ||
    "";

  return (
    <div className="dashboard-page text-slate-800 transition-colors duration-300 dark:text-slate-100">
      <div className="dashboard-container">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Dashboard Overview
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
              Real-time business performance analytics and AI-powered insights.
            </p>
          </div>
          {isFetching && !pageIsLoading ? (
            <span className="inline-flex items-center gap-2 text-xs font-bold text-slate-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Updating
            </span>
          ) : null}
        </div>

        {!shopkeeperId && status !== "loading" ? (
          <EmptyPanel title="Session not found" />
        ) : pageIsLoading ? (
          <LoadingPanel />
        ) : errorMessage ? (
          <EmptyPanel title={errorMessage} />
        ) : (
          <div className="gap-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <CashManagementScore cashManagement={cashManagement} />
              <div className="grid grid-cols-1 gap-4">
                <StartingCashCard
                  value={cashManagement?.startingDayCash || 0}
                  formatCurrency={formatCurrency}
                  startingCash={startingCash}
                  onStartingCashChange={setStartingCash}
                  onSubmit={handleStartingCashSubmit}
                  isSaving={isSavingCashManagement}
                />
                <BankedCard
                  cashManagement={cashManagement}
                  formatCurrency={formatCurrency}
                />
              </div>
            </div>

            <div className="grid mt-10 grid-cols-1 lg:grid-cols-2 gap-8">
              <BusinessHealthScore stats={stats} />
              <ScoreBreakdown metrics={stats?.metrics} />
            </div>

            <div className="lg:col-span-7 space-y-6">
              <div>
                <div className="flex justify-end mb-6">
                  <div className="mobile-scroll flex w-full items-center gap-1 rounded-2xl border border-slate-200/50 bg-slate-100/90 p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:w-max mt-10">
                    {(["daily", "monthly", "yearly"] as DashboardFilter[]).map(
                      (p) => (
                        <button
                          key={p}
                          onClick={() => setPeriod(p)}
                          className={`px-4.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                            period === p
                              ? "bg-violet-600 text-white shadow-md shadow-violet-600/15"
                              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                          }`}
                        >
                          {periodLabel[p]}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {statCards.map((stat) => (
                    <StatCard key={stat.label} stat={stat} />
                  ))}
                </div>
              </div>

              <SalesTrend
                stats={stats}
                period={period}
                formatCurrency={formatCurrency}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingPanel() {
  return (
    <div className="mt-8 rounded-3xl border border-slate-100 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <Loader2 className="mx-auto h-8 w-8 animate-spin text-violet-600" />
      <p className="mt-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
        Loading dashboard data...
      </p>
    </div>
  );
}

function EmptyPanel({ title }: { title: string }) {
  return (
    <div className="mt-8 rounded-3xl border border-slate-100 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
        {title}
      </p>
    </div>
  );
}

function StatCard({
  stat,
}: {
  stat: {
    label: string;
    value: string;
    trend: string;
    trendValue: number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  };
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className={`p-2.5 rounded-2xl ${stat.color} flex-shrink-0`}>
          <stat.icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-4">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          {stat.label}
        </span>
        <div className="flex items-baseline justify-between mt-1">
          <span className="text-2xl font-extrabold text-slate-800 dark:text-white">
            {stat.value}
          </span>
          <div className="text-right flex flex-col items-end">
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${getGrowthClass(
                stat.trendValue,
              )}`}
            >
              {stat.trend}
            </span>
            <span className="text-[9px] text-slate-400 font-medium mt-0.5">
              vs previous {stat.label.includes("Cash") ? "record" : "period"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StartingCashCard({
  value,
  formatCurrency,
  startingCash,
  onStartingCashChange,
  onSubmit,
  isSaving,
}: {
  value: number;
  formatCurrency: (amount: number, fromCurrency?: string) => string;
  startingCash: string;
  onStartingCashChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  isSaving: boolean;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 text-amber-500 dark:text-amber-400 flex-shrink-0">
          <BadgeDollarSign className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Starting Day Cash
        </span>
        <div className="flex items-baseline justify-between mt-1">
          <span className="text-2xl font-extrabold text-slate-800 dark:text-white">
            {formatCurrency(value)}
          </span>
        </div>

        <form
          onSubmit={onSubmit}
          className="mt-4 flex flex-col sm:flex-row gap-2"
        >
          <input
            type="number"
            min="0"
            step="1"
            value={startingCash}
            onChange={(event) => onStartingCashChange(event.target.value)}
            placeholder="Enter starting cash"
            className="min-w-0 flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 dark:focus:ring-amber-950/40"
          />

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

function BankedCard({
  cashManagement,
  formatCurrency,
}: {
  cashManagement?: CashManagementResponse | null;
  formatCurrency: (amount: number, fromCurrency?: string) => string;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className="p-2.5 rounded-2xl bg-sky-50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400 flex-shrink-0">
          <Banknote className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Banked
        </span>
        <div className="flex items-baseline justify-between mt-1">
          <span className="text-2xl font-extrabold text-slate-800 dark:text-white">
            {formatCurrency(cashManagement?.banked || 0)}
          </span>
          <span className="text-xs font-bold text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-full">
            Cash drawer {formatCurrency(cashManagement?.cashInDrawer || 0)}
          </span>
        </div>
      </div>
    </div>
  );
}

function GaugeCard({
  title,
  score = 0,
  rating = "No data",
  description,
}: {
  title: string;
  score?: number;
  rating?: string;
  description: React.ReactNode;
}) {
  const safeScore = Math.max(0, Math.min(100, Math.round(score)));
  const radius = 75;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius * (240 / 360);
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;
  const needleRotation = (safeScore - 50) * 2.4;
  const gradientId = `${title.toLowerCase().replace(/\s+/g, "-")}-gradient`;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm p-6 flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-4">
        <button className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-400">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-bold text-slate-800 dark:text-white text-sm">
          {title}
        </span>
        <button className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-400">
          <Info className="w-5 h-5" />
        </button>
      </div>

      <div className="relative w-64 h-44 flex items-center justify-center mt-2">
        <svg className="w-full h-full" viewBox="0 0 200 160">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="35%" stopColor="#F59E0B" />
              <stop offset="70%" stopColor="#84CC16" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
            <filter
              id={`${gradientId}-needle-shadow`}
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feDropShadow
                dx="0"
                dy="2"
                stdDeviation="1.5"
                floodOpacity="0.15"
              />
            </filter>
          </defs>

          <path
            d="M 35 130 A 75 75 0 1 1 165 130"
            fill="none"
            stroke="#F1F5F9"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="stroke-slate-100 dark:stroke-slate-800"
          />
          <path
            d="M 35 130 A 75 75 0 1 1 165 130"
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
          <g transform={`rotate(${needleRotation}, 100, 100)`}>
            <path
              d="M 96 12 L 104 12 L 100 24 Z"
              fill="#0F172A"
              className="fill-slate-900 dark:fill-white"
              filter={`url(#${gradientId}-needle-shadow)`}
            />
          </g>
          <text
            x="32"
            y="146"
            textAnchor="middle"
            className="text-[10px] font-bold fill-slate-400"
          >
            0
          </text>
          <text
            x="168"
            y="146"
            textAnchor="middle"
            className="text-[10px] font-bold fill-slate-400"
          >
            100
          </text>
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
          <span className="text-5xl font-black text-slate-800 dark:text-white tracking-tight">
            {safeScore}
          </span>
          <span className="text-xs font-semibold text-slate-400 mt-0.5">
            /100
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 px-3.5 py-1 rounded-full text-xs font-bold mt-2 shadow-sm border border-emerald-100 dark:border-emerald-900/50">
        <Star className="w-3.5 h-3.5 fill-emerald-600 stroke-emerald-600 dark:fill-emerald-400 dark:stroke-emerald-400" />
        <span>{rating}</span>
      </div>

      <div className="text-xs text-slate-500 dark:text-slate-400 text-center font-medium mt-4 max-w-[240px] leading-relaxed">
        {description}
      </div>
    </div>
  );
}

function BusinessHealthScore({ stats }: { stats?: DashboardStatsResponse }) {
  const health = stats?.businessHealthScore;

  return (
    <GaugeCard
      title="Business Health Score"
      score={health?.overall || 0}
      rating={health?.rating || "No data"}
      description={
        health?.message ||
        "Dashboard stats will appear after invoices are created."
      }
    />
  );
}

function CashManagementScore({
  cashManagement,
}: {
  cashManagement?: CashManagementResponse | null;
}) {
  return (
    <GaugeCard
      title="Cash Management Score"
      score={cashManagement?.cashManagementScore || 0}
      rating={cashManagement ? "Current record" : "No data"}
      description={
        <ExpandableInsight
          text={
            cashManagement?.aiInsight ||
            "Add starting day cash to begin tracking cash management."
          }
        />
      }
    />
  );
}

function ScoreBreakdown({
  metrics,
}: {
  metrics?: DashboardStatsResponse["metrics"];
}) {
  const entries = metrics
    ? (Object.entries(metrics) as Array<
        [keyof typeof metricStyles, DashboardMetric]
      >)
    : [];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <span className="font-bold text-slate-800 dark:text-white text-base">
          Score Breakdown
        </span>
      </div>

      <div className="space-y-4">
        {entries.length ? (
          entries.map(([key, metric]) => {
            const style = metricStyles[key];
            const Icon = style.icon;

            return (
              <div key={key} className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl ${style.iconBg} ${style.iconColor} flex-shrink-0`}
                >
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                      {style.name}
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-white flex-shrink-0">
                      {Math.round(metric.score)}
                      <span className="text-slate-400 dark:text-slate-500 font-medium">
                        /100
                      </span>
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${scoreBarColor(
                        metric.score,
                      )} rounded-full`}
                      style={{
                        width: `${Math.max(0, Math.min(100, metric.score))}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-xs font-semibold text-slate-400">
            No score metrics available yet.
          </p>
        )}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  const { formatCurrency } = useCurrency();

  if (active && payload && payload.length) {
    const point = payload[0].payload;
    return (
      <div className="bg-slate-950 dark:bg-slate-900 text-white px-3.5 py-2 rounded-2xl shadow-xl text-xs border border-slate-800 backdrop-blur-md">
        <p className="font-medium text-slate-400">{point.date}</p>
        <p className="text-violet-400 font-black text-sm mt-0.5">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

function SalesTrend({
  stats,
  period,
  formatCurrency,
}: {
  stats?: DashboardStatsResponse;
  period: DashboardFilter;
  formatCurrency: (amount: number, fromCurrency?: string) => string;
}) {
  const { convertAmount } = useCurrency();
  const current = stats?.totalSales || 0;
  const previous = previousFromGrowth(current, stats?.salesGrowth || 0);
  const data: SalesTrendPoint[] = [
    {
      name: "Previous",
      date: `Previous ${periodLabel[period].toLowerCase()} period`,
      current: 0,
      previous: convertAmount(previous),
    },
    {
      name: "Current",
      date: `Current ${periodLabel[period].toLowerCase()} period`,
      current: convertAmount(current),
      previous: 0,
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="font-bold text-slate-800 dark:text-white text-base">
          Sales Comparison
        </span>
        <button className="text-xs font-semibold border border-slate-200/80 dark:border-slate-700/80 px-2.5 py-1 rounded-lg flex items-center gap-1 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-slate-600 dark:text-slate-300">
          {periodLabel[period]} <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-4 text-xs font-semibold mb-6">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-violet-600" />
          <span className="text-slate-600 dark:text-slate-300">Current</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
          <span className="text-slate-400 dark:text-slate-500">Previous</span>
        </div>
      </div>

      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#F1F5F9"
              className="stroke-slate-100 dark:stroke-slate-800/50"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: 600 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: 600 }}
              dx={-5}
              tickFormatter={(value) =>
                Number(value) >= 1000 ? `${Number(value) / 1000}K` : `${value}`
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="previous"
              stroke="#CBD5E1"
              className="stroke-slate-300 dark:stroke-slate-700"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="current"
              stroke="#7C3AED"
              strokeWidth={3}
              dot={{
                stroke: "#7C3AED",
                strokeWidth: 2,
                fill: "#FFFFFF",
                r: 3.5,
              }}
              activeDot={{
                stroke: "#7C3AED",
                strokeWidth: 2,
                fill: "#FFFFFF",
                r: 5,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ExpandableInsight({
  text,
  wordLimit = 60,
}: {
  text: string;
  wordLimit?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const words = text.trim().split(/\s+/).filter(Boolean);
  const shouldTruncate = words.length > wordLimit;
  const visibleText =
    shouldTruncate && !expanded
      ? `${words.slice(0, wordLimit).join(" ")}...`
      : text;

  return (
    <div>
      <p className="whitespace-pre-line">{visibleText}</p>
      {shouldTruncate ? (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="mt-2 text-xs font-bold text-violet-600 transition-colors hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
        >
          {expanded ? "See less" : "See more"}
        </button>
      ) : null}
    </div>
  );
}
