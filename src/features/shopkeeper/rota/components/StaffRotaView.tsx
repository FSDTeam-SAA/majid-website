"use client";

import React, { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Plus,
  Clock,
  DollarSign,
  Users,
  Store,
  ArrowRight,
  Loader2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  LayoutGrid,
  Table as TableIcon,
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
  useRota,
  useSaveRota,
  usePublishRota,
  useCopyLastWeek,
} from "../hooks/useRota";
import {
  IShiftItem,
  IRotaStaffMember,
  IAttendanceRecord,
  getMondayOfWeek,
} from "../api/rota.api";
import { ShiftEditModal } from "./ShiftEditModal";
import { toast } from "sonner";

// Helper to format Date into YYYY-MM-DD
const formatDayKey = (d: Date | string) => {
  const date = new Date(d);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const StaffRotaView: React.FC = () => {
  const { shops, activeShopId, setActiveShop } = useShop();

  // DEFAULT VIEW IS "month" per user specification
  const [viewMode, setViewMode] = useState<"week" | "month" | "year">("month");
  const [monthLayout, setMonthLayout] = useState<"matrix" | "grid">("matrix");

  // Selected Month (Default to current month: October 2026)
  const [selectedMonth, setSelectedMonth] = useState<Date>(
    () => new Date(2026, 9, 1),
  );

  // Current selected week Monday (Default to current week: 26 Oct 2026)
  const [currentMonday, setCurrentMonday] = useState<Date>(() =>
    getMondayOfWeek(new Date(2026, 9, 26)),
  );

  // Shift Editing Modal State
  const [editingShift, setEditingShift] = useState<{
    shift: IShiftItem | null;
    staff: IRotaStaffMember | null;
    dateStr: string;
    attendance?: IAttendanceRecord | null;
  } | null>(null);

  // Local shifts override state for responsive instant UX before backend mutation
  const [localShifts, setLocalShifts] = useState<IShiftItem[] | null>(null);

  const shopIdToUse = activeShopId || shops[0]?._id || "demo-shop-romford";
  const weekStartDateStr = currentMonday.toISOString();

  // Query Rota with live shop, week, month and year
  const { data: rotaData } = useRota(
    shopIdToUse,
    weekStartDateStr,
    selectedMonth.getMonth() + 1,
    selectedMonth.getFullYear(),
  );

  const saveRotaMutation = useSaveRota(shopIdToUse, weekStartDateStr);
  const publishMutation = usePublishRota(shopIdToUse, weekStartDateStr);
  const copyLastWeekMutation = useCopyLastWeek(shopIdToUse, weekStartDateStr);

  // Active shifts: either local edited or server rota
  const activeShifts = useMemo(() => {
    if (localShifts) return localShifts;
    return rotaData?.rota?.shifts || [];
  }, [localShifts, rotaData?.rota?.shifts]);

  const staffList = useMemo(() => {
    return rotaData?.staffMembers || [];
  }, [rotaData?.staffMembers]);

  // Fast attendance lookup map indexed by "staffId_YYYY-MM-DD"
  const attendanceMap = useMemo(() => {
    const map = new Map<string, IAttendanceRecord>();
    const list = rotaData?.attendances || [];
    list.forEach((att) => {
      const staffId =
        typeof att.staffId === "string" ? att.staffId : att.staffId?._id;
      if (!staffId) return;

      // 1. By record date
      map.set(`${staffId}_${formatDayKey(att.date)}`, att);

      // 2. By clockIn timestamp
      if (att.clockIn?.serverTime) {
        map.set(`${staffId}_${formatDayKey(att.clockIn.serverTime)}`, att);
      }
    });
    return map;
  }, [rotaData?.attendances]);

  // Compute 7 days of the selected week (Mon - Sun)
  const weekDays = useMemo(() => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentMonday);
      d.setDate(currentMonday.getDate() + i);
      days.push(d);
    }
    return days;
  }, [currentMonday]);

  // Compute all days in the selected Month (1st to 28/30/31)
  const monthDays = useMemo(() => {
    const y = selectedMonth.getFullYear();
    const m = selectedMonth.getMonth();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const days: Date[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(y, m, d));
    }
    return days;
  }, [selectedMonth]);

  // Label: "October 2026"
  const monthRangeLabel = useMemo(() => {
    return new Intl.DateTimeFormat("en-GB", {
      month: "long",
      year: "numeric",
    }).format(selectedMonth);
  }, [selectedMonth]);

  // Date range label: "26 October - 01 November 2026"
  const weekRangeLabel = useMemo(() => {
    const start = weekDays[0];
    const end = weekDays[6];
    const sDay = start.getDate();
    const eDay = end.getDate();
    const sMonth = new Intl.DateTimeFormat("en-GB", { month: "short" }).format(
      start,
    );
    const eMonth = new Intl.DateTimeFormat("en-GB", { month: "short" }).format(
      end,
    );
    const year = end.getFullYear();
    return `${sDay} ${sMonth} - ${eDay} ${eMonth} ${year}`;
  }, [weekDays]);

  // Navigation Handlers for Week
  const handlePrevWeek = () => {
    const prev = new Date(currentMonday);
    prev.setDate(prev.getDate() - 7);
    setCurrentMonday(prev);
    setLocalShifts(null);
  };

  const handleNextWeek = () => {
    const next = new Date(currentMonday);
    next.setDate(next.getDate() + 7);
    setCurrentMonday(next);
    setLocalShifts(null);
  };

  const handleTodayWeek = () => {
    setCurrentMonday(getMondayOfWeek(new Date(2026, 9, 30)));
    setLocalShifts(null);
  };

  // Navigation Handlers for Month
  const handlePrevMonth = () => {
    setSelectedMonth(
      new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setSelectedMonth(
      new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1),
    );
  };

  const handleTodayMonth = () => {
    setSelectedMonth(new Date(2026, 9, 1));
  };

  // Find shift for a staff member on a specific date
  const getShiftForStaffAndDate = (
    staffId: string,
    targetDate: Date,
  ): IShiftItem | undefined => {
    const targetIso = formatDayKey(targetDate);
    return activeShifts.find((s) => {
      const sId = typeof s.staffId === "string" ? s.staffId : s.staffId?._id;
      const sDateIso = formatDayKey(s.date);
      return sId === staffId && sDateIso === targetIso;
    });
  };

  // Find attendance record for a staff member on a specific date
  const getAttendanceForStaffAndDate = (
    staffId: string,
    targetDate: Date,
  ): IAttendanceRecord | null => {
    const key = `${staffId}_${formatDayKey(targetDate)}`;
    if (attendanceMap.has(key)) {
      return attendanceMap.get(key) || null;
    }

    // Fallback: check if the shift object itself has embedded attendance
    const shift = getShiftForStaffAndDate(staffId, targetDate);
    if (shift?.attendance) {
      return shift.attendance as unknown as IAttendanceRecord;
    }

    return null;
  };

  // Handle saving an edited shift
  const handleSaveShift = (updated: IShiftItem) => {
    const updatedDateIso = formatDayKey(updated.date);
    const updatedStaffId =
      typeof updated.staffId === "string"
        ? updated.staffId
        : updated.staffId?._id;

    const newShifts = [...activeShifts];
    const existingIndex = newShifts.findIndex((s) => {
      const sId = typeof s.staffId === "string" ? s.staffId : s.staffId?._id;
      const sDateIso = formatDayKey(s.date);
      return sId === updatedStaffId && sDateIso === updatedDateIso;
    });

    if (existingIndex >= 0) {
      newShifts[existingIndex] = updated;
    } else {
      newShifts.push(updated);
    }

    setLocalShifts(newShifts);
    saveRotaMutation.mutate(newShifts);
  };

  // Calculate live summary metrics
  const {
    totalScheduledHours,
    totalEstimatedCost,
    activeClockedInCount,
    dailyCoverageMap,
  } = useMemo(() => {
    let schedHours = 0;
    let cost = 0;
    let activeNow = 0;
    const coverage: Record<string, number> = {};

    const targetDays = viewMode === "month" ? monthDays : weekDays;

    targetDays.forEach((d) => {
      coverage[formatDayKey(d)] = 0;
    });

    activeShifts.forEach((s) => {
      if (!s.isOff && s.hours > 0) {
        schedHours += s.hours;
        const dateKey = formatDayKey(s.date);
        if (coverage[dateKey] !== undefined) {
          coverage[dateKey] = (coverage[dateKey] || 0) + 1;
        }

        let wage = 12;
        if (typeof s.staffId === "object" && s.staffId?.hourlyWage) {
          wage = s.staffId.hourlyWage;
        } else {
          const match = staffList.find(
            (st) => st._id === (typeof s.staffId === "string" ? s.staffId : ""),
          );
          if (match?.hourlyWage) wage = match.hourlyWage;
        }
        cost += s.hours * wage;
      }
    });

    (rotaData?.attendances || []).forEach((att) => {
      if (att.clockIn && !att.clockOut) {
        activeNow += 1;
      }
    });

    return {
      totalScheduledHours: Math.round(schedHours * 10) / 10,
      totalEstimatedCost: Math.round(cost * 100) / 100,
      activeClockedInCount: activeNow,
      dailyCoverageMap: coverage,
    };
  }, [
    activeShifts,
    viewMode,
    monthDays,
    weekDays,
    staffList,
    rotaData?.attendances,
  ]);

  const rotaStatus = rotaData?.rota?.status || "published";

  // Check if a date is TODAY (30 Oct 2026)
  const isTodayDate = (date: Date) => {
    return (
      date.getDate() === 30 &&
      date.getMonth() === 9 &&
      date.getFullYear() === 2026
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1700px] mx-auto space-y-6 font-poppins">
      {/* Top Header & Store Navigation Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
        {/* Left: Store selector and Title */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#84CC16]/10 text-[#65A30D]">
              <CalendarIcon className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Staff Rota & Attendance Schedule
            </h1>
            <Badge
              variant="outline"
              className={
                rotaStatus === "published"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-bold"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-bold"
              }
            >
              {rotaStatus === "published"
                ? "✓ Published & Live"
                : "● Draft calculation"}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
            Plan staff shifts, view actual live NFC check-in and check-out
            clocking logs, and track monthly wages.
          </p>
        </div>

        {/* Store selector dropdown & actions */}
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

          {/* Copy last week button */}
          <Button
            type="button"
            variant="outline"
            onClick={() => copyLastWeekMutation.mutate()}
            disabled={copyLastWeekMutation.isPending}
            className="rounded-xl text-xs font-bold border-border hover:bg-muted gap-1.5"
          >
            {copyLastWeekMutation.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-muted-foreground" />
            )}
            Copy Schedule
          </Button>

          {/* Publish Rota Button */}
          <Button
            type="button"
            onClick={() => publishMutation.mutate()}
            disabled={publishMutation.isPending || rotaStatus === "published"}
            className="bg-[#84CC16] hover:bg-[#74b513] text-white rounded-xl text-xs font-bold shadow-md shadow-[#84CC16]/20 gap-1.5"
          >
            {publishMutation.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            {rotaStatus === "published" ? "Rota Published" : "Publish rota"}
          </Button>
        </div>
      </div>

      {/* Date Navigation & View Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/70 backdrop-blur-sm border border-border rounded-2xl p-3 px-4 shadow-xs">
        {/* Date Navigator */}
        <div className="flex items-center gap-2">
          {viewMode === "month" ? (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevMonth}
                className="w-8 h-8 rounded-lg border-border"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="px-3.5 py-1.5 bg-surface rounded-lg border border-border/80 text-xs sm:text-sm font-black text-foreground flex items-center gap-2">
                <CalendarIcon className="w-3.5 h-3.5 text-[#84CC16]" />
                {monthRangeLabel}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextMonth}
                className="w-8 h-8 rounded-lg border-border"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleTodayMonth}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                This Month
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevWeek}
                className="w-8 h-8 rounded-lg border-border"
                title="Previous Week"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="px-3.5 py-1.5 bg-surface rounded-lg border border-border/80 text-xs sm:text-sm font-black text-foreground flex items-center gap-2">
                <CalendarIcon className="w-3.5 h-3.5 text-[#84CC16]" />
                {weekRangeLabel}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextWeek}
                className="w-8 h-8 rounded-lg border-border"
                title="Next Week"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleTodayWeek}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Today
              </Button>
            </>
          )}
        </div>

        {/* View Switcher Controls */}
        <div className="flex items-center gap-3">
          {/* Month Sub-layout Switcher */}
          {viewMode === "month" && (
            <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-border/60">
              <button
                type="button"
                onClick={() => setMonthLayout("matrix")}
                className={`p-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  monthLayout === "matrix"
                    ? "bg-[#84CC16]/20 text-[#4d7c0f] dark:text-[#a3e635] border border-[#84CC16]/30 shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Staff Monthly Schedule Matrix"
              >
                <TableIcon className="w-3.5 h-3.5" />
                Staff Matrix
              </button>
              <button
                type="button"
                onClick={() => setMonthLayout("grid")}
                className={`p-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  monthLayout === "grid"
                    ? "bg-[#84CC16]/20 text-[#4d7c0f] dark:text-[#a3e635] border border-[#84CC16]/30 shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Monthly Calendar Days Grid"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Calendar Grid
              </button>
            </div>
          )}

          {/* View Switcher: Month / Week / Year */}
          <div className="flex items-center gap-1 bg-surface-muted p-1 rounded-xl border border-border/60">
            {(["month", "week", "year"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => {
                  setViewMode(mode);
                  if (mode === "year") {
                    toast.info("Yearly aggregated view selected");
                  }
                }}
                className={`px-3.5 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                  viewMode === mode
                    ? "bg-card text-foreground shadow-sm border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {mode === "month"
                  ? "Monthly"
                  : mode === "week"
                    ? "Weekly"
                    : mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards: Scheduled, Check-ins, Wages, Active Staff */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Scheduled Paid Hours */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground">
              {viewMode === "month"
                ? "Month Scheduled Hours"
                : "Week Scheduled Hours"}
            </span>
            <p className="text-2xl font-black text-foreground">
              {totalScheduledHours}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                hrs
              </span>
            </p>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 2: Live Clocked-In Attendance */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground">
              Active Clocked-In Now
            </span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              {activeClockedInCount}{" "}
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                In Store
              </span>
            </p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3: Estimated Rota Cost */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground">
              {viewMode === "month"
                ? "Estimated Month Wage"
                : "Estimated Week Wage"}
            </span>
            <p className="text-2xl font-black text-[#65A30D]">
              £{totalEstimatedCost.toLocaleString()}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#84CC16]/10 text-[#65A30D]">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4: Total Logged Attendance Records */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground">
              Recorded Taps / Events
            </span>
            <p className="text-2xl font-black text-foreground">
              {rotaData?.attendances?.length || 0}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                events
              </span>
            </p>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. MONTHLY VIEW (DEFAULT)                               */}
      {/* ======================================================== */}
      {viewMode === "month" && (
        <>
          {monthLayout === "matrix" ? (
            /* --- MONTHLY STAFF MATRIX VIEW --- */
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="p-3 bg-surface border-b border-border flex items-center justify-between text-xs font-bold text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <TableIcon className="w-4 h-4 text-[#84CC16]" />
                  Monthly Staff Schedule & Live Clock-In Attendance Matrix
                </span>
                <span className="text-[11px] font-medium text-muted-foreground">
                  Click any cell to edit shift or inspect NFC clock-in /
                  clock-out timestamps
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1200px]">
                  <thead>
                    <tr className="border-b border-border bg-surface-muted/50 text-[11px] font-bold text-muted-foreground">
                      <th className="p-3.5 pl-5 sticky left-0 z-20 bg-surface min-w-[200px] border-r border-border/80 shadow-xs">
                        Staff Member
                      </th>
                      {monthDays.map((date, idx) => {
                        const dayNum = date.getDate();
                        const dayName = new Intl.DateTimeFormat("en-GB", {
                          weekday: "narrow",
                        }).format(date);
                        const isWeekend =
                          date.getDay() === 0 || date.getDay() === 6;
                        const isToday = isTodayDate(date);

                        return (
                          <th
                            key={idx}
                            className={`p-2 text-center border-l border-border/50 min-w-[90px] ${
                              isToday
                                ? "bg-[#84CC16]/15 border-[#84CC16]/60 text-[#4d7c0f] dark:text-[#a3e635]"
                                : ""
                            }`}
                          >
                            <div className="text-[10px] uppercase font-semibold text-muted-foreground">
                              {dayName}
                            </div>
                            <div
                              className={`text-xs font-black ${
                                isToday
                                  ? "text-[#4d7c0f] dark:text-[#a3e635] flex items-center justify-center gap-0.5"
                                  : isWeekend
                                    ? "text-amber-600 dark:text-amber-400"
                                    : "text-foreground"
                              }`}
                            >
                              {dayNum}
                              {isToday && (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#84CC16]" />
                              )}
                            </div>
                          </th>
                        );
                      })}
                      <th className="p-3 pr-5 text-center min-w-[90px] border-l border-border font-bold">
                        Month Hours
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border/60 text-xs">
                    {staffList.map((member) => {
                      let memberMonthHours = 0;
                      const hourlyRate = member.hourlyWage || 12;

                      return (
                        <tr
                          key={member._id}
                          className="hover:bg-surface/50 transition-colors group"
                        >
                          {/* Sticky Staff Profile Column */}
                          <td className="p-3 pl-5 sticky left-0 z-20 bg-card group-hover:bg-surface border-r border-border/80">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-[#84CC16]/15 border border-[#84CC16]/30 flex items-center justify-center font-black text-[#65A30D] text-xs shrink-0">
                                {member.firstName?.[0]}
                                {member.lastName?.[0] || ""}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-xs text-foreground truncate">
                                  {member.firstName} {member.lastName || ""}
                                </p>
                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                  <span className="font-mono bg-surface-muted px-1.5 py-0.2 rounded border border-border/60 text-[9px] font-bold text-foreground">
                                    {member.staffId || "STF"}
                                  </span>
                                  <span className="text-[#65A30D] font-semibold">
                                    £{hourlyRate}/h
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Day Columns for this staff member */}
                          {monthDays.map((date, dayIdx) => {
                            const shift = getShiftForStaffAndDate(
                              member._id,
                              date,
                            );
                            const att = getAttendanceForStaffAndDate(
                              member._id,
                              date,
                            );
                            const isWorking =
                              shift && !shift.isOff && shift.hours > 0;
                            if (isWorking) {
                              memberMonthHours += shift.hours;
                            }
                            const isToday = isTodayDate(date);

                            return (
                              <td
                                key={dayIdx}
                                className={`p-1.5 border-l border-border/50 text-center align-middle ${
                                  isToday ? "bg-[#84CC16]/5" : ""
                                }`}
                              >
                                {att ? (
                                  /* Cell has LIVE NFC ATTENDANCE DATA */
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setEditingShift({
                                        shift: shift || null,
                                        staff: member,
                                        dateStr: date.toISOString(),
                                        attendance: att,
                                      })
                                    }
                                    className="w-full p-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-center transition-all shadow-2xs group/cell"
                                  >
                                    <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                      <span>
                                        In{" "}
                                        {att.clockIn?.formattedTime ||
                                          "09:40 am"}
                                      </span>
                                    </div>
                                    <div className="text-[9px] font-semibold text-muted-foreground truncate">
                                      {att.clockOut?.formattedTime ? (
                                        <span>
                                          Out {att.clockOut.formattedTime}
                                        </span>
                                      ) : (
                                        <span className="text-emerald-600 font-bold flex items-center justify-center gap-0.5">
                                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                          Active
                                        </span>
                                      )}
                                    </div>
                                    {att.status && att.status !== "present" && (
                                      <span className="mt-0.5 inline-block text-[8px] font-bold px-1 rounded uppercase tracking-wider bg-amber-500/20 text-amber-700 dark:text-amber-300">
                                        {att.status.replace("_", " ")}
                                      </span>
                                    )}
                                  </button>
                                ) : isWorking ? (
                                  /* Cell has scheduled shift but no check-in yet */
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setEditingShift({
                                        shift,
                                        staff: member,
                                        dateStr: date.toISOString(),
                                        attendance: null,
                                      })
                                    }
                                    className="w-full p-1.5 rounded-xl border border-[#84CC16]/30 bg-[#84CC16]/10 hover:bg-[#84CC16]/20 text-center transition-all shadow-2xs"
                                  >
                                    <div className="text-[10px] font-bold text-[#4d7c0f] dark:text-[#a3e635]">
                                      {shift.startTime} - {shift.endTime}
                                    </div>
                                    <div className="text-[9px] font-medium text-muted-foreground">
                                      {shift.hours}h
                                    </div>
                                  </button>
                                ) : (
                                  /* Cell is Day Off */
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setEditingShift({
                                        shift: shift || null,
                                        staff: member,
                                        dateStr: date.toISOString(),
                                        attendance: null,
                                      })
                                    }
                                    className="w-full py-1.5 px-1 rounded-lg border border-dashed border-border/60 hover:bg-muted text-center text-muted-foreground/60 hover:text-foreground text-[10px] font-medium transition-all"
                                  >
                                    Off
                                  </button>
                                )}
                              </td>
                            );
                          })}

                          {/* Member Total Month Hours */}
                          <td className="p-3 pr-5 text-center border-l border-border font-bold">
                            <div className="text-xs font-black text-foreground">
                              {memberMonthHours}h
                            </div>
                            <div className="text-[10px] text-[#65A30D] font-semibold">
                              £{Math.round(memberMonthHours * hourlyRate)}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* --- MONTHLY CALENDAR GRID VIEW --- */
            <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
              <div className="grid grid-cols-7 gap-2 sm:gap-3 text-center font-bold text-xs text-muted-foreground border-b border-border pb-3">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                  (day, idx) => (
                    <div key={idx} className="uppercase tracking-wider">
                      {day}
                    </div>
                  ),
                )}
              </div>

              <div className="grid grid-cols-7 gap-2 sm:gap-3">
                {monthDays.map((date, idx) => {
                  const dayNum = date.getDate();
                  const isToday = isTodayDate(date);
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                  // Find staff with shifts or attendance on this day
                  const staffOnDay = staffList
                    .map((m) => {
                      const shift = getShiftForStaffAndDate(m._id, date);
                      const att = getAttendanceForStaffAndDate(m._id, date);
                      return { staff: m, shift, att };
                    })
                    .filter(
                      (item) => (item.shift && !item.shift.isOff) || item.att,
                    );

                  return (
                    <div
                      key={idx}
                      className={`min-h-[110px] p-2 rounded-xl border transition-all flex flex-col justify-between ${
                        isToday
                          ? "bg-[#84CC16]/10 border-[#84CC16]/60 shadow-xs"
                          : "bg-surface/60 border-border hover:border-border/80"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-black ${
                            isToday
                              ? "text-[#4d7c0f] dark:text-[#a3e635] flex items-center gap-1"
                              : isWeekend
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-foreground"
                          }`}
                        >
                          {dayNum}
                          {isToday && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-[#84CC16] text-white font-bold">
                              TODAY
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground">
                          {staffOnDay.length} staff
                        </span>
                      </div>

                      <div className="space-y-1 my-1">
                        {staffOnDay.slice(0, 3).map((item, sIdx) => (
                          <div
                            key={sIdx}
                            onClick={() =>
                              setEditingShift({
                                shift: item.shift || null,
                                staff: item.staff,
                                dateStr: date.toISOString(),
                                attendance: item.att,
                              })
                            }
                            className={`p-1 px-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all truncate flex items-center justify-between ${
                              item.att
                                ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                                : "bg-[#84CC16]/15 border border-[#84CC16]/30 text-[#4d7c0f] dark:text-[#a3e635]"
                            }`}
                          >
                            <span className="truncate">
                              {item.staff.firstName}
                            </span>
                            {item.att ? (
                              <span className="text-[9px] font-mono shrink-0">
                                In {item.att.clockIn?.formattedTime || "09:40"}
                              </span>
                            ) : (
                              <span className="text-[9px] font-mono shrink-0">
                                {item.shift?.startTime || "09:00"}
                              </span>
                            )}
                          </div>
                        ))}
                        {staffOnDay.length > 3 && (
                          <div className="text-[9px] font-semibold text-muted-foreground text-center">
                            +{staffOnDay.length - 3} more
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setEditingShift({
                            shift: null,
                            staff: staffList[0] || null,
                            dateStr: date.toISOString(),
                            attendance: null,
                          })
                        }
                        className="text-[9px] font-bold text-muted-foreground/70 hover:text-[#84CC16] text-right flex items-center justify-end gap-0.5"
                      >
                        <Plus className="w-2.5 h-2.5" /> add shift
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* ======================================================== */}
      {/* 2. WEEKLY VIEW                                           */}
      {/* ======================================================== */}
      {viewMode === "week" && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-3 bg-surface border-b border-border flex items-center justify-between text-xs font-bold text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4 text-[#84CC16]" />
              7-Day Weekly Rota & Attendance Grid
            </span>
            <span className="text-[11px] font-medium text-muted-foreground">
              Displays scheduled shifts alongside live check-in and check-out
              logs
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[950px]">
              {/* Header: Staff + Mon-Sun + Total */}
              <thead>
                <tr className="border-b border-border bg-surface-muted/50 text-xs font-bold text-muted-foreground">
                  <th className="p-4 pl-6 w-56">Staff Member</th>
                  {weekDays.map((date, idx) => {
                    const isWeekend = idx >= 5;
                    const dayName = new Intl.DateTimeFormat("en-GB", {
                      weekday: "short",
                    }).format(date);
                    const dateNum = date.getDate();
                    const monthName = new Intl.DateTimeFormat("en-GB", {
                      month: "short",
                    }).format(date);
                    const isToday = isTodayDate(date);

                    return (
                      <th
                        key={idx}
                        className={`p-3 text-center border-l border-border/60 ${
                          isToday ? "bg-[#84CC16]/10" : ""
                        }`}
                      >
                        <div className="text-[11px] uppercase tracking-wider font-semibold">
                          {dayName}
                        </div>
                        <div
                          className={`text-sm font-black ${
                            isToday
                              ? "text-[#4d7c0f] dark:text-[#a3e635] flex items-center justify-center gap-1"
                              : isWeekend
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-foreground"
                          }`}
                        >
                          {dateNum} {monthName}
                          {isToday && (
                            <span className="w-2 h-2 rounded-full bg-[#84CC16]" />
                          )}
                        </div>
                      </th>
                    );
                  })}
                  <th className="p-4 pr-6 text-center w-28 border-l border-border/60">
                    Total Hours
                  </th>
                </tr>
              </thead>

              {/* Body: Staff rows */}
              <tbody className="divide-y divide-border/60 text-xs">
                {staffList.map((member) => {
                  let memberTotalHours = 0;
                  const hourlyRate = member.hourlyWage || 12;

                  return (
                    <tr
                      key={member._id}
                      className="hover:bg-surface/60 transition-colors group"
                    >
                      {/* Staff Profile column */}
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#84CC16]/15 border border-[#84CC16]/30 flex items-center justify-center font-black text-[#65A30D] text-xs">
                            {member.firstName?.[0]}
                            {member.lastName?.[0] || ""}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-foreground truncate">
                              {member.firstName} {member.lastName || ""}
                            </p>
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                              <span className="font-mono bg-surface-muted px-1.5 py-0.5 rounded border border-border/60 text-[10px] font-bold text-foreground">
                                {member.staffId || "STF"}
                              </span>
                              <span>•</span>
                              <span className="text-[#65A30D] font-semibold">
                                £{hourlyRate}/h
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 7 Days Shifts */}
                      {weekDays.map((date, dayIdx) => {
                        const shift = getShiftForStaffAndDate(member._id, date);
                        const att = getAttendanceForStaffAndDate(
                          member._id,
                          date,
                        );
                        const isWorking =
                          shift && !shift.isOff && shift.hours > 0;
                        if (isWorking) {
                          memberTotalHours += shift.hours;
                        }

                        return (
                          <td
                            key={dayIdx}
                            className="p-2 border-l border-border/60 text-center align-middle"
                          >
                            {att ? (
                              /* Has Live NFC Attendance Record */
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingShift({
                                    shift: shift || null,
                                    staff: member,
                                    dateStr: date.toISOString(),
                                    attendance: att,
                                  })
                                }
                                className="w-full py-2 px-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 rounded-xl text-center transition-all shadow-xs space-y-0.5"
                              >
                                <div className="flex items-center justify-center gap-1 font-bold text-xs text-emerald-800 dark:text-emerald-300">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>
                                    In:{" "}
                                    {att.clockIn?.formattedTime || "09:40 am"}
                                  </span>
                                </div>
                                <div className="text-[10px] font-semibold text-foreground">
                                  {att.clockOut?.formattedTime ? (
                                    <span>
                                      Out: {att.clockOut.formattedTime}
                                    </span>
                                  ) : (
                                    <span className="text-emerald-600 font-bold flex items-center justify-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                      Clocked In
                                    </span>
                                  )}
                                </div>
                                {shift && (
                                  <div className="text-[9px] text-muted-foreground">
                                    Sched: {shift.startTime} - {shift.endTime}
                                  </div>
                                )}
                              </button>
                            ) : isWorking ? (
                              /* Scheduled shift */
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingShift({
                                    shift,
                                    staff: member,
                                    dateStr: date.toISOString(),
                                    attendance: null,
                                  })
                                }
                                className="w-full py-2 px-2 bg-[#84CC16]/15 hover:bg-[#84CC16]/25 border border-[#84CC16]/40 rounded-xl text-center transition-all shadow-xs"
                              >
                                <div className="font-bold text-xs text-[#4d7c0f] dark:text-[#a3e635]">
                                  {shift.startTime} - {shift.endTime}
                                </div>
                                <div className="text-[10px] font-semibold text-muted-foreground">
                                  {shift.hours}h{" "}
                                  {shift.note ? `• ${shift.note}` : ""}
                                </div>
                              </button>
                            ) : (
                              /* Day Off */
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingShift({
                                    shift: shift || null,
                                    staff: member,
                                    dateStr: date.toISOString(),
                                    attendance: null,
                                  })
                                }
                                className="w-full py-2.5 px-2 bg-surface-muted/60 hover:bg-muted border border-dashed border-border/80 rounded-xl text-center transition-all text-muted-foreground/80 hover:text-foreground flex flex-col items-center justify-center gap-0.5"
                              >
                                <span className="text-xs font-semibold">
                                  Off
                                </span>
                                <span className="text-[10px] opacity-60 flex items-center gap-0.5">
                                  <Plus className="w-2.5 h-2.5" /> add
                                </span>
                              </button>
                            )}
                          </td>
                        );
                      })}

                      {/* Total weekly hours & pay for staff member */}
                      <td className="p-4 pr-6 text-center border-l border-border/60 font-bold">
                        <div className="text-sm font-black text-foreground">
                          {memberTotalHours}h
                        </div>
                        <div className="text-[11px] text-[#65A30D] font-semibold">
                          £{Math.round(memberTotalHours * hourlyRate)}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {/* Daily Coverage Row */}
                <tr className="bg-surface-muted/80 border-t-2 border-border font-bold">
                  <td className="p-3 pl-6 text-xs text-foreground uppercase tracking-wider">
                    Daily Staff Coverage
                  </td>
                  {weekDays.map((date, idx) => {
                    const dateKey = formatDayKey(date);
                    const count = dailyCoverageMap[dateKey] || 0;
                    return (
                      <td
                        key={idx}
                        className="p-3 border-l border-border/60 text-center"
                      >
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-black">
                          <Users className="w-3 h-3" />
                          {count} staff
                        </span>
                      </td>
                    );
                  })}
                  <td className="p-3 pr-6 text-center border-l border-border/60 text-xs text-muted-foreground">
                    —
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Workflow Progress Guide Banner */}
      <div className="bg-surface border border-border/80 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#84CC16]/20 flex items-center justify-center text-[#65A30D] shrink-0 font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-foreground">
              Workforce Rota & NFC Attendance Cycle
            </p>
            <p className="text-muted-foreground">
              Shifts planned here synchronize with the staff NFC attendance app.
              Live taps display check-in and check-out timestamps in real time.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground flex-wrap">
          <span className="px-2.5 py-1 bg-surface-muted rounded-lg text-foreground border border-border">
            1. Plan Monthly Shifts
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="px-2.5 py-1 bg-surface-muted rounded-lg text-foreground border border-border">
            2. Staff Taps NFC Beacon
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="px-2.5 py-1 bg-surface-muted rounded-lg text-foreground border border-border">
            3. Live Check-In / Out Verified
          </span>
        </div>
      </div>

      {/* Shift Edit & Attendance Modal */}
      {editingShift && (
        <ShiftEditModal
          isOpen={Boolean(editingShift)}
          onClose={() => setEditingShift(null)}
          shift={editingShift.shift}
          staff={editingShift.staff}
          dateStr={editingShift.dateStr}
          attendance={editingShift.attendance}
          onSave={handleSaveShift}
        />
      )}
    </div>
  );
};
