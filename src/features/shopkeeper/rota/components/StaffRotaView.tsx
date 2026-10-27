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
import { IShiftItem, IRotaStaffMember, getMondayOfWeek } from "../api/rota.api";
import { ShiftEditModal } from "./ShiftEditModal";
import { toast } from "sonner";

export const StaffRotaView: React.FC = () => {
  const { shops, activeShopId, setActiveShop } = useShop();

  // Current selected week Monday
  const [currentMonday, setCurrentMonday] = useState<Date>(
    () => getMondayOfWeek(new Date(2026, 9, 19)), // 19 Oct 2026 per specs
  );
  const [viewMode, setViewMode] = useState<"week" | "month" | "year">("week");

  // Shift Editing Modal State
  const [editingShift, setEditingShift] = useState<{
    shift: IShiftItem | null;
    staff: IRotaStaffMember | null;
    dateStr: string;
  } | null>(null);

  // Local shifts override state for responsive instant UX before backend mutation
  const [localShifts, setLocalShifts] = useState<IShiftItem[] | null>(null);

  const shopIdToUse = activeShopId || shops[0]?._id || "demo-shop-romford";
  const weekStartDateStr = currentMonday.toISOString();

  const { data: rotaData } = useRota(shopIdToUse, weekStartDateStr);

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

  // Date range label: "19 - 25 October 2026"
  const weekRangeLabel = useMemo(() => {
    const start = weekDays[0];
    const end = weekDays[6];
    const sDay = start.getDate();
    const eDay = end.getDate();
    const month = new Intl.DateTimeFormat("en-GB", { month: "long" }).format(
      start,
    );
    const year = start.getFullYear();
    return `${sDay} - ${eDay} ${month} ${year}`;
  }, [weekDays]);

  // Navigate Weeks
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
    setCurrentMonday(getMondayOfWeek(new Date()));
    setLocalShifts(null);
  };

  // Find shift for a staff member on a specific date
  const getShiftForStaffAndDate = (
    staffId: string,
    targetDate: Date,
  ): IShiftItem | undefined => {
    const targetIso = targetDate.toISOString().split("T")[0];
    return activeShifts.find((s) => {
      const sId = typeof s.staffId === "string" ? s.staffId : s.staffId?._id;
      const sDateIso = new Date(s.date).toISOString().split("T")[0];
      return sId === staffId && sDateIso === targetIso;
    });
  };

  // Handle saving an edited shift
  const handleSaveShift = (updated: IShiftItem) => {
    const updatedDateIso = new Date(updated.date).toISOString().split("T")[0];
    const updatedStaffId =
      typeof updated.staffId === "string"
        ? updated.staffId
        : updated.staffId?._id;

    const newShifts = [...activeShifts];
    const existingIndex = newShifts.findIndex((s) => {
      const sId = typeof s.staffId === "string" ? s.staffId : s.staffId?._id;
      const sDateIso = new Date(s.date).toISOString().split("T")[0];
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
  const { totalHours, totalCost, dailyCoverageMap } = useMemo(() => {
    let hours = 0;
    let cost = 0;
    const coverage: Record<string, number> = {};

    weekDays.forEach((d) => {
      coverage[d.toISOString().split("T")[0]] = 0;
    });

    activeShifts.forEach((s) => {
      if (!s.isOff && s.hours > 0) {
        hours += s.hours;
        const dateKey = new Date(s.date).toISOString().split("T")[0];
        coverage[dateKey] = (coverage[dateKey] || 0) + 1;

        // Wage calculation
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

    return {
      totalHours: Math.round(hours * 10) / 10,
      totalCost: Math.round(cost * 100) / 100,
      dailyCoverageMap: coverage,
    };
  }, [activeShifts, weekDays, staffList]);

  const rotaStatus = rotaData?.rota?.status || "draft";

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 font-poppins">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
        {/* Left: Store selector and Title */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#84CC16]/10 text-[#65A30D]">
              <CalendarIcon className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Staff Weekly Rota
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
                ? "✓ Published"
                : "● Draft calculation"}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
            Plan team schedules, track daily staffing coverage, and estimate
            shift costs.
          </p>
        </div>

        {/* Store selector dropdown */}
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
            Copy last week
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/60 backdrop-blur-sm border border-border rounded-2xl p-3 px-4">
        {/* Date Navigator */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevWeek}
            className="w-8 h-8 rounded-lg border-border"
            title="Previous Week"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="px-3 py-1 bg-surface rounded-lg border border-border/80 text-xs sm:text-sm font-bold text-foreground">
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
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center gap-1 bg-surface-muted p-1 rounded-xl border border-border/60">
          {(["week", "month", "year"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                setViewMode(mode);
                if (mode !== "week") {
                  toast.info(`${mode.toUpperCase()} view switch selected`);
                }
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                viewMode === mode
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive 7-Day Matrix Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
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

                  return (
                    <th
                      key={idx}
                      className="p-3 text-center border-l border-border/60"
                    >
                      <div className="text-[11px] uppercase tracking-wider font-semibold">
                        {dayName}
                      </div>
                      <div
                        className={`text-sm font-black ${
                          isWeekend
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-foreground"
                        }`}
                      >
                        {dateNum} {monthName}
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
                            <span className="font-mono">
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
                          {isWorking ? (
                            <button
                              type="button"
                              onClick={() =>
                                setEditingShift({
                                  shift,
                                  staff: member,
                                  dateStr: date.toISOString(),
                                })
                              }
                              className="w-full py-2.5 px-2 bg-[#84CC16]/15 hover:bg-[#84CC16]/25 border border-[#84CC16]/40 rounded-xl text-center transition-all group/btn shadow-xs"
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
                            <button
                              type="button"
                              onClick={() =>
                                setEditingShift({
                                  shift: shift || null,
                                  staff: member,
                                  dateStr: date.toISOString(),
                                })
                              }
                              className="w-full py-2.5 px-2 bg-surface-muted/60 hover:bg-muted border border-dashed border-border/80 rounded-xl text-center transition-all text-muted-foreground/80 hover:text-foreground flex flex-col items-center justify-center gap-0.5"
                            >
                              <span className="text-xs font-semibold">Off</span>
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
                      <div className="text-[11px] text-muted-foreground font-semibold">
                        £{Math.round(memberTotalHours * hourlyRate)}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {/* Coverage Row */}
              <tr className="bg-surface-muted/80 border-t-2 border-border font-bold">
                <td className="p-3 pl-6 text-xs text-foreground uppercase tracking-wider">
                  Daily Staff Coverage
                </td>
                {weekDays.map((date, idx) => {
                  const dateKey = date.toISOString().split("T")[0];
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

      {/* Footer Controls & Summary Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPI 1: Scheduled Paid Hours */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground">
              Scheduled Paid Hours
            </span>
            <p className="text-2xl font-black text-foreground">
              {totalHours} <span className="text-sm font-normal">hours</span>
            </p>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: Estimated Rota Cost */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground">
              Estimated Rota Cost
            </span>
            <p className="text-2xl font-black text-[#65A30D]">
              £{totalCost.toLocaleString()}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#84CC16]/10 text-[#65A30D]">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: Unfilled Shifts */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground">
              Unfilled Shifts
            </span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              0 <span className="text-xs font-normal">Fully covered</span>
            </p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Check className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Workflow Progress Guide Banner */}
      <div className="bg-surface border border-border/80 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#84CC16]/20 flex items-center justify-center text-[#65A30D] shrink-0 font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-foreground">
              Workforce Lifecycle Flow
            </p>
            <p className="text-muted-foreground">
              Plan shifts here, publish to staff mobile tap app, track NFC
              attendance, and resolve wages.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground flex-wrap">
          <span className="px-2.5 py-1 bg-surface-muted rounded-lg text-foreground border border-border">
            1. Plan shifts
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="px-2.5 py-1 bg-surface-muted rounded-lg text-foreground border border-border">
            2. Publish rota
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="px-2.5 py-1 bg-surface-muted rounded-lg text-foreground border border-border">
            3. NFC Attendance
          </span>
          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="px-2.5 py-1 bg-[#84CC16]/15 text-[#65A30D] rounded-lg border border-[#84CC16]/30">
            4. Approve wages
          </span>
        </div>
      </div>

      {/* Shift Edit Modal */}
      {editingShift && (
        <ShiftEditModal
          isOpen={Boolean(editingShift)}
          onClose={() => setEditingShift(null)}
          shift={editingShift.shift}
          staff={editingShift.staff}
          dateStr={editingShift.dateStr}
          onSave={handleSaveShift}
        />
      )}
    </div>
  );
};
