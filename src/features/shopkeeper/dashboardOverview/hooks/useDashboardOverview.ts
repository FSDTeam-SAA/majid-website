"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCashManagementByShopkeeper,
  getShopkeeperDashboardStats,
  saveCashManagement,
} from "../api/dashboard.api";
import type {
  CashManagementInput,
  DashboardFilter,
} from "../types/dashboard.types";

export const DASHBOARD_OVERVIEW_KEYS = {
  stats: (
    shopkeeperId: string,
    filter: DashboardFilter,
    shopId?: string | null,
  ) =>
    [
      "dashboard-overview",
      "stats",
      shopkeeperId,
      shopId || "all",
      filter,
    ] as const,
  cashManagement: (shopkeeperId: string) =>
    ["dashboard-overview", "cash-management", shopkeeperId] as const,
};

export function useDashboardOverview(
  shopkeeperId: string | undefined,
  filter: DashboardFilter,
  shopId?: string | null,
) {
  const queryClient = useQueryClient();

  const statsQuery = useQuery({
    queryKey: DASHBOARD_OVERVIEW_KEYS.stats(shopkeeperId || "", filter, shopId),
    queryFn: () =>
      getShopkeeperDashboardStats(shopkeeperId || "", filter, shopId),
    enabled: Boolean(shopkeeperId),
  });

  const cashManagementQuery = useQuery({
    queryKey: DASHBOARD_OVERVIEW_KEYS.cashManagement(shopkeeperId || ""),
    queryFn: () => getCashManagementByShopkeeper(shopkeeperId || ""),
    enabled: Boolean(shopkeeperId),
  });

  const cashManagementMutation = useMutation({
    mutationFn: (payload: CashManagementInput) => saveCashManagement(payload),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: DASHBOARD_OVERVIEW_KEYS.cashManagement(
          variables.shopkeeperId,
        ),
      });
    },
  });

  return {
    stats: statsQuery.data,
    cashManagement: cashManagementQuery.data,
    isLoading: statsQuery.isLoading || cashManagementQuery.isLoading,
    isFetching: statsQuery.isFetching || cashManagementQuery.isFetching,
    error: statsQuery.error || cashManagementQuery.error,
    refetch: () => {
      statsQuery.refetch();
      cashManagementQuery.refetch();
    },
    saveCashManagement: cashManagementMutation.mutateAsync,
    isSavingCashManagement: cashManagementMutation.isPending,
  };
}
