import { IMEIResult } from "@/features/shopkeeper/scanDevice/types/scanDevice.types";

export interface ShopData {
  _id?: string;
  shopName?: string;
  shopAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  shopPhone?: string;
  shopEmail?: string;
  shopLogo?: {
    url?: string;
  };
}

export interface UserData {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

export interface PublicDeviceReportData extends Omit<IMEIResult, "userId"> {
  shopId?: ShopData | string | null;
  userId?: UserData | string | null;
  providerDataRaw?: string | null;
  parsedProviderData?: Record<string, unknown> | null;
}
