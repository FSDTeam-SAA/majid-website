"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCashDrawerMetrics } from "../api/dashboard.api";
import { useDashboardOverview } from "./useDashboardOverview";
import type {
  CashExpenseItem,
  PeriodCashMetrics,
} from "../types/dashboard.types";
import { toast } from "sonner";

export type { CashExpenseItem, PeriodCashMetrics };

const defaultMetrics: PeriodCashMetrics = {
  cashSales: 0,
  cashExpenses: 0,
  netCash: 0,
  invoiceCount: 0,
  expenseCount: 0,
};

export function useCashDrawerMetrics(
  shopkeeperId?: string,
  activeShopId?: string | null,
) {
  const queryClient = useQueryClient();

  const {
    cashManagement,
    saveCashManagement,
    isSavingCashManagement,
    refetch: refetchCashManagement,
  } = useDashboardOverview(shopkeeperId, "monthly", activeShopId || undefined);

  // Fast backend aggregation for all drawer & sales periods
  const {
    data: drawerData,
    isLoading: isDrawerLoading,
    refetch: refetchDrawerMetrics,
  } = useQuery({
    queryKey: ["cash-drawer-metrics", shopkeeperId, activeShopId || "all"],
    queryFn: () => getCashDrawerMetrics(shopkeeperId || "", activeShopId),
    enabled: Boolean(shopkeeperId),
    staleTime: 1000 * 30, // 30 seconds
  });

  const startingDayCash = Number(
    drawerData?.startingDayCash ?? cashManagement?.startingDayCash ?? 0,
  );
  const banked = Number(drawerData?.banked ?? cashManagement?.banked ?? 0);
  const cashScore = Number(
    drawerData?.cashScore ?? cashManagement?.cashManagementScore ?? 100,
  );
  const aiInsight = drawerData?.aiInsight || cashManagement?.aiInsight || "";

  const todayMetrics = drawerData?.todayMetrics || defaultMetrics;
  const yesterdayMetrics = drawerData?.yesterdayMetrics || defaultMetrics;
  const lastWeekMetrics = drawerData?.lastWeekMetrics || defaultMetrics;
  const lastMonthMetrics = drawerData?.lastMonthMetrics || defaultMetrics;
  const allTimeMetrics = drawerData?.allTimeMetrics || defaultMetrics;
  const cashExpensesList = drawerData?.cashExpensesList || [];

  const previousSalesTotal = Number(
    drawerData?.previousSalesTotal ??
      Math.max(0, allTimeMetrics.cashSales + startingDayCash - banked),
  );

  const availableCashToday = Number(
    drawerData?.availableCashToday ?? previousSalesTotal,
  );

  // Invalidate queries after mutation
  const invalidateAll = async () => {
    await Promise.all([
      refetchCashManagement(),
      refetchDrawerMetrics(),
      queryClient.invalidateQueries({ queryKey: ["cash-drawer-metrics"] }),
    ]);
  };

  // Bank cash to owner
  const handleBankCash = async (amount: number) => {
    if (!shopkeeperId) {
      toast.error("Session not found");
      return false;
    }
    if (isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid amount to bank");
      return false;
    }
    if (amount > availableCashToday) {
      toast.warning(
        `Amount (${amount}) is greater than available cash in drawer (${availableCashToday.toFixed(2)})`,
      );
    }

    try {
      const newBanked = banked + amount;
      const newDrawer = Math.max(0, availableCashToday - amount);

      await saveCashManagement({
        shopkeeperId,
        startingDayCash,
        banked: newBanked,
        cashInDrawer: newDrawer,
      });

      toast.success(
        `Successfully banked cash to owner. Available drawer cash updated.`,
      );
      await invalidateAll();
      return true;
    } catch (err: unknown) {
      const errorObj = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      toast.error(
        errorObj.response?.data?.message ||
          errorObj.message ||
          "Failed to bank cash",
      );
      return false;
    }
  };

  // Set or update starting day cash
  const handleSetStartingCash = async (amount: number) => {
    if (!shopkeeperId) {
      toast.error("Session not found");
      return false;
    }
    if (isNaN(amount) || amount < 0) {
      toast.error("Enter a valid starting cash amount");
      return false;
    }

    try {
      const newDrawer = Math.max(0, allTimeMetrics.cashSales + amount - banked);

      await saveCashManagement({
        shopkeeperId,
        startingDayCash: amount,
        banked,
        cashInDrawer: newDrawer,
      });

      toast.success("Starting day float updated successfully");
      await invalidateAll();
      return true;
    } catch (err: unknown) {
      const errorObj = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      toast.error(
        errorObj.response?.data?.message ||
          errorObj.message ||
          "Failed to update starting float",
      );
      return false;
    }
  };

  // Add cash incrementally to existing drawer float
  const handleAddCash = async (amount: number) => {
    if (!shopkeeperId) {
      toast.error("Session not found");
      return false;
    }
    if (isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid cash amount to add");
      return false;
    }

    try {
      const newStarting = startingDayCash + amount;
      const newDrawer = Math.max(
        0,
        allTimeMetrics.cashSales + newStarting - banked,
      );

      await saveCashManagement({
        shopkeeperId,
        startingDayCash: newStarting,
        banked,
        cashInDrawer: newDrawer,
      });

      toast.success("Cash added to drawer successfully");
      await invalidateAll();
      return true;
    } catch (err: unknown) {
      const errorObj = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      toast.error(
        errorObj.response?.data?.message ||
          errorObj.message ||
          "Failed to add cash",
      );
      return false;
    }
  };

  // Direct allocation between drawer & bank
  const handleAllocateCash = async (
    targetBanked: number,
    targetDrawer: number,
  ) => {
    if (!shopkeeperId) {
      toast.error("Session not found");
      return false;
    }

    try {
      await saveCashManagement({
        shopkeeperId,
        startingDayCash,
        banked: Math.max(0, targetBanked),
        cashInDrawer: Math.max(0, targetDrawer),
      });

      toast.success("Cash allocation updated successfully");
      await invalidateAll();
      return true;
    } catch (err: unknown) {
      const errorObj = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      toast.error(
        errorObj.response?.data?.message ||
          errorObj.message ||
          "Failed to allocate cash",
      );
      return false;
    }
  };

  return {
    startingDayCash,
    banked,
    cashScore,
    aiInsight,
    availableCashToday,
    previousSalesTotal,
    todayMetrics,
    yesterdayMetrics,
    lastWeekMetrics,
    lastMonthMetrics,
    allTimeMetrics,
    cashExpensesList,
    isLoading: isDrawerLoading,
    isSaving: isSavingCashManagement,
    handleBankCash,
    handleSetStartingCash,
    handleAddCash,
    handleAllocateCash,
    refetch: invalidateAll,
  };
}
