"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  CreditCard,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Percent,
  Landmark,
  ShieldCheck,
  Zap,
  Info,
  Copy,
  Check,
  Key,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useRyftConnectStatus,
  useCreateRyftOnboardingLink,
  useSaveRyftAccount,
} from "@/features/shopkeeper/payment/hooks/useRyftConnect";

export default function PaymentSetupCard() {
  const searchParams = useSearchParams();
  const { data: statusData, refetch, isFetching } = useRyftConnectStatus();
  const { mutate: createOnboardingLink, isPending: isOnboardingLoading } =
    useCreateRyftOnboardingLink();
  const { mutate: saveAccount, isPending: isSavingAccount } =
    useSaveRyftAccount();

  const [copied, setCopied] = useState(false);
  const [manualAccountId, setManualAccountId] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);

  const connectInfo = statusData?.data;
  const isOnboarded = Boolean(connectInfo?.isOnboarded);
  const accountId = connectInfo?.accountId || "";
  const status = connectInfo?.status || "not_created";
  const payoutsEnabled = Boolean(connectInfo?.payoutsEnabled);
  const platformFeePercentage = connectInfo?.platformFeePercentage ?? 2;
  const isSandbox = Boolean(connectInfo?.isSandbox);
  const accountCurrency = connectInfo?.accountCurrency || "GBP";

  // Check URL params upon returning from Ryft hosted onboarding
  useEffect(() => {
    const urlAccount =
      searchParams.get("account") || searchParams.get("accountId");
    const urlStatus = searchParams.get("status");

    if (urlAccount && urlAccount !== accountId) {
      saveAccount(
        { accountId: urlAccount, status: "pending" },
        {
          onSuccess: () => {
            toast.success("Ryft account connected successfully!");
            refetch();
          },
        },
      );
    } else if (urlStatus === "onboard_complete" || urlStatus === "success") {
      toast.success("Returned from Ryft onboarding. Checking status...");
      refetch();
    }
  }, [searchParams, accountId, saveAccount, refetch]);

  const handleStartOnboarding = () => {
    const redirectUrl = `${window.location.origin}/shopkeeper/settings/payment-setup?status=onboard_complete`;

    createOnboardingLink(
      { redirectUrl },
      {
        onSuccess: (res) => {
          const url = res?.data?.url;
          if (url) {
            toast.info("Redirecting to RyftPay secure onboarding portal...");
            window.location.href = url;
          } else {
            toast.success("Onboarding session generated!");
            refetch();
          }
        },
        onError: (err: unknown) => {
          const errorObj = err as {
            message?: string;
            response?: { data?: { message?: string } };
          };
          const msg =
            errorObj?.response?.data?.message ||
            errorObj?.message ||
            "Failed to start Ryft onboarding";
          toast.error(msg);
        },
      },
    );
  };

  const handleManualSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualAccountId.trim()) {
      toast.error("Please enter a valid Ryft Account ID");
      return;
    }

    saveAccount(
      { accountId: manualAccountId.trim() },
      {
        onSuccess: () => {
          toast.success("Account ID saved and verified");
          setManualAccountId("");
          setShowManualInput(false);
          refetch();
        },
        onError: (err: unknown) => {
          const errorObj = err as {
            message?: string;
            response?: { data?: { message?: string } };
          };
          toast.error(
            errorObj?.response?.data?.message ||
              errorObj?.message ||
              "Failed to save account",
          );
        },
      },
    );
  };

  const handleCopyId = () => {
    if (!accountId) return;
    navigator.clipboard.writeText(accountId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 p-8 text-white shadow-2xl border border-white/10"
      >
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#84CC16]/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl bg-[#84CC16]/20 px-3 py-1 text-xs font-black uppercase tracking-wider text-[#84CC16] border border-[#84CC16]/30">
                <Zap className="h-3.5 w-3.5" />
                <span>Split-Payment Model</span>
              </div>

              {isSandbox && (
                <span className="rounded-xl bg-amber-500/20 px-3 py-1 text-xs font-black uppercase tracking-wider text-amber-300 border border-amber-500/30">
                  Sandbox Testing
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              RyftPay Connected Account & Payouts
            </h1>
            <p className="max-w-2xl text-sm font-medium text-slate-300">
              Receive customer payments directly into your bank account.
              Payments route straight to your connected account with an agreed{" "}
              <strong className="text-[#84CC16] font-black">
                {platformFeePercentage}%
              </strong>{" "}
              platform charge.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="rounded-2xl border-white/20 bg-white/5 text-white hover:bg-white/15 hover:text-white backdrop-blur-sm cursor-pointer"
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin text-[#84CC16]" : ""}`}
              />
              Refresh Status
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Split Payment Rate Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-[28px] border border-border bg-card p-6 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Shopkeeper Payout
            </span>
            <div className="rounded-xl bg-[#84CC16]/10 p-2 text-[#84CC16]">
              <Landmark className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black tracking-tight text-foreground">
              {100 - platformFeePercentage}%
            </span>
            <p className="mt-1 text-xs text-muted-foreground">
              Direct transfer to your sub-account
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-[28px] border border-border bg-card p-6 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Platform Charge
            </span>
            <div className="rounded-xl bg-blue-500/10 p-2 text-blue-500">
              <Percent className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-black tracking-tight text-foreground">
              {platformFeePercentage}%
            </span>
            <p className="mt-1 text-xs text-muted-foreground">
              Automatic fee deducted per transaction
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-[28px] border border-border bg-card p-6 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Account Status
            </span>
            <div
              className={`rounded-xl p-2 ${
                isOnboarded
                  ? "bg-emerald-500/10 text-emerald-500"
                  : accountId
                    ? "bg-amber-500/10 text-amber-500"
                    : "bg-slate-500/10 text-slate-500"
              }`}
            >
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <span
                className={`inline-block h-2.5 w-2.5 rounded-full ${
                  isOnboarded
                    ? "bg-emerald-500"
                    : accountId
                      ? "bg-amber-500"
                      : "bg-slate-400"
                }`}
              />
              <span className="text-xl font-black uppercase tracking-tight text-foreground">
                {isOnboarded
                  ? "Connected"
                  : accountId
                    ? "Pending Verification"
                    : "Not Connected"}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Currency: <strong>{accountCurrency}</strong>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Main Connection & Onboarding Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-[32px] border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-foreground tracking-tight">
              Payment Provider Onboarding (RyftPay)
            </h2>
            <p className="text-sm text-muted-foreground">
              All payment compliance, KYC verification, and merchant payouts are
              managed securely by Ryft.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleStartOnboarding}
              disabled={isOnboardingLoading}
              className="rounded-2xl bg-[#84CC16] hover:bg-[#76b813] text-white font-bold px-6 py-6 shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              {isOnboardingLoading ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="mr-2 h-4 w-4" />
              )}
              {isOnboarded
                ? "Manage Ryft Account"
                : accountId
                  ? "Continue Onboarding in Ryft"
                  : "Start Ryft Onboarding"}
            </Button>
          </div>
        </div>

        {/* Account Details & Status Checklist */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Account Details */}
          <div className="space-y-4 rounded-2xl bg-muted/40 p-5 border border-border/70">
            <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Connected Sub-Account Information
            </h3>

            <div className="space-y-3 pt-1">
              <div>
                <span className="text-[11px] font-bold uppercase text-muted-foreground">
                  Sub-Account ID:
                </span>
                {accountId ? (
                  <div className="mt-1 flex items-center justify-between rounded-xl bg-background px-3.5 py-2.5 border border-border">
                    <span className="font-mono text-sm font-bold text-foreground">
                      {accountId}
                    </span>
                    <button
                      onClick={handleCopyId}
                      className="p-1 hover:text-primary transition cursor-pointer"
                      title="Copy Account ID"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                ) : (
                  <p className="mt-1 text-sm font-semibold text-muted-foreground italic">
                    No sub-account connected yet. Click &quot;Start Ryft
                    Onboarding&quot; above to setup.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="rounded-xl bg-background p-3 border border-border">
                  <span className="text-[10px] font-black uppercase text-muted-foreground">
                    Payouts
                  </span>
                  <p
                    className={`text-sm font-black mt-0.5 ${
                      payoutsEnabled ? "text-emerald-500" : "text-amber-500"
                    }`}
                  >
                    {payoutsEnabled ? "Enabled" : "Pending Approval"}
                  </p>
                </div>

                <div className="rounded-xl bg-background p-3 border border-border">
                  <span className="text-[10px] font-black uppercase text-muted-foreground">
                    Verification
                  </span>
                  <p className="text-sm font-black text-foreground uppercase mt-0.5">
                    {status}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Flow Breakdown */}
          <div className="space-y-4 rounded-2xl bg-muted/40 p-5 border border-border/70">
            <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              How Payments & Splits Work
            </h3>

            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#84CC16] shrink-0 mt-0.5" />
                <span>
                  <strong>Direct Routing:</strong> Customer payments are routed
                  straight to your registered Ryft sub-account rather than going
                  through the platform main account.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#84CC16] shrink-0 mt-0.5" />
                <span>
                  <strong>Automated 2% Split:</strong> Our platform
                  automatically receives 2% of the gross volume as platform fee,
                  while 98% is settled to your merchant balance.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#84CC16] shrink-0 mt-0.5" />
                <span>
                  <strong>PCI & KYC Compliant:</strong> Ryft handles bank
                  verification, identity checks, and automated payouts directly
                  to your nominated bank account.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Sandbox Helper / Manual Linker */}
        <div className="pt-2">
          <button
            onClick={() => setShowManualInput((prev) => !prev)}
            className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition cursor-pointer"
          >
            <Key className="h-3.5 w-3.5" />
            {showManualInput
              ? "Hide manual account linker"
              : "Advanced: Link existing Ryft Sub-Account ID manually"}
          </button>

          {showManualInput && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              onSubmit={handleManualSave}
              className="mt-3 flex flex-col sm:flex-row gap-3 max-w-xl"
            >
              <Input
                placeholder="e.g. ac_3fe8398f..."
                value={manualAccountId}
                onChange={(e) => setManualAccountId(e.target.value)}
                className="font-mono text-xs rounded-xl"
              />
              <Button
                type="submit"
                size="sm"
                disabled={isSavingAccount || !manualAccountId.trim()}
                className="rounded-xl bg-primary text-primary-foreground font-bold shrink-0"
              >
                {isSavingAccount ? "Saving..." : "Save ID"}
              </Button>
            </motion.form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
