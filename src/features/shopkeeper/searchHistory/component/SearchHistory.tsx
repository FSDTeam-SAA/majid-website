"use client";

import React from "react";
import { format } from "date-fns";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  DollarSign,
  Filter,
  Hash,
  Loader2,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useSearchHistory } from "../hooks/useSearchHistory";
import { SearchHistoryRecord } from "../types/search-history.types";
import { getSearchHistoryReportPdf } from "../api/search-history.api";
import { useCurrency } from "@/hooks/useCurrency";

type StatusFilter = "all" | "clean" | "unknown" | "blocked" | "blacklisted";

const statusFilterOptions: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Clean", value: "clean" },
  { label: "Unknown", value: "unknown" },
  { label: "Blocked", value: "blocked" },
  { label: "Blacklisted", value: "blacklisted" },
];

const formatDate = (date: string) => {
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "Invalid date";

  return format(parsedDate, "MMM dd, yyyy");
};

const formatTime = (date: string) => {
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "--";

  return format(parsedDate, "hh:mm a");
};

const normalizeStatus = (status?: string) =>
  (status || "unknown").trim().toLowerCase();

const getDeviceStatusStyle = (status?: string) => {
  switch (normalizeStatus(status)) {
    case "clean":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:ring-emerald-900";
    case "blocked":
    case "blacklisted":
    case "lost":
    case "stolen":
      return "bg-rose-50 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:ring-rose-900";
    case "unknown":
      return "bg-slate-100 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700";
    default:
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:ring-amber-900";
  }
};

const getRiskStyle = (riskLevel?: string) => {
  switch (normalizeStatus(riskLevel)) {
    case "low":
      return {
        badge:
          "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:ring-emerald-900",
        bar: "bg-emerald-500",
        icon: ShieldCheck,
      };
    case "medium":
      return {
        badge:
          "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:ring-amber-900",
        bar: "bg-amber-500",
        icon: AlertTriangle,
      };
    case "high":
    case "critical":
      return {
        badge:
          "bg-rose-50 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:ring-rose-900",
        bar: "bg-rose-500",
        icon: ShieldAlert,
      };
    default:
      return {
        badge:
          "bg-slate-100 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700",
        bar: "bg-slate-400",
        icon: ShieldAlert,
      };
  }
};

const buildPageItems = (currentPage: number, totalPages: number) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([
    1,
    totalPages,
    currentPage,
    currentPage - 1,
    currentPage + 1,
  ]);

  const sortedPages = Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  return sortedPages.reduce<(number | string)[]>((acc, page, index) => {
    const previousPage = sortedPages[index - 1];
    if (previousPage && page - previousPage > 1) {
      acc.push(`ellipsis-${page}`);
    }
    acc.push(page);
    return acc;
  }, []);
};

export default function SearchHistory() {
  const { formatCurrency } = useCurrency();
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");

  const { data, isLoading, isFetching, error, refetch } = useSearchHistory(
    page,
    limit,
  );

  const history = React.useMemo(() => data?.data || [], [data?.data]);
  const meta = data?.meta;
  const totalPages = Math.max(meta?.totalPage || 1, 1);
  const totalResults = meta?.total || history.length;
  const startResult = totalResults === 0 ? 0 : (page - 1) * limit + 1;
  const endResult = Math.min(page * limit, totalResults);

  const filteredHistory = React.useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return history.filter((record) => {
      const matchesQuery =
        !query ||
        record.imei.toLowerCase().includes(query) ||
        record.deviceName.toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === "all" ||
        normalizeStatus(record.deviceStatus) === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [history, searchTerm, statusFilter]);

  const cleanCount = history.filter(
    (item) => normalizeStatus(item.deviceStatus) === "clean",
  ).length;
  const unknownCount = history.filter(
    (item) => normalizeStatus(item.deviceStatus) === "unknown",
  ).length;
  const averageRiskScore =
    history.length > 0
      ? Math.round(
          history.reduce((sum, item) => sum + (item.riskMeter?.score || 0), 0) /
            history.length,
        )
      : 0;

  const summaryCards = [
    {
      label: "Total Checks",
      value: totalResults,
      icon: Hash,
      tone: "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-300",
    },
    {
      label: "Clean Devices",
      value: cleanCount,
      icon: CheckCircle2,
      tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-300",
    },
    {
      label: "Unknown Status",
      value: unknownCount,
      icon: AlertTriangle,
      tone: "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-300",
    },
    {
      label: "Avg Risk Score",
      value: averageRiskScore,
      icon: ShieldCheck,
      tone: "bg-violet-50 text-violet-600 dark:bg-violet-950/30 dark:text-violet-300",
    },
  ];

  const handleLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(Number(event.target.value));
    setPage(1);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  const errorMessage =
    error instanceof Error ? error.message : "Failed to load search history.";

  const handleRowClick = React.useCallback(
    async (record: SearchHistoryRecord) => {
      // Open the tab synchronously, otherwise browser popup protection may
      // block it while the authenticated PDF request is in progress.
      const pdfWindow = window.open("", "_blank");

      try {
        const pdf = await getSearchHistoryReportPdf(record._id);
        const pdfUrl = URL.createObjectURL(pdf);

        if (pdfWindow) {
          pdfWindow.location.href = pdfUrl;
        } else {
          window.location.assign(pdfUrl);
        }

        window.setTimeout(() => URL.revokeObjectURL(pdfUrl), 60_000);
      } catch (openError: unknown) {
        pdfWindow?.close();
        const message =
          (openError as { response?: { data?: { message?: string } } })
            ?.response?.data?.message || "Could not open the saved PDF report.";
        toast.error(message);
      }
    },
    [],
  );

  return (
    <div className="min-h-screen bg-background px-4 py-8 font-poppins md:px-8 lg:px-10">
      <div className="mx-auto max-w-[1600px] space-y-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-primary">
              <CalendarClock className="h-3.5 w-3.5" />
              IMEI activity
            </div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              Search History
            </h1>
            <p className="mt-1 max-w-2xl text-sm font-medium text-muted-foreground">
              Review recent device checks, market value, and risk signals from
              your shopkeeper account.
            </p>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-border bg-card px-5 text-sm font-black text-foreground shadow-sm transition hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="rounded-[28px] border border-border bg-card p-5 shadow-sm"
            >
              <div
                className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${card.tone}`}
              >
                <card.icon className="h-5 w-5" />
              </div>
              <p className="text-3xl font-black leading-none text-foreground">
                {card.value}
              </p>
              <p className="mt-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
                {card.label}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-[32px] border border-border bg-card shadow-sm">
          <div className="flex flex-col gap-4 border-b border-border p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col gap-3 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search IMEI or device name..."
                  className="h-12 w-full rounded-2xl border border-border bg-background pl-11 pr-4 text-sm font-semibold text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
              </div>

              <div className="relative md:w-[210px]">
                <Filter className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as StatusFilter)
                  }
                  className="h-12 w-full appearance-none rounded-2xl border border-border bg-background pl-11 pr-4 text-sm font-black text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                >
                  {statusFilterOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {(searchTerm || statusFilter !== "all") && (
              <button
                onClick={resetFilters}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 text-xs font-black uppercase tracking-widest text-muted-foreground transition hover:text-foreground"
              >
                <X className="h-4 w-4" />
                Clear
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse text-left">
              <thead className="border-b border-border bg-surface">
                <tr>
                  <th className="px-7 py-5 text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground">
                    Device
                  </th>
                  <th className="px-7 py-5 text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground">
                    IMEI
                  </th>
                  <th className="px-7 py-5 text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground">
                    Status
                  </th>
                  <th className="px-7 py-5 text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground">
                    Risk
                  </th>
                  <th className="px-7 py-5 text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground">
                    Market Value
                  </th>
                  <th className="px-7 py-5 text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground">
                    Checked At
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-7 py-20 text-center">
                      <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="px-7 py-16 text-center">
                      <p className="text-lg font-black text-foreground">
                        Could not load search history
                      </p>
                      <p className="mt-2 text-sm font-medium text-muted-foreground">
                        {errorMessage}
                      </p>
                    </td>
                  </tr>
                ) : filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-7 py-16 text-center">
                      <Smartphone className="mx-auto h-10 w-10 text-muted-foreground" />
                      <p className="mt-4 text-lg font-black text-foreground">
                        No IMEI checks found
                      </p>
                      <p className="mt-1 text-sm font-medium text-muted-foreground">
                        Try changing your search or status filter.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((record, index) => (
                    <SearchHistoryRow
                      key={record._id}
                      record={record}
                      index={index}
                      formatCurrency={formatCurrency}
                      onClick={() => handleRowClick(record)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-4 border-t border-border bg-surface px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <p className="text-sm font-bold text-muted-foreground">
                Showing{" "}
                <span className="font-black text-foreground">
                  {startResult} - {endResult}
                </span>{" "}
                of{" "}
                <span className="font-black text-foreground">
                  {totalResults}
                </span>{" "}
                checks
              </p>

              <select
                value={limit}
                onChange={handleLimitChange}
                className="h-10 rounded-xl border border-border bg-card px-3 text-sm font-black text-foreground outline-none focus:border-primary"
              >
                {[10, 20, 50].map((value) => (
                  <option key={value} value={value}>
                    {value} per page
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((current) => Math.max(current - 1, 1))}
                disabled={page === 1 || isFetching}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-sm transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-1">
                {buildPageItems(page, totalPages).map((item) =>
                  typeof item === "string" ? (
                    <span
                      key={item}
                      className="flex h-10 w-10 items-center justify-center text-sm font-black text-muted-foreground"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item)}
                      disabled={isFetching}
                      className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        page === item
                          ? "bg-primary text-primary-foreground shadow-lg shadow-lime-500/20"
                          : "border border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
                      }`}
                    >
                      {item}
                    </button>
                  ),
                )}
              </div>

              <button
                onClick={() =>
                  setPage((current) => Math.min(current + 1, totalPages))
                }
                disabled={page >= totalPages || isFetching}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-sm transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchHistoryRow({
  record,
  index,
  formatCurrency,
  onClick,
}: {
  record: SearchHistoryRecord;
  index: number;
  formatCurrency: (amount: number, fromCurrency?: string) => string;
  onClick: () => void;
}) {
  const riskStyle = getRiskStyle(record.riskMeter?.riskLevel);
  const RiskIcon = riskStyle.icon;
  const riskScore = Math.min(Math.max(record.riskMeter?.score || 0, 0), 100);

  return (
    <motion.tr
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.025, 0.2) }}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      tabIndex={0}
      role="button"
      className="group cursor-pointer transition-colors hover:bg-surface/70 focus:outline-none focus-visible:bg-surface/70"
    >
      <td className="px-7 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Smartphone className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="max-w-[340px] truncate text-sm font-black text-foreground">
              {record.deviceName || "Unknown Device"}
            </p>
            <p className="mt-1 text-xs font-bold text-muted-foreground">
              ID #{record._id.slice(-8).toUpperCase()}
            </p>
          </div>
        </div>
      </td>

      <td className="px-7 py-5">
        <span className="rounded-xl bg-surface px-3 py-2 font-mono text-sm font-black text-foreground">
          {record.imei}
        </span>
      </td>

      <td className="px-7 py-5">
        <span
          className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-black uppercase tracking-wider ${getDeviceStatusStyle(
            record.deviceStatus,
          )}`}
        >
          {record.deviceStatus || "unknown"}
        </span>
      </td>

      <td className="px-7 py-5">
        <div className="w-[180px]">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black ${riskStyle.badge}`}
            >
              <RiskIcon className="h-3.5 w-3.5" />
              {record.riskMeter?.label || "Unknown Risk"}
            </span>
            <span className="text-xs font-black text-muted-foreground">
              {riskScore}
            </span>
          </div>
          <div className="h-2 rounded-full bg-surface-muted">
            <div
              className={`h-full rounded-full ${riskStyle.bar}`}
              style={{ width: `${riskScore}%` }}
            />
          </div>
        </div>
      </td>

      <td className="px-7 py-5">
        <div className="inline-flex items-center gap-2 text-sm font-black text-foreground">
          <DollarSign className="h-4 w-4 text-emerald-500" />
          {typeof record.marketValue?.amount === "number"
            ? formatCurrency(
                record.marketValue.amount,
                record.marketValue.currency,
              )
            : "N/A"}
        </div>
      </td>

      <td className="px-7 py-5">
        <div className="text-sm font-black text-foreground">
          {formatDate(record.createdAt)}
        </div>
        <div className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
          <Clock3 className="h-3.5 w-3.5" />
          {formatTime(record.createdAt)}
        </div>
      </td>
    </motion.tr>
  );
}
