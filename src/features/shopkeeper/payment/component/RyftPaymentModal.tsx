"use client";

import React, { useRef, useState } from "react";
import {
  RyftProvider,
  CardForm,
  type RyftCardFormInstance,
} from "@ryftpay/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, Lock, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface RyftPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientSecret: string;
  publicKey?: string;
  amount: number;
  currency?: string;
  title?: string;
  description?: string;
  onSuccess?: (result?: unknown) => void;
}

function RyftCardPaymentInner({
  amount,
  currency = "EUR",
  clientSecret,
  onClose,
  onSuccess,
}: {
  amount: number;
  currency?: string;
  clientSecret: string;
  onClose: () => void;
  onSuccess?: (result?: unknown) => void;
}) {
  const cardFormRef = useRef<RyftCardFormInstance>(null);
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formattedAmount = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;

    if (!cardFormRef.current) {
      toast.error(
        "Payment form is not ready yet. Please try again in a moment.",
      );
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const result = (await cardFormRef.current.attemptPayment({
        clientSecret,
      })) as {
        status?: string;
        lastPaymentError?: { message?: string };
      };

      const status = String(result?.status || "").toLowerCase();

      if (
        status === "captured" ||
        status === "approved" ||
        status === "pendingpayment" ||
        status === "succeeded"
      ) {
        toast.success("Payment completed successfully!");
        if (onSuccess) {
          onSuccess(result);
        } else {
          router.push("/payment/success");
        }
        onClose();
      } else if (status === "failed") {
        const message =
          result?.lastPaymentError?.message ||
          "Payment was declined. Please try another card.";
        setErrorMessage(message);
        toast.error(message);
      } else {
        toast.success("Payment submitted!");
        if (onSuccess) {
          onSuccess(result);
        } else {
          router.push("/payment/success");
        }
        onClose();
      }
    } catch (err: unknown) {
      console.error("Ryft payment error:", err);
      const errorObj = err as {
        message?: string;
        response?: { data?: { message?: string } };
      };
      const message =
        errorObj?.message ||
        errorObj?.response?.data?.message ||
        "An error occurred while processing your card. Please try again.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handlePay} className="space-y-5">
      <div className="rounded-2xl border border-border/80 bg-muted/30 p-4 transition-all hover:bg-muted/40">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Card Details
            </span>
          </div>
          <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <Lock className="h-3 w-3" /> 256-Bit Encrypted
          </span>
        </div>

        <div className="min-h-[120px] rounded-xl bg-background p-3 shadow-inner">
          <CardForm ref={cardFormRef} />
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs font-medium text-destructive">
          {errorMessage}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <Button
          type="submit"
          disabled={isProcessing}
          className="h-12 w-full rounded-2xl bg-primary text-base font-bold text-primary-foreground shadow-lg transition-all hover:opacity-90 disabled:opacity-50"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing Payment...
            </span>
          ) : (
            `Pay ${formattedAmount}`
          )}
        </Button>

        <div className="flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>
            Powered by <strong>RyftPay</strong>. PCI-DSS Level 1 Compliant.
          </span>
        </div>
      </div>
    </form>
  );
}

export function RyftPaymentModal({
  isOpen,
  onClose,
  clientSecret,
  publicKey,
  amount,
  currency = "EUR",
  title = "Complete Payment",
  description = "Enter your card information below to complete your payment.",
  onSuccess,
}: RyftPaymentModalProps) {
  const activePublicKey =
    publicKey ||
    process.env.NEXT_PUBLIC_RYFT_PUBLIC_KEY ||
    "pk_test_replace_me";

  if (!isOpen || !clientSecret) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-[28px] border border-border/80 bg-background p-6 shadow-2xl sm:p-8">
        <DialogHeader className="space-y-1 text-left">
          <DialogTitle className="text-2xl font-black tracking-tight text-foreground">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <RyftProvider publicKey={activePublicKey} clientSecret={clientSecret}>
            <RyftCardPaymentInner
              amount={amount}
              currency={currency}
              clientSecret={clientSecret}
              onClose={onClose}
              onSuccess={onSuccess}
            />
          </RyftProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default RyftPaymentModal;
