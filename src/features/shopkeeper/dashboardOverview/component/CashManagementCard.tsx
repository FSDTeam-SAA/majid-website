"use client";

import React, { useState } from "react";
import {
  Banknote,
  Building2,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  PlusCircle,
  Landmark,
  Layers,
} from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { useCashDrawerMetrics } from "../hooks/useCashDrawerMetrics";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CashManagementCardProps {
  shopkeeperId?: string;
  activeShopId?: string | null;
}

type PeriodTab = "today" | "yesterday" | "week" | "month" | "all";

export function CashManagementCard({
  shopkeeperId,
  activeShopId,
}: CashManagementCardProps) {
  const { formatCurrency } = useCurrency();
  const {
    startingDayCash,
    banked,
    cashScore,
    aiInsight,
    availableCashToday,
    todayMetrics,
    yesterdayMetrics,
    lastWeekMetrics,
    lastMonthMetrics,
    allTimeMetrics,
    cashExpensesList,
    handleBankCash,
    handleSetStartingCash,
    handleAddCash,
    handleAllocateCash,
  } = useCashDrawerMetrics(shopkeeperId, activeShopId);

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodTab>("today");
  const [showBankModal, setShowBankModal] = useState(false);
  const [showFloatModal, setShowFloatModal] = useState(false);
  const [floatMode, setFloatMode] = useState<"add" | "set">("add");
  const [showAllocateModal, setShowAllocateModal] = useState(false);

  const [bankAmount, setBankAmount] = useState("");
  const [floatAmount, setFloatAmount] = useState("");
  const [allocBanked, setAllocBanked] = useState("");
  const [allocDrawer, setAllocDrawer] = useState("");

  const activePeriodMetrics =
    selectedPeriod === "today"
      ? todayMetrics
      : selectedPeriod === "yesterday"
        ? yesterdayMetrics
        : selectedPeriod === "week"
          ? lastWeekMetrics
          : selectedPeriod === "month"
            ? lastMonthMetrics
            : allTimeMetrics;

  const periodLabels: Record<PeriodTab, string> = {
    today: "Today",
    yesterday: "Yesterday",
    week: "Last 7 Days",
    month: "Last 30 Days",
    all: "Previous Sales (All Time)",
  };

  const onBankSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(bankAmount);
    if (val > 0) {
      const ok = await handleBankCash(val);
      if (ok) {
        setBankAmount("");
        setShowBankModal(false);
      }
    }
  };

  const onFloatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(floatAmount);
    if (!isNaN(val) && val > 0) {
      const ok =
        floatMode === "add"
          ? await handleAddCash(val)
          : await handleSetStartingCash(val);
      if (ok) {
        setFloatAmount("");
        setShowFloatModal(false);
      }
    } else if (floatMode === "set" && val === 0) {
      const ok = await handleSetStartingCash(0);
      if (ok) {
        setFloatAmount("");
        setShowFloatModal(false);
      }
    }
  };

  const onAllocateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const b = Number(allocBanked || banked);
    const d = Number(allocDrawer || availableCashToday);
    const ok = await handleAllocateCash(b, d);
    if (ok) {
      setAllocBanked("");
      setAllocDrawer("");
      setShowAllocateModal(false);
    }
  };

  return (
    <div className="rounded-[32px] border border-slate-200/80 bg-white p-6 shadow-sm transition-all dark:border-slate-800 dark:bg-slate-900/90 font-poppins">
      {/* HEADER & HERO BALANCE */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-slate-100 pb-6 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-lime-500/10 text-lime-600 dark:bg-lime-500/20 dark:text-lime-400">
              <Banknote className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  Cash Management
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-black text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Score {cashScore}/100
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Track drawer balance, owner banking, and stock purchase expenses
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setFloatMode("add");
              setFloatAmount("");
              setShowFloatModal(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-[#84CC16] px-3.5 py-2 text-xs font-black text-white hover:bg-[#76b813] transition active:scale-95 shadow-sm shadow-lime-500/20 cursor-pointer"
          >
            <PlusCircle className="h-3.5 w-3.5" />+ Add Cash
          </button>

          <button
            onClick={() => {
              setFloatMode("set");
              setFloatAmount(startingDayCash ? String(startingDayCash) : "");
              setShowFloatModal(true);
            }}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-black text-slate-700 hover:bg-slate-100 transition active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
          >
            <Banknote className="h-3.5 w-3.5 text-slate-500" />
            Starting Float
          </button>

          <button
            onClick={() => {
              setBankAmount("");
              setShowBankModal(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-black text-white shadow-sm hover:bg-violet-700 transition active:scale-95 cursor-pointer"
          >
            <Landmark className="h-3.5 w-3.5" />
            Bank to Owner
          </button>

          <button
            onClick={() => {
              setAllocBanked(String(banked));
              setAllocDrawer(String(availableCashToday));
              setShowAllocateModal(true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-black text-white shadow-sm hover:bg-slate-800 transition active:scale-95 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 cursor-pointer"
          >
            <Layers className="h-3.5 w-3.5" />
            Allocate Cash
          </button>
        </div>
      </div>

      {/* HERO CASH HIGHLIGHT */}
      <div className="my-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Available Cash in Drawer (Large Hero Box) */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 p-6 text-white shadow-lg shadow-emerald-500/10 lg:col-span-6">
          <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-white backdrop-blur-sm">
                <Banknote className="h-3.5 w-3.5" /> Available In Drawer Today
              </span>
              <span className="text-[11px] font-bold text-white/80">
                Live Balance
              </span>
            </div>

            <div>
              <p className="text-4xl font-black tracking-tight drop-shadow-sm sm:text-5xl">
                {formatCurrency(availableCashToday)}
              </p>
              <p className="mt-1 text-xs font-semibold text-white/85">
                Starting Float + Today&apos;s Cash Sales − Expenses − Banked to
                Owner
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-white/20 text-xs font-bold">
              <div>
                <span className="text-white/70">Starting Float: </span>
                <span>{formatCurrency(startingDayCash)}</span>
              </div>
              <div>
                <span className="text-white/70">Banked to Owner: </span>
                <span>{formatCurrency(banked)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown of Today's Movement (Right side of Hero) */}
        <div className="grid grid-cols-2 gap-3 lg:col-span-6">
          {/* Today Cash Sales - INFLOW */}
          <div className="flex flex-col justify-between rounded-3xl border border-[#bef264]/70 bg-gradient-to-br from-[#f7fee7] via-[#ecfccb] to-[#d9f99d]/80 p-5 shadow-sm dark:border-lime-800/50 dark:from-lime-950/50 dark:via-lime-900/40 dark:to-lime-950/30">
            <div className="flex items-center justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-lime-100/80 text-lime-700 dark:bg-lime-950/60 dark:text-lime-400">
                <ArrowUpRight className="h-4 w-4" />
              </span>
              <span className="rounded-full bg-white/60 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-lime-800 border border-white/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur-md dark:bg-white/15 dark:text-lime-300 dark:border-white/20">
                Inflow
              </span>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {formatCurrency(todayMetrics.cashSales)}
              </p>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                Today&apos;s Cash Sales ({todayMetrics.invoiceCount} invoices)
              </p>
            </div>
          </div>

          {/* Today Cash Expenses - OUTFLOW */}
          <div className="flex flex-col justify-between rounded-3xl border border-[#fde047]/70 bg-gradient-to-br from-[#fffbeb] via-[#fef9c3] to-[#fde047]/70 p-5 shadow-sm dark:border-amber-800/50 dark:from-amber-950/50 dark:via-yellow-950/40 dark:to-amber-950/30">
            <div className="flex items-center justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100/80 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                <ArrowDownRight className="h-4 w-4" />
              </span>
              <span className="rounded-full bg-white/60 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-600 border border-white/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur-md dark:bg-white/15 dark:text-red-400 dark:border-white/20">
                Outflow
              </span>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black text-red-600 dark:text-red-400">
                {formatCurrency(todayMetrics.cashExpenses)}
              </p>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                Stock Purchases & Expenses ({todayMetrics.expenseCount})
              </p>
            </div>
          </div>

          {/* Banked to Owner Today - TRANSFERRED */}
          <div className="flex flex-col justify-between rounded-3xl border border-[#c4b5fd]/60 bg-gradient-to-br from-[#faf5ff] via-[#f3e8ff] to-[#ddd6fe]/80 p-5 shadow-sm dark:border-purple-800/50 dark:from-purple-950/50 dark:via-purple-900/40 dark:to-violet-950/30">
            <div className="flex items-center justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100/80 text-violet-700 dark:bg-violet-950/60 dark:text-violet-400">
                <Building2 className="h-4 w-4" />
              </span>
              <span className="rounded-full bg-white/60 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-violet-700 border border-white/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur-md dark:bg-white/15 dark:text-violet-300 dark:border-white/20">
                Transferred
              </span>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black text-violet-700 dark:text-violet-300">
                {formatCurrency(banked)}
              </p>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                Banked to Owner Today
              </p>
            </div>
          </div>

          {/* Starting Float - OPENING */}
          <div className="flex flex-col justify-between rounded-3xl border border-[#67e8f9]/60 bg-gradient-to-br from-[#ecfeff] via-[#cffafe] to-[#a5f3fc]/80 p-5 shadow-sm dark:border-teal-800/50 dark:from-teal-950/50 dark:via-teal-900/40 dark:to-cyan-950/30">
            <div className="flex items-center justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-100/80 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400">
                <Receipt className="h-4 w-4" />
              </span>
              <span className="rounded-full bg-white/60 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-teal-800 border border-white/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur-md dark:bg-white/15 dark:text-teal-300 dark:border-white/20">
                Opening
              </span>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {formatCurrency(startingDayCash)}
              </p>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                Starting Day Float (Today)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* PERIOD BREAKDOWN TABS */}
      <div className="mt-6 rounded-3xl border border-slate-100 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-800/30">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-black text-slate-900 dark:text-white">
            Cash Breakdown by Period
          </h3>

          {/* Tab Selector */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-200/60 dark:bg-slate-800 p-1 rounded-2xl">
            {(
              ["today", "yesterday", "week", "month", "all"] as PeriodTab[]
            ).map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedPeriod(tab)}
                className={`rounded-xl px-3 py-1.5 text-xs font-black transition-all cursor-pointer ${
                  selectedPeriod === tab
                    ? "bg-white text-slate-950 shadow-sm dark:bg-slate-700 dark:text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                {periodLabels[tab]}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Period Stats Bar */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-800">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Cash Sales ({periodLabels[selectedPeriod]})
            </span>
            <p className="mt-1 text-xl font-black text-emerald-600 dark:text-emerald-400">
              {formatCurrency(activePeriodMetrics.cashSales)}
            </p>
            <span className="text-[11px] font-bold text-slate-500">
              {activePeriodMetrics.invoiceCount} cash invoices
            </span>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-800">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Cash Expenses ({periodLabels[selectedPeriod]})
            </span>
            <p className="mt-1 text-xl font-black text-rose-600 dark:text-rose-400">
              {formatCurrency(activePeriodMetrics.cashExpenses)}
            </p>
            <span className="text-[11px] font-bold text-slate-500">
              {activePeriodMetrics.expenseCount} stock purchases
            </span>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-800">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Net Cash Flow
            </span>
            <p
              className={`mt-1 text-xl font-black ${
                activePeriodMetrics.netCash >= 0
                  ? "text-slate-900 dark:text-white"
                  : "text-rose-600"
              }`}
            >
              {formatCurrency(activePeriodMetrics.netCash)}
            </p>
            <span className="text-[11px] font-bold text-slate-500">
              Sales minus Expenses
            </span>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-800">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Previous Sales Total
            </span>
            <p className="mt-1 text-xl font-black text-[#84CC16]">
              {formatCurrency(allTimeMetrics.cashSales)}
            </p>
            <span className="text-[11px] font-bold text-slate-500">
              Cumulative cash sales
            </span>
          </div>
        </div>
      </div>

      {/* ─── MODAL 1: BANK CASH TO OWNER ─── */}
      <Dialog open={showBankModal} onOpenChange={setShowBankModal}>
        <DialogContent className="max-w-md rounded-3xl p-6 font-poppins">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-black text-slate-950 dark:text-white">
              <Building2 className="h-5 w-5 text-violet-600" /> Bank Cash to
              Owner
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={onBankSubmit} className="space-y-4 pt-2">
            <div className="rounded-2xl border border-violet-100 bg-violet-50/50 p-4 dark:border-violet-900/30 dark:bg-violet-950/20 text-xs">
              <div className="flex justify-between font-bold text-slate-600 dark:text-slate-300">
                <span>Available Cash in Drawer:</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(availableCashToday)}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Banking cash reduces available drawer cash and logs the amount
                transferred to the store owner.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Amount to Bank
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={bankAmount}
                onChange={(e) => setBankAmount(e.target.value)}
                placeholder="e.g. 500"
                className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-900 focus:border-violet-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowBankModal(false)}
                className="w-1/2 h-11 rounded-xl border border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50 cursor-pointer transition dark:border-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 h-11 rounded-xl bg-violet-600 text-xs font-black text-white hover:bg-violet-700 transition cursor-pointer shadow-md shadow-violet-500/20"
              >
                Confirm Banked
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL 2: CASH MANAGEMENT (ADD CASH OR SET FLOAT) ─── */}
      <Dialog open={showFloatModal} onOpenChange={setShowFloatModal}>
        <DialogContent className="max-w-md rounded-3xl p-6 font-poppins">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-black text-slate-950 dark:text-white">
              {floatMode === "add" ? (
                <>
                  <PlusCircle className="h-5 w-5 text-lime-600" /> Add Cash to
                  Drawer
                </>
              ) : (
                <>
                  <Banknote className="h-5 w-5 text-lime-600" /> Today&apos;s
                  Starting Float
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {/* Mode Switcher */}
          <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800 my-1">
            <button
              type="button"
              onClick={() => {
                setFloatMode("add");
                setFloatAmount("");
              }}
              className={`w-1/2 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                floatMode === "add"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
              }`}
            >
              + Add Cash
            </button>
            <button
              type="button"
              onClick={() => {
                setFloatMode("set");
                setFloatAmount(startingDayCash ? String(startingDayCash) : "");
              }}
              className={`w-1/2 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                floatMode === "set"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
              }`}
            >
              Set Exact Float
            </button>
          </div>

          <form onSubmit={onFloatSubmit} className="space-y-4 pt-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {floatMode === "add"
                ? "Deposit cash into the drawer. This amount will be added to your current float."
                : "Configure the baseline opening cash float placed in the register at the start of today."}
            </p>

            {floatMode === "add" && startingDayCash > 0 && (
              <div className="rounded-xl border border-slate-200/80 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40 p-3 text-xs flex justify-between items-center">
                <span className="font-semibold text-slate-500 dark:text-slate-400">
                  Current Day Float:
                </span>
                <span className="font-black text-slate-900 dark:text-white font-mono">
                  {formatCurrency(startingDayCash)}
                </span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                {floatMode === "add" ? "Amount to Add" : "Starting Cash Amount"}
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={floatAmount}
                onChange={(e) => setFloatAmount(e.target.value)}
                placeholder={floatMode === "add" ? "e.g. 900" : "e.g. 850"}
                className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-900 focus:border-[#84CC16] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>

            {floatMode === "add" && Number(floatAmount) > 0 && (
              <div className="rounded-xl bg-lime-50 dark:bg-lime-950/40 border border-lime-200 dark:border-lime-900/50 p-3 text-xs flex justify-between items-center text-lime-900 dark:text-lime-300">
                <span className="font-bold">New Accumulated Float:</span>
                <span className="font-black text-sm font-mono">
                  {formatCurrency(startingDayCash + Number(floatAmount || 0))}
                </span>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowFloatModal(false)}
                className="w-1/2 h-11 rounded-xl border border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50 cursor-pointer transition dark:border-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 h-11 rounded-xl bg-[#84CC16] text-xs font-black text-white hover:bg-[#76b813] transition cursor-pointer shadow-md shadow-lime-500/20"
              >
                {floatMode === "add"
                  ? "Add Cash to Drawer"
                  : "Save Starting Float"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL 3: ALLOCATE CASH (BANK VS DRAWER) ─── */}
      <Dialog open={showAllocateModal} onOpenChange={setShowAllocateModal}>
        <DialogContent className="max-w-md rounded-3xl p-6 font-poppins">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-black text-slate-950 dark:text-white">
              <Layers className="h-5 w-5 text-slate-900 dark:text-white" />{" "}
              Allocate Bank vs. Drawer
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={onAllocateSubmit} className="space-y-4 pt-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Adjust how cash amounts are allocated between the owner&apos;s
              bank account and the cash drawer.
            </p>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Banked to Owner Total
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={allocBanked}
                  onChange={(e) => setAllocBanked(e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-900 focus:border-violet-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Cash in Drawer Total
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={allocDrawer}
                  onChange={(e) => setAllocDrawer(e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-900 focus:border-[#84CC16] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAllocateModal(false)}
                className="w-1/2 h-11 rounded-xl border border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-50 cursor-pointer transition dark:border-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 h-11 rounded-xl bg-slate-900 text-xs font-black text-white hover:bg-slate-800 transition cursor-pointer dark:bg-white dark:text-slate-900"
              >
                Save Allocation
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
