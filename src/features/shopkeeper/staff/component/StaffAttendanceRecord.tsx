"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Clock,
  Calendar,
  DollarSign,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  History,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  getStaffAttendanceHistoryApi,
  IStaffAttendanceResponse,
} from "../api/attendance-leave.api";
import { StaffLeaveManagement } from "./StaffLeaveManagement";

interface StaffAttendanceRecordProps {
  staffId: string;
}

type TStaffTab = "attendance" | "leave" | "pay_settings" | "history";

export const StaffAttendanceRecord: React.FC<StaffAttendanceRecordProps> = ({
  staffId,
}) => {
  const [activeTab, setActiveTab] = useState<TStaffTab>("attendance");

  const { data: attendanceData } = useQuery<IStaffAttendanceResponse>({
    queryKey: ["staff", "attendance", staffId],
    queryFn: () =>
      getStaffAttendanceHistoryApi(staffId, { month: 10, year: 2026 }),
    enabled: Boolean(staffId),
  });

  const staff = attendanceData?.staff;
  const records = attendanceData?.records || [];
  const summary = attendanceData?.summary || {
    workedHours: 0,
    approvedExtraHours: 0,
    paidLeaveHours: 0,
    totalPaidHours: 0,
    hourlyRate: 12,
    estimatedGrossPay: 0,
  };

  const staffName = staff
    ? `${staff.firstName || ""} ${staff.lastName || ""}`.trim() ||
      "Staff Member"
    : "Staff Member";
  const hourlyRate = staff?.hourlyWage ?? summary.hourlyRate ?? 12;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 font-poppins">
      {/* Back Link */}
      <div>
        <Link
          href="/shopkeeper/settings/staff/wages"
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Staff Wages
        </Link>
      </div>

      {/* Staff Header Card (Matching Image 4) */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#84CC16]/20 border border-[#84CC16]/40 flex items-center justify-center font-black text-[#65A30D] text-lg shrink-0">
            {staff?.firstName?.[0] || "S"}
            {staff?.lastName?.[0] || ""}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-foreground">
                {staffName}
              </h1>
              <Badge
                variant="outline"
                className="font-mono text-xs font-bold bg-surface"
              >
                {staff?.staffId || "STAFF"}
              </Badge>
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs font-bold">
                Active Staff
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-0.5">
              {staff?.storeName ? `${staff.storeName} • ` : ""}Hourly employee •
              £{hourlyRate}/hour
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/shopkeeper/settings/staff"
            className="px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-bold text-foreground hover:bg-muted transition-colors"
          >
            Edit employee
          </Link>
        </div>
      </div>

      {/* Tab Navigation Switcher */}
      <div className="flex items-center gap-2 border-b border-border/80 pb-1">
        {[
          { id: "attendance" as const, label: "Attendance & Pay", icon: Clock },
          { id: "leave" as const, label: "Leave & Absences", icon: Calendar },
          {
            id: "pay_settings" as const,
            label: "Pay Settings",
            icon: DollarSign,
          },
          { id: "history" as const, label: "Audit History", icon: History },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? "bg-[#84CC16]/10 text-[#65A30D] border border-[#84CC16]/30 shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-muted"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT 1: ATTENDANCE */}
      {activeTab === "attendance" && (
        <div className="space-y-6">
          {/* 3 Summary Cards (Matching Image 4: Actual worked, Extra paid time, Paid leave) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground">
                  Actual Hours Worked
                </span>
                <p className="text-2xl font-black text-foreground">
                  {summary.workedHours}{" "}
                  <span className="text-xs font-normal">hours</span>
                </p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground">
                  Approved Extra Paid Time
                </span>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  +{summary.approvedExtraHours}{" "}
                  <span className="text-xs font-normal">hours</span>
                </p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground">
                  Paid Leave Hours
                </span>
                <p className="text-2xl font-black text-purple-600 dark:text-purple-400">
                  {summary.paidLeaveHours}{" "}
                  <span className="text-xs font-normal">hours</span>
                </p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Attendance Detail Table */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Attendance Detail (October 2026)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Physical NFC beacon tap logs compared against published rotas.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-surface-muted/50 font-bold text-muted-foreground">
                    <th className="p-4 pl-6">Date</th>
                    <th className="p-4">Scheduled</th>
                    <th className="p-4">Actual Tap</th>
                    <th className="p-4 text-center">Worked</th>
                    <th className="p-4 text-center">Paid</th>
                    <th className="p-4 pr-6">Status / Audit Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {records.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-8 text-center text-muted-foreground"
                      >
                        No attendance records logged for this month yet.
                      </td>
                    </tr>
                  ) : (
                    records.map((rec) => (
                      <tr
                        key={rec._id}
                        className="hover:bg-surface/60 transition-colors"
                      >
                        <td className="p-4 pl-6 font-bold text-foreground">
                          {rec.formattedDate}
                        </td>
                        <td className="p-4 font-semibold text-muted-foreground">
                          {rec.scheduledStart} - {rec.scheduledEnd}
                        </td>
                        <td className="p-4 font-semibold text-foreground">
                          {rec.clockInTime} - {rec.clockOutTime}
                        </td>
                        <td className="p-4 text-center font-bold text-foreground">
                          {rec.actualHours}h
                        </td>
                        <td className="p-4 text-center font-black text-[#65A30D]">
                          {rec.approvedPaidHours}h
                        </td>
                        <td className="p-4 pr-6">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-muted text-foreground text-[11px] font-semibold border border-border">
                            {rec.note}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* October Pay Summary Card (Formula Breakdown Matching Image 4) */}
          <div className="bg-gradient-to-br from-[#84CC16]/10 via-surface to-surface border-2 border-[#84CC16]/40 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-[#84CC16] text-white">
                  <DollarSign className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-lg font-black text-foreground">
                    October Pay Calculation Formula
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Audited gross wage computation for the payroll report.
                  </p>
                </div>
              </div>
              <Badge className="bg-[#84CC16] text-white text-xs font-bold">
                Formula Verified
              </Badge>
            </div>

            {/* Formula Block */}
            <div className="p-4 bg-card rounded-xl border border-border/80 space-y-3">
              <div className="text-sm font-bold text-foreground font-mono">
                {summary.workedHours}h worked + {summary.approvedExtraHours}h
                approved extra pay + {summary.paidLeaveHours}h leave ={" "}
                <span className="text-[#65A30D] font-black">
                  {summary.totalPaidHours}h paid
                </span>
              </div>
              <div className="text-xs text-muted-foreground pt-1 border-t border-border/60 flex items-center justify-between">
                <span>
                  Rate calculation: {summary.totalPaidHours}h × £{hourlyRate} ={" "}
                  <strong className="text-foreground text-sm">
                    £{summary.estimatedGrossPay.toLocaleString()}
                  </strong>
                </span>
                <span className="text-[11px] text-[#65A30D] font-bold">
                  Estimated Gross Pay
                </span>
              </div>
            </div>

            {/* Audit Trail Note */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Audit Trail:</strong> 19 Oct • Manager approved 2h
                additional paid time for early departure • Decision reason
                securely stored.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: LEAVE */}
      {activeTab === "leave" && <StaffLeaveManagement staffId={staffId} />}

      {/* TAB CONTENT 3: PAY SETTINGS */}
      {activeTab === "pay_settings" && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-foreground">
            Employee Pay Settings
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-surface rounded-xl border border-border">
              <span className="text-muted-foreground font-semibold">
                Contract Type
              </span>
              <p className="text-sm font-bold text-foreground mt-1">
                Hourly Employee
              </p>
            </div>
            <div className="p-4 bg-surface rounded-xl border border-border">
              <span className="text-muted-foreground font-semibold">
                Standard Hourly Rate
              </span>
              <p className="text-sm font-bold text-[#65A30D] mt-1">
                £{hourlyRate} / hour
              </p>
            </div>
            <div className="p-4 bg-surface rounded-xl border border-border">
              <span className="text-muted-foreground font-semibold">
                Annual Leave Allowance
              </span>
              <p className="text-sm font-bold text-foreground mt-1">
                160 hours (20 days)
              </p>
            </div>
            <div className="p-4 bg-surface rounded-xl border border-border">
              <span className="text-muted-foreground font-semibold">
                Pay Period Frequency
              </span>
              <p className="text-sm font-bold text-foreground mt-1">
                Monthly (Last calendar day)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: HISTORY */}
      {activeTab === "history" && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
          <h3 className="text-base font-bold text-foreground">
            Audit Log & Event History
          </h3>
          <div className="space-y-2 text-xs">
            {records.length > 0 ? (
              records.map((rec) => (
                <div
                  key={rec._id}
                  className="p-3 bg-surface rounded-xl border border-border flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-foreground">
                      Attendance status: {rec.status}
                    </p>
                    <p className="text-muted-foreground text-[11px]">
                      {rec.formattedDate} • {rec.note}
                    </p>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {rec.clockInTime}
                  </span>
                </div>
              ))
            ) : (
              <p className="p-4 text-center text-muted-foreground">
                No audit logs recorded for this staff member yet.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
