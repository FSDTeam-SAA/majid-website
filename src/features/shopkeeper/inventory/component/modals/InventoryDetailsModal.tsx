import React from "react";
import { motion } from "framer-motion";
import {
  X,
  Smartphone,
  Cpu,
  Layers,
  DollarSign,
  Tag,
  Info,
  Calendar,
  Sparkles,
  FileText,
} from "lucide-react";
import Image from "next/image";
import type { InventoryItem } from "../../types";
import { useCurrency } from "@/hooks/useCurrency";

interface InventoryDetailsModalProps {
  item: InventoryItem | null;
  onClose: () => void;
}

const getInventoryImageUrl = (item: InventoryItem) =>
  item.image?.url ||
  item.images?.[0] ||
  item.sourceImageUrl ||
  item.sourceImageUrls?.[0] ||
  "";

const getInventoryDisplayPrice = (item: InventoryItem) =>
  item.expectedPrice ?? item.salePrice ?? 0;

export function InventoryDetailsModal({
  item,
  onClose,
}: InventoryDetailsModalProps) {
  const { currency, formatCurrency } = useCurrency();
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-6 overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#0F172A]/60 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-background rounded-[40px] shadow-2xl overflow-hidden border border-white/20 flex flex-col md:flex-row"
      >
        {/* Product Image Section - Sticky on mobile/left on desktop */}
        <div className="w-full md:w-[350px] h-[300px] md:h-auto relative bg-slate-50 flex-shrink-0 border-r border-slate-100">
          {getInventoryImageUrl(item) ? (
            <Image
              src={getInventoryImageUrl(item)}
              alt={item.itemName}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center gap-4">
              <div className="w-20 h-20 rounded-3xl bg-white dark:bg-background  shadow-sm flex items-center justify-center text-slate-300">
                <Smartphone className="w-10 h-10" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                No Image Available
              </p>
            </div>
          )}
          <div className="absolute top-6 left-6 flex flex-col gap-2 z-10">
            <span className="px-4 py-1.5 rounded-full bg-[#84CC16] text-white text-[10px] font-black tracking-widest uppercase shadow-lg shadow-lime-500/20">
              In Stock
            </span>
            <span className="px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-[#0F172A] text-[10px] font-black tracking-widest uppercase shadow-md border border-white/20">
              {item.currentState}
            </span>
          </div>

          {/* Pricing Highlight at Bottom of Image */}
          <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/80 backdrop-blur-md rounded-2xl border border-white/50 shadow-xl hidden md:block">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Selling Price
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-[#0F172A]">
                {formatCurrency(getInventoryDisplayPrice(item), currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Product Info Section - Scrollable */}
        <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-background">
          {/* Sticky Header */}
          <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-white/80 dark:bg-background backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                <Smartphone size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#0F172A] dark:text-white tracking-tight leading-tight line-clamp-1">
                  {item.itemName}
                </h2>
                <p className="text-[11px] font-bold text-[#94A3B8] dark:text-gray-400 uppercase tracking-widest">
                  {item.imeiNumber || "IMEI NOT PROVIDED"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 hover:bg-slate-100 rounded-xl transition text-[#94A3B8] hover:text-red-500 cursor-pointer"
            >
              <X size={20} strokeWidth={3} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-10">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Condition
                </span>
                <span className="text-xs font-black text-slate-900 uppercase">
                  {item.currentState}
                </span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Quantity
                </span>
                <span className="text-xs font-black text-slate-900">
                  {item.quantity || 0} Units
                </span>
              </div>
              <div className="p-4 bg-[#84CC16]/5 rounded-2xl border border-[#84CC16]/10 text-center">
                <span className="block text-[9px] font-black text-[#84CC16] uppercase tracking-widest mb-1">
                  Selling
                </span>
                <span className="text-xs font-black text-[#84CC16]">
                  {formatCurrency(getInventoryDisplayPrice(item), currency)}
                </span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Added
                </span>
                <span className="text-xs font-black text-slate-900">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Technical Specifications */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                  <Layers size={16} />
                </div>
                <h3 className="text-sm font-black text-[#0F172A] dark:text-white uppercase tracking-widest">
                  Technical Specifications
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 bg-slate-50 dark:bg-slate-900/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-800">
                <SpecItem label="Brand" value={item.brand} />
                <SpecItem label="SKU" value={item.sku} />
                <SpecItem label="Model Number" value={item.modelNumber} />
                <SpecItem label="Group Key" value={item.groupKey} />
                <SpecItem label="Storage" value={item.storage} />
                <SpecItem label="Color" value={item.color} />
                <SpecItem label="Size" value={item.size} />
                <SpecItem
                  label="Min Stock"
                  value={item.minStockLevel?.toString()}
                />
              </div>
            </div>

            {/* Technical Details */}
            {(item.variants || []).length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#84CC16] flex items-center justify-center text-white">
                    <Layers size={16} />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-[#0F172A] dark:text-white">
                    Available Variants
                  </h3>
                </div>
                <div className="space-y-3">
                  {item.variants?.map((variant, index) => (
                    <div
                      key={variant._id || index}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-white">
                          {variant.image?.url && (
                            <Image
                              src={variant.image.url}
                              alt={`${item.itemName} variant`}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">
                            {variant.color || "Variant"}
                            {variant.storage ? ` · ${variant.storage}` : ""}
                          </p>
                          <p className="text-[11px] font-bold text-slate-500">
                            IMEI: {variant.imeiNumber || "Not provided"} ·{" "}
                            {variant.currentState}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-[#65a30d]">
                          {formatCurrency(variant.expectedPrice || 0, currency)}
                        </p>
                        <p className="text-[11px] font-bold text-slate-500">
                          {variant.quantity} in stock
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Technical Details */}
            {item.productDetails && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                    <FileText size={16} />
                  </div>
                  <h3 className="text-sm font-black text-[#0F172A] uppercase tracking-widest">
                    Product Specifications
                  </h3>
                </div>
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <p className="text-[13px] font-bold text-slate-600 leading-relaxed">
                    {item.productDetails}
                  </p>
                </div>
              </div>
            )}

            {/* Footer Note */}
            <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0 shadow-sm">
                <Info size={18} />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black text-blue-900 uppercase tracking-wider">
                  Verification Status
                </h4>
                <p className="text-[12px] font-bold text-blue-900/60 leading-relaxed">
                  This device has been authenticated and registered in your
                  secure shopkeeper inventory. All details are synchronized with
                  the global tracking system.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="px-8 py-6 bg-white border-t border-slate-50 flex gap-3 dark:bg-background ">
            <button
              onClick={onClose}
              className="flex-1 py-4 bg-slate-900 text-white dark:bg-slate-700 dark:text-white  font-black text-[13px] rounded-2xl hover:bg-slate-800 transition shadow-xl active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest cursor-pointer"
            >
              Done Reviewing
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function SpecItem({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0 dark:border-slate-800">
      <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
        {label}
      </span>
      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
        {value}
      </span>
    </div>
  );
}
