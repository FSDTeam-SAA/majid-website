"use client";

import React from "react";
import {
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  X,
  CreditCard,
  Calendar,
  Hash,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { useMyPayments } from "../hooks/usePayments";
import { Loader2 } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";

export default function PaymentHistory() {
  const { data: paymentsData, isLoading } = useMyPayments();
  const { formatCurrency } = useCurrency();

  const payments = React.useMemo(() => {
    return (paymentsData?.data || []).map(
      (p: {
        _id: string;
        amount: number;
        status: string;
        paymentStatus: string;
        createdAt: string;
        subscriptionId: string;
        paymentMethod?: string;
        currency?: string;
      }) => ({
        id: `#${p._id.substring(0, 8).toUpperCase()}`,
        amount: formatCurrency(p.amount, p.currency),
        status:
          p.status === "completed" || p.paymentStatus === "paid"
            ? "PAID"
            : "PENDING",
        created: new Date(p.createdAt).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        order: p.subscriptionId ? "Subscription Plan" : "Wallet Top-up",
        method: p.paymentMethod || "myPOS",
        description: "Payment for Majid services",
        raw: p,
      }),
    );
  }, [formatCurrency, paymentsData]);

  const [selectedPayment, setSelectedPayment] = React.useState<
    (typeof payments)[0] | null
  >(null);

  if (isLoading) {
    return (
      <div className="mx-auto flex h-[50vh] max-w-[1600px] items-center justify-center p-4 md:p-10">
        <Loader2 className="w-8 h-8 animate-spin text-[#84CC16]" />
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">
              Payment History
            </h1>
            <p className="mt-1 font-medium text-muted-foreground">
              Track your payment status and invoices.
            </p>
          </div>

          <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
            <div className="group relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#84CC16] transition-colors"
                size={18}
              />
              <input
                type="text"
                placeholder="Search invoices..."
                className="w-full rounded-2xl border border-border bg-card py-3.5 pl-12 pr-6 text-sm font-semibold text-foreground shadow-sm outline-none transition-all placeholder:text-muted-foreground focus:border-[#84CC16] focus:ring-4 focus:ring-[#84CC16]/5 sm:w-[300px]"
              />
            </div>
            <button className="group rounded-2xl border border-border bg-card p-3.5 shadow-sm transition hover:bg-surface">
              <Filter
                size={18}
                className="text-muted-foreground group-hover:text-foreground"
              />
            </button>
          </div>
        </div>

        {/* Table Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-[40px] border border-border shadow-[0_20px_50px_-12px_rgba(0,0,0,0.04)] overflow-hidden"
        >
          <div className="mobile-scroll">
            <table className="responsive-table">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="px-8 py-6 text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.15em]">
                    Transaction ID
                  </th>
                  <th className="px-8 py-6 text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.15em]">
                    Amount
                  </th>
                  <th className="px-8 py-6 text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.15em]">
                    Status
                  </th>
                  <th className="px-8 py-6 text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.15em]">
                    Created
                  </th>
                  <th className="px-8 py-6 text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.15em]">
                    Order
                  </th>
                  <th className="px-8 py-6 text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.15em] text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.map((row: (typeof payments)[number], i: number) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group transition-colors hover:bg-surface/70"
                  >
                    <td className="px-8 py-5">
                      <span className="text-sm font-black text-[#3B82F6] cursor-pointer hover:underline">
                        {row.id}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-black text-foreground">
                        {row.amount}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span
                        className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase shadow-sm ${
                          row.status === "PAID"
                            ? "bg-[#DCFCE7] text-[#166534] ring-1 ring-[#84CC16]/20"
                            : row.status === "PENDING"
                              ? "bg-[#FEF9C3] text-[#854D0E] ring-1 ring-yellow-500/20"
                              : "bg-[#FEE2E2] text-[#991B1B] ring-1 ring-red-500/20"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-muted-foreground">
                      {row.created}
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-muted-foreground">
                      {row.order}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => setSelectedPayment(row)}
                          className="px-5 py-2.5 bg-[#84CC16] text-white text-[11px] font-black rounded-xl hover:bg-[#76b813] hover:scale-105 transition-all shadow-lg shadow-lime-500/20 active:scale-95 flex items-center gap-2 uppercase tracking-widest cursor-pointer"
                        >
                          <Eye size={14} strokeWidth={3} />
                          View
                        </button>
                        <button className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-border bg-card px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-muted-foreground transition-all hover:border-[#84CC16] hover:bg-[#84CC16]/5 hover:text-[#84CC16] active:scale-95">
                          <Download size={14} strokeWidth={3} />
                          Download PDF
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Section */}
          <div className="px-8 py-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface">
            <p className="text-sm font-bold text-muted-foreground">
              Showing{" "}
              <span className="text-foreground font-black">
                1 - {payments.length}
              </span>{" "}
              of{" "}
              <span className="font-black text-foreground">
                {payments.length}
              </span>{" "}
              results
            </p>

            <div className="flex items-center gap-2">
              <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground shadow-sm transition-all hover:border-[#84CC16] hover:text-[#84CC16] active:scale-90 disabled:opacity-50">
                <ChevronLeft size={20} />
              </button>
              <div className="flex items-center gap-1.5 px-1">
                {[1, 2, 3, "...", 6].map((page, i) => (
                  <button
                    key={i}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-black transition-all shadow-sm active:scale-90 ${
                      page === 2
                        ? "bg-[#84CC16] text-white shadow-lg shadow-lime-500/20"
                        : page === "..."
                          ? "bg-transparent text-gray-400 cursor-default shadow-none"
                          : "border border-border bg-card text-muted-foreground hover:border-border hover:text-foreground"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#84CC16]/10 border border-[#84CC16]/20 text-[#84CC16] hover:bg-[#84CC16] hover:text-white transition-all shadow-sm active:scale-90">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Details Modal */}
        <AnimatePresence>
          {selectedPayment && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedPayment(null)}
                className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[32px] border border-border bg-card shadow-2xl sm:rounded-[40px]"
              >
                {/* Modal Header */}
                <div className="p-8 pb-0 flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#84CC16]/10 rounded-2xl flex items-center justify-center text-[#84CC16]">
                      <CreditCard size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-foreground tracking-tight">
                        Transaction Details
                      </h2>
                      <p className="text-[13px] font-bold text-muted-foreground">
                        View full breakdown of your invoice
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPayment(null)}
                    className="rounded-xl p-2.5 text-muted-foreground transition hover:bg-surface hover:text-foreground"
                  >
                    <X size={20} strokeWidth={3} />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-8 space-y-8">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                    <div className="space-y-1.5 rounded-2xl border border-border bg-surface p-4">
                      <div className="flex items-center gap-2 text-[#94A3B8]">
                        <Hash size={14} />
                        <span className="text-[11px] font-black uppercase tracking-wider">
                          Transaction ID
                        </span>
                      </div>
                      <p className="text-[15px] font-black text-foreground">
                        {selectedPayment.id}
                      </p>
                    </div>
                    <div className="space-y-1.5 rounded-2xl border border-border bg-surface p-4">
                      <div className="flex items-center gap-2 text-[#94A3B8]">
                        <Calendar size={14} />
                        <span className="text-[11px] font-black uppercase tracking-wider">
                          Date Created
                        </span>
                      </div>
                      <p className="text-[15px] font-black text-foreground">
                        {selectedPayment.created}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.15em] px-1">
                      Payment Information
                    </h3>
                    <div className="divide-y divide-border border-y border-border">
                      <div className="py-4 flex justify-between items-center">
                        <span className="text-sm font-bold text-[#64748B]">
                          Total Amount
                        </span>
                        <span className="text-lg font-black text-foreground">
                          {selectedPayment.amount}
                        </span>
                      </div>
                      <div className="py-4 flex justify-between items-center">
                        <span className="text-sm font-bold text-[#64748B]">
                          Status
                        </span>
                        <div className="flex items-center gap-2">
                          {selectedPayment.status === "PAID" ? (
                            <CheckCircle size={14} className="text-[#84CC16]" />
                          ) : selectedPayment.status === "PENDING" ? (
                            <Clock size={14} className="text-yellow-500" />
                          ) : (
                            <AlertCircle size={14} className="text-red-500" />
                          )}
                          <span
                            className={`text-sm font-black ${selectedPayment.status === "PAID" ? "text-[#84CC16]" : selectedPayment.status === "PENDING" ? "text-yellow-600" : "text-red-600"}`}
                          >
                            {selectedPayment.status}
                          </span>
                        </div>
                      </div>
                      <div className="py-4 flex justify-between items-center">
                        <span className="text-sm font-bold text-[#64748B]">
                          Payment Method
                        </span>
                        <span className="text-sm font-black text-foreground">
                          {selectedPayment.method}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.15em] px-1">
                      Order Details
                    </h3>
                    <div className="space-y-2 rounded-3xl border border-border bg-surface p-5">
                      <p className="text-sm font-black text-foreground">
                        {selectedPayment.order}
                      </p>
                      <p className="text-sm font-medium leading-relaxed text-muted-foreground italic">
                        {selectedPayment.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex flex-col gap-3 p-8 pt-0 sm:flex-row">
                  <button className="flex-1 py-4 bg-[#84CC16] text-white font-black text-[13px] rounded-2xl hover:bg-[#76b813] transition shadow-lg shadow-lime-500/20 active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest">
                    <Download size={16} strokeWidth={3} />
                    Download Invoice
                  </button>
                  <button
                    onClick={() => setSelectedPayment(null)}
                    className="rounded-2xl bg-surface px-8 py-4 text-[13px] font-black uppercase tracking-widest text-muted-foreground transition hover:bg-muted active:scale-95"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
