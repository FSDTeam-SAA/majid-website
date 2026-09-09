"use client";

import React, { useState } from "react";
import { X, Sparkles, RefreshCw, Edit2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useUpdateResentRepairQuoteStatus } from "@/features/customer/repairRequest/hooks/useRepairRequest";
import type { RepairRequest } from "@/features/customer/repairRequest/types/repair-request.types";

export const UNABLE_TO_REPAIR_REASONS = [
  "Motherboard issue — service not offered",
  "Device is beyond economical repair",
  "Required parts are unavailable",
  "Severe liquid or physical damage",
  "Unsupported device or model",
  "Customer declined the repair quote",
  "Other — enter a custom reason",
] as const;

interface UnableToRepairModalProps {
  isOpen: boolean;
  onClose: () => void;
  repairRequest: RepairRequest | null | undefined;
  onSuccess?: () => void;
}

function generateCustomerMessage(
  reason: string,
  name: string,
  device: string,
  customReasonText?: string,
): string {
  switch (reason) {
    case "Motherboard issue — service not offered":
      return `Hi ${name}, after completing our assessment, we found a fault with your device's motherboard. Unfortunately, motherboard-level repair is not a service we can safely complete for this job, so we're unable to proceed. We're sorry we could not repair your device. No repair work has been carried out, and your device is ready for collection. Please contact us if you need any further assistance.`;

    case "Device is beyond economical repair":
      return `Hi ${name}, after completing our diagnostic assessment on your ${device}, we determined that the cost of necessary replacement parts and repairs exceeds the economical value of the device. Consequently, we are unable to proceed with the repair. No repair work has been carried out, and your device has been safely reassembled for collection. Please contact us if you have any questions.`;

    case "Required parts are unavailable":
      return `Hi ${name}, after checking with our certified parts suppliers, the required genuine replacement components for your ${device} are currently unavailable or discontinued. As a result, we are unable to complete the repair safely. Your device is ready for collection at our shop. Please let us know if you need any further help.`;

    case "Severe liquid or physical damage":
      return `Hi ${name}, our diagnostic inspection revealed extensive liquid and physical damage across key internal circuits of your ${device}. Due to the severity of the damage, we cannot guarantee a reliable or lasting repair. No repair work has been conducted, and your device is ready for collection. Please feel free to reach out if you need assistance.`;

    case "Unsupported device or model":
      return `Hi ${name}, after evaluating your ${device}, we found that this particular model requires proprietary diagnostic tools and calibration hardware that our service center does not currently support. Therefore, we cannot proceed with the repair. Your device is ready for pickup. Thank you for your understanding.`;

    case "Customer declined the repair quote":
      return `Hi ${name}, as discussed, you have chosen to decline the repair estimate for your ${device}. No repair work has been carried out, and your device is ready for collection at our shop. Please contact us if you need any further assistance.`;

    case "Other — enter a custom reason":
      return `Hi ${name}, following diagnostic evaluation on your ${device}, we are unable to proceed with the repair due to: ${customReasonText?.trim() || "unforeseen technical constraints"}. No repair work has been carried out, and your device is ready for collection. Please contact us if you have any questions.`;

    default:
      return `Hi ${name}, after diagnostic assessment on your ${device}, we are unable to proceed with the repair. Your device is ready for collection at our shop. Please contact us if you need any further assistance.`;
  }
}

function getDefaultTechNote(reason: string): string {
  switch (reason) {
    case "Motherboard issue — service not offered":
      return "Motherboard fault confirmed during diagnosis.";
    case "Device is beyond economical repair":
      return "Component replacement costs exceed total device replacement value.";
    case "Required parts are unavailable":
      return "Parts out of stock from all authorized suppliers.";
    case "Severe liquid or physical damage":
      return "Extensive corrosion and physical damage detected across board.";
    case "Unsupported device or model":
      return "No certified tools or schematic support for this model.";
    case "Customer declined the repair quote":
      return "Customer informed of quote and declined work.";
    default:
      return "Repair marked unable to proceed after diagnostic assessment.";
  }
}

export function UnableToRepairModal({
  isOpen,
  onClose,
  repairRequest,
  onSuccess,
}: UnableToRepairModalProps) {
  const customerName = repairRequest?.firstName || "Customer";
  const deviceModel = repairRequest?.deviceModel || "device";

  const [selectedReason, setSelectedReason] = useState<string>(
    UNABLE_TO_REPAIR_REASONS[0],
  );
  const [customReason, setCustomReason] = useState("");
  const [technicianNote, setTechnicianNote] = useState(() =>
    getDefaultTechNote(UNABLE_TO_REPAIR_REASONS[0]),
  );
  const [customerMessage, setCustomerMessage] = useState(() =>
    generateCustomerMessage(
      UNABLE_TO_REPAIR_REASONS[0],
      customerName,
      deviceModel,
    ),
  );
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  const updateResentQuote = useUpdateResentRepairQuoteStatus();

  const resetForm = () => {
    const initialReason = UNABLE_TO_REPAIR_REASONS[0];
    setSelectedReason(initialReason);
    setCustomReason("");
    setTechnicianNote(getDefaultTechNote(initialReason));
    setCustomerMessage(
      generateCustomerMessage(initialReason, customerName, deviceModel),
    );
    setIsEditingMessage(false);
    setHasReviewed(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleReasonChange = (newReason: string) => {
    setSelectedReason(newReason);
    setTechnicianNote(getDefaultTechNote(newReason));
    setCustomerMessage(
      generateCustomerMessage(
        newReason,
        customerName,
        deviceModel,
        customReason,
      ),
    );
  };

  const handleCustomReasonChange = (val: string) => {
    setCustomReason(val);
    if (selectedReason === "Other — enter a custom reason") {
      setCustomerMessage(
        generateCustomerMessage(selectedReason, customerName, deviceModel, val),
      );
    }
  };

  const handleRegenerateMessage = () => {
    setCustomerMessage(
      generateCustomerMessage(
        selectedReason,
        customerName,
        deviceModel,
        customReason,
      ),
    );
    setIsEditingMessage(false);
  };

  const handleConfirm = async () => {
    if (!repairRequest?._id) return;

    const finalReason =
      selectedReason === "Other — enter a custom reason"
        ? customReason.trim() || "Other"
        : selectedReason;

    await updateResentQuote.mutateAsync({
      id: repairRequest._id,
      status: "unable-to-repair",
      unableToRepairReason: finalReason,
      unableToRepairNote: technicianNote.trim(),
      unableToRepairCustomerMessage: customerMessage.trim(),
    });

    handleClose();
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-lg">
        <div className="bg-card border border-border w-full rounded-[32px] p-7 shadow-2xl space-y-5 relative">
          <DialogTitle className="sr-only">Unable to Repair</DialogTitle>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute right-5 top-5 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
              <XCircle className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-xl font-black text-foreground tracking-tight">
                Unable to Repair
              </h3>
              <p className="text-xs font-semibold text-muted-foreground">
                Select a reason and review the customer message before updating
                this repair.
              </p>
            </div>
          </div>

          {/* Reason Section (Annotation 2) */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-foreground flex items-center gap-1.5">
              <span>Reason</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            </label>
            <Select value={selectedReason} onValueChange={handleReasonChange}>
              <SelectTrigger className="w-full rounded-2xl h-12 border-border bg-background font-bold text-xs text-foreground">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-border bg-popover font-bold text-xs">
                {UNABLE_TO_REPAIR_REASONS.map((reason) => (
                  <SelectItem
                    key={reason}
                    value={reason}
                    className="cursor-pointer py-2.5"
                  >
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedReason === "Other — enter a custom reason" && (
              <Input
                placeholder="Enter custom reason..."
                className="rounded-xl h-10 mt-2 font-medium text-xs border-border"
                value={customReason}
                onChange={(e) => handleCustomReasonChange(e.target.value)}
              />
            )}
          </div>

          {/* Technician Note Section (Annotation 2) */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-foreground block">
              Technician note
            </label>
            <Textarea
              rows={2}
              placeholder="Internal diagnostic note..."
              className="rounded-2xl border-border bg-background p-3 text-xs font-medium text-foreground resize-none focus-visible:ring-primary/20"
              value={technicianNote}
              onChange={(e) => setTechnicianNote(e.target.value)}
            />
            <p className="text-[11px] font-medium text-muted-foreground">
              Internal note — not automatically shown to the customer.
            </p>
          </div>

          {/* AI-Generated Customer Message (Annotation 3) */}
          <div className="bg-blue-50/70 dark:bg-blue-950/25 border border-blue-100 dark:border-blue-900/40 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-black text-foreground">
                  AI-Generated Customer Message
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <Edit2 size={10} />
                Editable
              </span>
            </div>

            {/* Message Body */}
            <div className="bg-white dark:bg-card border border-blue-100/80 dark:border-blue-900/30 rounded-xl p-3.5">
              {isEditingMessage ? (
                <Textarea
                  rows={4}
                  className="text-xs text-foreground leading-relaxed font-medium p-0 border-0 focus-visible:ring-0 resize-none bg-transparent"
                  value={customerMessage}
                  onChange={(e) => setCustomerMessage(e.target.value)}
                  autoFocus
                />
              ) : (
                <p className="text-xs text-foreground/90 leading-relaxed font-medium">
                  {customerMessage}
                </p>
              )}
            </div>

            {/* Sub-actions */}
            <div className="flex items-center gap-2 pt-0.5">
              <button
                type="button"
                onClick={handleRegenerateMessage}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-white dark:bg-card text-foreground hover:bg-muted text-xs font-bold transition-colors cursor-pointer shadow-sm"
              >
                <RefreshCw size={12} />
                Regenerate
              </button>
              <button
                type="button"
                onClick={() => setIsEditingMessage((prev) => !prev)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-white dark:bg-card text-foreground hover:bg-muted text-xs font-bold transition-colors cursor-pointer shadow-sm"
              >
                <Edit2 size={12} />
                {isEditingMessage ? "Save Message" : "Edit Message"}
              </button>
            </div>
          </div>

          {/* Review Checkbox (Annotation 3) */}
          <div className="flex items-center gap-2.5 pt-1">
            <input
              type="checkbox"
              id="reviewed-message-checkbox"
              checked={hasReviewed}
              onChange={(e) => setHasReviewed(e.target.checked)}
              className="w-4 h-4 rounded border-border text-[#EF4444] focus:ring-[#EF4444]/20 cursor-pointer accent-[#EF4444]"
            />
            <label
              htmlFor="reviewed-message-checkbox"
              className="text-xs font-bold text-foreground cursor-pointer select-none"
            >
              I have reviewed the message and reason.
            </label>
          </div>

          {/* Footer Actions (Annotation 4) */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="rounded-xl px-5 h-11 font-bold text-xs border-border hover:bg-muted cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={!hasReviewed || updateResentQuote.isPending}
              className="rounded-xl px-6 h-11 font-bold text-xs !bg-[#EF4444] hover:!bg-red-600 text-white shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer uppercase tracking-wider"
            >
              {updateResentQuote.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Confirm & Notify Customer"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default UnableToRepairModal;
