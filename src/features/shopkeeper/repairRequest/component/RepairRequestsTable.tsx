"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Package,
  Clock,
  Wrench,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { RepairRequestFormModal } from "@/features/customer/repairRequest/component/RepairRequestFormModal";

import { useGetMyRepairRequests } from "@/features/customer/repairRequest/hooks/useRepairRequest";

import { RepairRequest } from "@/features/customer/repairRequest/types/repair-request.types";

const getStatusStyles = (status: string) => {
  switch (status) {
    case "submitted":
    case "request_submitted":
      return "bg-[#FEF9C3] text-[#CA8A04]";

    case "in_review":
    case "reviewing":
      return "bg-[#F1F5F9] text-[#64748B]";

    case "quote_sent":
      return "bg-[#FEF3C7] text-[#D97706]";

    case "quote_accepted":
    case "approved":
    case "in_progress":
    case "repair_in_progress":
      return "bg-[#DBEAFE] text-[#2563EB]";

    case "repairing":
      return "bg-[#F3E8FF] text-[#9333EA]";

    case "completed":
      return "bg-[#DCFCE7] text-[#16A34A]";

    case "rejected":
    case "quote_rejected":
      return "bg-[#FEE2E2] text-[#DC2626]";

    default:
      return "bg-gray-100 text-gray-600";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "submitted":
    case "request_submitted":
      return "Pending";

    case "in_review":
      return "Reviewing";

    case "repair_in_progress":
    case "in_progress":
      return "In Progress";

    case "repairing":
      return "Repairing";

    case "completed":
      return "Completed";

    case "approved":
      return "Approved";

    case "rejected":
      return "Rejected";

    default:
      return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }
};

const PAGE_SIZE = 10;

export default function RepairRequestsTable() {
  const [page, setPage] = useState(1);
  const { data: myRepairRequestsData, isLoading } = useGetMyRepairRequests(
    page,
    PAGE_SIZE,
  );

  const repairRequests = myRepairRequestsData?.data || [];
  const totalPages = Math.max(myRepairRequestsData?.meta?.totalPage || 1, 1);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const stats = [
    {
      label: "Total Requests",
      value: myRepairRequestsData?.meta?.total || repairRequests.length,
      icon: <Package className="text-[#16A34A] dark:text-yellow-500" />,
      bg: "bg-[#DCFCE7]/40",
    },
    {
      label: "Pending",
      value: repairRequests.filter((r) =>
        ["submitted", "request_submitted", "in_review"].includes(r.status),
      ).length,
      icon: <Clock className="text-[#CA8A04]" />,
      bg: "bg-[#FEF9C3]/40",
    },
    {
      label: "In Progress",
      value: repairRequests.filter((r) =>
        ["quote_accepted", "repair_in_progress", "repairing"].includes(
          r.status,
        ),
      ).length,
      icon: <Wrench className="text-[#9333EA]" />,
      bg: "bg-[#F3E8FF]/40",
    },
    {
      label: "Completed",
      value: repairRequests.filter((r) => r.status === "completed").length,
      icon: <CheckCircle2 className="text-[#2563EB] dark:text-green-500" />,
      bg: "bg-[#DBEAFE]/40",
    },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="text-3xl font-black text-foreground tracking-tight">
            Repair Requests
          </h1>

          <Button onClick={() => setIsModalOpen(true)}>
            Create Repair Request
          </Button>

          <RepairRequestFormModal
            shopkeeper={null}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            createCustomerOnSubmit
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-card border border-border rounded-[28px] p-6 shadow-sm flex flex-col gap-4"
            >
              <div
                className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center`}
              >
                {stat.icon}
              </div>

              <div>
                <p className="text-[28px] font-black text-foreground leading-none mb-1">
                  {stat.value}
                </p>

                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Table Section */}
        <div className="rounded-[32px] border border-border bg-card overflow-hidden shadow-sm">
          <div className="mobile-scroll">
            <table className="responsive-table text-sm">
              <thead className="border-b border-border bg-surface text-xs font-black uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-8 py-6">Customer Name</th>
                  <th className="px-8 py-6">Device</th>
                  <th className="px-8 py-6">Issue Summary</th>
                  <th className="px-8 py-6">Date</th>
                  <th className="px-8 py-6">Status</th>
                  <th className="px-8 py-6 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-16 text-center">
                      <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
                    </td>
                  </tr>
                ) : repairRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-16 text-center">
                      <p className="text-muted-foreground font-bold text-lg">
                        No repair requests found.
                      </p>
                    </td>
                  </tr>
                ) : (
                  repairRequests.map((request: RepairRequest) => {
                    const customerName =
                      request.firstName || "Unknown Customer";

                    return (
                      <tr
                        key={request._id}
                        className="group transition-colors hover:bg-surface/50"
                      >
                        <td className="px-8 py-6 font-bold text-foreground">
                          {customerName}
                        </td>

                        <td className="px-8 py-6 font-bold text-foreground">
                          {request.deviceModel}
                        </td>

                        <td className="px-8 py-6 font-medium text-muted-foreground max-w-[240px] truncate">
                          {request.description}
                        </td>

                        <td className="px-8 py-6 font-bold text-muted-foreground">
                          {format(new Date(request.createdAt), "MMM dd, yyyy")}
                        </td>

                        <td className="px-8 py-6">
                          <span
                            className={`inline-flex items-center rounded-full px-4 py-1.5 text-xs font-black tracking-wide ${getStatusStyles(
                              request.status,
                            )}`}
                          >
                            {getStatusLabel(request.status)}
                          </span>
                        </td>

                        <td className="px-8 py-6 text-right">
                          <Link
                            href={`/shopkeeper/repair-requests/${request._id}`}
                            className="inline-flex h-11 items-center justify-center rounded-full border-2 border-primary bg-transparent px-6 text-xs font-black text-primary transition-all hover:bg-primary/5 active:scale-[0.98] shadow-sm hover:shadow-md"
                          >
                            View Report
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {myRepairRequestsData?.meta && (
            <div className="flex flex-col gap-3 border-t border-border bg-surface/40 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                Page {page} of {totalPages} · {myRepairRequestsData.meta.total}{" "}
                total requests
              </p>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((currentPage) => currentPage - 1)}
                  disabled={page === 1 || isLoading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((currentPage) => currentPage + 1)}
                  disabled={page === totalPages || isLoading}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
