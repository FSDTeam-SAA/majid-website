"use client";

import React from "react";
import { AlertTriangle, Trash2, Loader2, FolderOpen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Category } from "../../types";

interface DeleteCategoryWarningModalProps {
  isOpen: boolean;
  category: Category | null;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteCategoryWarningModal: React.FC<
  DeleteCategoryWarningModalProps
> = ({ isOpen, category, isPending, onClose, onConfirm }) => {
  if (!category) return null;

  const categoryImageUrl =
    typeof category.image === "string"
      ? category.image
      : category.image?.url || "";

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !isPending && onClose()}
    >
      <DialogContent className="max-w-md overflow-hidden rounded-[28px] border-border bg-card p-0 shadow-2xl">
        {/* Top visual warning banner & icon */}
        <div className="flex flex-col items-center px-6 pt-8 pb-3 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-600 border border-red-500/20 shadow-xs">
            <AlertTriangle className="h-8 w-8 text-red-500 stroke-[2.2]" />
          </div>

          <DialogHeader className="text-center sm:text-center">
            <DialogTitle className="text-2xl font-black text-foreground tracking-tight">
              Delete Category?
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm font-medium text-muted-foreground max-w-xs mx-auto">
              Are you sure you want to delete this category? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Highlighted Category Card */}
        <div className="mx-6 my-2 rounded-2xl border border-red-200/60 bg-red-50/60 dark:border-red-950/40 dark:bg-red-950/20 p-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-card border border-border/80 shadow-xs overflow-hidden">
              {categoryImageUrl ? (
                <img
                  src={
                    categoryImageUrl.startsWith("http")
                      ? `/api/image-proxy?url=${encodeURIComponent(categoryImageUrl)}`
                      : categoryImageUrl
                  }
                  alt={category.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <FolderOpen className="h-6 w-6 text-red-500/80" />
              )}
            </div>
            <div className="min-w-0 flex-1 text-left">
              <span className="text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400">
                Category to be deleted
              </span>
              <h4 className="truncate text-base font-black text-foreground">
                {category.name}
              </h4>
            </div>
          </div>
        </div>

        {/* Warning Callout Notice */}
        <div className="mx-6 mb-4 px-3 py-2 text-xs text-muted-foreground font-medium text-center">
          Any items currently assigned to this category will remain in your
          inventory, but will no longer be grouped under &ldquo;{category.name}
          &rdquo;.
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-border bg-surface px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="h-11 rounded-xl border border-border bg-card px-5 text-sm font-bold text-foreground transition hover:bg-muted active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 px-5 text-sm font-bold text-white shadow-sm transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                <span>Delete Category</span>
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
