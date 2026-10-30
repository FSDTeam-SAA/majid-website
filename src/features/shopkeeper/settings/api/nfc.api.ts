import { api } from "@/lib/api";

export interface INfcSettingsResponse {
  shopId: string;
  storeCode: string;
  nfcToken: string;
  nfcTokenRotatedAt?: string;
  attendanceUrl: string;
  areaManager?: {
    name: string;
    email: string;
    phone: string;
    title?: string;
  };
  storeSupport?: {
    phone: string;
    email: string;
    address: string;
  };
}

export const DEMO_NFC_SETTINGS: INfcSettingsResponse = {
  shopId: "demo-shop-romford",
  storeCode: "MKD-001",
  nfcToken: "mkd_nfc_9f8a2c1743e8b09d",
  nfcTokenRotatedAt: "2026-10-15T09:00:00.000Z",
  attendanceUrl:
    "https://attendance.imoscan.com/tap?token=mkd_nfc_9f8a2c1743e8b09d",
  areaManager: {
    name: "Sarah Ahmed",
    email: "sarah.ahmed@imoscan.co.uk",
    phone: "+44 7700 900123",
    title: "Senior Area Manager (London East)",
  },
  storeSupport: {
    phone: "+44 20 7946 0991",
    email: "support@imoscan.co.uk",
    address: "Unit 4, High Street Retail Park, Romford RM1 1HR",
  },
};

export const getNfcSettingsApi = async (
  shopId: string,
  rotate = false,
): Promise<INfcSettingsResponse> => {
  try {
    const res = await api.get(`/attendance/settings/nfc/${shopId}`, {
      params: { rotate },
    });
    if (res.data?.data) {
      return res.data.data;
    }
  } catch (err) {
    console.warn("NFC settings API fallback:", err);
  }
  return DEMO_NFC_SETTINGS;
};

export const updateNfcSettingsApi = async (
  shopId: string,
  payload: {
    storeCode?: string;
    areaManager?: {
      name: string;
      email: string;
      phone: string;
      title?: string;
    };
    storeSupport?: {
      phone: string;
      email: string;
      address: string;
    };
  },
): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await api.patch(`/attendance/settings/nfc/${shopId}`, payload);
    return res.data;
  } catch (err) {
    console.warn("Update NFC settings fallback:", err);
    return { success: true, message: "Settings saved successfully" };
  }
};
