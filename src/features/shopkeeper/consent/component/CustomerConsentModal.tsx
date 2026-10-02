"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ShieldCheck,
  Lock,
  FileText,
  CheckCircle2,
  Copy,
  Mail,
  MessageSquare,
  RefreshCw,
  ExternalLink,
  Info,
  Loader2,
  X,
  ArrowLeft,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { consentApi } from "../api/consent.api";
import {
  ConsentChannel,
  ConsentRecord,
  RequestConsentPayload,
} from "../types/consent.types";

interface CustomerConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApproved: (consent: ConsentRecord) => void;
  initialData: {
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    itemName: string;
    agreedValue: number;
    currency: string;
    paymentMethod: string;
    customerId?: string;
  };
}

export const CustomerConsentModal: React.FC<CustomerConsentModalProps> = ({
  isOpen,
  onClose,
  onApproved,
  initialData,
}) => {
  // Steps: 1 = Send Request, 2 = Verify Code, 3 = Review & Agree, 4 = Approved
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Channel
  const [channel, setChannel] = useState<ConsentChannel>(() => {
    if (initialData.customerEmail?.trim()) return "email";
    if (initialData.customerPhone?.trim()) return "sms";
    return "email";
  });

  const [agreedToNotice, setAgreedToNotice] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [activeConsent, setActiveConsent] = useState<ConsentRecord | null>(
    null,
  );

  // Step 2: Code Verification
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [isPollingStatus, setIsPollingStatus] = useState(false);

  // Step 3: Declarations
  const [confirmAge18, setConfirmAge18] = useState(false);
  const [confirmOwnership, setConfirmOwnership] = useState(false);
  const [confirmTermsAgreed, setConfirmTermsAgreed] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [approveError, setApproveError] = useState("");
  const [showQuickTerms, setShowQuickTerms] = useState(false);

  // Reset state when dialog opens
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setStep(1);
      setDigits(["", "", "", "", "", ""]);
      setVerifyError("");
      setAgreedToNotice(false);
      setConfirmAge18(false);
      setConfirmOwnership(false);
      setConfirmTermsAgreed(false);
      setApproveError("");
      if (initialData.customerEmail?.trim()) {
        setChannel("email");
      } else if (initialData.customerPhone?.trim()) {
        setChannel("sms");
      }
    }
  }

  // Digits input handling
  const handleDigitChange = (index: number, val: string) => {
    if (val.length > 1) {
      const cleaned = val.replace(/\D/g, "").slice(0, 6);
      const newDigits = [...digits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = cleaned[i] || "";
      }
      setDigits(newDigits);
      if (cleaned.length === 6) {
        verifyCustomerCode(cleaned);
      }
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = val.replace(/\D/g, "");
    setDigits(newDigits);
    setVerifyError("");

    if (val && index < 5) {
      const nextInput = document.getElementById(`consent-digit-${index + 1}`);
      nextInput?.focus();
    }

    // Auto verify if all 6 filled
    if (index === 5 && val) {
      const fullCode = newDigits.join("");
      if (fullCode.length === 6) {
        verifyCustomerCode(fullCode);
      }
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

  // 1. Send Link & Code via Email or SMS
  const handleSendConsent = async () => {
    if (!agreedToNotice || isSending) return;

    try {
      setIsSending(true);
      const payload: RequestConsentPayload = {
        customerName: initialData.customerName || "Customer",
        customerEmail: initialData.customerEmail?.trim(),
        customerPhone: initialData.customerPhone?.trim(),
        itemName: initialData.itemName || "Device",
        agreedValue: initialData.agreedValue || 0,
        currency: initialData.currency || "GBP",
        paymentMethod: initialData.paymentMethod || "Cash",
        channel,
        sendEmailNow: channel === "email",
        customerId: initialData.customerId,
      };

      const res = await consentApi.requestConsent(payload);
      setActiveConsent(res);
      toast.success(
        channel === "email"
          ? `Consent email sent to ${res.maskedDestination}`
          : `Consent request generated for ${res.maskedDestination}`,
      );
      setStep(2);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(
        error?.response?.data?.message || "Failed to dispatch consent request",
      );
    } finally {
      setIsSending(false);
    }
  };

  // 2. Copy Message Action
  const handleCopyMessage = async () => {
    if (!agreedToNotice || isCopying) return;

    try {
      setIsCopying(true);
      const payload: RequestConsentPayload = {
        customerName: initialData.customerName || "Customer",
        customerEmail: initialData.customerEmail?.trim(),
        customerPhone: initialData.customerPhone?.trim(),
        itemName: initialData.itemName || "Device",
        agreedValue: initialData.agreedValue || 0,
        currency: initialData.currency || "GBP",
        paymentMethod: initialData.paymentMethod || "Cash",
        channel: "copy",
        sendEmailNow: false,
        customerId: initialData.customerId,
      };

      const res = await consentApi.requestConsent(payload);
      setActiveConsent(res);

      const secureLink =
        res.secureLink ||
        `${window.location.origin}/customer/consent/${res.secureToken}`;
      const code = res.code || "";
      const copyText =
        res.copyMessage ||
        `Hi ${
          initialData.customerName || "Customer"
        }, please review your sale or trade-in with us.\n\nOpen: ${secureLink}\nYour code: ${code}\n\nEnter the code, read the terms and confirm if you agree.`;

      await navigator.clipboard.writeText(copyText);
      toast.success("Message with secure link & code copied to clipboard!");
      setStep(2);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(
        error?.response?.data?.message || "Failed to generate consent link",
      );
    } finally {
      setIsCopying(false);
    }
  };

  // 3. Verify Code
  const verifyCustomerCode = async (codeToVerify?: string) => {
    const code = codeToVerify || digits.join("");
    if (code.length !== 6 || isVerifying) {
      setVerifyError("Please enter all 6 digits of the verification code.");
      return;
    }

    const identifier =
      activeConsent?.consentId ||
      activeConsent?.secureToken ||
      activeConsent?.reference;

    if (!identifier) {
      setVerifyError("Consent request session missing. Please start again.");
      return;
    }

    try {
      setIsVerifying(true);
      setVerifyError("");
      const res = await consentApi.verifyCode(identifier, code);
      if (res?.verified) {
        toast.success("Identity verified successfully!");
        setStep(3);
      } else {
        setVerifyError("Invalid verification code. Please try again.");
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setVerifyError(
        error?.response?.data?.message ||
          "That code was not correct or has expired. Please resend a new one.",
      );
    } finally {
      setIsVerifying(false);
    }
  };

  // 4. Resend Code
  const handleResendCode = async () => {
    const identifier =
      activeConsent?.consentId ||
      activeConsent?.secureToken ||
      activeConsent?.reference;

    if (!identifier || isResending) return;

    try {
      setIsResending(true);
      const res = await consentApi.resendCode(identifier);
      toast.success(
        `New verification code sent to ${
          res.maskedDestination ||
          activeConsent?.maskedDestination ||
          "customer"
        }`,
      );
      setDigits(["", "", "", "", "", ""]);
      setVerifyError("");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || "Failed to resend code");
    } finally {
      setIsResending(false);
    }
  };

  // 5. Check Live Status (in case customer approves on mobile browser)
  const handleCheckStatus = async () => {
    const identifier =
      activeConsent?.consentId ||
      activeConsent?.secureToken ||
      activeConsent?.reference;

    if (!identifier || isPollingStatus) return;

    try {
      setIsPollingStatus(true);
      const res = await consentApi.getConsentStatus(identifier);
      if (res.status === "approved") {
        setActiveConsent(res);
        setStep(4);
        toast.success("Consent approved by customer on mobile!");
      } else if (res.status === "verified") {
        setActiveConsent(res);
        setStep(3);
        toast.info("Customer verified code. Ready to complete agreement.");
      } else {
        toast.info(`Current status: ${res.status}. Awaiting customer action.`);
      }
    } catch {
      toast.error("Unable to check status right now");
    } finally {
      setIsPollingStatus(false);
    }
  };

  // 6. Customer & Shopkeeper Approve Declarations
  const handleApproveConsent = async () => {
    if (!confirmAge18 || !confirmOwnership || !confirmTermsAgreed) {
      setApproveError("All 3 declarations must be checked to continue.");
      return;
    }

    const identifier =
      activeConsent?.consentId ||
      activeConsent?.secureToken ||
      activeConsent?.reference;

    if (!identifier || isApproving) return;

    try {
      setIsApproving(true);
      setApproveError("");
      const res = await consentApi.approveConsent(identifier, {
        confirmAge18: true,
        confirmOwnership: true,
        confirmTermsAgreed: true,
        deviceMetadata: `Web Portal (${
          typeof window !== "undefined" ? window.navigator.platform : "Desktop"
        })`,
      });

      const updatedRecord: ConsentRecord = {
        ...(activeConsent as ConsentRecord),
        status: "approved",
        reference: res.reference || activeConsent?.reference || "",
        approvedAt: res.approvedAt || new Date().toISOString(),
        idImageDeleteAfter: res.idImageDeleteAfter,
        allowsCapture: true,
      };

      setActiveConsent(updatedRecord);
      setStep(4);
      toast.success("Customer consent approved!");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setApproveError(
        error?.response?.data?.message || "Failed to approve consent",
      );
    } finally {
      setIsApproving(false);
    }
  };

  const handleFinish = () => {
    if (activeConsent) {
      onApproved(activeConsent);
    }
    onClose();
  };

  const formatCurrency = (amt: number) => {
    const sym =
      initialData.currency === "GBP"
        ? "£"
        : initialData.currency === "EUR"
          ? "€"
          : "$";
    return `${sym}${Number(amt || 0).toFixed(2)}`;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent
          className="max-w-lg p-0 overflow-hidden rounded-[28px] border border-border bg-card shadow-2xl transition-all"
          aria-describedby="consent-modal-description"
        >
          <div id="consent-modal-description" className="sr-only">
            Customer Consent Verification and Legal Agreement Workflow
          </div>

          {/* Modal Header */}
          <div className="relative px-6 pt-6 pb-4 border-b border-border bg-muted/30">
            <div className="flex items-center justify-between">
              {step > 1 && step < 4 ? (
                <button
                  type="button"
                  onClick={() =>
                    setStep((prev) =>
                      prev > 1 ? ((prev - 1) as 1 | 2 | 3 | 4) : 1,
                    )
                  }
                  className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
              ) : (
                <span className="text-xs font-bold uppercase tracking-wider text-[#84CC16]">
                  Step {step} of 4 • Customer Consent
                </span>
              )}

              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            {/* STEP 1: SEND REQUEST */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 mx-auto rounded-full bg-[#84CC16]/10 text-[#84CC16] flex items-center justify-center">
                    <ShieldCheck size={28} />
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-foreground">
                    Send Consent Request
                  </h2>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Create a secure link and 6-digit code for your customer to
                    review and authorize the transaction.
                  </p>
                </div>

                {/* Summary Card */}
                <div className="rounded-2xl border border-border bg-muted/40 p-4 space-y-2.5 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-border/50">
                    <span className="text-muted-foreground font-medium">
                      Customer:
                    </span>
                    <span className="font-bold text-foreground">
                      {initialData.customerName || "Customer"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-border/50">
                    <span className="text-muted-foreground font-medium">
                      Item:
                    </span>
                    <span className="font-bold text-foreground truncate max-w-[200px]">
                      {initialData.itemName || "Device"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-border/50">
                    <span className="text-muted-foreground font-medium">
                      Agreed Value:
                    </span>
                    <span className="font-black text-[#84CC16] text-sm">
                      {formatCurrency(initialData.agreedValue)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-muted-foreground font-medium">
                      Payment Method:
                    </span>
                    <span className="font-bold text-foreground">
                      {initialData.paymentMethod || "Cash"}
                    </span>
                  </div>
                </div>

                {/* Consent Notice agreement checkbox */}
                <div className="flex items-start gap-3 p-3.5 rounded-2xl border border-border bg-background">
                  <Checkbox
                    id="agreedToNotice"
                    checked={agreedToNotice}
                    onCheckedChange={(checked) =>
                      setAgreedToNotice(Boolean(checked))
                    }
                    className="mt-0.5"
                  />
                  <label
                    htmlFor="agreedToNotice"
                    className="text-xs font-semibold text-foreground leading-relaxed cursor-pointer select-none"
                  >
                    I confirm that the customer is aware of this transaction and
                    agrees to receive the verification link.
                  </label>
                </div>

                {/* Channel Tabs */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground block">
                    Send Link & 6-Digit Code By
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled={!initialData.customerEmail?.trim()}
                      onClick={() => setChannel("email")}
                      className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-bold transition-all ${
                        channel === "email"
                          ? "border-[#84CC16] bg-[#84CC16]/10 text-foreground ring-1 ring-[#84CC16]"
                          : "border-border bg-background hover:bg-muted text-muted-foreground disabled:opacity-40"
                      }`}
                    >
                      <Mail
                        size={16}
                        className={channel === "email" ? "text-[#84CC16]" : ""}
                      />
                      Email {initialData.customerEmail ? "" : "(None)"}
                    </button>

                    <button
                      type="button"
                      disabled={!initialData.customerPhone?.trim()}
                      onClick={() => setChannel("sms")}
                      className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-bold transition-all ${
                        channel === "sms"
                          ? "border-[#84CC16] bg-[#84CC16]/10 text-foreground ring-1 ring-[#84CC16]"
                          : "border-border bg-background hover:bg-muted text-muted-foreground disabled:opacity-40"
                      }`}
                    >
                      <MessageSquare
                        size={16}
                        className={channel === "sms" ? "text-[#84CC16]" : ""}
                      />
                      SMS / Text {initialData.customerPhone ? "" : "(None)"}
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-2">
                  <Button
                    type="button"
                    disabled={!agreedToNotice || isSending}
                    onClick={handleSendConsent}
                    className="w-full h-12 rounded-2xl bg-[#84CC16] hover:bg-[#84CC16]/90 text-black font-black text-sm shadow-md"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Dispatching Request...
                      </>
                    ) : (
                      `Send ${channel === "sms" ? "SMS" : "Email"}`
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={!agreedToNotice || isCopying}
                    onClick={handleCopyMessage}
                    className="w-full h-12 rounded-2xl border-primary text-foreground font-bold text-xs gap-2"
                  >
                    {isCopying ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Copy size={16} />
                    )}
                    Copy message with Link & Code
                  </Button>

                  <p className="text-[11px] text-center text-muted-foreground">
                    Copy the link + code to send directly to your customer from
                    your phone or WhatsApp.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 2: VERIFY CUSTOMER CODE */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 mx-auto rounded-full bg-[#84CC16]/10 text-[#84CC16] flex items-center justify-center">
                    <Lock size={26} />
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-foreground">
                    Verify Customer Identity
                  </h2>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Enter the 6-digit code sent to{" "}
                    <strong className="text-foreground">
                      {activeConsent?.maskedDestination || "the customer"}
                    </strong>
                    {activeConsent?.code ? (
                      <span className="block mt-1 text-[#84CC16] font-mono font-bold text-xs">
                        (Active verification code: {activeConsent.code})
                      </span>
                    ) : null}
                  </p>
                </div>

                {/* 6 Digit Input */}
                <div className="flex justify-center gap-2 sm:gap-3 py-2">
                  {digits.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`consent-digit-${idx}`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-2xl font-black rounded-2xl border bg-background text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-[#84CC16] ${
                        verifyError
                          ? "border-red-500 ring-2 ring-red-500/20"
                          : digit
                            ? "border-[#84CC16] bg-[#84CC16]/5"
                            : "border-border"
                      }`}
                    />
                  ))}
                </div>

                {verifyError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-semibold text-center">
                    {verifyError}
                  </div>
                )}

                <div className="space-y-3 pt-2">
                  <Button
                    type="button"
                    disabled={digits.join("").length !== 6 || isVerifying}
                    onClick={() => verifyCustomerCode()}
                    className="w-full h-12 rounded-2xl bg-[#84CC16] hover:bg-[#84CC16]/90 text-black font-black text-sm shadow-md"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify & Continue"
                    )}
                  </Button>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      disabled={isResending}
                      onClick={handleResendCode}
                      className="text-xs font-bold text-muted-foreground hover:text-foreground underline transition-colors"
                    >
                      {isResending ? "Resending..." : "Resend Code"}
                    </button>

                    <button
                      type="button"
                      disabled={isPollingStatus}
                      onClick={handleCheckStatus}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#84CC16] hover:opacity-80 transition-opacity"
                    >
                      <RefreshCw
                        size={14}
                        className={isPollingStatus ? "animate-spin" : ""}
                      />
                      Check Online Status
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: REVIEW & AGREE */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center space-y-1">
                  <div className="w-14 h-14 mx-auto rounded-full bg-[#84CC16]/10 text-[#84CC16] flex items-center justify-center">
                    <FileText size={26} />
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-foreground">
                    Review & Agree
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Confirm transaction specifications and legal declarations.
                  </p>
                </div>

                {/* Agreement Summary Box */}
                <div className="rounded-2xl border border-border bg-muted/40 p-4 space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-border/50">
                    <span className="text-muted-foreground">Customer:</span>
                    <span className="font-bold text-foreground">
                      {initialData.customerName || "Customer"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-border/50">
                    <span className="text-muted-foreground">
                      Device / Item:
                    </span>
                    <span className="font-bold text-foreground">
                      {initialData.itemName || "Device"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-border/50">
                    <span className="text-muted-foreground">Agreed Value:</span>
                    <span className="font-black text-[#84CC16] text-sm">
                      {formatCurrency(initialData.agreedValue)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-muted-foreground">Reference:</span>
                    <span className="font-mono font-bold text-foreground">
                      {activeConsent?.reference || "Pending"}
                    </span>
                  </div>
                </div>

                {/* Quick Terms & Full Terms Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowQuickTerms(true)}
                    className="h-10 rounded-xl text-xs font-bold gap-1.5"
                  >
                    <Info size={14} className="text-[#84CC16]" />
                    Quick Terms
                  </Button>

                  <a
                    href="/terms-conditions"
                    target="_blank"
                    rel="noreferrer"
                    className="h-10 rounded-xl border border-input bg-background hover:bg-muted text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ExternalLink size={14} className="text-muted-foreground" />
                    Full Terms
                  </a>
                </div>

                {/* 3 Explicit Declarations */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-start gap-3 p-3 rounded-2xl border border-border bg-background">
                    <Checkbox
                      id="confirmAge18"
                      checked={confirmAge18}
                      onCheckedChange={(checked) =>
                        setConfirmAge18(Boolean(checked))
                      }
                      className="mt-0.5"
                    />
                    <label
                      htmlFor="confirmAge18"
                      className="text-xs font-semibold text-foreground leading-relaxed cursor-pointer select-none"
                    >
                      I confirm I am aged 18 or over.
                    </label>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-2xl border border-border bg-background">
                    <Checkbox
                      id="confirmOwnership"
                      checked={confirmOwnership}
                      onCheckedChange={(checked) =>
                        setConfirmOwnership(Boolean(checked))
                      }
                      className="mt-0.5"
                    />
                    <label
                      htmlFor="confirmOwnership"
                      className="text-xs font-semibold text-foreground leading-relaxed cursor-pointer select-none"
                    >
                      I own this device, have the right to sell it and am
                      selling or trading it in voluntarily.
                    </label>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-2xl border border-border bg-background">
                    <Checkbox
                      id="confirmTermsAgreed"
                      checked={confirmTermsAgreed}
                      onCheckedChange={(checked) =>
                        setConfirmTermsAgreed(Boolean(checked))
                      }
                      className="mt-0.5"
                    />
                    <label
                      htmlFor="confirmTermsAgreed"
                      className="text-xs font-semibold text-foreground leading-relaxed cursor-pointer select-none"
                    >
                      I agree to the transaction details above and the Terms &
                      Conditions.
                    </label>
                  </div>
                </div>

                {/* Privacy Notice Card */}
                <div className="p-3.5 rounded-2xl bg-[#84CC16]/10 border border-[#84CC16]/20 text-xs text-foreground space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#84CC16]">
                    <ShieldCheck size={16} />
                    Privacy Notice
                  </div>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    We collect your ID image, contact details and device details
                    for this transaction. Your original ID image is deleted
                    automatically within 28 days.
                  </p>
                </div>

                {approveError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-semibold text-center">
                    {approveError}
                  </div>
                )}

                <Button
                  type="button"
                  disabled={
                    !confirmAge18 ||
                    !confirmOwnership ||
                    !confirmTermsAgreed ||
                    isApproving
                  }
                  onClick={handleApproveConsent}
                  className="w-full h-12 rounded-2xl bg-[#84CC16] hover:bg-[#84CC16]/90 text-black font-black text-sm shadow-md"
                >
                  {isApproving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Approving Consent...
                    </>
                  ) : (
                    "Approve Consent"
                  )}
                </Button>
              </div>
            )}

            {/* STEP 4: APPROVED */}
            {step === 4 && (
              <div className="space-y-6 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 text-green-600 flex items-center justify-center">
                  <CheckCircle2 size={36} />
                </div>

                <div className="space-y-1">
                  <h2 className="text-2xl font-black tracking-tight text-foreground">
                    Consent Approved
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Verified by customer • Identity capture & scanning unlocked
                  </p>
                </div>

                <div className="rounded-2xl border border-green-500/30 bg-green-500/5 p-5 space-y-3 text-left text-xs">
                  <div className="flex items-center gap-2 text-foreground font-bold">
                    <Calendar size={15} className="text-green-600" />
                    Approved •{" "}
                    {activeConsent?.approvedAt
                      ? new Date(activeConsent.approvedAt).toLocaleString()
                      : "Just now"}
                  </div>

                  <div className="text-muted-foreground text-xs">
                    Reference:{" "}
                    <span className="font-mono font-bold text-foreground">
                      {activeConsent?.reference || "Approved"}
                    </span>{" "}
                    • Delivered by{" "}
                    <span className="capitalize font-semibold text-foreground">
                      {activeConsent?.channel || "Email"}
                    </span>{" "}
                    • Terms version{" "}
                    {activeConsent?.termsVersion || "2026-09-07"}
                  </div>

                  {activeConsent?.idImageDeleteAfter && (
                    <div className="p-2.5 rounded-xl bg-background/80 border border-border text-[11px] text-muted-foreground flex items-center gap-2">
                      <ShieldCheck
                        size={14}
                        className="text-[#84CC16] shrink-0"
                      />
                      Original ID image will be deleted automatically on{" "}
                      {new Date(
                        activeConsent.idImageDeleteAfter,
                      ).toLocaleDateString()}
                      .
                    </div>
                  )}
                </div>

                <Button
                  type="button"
                  onClick={handleFinish}
                  className="w-full h-12 rounded-2xl bg-[#84CC16] hover:bg-[#84CC16]/90 text-black font-black text-sm shadow-md"
                >
                  Done & Continue
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* QUICK TERMS MODAL */}
      <Dialog open={showQuickTerms} onOpenChange={setShowQuickTerms}>
        <DialogContent
          className="max-w-md rounded-3xl"
          aria-describedby="quick-terms-description"
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-black">
              Trade-In Terms Summary
            </DialogTitle>
            <DialogDescription id="quick-terms-description">
              Key summary of trade-in and purchase conditions:
            </DialogDescription>
          </DialogHeader>
          <div className="text-xs text-muted-foreground space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            <p>
              • <strong>Ownership & Right to Sell:</strong> You confirm that you
              are the lawful owner of the device, it is free of all liens,
              finance agreements, and claims.
            </p>
            <p>
              • <strong>Legitimacy & Blacklist Verification:</strong> The device
              will be checked against global blacklist registries (GSMA, Police
              databases). If flagged as lost or stolen, it may be surrendered to
              authorities.
            </p>
            <p>
              • <strong>Privacy & 28-Day Data Retention:</strong> As part of
              fraud prevention and statutory secondhand dealer laws, your ID is
              temporarily retained and automatically deleted after 28 days.
            </p>
            <p>
              • <strong>Finality:</strong> Once the transaction is finalized,
              ownership transfers to the shop. All personal data on the device
              must be wiped prior to handover.
            </p>
          </div>
          <div className="pt-3">
            <Button
              type="button"
              onClick={() => setShowQuickTerms(false)}
              className="w-full rounded-xl bg-[#84CC16] text-black font-bold text-xs"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
