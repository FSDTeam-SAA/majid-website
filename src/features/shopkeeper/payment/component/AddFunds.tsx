"use client";

import React from "react";
import { CheckCircle2, Zap, Brain, Shield, Diamond } from "lucide-react";
import { motion } from "framer-motion";
import { useCreatePaymentSession } from "../hooks/usePayments";
import { useSubscriptions } from "../hooks/useSubscriptions";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SubscriptionFeature {
  name: string;
  included: boolean;
}

interface SubscriptionPlan {
  _id: string;
  name: string;
  type: string;
  price: number;
  priceLabel: string;
  description: string;
  features: SubscriptionFeature[];
  discount?: number;
  customPricing: boolean;
  ctaText: string;
}

// Design mappings for dynamic plans based on index
const getPlanDesign = (index: number) => {
  const designs = [
    {
      bgColor: "bg-[#E0F2FE] dark:bg-blue-950/30", // Light blue
      badgeColor: "text-blue-600 bg-white dark:bg-blue-950 dark:text-blue-200",
      btnColor:
        "bg-white text-[#3B82F6] border-[#3B82F6] hover:bg-[#3B82F6] hover:text-white hover:border-[#3B82F6]",
      icon: <Shield size={20} className="text-[#3B82F6]" />,
      largeIcon: <Shield size={120} className="text-[#3B82F6]" />,
    },
    {
      bgColor: "bg-[#ECFCCB] dark:bg-lime-950/25", // Light green
      badgeColor: "text-green-600 bg-white dark:bg-lime-950 dark:text-lime-200",
      btnColor:
        "bg-white text-[#84CC16] border-[#84CC16] hover:bg-[#84CC16] hover:text-white hover:border-[#84CC16]",
      icon: <Zap size={20} className="text-[#84CC16]" />,
      largeIcon: <Zap size={120} className="text-[#84CC16]" />,
    },
    {
      bgColor: "bg-[#FEF08A]/30 dark:bg-yellow-950/25", // Light yellow for Diamond
      badgeColor:
        "text-yellow-600 bg-white dark:bg-yellow-950 dark:text-yellow-200",
      btnColor:
        "bg-white text-[#EAB308] border-[#EAB308] hover:bg-[#EAB308] hover:text-white hover:border-[#EAB308]",
      icon: <Diamond size={20} className="text-[#EAB308]" />,
      largeIcon: <Diamond size={120} className="text-[#EAB308]" />,
    },
    {
      bgColor: "bg-[#F3E8FF] dark:bg-purple-950/25", // Light purple
      badgeColor:
        "text-purple-600 bg-white dark:bg-purple-950 dark:text-purple-200",
      btnColor:
        "bg-white text-[#A855F7] border-[#A855F7] hover:bg-[#A855F7] hover:text-white hover:border-[#A855F7]",
      icon: <Brain size={20} className="text-[#A855F7]" />,
      largeIcon: <Brain size={120} className="text-[#A855F7]" />,
    },
  ];
  return designs[index % designs.length];
};

export default function AddFunds() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedPlan, setSelectedPlan] =
    React.useState<SubscriptionPlan | null>(null);
  const [amount, setAmount] = React.useState("");

  const { data: subscriptionData, isLoading } = useSubscriptions();
  const plans = subscriptionData?.data || [];
  const paymentCurrency = process.env.NEXT_PUBLIC_PAYMENT_CURRENCY || "EUR";
  const formatPaymentAmount = React.useCallback(
    (value: number) =>
      new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: paymentCurrency,
      }).format(value),
    [paymentCurrency],
  );

  const { mutate: createPayment, isPending } = useCreatePaymentSession();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const maxAmount = selectedPlan?.price || 0;

    if (!value) {
      setAmount("");
      return;
    }

    const numAmount = parseFloat(value);

    if (maxAmount && numAmount > maxAmount) {
      setAmount(maxAmount.toString());
      return;
    }

    setAmount(value);
  };

  const handleTopUp = () => {
    const numAmount = parseFloat(amount);
    const minAmount = selectedPlan?.price || 2;
    const maxAmount = selectedPlan?.price || 2;

    if (isNaN(numAmount) || numAmount < minAmount) {
      toast.error(`Please enter a valid amount (minimum $${minAmount})`);
      return;
    }

    if (numAmount > maxAmount) {
      toast.error(`Amount cannot be greater than $${maxAmount}`);
      return;
    }

    createPayment(
      {
        subscriptionId: selectedPlan?._id || "",
      },
      {
        onSuccess: (res) => {
          const checkout = res?.data;

          if (!checkout?.actionUrl || !checkout?.params) {
            toast.error("Failed to get checkout URL");
            return;
          }

          const form = document.createElement("form");
          form.method = "POST";
          form.action = checkout.actionUrl;

          Object.entries(checkout.params as Record<string, string>).forEach(
            ([key, value]) => {
              const input = document.createElement("input");
              input.type = "hidden";
              input.name = key;
              input.value = value;
              form.appendChild(input);
            },
          );

          document.body.appendChild(form);
          form.submit();
        },
        onError: () => {
          toast.error("An error occurred while initiating payment");
        },
      },
    );
  };

  return (
    <div className="dashboard-page">
      {/* Header Section */}
      <div className="mx-auto max-w-[1600px] space-y-2">
        <h1 className="text-3xl font-black text-foreground tracking-tight">
          Pricing Plan
        </h1>
        <p className="font-medium text-muted-foreground">
          Track your payment status and invoices.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[#84CC16]" />
        </div>
      ) : (
        <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan: SubscriptionPlan, i: number) => {
            const design = getPlanDesign(i);

            return (
              <motion.div
                key={plan._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-[40px] p-8 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-xl transition-all group ${design.bgColor}`}
              >
                <div className="space-y-6 relative z-10">
                  <div className="flex justify-between items-start h-8">
                    {plan.type && (
                      <span
                        className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest ${design.badgeColor}`}
                      >
                        {plan.type}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-[14px] font-black uppercase tracking-wider text-slate-950 dark:text-white">
                      {plan.name}
                    </h2>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-950 dark:text-white">
                        {formatPaymentAmount(plan.price)}
                      </span>
                    </div>
                    <p className="h-8 text-xs font-medium text-slate-600 dark:text-slate-300">
                      {plan.description}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {plan.features.map(
                      (feature: SubscriptionFeature, idx: number) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div
                            className={`p-1 rounded-full ${feature.included ? "bg-white/50" : "opacity-50"}`}
                          >
                            <CheckCircle2
                              size={16}
                              className={
                                feature.included
                                  ? "text-[#3B82F6]"
                                  : "text-gray-400"
                              }
                            />
                          </div>
                          <span
                            className={`text-[13px] font-bold ${feature.included ? "text-slate-700 dark:text-slate-200" : "text-gray-400 line-through"}`}
                          >
                            {feature.name}
                          </span>
                        </div>
                      ),
                    )}
                  </div>

                  {plan.discount !== undefined && plan.discount > 0 && (
                    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <Diamond size={18} className="text-[#3B82F6]" />
                        <span className="text-sm font-black text-foreground">
                          Discount
                        </span>
                      </div>
                      <span className="text-sm font-black text-foreground">
                        {plan.discount}% Off
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-8 relative z-10">
                  <button
                    onClick={() => {
                      if (plan.price > 0 && !plan.customPricing) {
                        setSelectedPlan(plan);
                        setAmount(plan.price.toFixed(2));
                        setIsModalOpen(true);
                      } else if (plan.customPricing) {
                        toast.info(
                          "Please contact our support for Enterprise solutions.",
                        );
                      }
                    }}
                    className={`w-full py-4 rounded-full border-2 font-black text-sm transition-all shadow-sm active:scale-[0.98] ${design.btnColor}`}
                  >
                    {plan.ctaText}
                  </button>
                </div>

                {/* Decorative Icon Background */}
                <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:scale-110 transition-transform duration-500">
                  {design.largeIcon}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Top Up Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Top Up Wallet</DialogTitle>
            <DialogDescription>
              Enter the amount you would like to top up. Minimum amount for{" "}
              {selectedPlan?.name || "this plan"} is{" "}
              {formatPaymentAmount(selectedPlan?.price || 2)}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Amount ({paymentCurrency})
              </label>
              <Input
                type="number"
                placeholder={`e.g. ${(selectedPlan?.price || 15).toFixed(2)}`}
                value={amount}
                onChange={handleAmountChange}
                min={selectedPlan?.price || 2}
                max={selectedPlan?.price || 2}
                step="0.01"
              />
            </div>

            <Button
              className="w-full bg-[#84CC16] hover:bg-[#76b813] text-white"
              onClick={handleTopUp}
              disabled={isPending || !amount}
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Proceed to myPOS Checkout
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
