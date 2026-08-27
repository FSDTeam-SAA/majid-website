"use client";

import { useState } from "react";
import { useSubscriptions } from "@/features/shopkeeper/payment/hooks/useSubscriptions";
import { useCreatePaymentSession } from "@/features/shopkeeper/payment/hooks/usePayments";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { CheckCircle2, CircleX, Gem, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import RyftPaymentModal from "@/features/shopkeeper/payment/component/RyftPaymentModal";

interface Feature {
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
  ctaText: string;
  customPricing: boolean;
  isAvailable: boolean;
  isPopular: boolean;
  apiAccess: boolean;
  discount?: number;
  features: Feature[];
}

export default function Pricing() {
  const { data: subscriptionData, isLoading } = useSubscriptions();
  const plans = subscriptionData?.data || [];

  const { mutate: createPayment, isPending } = useCreatePaymentSession();
  const paymentCurrency = process.env.NEXT_PUBLIC_PAYMENT_CURRENCY || "GBP";
  const formatPaymentAmount = (value: number) =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: paymentCurrency,
    }).format(value);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null,
  );
  const [amount, setAmount] = useState("");
  const [ryftSession, setRyftSession] = useState<{
    clientSecret: string;
    publicKey?: string;
    amount: number;
  } | null>(null);
  const [isRyftModalOpen, setIsRyftModalOpen] = useState(false);

  const handleTopUp = () => {
    const numAmount = parseFloat(amount);
    const minAmount = selectedPlan?.price || 2;

    if (
      isNaN(numAmount) ||
      numAmount < minAmount ||
      numAmount !== selectedPlan?.price
    ) {
      toast.error(
        `Please enter the plan price of ${minAmount} ${paymentCurrency}`,
      );
      return;
    }

    createPayment(
      {
        subscriptionId: selectedPlan?._id || "",
        amount: numAmount,
        currency: paymentCurrency,
      },
      {
        onSuccess: (res) => {
          const checkout = res?.data;

          if (checkout?.clientSecret) {
            setIsModalOpen(false);
            setRyftSession({
              clientSecret: checkout.clientSecret,
              publicKey: checkout.publicKey,
              amount: numAmount,
            });
            setIsRyftModalOpen(true);
            return;
          }

          if (checkout?.url) {
            window.location.href = checkout.url;
            return;
          }

          toast.error("Failed to initialize payment session");
        },
        onError: (err: unknown) => {
          const error = err as { response?: { status?: number } };
          if (error.response?.status === 401) {
            toast.error("Please login to continue");
            window.location.href = "/auth/login";
          } else {
            toast.error("An error occurred while initiating payment");
          }
        },
      },
    );
  };

  if (isLoading) {
    return (
      <section className="py-24 bg-background border-t border-border">
        <div className="mx-auto container px-6 text-center">
          <div className="h-10 w-64 bg-muted animate-pulse mx-auto mb-4 rounded-lg" />
          <div className="h-6 w-96 bg-muted animate-pulse mx-auto mb-16 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-[500px] bg-muted animate-pulse rounded-[40px]"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const getPlanStyles = (type: string) => {
    switch (type) {
      case "STARTER":
        return {
          container: "bg-[#dbeafe] dark:bg-blue-500/5 border-blue-500/10",
          badge: "bg-background text-blue-500",
          button:
            "bg-white hover:bg-gray-50 border border-[#84CC16] text-[#84CC16]",
          iconColor: "text-blue-500",
        };
      case "PAY AS YOU GO":
        return {
          container:
            "bg-[#ecfccb] dark:bg-primary/5 border-primary/20 border-2 relative",
          badge:
            "bg-blue-500 text-white absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 shadow-lg shadow-blue-500/20",
          button:
            "bg-primary hover:opacity-90 text-primary-foreground shadow-lg shadow-primary/20",
          iconColor: "text-primary",
        };
      case "IMOSCAN EPOS":
      case "DIAMOND":
        return {
          container: "bg-[#e6eefb] dark:bg-purple-500/5 border-purple-500/10",
          badge: "bg-background text-purple-600",
          button:
            "bg-background hover:bg-muted text-primary border border-primary",
          iconColor: "text-purple-600",
        };
      case "ENTERPRISE":
        return {
          container:
            "bg-[#ede9fe] dark:bg-slate-800 text-white border-slate-700",
          badge: "bg-slate-800 ",
          button: "bg-white text-slate-900 hover:bg-slate-100",
          iconColor: "text-blue-400",
          isDark: true,
        };
      default:
        return {
          container: "bg-card border-border",
          badge: "bg-muted text-muted-foreground",
          button: "bg-primary text-primary-foreground",
          iconColor: "text-primary",
        };
    }
  };

  return (
    <section className="py-24 bg-background border-t border-border">
      <div className="mx-auto container text-center">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-black text-[#0F172A] dark:text-white mb-4"
        >
          Flexible <span className="text-blue-500">Pricing</span> That Fits Your{" "}
          <span className="text-primary">Needs</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground text-lg mb-16"
        >
          Start free, pay as you grow, or save more with subscriptions.
        </motion.p>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
          {plans.map((plan: SubscriptionPlan, index: number) => {
            const styles = getPlanStyles(plan.type);
            return (
              <motion.div
                key={plan._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`${styles.container} rounded-[40px] p-8 flex flex-col items-start text-left h-full border`}
              >
                {/* Popular Badge or Type Badge */}
                {plan.isPopular && plan.type !== "PAY AS YOU GO" ? (
                  <span
                    className={`${styles.badge} text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-6`}
                  >
                    {plan.name} (Popular)
                  </span>
                ) : (
                  <span
                    className={`${styles.badge} text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-6`}
                  >
                    {plan.type === "PAY AS YOU GO"
                      ? "Most Flexible"
                      : plan.name}
                  </span>
                )}

                <div className="flex flex-col gap-1 mb-8">
                  <h3 className={`text-2xl font-black text-foreground`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-3xl font-black  text-foreground`}>
                      {plan.priceLabel ||
                        (plan.price > 0
                          ? formatPaymentAmount(plan.price)
                          : "Free")}
                    </span>
                  </div>
                  <p className={`text-sm text-foreground mt-2`}>
                    {plan.description}
                  </p>
                </div>

                <div className="space-y-4 mb-10 w-full flex-grow">
                  {plan.features.map((feature: Feature, fIndex: number) => (
                    <FeatureItem
                      key={fIndex}
                      icon={
                        feature.included ? (
                          <CheckCircle2
                            className={`w-5 h-5 ${styles.iconColor}`}
                          />
                        ) : (
                          <CircleX className="w-5 h-5 text-muted-foreground opacity-50" />
                        )
                      }
                      text={feature.name}
                      active={feature.included}
                      isDark={styles.isDark}
                    />
                  ))}
                </div>

                {plan.discount && plan.discount > 0 && (
                  <div className="w-full bg-background/50 dark:bg-white/5 rounded-2xl p-4 flex items-center justify-between mb-8 border border-purple-100/20 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Gem className="w-5 h-5 text-blue-500" />
                      <span className={`text-sm font-bold text-foreground`}>
                        Diamond Offer
                      </span>
                    </div>
                    <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-1 rounded-lg uppercase">
                      {plan.discount}% Off
                    </span>
                  </div>
                )}

                <button
                  onClick={() => {
                    if (plan.price > 0 && !plan.customPricing) {
                      setSelectedPlan(plan);
                      setAmount(plan.price.toString());
                      setIsModalOpen(true);
                    } else if (plan.customPricing) {
                      toast.info(
                        "Please contact our support for Enterprise solutions.",
                      );
                    } else {
                      window.location.href = "/login";
                    }
                  }}
                  className={`w-full mt-auto font-bold py-4 rounded-2xl transition cursor-pointer ${styles.button}`}
                >
                  {plan.ctaText}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Top Up Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Top Up Wallet</DialogTitle>
              <DialogDescription>
                Enter the amount you would like to top up. Minimum amount for{" "}
                {selectedPlan?.name || "this plan"} is{" "}
                {selectedPlan?.price || 2} {paymentCurrency}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4 text-left">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Amount ({paymentCurrency})
                </label>
                <Input
                  type="number"
                  placeholder={`e.g. ${selectedPlan?.price || 15}`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min={selectedPlan?.price || 2}
                  max={selectedPlan?.price || 2}
                  step="0.01"
                />
              </div>

              <Button
                className="w-full bg-[#84CC16] hover:bg-[#76b813] text-white font-bold h-12"
                onClick={handleTopUp}
                disabled={isPending || !amount}
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Proceed to RyftPay Checkout
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {ryftSession && (
          <RyftPaymentModal
            isOpen={isRyftModalOpen}
            onClose={() => {
              setIsRyftModalOpen(false);
              setRyftSession(null);
            }}
            clientSecret={ryftSession.clientSecret}
            publicKey={ryftSession.publicKey}
            amount={ryftSession.amount}
            currency={paymentCurrency}
            title={`Subscribe to ${selectedPlan?.name || "Plan"}`}
            description={`Complete your payment of ${formatPaymentAmount(ryftSession.amount)} securely.`}
          />
        )}
      </div>
    </section>
  );
}

function FeatureItem({
  icon,
  text,
  active = true,
  isDark = false,
}: {
  icon: React.ReactNode;
  text: string;
  active?: boolean;
  isDark?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <span
        className={`text-sm font-semibold ${
          active
            ? isDark
              ? "text-foreground"
              : "text-foreground"
            : "text-muted-foreground line-through decoration-2 opacity-50"
        }`}
      >
        {text}
      </span>
    </div>
  );
}
