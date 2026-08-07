const STORAGE_KEY = "imo-scan-active-shop-id";

export const getActiveShopId = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

export const setActiveShopId = (shopId: string | null): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (shopId) {
      window.localStorage.setItem(STORAGE_KEY, shopId);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore storage errors (private mode, quota, etc.)
  }
};
