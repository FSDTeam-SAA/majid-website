"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Pencil,
  Camera,
  Loader2,
  Store,
  MessageCircle,
  User,
  Globe,
  ArrowUpRight,
  Crown,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useMyProfile,
  useUpdateProfile,
} from "@/features/shopkeeper/settings/hooks/useSettings";
import { useMyPayments } from "@/features/shopkeeper/payment/hooks/usePayments";
import { useSubscriptions } from "@/features/shopkeeper/payment/hooks/useSubscriptions";
import {
  profileSchema,
  ProfileValues,
} from "@/features/shopkeeper/settings/types";
import { detectCurrency } from "@/features/shopkeeper/settings/api/settings.api";
import { CURRENCY_LIST, getCurrencySymbol } from "@/lib/currency";
import { shouldAutoDetectCurrency } from "@/features/shopkeeper/settings/utils/currencyDetection";
import { normalizeGoogleReviewPageUrl } from "@/features/shopkeeper/settings/utils/googleReviewQr";

export default function ProfilePage() {
  const { data: profileData, isLoading } = useMyProfile();
  const updateProfileMutation = useUpdateProfile();
  const { data: paymentsData } = useMyPayments();
  const { data: subscriptionsData } = useSubscriptions();

  const [isEditing, setIsEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [manualCurrency, setManualCurrency] = useState<string | null>(null);
  const [detectedCurrency, setDetectedCurrency] = useState<string | null>(null);
  const [isDetectingCurrency, setIsDetectingCurrency] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const detectedCurrencyUserIdRef = useRef<string | null>(null);

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      shopName: "",
      shopAddress: "",
      whatsappNumber: "",
      googleReviewPageUrl: "",
    },
  });

  const profile = profileData?.data;

  useEffect(() => {
    if (!profile) {
      return;
    }

    profileForm.reset({
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      email: profile.email || "",
      phone: profile.phone || "",
      shopName: profile.shopName || "",
      shopAddress: profile.shopAddress || "",
      whatsappNumber: profile.whatsappNumber || "",
      googleReviewPageUrl: profile.googleReviewPageUrl || "",
    });
  }, [profile, profileForm.reset]);

  useEffect(() => {
    if (!profile || !shouldAutoDetectCurrency(profile.currency)) {
      return;
    }

    if (detectedCurrencyUserIdRef.current === profile._id) {
      return;
    }

    detectedCurrencyUserIdRef.current = profile._id;

    (async () => {
      try {
        setIsDetectingCurrency(true);
        const res = await detectCurrency();
        if (res?.data?.currency) {
          setDetectedCurrency(res.data.currency);
          const formData = new FormData();
          formData.append("currency", res.data.currency);
          await updateProfileMutation.mutateAsync(formData);
        }
      } catch {
        // Silent fallback to USD
      } finally {
        setIsDetectingCurrency(false);
      }
    })();
  }, [profile, updateProfileMutation]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (profileData?.data?.image?.url) {
        setImagePreview(profileData.data.image.url);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [profileData?.data?.image?.url]);

  const onProfileSubmit = async (values: ProfileValues) => {
    const formData = new FormData();
    formData.append("firstName", values.firstName);
    formData.append("lastName", values.lastName);
    formData.append("email", values.email);
    formData.append("phone", values.phone);
    formData.append("shopName", values.shopName);
    formData.append("shopAddress", values.shopAddress);
    formData.append("whatsappNumber", values.whatsappNumber);
    formData.append(
      "googleReviewPageUrl",
      normalizeGoogleReviewPageUrl(values.googleReviewPageUrl),
    );
    formData.append("currency", currency);

    if (selectedImage) {
      formData.append("image", selectedImage);
    }

    await updateProfileMutation.mutateAsync(formData);
    setIsEditing(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const plans = React.useMemo(
    () => subscriptionsData?.data || [],
    [subscriptionsData],
  );

  const activeSubscriptionPayment = React.useMemo(() => {
    const payments = Array.isArray(paymentsData?.data) ? paymentsData.data : [];

    return payments
      .filter(
        (payment: {
          createdAt?: string;
          status?: string;
          paymentStatus?: string;
          subscriptionId?: string | { _id?: string };
        }) => {
          const subscriptionId =
            typeof payment.subscriptionId === "string"
              ? payment.subscriptionId
              : payment.subscriptionId?._id;

          return (
            Boolean(subscriptionId) &&
            (payment.status === "completed" || payment.paymentStatus === "paid")
          );
        },
      )
      .sort(
        (a: { createdAt?: string }, b: { createdAt?: string }) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime(),
      )[0];
  }, [paymentsData]);

  const activePlan = React.useMemo(() => {
    const subscriptionId =
      typeof activeSubscriptionPayment?.subscriptionId === "string"
        ? activeSubscriptionPayment.subscriptionId
        : activeSubscriptionPayment?.subscriptionId?._id;

    return plans.find((plan: { _id: string }) => plan._id === subscriptionId);
  }, [activeSubscriptionPayment, plans]);

  const recommendedUpgradePlan = React.useMemo(() => {
    if (!plans.length) return null;

    const sortedPlans = [...plans].sort(
      (
        a: { price: number; customPricing?: boolean },
        b: { price: number; customPricing?: boolean },
      ) => {
        const aPrice = a.customPricing ? Number.POSITIVE_INFINITY : a.price;
        const bPrice = b.customPricing ? Number.POSITIVE_INFINITY : b.price;
        return aPrice - bPrice;
      },
    );

    if (activePlan) {
      const nextHigherPlan = sortedPlans.find(
        (plan: { _id: string; price: number; customPricing?: boolean }) =>
          plan._id !== activePlan._id &&
          !plan.customPricing &&
          plan.price > activePlan.price,
      );

      if (nextHigherPlan) return nextHigherPlan;
    }

    return (
      sortedPlans.find(
        (plan: { _id: string; customPricing?: boolean }) =>
          plan._id !== activePlan?._id && !plan.customPricing,
      ) || null
    );
  }, [activePlan, plans]);

  const multiAccountPlan = React.useMemo(() => {
    return (
      plans.find(
        (plan: {
          _id: string;
          name?: string;
          type?: string;
          description?: string;
          features?: Array<{ name?: string }>;
        }) => {
          const searchableText = [
            plan.name,
            plan.type,
            plan.description,
            ...(plan.features || []).map((feature) => feature.name),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return /multi|team|staff|business|enterprise/.test(searchableText);
        },
      ) || null
    );
  }, [plans]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const user = profileData?.data;
  const currency =
    manualCurrency ?? user?.currency ?? detectedCurrency ?? "USD";

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-card rounded-[32px] border border-border shadow-sm overflow-hidden"
      >
        <div className="p-8 border-b border-border/50 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-black text-foreground tracking-tight">
              Active Plan
            </h2>
            <p className="text-sm font-medium text-muted-foreground">
              Review your current plan and upgrade from account settings.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#84CC16]/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#4d8a06]">
            <Crown className="h-4 w-4" />
            {activePlan ? "Plan Active" : "No Active Plan"}
          </span>
        </div>

        <div className="p-8 space-y-6">
          <div className="rounded-[28px] border border-border bg-background p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                  Current Subscription
                </p>
                <div>
                  <h3 className="text-2xl font-black text-foreground tracking-tight">
                    {activePlan?.name || "Free / pay as you go"}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-muted-foreground">
                    {activePlan?.description ||
                      "You can choose a higher-tier or multi-account setup any time."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 text-sm font-bold text-muted-foreground">
                  <span className="rounded-full bg-card px-4 py-2">
                    {activePlan?.type || "Starter access"}
                  </span>
                  <span className="rounded-full bg-card px-4 py-2">
                    {activePlan ? `$${activePlan.price}` : "Flexible pricing"}
                  </span>
                </div>
              </div>

              {activeSubscriptionPayment?.createdAt ? (
                <div className="rounded-2xl bg-card px-5 py-4 text-sm font-bold text-muted-foreground">
                  Active since{" "}
                  <span className="text-foreground">
                    {new Date(
                      activeSubscriptionPayment.createdAt,
                    ).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              ) : null}
            </div>

            {Array.isArray(activePlan?.features) &&
            activePlan.features.length ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {activePlan.features
                  .filter((feature: { included?: boolean }) => feature.included)
                  .slice(0, 4)
                  .map((feature: { name: string }, index: number) => (
                    <span
                      key={`${feature.name}-${index}`}
                      className="rounded-full border border-border px-3 py-1.5 text-xs font-bold text-foreground"
                    >
                      {feature.name}
                    </span>
                  ))}
              </div>
            ) : null}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Link
              href="/shopkeeper/pricing"
              className="rounded-[28px] border border-border bg-background p-6 transition hover:border-[#84CC16]/40 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#84CC16]/10 text-[#4d8a06]">
                    <ArrowUpRight className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-black text-foreground">
                    Upgrade to a higher plan
                  </h3>
                  <p className="text-sm font-medium text-muted-foreground">
                    {recommendedUpgradePlan
                      ? `Move up to ${recommendedUpgradePlan.name} from your account settings.`
                      : "See available higher-tier plans and choose the right upgrade."}
                  </p>
                </div>
                <span className="text-xs font-black uppercase tracking-[0.18em] text-[#84CC16]">
                  Upgrade
                </span>
              </div>
            </Link>

            <Link
              href="/shopkeeper/pricing"
              className="rounded-[28px] border border-border bg-background p-6 transition hover:border-[#84CC16]/40 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3B82F6]/10 text-[#3B82F6]">
                    <Users className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-black text-foreground">
                    Multi-account setup
                  </h3>
                  <p className="text-sm font-medium text-muted-foreground">
                    {multiAccountPlan
                      ? `Choose ${multiAccountPlan.name} if you need multi-account access for your team.`
                      : "Explore team and multi-account options from the pricing page."}
                  </p>
                </div>
                <span className="text-xs font-black uppercase tracking-[0.18em] text-[#3B82F6]">
                  Team Setup
                </span>
              </div>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-[32px] p-8 shadow-sm flex items-center gap-6"
      >
        <div
          className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-muted shadow-inner group cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          {imagePreview ? (
            <Image
              src={imagePreview}
              alt="Profile"
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <User className="w-10 h-10 text-muted-foreground" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="text-white w-6 h-6" />
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-muted-foreground font-bold text-sm uppercase tracking-wider">
            {user?.role}
          </p>
        </div>
      </motion.div>

      {/* Personal Information Section */}
      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-[32px] shadow-sm overflow-hidden"
        >
          <div className="p-8 flex justify-between items-center">
            <h2 className="text-xl font-black text-foreground tracking-tight">
              Personal & Shop Information
            </h2>
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground font-black text-sm rounded-xl hover:opacity-90 transition shadow-lg shadow-primary/20 active:scale-95 cursor-pointer"
              >
                <Pencil size={16} strokeWidth={3} />
                <span>Edit</span>
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    profileForm.reset();
                  }}
                  className="px-6 py-2 bg-muted text-muted-foreground font-black text-sm rounded-xl hover:opacity-90 transition active:scale-95 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground font-black text-sm rounded-xl hover:opacity-90 transition shadow-lg shadow-primary/20 active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {updateProfileMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* First Name */}
              <div className="space-y-2">
                <label className="text-[13px] font-black text-foreground ml-1">
                  First Name
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  {...profileForm.register("firstName")}
                  className="w-full px-6 py-4 bg-background border border-border rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm font-semibold text-muted-foreground disabled:opacity-70"
                />
                {profileForm.formState.errors.firstName && (
                  <span className="text-xs text-destructive font-bold ml-1">
                    {profileForm.formState.errors.firstName.message}
                  </span>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label className="text-[13px] font-black text-foreground ml-1">
                  Last Name
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  {...profileForm.register("lastName")}
                  className="w-full px-6 py-4 bg-background border border-border rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm font-semibold text-muted-foreground disabled:opacity-70"
                />
                {profileForm.formState.errors.lastName && (
                  <span className="text-xs text-destructive font-bold ml-1">
                    {profileForm.formState.errors.lastName.message}
                  </span>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-[13px] font-black text-foreground ml-1 flex items-center gap-2">
                  <Mail size={14} /> Email Address
                </label>
                <input
                  type="email"
                  disabled={true}
                  {...profileForm.register("email")}
                  className="w-full px-6 py-4 bg-background border border-border rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm font-semibold text-muted-foreground opacity-50"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-[13px] font-black text-foreground ml-1 flex items-center gap-2">
                  <Phone size={14} /> Phone
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  {...profileForm.register("phone")}
                  className="w-full px-6 py-4 bg-background border border-border rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm font-semibold text-muted-foreground disabled:opacity-70"
                />
                {profileForm.formState.errors.phone && (
                  <span className="text-xs text-destructive font-bold ml-1">
                    {profileForm.formState.errors.phone.message}
                  </span>
                )}
              </div>

              {/* Shop Name */}
              <div className="space-y-2">
                <label className="text-[13px] font-black text-foreground ml-1 flex items-center gap-2">
                  <Store size={14} /> Shop Name
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  {...profileForm.register("shopName")}
                  className="w-full px-6 py-4 bg-background border border-border rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm font-semibold text-muted-foreground disabled:opacity-70"
                />
                {profileForm.formState.errors.shopName && (
                  <span className="text-xs text-destructive font-bold ml-1">
                    {profileForm.formState.errors.shopName.message}
                  </span>
                )}
              </div>

              {/* WhatsApp Number */}
              <div className="space-y-2">
                <label className="text-[13px] font-black text-foreground ml-1 flex items-center gap-2">
                  <MessageCircle size={14} /> WhatsApp Number
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  {...profileForm.register("whatsappNumber")}
                  className="w-full px-6 py-4 bg-background border border-border rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm font-semibold text-muted-foreground disabled:opacity-70"
                />
                {profileForm.formState.errors.whatsappNumber && (
                  <span className="text-xs text-destructive font-bold ml-1">
                    {profileForm.formState.errors.whatsappNumber.message}
                  </span>
                )}
              </div>

              {/* Shop Address */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-[13px] font-black text-foreground ml-1 flex items-center gap-2">
                  <MapPin size={14} /> Shop Address
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  {...profileForm.register("shopAddress")}
                  className="w-full px-6 py-4 bg-background border border-border rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm font-semibold text-muted-foreground disabled:opacity-70"
                />
                {profileForm.formState.errors.shopAddress && (
                  <span className="text-xs text-destructive font-bold ml-1">
                    {profileForm.formState.errors.shopAddress.message}
                  </span>
                )}
              </div>

              {/* Google Review URL */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-[13px] font-black text-foreground ml-1 flex items-center gap-2">
                  <Globe size={14} /> Google Review Page URL
                </label>
                <input
                  type="url"
                  disabled={!isEditing}
                  placeholder="https://g.page/r/your-review-link/review"
                  {...profileForm.register("googleReviewPageUrl")}
                  className="w-full px-6 py-4 bg-background border border-border rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm font-semibold text-muted-foreground disabled:opacity-70"
                />
                {profileForm.formState.errors.googleReviewPageUrl && (
                  <span className="text-xs text-destructive font-bold ml-1">
                    {profileForm.formState.errors.googleReviewPageUrl.message}
                  </span>
                )}
                <p className="text-[11px] text-muted-foreground ml-1">
                  This link will be converted into a QR code on receipts and
                  invoice PDFs.
                </p>
              </div>

              {/* Currency */}
              <div className="space-y-2">
                <label className="text-[13px] font-black text-foreground ml-1 flex items-center gap-2">
                  <Globe size={14} /> Currency
                  {isDetectingCurrency && (
                    <Loader2
                      size={12}
                      className="animate-spin text-muted-foreground"
                    />
                  )}
                </label>
                <select
                  disabled={!isEditing}
                  value={currency}
                  onChange={(e) => setManualCurrency(e.target.value)}
                  className="w-full px-6 py-4 bg-background border border-border rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm font-semibold text-muted-foreground disabled:opacity-70 appearance-none cursor-pointer"
                >
                  {CURRENCY_LIST.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.symbol} {c.code} - {c.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-muted-foreground ml-1">
                  {getCurrencySymbol(currency)} All prices will be displayed in{" "}
                  {currency}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </form>
    </div>
  );
}
