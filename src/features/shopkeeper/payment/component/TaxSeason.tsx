"use client";

import React from "react";
import {
  Download,
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

export default function TaxSeason() {
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
      }) => ({
        id: `#${p._id.substring(0, 8).toUpperCase()}`,
        amount: formatCurrency(p.amount),
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
      <div className="p-4 md:p-10 max-w-[1600px] mx-auto flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#84CC16]" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 max-w-[1600px] mx-auto bg-background h-screen space-y-8 font-poppins relative">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">
            Payment History
          </h1>
          <p className="text-[#64748B] font-medium mt-1">
            Track your payment status and invoices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#84CC16] transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Search invoices..."
              className="pl-12 pr-6 py-3.5 bg-card border border-border rounded-2xl outline-none focus:border-[#84CC16] focus:ring-4 focus:ring-[#84CC16]/5 transition-all text-sm font-semibold w-full md:w-[300px] shadow-sm"
            />
          </div>
          <button className="p-3.5 bg-card border border-border rounded-2xl hover:bg-gray-50 transition shadow-sm group">
            <Filter
              size={18}
              className="text-[#64748B] group-hover:text-[#0F172A]"
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
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
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
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payments.map((row: (typeof payments)[number], i: number) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-[#F8FAFC]/50 transition-colors group"
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
                  <td className="px-8 py-5 text-sm font-bold text-[#64748B]">
                    {row.created}
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-[#475569]">
                    {row.order}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        <div className="px-8 py-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface">
          <p className="text-sm font-bold text-[#64748B]">
            Showing{" "}
            <span className="text-foreground font-black">
              1 - {payments.length}
            </span>{" "}
            of{" "}
            <span className="text-[#0F172A] font-black">{payments.length}</span>{" "}
            results
          </p>

          <div className="flex items-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-100 text-[#64748B] hover:text-[#84CC16] hover:border-[#84CC16] transition-all disabled:opacity-50 shadow-sm active:scale-90">
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
                        : "bg-white border border-gray-100 text-[#64748B] hover:text-[#0F172A] hover:border-gray-200"
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
              className="relative w-full max-w-xl bg-white rounded-[40px] shadow-2xl overflow-hidden border border-white"
            >
              {/* Modal Header */}
              <div className="p-8 pb-0 flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#84CC16]/10 rounded-2xl flex items-center justify-center text-[#84CC16]">
                    <CreditCard size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-[#0F172A] tracking-tight">
                      Transaction Details
                    </h2>
                    <p className="text-[13px] font-bold text-[#64748B]">
                      View full breakdown of your invoice
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="p-2.5 hover:bg-gray-100 rounded-xl transition text-[#94A3B8] hover:text-[#0F172A]"
                >
                  <X size={20} strokeWidth={3} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-8 space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-2 text-[#94A3B8]">
                      <Hash size={14} />
                      <span className="text-[11px] font-black uppercase tracking-wider">
                        Transaction ID
                      </span>
                    </div>
                    <p className="text-[15px] font-black text-[#0F172A]">
                      {selectedPayment.id}
                    </p>
                  </div>
                  <div className="space-y-1.5 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-2 text-[#94A3B8]">
                      <Calendar size={14} />
                      <span className="text-[11px] font-black uppercase tracking-wider">
                        Date Created
                      </span>
                    </div>
                    <p className="text-[15px] font-black text-[#0F172A]">
                      {selectedPayment.created}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.15em] px-1">
                    Payment Information
                  </h3>
                  <div className="divide-y divide-gray-100 border-y border-gray-100">
                    <div className="py-4 flex justify-between items-center">
                      <span className="text-sm font-bold text-[#64748B]">
                        Total Amount
                      </span>
                      <span className="text-lg font-black text-[#0F172A]">
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
                      <span className="text-sm font-black text-[#0F172A]">
                        {selectedPayment.method}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.15em] px-1">
                    Order Details
                  </h3>
                  <div className="p-5 bg-[#F8FAFC] rounded-3xl border border-gray-100 space-y-2">
                    <p className="text-sm font-black text-[#0F172A]">
                      {selectedPayment.order}
                    </p>
                    <p className="text-sm font-medium text-[#64748B] leading-relaxed italic">
                      {selectedPayment.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-8 pt-0 flex gap-3">
                <button className="flex-1 py-4 bg-[#84CC16] text-white font-black text-[13px] rounded-2xl hover:bg-[#76b813] transition shadow-lg shadow-lime-500/20 active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest">
                  <Download size={16} strokeWidth={3} />
                  Download Invoice
                </button>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="px-8 py-4 bg-gray-100 text-[#64748B] font-black text-[13px] rounded-2xl hover:bg-gray-200 transition active:scale-95 uppercase tracking-widest"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
