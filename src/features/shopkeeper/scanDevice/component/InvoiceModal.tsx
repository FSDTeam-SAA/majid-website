/* eslint-disable @typescript-eslint/no-explicit-any */
// components/InvoiceModal.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Loader2,
  DollarSign,
  Landmark,
  User,
  MapPin,
  Phone,
  CreditCard,
  Mail,
  AlertCircle,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { IMEIResult } from "../../scanDevice/types/scanDevice.types";
import axiosInstance from "@/lib/instance/axios-instance";
import { useSession } from "next-auth/react";
import { useCurrency } from "@/hooks/useCurrency";
import { formatCurrency as baseFormatCurrency } from "@/lib/currency";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (invoiceData: InvoiceFormData) => void;
  scanResult?: IMEIResult | null;
  isGenerating: boolean;
  defaultPrice?: number;
}

export interface InvoiceFormData {
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  customerPhone: string;
  price: number;
  currency?: string;
  paymentMethod: "cash" | "bank" | "tradein";
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    maskedNumber: string;
  };
  tradeInDetails?: {
    tradeInValue: number;
    deviceName: string;
    remainingAmount: number;
    isReceiving: boolean;
  };
  customerId?: string;
}

const SMART_INVOICE_CURRENCY_KEY = "smart-invoice-selected-currency";

// Field error type
interface FieldError {
  field: string;
  message: string;
}

export const InvoiceModal = ({
  isOpen,
  onClose,
  onGenerate,
  scanResult,
  isGenerating,
  defaultPrice,
}: InvoiceModalProps) => {
  const { data: session } = useSession();
  const { currency, currencyOptions, convertAmount } = useCurrency();
  const marketValue = scanResult?.marketValue?.amount || defaultPrice || 599;
  const deviceName = scanResult?.deviceName || "Unknown Device";

  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [customerError, setCustomerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        window.localStorage.getItem(SMART_INVOICE_CURRENCY_KEY) ||
        currency ||
        "USD"
      );
    }

    return currency || "USD";
  });

  const [formData, setFormData] = useState<InvoiceFormData>({
    customerName: "",
    customerEmail: "",
    customerAddress: "",
    customerPhone: "",
    price: marketValue,
    currency: currency || "USD",
    paymentMethod: "cash",
  });
  const [tradeInValue, setTradeInValue] = useState<number>(0);
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const previousOpenRef = useRef(false);
  const previousScanIdRef = useRef<string | null>(null);

  const formatSelectedCurrency = (amount: number) =>
    baseFormatCurrency(Number(amount || 0), selectedCurrency || "USD");

  const buildTradeInDetails = (price: number, value: number) => {
    const remaining = price - value;

    return {
      tradeInValue: value,
      deviceName,
      remainingAmount: Math.abs(remaining),
      isReceiving: remaining < 0,
    };
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      SMART_INVOICE_CURRENCY_KEY,
      selectedCurrency || "USD",
    );
  }, [selectedCurrency]);

  // Reset form when modal opens with new scanResult
  useEffect(() => {
    const scanId = scanResult?.imei || null;
    const shouldReset =
      isOpen &&
      !!scanResult &&
      (!previousOpenRef.current || previousScanIdRef.current !== scanId);

    previousOpenRef.current = isOpen;
    previousScanIdRef.current = scanId;

    if (shouldReset && scanResult) {
      setTimeout(() => {
        const convertedMarketValue = Number(
          convertAmount(marketValue, "USD", selectedCurrency).toFixed(2),
        );
        setFormData({
          customerName: "",
          customerEmail: "",
          customerAddress: "",
          customerPhone: "",
          price: convertedMarketValue,
          currency: selectedCurrency,
          paymentMethod: "cash",
        });
        setTradeInValue(0);
        setBankAccountNumber("");
        setFieldErrors([]);
        setCustomerError(null);
      }, 0);
    }
  }, [
    isOpen,
    scanResult,
    defaultPrice,
    marketValue,
    selectedCurrency,
    convertAmount,
  ]);

  // Clear field error for a specific field
  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => prev.filter((e) => e.field !== field));
  };

  // Parse customer name into first and last name
  const parseCustomerName = (fullName: string) => {
    const parts = fullName.trim().split(" ");
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ") || "";
    return { firstName, lastName };
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    const errors: FieldError[] = [];

    if (!formData.customerName.trim()) {
      errors.push({
        field: "customerName",
        message: "Customer name is required",
      });
    }
    if (!formData.customerEmail.trim()) {
      errors.push({ field: "customerEmail", message: "Email is required" });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      errors.push({ field: "customerEmail", message: "Invalid email format" });
    }
    if (!formData.customerAddress.trim()) {
      errors.push({ field: "customerAddress", message: "Address is required" });
    }
    if (!formData.customerPhone.trim()) {
      errors.push({
        field: "customerPhone",
        message: "Phone number is required",
      });
    }
    if (formData.price <= 0) {
      errors.push({ field: "price", message: "Price must be greater than 0" });
    }

    // Validate phone number format (basic)
    const phoneRegex = /^[0-9+\-\s()]{8,20}$/;
    if (
      formData.customerPhone.trim() &&
      !phoneRegex.test(formData.customerPhone.trim())
    ) {
      errors.push({
        field: "customerPhone",
        message: "Please enter a valid phone number",
      });
    }

    if (formData.paymentMethod === "bank" && !bankAccountNumber.trim()) {
      errors.push({
        field: "bankAccount",
        message: "Bank account number is required",
      });
    }

    if (formData.paymentMethod === "tradein" && tradeInValue < 0) {
      errors.push({
        field: "tradeIn",
        message: "Trade-in value cannot be negative",
      });
    }

    setFieldErrors(errors);
    return errors.length === 0;
  };

  // Create customer API call
  const createCustomer = async (): Promise<{
    success: boolean;
    customerId?: string;
    error?: string;
  }> => {
    const { firstName, lastName } = parseCustomerName(formData.customerName);

    const payload = {
      firstName,
      lastName,
      email: formData.customerEmail,
      phone: formData.customerPhone,
      address: formData.customerAddress,
      shopkeeperId:
        (session?.user as any)?.shopkeeperId || (session?.user as any)?.id,
    };

    try {
      const response = await axiosInstance.post("/customer/create", payload);

      if (response.data?.success || response.data?.data?._id) {
        const customerId = response.data.data?._id || response.data?.data?.id;
        return { success: true, customerId };
      }

      if (response.data?.message?.includes("already exists")) {
        return {
          success: false,
          error:
            "Customer with this email already exists. Please use a different email.",
        };
      }

      return {
        success: false,
        error: response.data?.message || "Failed to create customer",
      };
    } catch (error: any) {
      if (
        error.response?.data?.message?.includes("already exists") ||
        error.response?.data?.errorSources?.[0]?.message?.includes(
          "already exists",
        )
      ) {
        return {
          success: false,
          error:
            "Customer with this email already exists. Please use a different email address.",
        };
      }

      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Failed to create customer. Please try again.",
      };
    }
  };

  const handlePaymentMethodChange = (
    method: InvoiceFormData["paymentMethod"],
  ) => {
    setFormData({
      ...formData,
      paymentMethod: method,
      tradeInDetails:
        method === "tradein"
          ? buildTradeInDetails(formData.price, tradeInValue)
          : undefined,
    });
    setCustomerError(null);
    // Reset trade-in value when switching away from trade-in
    if (method !== "tradein") {
      setTradeInValue(0);
    }
  };

  const handleTradeInChange = (value: number) => {
    const validValue = Math.max(0, value);
    setTradeInValue(validValue);
    setFormData({
      ...formData,
      tradeInDetails: buildTradeInDetails(formData.price, validValue),
    });
    clearFieldError("tradeIn");
  };

  const handleBankDetailsChange = (accountNumber: string) => {
    setBankAccountNumber(accountNumber);
    const maskedNumber =
      accountNumber.length > 4 ? `****${accountNumber.slice(-4)}` : "****";
    setFormData({
      ...formData,
      bankDetails: {
        accountName: formData.customerName,
        accountNumber: accountNumber,
        maskedNumber: maskedNumber,
      },
    });
    clearFieldError("bankAccount");
  };

  const handleInputChange = (
    field: keyof InvoiceFormData,
    value: string | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "price" &&
      prev.paymentMethod === "tradein" &&
      tradeInValue > 0
        ? {
            tradeInDetails: buildTradeInDetails(value as number, tradeInValue),
          }
        : {}),
    }));
    clearFieldError(field as string);
    setCustomerError(null);
  };

  const handleCurrencyChange = (nextCurrency: string) => {
    if (!nextCurrency || nextCurrency === selectedCurrency) return;

    const convertedPrice = Number(
      convertAmount(formData.price, selectedCurrency, nextCurrency).toFixed(2),
    );
    const convertedTradeInValue = Number(
      convertAmount(tradeInValue, selectedCurrency, nextCurrency).toFixed(2),
    );

    setSelectedCurrency(nextCurrency);
    setTradeInValue(convertedTradeInValue);
    setFormData((prev) => ({
      ...prev,
      price: convertedPrice,
      currency: nextCurrency,
      tradeInDetails:
        prev.paymentMethod === "tradein"
          ? buildTradeInDetails(convertedPrice, convertedTradeInValue)
          : undefined,
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsCreatingCustomer(true);
    setCustomerError(null);

    try {
      const result = await createCustomer();

      if (result.success && result.customerId) {
        const invoiceData: InvoiceFormData = {
          ...formData,
          currency: selectedCurrency,
          customerId: result.customerId,
        };
        onGenerate(invoiceData);
        onClose();
      } else {
        setCustomerError(
          result.error || "Failed to create customer. Please try again.",
        );
      }
    } catch (error) {
      console.error("Error in customer creation:", error);
      setCustomerError("An unexpected error occurred. Please try again.");
    } finally {
      setIsCreatingCustomer(false);
    }
  };

  const remainingAmount = formData.tradeInDetails?.remainingAmount || 0;
  const isReceiving = formData.tradeInDetails?.isReceiving || false;

  const getFieldError = (field: string): string | undefined => {
    return fieldErrors.find((e) => e.field === field)?.message;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white dark:bg-card text-foreground rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-card border-b border-gray-100 dark:border-border px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#84CC16]/10 rounded-xl">
                  <DollarSign size={20} className="text-[#84CC16]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-foreground">
                    Smart Invoice
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-muted-foreground">
                    Fill customer & payment details
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-muted rounded-full transition cursor-pointer"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Error Message */}
            {customerError && (
              <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle
                  size={16}
                  className="text-red-500 mt-0.5 shrink-0"
                />
                <p className="text-sm text-red-600">{customerError}</p>
              </div>
            )}

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Customer Information */}
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-muted-foreground uppercase tracking-wider mb-3 block">
                  Customer Information
                </label>
                <div className="space-y-3">
                  <div>
                    <div className="relative">
                      <User
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        placeholder="Full Name *"
                        value={formData.customerName}
                        onChange={(e) =>
                          handleInputChange("customerName", e.target.value)
                        }
                        className={`w-full pl-10 pr-4 py-2.5 border bg-background text-foreground rounded-xl focus:ring-2 focus:ring-[#84CC16]/20 outline-none transition ${
                          getFieldError("customerName")
                            ? "border-red-500 focus:border-red-500"
                            : "border-gray-200 dark:border-input focus:border-[#84CC16]"
                        }`}
                      />
                    </div>
                    {getFieldError("customerName") && (
                      <p className="text-xs text-red-500 mt-1">
                        {getFieldError("customerName")}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="relative">
                      <Mail
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="email"
                        placeholder="Email Address *"
                        value={formData.customerEmail}
                        onChange={(e) =>
                          handleInputChange("customerEmail", e.target.value)
                        }
                        className={`w-full pl-10 pr-4 py-2.5 border bg-background text-foreground rounded-xl focus:ring-2 focus:ring-[#84CC16]/20 outline-none transition ${
                          getFieldError("customerEmail")
                            ? "border-red-500 focus:border-red-500"
                            : "border-gray-200 dark:border-input focus:border-[#84CC16]"
                        }`}
                      />
                    </div>
                    {getFieldError("customerEmail") && (
                      <p className="text-xs text-red-500 mt-1">
                        {getFieldError("customerEmail")}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="relative">
                      <MapPin
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <AddressAutocomplete
                        type="text"
                        placeholder="Address *"
                        value={formData.customerAddress}
                        onChange={(e) =>
                          handleInputChange("customerAddress", e.target.value)
                        }
                        className={`w-full pl-10 pr-4 py-2.5 border bg-background text-foreground rounded-xl focus:ring-2 focus:ring-[#84CC16]/20 outline-none transition ${
                          getFieldError("customerAddress")
                            ? "border-red-500 focus:border-red-500"
                            : "border-gray-200 dark:border-input focus:border-[#84CC16]"
                        }`}
                      />
                    </div>
                    {getFieldError("customerAddress") && (
                      <p className="text-xs text-red-500 mt-1">
                        {getFieldError("customerAddress")}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="relative">
                      <Phone
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number *"
                        value={formData.customerPhone}
                        onChange={(e) =>
                          handleInputChange("customerPhone", e.target.value)
                        }
                        className={`w-full pl-10 pr-4 py-2.5 border bg-background text-foreground rounded-xl focus:ring-2 focus:ring-[#84CC16]/20 outline-none transition ${
                          getFieldError("customerPhone")
                            ? "border-red-500 focus:border-red-500"
                            : "border-gray-200 dark:border-input focus:border-[#84CC16]"
                        }`}
                      />
                    </div>
                    {getFieldError("customerPhone") && (
                      <p className="text-xs text-red-500 mt-1">
                        {getFieldError("customerPhone")}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-muted-foreground uppercase tracking-wider mb-3 block">
                  Price Details
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 dark:text-muted-foreground mb-1 block">
                      Currency
                    </label>
                    <select
                      value={selectedCurrency}
                      onChange={(e) => handleCurrencyChange(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-input rounded-xl focus:ring-2 focus:ring-[#84CC16]/20 focus:border-[#84CC16] outline-none transition bg-white dark:bg-background text-foreground"
                    >
                      {currencyOptions.map((option) => (
                        <option key={option.code} value={option.code}>
                          {option.code} - {option.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="relative">
                    <DollarSign
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        handleInputChange("price", Number(e.target.value))
                      }
                      className={`w-full pl-10 pr-4 py-2.5 border bg-background text-foreground rounded-xl focus:ring-2 focus:ring-[#84CC16]/20 outline-none transition ${
                        getFieldError("price")
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-200 dark:border-input focus:border-[#84CC16]"
                      }`}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-muted-foreground">
                    Current invoice amount:{" "}
                    {formatSelectedCurrency(formData.price)}
                  </p>
                  {getFieldError("price") && (
                    <p className="text-xs text-red-500 mt-1">
                      {getFieldError("price")}
                    </p>
                  )}
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-muted-foreground uppercase tracking-wider mb-3 block">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => handlePaymentMethodChange("cash")}
                    className={`py-2.5 rounded-xl border-2 flex items-center justify-center gap-2 transition cursor-pointer ${
                      formData.paymentMethod === "cash"
                        ? "border-[#84CC16] bg-[#84CC16]/5 text-[#84CC16]"
                        : "border-gray-200 dark:border-input text-gray-500 dark:text-muted-foreground hover:border-gray-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <CreditCard size={16} />
                    <span className="text-sm font-semibold">Cash</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePaymentMethodChange("bank")}
                    className={`py-2.5 rounded-xl border-2 flex items-center justify-center gap-2 transition cursor-pointer ${
                      formData.paymentMethod === "bank"
                        ? "border-[#84CC16] bg-[#84CC16]/5 text-[#84CC16]"
                        : "border-gray-200 dark:border-input text-gray-500 dark:text-muted-foreground hover:border-gray-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <Landmark size={16} />
                    <span className="text-sm font-semibold">Bank</span>
                  </button>
                </div>
              </div>

              {/* Bank Transfer Details */}
              {formData.paymentMethod === "bank" && (
                <div className="bg-blue-50 dark:bg-blue-950/40 rounded-xl p-4 border border-blue-200 dark:border-blue-900">
                  <p className="text-xs font-bold text-blue-700 mb-2">
                    Bank Transfer Details
                  </p>
                  <input
                    type="text"
                    placeholder="Account Number *"
                    value={bankAccountNumber}
                    onChange={(e) => handleBankDetailsChange(e.target.value)}
                    className={`w-full px-4 py-2 bg-white dark:bg-background text-foreground border rounded-lg focus:border-[#84CC16] outline-none text-sm ${
                      getFieldError("bankAccount")
                        ? "border-red-500"
                        : "border-blue-200"
                    }`}
                  />
                  {getFieldError("bankAccount") && (
                    <p className="text-xs text-red-500 mt-1">
                      {getFieldError("bankAccount")}
                    </p>
                  )}
                  <p className="text-[10px] text-blue-600 mt-2">
                    Account Name: {formData.customerName || "Customer Name"}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white dark:bg-card border-t border-gray-100 dark:border-border px-6 py-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-input text-gray-700 dark:text-foreground font-semibold text-sm hover:bg-gray-50 dark:hover:bg-muted transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isGenerating || isCreatingCustomer}
                className="flex-1 py-2.5 rounded-xl bg-[#84CC16] text-white font-semibold text-sm hover:bg-[#76b813] transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isCreatingCustomer || isGenerating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <DollarSign size={16} />
                )}
                {isCreatingCustomer
                  ? "Creating Customer..."
                  : isGenerating
                    ? "Generating..."
                    : "Generate Invoice"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
