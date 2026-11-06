"use client";

import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Wrench,
  CheckCircle2,
  TrendingUp,
  Search,
  SlidersHorizontal,
  Plus,
  Smartphone,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { useState, useMemo } from "react";

import { Button } from "@/components/ui/button";
import { RepairRequestFormModal } from "@/features/customer/repairRequest/component/RepairRequestFormModal";
import { useGetMyRepairRequests } from "@/features/customer/repairRequest/hooks/useRepairRequest";
import { RepairRequest } from "@/features/customer/repairRequest/types/repair-request.types";

const getStatusBadge = (status: string) => {
  const norm = (status || "").toLowerCase().replace(/_/g, "-");
  switch (norm) {
    case "completed":
    case "collected":
      return {
        label: "Completed",
        dot: "bg-emerald-500",
        badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800",
      };
    case "waiting-parts":
    case "waiting-for-parts":
      return {
        label: "Waiting Parts",
        dot: "bg-purple-500",
        badge: "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400 border border-purple-200 dark:border-purple-800",
      };
    case "repairing":
    case "start-work":
      return {
        label: "Repairing",
        dot: "bg-blue-500",
        badge: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200 dark:border-blue-800",
      };
    case "ready-for-collection":
      return {
        label: "Ready for Collection",
        dot: "bg-teal-500",
        badge: "bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-400 border border-teal-200 dark:border-teal-800",
      };
    case "rejected":
    case "quote-rejected":
    case "unable-to-repair":
      return {
        label: "Rejected",
        dot: "bg-red-500",
        badge: "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-800",
      };
    case "quote-accepted":
    case "approved":
    case "inprogress":
    case "in-progress":
    case "submitted":
    default:
      return {
        label: "In Progress",
        dot: "bg-amber-500",
        badge: "bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800",
      };
  }
};

const PAGE_SIZE = 12;

export default function RepairRequestsTable() {
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"all" | "in_progress" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: myRepairRequestsData, isLoading, refetch } = useGetMyRepairRequests(
    page,
    PAGE_SIZE,
  );

  const repairRequests: RepairRequest[] = myRepairRequestsData?.data || [];
  const totalPages = Math.max(myRepairRequestsData?.meta?.totalPage || 1, 1);

  // Compute live stats
  const inProgressCount = useMemo(() => {
    return repairRequests.filter((r) => {
      const s = (r.status || "").toLowerCase();
      return !["completed", "collected", "rejected", "unable-to-repair"].includes(s);
    }).length;
  }, [repairRequests]);

  const completedCount = useMemo(() => {
    return repairRequests.filter((r) => {
      const s = (r.status || "").toLowerCase();
      return s === "completed" || s === "collected";
    }).length;
  }, [repairRequests]);

  const totalSales = useMemo(() => {
    return repairRequests.reduce((sum, r) => {
      const price = r.totalEstimatedPrice || r.quotedPrice || (r as any).cost || 0;
      return sum + Number(price || 0);
    }, 0);
  }, [repairRequests]);

  // Client search and tab filtering
  const filteredRequests = useMemo(() => {
    return repairRequests.filter((req) => {
      // Tab filter
      const s = (req.status || "").toLowerCase();
      const isCompleted = s === "completed" || s === "collected";
      if (activeTab === "completed" && !isCompleted) return false;
      if (activeTab === "in_progress" && isCompleted) return false;

      // Search filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const orderNum = (req.orderNumber || "").toLowerCase();
      const customer = (req.firstName || "").toLowerCase();
      const phone = (req.phone || "").toLowerCase();
      const model = (req.modelName || req.deviceModel || "").toLowerCase();
      const code = (req.modelCode || "").toLowerCase();
      const statusText = (req.status || "").toLowerCase();

      return (
        orderNum.includes(q) ||
        customer.includes(q) ||
        phone.includes(q) ||
        model.includes(q) ||
        code.includes(q) ||
        statusText.includes(q)
      );
    });
  }, [repairRequests, activeTab, searchQuery]);

  return (
    <div className="dashboard-page max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">
            Repair Requests
          </h1>
          <p className="text-sm text-muted-foreground font-medium mt-1">
            Manage device repairs, diagnostics, parts and customer status updates
          </p>
        </div>
      </div>

      {/* 3 Modern Stats Cards matching Screenshot 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* In Progress */}
        <div className="bg-card border border-border rounded-[28px] p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-3xl font-black text-foreground tabular-nums">
              {inProgressCount}
            </p>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">
              In Progress
            </p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center p-3 text-blue-600">
            <Wrench className="w-6 h-6" />
          </div>
        </div>

        {/* Completed */}
        <div className="bg-card border border-border rounded-[28px] p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-3xl font-black text-foreground tabular-nums">
              {completedCount}
            </p>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">
              Completed
            </p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center p-3 text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Total Sales */}
        <div className="bg-card border border-border rounded-[28px] p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-3xl font-black text-foreground tabular-nums">
              £{totalSales.toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">
              Total Sales
            </p>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center p-3 text-[#10B981]">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* CTA Button matching Screenshot 3: + Create Repair Request */}
      <div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full py-4 px-6 rounded-2xl bg-[#10B981] hover:bg-[#059669] text-white font-black text-base flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all active:scale-[0.99]"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>Create Repair Request</span>
        </button>
      </div>

      {/* Wizard Dialog Modal */}
      <RepairRequestFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          refetch();
        }}
      />

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-full text-xs font-black transition-all ${
              activeTab === "all"
                ? "bg-emerald-100 dark:bg-emerald-950/60 text-[#10B981] border border-[#10B981]/30 shadow-xs"
                : "bg-surface border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({repairRequests.length})
          </button>
          <button
            onClick={() => setActiveTab("in_progress")}
            className={`px-4 py-2 rounded-full text-xs font-black transition-all ${
              activeTab === "in_progress"
                ? "bg-emerald-100 dark:bg-emerald-950/60 text-[#10B981] border border-[#10B981]/30 shadow-xs"
                : "bg-surface border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            In Progress ({inProgressCount})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-4 py-2 rounded-full text-xs font-black transition-all ${
              activeTab === "completed"
                ? "bg-emerald-100 dark:bg-emerald-950/60 text-[#10B981] border border-[#10B981]/30 shadow-xs"
                : "bg-surface border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>

        {/* Search Bar with filter icon */}
        <div className="flex items-center gap-2 flex-1 md:max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer, device, or status"
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-surface border border-border text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#10B981]"
            />
          </div>
          <button
            type="button"
            className="p-2.5 rounded-2xl bg-surface border border-border text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
            title="Filter options"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Repairs Table */}
      <div className="rounded-[32px] border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="border-b border-border bg-surface/50 text-[11px] font-black uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-4">Customer & Order</th>
                <th className="px-6 py-4">Device</th>
                <th className="px-6 py-4">Repair Issues</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#10B981]" />
                    <p className="text-xs text-muted-foreground mt-2 font-medium">Loading repair requests...</p>
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <Smartphone className="mx-auto h-10 w-10 text-muted-foreground/40 mb-2" />
                    <p className="text-muted-foreground font-bold text-base">
                      No repair requests found.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {searchQuery
                        ? "Try adjusting your search query or filters"
                        : "Click 'Create Repair Request' above to book the first repair."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request: RepairRequest) => {
                  const customerName = request.firstName || "Unknown Customer";
                  const orderNum = request.orderNumber || `#R-${request._id.slice(-5).toUpperCase()}`;
                  const deviceTitle = request.modelName || request.deviceModel || "Mobile Phone";
                  const statusInfo = getStatusBadge(request.status);
                  const price = request.totalEstimatedPrice || request.quotedPrice || (request as any).cost || 0;
                  
                  // Primary issue or summary
                  const primaryIssue = request.issues?.[0];
                  const issueName = primaryIssue?.category || request.description || "General Repair";
                  const estTime = primaryIssue?.estimatedTime || "1–2 Hours";

                  return (
                    <tr
                      key={request._id}
                      className="group transition-colors hover:bg-surface/60"
                    >
                      {/* Customer & Order */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-2.5 h-2.5 rounded-full ${statusInfo.dot} shrink-0`} />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-foreground text-sm">
                                {customerName}
                              </span>
                              <span className="font-mono text-[11px] font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-md">
                                {orderNum}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {request.createdAt
                                ? format(new Date(request.createdAt), "MMM dd, yyyy • HH:mm")
                                : "Recently"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Device */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-surface border border-border flex items-center justify-center shrink-0 text-muted-foreground">
                            <Smartphone className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-sm">
                              {deviceTitle}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {request.brand ? `${request.brand} ` : ""}
                              {request.modelCode ? `• ${request.modelCode}` : ""}
                              {request.releaseYear ? ` • ${request.releaseYear}` : ""}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Repair Issues */}
                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-surface border border-border text-xs font-bold text-foreground">
                            {issueName}
                          </span>
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>Est. {estTime}</span>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-5 font-black text-foreground text-sm tabular-nums">
                        £{Number(price).toFixed(2)}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black ${statusInfo.badge}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-5 text-right">
                        <Link
                          href={`/shopkeeper/repair-requests/${request._id}`}
                          className="inline-flex h-9 items-center justify-center gap-1 rounded-full border border-border bg-surface px-4 text-xs font-black text-foreground hover:border-[#10B981] hover:text-[#10B981] transition-all active:scale-[0.98]"
                        >
                          <span>View Report</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {myRepairRequestsData?.meta && (
          <div className="flex flex-col gap-3 border-t border-border bg-surface/30 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-medium text-muted-foreground">
              Showing page {page} of {totalPages} · {myRepairRequestsData.meta.total || repairRequests.length} total requests
            </p>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                disabled={page === 1 || isLoading}
                className="rounded-xl h-8 text-xs font-bold"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
                disabled={page === totalPages || isLoading}
                className="rounded-xl h-8 text-xs font-bold"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
