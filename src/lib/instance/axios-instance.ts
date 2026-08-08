import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { getSession } from "next-auth/react";
import { getActiveShopId } from "@/features/shopkeeper/shop/store/shopStorage";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // 1) If verify-otp gives custom token → use that instead
      if (config.headers?._customToken) {
        config.headers.Authorization = `Bearer ${config.headers._customToken}`;
        delete config.headers._customToken;
      } else {
        // 2) Otherwise use NextAuth session token
        const session = await getSession();
        if (session && "accessToken" in session && config.headers) {
          config.headers.Authorization = `Bearer ${session.accessToken}`;
        }
      }

      const activeShopId = getActiveShopId();
      if (activeShopId) {
        const method = (config.method || "get").toLowerCase();
        if (method === "get" || method === "delete") {
          config.params = {
            ...(config.params as Record<string, unknown> | undefined),
            shopId: activeShopId,
          };
        } else if (
          typeof FormData !== "undefined" &&
          config.data instanceof FormData
        ) {
          config.data.append("shopId", activeShopId);
        } else if (config.data && typeof config.data === "object") {
          config.data = { ...config.data, shopId: activeShopId };
        } else {
          config.data = { shopId: activeShopId };
        }
      }
    } catch (error) {
      console.error("Failed to get session or active shop:", error);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default axiosInstance;
