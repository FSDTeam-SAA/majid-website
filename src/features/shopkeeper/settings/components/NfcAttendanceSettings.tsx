"use client";

import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  QrCode,
  Copy,
  Check,
  RefreshCw,
  Download,
  ExternalLink,
  Store,
  UserCheck,
  ShieldAlert,
  Loader2,
  Sparkles,
} from "lucide-react";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useShop } from "@/features/shopkeeper/shop/store/shop.store";
import {
  getNfcSettingsApi,
  updateNfcSettingsApi,
  INfcSettingsResponse,
} from "../api/nfc.api";

export const NfcAttendanceSettings: React.FC = () => {
  const { shops, activeShop, activeShopId, setActiveShop } = useShop();
  const queryClient = useQueryClient();

  const shopIdToUse = activeShopId || shops[0]?._id || "demo-shop-romford";
  const [copied, setCopied] = useState(false);
  const [showRotateDialog, setShowRotateDialog] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const { data: nfcSettings } = useQuery<INfcSettingsResponse>({
    queryKey: ["nfc-settings", shopIdToUse],
    queryFn: () => getNfcSettingsApi(shopIdToUse),
    enabled: Boolean(shopIdToUse),
  });

  // Area Manager Form Overrides State
  const [managerFormOverride, setManagerFormOverride] = useState<
    Partial<{
      name: string;
      email: string;
      phone: string;
      title: string;
    }>
  >({});

  // Store Support Form Overrides State
  const [supportFormOverride, setSupportFormOverride] = useState<
    Partial<{
      phone: string;
      email: string;
      address: string;
    }>
  >({});

  const managerForm = {
    name:
      managerFormOverride.name ??
      (nfcSettings?.areaManager?.name || "Sarah Ahmed"),
    email:
      managerFormOverride.email ??
      (nfcSettings?.areaManager?.email || "sarah.ahmed@imoscan.co.uk"),
    phone:
      managerFormOverride.phone ??
      (nfcSettings?.areaManager?.phone || "+44 7700 900123"),
    title:
      managerFormOverride.title ??
      (nfcSettings?.areaManager?.title || "Senior Area Manager (London East)"),
  };

  const supportForm = {
    phone:
      supportFormOverride.phone ??
      (nfcSettings?.storeSupport?.phone || "+44 20 7946 0991"),
    email:
      supportFormOverride.email ??
      (nfcSettings?.storeSupport?.email || "support@imoscan.co.uk"),
    address:
      supportFormOverride.address ??
      (nfcSettings?.storeSupport?.address ||
        "Unit 4, High Street Retail Park, Romford RM1 1HR"),
  };

  // Update Settings Mutation
  const updateMutation = useMutation({
    mutationFn: (payload: {
      areaManager?: {
        name: string;
        email: string;
        phone: string;
        title?: string;
      };
      storeSupport?: { phone: string; email: string; address: string };
    }) => updateNfcSettingsApi(shopIdToUse, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["nfc-settings", shopIdToUse],
      });
      toast.success("Store beacon settings saved successfully!");
    },
    onError: () => {
      toast.error("Failed to update store beacon settings");
    },
  });

  // Rotate Token Mutation
  const rotateMutation = useMutation({
    mutationFn: () => getNfcSettingsApi(shopIdToUse, true),
    onSuccess: (data) => {
      queryClient.setQueryData(["nfc-settings", shopIdToUse], data);
      setShowRotateDialog(false);
      toast.success(
        "New NFC store beacon token generated! Previous tag links revoked.",
      );
    },
    onError: () => {
      toast.error("Failed to rotate token");
    },
  });

  const attendanceUrl =
    nfcSettings?.attendanceUrl ||
    `https://attendance.imoscan.co.uk/tap?token=${nfcSettings?.nfcToken || "mkd_nfc_9f8a2c1743e8b09d"}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(attendanceUrl);
    setCopied(true);
    toast.success("Attendance link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = 1000;
      canvas.height = 1000;
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 100, 100, 800, 800);
        const pngUrl = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.download = `imoscan-attendance-qr-${nfcSettings?.storeCode || "MKD-001"}.png`;
        a.href = pngUrl;
        a.click();
      }
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
    toast.success("QR Code downloaded for store counter display");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 font-poppins">
      {/* Header and Store Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#84CC16]/10 text-[#65A30D]">
              <QrCode className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Store NFC Tag & Beacon Setup
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
            Manage your store&apos;s physical NFC attendance link, counter QR
            code, and assigned Area Manager contacts.
          </p>
        </div>

        {shops.length > 0 && (
          <div className="w-56">
            <Select
              value={activeShopId || shops[0]?._id}
              onValueChange={(val) => setActiveShop(val)}
            >
              <SelectTrigger className="rounded-xl border-border bg-surface text-xs font-bold">
                <div className="flex items-center gap-2 truncate">
                  <Store className="w-4 h-4 text-[#84CC16]" />
                  <SelectValue placeholder="Select Store" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {shops.map((s) => (
                  <SelectItem
                    key={s._id}
                    value={s._id}
                    className="text-xs font-semibold"
                  >
                    {s.shopName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Main Card: NFC Beacon & QR Code */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Link & Token controls (7 cols) */}
        <div className="lg:col-span-7 bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#84CC16]" />
              Revocable Physical Beacon Link
            </h2>
            <Badge className="bg-[#84CC16]/15 text-[#65A30D] border-[#84CC16]/30 text-xs font-bold">
              Active Beacon
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground">
            This cryptographic URL is programmed into your store&apos;s physical
            NFC tag (or displayed as a counter QR code). Staff tap their phone
            to open the mobile attendance flow instantly without downloading any
            app.
          </p>

          {/* Token String Display */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Current NFC Token
            </Label>
            <div className="p-3 bg-surface rounded-xl border border-border font-mono text-xs text-foreground select-all break-all">
              {nfcSettings?.nfcToken || "mkd_nfc_9f8a2c1743e8b09d"}
            </div>
          </div>

          {/* Full Attendance URL with Copy */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              Live Attendance Tap URL
            </Label>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={attendanceUrl}
                className="bg-surface font-mono text-xs rounded-xl border-border select-all"
              />
              <Button
                type="button"
                onClick={handleCopyLink}
                className="bg-[#84CC16] hover:bg-[#74b513] text-white rounded-xl text-xs font-bold shrink-0 gap-1.5 px-4"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>

          {/* Test Link and Danger Rotate Button */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border/60">
            <a
              href={attendanceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-muted hover:bg-muted text-xs font-bold text-foreground transition-colors border border-border"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Test mobile flow in browser
            </a>

            <Button
              type="button"
              variant="outline"
              onClick={() => setShowRotateDialog(true)}
              className="rounded-xl text-xs font-bold border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Rotate NFC Token
            </Button>
          </div>
        </div>

        {/* Right Column: High-Res QR Code Preview & Download (5 cols) */}
        <div className="lg:col-span-5 bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col items-center justify-between text-center space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">
              Store Counter QR Stand
            </h3>
            <p className="text-xs text-muted-foreground">
              Backup scan code for phones without physical NFC enabled.
            </p>
          </div>

          {/* QR Code Container */}
          <div
            ref={qrRef}
            className="p-5 bg-white rounded-2xl border-4 border-slate-100 shadow-md inline-block"
          >
            <QRCode
              value={attendanceUrl}
              size={180}
              level="H"
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            />
          </div>

          <div className="space-y-1">
            <p className="text-[11px] font-bold text-foreground">
              Store: {activeShop?.shopName || "Romford Store"}
            </p>
            <p className="text-[10px] text-muted-foreground font-mono">
              Code: {nfcSettings?.storeCode || "MKD-001"}
            </p>
          </div>

          <Button
            type="button"
            onClick={handleDownloadQr}
            className="w-full bg-surface-muted hover:bg-muted border border-border text-foreground rounded-xl text-xs font-bold gap-2 py-2"
          >
            <Download className="w-4 h-4 text-[#84CC16]" />
            Download QR Code for print
          </Button>
        </div>
      </div>

      {/* Two Configuration Sections: Area Manager Contacts & Store Support */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area Manager Contacts Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <UserCheck className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Assigned Area Manager Contacts
              </h3>
              <p className="text-xs text-muted-foreground">
                Automatically connects to staff on the mobile app after entering
                Staff ID.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-foreground">
                Area Manager Full Name
              </Label>
              <Input
                value={managerForm.name}
                onChange={(e) =>
                  setManagerFormOverride((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="e.g. Sarah Ahmed"
                className="bg-surface text-xs rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-foreground">
                  Work Phone (Direct Call)
                </Label>
                <Input
                  value={managerForm.phone}
                  onChange={(e) =>
                    setManagerFormOverride((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  placeholder="+44 7700 900123"
                  className="bg-surface text-xs rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-foreground">
                  Work Email (Direct Email)
                </Label>
                <Input
                  value={managerForm.email}
                  onChange={(e) =>
                    setManagerFormOverride((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="sarah.ahmed@imoscan.co.uk"
                  className="bg-surface text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-foreground">
                Position / Region Title
              </Label>
              <Input
                value={managerForm.title}
                onChange={(e) =>
                  setManagerFormOverride((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                placeholder="Senior Area Manager (London East)"
                className="bg-surface text-xs rounded-xl"
              />
            </div>
          </div>

          <Button
            type="button"
            onClick={() => updateMutation.mutate({ areaManager: managerForm })}
            disabled={updateMutation.isPending}
            className="w-full bg-[#84CC16] hover:bg-[#74b513] text-white rounded-xl text-xs font-bold gap-2"
          >
            {updateMutation.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            Save Area Manager Contacts
          </Button>
        </div>

        {/* Store Support Fallback Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Store className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Store Support Fallback
              </h3>
              <p className="text-xs text-muted-foreground">
                Displayed to visitors before entering Staff ID.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-foreground">
                  Store Support Phone
                </Label>
                <Input
                  value={supportForm.phone}
                  onChange={(e) =>
                    setSupportFormOverride((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  placeholder="+44 20 7946 0991"
                  className="bg-surface text-xs rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-foreground">
                  Store Support Email
                </Label>
                <Input
                  value={supportForm.email}
                  onChange={(e) =>
                    setSupportFormOverride((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="support@imoscan.co.uk"
                  className="bg-surface text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-foreground">
                Physical Store Address
              </Label>
              <Input
                value={supportForm.address}
                onChange={(e) =>
                  setSupportFormOverride((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
                placeholder="Unit 4, High Street Retail Park, Romford RM1 1HR"
                className="bg-surface text-xs rounded-xl"
              />
            </div>
          </div>

          <Button
            type="button"
            onClick={() => updateMutation.mutate({ storeSupport: supportForm })}
            disabled={updateMutation.isPending}
            className="w-full bg-[#84CC16] hover:bg-[#74b513] text-white rounded-xl text-xs font-bold gap-2"
          >
            {updateMutation.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            Save Store Support Contacts
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog for Rotating Token */}
      <Dialog open={showRotateDialog} onOpenChange={setShowRotateDialog}>
        <DialogContent className="max-w-md bg-card border-border rounded-2xl p-6">
          <DialogHeader className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              Rotate NFC Store Token?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Rotating the token creates a brand-new cryptographic URL. Any
              existing physical NFC stickers or printed QR codes with the old
              token will <strong>immediately stop working</strong>.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex items-center justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowRotateDialog(false)}
              className="rounded-xl text-xs font-semibold"
            >
              Keep Existing
            </Button>
            <Button
              type="button"
              onClick={() => rotateMutation.mutate()}
              disabled={rotateMutation.isPending}
              className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold"
            >
              {rotateMutation.isPending ? "Generating..." : "Yes, Rotate Token"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
