import { api } from "@/lib/api";

export interface Shop {
  _id: string;
  shopkeeperId: string;
  shopName: string;
  shopAddress?: string;
  whatsappNumber?: string;
  googleReviewPageUrl?: string;
  image?: { public_id?: string; url?: string } | null;
  currency?: string;
  isDefault?: boolean;
  isActive?: boolean;
  taxEnabled?: boolean;
  taxName?: string;
  taxPercentage?: number;
  taxIncludedInPrice?: boolean;
  activatedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShopEntitlement {
  multiShopEnabled: boolean;
  defaultShopId: string | null;
  activeShopId: string | null;
  shops: Shop[];
}

export const getMyShops = async (): Promise<Shop[]> => {
  const response = await api.get("/shop/my-shops");
  return response.data.data;
};

export const getShopEntitlement = async (): Promise<ShopEntitlement> => {
  const response = await api.get("/shop/entitlement");
  return response.data.data;
};

export interface ShopStats {
  totalSales: number;
  cashSales: number;
  cardSales: number;
  customersCount: number;
}

export interface ShopPerformanceItem extends Shop {
  stats: ShopStats;
  staff: {
    _id: string;
    firstName: string;
    lastName?: string;
    image?: { url?: string };
    workingDays?: string[];
  }[];
  staffWorkingToday?: {
    _id: string;
    firstName: string;
    lastName?: string;
    image?: { url?: string };
    workingDays?: string[];
  }[];
}

export interface ShopPerformanceData {
  shops: ShopPerformanceItem[];
  aggregate: {
    activeShopsCount: number;
    totalSales: number;
    totalCustomers: number;
    totalStaff: number;
  };
}

export const getShopPerformance = async (
  dateFilter: string = "today",
): Promise<ShopPerformanceData> => {
  const response = await api.get(`/shop/performance?dateFilter=${dateFilter}`);
  return response.data.data;
};

export const createShop = async (payload: {
  shopName: string;
  shopAddress: string;
  whatsappNumber?: string;
  googleReviewPageUrl?: string;
  currency?: string;
}): Promise<{ shop: Shop; checkout: { url?: string } }> => {
  const response = await api.post("/shop/create", payload);
  return response.data.data;
};

export const updateShop = async (
  shopId: string,
  payload: Partial<Shop>,
): Promise<Shop> => {
  const response = await api.put(`/shop/${shopId}`, payload);
  return response.data.data;
};

export const deleteShop = async (shopId: string): Promise<{ _id: string }> => {
  const response = await api.delete(`/shop/${shopId}`);
  return response.data.data;
};

export const getUploadedImages = async (): Promise<
  { url: string; public_id: string }[]
> => {
  const response = await api.get("/shop/images");
  return response.data.data;
};
