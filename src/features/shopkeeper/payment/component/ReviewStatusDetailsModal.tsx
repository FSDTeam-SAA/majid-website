"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ExternalLink,
  Check,
  Link as LinkIcon,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { ScoreReview } from "../types/scoreReview.types";
import { updateReviewStatus } from "../api/scoreReview.api";
import { toast } from "sonner";

export interface ReviewStatusInvoice {
  _id?: string;
  createdAt?: string;
  customerInfo?: {
    firstName?: string;
    lastName?: string;
  };
  scoreReview?: ScoreReview;
  [key: string]: unknown;
}

interface ReviewStatusDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: ReviewStatusInvoice | null;
  shopkeeperDefaultGoogleReviewUrl?: string;
  onSuccess?: () => void;
}

interface ReviewStatusContentProps {
  invoice: ReviewStatusInvoice;
  shopkeeperDefaultGoogleReviewUrl: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const ReviewStatusContent: React.FC<ReviewStatusContentProps> = ({
  invoice,
  shopkeeperDefaultGoogleReviewUrl,
  onClose,
  onSuccess,
}) => {
  const scoreReview: ScoreReview = invoice.scoreReview || {
    status: "none",
    source: "Linked Google review",
    linkedBy: "Shopkeeper",
  };

  const currentReviewUrl =
    scoreReview.reviewUrl || shopkeeperDefaultGoogleReviewUrl || "";

  const [isEditing, setIsEditing] = useState(false);
  const [googleReviewUrl, setGoogleReviewUrl] = useState(currentReviewUrl);
  const [isLoading, setIsLoading] = useState(false);

  const isRecorded = scoreReview.status === "recorded";
  const customer = invoice.customerInfo;
  const customerName = customer
    ? `${customer.firstName || ""} ${customer.lastName || ""}`.trim()
    : "Walk-in Customer";

  const updatedDate = scoreReview.recordedAt
    ? new Date(scoreReview.recordedAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : invoice.createdAt
      ? new Date(invoice.createdAt).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })
      : "Not recorded yet";

  const handleSaveStatus = async (newStatus: "none" | "recorded") => {
    if (!invoice._id) return;
    setIsLoading(true);
    try {
      await updateReviewStatus(invoice._id, {
        status: newStatus,
        reviewUrl: newStatus === "recorded" ? googleReviewUrl : undefined,
        source: "Linked Google review",
        linkedBy: "Shopkeeper",
      });

      toast.success(
        newStatus === "recorded"
          ? "Review recorded successfully"
          : "Review marked as not recorded",
      );
      setIsEditing(false);
      onSuccess?.();
      onClose();
    } catch (error: unknown) {
      console.error(error);
      const message =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      toast.error(message || "Failed to update review status");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DialogHeader className="pb-3 border-b border-border/60">
        <DialogTitle className="text-base font-bold text-foreground">
          Review status details
        </DialogTitle>
      </DialogHeader>

      <div className="py-3 space-y-3.5 text-xs">
        {/* Customer */}
        <div className="flex items-center justify-between py-1">
          <span className="text-muted-foreground font-semibold">Customer</span>
          <span className="font-bold text-foreground">{customerName}</span>
        </div>

        {/* Review status */}
        <div className="flex items-center justify-between py-1">
          <span className="text-muted-foreground font-semibold">
            Review status
          </span>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
              isRecorded
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-amber-50 text-amber-800 border-amber-200"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isRecorded ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
            {isRecorded ? "Review recorded" : "No review recorded"}
          </span>
        </div>

        {/* Source */}
        <div className="flex items-center justify-between py-1">
          <span className="text-muted-foreground font-semibold">Source</span>
          <span className="font-medium text-foreground">
            {scoreReview.source || "Linked Google review"}
          </span>
        </div>

        {/* Linked by */}
        <div className="flex items-center justify-between py-1">
          <span className="text-muted-foreground font-semibold">Linked by</span>
          <span className="font-medium text-foreground">
            {scoreReview.linkedBy || "Shopkeeper"}
          </span>
        </div>

        {/* Updated */}
        <div className="flex items-center justify-between py-1">
          <span className="text-muted-foreground font-semibold">Updated</span>
          <span className="font-medium text-foreground">{updatedDate}</span>
        </div>

        {/* View review link if recorded */}
        {isRecorded && currentReviewUrl && !isEditing && (
          <div className="pt-2">
            <a
              href={currentReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View review
            </a>
          </div>
        )}

        {/* Edit/Input Review URL */}
        {isEditing && (
          <div className="pt-2 space-y-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-border">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              Google Review URL:
            </label>
            <Input
              type="url"
              placeholder="https://g.page/r/your-review-link"
              value={googleReviewUrl}
              onChange={(e) => setGoogleReviewUrl(e.target.value)}
              className="h-8 text-xs rounded-lg"
            />
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs rounded-lg"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-7 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={isLoading}
                onClick={() => handleSaveStatus("recorded")}
              >
                {isLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                ) : (
                  <Check className="w-3 h-3 mr-1" />
                )}
                Confirm & Link
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Action Controls */}
      <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
        {!isEditing && (
          <>
            {isRecorded ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs rounded-xl"
                  onClick={() => setIsEditing(true)}
                >
                  <LinkIcon className="w-3.5 h-3.5 mr-1" />
                  Edit Review Link
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-8 text-xs rounded-xl"
                  disabled={isLoading}
                  onClick={() => handleSaveStatus("none")}
                >
                  {isLoading ? (
                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  ) : (
                    <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  )}
                  Unlink Review
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                className="w-full h-8 text-xs rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                onClick={() => setIsEditing(true)}
              >
                <LinkIcon className="w-3.5 h-3.5 mr-1" />
                Link & Record Google Review
              </Button>
            )}
          </>
        )}
      </div>
    </>
  );
};

export const ReviewStatusDetailsModal: React.FC<
  ReviewStatusDetailsModalProps
> = ({
  open,
  onOpenChange,
  invoice,
  shopkeeperDefaultGoogleReviewUrl = "",
  onSuccess,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-[24px] p-6 border-border shadow-xl hide-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {open && invoice && (
          <ReviewStatusContent
            key={invoice._id || "status-content"}
            invoice={invoice}
            shopkeeperDefaultGoogleReviewUrl={shopkeeperDefaultGoogleReviewUrl}
            onClose={() => onOpenChange(false)}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReviewStatusDetailsModal;
