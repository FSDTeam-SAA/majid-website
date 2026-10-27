"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  getStaffLeaveBalanceApi,
  getLeaveRequestsApi,
  decideLeaveRequestApi,
  ILeaveRequestItem,
  IStaffLeaveBalance,
} from "../api/attendance-leave.api";

interface StaffLeaveManagementProps {
  staffId: string;
}

export const StaffLeaveManagement: React.FC<StaffLeaveManagementProps> = ({
  staffId,
}) => {
  const queryClient = useQueryClient();

  const { data: balance } = useQuery<IStaffLeaveBalance>({
    queryKey: ["staff", "leave-balance", staffId],
    queryFn: () => getStaffLeaveBalanceApi(staffId),
    enabled: Boolean(staffId),
  });

  const { data: requests = [] } = useQuery<ILeaveRequestItem[]>({
    queryKey: ["staff", "leave-requests", staffId],
    queryFn: () => getLeaveRequestsApi({ staffId }),
    enabled: Boolean(staffId),
  });

  const decideMutation = useMutation({
    mutationFn: ({
      requestId,
      status,
    }: {
      requestId: string;
      status: "approved" | "rejected";
    }) => decideLeaveRequestApi(requestId, { status }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["staff", "leave-requests", staffId],
      });
      queryClient.invalidateQueries({
        queryKey: ["staff", "leave-balance", staffId],
      });
      toast.success(`Leave request ${vars.status} successfully`);
    },
    onError: () => {
      toast.error("Failed to update leave decision");
    },
  });

  const b = balance || {
    allowanceHours: 0,
    usedHours: 0,
    bookedHours: 0,
    remainingHours: 0,
  };

  return (
    <div className="space-y-6">
      {/* 4 Stat Badges (Allowance, Used, Booked, Remaining) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Allowance */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground">
            Yearly Allowance
          </span>
          <p className="text-2xl font-black text-foreground mt-1">
            {b.allowanceHours}{" "}
            <span className="text-xs font-normal">hours</span>
          </p>
          <span className="text-[11px] text-muted-foreground">
            20 days (8h/day)
          </span>
        </div>

        {/* Used */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground">
            Taken / Used
          </span>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
            {b.usedHours} <span className="text-xs font-normal">hours</span>
          </p>
          <span className="text-[11px] text-muted-foreground">
            Already taken
          </span>
        </div>

        {/* Booked */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground">
            Booked / Upcoming
          </span>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {b.bookedHours} <span className="text-xs font-normal">hours</span>
          </p>
          <span className="text-[11px] text-muted-foreground">
            Upcoming approved
          </span>
        </div>

        {/* Remaining */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-xs relative overflow-hidden">
          <span className="text-xs font-semibold text-muted-foreground">
            Remaining Balance
          </span>
          <p className="text-2xl font-black text-[#65A30D] mt-1">
            {b.remainingHours}{" "}
            <span className="text-xs font-normal">hours</span>
          </p>
          <span className="text-[11px] text-[#65A30D] font-semibold">
            Available to book
          </span>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground">
              Leave Requests & History
            </h3>
            <p className="text-xs text-muted-foreground">
              Review and decide pending absence requests submitted by the staff
              member.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-surface-muted/50 font-bold text-muted-foreground">
                <th className="p-4 pl-6">Date</th>
                <th className="p-4">Type</th>
                <th className="p-4 text-center">Duration</th>
                <th className="p-4">Staff Note</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 pr-6 text-right">Manager Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {requests.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-8 text-center text-muted-foreground"
                  >
                    No leave requests found for this staff member.
                  </td>
                </tr>
              ) : (
                requests.map((req) => {
                  const isPending = req.status === "pending";
                  const isApproved = req.status === "approved";

                  return (
                    <tr
                      key={req._id}
                      className="hover:bg-surface/60 transition-colors"
                    >
                      <td className="p-4 pl-6 font-bold text-foreground">
                        {req.formattedDate}
                      </td>
                      <td className="p-4 capitalize font-semibold text-foreground">
                        {req.leaveType} leave
                      </td>
                      <td className="p-4 text-center font-bold text-foreground">
                        {req.durationHours} hours
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {req.note || "No note provided"}
                      </td>
                      <td className="p-4 text-center">
                        <Badge
                          variant="outline"
                          className={
                            isApproved
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs font-bold"
                              : isPending
                                ? "bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs font-bold"
                                : "bg-red-500/10 text-red-600 border-red-500/30 text-xs font-bold"
                          }
                        >
                          {req.status}
                        </Badge>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              type="button"
                              onClick={() =>
                                decideMutation.mutate({
                                  requestId: req._id,
                                  status: "approved",
                                })
                              }
                              disabled={decideMutation.isPending}
                              className="bg-[#84CC16] hover:bg-[#74b513] text-white text-xs font-bold h-7 px-3 rounded-lg"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              type="button"
                              variant="outline"
                              onClick={() =>
                                decideMutation.mutate({
                                  requestId: req._id,
                                  status: "rejected",
                                })
                              }
                              disabled={decideMutation.isPending}
                              className="text-xs font-semibold h-7 px-3 rounded-lg border-border hover:bg-destructive/10 hover:text-destructive"
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs font-medium text-muted-foreground">
                            Decided
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
