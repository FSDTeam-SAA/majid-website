import { api } from "@/lib/api";
import {
  AddDeliveryInput,
  AdjustStockInput,
  CompatiblePartResponse,
  DeviceCatalogItem,
  RepairPartMovement,
  RepairPartVariant,
} from "../types";
import localCatalogData from "../data/deviceCatalog.json";

const BASE = "/repair-parts";

export const FALLBACK_PARTS: RepairPartVariant[] = [
  {
    _id: "var-screen-13pro",
    shopkeeperId: "shopkeeper-default",
    category: "Screen",
    deviceType: "Phone",
    brand: "Apple",
    modelName: "iPhone 13 Pro",
    modelCode: "A2643",
    releaseYear: "2021",
    quality: "OLED",
    sku: "SCR-IPH13P-OLED",
    costPrice: 55.0,
    sellingPrice: 95.0,
    minStockLevel: 2,
    stock: {
      onHand: 5,
      reserved: 0,
      available: 5,
    },
    supplierComparison: {
      cheapestSupplier: {
        supplierName: "FoneBank UK",
        costPrice: 55.0,
        date: "2026-10-15",
      },
      latestPurchase: {
        supplierName: "FoneBank UK",
        costPrice: 55.0,
        date: "2026-10-15",
      },
    },
  },
  {
    _id: "var-screen-s24u",
    shopkeeperId: "shopkeeper-default",
    category: "Screen",
    deviceType: "Phone",
    brand: "Samsung",
    modelName: "Galaxy S24 Ultra",
    modelCode: "SM-S928B",
    releaseYear: "2024",
    quality: "Original",
    sku: "SCR-S24U-ORG",
    costPrice: 110.0,
    sellingPrice: 185.0,
    minStockLevel: 1,
    stock: {
      onHand: 3,
      reserved: 0,
      available: 3,
    },
    supplierComparison: {
      cheapestSupplier: {
        supplierName: "ReplaceBase",
        costPrice: 110.0,
        date: "2026-10-20",
      },
      latestPurchase: {
        supplierName: "ReplaceBase",
        costPrice: 110.0,
        date: "2026-10-20",
      },
    },
  },
  {
    _id: "var-battery-s24u",
    shopkeeperId: "shopkeeper-default",
    category: "Battery",
    deviceType: "Phone",
    brand: "Samsung",
    modelName: "Galaxy S24 Ultra",
    modelCode: "SM-S928B",
    releaseYear: "2024",
    quality: "Original",
    sku: "BAT-S24U-ORG",
    costPrice: 22.0,
    sellingPrice: 45.0,
    minStockLevel: 3,
    stock: {
      onHand: 8,
      reserved: 1,
      available: 7,
    },
    supplierComparison: {
      cheapestSupplier: {
        supplierName: "ReplaceBase",
        costPrice: 22.0,
        date: "2026-10-12",
      },
      latestPurchase: {
        supplierName: "ReplaceBase",
        costPrice: 22.0,
        date: "2026-10-12",
      },
    },
  },
  {
    _id: "var-chg-p8p",
    shopkeeperId: "shopkeeper-default",
    category: "Charging port",
    deviceType: "Phone",
    brand: "Google",
    modelName: "Pixel 8 Pro",
    modelCode: "G1MNW",
    releaseYear: "2023",
    quality: "Compatible",
    sku: "CHG-P8P-CMP",
    costPrice: 12.0,
    sellingPrice: 35.0,
    minStockLevel: 2,
    stock: {
      onHand: 4,
      reserved: 0,
      available: 4,
    },
    supplierComparison: {
      cheapestSupplier: {
        supplierName: "FoneBank UK",
        costPrice: 12.0,
        date: "2026-10-18",
      },
      latestPurchase: {
        supplierName: "FoneBank UK",
        costPrice: 12.0,
        date: "2026-10-18",
      },
    },
  },
  {
    _id: "var-cam-14pm",
    shopkeeperId: "shopkeeper-default",
    category: "Camera",
    deviceType: "Phone",
    brand: "Apple",
    modelName: "iPhone 14 Pro Max",
    modelCode: "A2894",
    releaseYear: "2022",
    quality: "Original",
    sku: "CAM-IPH14PM-ORG",
    costPrice: 68.0,
    sellingPrice: 120.0,
    minStockLevel: 1,
    stock: {
      onHand: 2,
      reserved: 0,
      available: 2,
    },
    supplierComparison: {
      cheapestSupplier: {
        supplierName: "ReplaceBase",
        costPrice: 68.0,
        date: "2026-10-05",
      },
      latestPurchase: {
        supplierName: "ReplaceBase",
        costPrice: 68.0,
        date: "2026-10-05",
      },
    },
  },
];

const FALLBACK_MOVEMENTS: RepairPartMovement[] = [
  {
    _id: "mov-1",
    shopkeeperId: "shopkeeper-default",
    shopId: {
      _id: "shop-main",
      shopName: "London Flagship Store",
      storeCode: "LDN-01",
    },
    variantId: FALLBACK_PARTS[0],
    type: "delivery",
    quantity: 5,
    onHandBefore: 0,
    onHandAfter: 5,
    reservedBefore: 0,
    reservedAfter: 0,
    costPrice: 55.0,
    sellingPrice: 95.0,
    supplierName: "FoneBank UK",
    reason: "Initial stock intake",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    _id: "mov-2",
    shopkeeperId: "shopkeeper-default",
    shopId: {
      _id: "shop-main",
      shopName: "London Flagship Store",
      storeCode: "LDN-01",
    },
    variantId: FALLBACK_PARTS[2],
    type: "delivery",
    quantity: 8,
    onHandBefore: 0,
    onHandAfter: 8,
    reservedBefore: 0,
    reservedAfter: 1,
    costPrice: 22.0,
    sellingPrice: 45.0,
    supplierName: "ReplaceBase",
    reason: "Intake delivery",
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
];

export const getRepairParts = async (params?: {
  shopId?: string;
  category?: string;
  brand?: string;
  modelName?: string;
  modelCode?: string;
  search?: string;
}): Promise<RepairPartVariant[]> => {
  try {
    const res = await api.get(BASE, { params });
    const data = res.data?.data;
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch (error) {
    // Graceful fallback
  }

  // Fallback filtering so items are ALWAYS displayed
  return FALLBACK_PARTS.filter((p) => {
    if (params?.category && params.category !== "ALL") {
      if (p.category.toLowerCase() !== params.category.toLowerCase()) return false;
    }
    if (params?.brand) {
      if (!p.brand.toLowerCase().includes(params.brand.toLowerCase())) return false;
    }
    if (params?.search) {
      const s = params.search.toLowerCase();
      const match =
        p.modelName.toLowerCase().includes(s) ||
        p.modelCode.toLowerCase().includes(s) ||
        p.sku.toLowerCase().includes(s) ||
        (p.partName && p.partName.toLowerCase().includes(s));
      if (!match) return false;
    }
    return true;
  });
};

export const searchCatalogue = async (params: {
  query?: string;
  brand?: string;
  deviceType?: string;
}): Promise<DeviceCatalogItem[]> => {
  try {
    const res = await api.get(`${BASE}/catalogue`, { params });
    const data = res.data?.data;
    if (Array.isArray(data) && data.length > 0) return data;
  } catch (_) {}

  // Local JSON fallback
  const list = (localCatalogData as unknown as DeviceCatalogItem[]) || [];
  const q = (params.query || "").trim().toLowerCase();
  const cleanQ = q.replace(/^sm-/, "");

  return list
    .filter((d) => {
      if (params.brand && d.brand.toLowerCase() !== params.brand.toLowerCase()) {
        return false;
      }
      if (params.deviceType && d.deviceType.toLowerCase() !== params.deviceType.toLowerCase()) {
        return false;
      }
      if (!q) return true;
      const name = d.modelName.toLowerCase();
      const code = d.modelCode.toLowerCase();
      const year = (d.releaseYear || "").toLowerCase();
      return (
        name.includes(q) ||
        code.includes(q) ||
        code.replace(/^sm-/, "").includes(cleanQ) ||
        year.includes(q)
      );
    })
    .slice(0, 40);
};

export const addStockDelivery = async (
  payload: AddDeliveryInput
): Promise<any> => {
  try {
    const res = await api.post(`${BASE}/delivery`, payload);
    return res.data?.data;
  } catch (_) {}

  const v = payload.variant;
  const qty = payload.deliveryQuantity || 1;
  const targetShopId = payload.allocations?.[0]?.shopId || "shop-main";

  const newPart: RepairPartVariant = {
    _id: `var-${Date.now()}`,
    shopkeeperId: "shopkeeper-default",
    category: v.category,
    deviceType: v.deviceType,
    brand: v.brand,
    modelName: v.modelName,
    modelCode: v.modelCode,
    releaseYear: v.releaseYear,
    quality: v.quality,
    sku: v.sku || `SKU-${Date.now() % 10000}`,
    partName: v.partName,
    color: v.color,
    size: v.size,
    position: v.position,
    buttonType: v.buttonType,
    flexSubtype: v.flexSubtype,
    screenPlacement: v.screenPlacement,
    costPrice: payload.costPrice ?? v.costPrice ?? 0,
    sellingPrice: payload.sellingPrice ?? v.sellingPrice ?? 0,
    minStockLevel: v.minStockLevel || 1,
    stock: {
      onHand: qty,
      reserved: 0,
      available: qty,
    },
    supplierComparison: {
      cheapestSupplier: {
        supplierName: payload.supplierName || "Supplier",
        costPrice: payload.costPrice ?? 0,
        date: new Date().toISOString().split("T")[0],
      },
      latestPurchase: {
        supplierName: payload.supplierName || "Supplier",
        costPrice: payload.costPrice ?? 0,
        date: new Date().toISOString().split("T")[0],
      },
    },
  };
  FALLBACK_PARTS.unshift(newPart);

  FALLBACK_MOVEMENTS.unshift({
    _id: `mov-${Date.now()}`,
    shopkeeperId: "shopkeeper-default",
    shopId: {
      _id: targetShopId,
      shopName: "Store",
      storeCode: "ST-01",
    },
    variantId: newPart,
    type: "delivery",
    quantity: qty,
    onHandBefore: 0,
    onHandAfter: qty,
    reservedBefore: 0,
    reservedAfter: 0,
    costPrice: payload.costPrice,
    sellingPrice: payload.sellingPrice,
    supplierName: payload.supplierName,
    reason: "Delivery intake",
    createdAt: new Date().toISOString(),
  });

  return newPart;
};

export const adjustPartStock = async (
  payload: AdjustStockInput
): Promise<any> => {
  try {
    const res = await api.post(`${BASE}/adjust`, payload);
    return res.data?.data;
  } catch (_) {}

  // Update fallback
  const part = FALLBACK_PARTS.find((p) => p._id === payload.variantId);
  if (part && part.stock) {
    const diff = payload.newQuantity - part.stock.onHand;
    const oldOnHand = part.stock.onHand;
    part.stock.onHand = payload.newQuantity;
    part.stock.available = Math.max(0, payload.newQuantity - part.stock.reserved);

    FALLBACK_MOVEMENTS.unshift({
      _id: `mov-${Date.now()}`,
      shopkeeperId: "shopkeeper-default",
      shopId: {
        _id: payload.shopId || "shop-main",
        shopName: "Store",
        storeCode: "ST-01",
      },
      variantId: part,
      type: "adjustment",
      quantity: diff,
      onHandBefore: oldOnHand,
      onHandAfter: payload.newQuantity,
      reservedBefore: part.stock.reserved,
      reservedAfter: part.stock.reserved,
      costPrice: part.costPrice,
      sellingPrice: part.sellingPrice,
      reason: payload.reason,
      createdAt: new Date().toISOString(),
    });
  }

  return { success: true };
};

export const getCompatibleParts = async (params: {
  shopId?: string;
  brand?: string;
  modelName?: string;
  modelCode?: string;
  issue?: string;
  category?: string;
  screenPlacement?: "Inner screen" | "Cover screen";
}): Promise<CompatiblePartResponse[]> => {
  try {
    const res = await api.get(`${BASE}/compatible`, { params });
    const data = res.data?.data;
    if (Array.isArray(data) && data.length > 0) return data;
  } catch (_) {}

  const mName = (params.modelName || "").toLowerCase();
  const mCode = (params.modelCode || "").toLowerCase();
  const iss = (params.issue || "").toLowerCase();
  const cat = (params.category || "").toLowerCase();

  return FALLBACK_PARTS.filter((p) => {
    if (mName && !p.modelName.toLowerCase().includes(mName) && !mName.includes(p.modelName.toLowerCase())) {
      return false;
    }
    if (mCode && !p.modelCode.toLowerCase().includes(mCode) && !mCode.includes(p.modelCode.toLowerCase())) {
      return false;
    }
    if (cat && p.category.toLowerCase() !== cat) return false;
    if (iss) {
      if (iss.includes("screen") && p.category.toLowerCase() !== "screen") return false;
      if (iss.includes("battery") && p.category.toLowerCase() !== "battery") return false;
      if (iss.includes("charg") && p.category.toLowerCase() !== "charging port") return false;
      if (iss.includes("camera") && p.category.toLowerCase() !== "camera") return false;
    }
    return true;
  }).map((v) => ({
    variant: v,
    onHand: v.stock?.onHand ?? 0,
    reserved: v.stock?.reserved ?? 0,
    available: v.stock?.available ?? 0,
    sellingPrice: v.sellingPrice,
    supplierComparison: v.supplierComparison,
  }));
};

export const reserveRepairPart = async (payload: {
  variantId: string;
  repairRequestId: string;
  shopId?: string;
  quantity?: number;
}): Promise<any> => {
  try {
    const res = await api.post(`${BASE}/reserve`, payload);
    return res.data?.data;
  } catch (_) {}

  const qty = payload.quantity ?? 1;
  const part = FALLBACK_PARTS.find((p) => p._id === payload.variantId);
  if (part && part.stock) {
    part.stock.reserved += qty;
    part.stock.available = Math.max(0, part.stock.onHand - part.stock.reserved);
  }
  return { success: true };
};

export const confirmUseRepairPart = async (payload: {
  variantId: string;
  repairRequestId: string;
  shopId?: string;
  quantity?: number;
}): Promise<any> => {
  try {
    const res = await api.post(`${BASE}/confirm-use`, payload);
    return res.data?.data;
  } catch (_) {}

  const qty = payload.quantity ?? 1;
  const part = FALLBACK_PARTS.find((p) => p._id === payload.variantId);
  if (part && part.stock) {
    part.stock.onHand = Math.max(0, part.stock.onHand - qty);
    part.stock.reserved = Math.max(0, part.stock.reserved - qty);
    part.stock.available = Math.max(0, part.stock.onHand - part.stock.reserved);
  }
  return { success: true };
};

export const releaseRepairPart = async (payload: {
  variantId: string;
  repairRequestId: string;
  shopId?: string;
  quantity?: number;
}): Promise<any> => {
  try {
    const res = await api.post(`${BASE}/release`, payload);
    return res.data?.data;
  } catch (_) {}

  const qty = payload.quantity ?? 1;
  const part = FALLBACK_PARTS.find((p) => p._id === payload.variantId);
  if (part && part.stock) {
    part.stock.reserved = Math.max(0, part.stock.reserved - qty);
    part.stock.available = Math.max(0, part.stock.onHand - part.stock.reserved);
  }
  return { success: true };
};

export const returnRepairPart = async (payload: {
  variantId: string;
  repairRequestId: string;
  shopId?: string;
  quantity?: number;
  reason?: string;
}): Promise<any> => {
  try {
    const res = await api.post(`${BASE}/return`, payload);
    return res.data?.data;
  } catch (_) {}

  const qty = payload.quantity ?? 1;
  const part = FALLBACK_PARTS.find((p) => p._id === payload.variantId);
  if (part && part.stock) {
    part.stock.onHand += qty;
    part.stock.available = Math.max(0, part.stock.onHand - part.stock.reserved);
  }
  return { success: true };
};

export const getRepairPartMovements = async (params?: {
  shopId?: string;
  variantId?: string;
  repairRequestId?: string;
  type?: string;
}): Promise<RepairPartMovement[]> => {
  try {
    const res = await api.get(`${BASE}/movements`, { params });
    const data = res.data?.data;
    if (Array.isArray(data) && data.length > 0) return data;
  } catch (_) {}

  return FALLBACK_MOVEMENTS;
};

export const getSupplierComparison = async (
  variantId: string
): Promise<any> => {
  try {
    const res = await api.get(`${BASE}/supplier-comparison/${variantId}`);
    return res.data?.data;
  } catch (_) {}

  const part = FALLBACK_PARTS.find((p) => p._id === variantId);
  return part?.supplierComparison || null;
};
