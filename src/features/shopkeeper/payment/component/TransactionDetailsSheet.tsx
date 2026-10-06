"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  Banknote,
  RotateCcw,
  Download,
  Calendar,
  User,
  Phone,
  Mail,
  Receipt,
  ShieldCheck,
} from "lucide-react";
import ScorePlusButton from "./ScorePlusButton";
import ScoreReviewStatusBadge from "./ScoreReviewStatusBadge";
import { ScoreReview } from "../types/scoreReview.types";
import { useCurrency } from "@/hooks/useCurrency";

export interface SheetInvoiceItem {
  _id?: string;
  itemId?: {
    itemName?: string;
    expectedPrice?: number;
  };
  quantity?: number;
}

export interface SheetInvoice {
  _id?: string;
  invoiceNumber?: string;
  type?: string;
  totalAmount?: number;
  totalDue?: number;
  amountPaid?: number;
  tax?: number;
  currency?: string;
  paymentMethod?: string;
  paymentType?: string;
  cashierName?: string;
  paymentDetails?: {
    cardLastFour?: string;
    transactionReference?: string;
  };
  createdAt?: string;
  customerInfo?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  scoreReview?: ScoreReview;
  lineItems?: SheetInvoiceItem[];
  [key: string]: unknown;
}

export interface SheetShopkeeper {
  shopName?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  googleReviewPageUrl?: string;
  [key: string]: unknown;
}

interface TransactionDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: SheetInvoice | null;
  shopkeeper: SheetShopkeeper | null;
  onOpenSendReview: (invoice: SheetInvoice) => void;
  onOpenReviewStatusDetails: (invoice: SheetInvoice) => void;
  onProcessRefund: (invoice: SheetInvoice) => void;
  onGenerateReceipt: (invoice: SheetInvoice) => void;
}

export const TransactionDetailsSheet: React.FC<
  TransactionDetailsSheetProps
> = ({
  open,
  onOpenChange,
  invoice,
  shopkeeper,
  onOpenSendReview,
  onOpenReviewStatusDetails,
  onProcessRefund,
  onGenerateReceipt,
}) => {
  const { formatCurrency, currency } = useCurrency();

  if (!invoice) return null;

  const customer = invoice.customerInfo;
  const customerName = customer
    ? `${customer.firstName || ""} ${customer.lastName || ""}`.trim()
    : "Walk-in";

  const isPurchase =
    String(invoice.type || "")
      .trim()
      .toLowerCase() === "purchase invoice" ||
    String(invoice.type || "")
      .trim()
      .toLowerCase() === "purchase";

  const invoiceNumber =
    invoice.invoiceNumber || `#INV-${invoice._id?.slice(-8).toUpperCase()}`;

  const formattedDate = invoice.createdAt
    ? new Date(invoice.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "N/A";

  const paymentMethod = String(
    invoice.paymentMethod || invoice.paymentType || "cash",
  );
  const servedByName =
    String(invoice.cashierName || "") ||
    (shopkeeper
      ? `${shopkeeper.firstName || ""} ${shopkeeper.lastName || ""}`.trim()
      : "") ||
    String(shopkeeper?.name || "") ||
    "Shopkeeper";

  const scoreReview = invoice.scoreReview || { status: "none" };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl overflow-y-auto p-0 border-l border-border bg-card shadow-2xl flex flex-col hide-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {/* Header */}
        <SheetHeader className="p-6 pb-4 border-b border-border/60 bg-surface/40">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <SheetTitle className="text-xl font-black tracking-tight text-foreground">
                Transaction Details
              </SheetTitle>
              <p className="text-xs font-semibold text-muted-foreground font-mono">
                {invoiceNumber} · {formattedDate}
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* Content */}
        <div className="flex-1 p-6 space-y-6">
          {/* Main 2-Column Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-border bg-surface/30 p-4">
            {/* Left Column */}
            <div className="space-y-3">
              <div>
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Invoice Ref
                </span>
                <span className="text-xs font-bold text-foreground font-mono">
                  {invoiceNumber}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Date & time
                </span>
                <span className="text-xs font-medium text-foreground flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {formattedDate}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Customer
                </span>
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5 mt-0.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {customerName}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Phone
                </span>
                <span className="text-xs font-medium text-foreground flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {customer?.phone || "Not recorded yet"}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Email
                </span>
                <span className="text-xs font-medium text-foreground flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {customer?.email || "Not recorded yet"}
                </span>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              <div>
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Payment Method
                </span>
                <span className="text-xs font-bold text-foreground capitalize flex items-center gap-1.5 mt-0.5">
                  {paymentMethod.toLowerCase().includes("card") ? (
                    <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
                  ) : (
                    <Banknote className="w-3.5 h-3.5 text-emerald-500" />
                  )}
                  {paymentMethod}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Card / Details
                </span>
                <span className="text-xs font-medium text-foreground">
                  {invoice.paymentDetails?.cardLastFour
                    ? `•••• ${invoice.paymentDetails.cardLastFour}`
                    : paymentMethod.toLowerCase().includes("cash")
                      ? "Cash payment"
                      : "Direct settlement"}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Authorisation
                </span>
                <span className="text-xs font-medium text-foreground flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  {invoice.paymentDetails?.transactionReference || "Authorised"}
                </span>
              </div>

              {/* Served by */}
              <div>
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Served by
                </span>
                <span className="text-xs font-bold text-foreground">
                  {servedByName}
                </span>
              </div>

              {/* DIRECTLY UNDER 'SERVED BY': SCORE+ COMPACT REVIEW CONTROL (Per Image 2) */}
              <div className="pt-2 border-t border-border/60">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Score+ Review
                </span>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ScorePlusButton
                      onClick={() => onOpenSendReview(invoice)}
                    />
                  </div>
                  <ScoreReviewStatusBadge
                    status={scoreReview.status}
                    reviewUrl={
                      scoreReview.reviewUrl || shopkeeper?.googleReviewPageUrl
                    }
                    onClickBadge={() => onOpenReviewStatusDetails(invoice)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Items breakdown if present */}
          {invoice.lineItems && invoice.lineItems.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Line Items
              </h4>
              <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
                {invoice.lineItems.map(
                  (item: SheetInvoiceItem, idx: number) => (
                    <div
                      key={item._id || idx}
                      className="p-3 text-xs flex items-center justify-between bg-card"
                    >
                      <div>
                        <p className="font-bold text-foreground">
                          {item.itemId?.itemName || "Item"}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Qty: {item.quantity || 1}
                        </p>
                      </div>
                      <span className="font-bold text-foreground">
                        {formatCurrency(
                          Number(item.itemId?.expectedPrice || 0) *
                            Number(item.quantity || 1),
                          invoice.currency || currency,
                        )}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}

          {/* Totals Summary */}
          <div className="rounded-2xl border border-border bg-surface/50 p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Subtotal:</span>
              <span>
                {formatCurrency(
                  Number(invoice.totalAmount || 0),
                  invoice.currency || currency,
                )}
              </span>
            </div>
            {Number(invoice.tax || 0) > 0 && (
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Tax:</span>
                <span>
                  {formatCurrency(
                    Number(invoice.tax || 0),
                    invoice.currency || currency,
                  )}
                </span>
              </div>
            )}
            <div className="pt-2 border-t border-border flex items-center justify-between font-black text-sm text-foreground">
              <span>Total Amount:</span>
              <span
                className={isPurchase ? "text-rose-600" : "text-emerald-600"}
              >
                {isPurchase ? "-" : "+"}
                {formatCurrency(
                  Number(invoice.totalAmount || invoice.amountPaid || 0),
                  invoice.currency || currency,
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-border/60 bg-surface/30 flex items-center justify-between gap-3">
          <Button
            size="sm"
            variant="destructive"
            className="h-9 px-3 text-xs font-bold rounded-xl flex items-center gap-1.5"
            onClick={() => {
              onOpenChange(false);
              onProcessRefund(invoice);
            }}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Process Refund
          </Button>

          <Button
            size="sm"
            className="h-9 px-4 text-xs font-bold rounded-xl flex items-center gap-1.5 bg-primary text-primary-foreground shadow-sm"
            onClick={() => {
              onOpenChange(false);
              onGenerateReceipt(invoice);
            }}
          >
            <Download className="w-3.5 h-3.5" />
            New Receipt
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TransactionDetailsSheet;
