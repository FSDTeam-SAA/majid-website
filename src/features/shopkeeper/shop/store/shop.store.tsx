"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  getShopEntitlement,
  type Shop,
  type ShopEntitlement,
} from "../api/shop.api";
import { getActiveShopId, setActiveShopId } from "./shopStorage";

interface ShopContextValue {
  shops: Shop[];
  entitlement: ShopEntitlement | undefined;
  activeShop: Shop | undefined;
  activeShopId: string | null;
  defaultShopId: string | null;
  multiShopEnabled: boolean;
  isLoading: boolean;
  isFetching: boolean;
  setActiveShop: (shopId: string | null) => void;
  refresh: () => void;
}

const ShopContext = createContext<ShopContextValue | undefined>(undefined);

const SHOP_KEYS = {
  entitlement: ["shop", "entitlement"] as const,
};

export function ShopProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const role = session?.user?.role;
  const isEligible =
    status === "authenticated" && (role === "shopkeeper" || role === "staff");

  const [selectedShopId, setSelectedShopId] = useState<string | null>(() =>
    getActiveShopId(),
  );

  const {
    data: entitlement,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: SHOP_KEYS.entitlement,
    queryFn: getShopEntitlement,
    enabled: isEligible,
  });

  const shops = useMemo(() => entitlement?.shops ?? [], [entitlement]);
  const defaultShopId = entitlement?.defaultShopId ?? null;

  const activeShopId = useMemo(() => {
    if (!isEligible) {
      return null;
    }
    if (!shops.length) {
      return null;
    }
    if (selectedShopId && shops.some((shop) => shop._id === selectedShopId)) {
      return selectedShopId;
    }
    return defaultShopId ?? shops[0]?._id ?? null;
  }, [isEligible, shops, selectedShopId, defaultShopId]);

  const activeShop = useMemo(
    () => shops.find((shop) => shop._id === activeShopId),
    [shops, activeShopId],
  );

  const setActiveShop = useCallback((shopId: string | null) => {
    setSelectedShopId(shopId);
    setActiveShopId(shopId);
  }, []);

  const value = useMemo<ShopContextValue>(
    () => ({
      shops,
      entitlement,
      activeShop,
      activeShopId,
      defaultShopId,
      multiShopEnabled: Boolean(entitlement?.multiShopEnabled),
      isLoading,
      isFetching,
      setActiveShop,
      refresh: () => {
        refetch();
      },
    }),
    [
      shops,
      entitlement,
      activeShop,
      activeShopId,
      defaultShopId,
      isLoading,
      isFetching,
      setActiveShop,
      refetch,
    ],
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop(): ShopContextValue {
  const context = useContext(ShopContext);

  if (!context) {
    throw new Error("useShop must be used within a ShopProvider");
  }

  return context;
}
