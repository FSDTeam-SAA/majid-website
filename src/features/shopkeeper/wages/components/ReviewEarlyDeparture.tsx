"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Info,
  FileText,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useExceptionDetail, useResolveException } from "../hooks/useWages";

interface ReviewEarlyDepartureProps {
  exceptionId: string;
}

type TDecisionType =
  "pay_actual" | "pay_scheduled" | "use_leave" | "unpaid_leave";

export const ReviewEarlyDeparture: React.FC<ReviewEarlyDepartureProps> = ({
  exceptionId,
}) => {
  const router = useRouter();
  const { data: detailData } = useExceptionDetail(exceptionId);
  const resolveMutation = useResolveException(exceptionId);

  const [selectedDecision, setSelectedDecision] =
    useState<TDecisionType>("pay_scheduled");
  const [managerReason, setManagerReason] = useState<string>(
    "Staff member had an authorized appointment; paid full scheduled shift.",
  );

  const exception = detailData?.exception;
  const metrics = detailData?.metrics || {
    scheduled: "09:00 - 17:00",
    actual: "09:00 - 15:00",
    scheduledHours: 8,
    actualHours: 6,
    leftEarlyHours: 2,
  };
  const hourlyRate = detailData?.hourlyRate || 12;
  const options = detailData?.options;
  const history = detailData?.decisionHistory || [];

  const currentOption = options ? options[selectedDecision] : null;

  const handleApprove = () => {
    resolveMutation.mutate(
      {
        decision: selectedDecision,
        managerReason,
      },
      {
        onSuccess: () => {
          setTimeout(() => {
            router.push("/shopkeeper/wages");
          }, 800);
        },
      },
    );
  };

  const staffName = `${exception?.staffId?.firstName || "Ahmed"} ${
    exception?.staffId?.lastName || "Khan"
  }`;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 font-poppins">
      {/* Back Link */}
      <div>
        <Link
          href="/shopkeeper/wages"
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Staff Wages Dashboard
        </Link>
      </div>

      {/* Worker Banner (Matching Image 3) */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-[#84CC16]/20 border border-[#84CC16]/40 flex items-center justify-center font-black text-[#65A30D] text-base">
              {exception?.staffId?.firstName?.[0] || "A"}
              {exception?.staffId?.lastName?.[0] || "K"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-foreground">
                  {staffName}
                </h1>
                <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 text-xs font-bold gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Decision required
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground font-medium">
                {exception?.shopId?.shopName || "Romford Store"} • 19 October
                2026
              </p>
            </div>
          </div>

          <div className="text-xs font-semibold text-muted-foreground sm:text-right">
            <span>Hourly rate £{hourlyRate}</span> •{" "}
            <span>No unpaid breaks</span>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-border/60">
          <div className="p-3 bg-surface rounded-xl border border-border/80">
            <span className="text-[11px] font-semibold text-muted-foreground">
              Scheduled Shift
            </span>
            <p className="text-sm font-black text-foreground">
              {metrics.scheduled} ({metrics.scheduledHours}h)
            </p>
          </div>
          <div className="p-3 bg-surface rounded-xl border border-border/80">
            <span className="text-[11px] font-semibold text-muted-foreground">
              Actual Tap Time
            </span>
            <p className="text-sm font-black text-foreground">
              {metrics.actual} ({metrics.actualHours}h)
            </p>
          </div>
          <div className="p-3 bg-surface rounded-xl border border-border/80">
            <span className="text-[11px] font-semibold text-muted-foreground">
              Hours Worked
            </span>
            <p className="text-sm font-black text-blue-600 dark:text-blue-400">
              {metrics.actualHours} hours
            </p>
          </div>
          <div className="p-3 bg-surface rounded-xl border border-border/80">
            <span className="text-[11px] font-semibold text-amber-600">
              Left Early
            </span>
            <p className="text-sm font-black text-amber-600 flex items-center gap-1">
              ← {metrics.leftEarlyHours} hours
            </p>
          </div>
        </div>
      </div>

      {/* Main 2 Columns: Decision Radios (Left) vs Pay Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Radio Options (7 cols) */}
        <div className="lg:col-span-7 bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-foreground">
              How should this shift be paid?
            </h2>
            <p className="text-xs text-muted-foreground">
              Select an option below. Shift pay calculation and audit log will
              adjust accordingly.
            </p>
          </div>

          <div className="space-y-3">
            {/* Option 1: Pay actual hours */}
            <label
              onClick={() => setSelectedDecision("pay_actual")}
              className={`p-4 rounded-xl border flex items-start gap-3.5 cursor-pointer transition-all ${
                selectedDecision === "pay_actual"
                  ? "bg-[#84CC16]/10 border-[#84CC16] shadow-xs"
                  : "bg-surface-muted/60 border-border hover:bg-surface-muted"
              }`}
            >
              <input
                type="radio"
                name="decisionOption"
                checked={selectedDecision === "pay_actual"}
                onChange={() => setSelectedDecision("pay_actual")}
                className="mt-1 text-[#84CC16] focus:ring-[#84CC16]"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-black text-foreground">
                    Pay actual hours
                  </p>
                  <span className="text-xs font-black text-foreground">
                    £{metrics.actualHours * hourlyRate}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {metrics.actualHours} paid hours • No extra compensation
                </p>
              </div>
            </label>

            {/* Option 2: Pay full scheduled shift (Recommended) */}
            <label
              onClick={() => setSelectedDecision("pay_scheduled")}
              className={`p-4 rounded-xl border flex items-start gap-3.5 cursor-pointer transition-all ${
                selectedDecision === "pay_scheduled"
                  ? "bg-[#84CC16]/10 border-[#84CC16] shadow-xs"
                  : "bg-surface-muted/60 border-border hover:bg-surface-muted"
              }`}
            >
              <input
                type="radio"
                name="decisionOption"
                checked={selectedDecision === "pay_scheduled"}
                onChange={() => setSelectedDecision("pay_scheduled")}
                className="mt-1 text-[#84CC16] focus:ring-[#84CC16]"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-black text-foreground">
                      Pay full scheduled shift
                    </p>
                    <Badge className="bg-[#84CC16] text-white text-[10px] font-bold">
                      Recommended
                    </Badge>
                  </div>
                  <span className="text-xs font-black text-[#65A30D]">
                    £{metrics.scheduledHours * hourlyRate}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {metrics.scheduledHours} paid hours • Covers{" "}
                  {metrics.leftEarlyHours}h early departure as paid time
                </p>
              </div>
            </label>

            {/* Option 3: Use paid leave for remaining time */}
            <label
              onClick={() => setSelectedDecision("use_leave")}
              className={`p-4 rounded-xl border flex items-start gap-3.5 cursor-pointer transition-all ${
                selectedDecision === "use_leave"
                  ? "bg-[#84CC16]/10 border-[#84CC16] shadow-xs"
                  : "bg-surface-muted/60 border-border hover:bg-surface-muted"
              }`}
            >
              <input
                type="radio"
                name="decisionOption"
                checked={selectedDecision === "use_leave"}
                onChange={() => setSelectedDecision("use_leave")}
                className="mt-1 text-[#84CC16] focus:ring-[#84CC16]"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-black text-foreground">
                    Use paid leave for remaining time
                  </p>
                  <span className="text-xs font-black text-foreground">
                    £{metrics.scheduledHours * hourlyRate}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {metrics.actualHours}h worked + {metrics.leftEarlyHours}h paid
                  leave deducted from balance
                </p>
              </div>
            </label>

            {/* Option 4: Approve unpaid leave */}
            <label
              onClick={() => setSelectedDecision("unpaid_leave")}
              className={`p-4 rounded-xl border flex items-start gap-3.5 cursor-pointer transition-all ${
                selectedDecision === "unpaid_leave"
                  ? "bg-[#84CC16]/10 border-[#84CC16] shadow-xs"
                  : "bg-surface-muted/60 border-border hover:bg-surface-muted"
              }`}
            >
              <input
                type="radio"
                name="decisionOption"
                checked={selectedDecision === "unpaid_leave"}
                onChange={() => setSelectedDecision("unpaid_leave")}
                className="mt-1 text-[#84CC16] focus:ring-[#84CC16]"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-black text-foreground">
                    Approve unpaid leave
                  </p>
                  <span className="text-xs font-black text-foreground">
                    £{metrics.actualHours * hourlyRate}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {metrics.actualHours}h worked + {metrics.leftEarlyHours}h
                  authorized unpaid absence
                </p>
              </div>
            </label>
          </div>

          {/* Quick preset reason buttons */}
          <div className="space-y-1.5 pt-2">
            <Label className="text-xs font-semibold text-muted-foreground">
              Quick manager reason templates
            </Label>
            <div className="flex flex-wrap gap-2">
              {[
                "Authorized medical appointment",
                "Sent home early by manager",
                "Family emergency",
                "Shift completed ahead of schedule",
              ].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setManagerReason(preset)}
                  className="px-2.5 py-1 bg-surface rounded-lg border border-border/80 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:border-[#84CC16] transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Pay Preview & Reason Submission (5 cols) */}
        <div className="lg:col-span-5 bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <h2 className="text-base font-bold text-foreground">
              Pay Preview & Confirmation
            </h2>

            {/* Calculations Breakdown */}
            <div className="p-4 bg-[#84CC16]/10 border border-[#84CC16]/20 rounded-xl space-y-2.5">
              <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                <span>Actual hours worked</span>
                <span className="font-bold text-foreground">
                  {metrics.actualHours}h
                </span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                <span>Additional approved time</span>
                <span className="font-bold text-foreground">
                  +{currentOption?.additionalPaidHours || 0}h
                </span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                <span>Approved paid hours</span>
                <span className="font-bold text-foreground">
                  {currentOption?.approvedPaidHours || metrics.scheduledHours}h
                </span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                <span>Leave balance impact</span>
                <span className="font-bold text-foreground">
                  {currentOption?.leaveBalanceChange
                    ? `${currentOption.leaveBalanceChange}h`
                    : "0h"}
                </span>
              </div>

              <div className="pt-2 border-t border-[#84CC16]/30 flex justify-between items-center">
                <span className="text-xs font-bold text-foreground">
                  Estimated shift pay
                </span>
                <div className="text-right">
                  <span className="text-xl font-black text-[#65A30D]">
                    £{currentOption?.estimatedShiftPay || 96}
                  </span>
                  {currentOption?.payDifference ? (
                    <p className="text-[10px] font-bold text-[#65A30D]">
                      £{currentOption.payDifference} above actual calculation
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Manager Reason Textarea */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="managerReason"
                  className="text-xs font-bold text-foreground"
                >
                  Manager Reason
                </Label>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {managerReason.length}/500
                </span>
              </div>
              <Textarea
                id="managerReason"
                rows={3}
                maxLength={500}
                value={managerReason}
                onChange={(e) => setManagerReason(e.target.value)}
                placeholder="Explain the reason for this decision (recorded for audit trail)..."
                className="bg-background border-border text-xs rounded-xl"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <Button
              type="button"
              onClick={handleApprove}
              disabled={resolveMutation.isPending || !managerReason.trim()}
              className="w-full bg-[#84CC16] hover:bg-[#74b513] text-white rounded-xl text-xs font-bold shadow-md shadow-[#84CC16]/20 py-2.5 gap-2"
            >
              {resolveMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              Approve decision
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/shopkeeper/wages")}
              className="w-full rounded-xl text-xs font-semibold border-border"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>

      {/* Footer Callout and Audit Trail History */}
      <div className="bg-surface border border-border/80 rounded-2xl p-5 space-y-4">
        {/* Callout Notice */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Info className="w-4 h-4 text-blue-500 shrink-0" />
          <p>
            <strong className="text-foreground">
              Attendance stays unchanged:
            </strong>{" "}
            Original clock-out remains recorded as 15:00. This pay decision
            approves how the wages engine calculates compensation for the pay
            period without altering the physical tap audit log.
          </p>
        </div>

        {/* History Log */}
        {history.length > 0 && (
          <div className="pt-3 border-t border-border/60">
            <h4 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-muted-foreground" />
              Previous Manager Decisions for {staffName}
            </h4>
            <div className="space-y-2 text-xs">
              {history.map((h) => (
                <div
                  key={h._id}
                  className="p-3 bg-card rounded-xl border border-border/60 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-foreground capitalize">
                      {h.decision.replace("_", " ")}
                    </span>
                    <p className="text-[11px] text-muted-foreground">
                      Reason: &quot;{h.managerReason}&quot;
                    </p>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {h.approvedBy?.firstName} {h.approvedBy?.lastName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
