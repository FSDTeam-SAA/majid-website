"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Smartphone,
  Banknote,
  CreditCard,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Info,
} from "lucide-react";

interface ConsentData {
  id: string;
  reference: string;
  secureToken: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  itemName: string;
  agreedValue: number;
  currency: string;
  paymentMethod: string;
  channel: string;
  status: "pending" | "verified" | "approved" | "declined" | "expired";
  shopName: string;
  expiresAt: string;
  verifiedAt?: string;
  approvedAt?: string;
  termsVersion: string;
  termsSnapshot?: {
    quickTermsUrl?: string;
    fullTermsUrl?: string;
    termsVersion?: string;
    privacyNoticeSummary?: string;
  };
}

export default function CustomerConsentPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [consent, setConsent] = useState<ConsentData | null>(null);

  // Step state: 1 = Enter Code (Step 02 in design), 2 = Review & Agree (Step 03 in design), 3 = Success
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Code input
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  // Declarations
  const [confirmAge18, setConfirmAge18] = useState(false);
  const [confirmOwnership, setConfirmOwnership] = useState(false);
  const [confirmTermsAgreed, setConfirmTermsAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const apiBase =
    process.env.NEXT_PUBLIC_API_URL || "https://api.imoscan.com/api/v1";

  useEffect(() => {
    if (!token) return;

    async function fetchConsent() {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${apiBase}/consent/public/${token}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Unable to load consent request");
        }

        const c: ConsentData = data.data;
        setConsent(c);

        if (c.status === "approved") {
          setStep(3);
        } else if (c.status === "verified") {
          setStep(2);
        } else {
          setStep(1);
        }
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Failed to load consent request";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    fetchConsent();
  }, [token, apiBase]);

  const handleDigitChange = (index: number, val: string) => {
    if (val.length > 1) {
      // Pasted full code
      const cleaned = val.replace(/\D/g, "").slice(0, 6);
      const newDigits = [...digits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = cleaned[i] || "";
      }
      setDigits(newDigits);
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = val.replace(/\D/g, "");
    setDigits(newDigits);

    // Auto-advance focus
    if (val && index < 5) {
      const nextInput = document.getElementById(`consent-digit-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      const prevInput = document.getElementById(`consent-digit-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyCode = async () => {
    const code = digits.join("");
    if (code.length !== 6) {
      setVerifyError("Please enter all 6 digits of your verification code.");
      return;
    }

    try {
      setVerifying(true);
      setVerifyError("");
      const res = await fetch(`${apiBase}/consent/verify/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Invalid verification code");
      }

      setStep(2);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Verification failed";
      setVerifyError(msg);
    } finally {
      setVerifying(false);
    }
  };

  const handleApprove = async () => {
    if (!confirmAge18 || !confirmOwnership || !confirmTermsAgreed) {
      setSubmitError("Please confirm all required declarations to agree.");
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError("");

      const res = await fetch(`${apiBase}/consent/approve/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmAge18,
          confirmOwnership,
          confirmTermsAgreed,
          deviceMetadata:
            typeof window !== "undefined"
              ? window.navigator.userAgent
              : "Browser",
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to record consent");
      }

      setStep(3);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to submit approval";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecline = async () => {
    if (!confirm("Are you sure you want to decline this transaction consent?"))
      return;
    try {
      await fetch(`${apiBase}/consent/decline/${token}`, {
        method: "POST",
      });
      alert("You have declined this transaction.");
      router.push("/");
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
        <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Loading consent request...</p>
      </div>
    );
  }

  if (error || !consent) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-xl">
          <div className="w-14 h-14 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold mb-2">
            Consent Request Expired or Invalid
          </h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            {error ||
              "This consent link is no longer valid or has already expired. Please contact the shop to request a fresh link and code."}
          </p>
          <Link
            href="/"
            className="inline-block bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold px-6 py-2.5 rounded-xl transition"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 text-white selection:bg-emerald-500/20 selection:text-emerald-400">
      {/* Container simulating mobile handset */}
      <div className="w-full max-w-[430px] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Top App / Browser Bar */}
        <div className="px-5 py-3.5 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-emerald-400 tracking-wider">
            imoscan.com
          </span>
          <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px] font-mono">
            {consent.reference}
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 flex flex-col">
          {/* Shop Header */}
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-slate-100">
              {consent.shopName}
            </h2>
            <p className="text-xs text-slate-400">Powered by imoscan</p>
          </div>

          {/* STEP 1: ENTER CODE (Step 02 in design diagram) */}
          {step === 1 && (
            <div className="flex-1 flex flex-col">
              <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                <ShieldCheck className="w-7 h-7" />
              </div>

              <h1 className="text-xl font-extrabold text-center mb-2">
                Enter your code
              </h1>
              <p className="text-xs text-slate-400 text-center mb-6 leading-relaxed">
                Enter the 6-digit code included in your email or the message
                from the shop.
              </p>

              {/* 6-box input */}
              <div className="flex justify-center gap-2 mb-6">
                {digits.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`consent-digit-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-11 h-13 text-center text-xl font-bold bg-slate-950 border border-slate-700 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition text-emerald-400"
                  />
                ))}
              </div>

              {verifyError && (
                <div className="mb-4 text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
                  {verifyError}
                </div>
              )}

              <button
                type="button"
                onClick={handleVerifyCode}
                disabled={verifying || digits.join("").length !== 6}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold py-3.5 rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 text-sm mb-4"
              >
                {verifying ? "Verifying..." : "Verify & continue"}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center mt-auto pt-4">
                <p className="text-xs text-slate-400">
                  Need a new code?{" "}
                  <span className="text-emerald-400 font-semibold">
                    Contact the shop.
                  </span>
                </p>
                <p className="text-[11px] text-slate-400 mt-2">
                  Opening the link does not approve the transaction.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: REVIEW & AGREE (Step 03 in design diagram) */}
          {step === 2 && (
            <div className="flex-1 flex flex-col">
              <h1 className="text-xl font-extrabold text-center mb-1">
                Your sale or trade-in
              </h1>
              <p className="text-xs text-slate-400 text-center mb-5">
                Review the details and terms before you agree.
              </p>

              {/* Transaction Summary Table */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 mb-4 text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-slate-400" />
                    Item
                  </span>
                  <span className="font-bold text-slate-200">
                    {consent.itemName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-slate-400" />
                    Agreed value
                  </span>
                  <span className="font-bold text-emerald-400">
                    {consent.currency} {consent.agreedValue.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-slate-400" />
                    Payment
                  </span>
                  <span className="font-bold text-slate-200">
                    {consent.paymentMethod}
                  </span>
                </div>
              </div>

              {/* Terms Links */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <Link
                  href="/terms-conditions"
                  target="_blank"
                  className="bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl p-2.5 text-center text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5 transition"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  Quick Terms
                </Link>
                <Link
                  href="/terms-conditions"
                  target="_blank"
                  className="bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl p-2.5 text-center text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5 transition"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  Full Terms
                </Link>
              </div>

              {/* Explicit Checkboxes */}
              <div className="space-y-3 mb-4 text-xs">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={confirmAge18}
                    onChange={(e) => setConfirmAge18(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-slate-300 leading-tight">
                    I confirm I am aged 18 or over.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={confirmOwnership}
                    onChange={(e) => setConfirmOwnership(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-slate-300 leading-tight">
                    I own this device, have the right to sell it and am selling
                    or trading it in voluntarily.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={confirmTermsAgreed}
                    onChange={(e) => setConfirmTermsAgreed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-slate-300 leading-tight">
                    I agree to the transaction details above and the Terms &
                    Conditions.
                  </span>
                </label>
              </div>

              {/* Privacy Notice Box */}
              <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3 text-[11px] text-emerald-300 mb-5 leading-relaxed flex items-start gap-2">
                <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  We collect your ID image, contact details and device details
                  for this transaction. Your original ID image is deleted within
                  28 days.
                  <div className="mt-1">
                    <Link
                      href="/privacy-policy"
                      target="_blank"
                      className="underline font-semibold hover:text-emerald-200"
                    >
                      Privacy Notice
                    </Link>
                  </div>
                </div>
              </div>

              {submitError && (
                <div className="mb-4 text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
                  {submitError}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 mt-auto">
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={
                    submitting ||
                    !confirmAge18 ||
                    !confirmOwnership ||
                    !confirmTermsAgreed
                  }
                  className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold py-3.5 rounded-xl transition shadow-lg shadow-emerald-500/20 text-sm"
                >
                  {submitting ? "Recording consent..." : "Agree & confirm"}
                </button>

                <button
                  type="button"
                  onClick={handleDecline}
                  className="w-full bg-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-semibold py-2.5 rounded-xl transition text-xs"
                >
                  Decline
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS (Consent Recorded) */}
          {step === 3 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-4 border border-emerald-500/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-100 mb-2">
                Consent Recorded
              </h2>
              <p className="text-xs text-slate-400 max-w-xs mb-6 leading-relaxed">
                Thank you, <strong>{consent.customerName}</strong>. Your consent
                has been recorded and the shop has been notified.
              </p>

              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 w-full text-xs text-left space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-slate-400">Reference:</span>
                  <span className="font-mono font-bold text-slate-200">
                    {consent.reference}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="font-bold text-emerald-400 uppercase">
                    Approved
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ID Image Retention:</span>
                  <span className="text-slate-300">Deleted in 28 days</span>
                </div>
              </div>

              <div className="bg-emerald-950/30 border border-emerald-500/20 text-emerald-300 text-xs px-4 py-3 rounded-xl w-full">
                The shopkeeper can now scan your handset and capture your ID to
                finalize this trade-in.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
