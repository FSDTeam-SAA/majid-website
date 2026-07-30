import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Loader2, Check, Edit2 } from "lucide-react";
import type { CartItem } from "../types";
import Image from "next/image";
import { useCurrency } from "@/hooks/useCurrency";

interface InvoicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  editedPrices: Record<string, number>;
  setEditedPrices: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  onDownload: () => void;
  isGeneratingInvoice: boolean;
}

export default function InvoicePreviewModal({
  isOpen,
  onClose,
  cartItems,
  editedPrices,
  setEditedPrices,
  onDownload,
  isGeneratingInvoice,
}: InvoicePreviewModalProps) {
  const { currency, currencySymbol, formatCurrency } = useCurrency();
  if (!isOpen) return null;

  const handlePriceChange = (cartItemId: string, newPrice: string) => {
    const parsed = parseFloat(newPrice);
    if (!isNaN(parsed) && parsed >= 0) {
      setEditedPrices((prev) => ({ ...prev, [cartItemId]: parsed }));
    } else if (newPrice === "") {
      setEditedPrices((prev) => {
        const next = { ...prev };
        delete next[cartItemId];
        return next;
      });
    }
  };

  const getPrice = (cartItem: CartItem) => {
    const originalPrice = cartItem.itemId?.expectedPrice || 0;
    return editedPrices[cartItem._id] !== undefined
      ? editedPrices[cartItem._id]
      : originalPrice;
  };

  const calculateTotals = () => {
    let originalTotal = 0;
    let finalTotal = 0;

    cartItems.forEach((cartItem) => {
      const originalPrice = cartItem.itemId?.expectedPrice || 0;
      const finalPrice = getPrice(cartItem);
      const qty = cartItem.quantity;

      originalTotal += originalPrice * qty;
      finalTotal += finalPrice * qty;
    });

    const totalDiscount =
      originalTotal > finalTotal ? originalTotal - finalTotal : 0;

    return { originalTotal, finalTotal, totalDiscount };
  };

  const { finalTotal, totalDiscount } = calculateTotals();

  const invoiceDate = new Date();
  const dueDate = new Date(invoiceDate);
  dueDate.setDate(invoiceDate.getDate() + 7);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 font-poppins">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative flex h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-[#F7F3F0] shadow-2xl"
        >
          {/* Top Actions */}
          <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shadow-sm z-10">
            <div>
              <h2 className="text-lg font-black text-[#0F172A]">
                Invoice Preview
              </h2>
              <p className="text-xs font-bold text-slate-500">
                Edit unit prices inside the PDF view before export.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 transition hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={onDownload}
                disabled={isGeneratingInvoice}
                className="flex items-center gap-2 rounded-xl bg-[#155E63] px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-teal-900/20 transition hover:bg-[#164E55] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isGeneratingInvoice ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Download size={16} />
                )}
                Download PDF
              </button>
            </div>
          </div>

          {/* PDF Paper Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center">
            {/* The A4 Paper */}
            <div className="w-full max-w-[700px] h-max bg-white p-8 sm:p-12 shadow-md rounded-sm text-[12px] text-slate-700">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    {/* Fake Logo */}
                    <div className="text-2xl font-black text-[#75A71E]">
                      imoscan
                    </div>
                    <div className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#2F9BEF] text-[10px] font-bold text-white">
                      <Check size={12} strokeWidth={4} />
                    </div>
                  </div>
                  <div className="mt-1 text-[10px] text-slate-500">
                    imoscan • +1 234 567 8000
                  </div>
                </div>
                <div className="text-3xl font-black tracking-widest text-[#155E63]">
                  INVOICE
                </div>
              </div>

              {/* Meta Grid */}
              <div className="my-6 flex gap-8">
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-[#F97316]">
                    Invoice #{" "}
                    <span className="text-slate-900">INV-PREVIEW</span>
                  </span>
                  <span>
                    Date:{" "}
                    <span className="font-bold text-slate-900">
                      {invoiceDate.toLocaleDateString("en-GB")}
                    </span>
                  </span>
                </div>
                <div className="w-px bg-slate-200" />
                <div className="flex flex-col gap-1">
                  <span>Date:</span>
                  <span className="font-bold text-slate-900">
                    {invoiceDate.toLocaleDateString("en-GB")}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span>Due Date:</span>
                  <span className="font-bold text-slate-900">
                    {dueDate.toLocaleDateString("en-GB")}
                  </span>
                </div>
              </div>

              {/* Pills */}
              <div className="mb-4 flex overflow-hidden rounded-md text-[11px]">
                <div className="w-[44%] bg-[#F97316] px-4 py-2 font-bold text-white">
                  Customer Details
                </div>
                <div className="flex-1 bg-[#C9D3D0] px-4 py-2 text-center font-bold text-[#164E55]">
                  Payment Method: Bank Transfer
                </div>
              </div>

              {/* Table Header */}
              <div className="flex bg-[#155E63] px-2 py-2 font-bold text-white text-[11px]">
                <div className="w-[15%]">IMEI/SN</div>
                <div className="w-[34%]">Item</div>
                <div className="w-[14%]">Status</div>
                <div className="w-[17%]">Condition</div>
                <div className="w-[8%] text-center">Qty</div>
                <div className="w-[12%] text-right">Price</div>
              </div>

              {/* Rows */}
              <div className="flex flex-col border-b border-slate-200">
                {cartItems.map((cartItem, i) => {
                  const item = cartItem.itemId;
                  const originalPrice = item?.expectedPrice || 0;
                  const price = getPrice(cartItem);
                  const isDiscounted = originalPrice > price;

                  return (
                    <div
                      key={cartItem._id}
                      className={`flex items-center min-h-[54px] px-2 py-2 border-b border-[#DDE7E4] ${i % 2 === 1 ? "bg-[#EAF5F3]" : ""} text-[10px]`}
                    >
                      <div className="w-[15%] pr-2">
                        {item?.image?.url ? (
                          <div className="h-8 w-8 relative rounded overflow-hidden mb-1">
                            <Image
                              src={item.image.url}
                              alt="product"
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="text-[8px] text-slate-400 mb-1">
                            No Image
                          </div>
                        )}
                        <div className="text-[8px] text-slate-500 truncate">
                          {item?.imeiNumber || item?.sku || "N/A"}
                        </div>
                      </div>
                      <div className="w-[34%] pr-2">
                        <div className="font-bold text-slate-900 line-clamp-2">
                          {item?.itemName || "Unknown Item"}
                        </div>
                        <div className="text-[8px] text-slate-500 mt-0.5">
                          IMEI: {item?.imeiNumber || "N/A"}
                        </div>
                      </div>
                      <div className="w-[14%] pr-2">
                        <div className="font-bold text-[#0F766E]">✓ Clean</div>
                        <div className="text-[8px] text-slate-500 mt-0.5">
                          Verified
                        </div>
                      </div>
                      <div className="w-[17%] pr-2">
                        <div>{item?.currentState || "N/A"}</div>
                        <div className="text-[8px] text-slate-500 mt-0.5">
                          Ready to sell
                        </div>
                      </div>
                      <div className="w-[8%] text-center font-bold text-slate-900">
                        {cartItem.quantity}
                      </div>
                      <div className="w-[12%] text-right flex flex-col items-end">
                        {/* Inline editor for price */}
                        <div className="relative group flex items-center justify-end w-full mb-0.5">
                          <div className="flex items-center rounded-[4px] bg-slate-50 border border-slate-200 px-1 py-0.5 transition-colors group-hover:border-[#155E63] focus-within:border-[#155E63] focus-within:ring-1 focus-within:ring-[#155E63]">
                            <Edit2
                              size={9}
                              className="text-slate-400 mr-1 opacity-60"
                            />
                            <span className="text-[10px] font-bold text-slate-400 mr-0.5">
                              {currencySymbol}
                            </span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={
                                editedPrices[cartItem._id] !== undefined
                                  ? editedPrices[cartItem._id]
                                  : ""
                              }
                              placeholder={originalPrice.toString()}
                              onChange={(e) =>
                                handlePriceChange(cartItem._id, e.target.value)
                              }
                              className={`w-[42px] bg-transparent text-right font-black outline-none ${isDiscounted ? "text-[#155E63]" : "text-slate-900"}`}
                              title="Edit Unit Price"
                            />
                          </div>
                        </div>
                        {isDiscounted && (
                          <div className="text-[8px] text-slate-400 line-through">
                            {formatCurrency(originalPrice, currency)}
                          </div>
                        )}
                        {isDiscounted && originalPrice > 0 && (
                          <div className="text-[8px] font-bold text-[#F97316]">
                            -{((1 - price / originalPrice) * 100).toFixed(1)}%
                            OFF
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
              <div className="flex justify-end mt-4 text-[11px]">
                <div className="w-[45%] flex flex-col">
                  {totalDiscount > 0 && (
                    <div className="flex justify-between border-b border-slate-200 py-2">
                      <span>Total Discount</span>
                      <span className="text-[#F97316]">
                        -{formatCurrency(totalDiscount, currency)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-b border-slate-200 py-2">
                    <span>Subtotal</span>
                    <span>{formatCurrency(finalTotal, currency)}</span>
                  </div>
                  <div className="flex justify-between bg-[#F97316] text-white rounded-b-md px-3 py-2.5 font-bold text-sm">
                    <span>Amount Due:</span>
                    <span>{formatCurrency(finalTotal, currency)}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-10 flex gap-6">
                <div className="w-[80px] h-[80px] border border-slate-200 rounded flex items-center justify-center bg-slate-50 flex-col gap-1 text-slate-400 shrink-0">
                  <div className="w-12 h-12 bg-slate-200 rounded-sm"></div>
                  <span className="text-[7px]">QR Code</span>
                </div>
                <div className="flex-1">
                  <div className="text-[#155E63] font-bold mb-2 text-xs">
                    Terms & Conditions
                  </div>
                  <div className="text-[9px] text-slate-500 leading-relaxed">
                    ID details securely verified and stored with consent. Please
                    keep this invoice for warranty, resale, and payment records.
                    All devices are sold as-is unless explicitly covered by
                    store warranty. Returns must be initiated within 7 days of
                    purchase.
                  </div>
                </div>
              </div>

              {/* Bottom Contact Bar */}
              <div className="mt-8 bg-[#BFE3DD] text-[#164E55] px-4 py-3 flex justify-between text-[9px] font-bold rounded-sm">
                <span>+1 234 567 8000</span>
                <span>info@imoscan.com</span>
                <span>ID details securely verified</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
