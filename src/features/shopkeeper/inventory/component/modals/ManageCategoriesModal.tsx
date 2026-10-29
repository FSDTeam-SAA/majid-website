"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Eye, EyeOff, Search, Loader2, Package, RotateCcw } from "lucide-react";
import Image from "next/image";
import {
  useManageCategories,
  useToggleCategoryVisibility,
  useResetCategoryImage,
} from "../../hooks/useInventory";
import type { Category } from "../../types";
import { toast } from "sonner";

interface ManageCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const getCategoryImageSrc = (category: Category) => {
  const img = category.image || category.defaultImage;
  const url = typeof img === "string" ? img : img?.url || "";
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return `/api/image-proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
};

export function ManageCategoriesModal({
  isOpen,
  onClose,
}: ManageCategoriesModalProps) {
  const { data: categoriesData, isLoading } = useManageCategories();
  const { mutate: toggleVisibility, isPending: isToggling } =
    useToggleCategoryVisibility();
  const { mutate: resetImage, isPending: isResetting } =
    useResetCategoryImage();
  const [search, setSearch] = useState("");

  const categories: Category[] = categoriesData?.data || [];

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleToggle = (category: Category) => {
    const newHiddenState = !category.isHidden;
    toggleVisibility(
      { id: category._id, isHidden: newHiddenState },
      {
        onSuccess: () => {
          toast.success(
            newHiddenState
              ? `"${category.name}" hidden from menu`
              : `"${category.name}" restored to menu`,
          );
        },
        onError: () => {
          toast.error("Failed to update category visibility");
        },
      },
    );
  };

  const handleResetImage = (category: Category) => {
    resetImage(category._id, {
      onSuccess: () => {
        toast.success(`Reset image for "${category.name}"`);
      },
      onError: () => {
        toast.error("Failed to reset category image");
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-6 rounded-3xl bg-card border border-border shadow-2xl">
        <DialogHeader className="space-y-1 pb-4 border-b border-border">
          <DialogTitle className="text-2xl font-black text-foreground tracking-tight">
            Manage Categories
          </DialogTitle>
          <DialogDescription className="text-xs font-semibold text-muted-foreground">
            Hide or restore categories in your inventory menu. Hiding changes
            your menu display only; all existing stock, items, and transactions
            are preserved.
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative my-3">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-slate-50/50 dark:bg-slate-900/50 text-sm font-bold text-foreground outline-none focus:border-[#84CC16] focus:ring-2 focus:ring-[#84CC16]/20 transition"
          />
        </div>

        {/* List of categories */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[300px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#84CC16]" />
              <p className="text-xs font-bold">Loading categories...</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-bold">No categories found</p>
            </div>
          ) : (
            filteredCategories.map((cat) => {
              const imgSrc = getCategoryImageSrc(cat);
              const isHidden = Boolean(cat.isHidden);

              return (
                <div
                  key={cat._id}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition ${
                    isHidden
                      ? "bg-slate-50/50 dark:bg-slate-900/30 border-dashed border-slate-300 dark:border-slate-800 opacity-70"
                      : "bg-card border-border hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 overflow-hidden">
                      {imgSrc ? (
                        <Image
                          src={imgSrc}
                          alt={cat.name}
                          fill
                          className="object-contain p-1"
                          unoptimized
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-slate-400">
                          <Package size={20} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-foreground truncate">
                          {cat.name}
                        </h4>
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isHidden
                              ? "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                              : "bg-[#84CC16]/10 text-[#84CC16]"
                          }`}
                        >
                          {isHidden ? "Hidden" : "Visible"}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-muted-foreground">
                        {cat.itemCount ?? cat.totalItems ?? 0} items
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {cat.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleResetImage(cat)}
                        disabled={isResetting}
                        title="Reset to default image"
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs font-bold"
                      >
                        <RotateCcw size={15} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleToggle(cat)}
                      disabled={isToggling}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer active:scale-95 ${
                        isHidden
                          ? "bg-[#84CC16] text-white hover:bg-[#76b813] shadow-sm shadow-lime-500/20"
                          : "border border-border bg-card text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-500"
                      }`}
                    >
                      {isHidden ? (
                        <>
                          <Eye size={14} />
                          Restore
                        </>
                      ) : (
                        <>
                          <EyeOff size={14} />
                          Hide
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
