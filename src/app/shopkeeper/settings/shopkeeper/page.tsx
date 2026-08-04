"use client";

import React, { useRef, useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Loader2,
  Store,
  QrCode,
  Download,
  Copy,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";
import QRCode from "react-qr-code";
import { useMyProfile } from "@/features/shopkeeper/settings/hooks/useSettings";

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

export default function ShopkeeperPage() {
  const { data: profileData, isLoading } = useMyProfile();
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const user = profileData?.data;
  const fullName = user
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
    : "";
  const shopkeeperId = user?._id
    ? generateShopkeeperId(user._id, fullName || "SK")
    : "SKP-???-????";

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  const qrPayload =
    user?._id && apiBaseUrl
      ? `${apiBaseUrl}/user/contact-card/${encodeURIComponent(user._id)}`
      : "Contact card unavailable";

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
    <div className="space-y-6">
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
            <QRCode value={qrPayload} size={170} fgColor="#4d8a06" level="M" />
            <p className="text-center text-[#4d8a06] font-black text-[10px] mt-2 tracking-widest uppercase">
              Scan to download contact
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
