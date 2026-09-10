import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { getSession, signOut } from "next-auth/react";
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

// Response interceptor to handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Do not retry refresh-token endpoint itself on 401 to prevent loop
    if (originalRequest?.url?.includes("/auth/refresh-token")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      const session = await getSession();

      if (session?.error === "RefreshAccessTokenError") {
        signOut({ callbackUrl: "/auth/login" });
        return Promise.reject(error);
      }

      if (session?.accessToken) {
        originalRequest.headers.Authorization = `Bearer ${session.accessToken}`;
        return axiosInstance(originalRequest);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
