"use client";

import React from "react";
import { CreditCard, Banknote, Building2, Clock3, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  CheckoutPaymentForm,
  getPaymentMethodLabel,
} from "@/features/shopkeeper/checkout/component/checkoutPayment";

interface CollectPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalAmount: number;
  currency?: string;
  formatCurrency: (value: number, currency?: string) => string;
  paymentForm: CheckoutPaymentForm;
  setPaymentForm: React.Dispatch<React.SetStateAction<CheckoutPaymentForm>>;
  onConfirm: (event: React.FormEvent) => void | Promise<void>;
  isPending?: boolean;
  isDueDisabled?: boolean;
  confirmButtonText?: string;
  descriptionText?: string;
}

export function CollectPaymentModal({
  open,
  onOpenChange,
  totalAmount,
  currency = "BDT",
  formatCurrency,
  paymentForm,
  setPaymentForm,
  onConfirm,
  isPending = false,
  isDueDisabled = false,
  confirmButtonText = "Confirm & Print Receipt",
  descriptionText,
}: CollectPaymentModalProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isPending) {
          onOpenChange(nextOpen);
        }
      }}
    >
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-3xl border-none bg-white p-0 font-poppins sm:max-w-2xl">
        <DialogHeader className="border-b border-slate-100 px-6 py-5 text-left">
          <DialogTitle className="flex items-center gap-3 text-xl font-black text-slate-950">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-lime-50 text-[#84CC16]">
              <CreditCard size={19} />
            </span>
            Collect Payment
          </DialogTitle>
          <DialogDescription className="text-xs font-semibold text-slate-500">
            {descriptionText ? (
              descriptionText
            ) : (
              <>
                Select how the customer is paying{" "}
                <span className="font-black text-slate-900">
                  {formatCurrency(totalAmount, currency)}
                </span>
                . The payment record will be saved with the customer invoice.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onConfirm} className="space-y-5 p-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                id: "cash" as const,
                label: "Cash",
                description: "Cash received",
                icon: Banknote,
              },
              {
                id: "card" as const,
                label: "Card",
                description: "Debit or credit",
                icon: CreditCard,
              },
              {
                id: "bank" as const,
                label: "Bank",
                description: "Bank transfer",
                icon: Building2,
              },
              {
                id: "due" as const,
                label: "Due",
                description: "Pay later",
                icon: Clock3,
              },
            ].map(({ id, label, description, icon: Icon }) => {
              const isSelected = paymentForm.method === id;
              const isDisabled = id === "due" && isDueDisabled;

              return (
                <button
                  key={id}
                  type="button"
                  disabled={isDisabled}
                  onClick={() =>
                    setPaymentForm((current) => ({
                      ...current,
                      method: id,
                    }))
                  }
                  className={`rounded-2xl border p-3 text-left transition-all ${
                    isSelected
                      ? "border-[#84CC16] bg-lime-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  } ${isDisabled ? "cursor-not-allowed opacity-45" : ""}`}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                      isSelected
                        ? "bg-[#84CC16] text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <Icon size={17} />
                  </span>
                  <span className="mt-3 block text-sm font-black text-slate-950">
                    {label}
                  </span>
                  <span className="mt-0.5 block text-[10px] font-bold text-slate-500">
                    {isDisabled ? "Customer required" : description}
                  </span>
                </button>
              );
            })}
          </div>

          {!paymentForm.method ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-7 text-center">
              <CreditCard className="mx-auto h-7 w-7 text-slate-300" />
              <p className="mt-2 text-xs font-black text-slate-600">
                Choose a payment method to continue
              </p>
            </div>
          ) : (
            <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div>
                <p className="text-sm font-black text-slate-950">
                  {getPaymentMethodLabel(paymentForm.method)} details
                </p>
                <p className="text-[10px] font-bold text-slate-500">
                  Only transaction references and last four digits are stored.
                </p>
              </div>

              {paymentForm.method === "cash" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Cash Received
                    </span>
                    <Input
                      type="number"
                      min={totalAmount}
                      step="0.01"
                      value={paymentForm.amountReceived}
                      onChange={(event) =>
                        setPaymentForm((current) => ({
                          ...current,
                          amountReceived: event.target.value,
                        }))
                      }
                      className="h-11 rounded-xl border-slate-200 bg-white text-sm font-black focus-visible:ring-[#84CC16]"
                    />
                  </label>
                  <div className="rounded-xl border border-lime-100 bg-lime-50 px-4 py-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-lime-700">
                      Change
                    </span>
                    <p className="mt-1 text-lg font-black text-lime-700">
                      {formatCurrency(
                        Math.max(
                          0,
                          Number(paymentForm.amountReceived || 0) - totalAmount,
                        ),
                        currency,
                      )}
                    </p>
                  </div>
                </div>
              )}

              {paymentForm.method === "card" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Cardholder Name
                    </span>
                    <Input
                      value={paymentForm.cardholderName}
                      onChange={(event) =>
                        setPaymentForm((current) => ({
                          ...current,
                          cardholderName: event.target.value,
                        }))
                      }
                      placeholder="Optional"
                      autoComplete="off"
                      className="h-11 rounded-xl border-slate-200 bg-white text-xs font-bold focus-visible:ring-[#84CC16]"
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Card Last 4 *
                    </span>
                    <Input
                      inputMode="numeric"
                      maxLength={4}
                      value={paymentForm.cardLastFour}
                      onChange={(event) =>
                        setPaymentForm((current) => ({
                          ...current,
                          cardLastFour: event.target.value
                            .replace(/\D/g, "")
                            .slice(0, 4),
                        }))
                      }
                      placeholder="1234"
                      autoComplete="off"
                      className="h-11 rounded-xl border-slate-200 bg-white text-xs font-bold focus-visible:ring-[#84CC16]"
                    />
                  </label>
                  <label className="space-y-1.5 sm:col-span-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Transaction / Authorization Reference *
                    </span>
                    <Input
                      value={paymentForm.transactionReference}
                      onChange={(event) =>
                        setPaymentForm((current) => ({
                          ...current,
                          transactionReference: event.target.value,
                        }))
                      }
                      placeholder="Card terminal transaction reference"
                      autoComplete="off"
                      className="h-11 rounded-xl border-slate-200 bg-white text-xs font-bold focus-visible:ring-[#84CC16]"
                    />
                  </label>
                </div>
              )}

              {paymentForm.method === "bank" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Bank Name *
                    </span>
                    <Input
                      value={paymentForm.bankName}
                      onChange={(event) =>
                        setPaymentForm((current) => ({
                          ...current,
                          bankName: event.target.value,
                        }))
                      }
                      placeholder="Customer's bank"
                      className="h-11 rounded-xl border-slate-200 bg-white text-xs font-bold focus-visible:ring-[#84CC16]"
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Account Last 4
                    </span>
                    <Input
                      inputMode="numeric"
                      maxLength={4}
                      value={paymentForm.accountLastFour}
                      onChange={(event) =>
                        setPaymentForm((current) => ({
                          ...current,
                          accountLastFour: event.target.value
                            .replace(/\D/g, "")
                            .slice(0, 4),
                        }))
                      }
                      placeholder="Optional"
                      autoComplete="off"
                      className="h-11 rounded-xl border-slate-200 bg-white text-xs font-bold focus-visible:ring-[#84CC16]"
                    />
                  </label>
                  <label className="space-y-1.5 sm:col-span-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Transfer Reference *
                    </span>
                    <Input
                      value={paymentForm.transactionReference}
                      onChange={(event) =>
                        setPaymentForm((current) => ({
                          ...current,
                          transactionReference: event.target.value,
                        }))
                      }
                      placeholder="Bank transfer reference"
                      className="h-11 rounded-xl border-slate-200 bg-white text-xs font-bold focus-visible:ring-[#84CC16]"
                    />
                  </label>
                </div>
              )}

              {paymentForm.method === "due" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Amount Paid Now
                    </span>
                    <Input
                      type="number"
                      min="0"
                      max={Math.max(0, totalAmount - 0.01)}
                      step="0.01"
                      value={paymentForm.amountPaid}
                      onChange={(event) =>
                        setPaymentForm((current) => ({
                          ...current,
                          amountPaid: event.target.value,
                        }))
                      }
                      className="h-11 rounded-xl border-slate-200 bg-white text-xs font-bold focus-visible:ring-[#84CC16]"
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Due Date *
                    </span>
                    <Input
                      type="date"
                      value={paymentForm.dueDate}
                      onChange={(event) =>
                        setPaymentForm((current) => ({
                          ...current,
                          dueDate: event.target.value,
                        }))
                      }
                      className="h-11 rounded-xl border-slate-200 bg-white text-xs font-bold focus-visible:ring-[#84CC16]"
                    />
                  </label>
                  <div className="rounded-xl border border-orange-100 bg-orange-50 px-4 py-3 sm:col-span-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-orange-700">
                      Balance Due
                    </span>
                    <p className="mt-1 text-lg font-black text-orange-700">
                      {formatCurrency(
                        Math.max(
                          0,
                          totalAmount - Number(paymentForm.amountPaid || 0),
                        ),
                        currency,
                      )}
                    </p>
                  </div>
                </div>
              )}

              <label className="block space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Payment Note
                </span>
                <textarea
                  rows={2}
                  value={paymentForm.notes}
                  onChange={(event) =>
                    setPaymentForm((current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
                  placeholder="Optional note"
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold outline-none transition focus:border-[#84CC16] focus:ring-2 focus:ring-[#84CC16]/20"
                />
              </label>
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
              className="h-11 rounded-xl px-5 text-xs font-black"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!paymentForm.method || isPending}
              className="h-11 rounded-xl bg-[#84CC16] px-5 text-xs font-black text-white hover:bg-[#75b213]"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {confirmButtonText}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
