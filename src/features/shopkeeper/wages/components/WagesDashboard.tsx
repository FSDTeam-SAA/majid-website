"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Clock,
  Calendar,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  Download,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Store,
  AlertCircle,
  Eye,
  Loader2,
} from "lucide-react";
import { useShop } from "@/features/shopkeeper/shop/store/shop.store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useWagesSummary,
  useUpdateStage,
  useExportWages,
} from "../hooks/useWages";
import { TPayPeriodStage } from "../api/wages.api";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const STAGES: Array<{ id: TPayPeriodStage; step: number; label: string }> = [
  { id: "draft", step: 1, label: "Draft" },
  { id: "exceptions_resolved", step: 2, label: "Resolve exceptions" },
  { id: "owner_approved", step: 3, label: "Owner approval" },
  { id: "locked", step: 4, label: "Lock & export" },
];

export const WagesDashboard: React.FC = () => {
  const { shops, activeShopId, setActiveShop } = useShop();

  const [currentMonth, setCurrentMonth] = useState<number>(10); // October per specs
  const [currentYear, setCurrentYear] = useState<number>(2026);

  const shopIdToUse = activeShopId || shops[0]?._id || "demo-shop-romford";

  const { data: wagesData } = useWagesSummary(
    shopIdToUse,
    currentMonth,
    currentYear,
  );

  const updateStageMutation = useUpdateStage(
    shopIdToUse,
    currentMonth,
    currentYear,
  );
  const exportMutation = useExportWages();

  const currentStage: TPayPeriodStage = wagesData?.stage || "draft";
  const currentStepNumber =
    STAGES.find((s) => s.id === currentStage)?.step || 1;

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleAdvanceStage = () => {
    const nextStageMap: Record<TPayPeriodStage, TPayPeriodStage> = {
      draft: "exceptions_resolved",
      exceptions_resolved: "owner_approved",
      owner_approved: "locked",
      locked: "locked",
    };
    const next = nextStageMap[currentStage];
    if (next && next !== currentStage) {
      updateStageMutation.mutate(next);
    }
  };

  const handleExportCsv = () => {
    exportMutation.mutate({
      shopId: shopIdToUse,
      month: currentMonth,
      year: currentYear,
    });
  };

  const kpis = wagesData?.kpis || {
    workedHours: 432,
    paidLeaveHours: 24,
    estimatedGrossPay: 5472,
    needsReviewCount: 3,
  };

  const staffSummaries = wagesData?.staffSummaries || [];
  const pendingExceptions = wagesData?.pendingExceptions || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 font-poppins">
      {/* Header Controls: Store, Title, Month Navigator */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#84CC16]/10 text-[#65A30D]">
              <DollarSign className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Staff Wages & Pay Period Review
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
            Review actual vs scheduled hours, resolve early departure
            exceptions, and approve monthly payroll.
          </p>
        </div>

        {/* Store & Month Navigators */}
        <div className="flex flex-wrap items-center gap-3">
          {shops.length > 0 && (
            <div className="w-48 sm:w-56">
              <Select
                value={activeShopId || shops[0]?._id}
                onValueChange={(val) => setActiveShop(val)}
              >
                <SelectTrigger className="rounded-xl border-border bg-surface text-xs font-bold">
                  <div className="flex items-center gap-2 truncate">
                    <Store className="w-4 h-4 text-[#84CC16]" />
                    <SelectValue placeholder="Select Store" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {shops.map((s) => (
                    <SelectItem
                      key={s._id}
                      value={s._id}
                      className="text-xs font-semibold"
                    >
                      {s.shopName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Month Navigator */}
          <div className="flex items-center gap-1.5 bg-surface border border-border rounded-xl p-1 px-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevMonth}
              className="w-7 h-7 rounded-lg text-muted-foreground"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <span className="text-xs font-bold text-foreground px-2">
              {MONTH_NAMES[currentMonth - 1]} {currentYear}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextMonth}
              className="w-7 h-7 rounded-lg text-muted-foreground"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Cards (Matching Image 2 Specs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Worked Hours */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground">
              Worked Hours
            </span>
            <p className="text-2xl font-black text-foreground">
              {kpis.workedHours}{" "}
              <span className="text-sm font-normal">hours</span>
            </p>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: Paid Leave */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground">
              Paid Leave
            </span>
            <p className="text-2xl font-black text-foreground">
              {kpis.paidLeaveHours}{" "}
              <span className="text-sm font-normal">hours</span>
            </p>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: Estimated Gross Pay */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-xs flex items-center justify-between relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground">
              Estimated Gross Pay
            </span>
            <p className="text-2xl font-black text-[#65A30D]">
              £{kpis.estimatedGrossPay.toLocaleString()}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#84CC16]/10 text-[#65A30D]">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4: Needs Review */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground">
              Needs Review
            </span>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {kpis.needsReviewCount}{" "}
              <span className="text-xs font-normal">alerts</span>
            </p>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Pay Period Review Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-border/80 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">
              Staff Pay Period Breakdown
            </h2>
            <p className="text-xs text-muted-foreground">
              Aggregated attendance and leave records for{" "}
              {MONTH_NAMES[currentMonth - 1]} {currentYear}.
            </p>
          </div>
          <Badge variant="outline" className="text-xs font-semibold">
            {staffSummaries.length} Staff members
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-surface-muted/50 font-bold text-muted-foreground">
                <th className="p-4 pl-6">Staff</th>
                <th className="p-4 text-center">Worked</th>
                <th className="p-4 text-center">Paid Leave</th>
                <th className="p-4 text-center">Approved Extra</th>
                <th className="p-4 text-center">Paid Hours</th>
                <th className="p-4 text-center">Rate</th>
                <th className="p-4 text-center">Est. Gross</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 pr-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {staffSummaries.map((staff) => {
                const isReviewNeeded = staff.status === "review_needed";

                return (
                  <tr
                    key={staff.staffId}
                    className="hover:bg-surface/60 transition-colors group"
                  >
                    {/* Staff name & avatar */}
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#84CC16]/15 border border-[#84CC16]/30 flex items-center justify-center font-bold text-[#65A30D] text-xs">
                          {staff.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-foreground">
                            {staff.name}
                          </p>
                          <span className="text-[11px] text-muted-foreground">
                            Hourly employee
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Worked hours */}
                    <td className="p-4 text-center font-semibold text-foreground">
                      {staff.workedHours}h
                    </td>

                    {/* Paid leave hours */}
                    <td className="p-4 text-center font-semibold text-muted-foreground">
                      {staff.paidLeaveHours}h
                    </td>

                    {/* Approved extra hours */}
                    <td className="p-4 text-center font-semibold text-emerald-600 dark:text-emerald-400">
                      {staff.approvedExtraHours > 0
                        ? `+${staff.approvedExtraHours}h`
                        : "—"}
                    </td>

                    {/* Total paid hours */}
                    <td className="p-4 text-center font-bold text-foreground">
                      {staff.totalPaidHours}h
                    </td>

                    {/* Hourly rate */}
                    <td className="p-4 text-center font-semibold text-muted-foreground">
                      £{staff.hourlyRate}
                    </td>

                    {/* Est. Gross Pay */}
                    <td className="p-4 text-center font-black text-[#65A30D] text-sm">
                      £{staff.grossPay.toLocaleString()}
                    </td>

                    {/* Status Badge */}
                    <td className="p-4 text-center">
                      {isReviewNeeded ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[11px] font-bold border border-amber-500/20">
                          <AlertTriangle className="w-3 h-3" />
                          Review needed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          Ready
                        </span>
                      )}
                    </td>

                    {/* Action Link to Staff Record */}
                    <td className="p-4 pr-6 text-right">
                      <Link
                        href={`/shopkeeper/staff/${staff.staffId}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-muted hover:bg-muted text-xs font-bold text-foreground transition-all border border-border"
                      >
                        <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                        View breakdown
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Two Cards: Resolve before approval & Pay period approval */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: Resolve before approval */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Resolve before approval
              </h3>
              <Badge
                variant="outline"
                className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs font-bold"
              >
                {pendingExceptions.length} pending
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              All attendance anomalies and leave requests must be decided before
              wages can be locked.
            </p>

            <div className="space-y-2.5">
              {pendingExceptions.map((exc) => (
                <div
                  key={exc.id}
                  className="flex items-center justify-between p-3.5 bg-surface-muted/70 hover:bg-surface-muted rounded-xl border border-border transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    <div className="truncate">
                      <p className="font-bold text-xs text-foreground truncate">
                        {exc.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {exc.date} •{" "}
                        {exc.differenceMinutes
                          ? `${exc.differenceMinutes / 60}h difference`
                          : "Requires manager action"}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/shopkeeper/settings/staff/wages/exceptions/${exc.id}`}
                    className="shrink-0 text-xs font-bold text-[#65A30D] hover:underline flex items-center gap-1"
                  >
                    Decide
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Exceptions are auto-flagged by server timestamp comparison.
            </span>
          </div>
        </div>

        {/* Right Card: Pay period approval */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#84CC16]" />
                Pay period approval
              </h3>
              <Badge
                variant="outline"
                className="bg-[#84CC16]/10 text-[#65A30D] border-[#84CC16]/30 text-xs font-bold capitalize"
              >
                {currentStage.replace("_", " ")}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Once owner reviews exceptions, approve calculation to freeze hours
              and generate export files.
            </p>

            <div className="p-4 bg-[#84CC16]/10 border border-[#84CC16]/20 rounded-xl space-y-2 mb-4">
              <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                <span>Calculated Gross Pay</span>
                <span className="font-black text-foreground text-sm">
                  £{kpis.estimatedGrossPay.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                <span>Total Billable Hours</span>
                <span className="font-bold text-foreground">
                  {kpis.workedHours + kpis.paidLeaveHours} hours
                </span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                <span>Pending Decision Blockers</span>
                <span
                  className={
                    pendingExceptions.length > 0
                      ? "font-bold text-amber-600"
                      : "font-bold text-emerald-600"
                  }
                >
                  {pendingExceptions.length} blockers
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                onClick={handleAdvanceStage}
                disabled={
                  updateStageMutation.isPending || currentStage === "locked"
                }
                className="bg-[#84CC16] hover:bg-[#74b513] text-white rounded-xl text-xs font-bold shadow-md shadow-[#84CC16]/20 gap-2 flex-1"
              >
                {updateStageMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5" />
                )}
                {currentStage === "locked"
                  ? "Pay Period Locked"
                  : currentStage === "owner_approved"
                    ? "Lock & Finalize"
                    : "Review & approve >"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleExportCsv}
                disabled={exportMutation.isPending}
                className="rounded-xl text-xs font-bold border-border hover:bg-muted gap-2"
              >
                {exportMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5 text-muted-foreground" />
                )}
                Export draft
              </Button>
            </div>
          </div>

          <div className="pt-2 border-t border-border/60 text-xs text-muted-foreground">
            Locking permanently freezes pay calculations for the payroll team.
          </div>
        </div>
      </div>

      {/* Bottom 4-Stage Stepper Component */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
          Approval Progression Stepper
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 relative">
          {STAGES.map((stg) => {
            const isCompleted = stg.step < currentStepNumber;
            const isCurrent = stg.step === currentStepNumber;

            return (
              <div
                key={stg.id}
                className={`p-3.5 rounded-xl border transition-all flex items-center gap-3 ${
                  isCurrent
                    ? "bg-[#84CC16]/10 border-[#84CC16] shadow-sm text-foreground font-bold"
                    : isCompleted
                      ? "bg-surface-muted/80 border-border text-foreground"
                      : "bg-surface/30 border-dashed border-border/70 text-muted-foreground"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                    isCurrent
                      ? "bg-[#84CC16] text-white"
                      : isCompleted
                        ? "bg-emerald-500 text-white"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    stg.step
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">{stg.label}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">
                    {isCurrent
                      ? "In progress"
                      : isCompleted
                        ? "Completed"
                        : "Pending"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
