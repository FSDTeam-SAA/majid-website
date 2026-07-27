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
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useMyProfile,
  useUpdateProfile,
} from "@/features/shopkeeper/settings/hooks/useSettings";
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

  useEffect(() => {
    if (profileData?.data) {
      const user = profileData.data;
      profileForm.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        shopName: user.shopName || "",
        shopAddress: user.shopAddress || "",
        whatsappNumber: user.whatsappNumber || "",
        googleReviewPageUrl: user.googleReviewPageUrl || "",
      });

      if (
        shouldAutoDetectCurrency(user.currency) &&
        detectedCurrencyUserIdRef.current !== user._id
      ) {
        detectedCurrencyUserIdRef.current = user._id;
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
      }
    }
  }, [profileData, profileForm, updateProfileMutation]);

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
