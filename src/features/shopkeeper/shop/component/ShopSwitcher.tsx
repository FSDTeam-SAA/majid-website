"use client";

import { Store, ChevronDown, Check, Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useShop } from "../store/shop.store";

export default function ShopSwitcher() {
  const { data: session } = useSession();
  const router = useRouter();
  const {
    shops,
    activeShop,
    activeShopId,
    multiShopEnabled,
    isLoading,
    setActiveShop,
  } = useShop();

  const isStaff = session?.user?.role === "staff";

  if (isLoading) {
    return (
      <div className="flex h-9 items-center gap-2 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-muted-foreground">
        <Loader2 size={14} className="animate-spin" />
        Shops
      </div>
    );
  }

  if (!activeShop && !shops.length) {
    return null;
  }

  const label = isStaff
    ? (shops.find((shop) => shop.isDefault)?.shopName ??
      activeShop?.shopName ??
      "My Shop")
    : (activeShop?.shopName ?? "My Shop");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-9 max-w-[220px] items-center gap-2 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
          aria-label="Switch shop"
        >
          <Store size={14} className="shrink-0 text-[#84CC16]" />
          <span className="min-w-0 flex-1 truncate">{label}</span>
          {!isStaff && (
            <ChevronDown size={14} className="shrink-0 opacity-60" />
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>My Shops</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {shops.map((shop) => (
          <DropdownMenuItem
            key={shop._id}
            disabled={isStaff}
            onSelect={() => {
              if (isStaff) {
                return;
              }
              setActiveShop(shop._id);
              router.refresh();
            }}
            className="flex items-center gap-2"
          >
            <span className="min-w-0 flex-1 truncate">
              {shop.shopName}
              {shop.isDefault && (
                <span className="ml-1 text-[10px] font-bold uppercase text-muted-foreground">
                  Default
                </span>
              )}
              {!shop.isActive && (
                <span className="ml-1 text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400">
                  Pending
                </span>
              )}
            </span>
            {shop._id === activeShopId && (
              <Check size={14} className="shrink-0 text-[#84CC16]" />
            )}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        {multiShopEnabled ? (
          <DropdownMenuItem asChild>
            <Link
              href="/shopkeeper/settings/my-shop"
              className="flex items-center gap-2 text-[#84CC16]"
            >
              <Plus size={14} />
              Add a new shop
            </Link>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem asChild>
            <Link
              href="/shopkeeper/payment/add-funds"
              className="flex items-center gap-2 text-[#84CC16]"
            >
              <Plus size={14} />
              Upgrade to add a new shop
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
