"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Send, Loader2, Mail, Globe } from "lucide-react";
import { sendReviewRequest } from "../api/scoreReview.api";
import { ScoreReview } from "../types/scoreReview.types";
import { toast } from "sonner";

export interface ReviewRequestInvoice {
  _id?: string;
  invoiceNumber?: string;
  customerInfo?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  scoreReview?: ScoreReview;
  [key: string]: unknown;
}

interface ReviewRequestPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: ReviewRequestInvoice | null;
  shopName?: string;
  shopkeeperGoogleReviewUrl?: string;
  onSuccess?: () => void;
}

interface ReviewRequestFormProps {
  invoice: ReviewRequestInvoice;
  shopName: string;
  shopkeeperGoogleReviewUrl: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const ReviewRequestForm: React.FC<ReviewRequestFormProps> = ({
  invoice,
  shopName,
  shopkeeperGoogleReviewUrl,
  onClose,
  onSuccess,
}) => {
  const customer = invoice.customerInfo;
  const scoreReview = invoice.scoreReview;
  const hasPreviouslySent = Boolean(scoreReview?.requestSentAt);

  const derivedName = customer
    ? `${customer.firstName || ""} ${customer.lastName || ""}`.trim()
    : "";

  const [recipientEmail, setRecipientEmail] = useState(
    customer?.email || scoreReview?.lastRecipientEmail || "",
  );
  const customerName = derivedName || "Valued Customer";
  const [googleReviewUrl, setGoogleReviewUrl] = useState(
    scoreReview?.reviewUrl || shopkeeperGoogleReviewUrl || "https://google.com",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [confirmResend, setConfirmResend] = useState(false);

  const handleSend = async () => {
    if (!invoice._id) return;
    const cleanEmail = recipientEmail.trim();
    if (!cleanEmail) {
      toast.error("Please enter a valid customer email address");
      return;
    }

    if (hasPreviouslySent && !confirmResend) {
      setConfirmResend(true);
      return;
    }

    setIsLoading(true);
    try {
      await sendReviewRequest(invoice._id, {
        email: cleanEmail,
        customerName: customerName.trim(),
        googleReviewUrl: googleReviewUrl.trim(),
      });

      toast.success(`Review request sent to ${cleanEmail}`);
      onSuccess?.();
      onClose();
    } catch (error: unknown) {
      console.error(error);
      const message =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      toast.error(message || "Failed to send review request");
    } finally {
      setIsLoading(false);
    }
  };

  const formattedLastSent = scoreReview?.requestSentAt
    ? new Date(scoreReview.requestSentAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <>
      <DialogHeader className="pb-3 border-b border-border/60">
        <div className="flex items-center justify-between">
          <DialogTitle className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
            <Send className="w-4 h-4 text-blue-600" />
            Score+ Review Request Preview
          </DialogTitle>
        </div>
        <p className="text-xs font-medium text-muted-foreground mt-1">
          Preview the email before sending. Sending a request will not mark the
          review as recorded.
        </p>
      </DialogHeader>

      {/* Duplicate Request Prevention Warning */}
      {hasPreviouslySent && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3 text-amber-900 dark:text-amber-200">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold">Duplicate Request Warning</p>
            <p className="text-amber-800/90 dark:text-amber-300/90 font-medium">
              A review request was already sent to this customer on{" "}
              <strong>{formattedLastSent}</strong> (Sent{" "}
              {scoreReview?.requestCount || 1} time(s)).
            </p>
            {confirmResend && (
              <p className="text-xs font-bold text-amber-900 dark:text-amber-100 pt-1">
                Click &apos;Send Request&apos; again to confirm sending a
                duplicate email.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Config Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 py-1">
        <div className="space-y-1.5">
          <Label className="text-xs font-bold flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-muted-foreground" />
            Recipient Email
          </Label>
          <Input
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            placeholder="customer@example.com"
            className="h-9 text-xs rounded-xl"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-muted-foreground" />
            Google Review URL
          </Label>
          <Input
            type="url"
            value={googleReviewUrl}
            onChange={(e) => setGoogleReviewUrl(e.target.value)}
            placeholder="https://g.page/r/your-review-url"
            className="h-9 text-xs rounded-xl"
          />
        </div>
      </div>

      {/* EMAIL PREVIEW CARD - Matching Exact User Specification */}
      <div className="mt-2 border border-slate-200 dark:border-slate-800 rounded-[22px] bg-slate-50/50 dark:bg-slate-900/50 p-4">
        <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center justify-between">
          <span>Email Preview</span>
          <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full font-bold">
            Subject: Your experience matters - {shopName}
          </span>
        </div>

        <div className="max-w-[420px] mx-auto bg-white dark:bg-slate-950 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-5">
          {/* Header */}
          <div className="text-center pb-4 border-b border-slate-100 dark:border-slate-800/80 flex flex-col items-center justify-center">
            <Image
              src="/images/score-plus.png"
              alt="score+"
              width={120}
              height={40}
              unoptimized
              className="h-10 w-auto object-contain mx-auto"
            />
            <span className="text-[11px] text-slate-500 font-medium mt-1.5">
              powered by imoscan
            </span>
          </div>

          {/* Content */}
          <div className="space-y-3.5 text-left">
            <div className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
              {shopName}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
              Your experience matters.
            </h2>

            <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
              Hi {customerName || "Ranbir"},
            </p>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              Thank you for choosing {shopName}. We hope you&apos;re happy with
              your visit.
            </p>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              How did we do? We&apos;d appreciate an honest review on Google.
              Your feedback helps us improve and helps other customers decide
              where to shop.
            </p>

            {/* Action Button */}
            <div className="py-2">
              <div
                className="w-full py-3 px-4 rounded-xl font-bold text-xs text-center text-slate-950 shadow-sm transition-all"
                style={{ backgroundColor: "#84CC16" }}
              >
                Share your experience on Google
              </div>
            </div>

            <div className="text-xs text-slate-700 dark:text-slate-300 space-y-0.5 pt-1">
              <p>Thank you for your time,</p>
              <p className="font-bold">The {shopName} team</p>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 text-center space-y-1 text-[10px] text-slate-400">
              <p>Sent through score+ by imoscan on behalf of {shopName}.</p>
              <p className="underline cursor-default">
                Unsubscribe from review requests.
              </p>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter className="pt-3 border-t border-border/60 flex items-center justify-between sm:justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          className="rounded-xl h-9 text-xs font-bold"
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button
          type="button"
          disabled={isLoading || !recipientEmail.trim()}
          onClick={handleSend}
          className={`rounded-xl h-9 px-5 text-xs font-bold shadow-sm ${
            hasPreviouslySent && confirmResend
              ? "bg-amber-600 hover:bg-amber-700 text-white"
              : "bg-primary hover:bg-primary/90 text-primary-foreground"
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
              Sending...
            </>
          ) : hasPreviouslySent && confirmResend ? (
            <>
              <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
              Confirm & Send Again
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5 mr-1.5" />
              Send Request
            </>
          )}
        </Button>
      </DialogFooter>
    </>
  );
};

export const ReviewRequestPreviewModal: React.FC<
  ReviewRequestPreviewModalProps
> = ({
  open,
  onOpenChange,
  invoice,
  shopName = "Mobile Kit Distribution",
  shopkeeperGoogleReviewUrl = "",
  onSuccess,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[92vh] overflow-y-auto hide-scrollbar rounded-[28px] p-6 border-border shadow-2xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {open && invoice && (
          <ReviewRequestForm
            key={invoice._id || "review-form"}
            invoice={invoice}
            shopName={shopName}
            shopkeeperGoogleReviewUrl={shopkeeperGoogleReviewUrl}
            onClose={() => onOpenChange(false)}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReviewRequestPreviewModal;
