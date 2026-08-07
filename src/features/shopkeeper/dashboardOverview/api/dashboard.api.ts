import { api } from "@/lib/api";
import type {
  CashManagementInput,
  CashManagementResponse,
  DashboardFilter,
  DashboardStatsResponse,
} from "../types/dashboard.types";

export const getShopkeeperDashboardStats = async (
  shopkeeperId: string,
  filter: DashboardFilter,
  shopId?: string | null,
): Promise<DashboardStatsResponse> => {
  const response = await api.get("/dashboard/stats", {
    params: {
      filter,
      shopkeeperId,
      ...(shopId ? { shopId } : {}),
    },
  });

  return response.data.data;
};

export const getCashManagementByShopkeeper = async (
  shopkeeperId: string,
): Promise<CashManagementResponse | null> => {
  try {
    const response = await api.get(
      `/cash-management/shopkeeper/${shopkeeperId}`,
    );
    return response.data.data;
  } catch (error: unknown) {
    const status = (error as { response?: { status?: number } }).response
      ?.status;

    if (status === 404) {
      return null;
    }

    throw error;
  }
};

export const saveCashManagement = async (
  payload: CashManagementInput,
): Promise<CashManagementResponse> => {
  const response = await api.post("/cash-management", payload);
  return response.data.data;
};
