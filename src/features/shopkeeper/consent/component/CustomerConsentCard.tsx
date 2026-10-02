"use client";

import React from "react";
import {
  ShieldAlert,
  Shield,
  RefreshCw,
  Send,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConsentRecord } from "../types/consent.types";

interface CustomerConsentCardProps {
  consent: ConsentRecord | null;
  hasConsent: boolean;
  needsFreshConsent?: boolean;
  onRequestConsent: () => void;
  className?: string;
  disabled?: boolean;
  disabledReason?: string;
}

export const CustomerConsentCard: React.FC<CustomerConsentCardProps> = ({
  consent,
  hasConsent,
  needsFreshConsent = false,
  onRequestConsent,
  className = "",
  disabled = false,
  disabledReason,
}) => {
  const isApproved = hasConsent && !needsFreshConsent;

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 transition-all ${
        isApproved
          ? "border-green-500/30 bg-green-500/5 dark:bg-green-950/20"
          : needsFreshConsent
            ? "border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20"
            : "border-border bg-card/60"
      } ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Info Section */}
        <div className="flex items-start gap-3.5">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
              isApproved
                ? "bg-green-500/15 text-green-600 dark:text-green-400"
                : needsFreshConsent
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                  : "bg-[#84CC16]/10 text-[#84CC16]"
            }`}
          >
            {isApproved ? (
              <CheckCircle2 size={22} />
            ) : needsFreshConsent ? (
              <ShieldAlert size={22} />
            ) : (
              <Shield size={22} />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-foreground">
                {isApproved
                  ? "Consent approved"
                  : needsFreshConsent
                    ? "Details changed — fresh consent needed"
                    : "Customer consent required"}
              </h3>
              {isApproved && consent?.reference && (
                <span className="px-2 py-0.5 rounded-md bg-green-500/20 text-green-700 dark:text-green-300 font-mono text-[11px] font-bold">
                  {consent.reference}
                </span>
              )}
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
              {isApproved
                ? "Verified by the customer. Handset scanning and ID capture unlocked."
                : needsFreshConsent
                  ? "The customer name, item, or value has changed since approval. Please request consent again."
                  : "Send the customer a secure link and 6-digit code. They agree to terms first — only then can their ID be photographed and handset registered."}
            </p>

            {isApproved && consent && (
              <div className="pt-1.5 space-y-1 text-[11px] text-muted-foreground">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>
                    Delivered by:{" "}
                    <strong className="text-foreground capitalize">
                      {consent.channel || "email"}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Terms:{" "}
                    <strong className="text-foreground">
                      {consent.termsVersion || "2026-09-07"}
                    </strong>
                  </span>
                  {consent.approvedAt && (
                    <>
                      <span>•</span>
                      <span>
                        Approved:{" "}
                        <strong className="text-foreground">
                          {new Date(consent.approvedAt).toLocaleDateString()}
                        </strong>
                      </span>
                    </>
                  )}
                </div>

                {consent.idImageDeleteAfter && (
                  <p className="text-[11px] text-muted-foreground/90">
                    ID image deleted automatically by{" "}
                    <span className="font-semibold text-foreground">
                      {new Date(
                        consent.idImageDeleteAfter,
                      ).toLocaleDateString()}
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="shrink-0 flex flex-col items-end gap-1 w-full sm:w-auto">
          <Button
            type="button"
            variant={isApproved ? "outline" : "default"}
            disabled={disabled}
            onClick={onRequestConsent}
            className={`w-full sm:w-auto rounded-xl font-bold text-xs h-10 gap-2 ${
              isApproved
                ? "border-green-600/30 text-green-700 dark:text-green-300 hover:bg-green-500/10"
                : needsFreshConsent
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "bg-[#84CC16] hover:bg-[#84CC16]/90 text-black shadow-sm"
            }`}
          >
            {isApproved || needsFreshConsent ? (
              <>
                <RefreshCw size={14} />
                Request consent again
              </>
            ) : (
              <>
                <Send size={14} />
                Request Customer Consent
              </>
            )}
          </Button>

          {disabled && disabledReason && (
            <span className="text-[10px] text-muted-foreground">
              {disabledReason}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
