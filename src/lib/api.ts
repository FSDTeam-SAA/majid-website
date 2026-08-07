import axios from "axios";
import { getSession, signOut } from "next-auth/react";
import { getActiveShopId } from "@/features/shopkeeper/shop/store/shopStorage";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Request interceptor to add the access token to headers
api.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
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

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const session = await getSession();

      // If there's an error in the session (refresh failed), log out
      if (session?.error === "RefreshAccessTokenError") {
        signOut({ callbackUrl: "/login" });
        return Promise.reject(error);
      }

      // If we have a new access token, retry the request
      if (session?.accessToken) {
        originalRequest.headers.Authorization = `Bearer ${session.accessToken}`;
        return api(originalRequest);
      }
    }

    return Promise.reject(error);
  },
);
