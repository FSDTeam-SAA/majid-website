/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo, useState } from "react";
import { useMyProfile } from "@/features/shopkeeper/settings/hooks/useSettings";
import { useMyInvoiceHistory } from "@/features/shopkeeper/inventory/hooks/useInventory";
import { useCurrency } from "@/hooks/useCurrency";
import {
  Loader2,
  Search,
  RotateCcw,
  FileText,
  ChevronRight,
  X,
  Download,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import ReturnInvoiceModal from "@/features/shopkeeper/checkout/component/ReturnInvoiceModal";
import { pdf } from "@react-pdf/renderer";
import CheckoutInvoicePDF from "@/features/shopkeeper/checkout/component/CheckoutInvoicePDF";
import { getShopkeeperDisplayName } from "@/components/shared/shopkeeper/profile-utils";
import { toast } from "sonner";

export default function Transactions() {
  const { data: profileData } = useMyProfile();
  const shopkeeper = profileData?.data;
  const shopkeeperId = shopkeeper?._id;

  const [searchQuery, setSearchQuery] = useState("");
  const { data: response, isLoading } = useMyInvoiceHistory(
    shopkeeperId || "",
    !!shopkeeperId,
  );
  const { formatCurrency, currency } = useCurrency();

  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(
    null,
  );

  const invoices = useMemo(() => response?.data || [], [response]);

  const filteredInvoices = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return invoices;
    return invoices.filter((inv: any) => {
      const c = inv.customerInfo || {};
      const name = `${c.firstName || ""} ${c.lastName || ""}`;
      return [inv._id, inv.paymentMethod, name]
        .filter(Boolean)
        .some((val) => String(val).toLowerCase().includes(q));
    });
  }, [invoices, searchQuery]);

  // Group by Date
  const groupedInvoices = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredInvoices.forEach((inv: any) => {
      const date = new Date(inv.createdAt);
      // Format like "Today, 10 August" or "10 August"
      const today = new Date();
      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

      const dateStr = date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
      });
      const key = isToday ? `Today, ${dateStr}` : dateStr;

      if (!groups[key]) groups[key] = [];
      groups[key].push(inv);
    });
    return groups;
  }, [filteredInvoices]);

  const handleGenerateReceipt = async (transaction: any) => {
    try {
      const mappedCart =
        transaction.lineItems?.map((item: any) => ({
          id: item.itemId?._id,
          name: item.itemId?.itemName,
          price: Number(item.itemId?.expectedPrice || 0),
          qty: item.quantity || 1,
          image: item.itemId?.image?.url,
          imeiNumber: item.itemId?.imeiNumber,
          type: "product",
        })) || [];

      // if itemsIds are present but not lineItems (older data format)
      if (mappedCart.length === 0 && transaction.itemsIds?.length) {
        transaction.itemsIds.forEach((item: any) => {
          mappedCart.push({
            id: item._id,
            name: item.itemName,
            price: Number(item.expectedPrice || 0),
            qty: 1,
            image: item.image?.url,
            imeiNumber: item.imeiNumber,
            type: "product",
          });
        });
      }

      const total = Number(transaction.totalAmount || 0);
      const amountPaid = Number(transaction.amountPaid || 0);
      const due = Number(transaction.dueAmount || 0);

      const doc = (
        <CheckoutInvoicePDF
          cartItems={mappedCart}
          invoiceNumber={
            transaction.invoiceNumber ||
            transaction._id?.slice(-8).toUpperCase()
          }
          subtotal={total}
          tax={Number(transaction.tax || 0)}
          total={total}
          shopkeeper={shopkeeper}
          customer={transaction.customerInfo}
          paymentMethod={transaction.paymentMethod || "cash"}
          payment={{
            amountPaid,
            dueAmount: due,
            method: transaction.paymentMethod || "cash",
            status: transaction.paymentStatus || "paid",
            details: transaction.paymentDetails || {},
          }}
          currency={currency}
        />
      );

      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `receipt_${transaction._id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      toast.success("Receipt generated successfully");
      setSelectedTransaction(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate receipt");
    }
  };

  return (
    <div className="mx-auto flex h-full max-w-lg flex-col bg-slate-50 min-h-[calc(100vh-80px)] font-sans">
      {/* Header */}
      <div className="bg-white px-6 pt-10 pb-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-b border-slate-100 flex flex-col items-center sticky top-0 z-10">
        <div className="flex w-full items-center justify-between mb-4">
          <h1 className="text-[22px] font-black text-slate-900 tracking-tight">
            {getShopkeeperDisplayName(shopkeeper) || "Transactions"}
          </h1>
          <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 shadow-inner">
            <FileText size={18} />
          </div>
        </div>

        <button
          onClick={() => setIsReturnModalOpen(true)}
          className="relative overflow-hidden w-full rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 py-3.5 text-[15px] font-black text-white hover:from-slate-800 hover:to-slate-700 transition-all shadow-[0_8px_16px_-6px_rgba(0,0,0,0.3)] active:scale-[0.98] group"
        >
          <div className="absolute inset-0 bg-white/10 w-full translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out skew-x-12" />
          <span className="flex items-center justify-center gap-2">
            <RotateCcw size={18} className="text-white/80" />
            Unlinked Refund
          </span>
        </button>

        <div className="relative mt-5 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-[#84CC16] transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, name, or method..."
            className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/50 py-3.5 pl-12 pr-4 text-[14px] font-bold text-slate-900 placeholder-slate-400 focus:border-[#84CC16] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#84CC16]/10 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#84CC16]" />
          </div>
        ) : filteredInvoices.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-48 text-center bg-white rounded-3xl border border-dashed border-slate-200"
          >
            <div className="bg-slate-50 p-4 rounded-full mb-3">
              <FileText className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-[15px] font-black text-slate-700">
              No transactions found
            </p>
            <p className="text-[13px] font-medium text-slate-400 mt-1 max-w-[200px]">
              Try adjusting your search criteria
            </p>
          </motion.div>
        ) : (
          Object.entries(groupedInvoices).map(
            ([dateLabel, items], groupIndex) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.05 }}
                key={dateLabel}
                className="space-y-3"
              >
                <h3 className="px-2 text-[13px] font-black uppercase tracking-widest text-slate-400">
                  {dateLabel}
                </h3>
                <div className="rounded-[28px] bg-white border border-slate-100 shadow-[0_2px_20px_-8px_rgba(0,0,0,0.05)] overflow-hidden">
                  {items.map((inv, idx) => (
                    <div key={inv._id}>
                      <button
                        onClick={() => setSelectedTransaction(inv)}
                        className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50/80 transition-colors active:bg-slate-100 group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-600 border border-slate-100 group-hover:scale-105 transition-transform duration-300 shadow-sm">
                            {inv.paymentMethod === "card" ||
                            inv.paymentMethod === "stripe" ? (
                              <div className="text-[10px] font-black tracking-[0.1em] bg-slate-900 text-white px-2 py-1 rounded-lg uppercase shadow-sm">
                                Visa
                              </div>
                            ) : (
                              <div className="text-[10px] font-black tracking-[0.1em] text-slate-700 uppercase bg-white border border-slate-200 px-2 py-1 rounded-lg shadow-sm">
                                Cash
                              </div>
                            )}
                          </div>
                          <div className="text-left">
                            <span className="block text-[16px] font-black text-slate-900 tracking-tight">
                              {formatCurrency(inv.totalAmount || 0)}
                            </span>
                            <span className="block text-[12px] font-bold text-slate-400 truncate max-w-[120px] mt-0.5">
                              {inv.customerInfo?.firstName
                                ? `${inv.customerInfo.firstName} ${inv.customerInfo.lastName}`
                                : "Walk-in"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[13px] font-bold text-slate-400">
                            {new Date(inv.createdAt)
                              .toLocaleTimeString([], {
                                hour: "numeric",
                                minute: "2-digit",
                              })
                              .toLowerCase()}
                          </span>
                          <div className="h-8 w-8 rounded-full flex items-center justify-center group-hover:bg-white group-hover:shadow-sm border border-transparent group-hover:border-slate-100 transition-all">
                            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </div>
                      </button>
                      {idx < items.length - 1 && (
                        <div className="h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent mx-4" />
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            ),
          )
        )}
      </div>

      {/* Options Modal */}
      <AnimatePresence>
        {selectedTransaction && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTransaction(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-[4px]"
            />
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 400 }}
              className="relative w-full max-w-sm overflow-hidden rounded-[32px] sm:rounded-[40px] bg-white shadow-2xl border border-slate-100 z-10 pb-4 sm:pb-0"
            >
              {/* Highlight Bar */}
              <div className="h-2 w-full bg-gradient-to-r from-[#84CC16] to-[#65a30d]" />

              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                      Select Action
                    </h3>
                    <p className="text-[13px] font-bold text-slate-400 mt-1">
                      For transaction #
                      {selectedTransaction._id?.slice(-8).toUpperCase()}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedTransaction(null)}
                    className="rounded-full p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X size={20} strokeWidth={3} />
                  </button>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <button
                    onClick={() => {
                      setIsReturnModalOpen(true);
                      setSelectedTransaction(null);
                    }}
                    className="w-full flex items-center gap-4 rounded-[24px] bg-white p-4 transition-all hover:bg-orange-50/50 border-2 border-slate-100 hover:border-orange-200 group active:scale-[0.98]"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 group-hover:scale-110 transition-transform">
                      <RotateCcw className="h-6 w-6" strokeWidth={2.5} />
                    </div>
                    <div className="text-left">
                      <p className="text-[16px] font-black text-slate-900 group-hover:text-orange-700 transition-colors tracking-tight">
                        Process Refund
                      </p>
                      <p className="text-[12px] font-bold text-slate-400 mt-0.5 leading-tight">
                        Return items from this invoice
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleGenerateReceipt(selectedTransaction)}
                    className="w-full flex items-center gap-4 rounded-[24px] bg-white p-4 transition-all hover:bg-[#84CC16]/5 border-2 border-slate-100 hover:border-[#84CC16]/30 group active:scale-[0.98]"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#84CC16]/10 text-[#84CC16] group-hover:scale-110 transition-transform">
                      <Download className="h-6 w-6" strokeWidth={2.5} />
                    </div>
                    <div className="text-left">
                      <p className="text-[16px] font-black text-slate-900 group-hover:text-[#84CC16] transition-colors tracking-tight">
                        New Receipt
                      </p>
                      <p className="text-[12px] font-bold text-slate-400 mt-0.5 leading-tight">
                        Generate exact invoice copy
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ReturnInvoiceModal
        open={isReturnModalOpen}
        onOpenChange={setIsReturnModalOpen}
        shopkeeperId={shopkeeperId}
      />
    </div>
  );
}
