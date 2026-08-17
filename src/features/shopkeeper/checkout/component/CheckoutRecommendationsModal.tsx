"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Check, X, Sparkles } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useCurrency } from "@/hooks/useCurrency";
import type { InventoryItem } from "@/features/shopkeeper/inventory/types";
import type { CheckoutRecommendation } from "../../popUps/types";

interface Props {
  isOpen: boolean;
  recommendations: CheckoutRecommendation[];
  onDismiss: () => void;
  onAddSelected: (selectedItems: InventoryItem[]) => void;
}

export function CheckoutRecommendationsModal({
  isOpen,
  recommendations,
  onDismiss,
  onAddSelected,
}: Props) {
  const { formatCurrency } = useCurrency();
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(
    new Set(),
  );

  // Flatten suggested items from all matching rules
  const allSuggestedItems = React.useMemo(() => {
    const itemsMap = new Map<string, InventoryItem>();
    recommendations.forEach((rec) => {
      rec.suggestedItems.forEach((item) => {
        if (!itemsMap.has(item._id)) {
          itemsMap.set(item._id, item);
        }
      });
    });
    return Array.from(itemsMap.values());
  }, [recommendations]);

  const toggleItem = (itemId: string) => {
    const newSelected = new Set(selectedItemIds);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItemIds(newSelected);
  };

  const handleAddSelected = () => {
    const itemsToAdd = allSuggestedItems.filter((item) =>
      selectedItemIds.has(item._id),
    );
    onAddSelected(itemsToAdd);
  };

  const getImageUrl = (item: InventoryItem) => {
    const src =
      item.image?.url ||
      item.images?.[0] ||
      item.sourceImageUrl ||
      item.sourceImageUrls?.[0] ||
      "";
    if (src.startsWith("http://") || src.startsWith("https://")) {
      return `/api/image-proxy?url=${encodeURIComponent(src)}`;
    }
    return src;
  };

  const getDisplayPrice = (item: InventoryItem) =>
    item.expectedPrice ?? item.salePrice ?? 0;

  const getCategoryName = (item: InventoryItem): string => {
    const cat = item.categoryId as unknown;
    if (
      cat &&
      typeof cat === "object" &&
      "name" in cat &&
      typeof (cat as { name?: unknown }).name === "string"
    ) {
      return (cat as { name: string }).name;
    }
    return "Accessory";
  };

  const totalSelectedPrice = allSuggestedItems
    .filter((item) => selectedItemIds.has(item._id))
    .reduce((sum, item) => sum + getDisplayPrice(item), 0);

  // If no items to suggest, we shouldn't really render, but dialog controls visibility
  if (allSuggestedItems.length === 0) {
    return null;
  }

  const triggerCategoryName =
    recommendations[0]?.triggerCategory?.name || "detected items";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onDismiss()}>
      <DialogContent
        className="max-w-3xl p-6 sm:p-8 rounded-[32px] gap-6"
        showCloseButton={false}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="bg-[#84CC16]/20 p-2.5 rounded-2xl text-[#84CC16]">
              <Sparkles size={24} className="fill-[#84CC16]" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Recommended Add-ons
              </h2>
              <p className="text-sm font-bold text-slate-500 mt-1">
                Suggested accessories based on items in this checkout. Please
                offer these to the customer.
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="bg-[#84CC16]/10 border border-[#84CC16]/20 text-[#65a30d] px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-2">
          <span>Detected category:</span>
          <span className="text-[#4d7c0f] font-black">
            {triggerCategoryName}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[45vh] overflow-y-auto pb-2 pr-2 custom-scrollbar">
          {allSuggestedItems.map((item) => {
            const isSelected = selectedItemIds.has(item._id);
            return (
              <div
                key={item._id}
                onClick={() => toggleItem(item._id)}
                className={`relative flex flex-col p-4 rounded-3xl border-2 transition-all cursor-pointer bg-white group hover:shadow-lg ${
                  isSelected
                    ? "border-[#84CC16] shadow-sm ring-4 ring-[#84CC16]/10"
                    : "border-slate-100 hover:border-slate-200"
                }`}
              >
                <div className="absolute top-4 right-4 z-10">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                      isSelected
                        ? "bg-[#84CC16] text-white"
                        : "bg-slate-100 text-transparent group-hover:bg-slate-200"
                    }`}
                  >
                    <Check size={14} strokeWidth={4} />
                  </div>
                </div>

                <div className="h-32 w-full relative mb-4 bg-slate-50 rounded-2xl overflow-hidden p-2">
                  {getImageUrl(item) ? (
                    <Image
                      src={getImageUrl(item)}
                      alt={item.itemName}
                      fill
                      className="object-contain p-2"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      No Image
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col">
                  <h3 className="font-black text-slate-800 text-[15px] leading-snug line-clamp-2">
                    {item.itemName}
                  </h3>
                  <p className="text-xs font-bold text-slate-400 mt-1 line-clamp-1">
                    {getCategoryName(item)}
                  </p>

                  <div className="mt-auto pt-3 flex items-center justify-between">
                    <span className="text-lg font-black text-slate-900">
                      {formatCurrency(getDisplayPrice(item))}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-4 pt-2">
          <button
            onClick={onDismiss}
            className="flex-1 py-4 text-sm font-black text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-2xl transition"
          >
            Dismiss
          </button>
          <button
            onClick={handleAddSelected}
            disabled={selectedItemIds.size === 0}
            className="flex-[2] py-4 text-sm font-black text-white bg-[#84CC16] hover:bg-[#76b813] rounded-2xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-lime-500/20"
          >
            Add Selected ({selectedItemIds.size}) –{" "}
            {formatCurrency(totalSelectedPrice)}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
