"use client";

import React, { Suspense, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  RyftProvider,
  CardForm,
  type RyftCardFormInstance,
} from "@ryftpay/react";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ShieldCheck,
  Lock,
  CreditCard,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

function CheckoutCardForm({
  clientSecret,
  amount,
  currency = "EUR",
}: {
  clientSecret: string;
  amount?: number;
  currency?: string;
}) {
  const cardFormRef = useRef<RyftCardFormInstance>(null);
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formattedAmount = amount
    ? new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currency.toUpperCase(),
      }).format(amount)
    : "";

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
        router.push("/payment/success");
      } else if (status === "failed") {
        const message =
          result?.lastPaymentError?.message ||
          "Payment was declined. Please try another card.";
        setErrorMessage(message);
        toast.error(message);
      } else {
        toast.success("Payment submitted!");
        router.push("/payment/success");
      }
    } catch (err: unknown) {
      console.error("Ryft checkout error:", err);
      const errorObj = err as {
        message?: string;
        response?: { data?: { message?: string } };
      };
      const message =
        errorObj?.message ||
        errorObj?.response?.data?.message ||
        "An error occurred while processing your payment.";
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handlePay} className="space-y-6">
      <div className="rounded-2xl border border-border/80 bg-muted/30 p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Credit / Debit Card
            </span>
          </div>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <Lock className="h-3 w-3" /> Secure Checkout
          </span>
        </div>

        <div className="min-h-[130px] rounded-xl bg-background p-3 shadow-inner">
          <CardForm ref={cardFormRef} />
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs font-medium text-destructive">
          {errorMessage}
        </div>
      )}

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
          `Pay ${formattedAmount}`.trim() || "Complete Payment"
        )}
      </Button>

      <div className="flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
        <ShieldCheck className="h-4 w-4 text-emerald-500" />
        <span>
          Secured by <strong>RyftPay</strong>. PCI-DSS Level 1 Compliant.
        </span>
      </div>
    </form>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const clientSecret = searchParams.get("clientSecret") || "";
  const amountStr = searchParams.get("amount");
  const currency = searchParams.get("currency") || "EUR";
  const amount = amountStr ? parseFloat(amountStr) : undefined;
  const publicKey =
    process.env.NEXT_PUBLIC_RYFT_PUBLIC_KEY || "pk_test_replace_me";

  if (!clientSecret) {
    return (
      <div className="w-full max-w-md rounded-[32px] border border-border bg-card p-8 text-center shadow-xl">
        <h2 className="text-xl font-bold text-foreground">
          Invalid Payment Session
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          No payment session was found. Please return to the pricing page to try
          again.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg rounded-[32px] border border-border/80 bg-card p-8 shadow-2xl sm:p-10">
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-black tracking-tight text-foreground">
          Complete Your Order
        </h1>
        <p className="text-sm font-medium text-muted-foreground">
          Enter your payment details securely via RyftPay.
        </p>
      </div>

      <RyftProvider publicKey={publicKey} clientSecret={clientSecret}>
        <CheckoutCardForm
          clientSecret={clientSecret}
          amount={amount}
          currency={currency}
        />
      </RyftProvider>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface p-6">
      <Suspense
        fallback={
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading checkout...
          </div>
        }
      >
        <CheckoutContent />
      </Suspense>
    </main>
  );
}
