"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Store, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createShop } from "../api/shop.api";
import { useShop } from "../store/shop.store";

export default function AddShop() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { shops, multiShopEnabled, isLoading } = useShop();

  const [shopName, setShopName] = useState("");
  const [shopAddress, setShopAddress] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requiresUpgrade, setRequiresUpgrade] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shopName.trim() || !shopAddress.trim()) {
      toast.error("Shop name and address are required");
      return;
    }

    setIsSubmitting(true);
    setRequiresUpgrade(false);

    try {
      const result = await createShop({
        shopName: shopName.trim(),
        shopAddress: shopAddress.trim(),
        whatsappNumber: whatsappNumber.trim() || undefined,
      });

      await queryClient.invalidateQueries({ queryKey: ["shop"] });

      if (result.checkout?.url) {
        window.location.href = result.checkout.url;
        return;
      }

      toast.success("Shop created successfully");
      router.push("/shopkeeper/settings/my-shop");
      router.refresh();
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { code?: string; message?: string } };
      };
      const code = err.response?.data?.code;
      const message = err.response?.data?.message;

      if (code === "MULTI_SHOP_REQUIRED") {
        setRequiresUpgrade(true);
      } else {
        toast.error(message || "Failed to create shop");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-4 sm:p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight">My Shops</h1>
        <p className="font-medium text-muted-foreground">
          Manage your shops. Additional shops are activated after payment.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#84CC16]" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {shops.map((shop) => (
              <div
                key={shop._id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#84CC16]/10">
                    <Store size={18} className="text-[#84CC16]" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-bold">{shop.shopName}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {shop.shopAddress || "No address"}
                    </p>
                  </div>
                </div>
                {shop.isActive ? (
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-green-600/10 px-3 py-1 text-[10px] font-bold uppercase text-green-600">
                    <CheckCircle2 size={12} />
                    Active
                  </span>
                ) : (
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-600/10 px-3 py-1 text-[10px] font-bold uppercase text-amber-600">
                    <AlertCircle size={12} />
                    Pending
                  </span>
                )}
              </div>
            ))}
          </div>

          {!multiShopEnabled && shops.length > 0 && (
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-bold">Add another shop</p>
                <p className="text-sm text-muted-foreground">
                  Upgrade to the Multi Shop plan to add more shops.
                </p>
              </div>
              <Link href="/shopkeeper/payment/add-funds">
                <Button className="rounded-full bg-[#84CC16] text-white hover:bg-[#76b813]">
                  View Multi Shop Plan
                </Button>
              </Link>
            </div>
          )}

          {multiShopEnabled && (
            <form
              onSubmit={handleSubmit}
              className="space-y-5 rounded-2xl border border-border bg-card p-5 sm:p-6"
            >
              <div className="space-y-1">
                <h2 className="text-lg font-black">Add a new shop</h2>
                <p className="text-sm text-muted-foreground">
                  You will be redirected to payment to activate the new shop.
                </p>
              </div>

              {requiresUpgrade && (
                <div className="flex flex-col gap-3 rounded-xl border border-amber-600/40 bg-amber-600/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                    The Multi Shop plan is required to add another shop.
                  </p>
                  <Link
                    href="/shopkeeper/payment/add-funds"
                    className="text-sm font-bold text-[#84CC16] underline underline-offset-4"
                  >
                    View Multi Shop Plan
                  </Link>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="shopName">Shop name *</Label>
                  <Input
                    id="shopName"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="e.g. Downtown Store"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shopAddress">Shop address *</Label>
                  <Input
                    id="shopAddress"
                    value={shopAddress}
                    onChange={(e) => setShopAddress(e.target.value)}
                    placeholder="e.g. 123 Main St"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsappNumber">WhatsApp number</Label>
                  <Input
                    id="whatsappNumber"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-[#84CC16] px-6 text-white hover:bg-[#76b813]"
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {isSubmitting ? "Creating..." : "Create & Pay for Shop"}
              </Button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
