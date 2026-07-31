"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Pencil,
  Eye,
  EyeOff,
  Camera,
  Loader2,
  Store,
  MessageCircle,
  QrCode,
  Download,
  ScanLine,
  X,
  Copy,
  Check,
  User,
  Globe,
  ArrowUpRight,
  Crown,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import QRCode from "react-qr-code";
import {
  useMyProfile,
  useUpdateProfile,
  useChangePassword,
} from "../hooks/useSettings";
import {
  profileSchema,
  passwordSchema,
  ProfileValues,
  PasswordValues,
} from "../types";
import { detectCurrency } from "../api/settings.api";
import { CURRENCY_LIST, getCurrencySymbol } from "@/lib/currency";
import { shouldAutoDetectCurrency } from "../utils/currencyDetection";
import { normalizeGoogleReviewPageUrl } from "../utils/googleReviewQr";
import { useMyPayments } from "@/features/shopkeeper/payment/hooks/usePayments";
import { useSubscriptions } from "@/features/shopkeeper/payment/hooks/useSubscriptions";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";

function generateShopkeeperId(id: string, name: string): string {
  const prefix = "IMS";

  const words = name.trim().split(/\s+/);

  const namePart =
    words.length > 1
      ? `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
      : words[0].slice(0, 3).toUpperCase();

  const idSuffix = id.slice(-5).toUpperCase();

  return `${prefix}-${namePart}-${idSuffix}`;
}

interface ScannedProfile {
  shopkeeperId: string;
  name: string;
  email: string;
  phone: string;
  shopName: string;
  shopAddress: string;
  whatsappNumber: string;
}

interface SettingsProps {
  showSubscriptionSummary?: boolean;
  showShopkeeperIdCard?: boolean;
}

// ── QR Scanner Modal ─────────────────────────────────────────
function QRScannerModal({ onClose }: { onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const [scanned, setScanned] = useState<ScannedProfile | null>(null);
  const [error, setError] = useState<string>("");
  const [scanning, setScanning] = useState(true);

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          tick();
        }
      } catch {
        setError("Camera access denied. Please allow camera permissions.");
        setScanning(false);
      }
    })();

    function tick() {
      if (!videoRef.current || !canvasRef.current) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          // Use BarcodeDetector if available
          if ("BarcodeDetector" in window) {
            // @ts-expect-error BarcodeDetector is not in TS lib yet
            const detector = new window.BarcodeDetector({
              formats: ["qr_code"],
            });
            detector
              .detect(canvas)
              .then((codes: Array<{ rawValue: string }>) => {
                if (codes.length > 0) {
                  try {
                    const parsed: ScannedProfile = JSON.parse(
                      codes[0].rawValue,
                    );
                    setScanned(parsed);
                    setScanning(false);
                    stopCamera();
                    return;
                  } catch {
                    /* not our format, keep scanning */
                  }
                }
                rafRef.current = requestAnimationFrame(tick);
              })
              .catch(() => {
                rafRef.current = requestAnimationFrame(tick);
              });
          } else {
            // Fallback: keep ticking, show manual message
            rafRef.current = requestAnimationFrame(tick);
          }
        }
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    return () => {
      active = false;
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-2xl border border-slate-100 dark:border-slate-800 z-10 overflow-hidden"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-violet-50 dark:bg-violet-950/20 rounded-2xl">
            <ScanLine className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h3 className="font-black text-slate-800 dark:text-white text-base">
              Scan Shopkeeper ID
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Point camera at a Shopkeeper QR card
            </p>
          </div>
        </div>

        {!scanned ? (
          <div className="space-y-4">
            {/* Camera viewfinder */}
            <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-slate-950 flex items-center justify-center">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                muted
                playsInline
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Scanning overlay corners */}
              {scanning && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-8 border-2 border-transparent">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-violet-500 rounded-tl-xl" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-violet-500 rounded-tr-xl" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-violet-500 rounded-bl-xl" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-violet-500 rounded-br-xl" />
                  </div>
                  {/* Animated scan line */}
                  <motion.div
                    className="absolute left-10 right-10 h-0.5 bg-violet-500/70 rounded-full shadow-[0_0_8px_2px_rgba(124,58,237,0.5)]"
                    animate={{ top: ["20%", "80%", "20%"] }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </div>
              )}

              {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 p-6 text-center">
                  <X className="w-10 h-10 text-red-400 mb-3" />
                  <p className="text-white font-semibold text-sm">{error}</p>
                </div>
              )}
            </div>

            <p className="text-center text-xs text-slate-400 font-medium">
              {scanning
                ? "Scanning… hold the QR code steady"
                : error || "Ready"}
            </p>
          </div>
        ) : (
          /* Scanned result card — human-readable */
          <div className="space-y-4">
            {/* Header strip */}
            <div className="bg-[#84CC16] rounded-2xl px-5 py-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center text-white font-black text-xl">
                {scanned.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-black text-white text-base leading-tight">
                  {scanned.name}
                </p>
                <p className="text-[11px] font-bold text-white/70 tracking-widest uppercase font-mono">
                  {scanned.shopkeeperId}
                </p>
              </div>
            </div>

            {/* Info rows */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl divide-y divide-slate-100 dark:divide-slate-700/50 overflow-hidden border border-slate-100 dark:border-slate-700/50">
              {[
                { icon: Mail, title: "Email", value: scanned.email },
                { icon: Phone, title: "Phone", value: scanned.phone },
                { icon: Store, title: "Shop Name", value: scanned.shopName },
                {
                  icon: MapPin,
                  title: "Shop Address",
                  value: scanned.shopAddress,
                },
                {
                  icon: MessageCircle,
                  title: "WhatsApp",
                  value: scanned.whatsappNumber,
                },
              ]
                .filter((r) => r.value)
                .map(({ icon: Icon, title, value }) => (
                  <div key={title} className="flex items-start gap-3 px-4 py-3">
                    <div className="p-1.5 bg-[#84CC16]/10 rounded-lg flex-shrink-0 mt-0.5">
                      <Icon className="w-3.5 h-3.5 text-[#84CC16]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                        {title}
                      </p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 break-words">
                        {value}
                      </p>
                    </div>
                  </div>
                ))}
            </div>

            <button
              onClick={() => {
                setScanned(null);
                setScanning(true);
                setError("");
              }}
              className="w-full py-3 border-2 border-[#84CC16]/40 text-[#84CC16] font-black text-sm rounded-2xl hover:bg-[#84CC16]/5 transition cursor-pointer"
            >
              Scan Another
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function Settings({
  showSubscriptionSummary = false,
  showShopkeeperIdCard = true,
}: SettingsProps) {
  const { data: profileData, isLoading } = useMyProfile();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();

  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [copied, setCopied] = useState(false);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [manualCurrency, setManualCurrency] = useState<string | null>(null);
  const [detectedCurrency, setDetectedCurrency] = useState<string | null>(null);
  const [isDetectingCurrency, setIsDetectingCurrency] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const detectedCurrencyUserIdRef = useRef<string | null>(null);
  const { data: paymentsData } = useMyPayments();
  const { data: subscriptionsData } = useSubscriptions();

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
  const shopAddress = useWatch({
    control: profileForm.control,
    name: "shopAddress",
  });

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
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

  const onPasswordSubmit = async (values: PasswordValues) => {
    await changePasswordMutation.mutateAsync({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
    passwordForm.reset();
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

  const fullName = user
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
    : "";
  const shopkeeperId = user?._id
    ? generateShopkeeperId(user._id, fullName || "SK")
    : "SKP-???-????";

  const qrPayload = JSON.stringify({
    shopkeeperId,
    name: fullName,
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    shopName: user?.shopName ?? "",
    shopAddress: user?.shopAddress ?? "",
    whatsappNumber: user?.whatsappNumber ?? "",
  });

  const handleCopyId = () => {
    navigator.clipboard.writeText(shopkeeperId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadQR = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${shopkeeperId}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 md:p-10 bg-background mx-auto space-y-8 font-poppins">
      {showShopkeeperIdCard && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-[#84CC16] via-[#6aab0a] to-[#4d8a06] rounded-[32px] p-8 shadow-xl shadow-lime-500/25"
        >
          {/* decorative circles */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center gap-8">
            {/* Left: text info */}
            <div className="flex-1 space-y-5">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-lime-100" />
                <span className="text-lime-100 font-semibold text-sm uppercase tracking-widest">
                  Shopkeeper ID Card
                </span>
              </div>

              {/* Name */}
              <div>
                <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">
                  Name
                </p>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  {fullName || "—"}
                </h2>
              </div>

              {/* Unique ID with copy */}
              <div className="bg-black/15 backdrop-blur-sm rounded-2xl px-5 py-3.5 flex items-center justify-between gap-4 border border-white/15">
                <div>
                  <p className="text-lime-100 text-[10px] font-semibold uppercase tracking-widest mb-0.5">
                    Shopkeeper ID
                  </p>
                  <p className="text-white font-black text-lg tracking-wider font-mono">
                    {shopkeeperId}
                  </p>
                </div>
                <button
                  onClick={handleCopyId}
                  className="p-2 hover:bg-white/10 rounded-xl transition cursor-pointer flex-shrink-0"
                  title="Copy ID"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <Copy className="w-5 h-5 text-lime-100" />
                  )}
                </button>
              </div>

              {/* Info rows */}
              <div className="space-y-2">
                {[
                  { icon: Mail, label: "Email", value: user?.email },
                  { icon: Phone, label: "Phone", value: user?.phone },
                  { icon: Store, label: "Shop Name", value: user?.shopName },
                  { icon: MapPin, label: "Address", value: user?.shopAddress },
                ]
                  .filter((r) => r.value)
                  .map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-2.5">
                      <Icon className="w-3.5 h-3.5 text-lime-100 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="text-white/55 text-[10px] font-semibold uppercase tracking-widest">
                          {label}:{" "}
                        </span>
                        <span className="text-white text-xs font-bold break-words">
                          {value}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 pt-1">
                {/* <button
                onClick={() => setShowScanner(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#4d8a06] font-black text-sm rounded-2xl hover:bg-lime-50 transition shadow-lg cursor-pointer"
              >
                <ScanLine className="w-4 h-4" /> Scan ID Card
              </button> */}
                <button
                  onClick={handleDownloadQR}
                  className="flex items-center gap-2 px-5 py-2.5 bg-black/15 border border-white/20 text-white font-black text-sm rounded-2xl hover:bg-black/25 transition cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download QR
                </button>
              </div>
            </div>

            {/* Right: QR Code */}
            <div
              ref={qrRef}
              className="flex-shrink-0 bg-white p-4 rounded-3xl shadow-xl"
            >
              <QRCode
                value={qrPayload}
                size={170}
                fgColor="#4d8a06"
                level="M"
              />
              <p className="text-center text-[#4d8a06] font-black text-[10px] mt-2 tracking-widest uppercase">
                {shopkeeperId}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* QR Scanner Modal */}
      <AnimatePresence>
        {showScanner && (
          <QRScannerModal onClose={() => setShowScanner(false)} />
        )}
      </AnimatePresence>

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-[32px] p-8 border border-border shadow-sm flex items-center gap-6"
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

      {showSubscriptionSummary ? (
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
                    .filter(
                      (feature: { included?: boolean }) => feature.included,
                    )
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
                href="/customer/pricing-plan"
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
                href="/customer/pricing-plan"
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
      ) : null}

      {/* Personal Information Section */}
      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-[32px] border border-border shadow-sm overflow-hidden"
        >
          <div className="p-8 flex justify-between items-center border-b border-border/50">
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
                <AddressAutocomplete
                  type="text"
                  disabled={!isEditing}
                  {...profileForm.register("shopAddress")}
                  value={shopAddress || ""}
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

      {/* Change Password Section */}
      <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-[32px] border border-border shadow-sm overflow-hidden"
        >
          <div className="p-8 border-b border-border/50">
            <h2 className="text-xl font-black text-foreground tracking-tight">
              Change password
            </h2>
          </div>

          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Current Password */}
              <div className="space-y-2">
                <label className="text-[13px] font-black text-foreground ml-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? "text" : "password"}
                    {...passwordForm.register("currentPassword")}
                    className="w-full px-6 py-4 bg-background border border-border rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm font-semibold text-muted-foreground"
                    placeholder="..............."
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                  >
                    {showCurrentPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordForm.formState.errors.currentPassword && (
                  <span className="text-xs text-destructive font-bold ml-1">
                    {passwordForm.formState.errors.currentPassword.message}
                  </span>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <label className="text-[13px] font-black text-foreground ml-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? "text" : "password"}
                    {...passwordForm.register("newPassword")}
                    className="w-full px-6 py-4 bg-background border border-border rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm font-semibold text-muted-foreground"
                    placeholder="..............."
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0F172A] transition"
                  >
                    Save Changes
                    {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordForm.formState.errors.newPassword && (
                  <span className="text-xs text-destructive font-bold ml-1">
                    {passwordForm.formState.errors.newPassword.message}
                  </span>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-[13px] font-black text-foreground ml-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    {...passwordForm.register("confirmPassword")}
                    className="w-full px-6 py-4 bg-background border border-border rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-sm font-semibold text-muted-foreground"
                    placeholder="..............."
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0F172A] transition"
                  >
                    {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordForm.formState.errors.confirmPassword && (
                  <span className="text-xs text-destructive font-bold ml-1">
                    {passwordForm.formState.errors.confirmPassword.message}
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="px-10 py-4 bg-primary text-primary-foreground font-black text-[15px] rounded-2xl hover:opacity-90 transition shadow-lg shadow-primary/20 active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {changePasswordMutation.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Save Changes
              </button>
            </div>
          </div>
        </motion.div>
      </form>
    </div>
  );
}
